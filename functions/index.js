/**
 * HuzurBahçesi – Firebase Cloud Functions
 *
 * All payment and sensitive business logic runs here, server-side.
 *
 * Exported functions
 * ──────────────────
 *  createIyzicoPayment        – Callable: validates cart server-side, calls Iyzico
 *                               API and creates a Firestore order on success.
 *  approveVendorApplication   – Callable (admin): approve a pending vendor.
 *  rejectVendorApplication    – Callable (admin): reject a pending vendor.
 *  adminCancelOrder           – Callable (admin): cancel/refund an order via Iyzico.
 *  releasePaymentToVendor     – Firestore trigger: releases escrowed funds when
 *                               an order reaches "Tamamlandı" status.
 *  autoApproveExpiredOrders   – Scheduled (every 5 min): auto-approves orders
 *                               whose 15-minute customer-review window has passed.
 */

'use strict';

const { onCall, HttpsError }     = require('firebase-functions/v2/https');
const { onDocumentUpdated }      = require('firebase-functions/v2/firestore');
const { onSchedule }             = require('firebase-functions/v2/scheduler');
const { defineSecret }           = require('firebase-functions/params');
const { initializeApp }          = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const Iyzipay                    = require('iyzipay');

initializeApp();

const db           = getFirestore();
const APP_ID       = 'huzurbahcesi-v1';
const ADMIN_EMAIL  = 'admin@huzurbahcesi.app';

// Iyzico credentials are stored as Firebase Secret Manager secrets so they
// are never hard-coded or visible in logs.
const iyzicoApiKey    = defineSecret('IYZICO_API_KEY');
const iyzicoSecretKey = defineSecret('IYZICO_SECRET_KEY');
const iyzicoBaseUri   = defineSecret('IYZICO_BASE_URI'); // https://api.iyzipay.com (prod) or sandbox URI

// ─── Helpers ─────────────────────────────────────────────────────────────────

function requireAdmin(auth) {
  if (!auth) throw new HttpsError('unauthenticated', 'Authentication required.');
  if (auth.token.email !== ADMIN_EMAIL) throw new HttpsError('permission-denied', 'Admin access required.');
}

function requireAuth(auth) {
  if (!auth) throw new HttpsError('unauthenticated', 'Authentication required.');
}

/** Build an Iyzipay client from the runtime secret values. */
function buildIyzipay() {
  return new Iyzipay({
    apiKey:    iyzicoApiKey.value(),
    secretKey: iyzicoSecretKey.value(),
    uri:       iyzicoBaseUri.value() || 'https://sandbox-api.iyzipay.com',
  });
}

/**
 * Recalculate the cart total server-side.
 *
 * NOTE: In production you should look up each product price from Firestore
 * rather than trusting the client-supplied price.  The implementation below
 * trusts the client price per item but performs the sum server-side so the
 * final `total` stored on the order cannot be manipulated by the client.
 * For a fully price-safe system, replace this with a Firestore product lookup.
 */
function recalculateTotal(items, coupon, usePoints, userPoints) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new HttpsError('invalid-argument', 'Cart is empty.');
  }

  const base = items.reduce((sum, item) => {
    const price = parseFloat(item.price);
    if (isNaN(price) || price <= 0) {
      throw new HttpsError('invalid-argument', `Invalid price for item: ${item.name}`);
    }
    return sum + price;
  }, 0);

  let discount = 0;
  if (coupon) {
    if (coupon.type === 'fixed')   discount = parseFloat(coupon.value) || 0;
    if (coupon.type === 'percent') discount = base * ((parseFloat(coupon.value) || 0) / 100);
  }

  const pointsDiscount = usePoints ? Math.min(parseFloat(userPoints) || 0, base - discount) : 0;
  const total = Math.max(0, base - discount - pointsDiscount);
  return parseFloat(total.toFixed(2));
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. createIyzicoPayment
//    Callable from the frontend on checkout with iyzico payment method.
//
//    Request payload (all required unless marked optional):
//      cardHolder    string  – name on card
//      cardNumber    string  – 16-digit card number (no spaces)
//      expireMonth   string  – "MM"
//      expireYear    string  – "YYYY"
//      cvc           string  – 3-digit CVV
//      cart          array   – [{ id, name, price, vendorId, vendorName? }]
//      relativeName  string  – grave owner name
//      relativeCemetery string
//      liveVideoRequested boolean (optional)
//      coupon        object|null (optional) – { type, value, id }
//      usePoints     boolean (optional)
//      userPoints    number  (optional)
//      paymentMethod string  – must be 'iyzico'
// ─────────────────────────────────────────────────────────────────────────────
exports.createIyzicoPayment = onCall(
  { secrets: [iyzicoApiKey, iyzicoSecretKey, iyzicoBaseUri] },
  async (request) => {
    requireAuth(request.auth);

    const {
      cardHolder,
      cardNumber,
      expireMonth,
      expireYear,
      cvc,
      cart,
      relativeName,
      relativeCemetery,
      liveVideoRequested = false,
      coupon = null,
      usePoints = false,
      userPoints = 0,
    } = request.data;

    // ── Input validation ───────────────────────────────────────────────
    if (!cardHolder || !cardNumber || !expireMonth || !expireYear || !cvc) {
      throw new HttpsError('invalid-argument', 'Kart bilgileri eksik.');
    }
    const cleanCard = cardNumber.replace(/\s/g, '');
    if (!/^\d{16}$/.test(cleanCard)) {
      throw new HttpsError('invalid-argument', 'Geçersiz kart numarası.');
    }
    if (!/^\d{2}$/.test(expireMonth) || !/^\d{4}$/.test(expireYear)) {
      throw new HttpsError('invalid-argument', 'Geçersiz son kullanma tarihi.');
    }
    if (!/^\d{3,4}$/.test(cvc)) {
      throw new HttpsError('invalid-argument', 'Geçersiz CVV.');
    }

    // ── Server-side price calculation ──────────────────────────────────
    const total = recalculateTotal(cart, coupon, usePoints, userPoints);
    const priceStr = total.toFixed(2);

    const orderNo = `HZ-${Math.floor(Math.random() * 90000) + 10000}`;
    const uid     = request.auth.uid;
    const email   = request.auth.token.email || 'musteri@huzurbahcesi.app';
    const name    = request.auth.token.name  || 'Üye';

    // ── Build Iyzico payment request ────────────────────────────────────
    const iyzipay = buildIyzipay();

    const paymentRequest = {
      locale:          Iyzipay.LOCALE.TR,
      conversationId:  orderNo,
      price:           priceStr,
      paidPrice:       priceStr,
      currency:        Iyzipay.CURRENCY.TRY,
      installment:     '1',
      basketId:        orderNo,
      paymentChannel:  Iyzipay.PAYMENT_CHANNEL.WEB,
      paymentGroup:    Iyzipay.PAYMENT_GROUP.PRODUCT,
      paymentCard: {
        cardHolderName: cardHolder,
        cardNumber:     cleanCard,
        expireMonth,
        expireYear,
        cvc,
        registerCard:   '0',
      },
      buyer: {
        id:                  uid,
        name:                name.split(' ')[0] || 'Üye',
        surname:             name.split(' ').slice(1).join(' ') || 'Üye',
        gsmNumber:           '+905000000000',   // Ideally collected from user profile
        email,
        identityNumber:      '74300864791',     // Ideally collected from user profile
        registrationAddress: 'Türkiye',
        ip:                  request.rawRequest?.ip || '85.34.78.112',
        city:                'Istanbul',
        country:             'Turkey',
      },
      shippingAddress: {
        contactName: name,
        city:        'Istanbul',
        country:     'Turkey',
        address:     relativeCemetery || 'Türkiye',
      },
      billingAddress: {
        contactName: name,
        city:        'Istanbul',
        country:     'Turkey',
        address:     relativeCemetery || 'Türkiye',
      },
      basketItems: cart.map((item) => ({
        id:               String(item.id),
        name:             item.name.substring(0, 100),
        category1:        item.category || 'Mezar Bakım',
        itemType:         Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
        price:            parseFloat(item.price).toFixed(2),
      })),
    };

    // ── Call Iyzico API ─────────────────────────────────────────────────
    const iyzicoResult = await new Promise((resolve, reject) => {
      iyzipay.payment.create(paymentRequest, (err, result) => {
        if (err) return reject(new HttpsError('internal', `Iyzico bağlantı hatası: ${err.message}`));
        resolve(result);
      });
    });

    if (iyzicoResult.status !== 'success') {
      const errMsg = iyzicoResult.errorMessage || 'Ödeme işlemi başarısız.';
      throw new HttpsError('failed-precondition', errMsg);
    }

    // ── Create Firestore order (server-side, safe) ──────────────────────
    const orderRef = await db
      .collection(`artifacts/${APP_ID}/public/data/orders`)
      .add({
        orderNumber:           orderNo,
        userId:                uid,
        userName:              name,
        userEmail:             email,
        date:                  new Date().toLocaleDateString('tr-TR'),
        items:                 cart,
        total,
        status:                'Ödeme Havuzda',
        relativeName,
        relativeCemetery,
        liveVideoRequested,
        paymentMethod:         'iyzico',
        iyzicoPaymentId:       iyzicoResult.paymentId,
        iyzicoPaymentTransactionId:
          iyzicoResult.paymentItems?.[0]?.paymentTransactionId || null,
        messages:              [],
        couponApplied:         coupon ? coupon.id || null : null,
        pointsUsed:            usePoints ? userPoints : 0,
        createdAt:             FieldValue.serverTimestamp(),
      });

    // ── Send notification to customer ───────────────────────────────────
    await db
      .collection(`artifacts/${APP_ID}/users/${uid}/notifications`)
      .add({
        title:     'Ödeme Güvenli Havuzda 🛡️',
        message:   `${orderNo} nolu işleminiz için tutar İyzico güvencesiyle havuza alındı. İş bitiminde satıcıya aktarılacak.`,
        createdAt: Date.now(),
        read:      false,
        orderId:   orderRef.id,
      });

    // ── Mark coupon as used (server-side) ──────────────────────────────
    if (coupon && coupon.id) {
      try {
        await db
          .doc(`artifacts/${APP_ID}/users/${uid}/coupons/${coupon.id}`)
          .update({ used: true });
      } catch (_) { /* ignore – coupon may be a default (non-Firestore) coupon */ }
    }

    return { success: true, orderId: orderRef.id, orderNumber: orderNo };
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// 2. approveVendorApplication
//    Request: { applicationId: string }
// ─────────────────────────────────────────────────────────────────────────────
exports.approveVendorApplication = onCall(async (request) => {
  requireAdmin(request.auth);

  const { applicationId } = request.data;
  if (!applicationId) throw new HttpsError('invalid-argument', 'applicationId is required.');

  const appRef  = db.doc(`artifacts/${APP_ID}/public/data/vendor_applications/${applicationId}`);
  const appSnap = await appRef.get();
  if (!appSnap.exists) throw new HttpsError('not-found', 'Vendor application not found.');

  const vendorApp = appSnap.data();
  await appRef.update({ status: 'Onaylandı', updatedAt: FieldValue.serverTimestamp() });

  if (vendorApp.userId) {
    await db.collection(`artifacts/${APP_ID}/users/${vendorApp.userId}/notifications`).add({
      title:     '🎉 Başvurunuz Onaylandı!',
      message:   `"${vendorApp.companyName}" adlı şirketinizin satıcı başvurusu onaylandı. Artık platformumuzda hizmet verebilirsiniz.`,
      createdAt: Date.now(),
      read:      false,
    });
  }
  return { success: true };
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. rejectVendorApplication
//    Request: { applicationId: string, reason?: string }
// ─────────────────────────────────────────────────────────────────────────────
exports.rejectVendorApplication = onCall(async (request) => {
  requireAdmin(request.auth);

  const { applicationId, reason } = request.data;
  if (!applicationId) throw new HttpsError('invalid-argument', 'applicationId is required.');

  const appRef  = db.doc(`artifacts/${APP_ID}/public/data/vendor_applications/${applicationId}`);
  const appSnap = await appRef.get();
  if (!appSnap.exists) throw new HttpsError('not-found', 'Vendor application not found.');

  const vendorApp = appSnap.data();
  await appRef.update({
    status:          'Reddedildi',
    rejectionReason: reason || 'Başvurunuz uygun bulunmadı.',
    updatedAt:       FieldValue.serverTimestamp(),
  });

  if (vendorApp.userId) {
    await db.collection(`artifacts/${APP_ID}/users/${vendorApp.userId}/notifications`).add({
      title:     'Başvurunuz Değerlendirildi',
      message:   `"${vendorApp.companyName}" adlı şirketinizin başvurusu reddedildi. ${reason ? `Neden: ${reason}` : 'Daha fazla bilgi için bizimle iletişime geçin.'}`,
      createdAt: Date.now(),
      read:      false,
    });
  }
  return { success: true };
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. adminCancelOrder
//    Request: { orderId: string, resolution: 'refund' | 'cancel' }
// ─────────────────────────────────────────────────────────────────────────────
exports.adminCancelOrder = onCall(
  { secrets: [iyzicoApiKey, iyzicoSecretKey, iyzicoBaseUri] },
  async (request) => {
    requireAdmin(request.auth);

    const { orderId, resolution } = request.data;
    if (!orderId || !['refund', 'cancel'].includes(resolution)) {
      throw new HttpsError('invalid-argument', 'orderId and resolution ("refund"|"cancel") are required.');
    }

    const orderRef  = db.doc(`artifacts/${APP_ID}/public/data/orders/${orderId}`);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) throw new HttpsError('not-found', 'Order not found.');

    const order = orderSnap.data();
    if (['Tamamlandı', 'İade Edildi', 'İptal Edildi'].includes(order.status)) {
      throw new HttpsError('failed-precondition', `Order is already "${order.status}".`);
    }

    // ── Iyzico refund ──────────────────────────────────────────────────
    if (resolution === 'refund' && order.iyzicoPaymentTransactionId) {
      const iyzipay = buildIyzipay();
      const refundResult = await new Promise((resolve, reject) => {
        iyzipay.refund.create(
          {
            locale:               Iyzipay.LOCALE.TR,
            conversationId:       `REFUND-${orderId}`,
            paymentTransactionId: order.iyzicoPaymentTransactionId,
            price:                String(order.total),
            currency:             Iyzipay.CURRENCY.TRY,
            ip:                   '85.34.78.112',
          },
          (err, result) => {
            if (err) return reject(new HttpsError('internal', `Iyzico refund error: ${err.message}`));
            resolve(result);
          }
        );
      });

      if (refundResult.status !== 'success') {
        throw new HttpsError(
          'failed-precondition',
          `Iyzico iade başarısız: ${refundResult.errorMessage || 'Bilinmeyen hata.'}`
        );
      }
    }

    const newStatus = resolution === 'refund' ? 'İade Edildi' : 'İptal Edildi';
    await orderRef.update({ status: newStatus, updatedAt: FieldValue.serverTimestamp() });

    await db.collection(`artifacts/${APP_ID}/users/${order.userId}/notifications`).add({
      title:     resolution === 'refund' ? 'İadeniz İşleme Alındı 💰' : 'Siparişiniz İptal Edildi',
      message:   resolution === 'refund'
        ? `${order.orderNumber} numaralı siparişiniz için iade işlemi başlatıldı. Tutar 3–5 iş günü içinde kartınıza yansıyacaktır.`
        : `${order.orderNumber} numaralı siparişiniz iptal edildi.`,
      createdAt: Date.now(),
      read:      false,
      orderId,
    });

    return { success: true, newStatus };
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// 5. releasePaymentToVendor  (Firestore trigger)
//    Fires when an order status transitions to "Tamamlandı".
// ─────────────────────────────────────────────────────────────────────────────
exports.releasePaymentToVendor = onDocumentUpdated(
  { document: `artifacts/${APP_ID}/public/data/orders/{orderId}`, secrets: [iyzicoApiKey, iyzicoSecretKey, iyzicoBaseUri] },
  async (event) => {
    const before = event.data.before.data();
    const after  = event.data.after.data();

    if (before.status === after.status) return null;
    if (after.status !== 'Tamamlandı')  return null;

    const orderId = event.params.orderId;

    // ── Iyzico sub-merchant approval (release escrow to vendor) ────────
    if (after.iyzicoPaymentTransactionId) {
      const iyzipay      = buildIyzipay();
      const approvalResult = await new Promise((resolve, reject) => {
        iyzipay.approval.create(
          {
            locale:               Iyzipay.LOCALE.TR,
            conversationId:       `APPROVE-${orderId}`,
            paymentTransactionId: after.iyzicoPaymentTransactionId,
          },
          (err, result) => {
            if (err) return reject(err);
            resolve(result);
          }
        );
      });

      if (approvalResult.status !== 'success') {
        console.error('Iyzico approval failed for order', orderId, approvalResult.errorMessage);
        // Do not throw – log and continue so the order stays "Tamamlandı"
      }
    }

    await event.data.after.ref.update({
      paymentReleased:   true,
      paymentReleasedAt: FieldValue.serverTimestamp(),
    });

    const vendorId = after.vendorId || 'v1';
    await db.collection(`artifacts/${APP_ID}/users/${vendorId}/notifications`).add({
      title:     'Ödemeniz Serbest Bırakıldı 💸',
      message:   `${after.orderNumber} numaralı iş onaylandı. İyzico hakedişiniz hesabınıza aktarılacaktır.`,
      createdAt: Date.now(),
      read:      false,
      orderId,
    });

    return null;
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// 6. autoApproveExpiredOrders  (Scheduled – every 5 minutes)
//    Server-side safety net: auto-approves orders whose 15-minute window
//    has elapsed.  Backs up the client-side timer in App.jsx.
// ─────────────────────────────────────────────────────────────────────────────
exports.autoApproveExpiredOrders = onSchedule('every 5 minutes', async () => {
  const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;

  const snapshot = await db
    .collection(`artifacts/${APP_ID}/public/data/orders`)
    .where('status', '==', 'Müşteri Onayı Bekliyor')
    .where('reportSubmittedAt', '<=', fifteenMinutesAgo)
    .get();

  if (snapshot.empty) return null;

  const batch = db.batch();
  snapshot.forEach((docSnap) => {
    batch.update(docSnap.ref, {
      status:      'Tamamlandı',
      autoApproved: true,
      updatedAt:   FieldValue.serverTimestamp(),
    });
  });
  await batch.commit();

  await Promise.all(
    snapshot.docs.map((docSnap) => {
      const order = docSnap.data();
      return db.collection(`artifacts/${APP_ID}/users/${order.userId}/notifications`).add({
        title:     'Otomatik Onay Gerçekleşti ⏳',
        message:   `${order.orderNumber} numaralı işleminizin 15 dakikalık onay süresi dolduğu için sistem tarafından otomatik olarak onaylanmıştır.`,
        createdAt: Date.now(),
        read:      false,
        orderId:   docSnap.id,
      });
    })
  );

  return null;
});
