import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, ShoppingBag, User, MapPin, Flower2, 
  Droplets, Sparkles, BookOpen, Plus, X, CheckCircle, Clock, 
  Package, Settings, LogOut, Zap, Star, ChevronLeft, Calendar, History, 
  Bell, Smartphone, Lock, Trash2, Edit2, Info, Phone, Mail, 
  CalendarDays, RefreshCw, ImageIcon, Store, Upload, ImagePlus, TrendingUp, CheckSquare, Camera, 
  Navigation, Users, Share2, Copy, Heart, Video, Map, Crosshair, Ticket, Gift, Percent, 
  MessageSquare, FileText, FileCheck, AlertCircle, ShieldCheck, 
  Shield, Check, XCircle, MessageCircle, BadgeCheck, MoveHorizontal, Wallet, HelpCircle, ArrowRight,
  Compass, Book, Send, StarHalf, MessageSquareText, Share, Volume2, Square, CreditCard,
  LayoutDashboard, BarChart3, Activity, Receipt, Download,
  Image as ImageIconLucide, PlusCircle, Layers, ImagePlus as ImagePlusLucide, Coins, Landmark, Bitcoin,
  Briefcase, FileSignature, WalletCards, CloudSun, Route, Scale, AlertTriangle, ThumbsUp, ThumbsDown
} from 'lucide-react';

// --- FİREBASE İÇE AKTARIMLARI ---
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithCustomToken,
  signInAnonymously,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  setDoc, 
  getDoc,
  updateDoc,
  getDocs
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

// --- SABİT TANITIM VERİLERİ ---
const initialRelatives = [
  { id: 1, name: 'Ahmet Yılmaz', relation: 'Baba', cemetery: 'Karacaahmet Mezarlığı, 5. Ada', gps: '41.011200, 29.025600', addressDescription: '5. kapıdan girince sağdan 3. yol, büyük çeşmenin hemen arkası.', image: 'https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?auto=format&fit=crop&q=80&w=150&h=150', deathDate: '2020-05-15' },
  { id: 2, name: 'Ayşe Demir', relation: 'Anneanne', cemetery: 'Zincirlikuyu Mezarlığı, D Blok', gps: '41.074300, 29.008400', addressDescription: '', image: 'https://images.unsplash.com/photo-1596435436665-271391cb4570?auto=format&fit=crop&q=80&w=150&h=150', deathDate: '' },
];

const vendors = [
  { id: 'v1', name: 'Huzur Mezar Bakım', isVerified: true, rating: 4.9, time: 'Bugün', minOrder: 150, image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=300', tags: 'Bakım, Çiçek, Aynı Gün', categories: ['bakim', 'cicek'] },
  { id: 'v2', name: 'Gültekin Peyzaj', isVerified: false, rating: 4.7, time: 'Yarın', minOrder: 100, image: 'https://images.unsplash.com/photo-1589136655160-59fdb2b07e5b?auto=format&fit=crop&q=80&w=300', tags: 'Fide, Çiçek, Ekim', categories: ['cicek', 'peyzaj'] },
  { id: 'v3', name: 'Aktaş Mermer', isVerified: true, rating: 4.5, time: '3 Gün', minOrder: 500, image: 'https://images.unsplash.com/photo-1628151015968-3a4429e9ef04?auto=format&fit=crop&q=80&w=300', tags: 'Mermer, Cila, Bitcoin Kabul', categories: ['mermer'] },
];

const initialProducts = [
  { id: 104, vendorId: 'v1', category: 'bakim', name: '🔍 Detaylı Durum Check-Up', desc: 'Mezarın mevcut durumunu gösteren detaylı fotoğraflı analiz raporu.', price: 150, isFeatured: false },
  { id: 102, vendorId: 'v1', category: 'bakim', name: '✨ Bayram Öncesi Premium Temizlik', desc: 'Detaylı mermer yıkama, ot temizliği ve gül suyu ile yıkama.', price: 650, image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=300', isFeatured: true },
  { id: 101, vendorId: 'v1', category: 'bakim', name: 'Aylık Standart Bakım', desc: 'Yabani ot temizliği, toprak havalandırma ve sulama.', price: 400, image: 'https://images.unsplash.com/photo-1416879598555-220b3cc5fa70?auto=format&fit=crop&q=80&w=300', isSubscription: true },
  { id: 301, vendorId: 'v3', category: 'mermer', name: '💎 Granit Parlatma & Cila', desc: 'Özel solüsyonlar ile mezar mermerinin ilk günkü parlaklığına kavuşturulması.', price: 1200, image: 'https://images.unsplash.com/photo-1628151015968-3a4429e9ef04?auto=format&fit=crop&q=80&w=300' },
  { id: 201, vendorId: 'v2', category: 'cicek', name: 'Kalıcı Sardunya Ekimi', desc: 'Mevsime dayanıklı 4 adet sardunya fidesi ekimi ve can suyu verilmesi.', price: 250, image: 'https://images.unsplash.com/photo-1589136655160-59fdb2b07e5b?auto=format&fit=crop&q=80&w=300' },
];

// --- FİREBASE BAŞLATMA ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : { apiKey: "demo" };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app, 'europe-west1'); // Cloud Functions region
const appId = typeof __app_id !== 'undefined' ? __app_id : 'huzurbahcesi-v1';

// --- GERÇEK ZAMANLI İNTERAKTİF HARİTA BİLEŞENİ ---
const InteractiveMap = ({ centerGps, onCenterChanged }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [scriptsLoaded, setScriptsLoaded] = useState(!!window.L);

  useEffect(() => {
    if (window.L) {
      setScriptsLoaded(true);
      return;
    }
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css'; link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js'; script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => setScriptsLoaded(true);
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!scriptsLoaded || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      let lat = 41.0112, lng = 29.0256; 
      if (centerGps && centerGps.includes(',')) {
         const parts = centerGps.split(',');
         lat = parseFloat(parts[0]); lng = parseFloat(parts[1]);
      }

      const map = window.L.map(mapContainerRef.current, { center: [lat, lng], zoom: 16, zoomControl: false, attributionControl: false });
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);

      map.on('moveend', () => {
        const center = map.getCenter();
        onCenterChanged(`${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}`);
      });

      mapInstanceRef.current = map;
    }
    
    return () => {
      if (mapInstanceRef.current) {
         mapInstanceRef.current.remove();
         mapInstanceRef.current = null;
      }
    };
  }, [scriptsLoaded]); 

  useEffect(() => {
     if (mapInstanceRef.current && centerGps && centerGps.includes(',')) {
        const parts = centerGps.split(',');
        const lat = parseFloat(parts[0]); const lng = parseFloat(parts[1]);
        const currentCenter = mapInstanceRef.current.getCenter();
        if (Math.abs(currentCenter.lat - lat) > 0.0001 || Math.abs(currentCenter.lng - lng) > 0.0001) {
           mapInstanceRef.current.setView([lat, lng], 16);
        }
     }
  }, [centerGps]);

  return (
     <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-gray-200 shadow-inner group mb-2 bg-gray-100 z-0">
        <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 1 }}></div>
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center" style={{ zIndex: 2 }}>
          <div className="text-emerald-600 drop-shadow-2xl -mt-8">
             <MapPin className="w-10 h-10 fill-emerald-100/90" />
          </div>
        </div>
        {!scriptsLoaded && <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400" style={{ zIndex: 3 }}>Harita Yükleniyor...</div>}
     </div>
  );
};

// --- ÖNCESİ/SONRASI SLIDER ---
const BeforeAfterSlider = ({ before, after }) => {
  const [sliderValue, setSliderValue] = useState(50);
  return (
    <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden bg-gray-200 shadow-inner group touch-pan-y">
      <img src={after} alt="Sonrası" className="absolute inset-0 w-full h-full object-cover" />
      <img src={before} alt="Öncesi" className="absolute inset-0 w-full h-full object-cover" style={{ clipPath: `inset(0 ${100 - sliderValue}% 0 0)` }} />
      <input type="range" min="0" max="100" value={sliderValue} onChange={(e) => setSliderValue(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20" />
      <div className="absolute top-0 bottom-0 w-1 bg-white pointer-events-none z-10 flex items-center justify-center shadow-lg" style={{ left: `${sliderValue}%`, transform: 'translateX(-50%)' }}>
        <div className="bg-white text-emerald-600 rounded-full p-1 shadow-lg border border-gray-100"><MoveHorizontal className="w-5 h-5" /></div>
      </div>
      <span className="absolute top-3 left-3 bg-red-500/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md uppercase">ÖNCESİ</span>
      <span className="absolute top-3 right-3 bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md uppercase">SONRASI</span>
    </div>
  );
};

// --- ANA COMPONENT ---
export default function App() {
  // --- STATES ---
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Genel Uygulama Durumları
  const [viewMode, setViewMode] = useState('customer'); // customer, vendor, admin, vendor_onboarding
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [adminTab, setAdminTab] = useState('dashboard'); 
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [accountView, setAccountView] = useState('menu'); 
  const [infoModal, setInfoModal] = useState(null);

  // Kullanıcı Profil ve Ayarları
  const [settingsName, setSettingsName] = useState(''); 
  const [settingsPhone, setSettingsPhone] = useState('');
  const [settingsOldPassword, setSettingsOldPassword] = useState('');
  const [settingsNewPassword, setSettingsNewPassword] = useState('');
  const [settingsConfirmPassword, setSettingsConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [settingsSuccess, setSettingsSuccess] = useState(false); 
  const [huzurPoints, setHuzurPoints] = useState(0);

  // Veri Listeleri
  const [relatives, setRelatives] = useState(initialRelatives);
  const [allOrders, setAllOrders] = useState([]); 
  const [orders, setOrders] = useState([]); 
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [cart, setCart] = useState([]);
  
  // Satın Alma & Sepet İşlemleri
  const [selectedRelativeId, setSelectedRelativeId] = useState(initialRelatives[0]?.id || null);
  const [usePoints, setUsePoints] = useState(false);
  const [liveVideo, setLiveVideo] = useState(false); 
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isAnniversaryDismissed, setIsAnniversaryDismissed] = useState(false); 
  const [paymentMethod, setPaymentMethod] = useState('iyzico');

  // Kart Bilgileri (yalnızca iyzico akışında kullanılır; hiçbir zaman Firestore'a yazılmaz)
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');  // "MM/YYYY"
  const [cardCvc, setCardCvc]       = useState('');
  const [checkoutError, setCheckoutError] = useState('');

  // Aile İle Ortak Ödeme
  const [isFamilyShareOpen, setIsFamilyShareOpen] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([]); 
  const [newFamilyMemberName, setNewFamilyMemberName] = useState(''); 
  const [familyShareCopied, setFamilyShareCopied] = useState(false);
  
  // Pazar Yeri Filtreleme
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorTab, setVendorTab] = useState('hizmetler');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('Tümü');
  const categoryFilters = ['Tümü', 'Bakım', 'Mermer', 'Çiçek', 'Peyzaj'];

  // Yakın Ekleme Formu
  const [isAddRelativeOpen, setIsAddRelativeOpen] = useState(false);
  const [isVerifyingLocation, setIsVerifyingLocation] = useState(false);
  const [newRelativeData, setNewRelativeData] = useState({ name: '', relation: '', cemetery: '', ada: '', parsel: '', tombstoneText: '', gps: '41.011200, 29.025600', addressDescription: '', deathDate: '', image: '', isVerified: false });

  // Satıcı (Vendor) Paneli States
  const [products, setProducts] = useState(initialProducts);
  const [vendorGallery, setVendorGallery] = useState([]);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [newServiceData, setNewServiceData] = useState({ name: '', desc: '', price: '', image: '', category: 'Bakım' });
  const [isAddReferenceOpen, setIsAddReferenceOpen] = useState(false);
  const [newReferenceData, setNewReferenceData] = useState({ title: '', before: '', after: '' });
  const [vendorStatusMsg, setVendorStatusMsg] = useState({ type: '', text: '' });
  const [vendorOrderImageBefore, setVendorOrderImageBefore] = useState('');
  const [vendorOrderImageAfter, setVendorOrderImageAfter] = useState('');
  const [activeVendorOrderId, setActiveVendorOrderId] = useState(null);
  const [vendorLocationVerified, setVendorLocationVerified] = useState(false); 

  // Yönetici (Admin) Paneli States
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false); 
  const [isAdminCouponModalOpen, setIsAdminCouponModalOpen] = useState(false);
  const [adminCouponTarget, setAdminCouponTarget] = useState(null);
  const [adminCouponData, setAdminCouponData] = useState({ code: '', value: 50, type: 'fixed', title: 'Özel İndirim' });
  const [adminStatusMsg, setAdminStatusMsg] = useState({ type: '', text: '' });

  // Satıcı Başvuru Formu (Onboarding)
  const [vendorApplicationData, setVendorApplicationData] = useState({ companyName: '', taxNumber: '', iban: '', phone: '', documentImage: '' });
  const [vendorApplications, setVendorApplications] = useState([]);
  const [documentModalOpen, setDocumentModalOpen] = useState(null);

  // Ziyaret Rehberi & Sesli Dua
  const [isVisitorGuideOpen, setIsVisitorGuideOpen] = useState(false);
  const [playingPrayerId, setPlayingPrayerId] = useState(null);
  const [compassHeading, setCompassHeading] = useState(0);
  const [compassActive, setCompassActive] = useState(false);

  // Canlı Mesajlaşma, Değerlendirme ve Revize
  const [chatOrder, setChatOrder] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const chatScrollRef = useRef(null);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [disputeOrder, setDisputeOrder] = useState(null); 
  const [disputeReason, setDisputeReason] = useState(''); 
  const [currentTime, setCurrentTime] = useState(Date.now()); 

  // Kupon Sistemi
  const [coupons, setCoupons] = useState([]);
  const [cartCouponInput, setCartCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  // Mock Admin Data
  const mockUsersList = [
    { id: 'U-9841', name: 'Ahmet Yılmaz', email: 'ahmet.yilmaz@example.com', phone: '0532 123 45 67', joinDate: '12 Ocak 2026', totalOrders: 3, totalSpent: 1450, status: 'Aktif' },
    { id: 'U-8273', name: 'Ayşe Demir', email: 'ayse.d@example.com', phone: '0555 987 65 43', joinDate: '05 Mart 2026', totalOrders: 1, totalSpent: 400, status: 'Aktif' },
    { id: 'U-1092', name: 'Mehmet Kaya', email: 'mehmetkaya88@example.com', phone: '0505 555 44 33', joinDate: '28 Nisan 2026', totalOrders: 0, totalSpent: 0, status: 'Pasif' },
    { id: 'U-4451', name: 'Zeynep Çelik', email: 'zeynep.c@example.com', phone: '0544 111 22 33', joinDate: '01 Mayıs 2026', totalOrders: 5, totalSpent: 3200, status: 'Aktif' }
  ];
  const mockVendorApplications = [
    { id: 'APP-1', companyName: 'Yeşil Vadi Peyzaj Ltd.', taxNumber: '1234567890', date: '29 Nisan 2026', phone: '0850 123 45 67', status: 'Bekliyor', documentImage: 'https://images.unsplash.com/photo-1626245229676-e17f2fa8fcb4?auto=format&fit=crop&q=80&w=600' }
  ];

  const prayers = [
    { id: 'fatiha', title: 'Fatiha Suresi', text: "Bismillâhirrahmânirrahîm. Elhamdü lillâhi rabbil'alemin. Errahmânir'rahim. Mâliki yevmiddin. İyyâke na'budü ve iyyâke neste'în. İhdinessırâtel müstakîm. Sırâtellezine en'amte aleyhim, ğayrilmağdûbi aleyhim ve leddâllîn.", audioUrl: 'https://server8.mp3quran.net/afs/001.mp3' },
    { id: 'ihlas', title: 'İhlas Suresi', text: "Bismillâhirrahmânirrahîm. Kul hüvellâhü ehad. Allâhüssamed. Lem yelid ve lem yûled. Ve lem yekün lehû küfüven ehad.", audioUrl: 'https://server8.mp3quran.net/afs/112.mp3' }
  ];
  const audioRef = useRef(null);

  // --- DERIVED STATES ---
  const selectedRelative = relatives.find(r => r.id === selectedRelativeId);
  const vendorProducts = selectedVendor ? products.filter(p => p.vendorId === selectedVendor.id) : [];
  
  const normalizeCat = (cat) => cat ? cat.toLowerCase().replace('bakım', 'bakim').replace('çiçek', 'cicek') : '';
  const filteredVendors = activeCategoryFilter === 'Tümü' ? vendors : vendors.filter(v => v.categories?.includes(normalizeCat(activeCategoryFilter)));
  const filteredProducts = activeCategoryFilter === 'Tümü' ? vendorProducts : vendorProducts.filter(p => normalizeCat(p.category) === normalizeCat(activeCategoryFilter));
  
  const baseTotal = cart.reduce((sum, item) => sum + item.price, 0);
  const discountAmount = appliedCoupon ? (appliedCoupon.type === 'fixed' ? appliedCoupon.value : (baseTotal * (appliedCoupon.value / 100))) : 0;
  const totalCartPrice = Math.max(0, baseTotal - discountAmount - (usePoints ? huzurPoints : 0)); 
  const unreadNotifications = notifications.filter(n => !n.read).length;

  const realTimeUsersMap = {};
  allOrders.forEach(o => {
    if (!realTimeUsersMap[o.userId]) {
       realTimeUsersMap[o.userId] = {
          id: o.userId,
          name: o.userName || 'İsimsiz Üye',
          email: o.userEmail || 'E-posta Gizli',
          joinDate: o.date,
          totalOrders: 0,
          totalSpent: 0,
          status: 'Aktif'
       };
    }
    realTimeUsersMap[o.userId].totalOrders += 1;
    realTimeUsersMap[o.userId].totalSpent += o.total;
  });
  const combinedUsersList = [ ...mockUsersList, ...Object.values(realTimeUsersMap).filter(ru => !mockUsersList.find(mu => mu.id === ru.id)) ];
  const activeOrdersCount = allOrders.filter(o => o.status !== 'Tamamlandı' && o.status !== 'İade Edildi').length;

  useEffect(() => {
    if (familyMembers.length === 0 || familyMembers.length === 1) {
       setFamilyMembers([{ id: 'me', name: 'Ben', amount: totalCartPrice, isMe: true }]);
    }
  }, [totalCartPrice]);

  // Canlı Geri Sayım İçin Timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Otomatik Onay Mekanizması (15 Dk Dolunca)
  useEffect(() => {
    if (viewMode === 'customer' && user) {
       orders.forEach(o => {
          if (o.status === 'Müşteri Onayı Bekliyor' && o.reportSubmittedAt) {
             const timePassed = Date.now() - o.reportSubmittedAt;
             if (timePassed >= 15 * 60 * 1000) {
                handleCustomerApproveOrder(o.id, o.orderNumber, true);
             }
          }
       });
    }
  }, [currentTime, orders, viewMode, user]);

  // --- FİREBASE LİSTENERS VE AUTH ---
  useEffect(() => {
    document.documentElement.lang = 'tr';
    if (!document.getElementById('jspdf-js')) {
      const script = document.createElement('script'); script.id = 'jspdf-js'; script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      document.head.appendChild(script);
    }

    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        try { await signInWithCustomToken(auth, __initial_auth_token); } catch(e) {}
      } else {
        try { await signInAnonymously(auth); } catch(e) {}
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setSettingsName(currentUser.displayName || 'Anonim Kullanıcı');
        setIsAdmin(currentUser.email === 'admin@huzurbahcesi.app' || currentUser.isAnonymous === false);
        try {
          const profile = await getDoc(doc(db, 'artifacts', appId, 'users', currentUser.uid, 'profile', 'data'));
          if (profile.exists()) {
            setHuzurPoints(profile.data().points || 0);
            setSettingsPhone(profile.data().phone || '');
          }
        } catch (e) { }
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) { setRelatives(initialRelatives); return; }

    // OPTIMIZASYON: Ürünleri ve Referansları sadece 1 kere (Lazy Load) çek (İzin hatasını önlemek için auth sonrasına taşındı)
    const fetchStaticData = async () => {
      try {
        const prodSnap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'products'));
        if (!prodSnap.empty) {
          setProducts([...initialProducts, ...prodSnap.docs.map(d => ({ id: d.id, ...d.data() }))]);
        }
        
        const refSnap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'references'));
        if (!refSnap.empty) {
          setVendorGallery([
            { id: 'g1', vendorId: 'v1', before: 'https://images.unsplash.com/photo-1416879598555-220b3cc5fa70?auto=format&fit=crop&q=80&w=300', after: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=300', title: 'Periyodik Temizlik' }, 
            ...refSnap.docs.map(d => ({ id: d.id, ...d.data() }))
          ]);
        } else {
          setVendorGallery([
             { id: 'g1', vendorId: 'v1', before: 'https://images.unsplash.com/photo-1416879598555-220b3cc5fa70?auto=format&fit=crop&q=80&w=300', after: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=300', title: 'Periyodik Temizlik' }
          ]);
        }
      } catch (e) { console.error(e); }
    };
    fetchStaticData();
    
    const unsubscribeRel = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'relatives'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const displayData = data.length === 0 ? initialRelatives : data;
      setRelatives(displayData);
      if (!selectedRelativeId || !displayData.find(r => r.id === selectedRelativeId)) {
        setSelectedRelativeId(displayData[0]?.id);
      }
    }, (err) => console.error(err));

    const unsubscribeOrd = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => b.createdAt - a.createdAt);
      setAllOrders(data);
      setOrders(data.filter(o => o.userId === user.uid)); 
      
      if(chatOrder) {
        const updatedChatOrder = data.find(o => o.id === chatOrder.id);
        if(updatedChatOrder) setChatOrder(updatedChatOrder);
      }
    }, (err) => console.error(err));

    const unsubscribeNotif = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'notifications'), (snap) => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => b.createdAt - a.createdAt));
    }, (err) => console.error(err));

    const unsubscribeCoupons = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'coupons'), (snap) => {
      const dbCoupons = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const defaultCoupons = [
        { id: 1, code: 'ILKBAKIM50', title: 'İlk Kayıt Hediyesi', desc: 'Sisteme eklediğiniz ilk yakınınız için tüm hizmetlerde 50 ₺ anında indirim.', type: 'fixed', value: 50, validUntil: '31.12.2026', used: false },
        { id: 2, code: 'BAYRAM20', title: 'Bayrama Özel', desc: 'Tüm bakım paketlerinde %20 indirim fırsatı.', type: 'percent', value: 20, validUntil: '15.06.2026', used: false }
      ];
      setCoupons([...defaultCoupons, ...dbCoupons]);
    }, (err) => console.error(err));

    return () => { unsubscribeRel(); unsubscribeOrd(); unsubscribeNotif(); unsubscribeCoupons(); };
  }, [user, selectedRelativeId, chatOrder?.id]);

  // OPTİMİZASYON: Sadece Admin Başvuruları Dinler
  useEffect(() => {
    if (!isAdmin || !user) return;
    const unsubscribeVendorApps = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'vendor_applications'), (snap) => {
      const apps = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => b.createdAt - a.createdAt);
      setVendorApplications(apps);
    }, (err) => console.error(err));
    return () => unsubscribeVendorApps();
  }, [isAdmin, user]);

  useEffect(() => {
    setIsAnniversaryDismissed(false);
  }, [selectedRelativeId]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatOrder?.messages]);

  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation);
      window.removeEventListener('deviceorientation', handleOrientation);
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  // --- HANDLERS VE YARDIMCI FONKSİYONLAR ---
  const handleUpdateProfile = async () => {
    if(!user) return;
    try {
      await updateProfile(user, { displayName: settingsName });
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data'), { 
        name: settingsName,
        phone: settingsPhone 
      }, { merge: true });
      setUser({ ...user, displayName: settingsName }); 
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000); 
    } catch (err) { console.error(err); }
  };

  const handleUpdatePassword = async () => {
    if(!user) return;
    if(!settingsOldPassword || !settingsNewPassword || !settingsConfirmPassword) {
       setPasswordMsg({ type: 'error', text: 'Lütfen tüm alanları doldurun.' });
       setTimeout(() => setPasswordMsg({ type: '', text: '' }), 3000);
       return;
    }
    if(settingsNewPassword !== settingsConfirmPassword) {
       setPasswordMsg({ type: 'error', text: 'Yeni şifreler eşleşmiyor.' });
       setTimeout(() => setPasswordMsg({ type: '', text: '' }), 3000);
       return;
    }
    if(settingsNewPassword.length < 6) {
       setPasswordMsg({ type: 'error', text: 'Yeni şifre en az 6 karakter olmalıdır.' });
       setTimeout(() => setPasswordMsg({ type: '', text: '' }), 3000);
       return;
    }
    try {
      if (user.email && settingsOldPassword) {
          const credential = EmailAuthProvider.credential(user.email, settingsOldPassword);
          await reauthenticateWithCredential(user, credential);
      }
      await updatePassword(user, settingsNewPassword);
      setPasswordMsg({ type: 'success', text: 'Şifreniz başarıyla güncellendi!' });
      setSettingsOldPassword('');
      setSettingsNewPassword('');
      setSettingsConfirmPassword('');
      setTimeout(() => setPasswordMsg({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          setPasswordMsg({ type: 'error', text: 'Eski şifreniz hatalı.' });
      } else {
          setPasswordMsg({ type: 'error', text: 'Güvenlik gereği çıkış yapıp tekrar girmelisiniz.' });
      }
      setTimeout(() => setPasswordMsg({ type: '', text: '' }), 3000);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setCart([]);
    setAppliedCoupon(null);
    setIsAccountOpen(false);
    setAccountView('menu');
    setRelatives(initialRelatives);
    setSelectedRelativeId(initialRelatives[0].id);
    setViewMode('customer'); 
  };

  const safeCopyToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch (err) {
      console.error('Kopyalama başarısız', err);
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  };

  const handleApplyCoupon = () => {
    setCouponError('');
    if (!cartCouponInput.trim()) return;
    
    const foundCoupon = coupons.find(c => c.code.toUpperCase() === cartCouponInput.toUpperCase().trim());
    if (!foundCoupon) {
      setCouponError('Geçersiz veya süresi dolmuş kupon kodu.');
      return;
    }
    if (foundCoupon.used) {
      setCouponError('Bu kupon kodu daha önce kullanılmış.');
      return;
    }
    
    setAppliedCoupon(foundCoupon);
    setCartCouponInput('');
  };

  const handleCustomerGPSLocation = () => {
    setIsVerifyingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setNewRelativeData({ ...newRelativeData, gps: `${latitude}, ${longitude}` });
          setIsVerifyingLocation(false);
        },
        (error) => {
          alert("Konum alınamadı, lütfen haritayı sürükleyerek manuel seçiniz.");
          setIsVerifyingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert("Cihazınız konum özelliğini desteklemiyor.");
      setIsVerifyingLocation(false);
    }
  };

  const handleAddRelativeSubmit = async (e) => {
    e.preventDefault();
    if (!user || !db) return;
    const fullCemetery = `${newRelativeData.cemetery} ${newRelativeData.ada ? `${newRelativeData.ada}. Ada` : ''}`;
    try {
      const docRef = await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'relatives'), {
        ...newRelativeData, 
        cemetery: fullCemetery, 
        image: newRelativeData.image || 'https://images.unsplash.com/photo-1505692794401-f111dfdb059f?auto=format&fit=crop&q=80&w=150', 
        createdAt: Date.now()
      });
      setIsAddRelativeOpen(false);
      setNewRelativeData({ name: '', relation: '', cemetery: '', ada: '', parsel: '', tombstoneText: '', gps: '41.011200, 29.025600', addressDescription: '', deathDate: '', image: '' });
      setSelectedRelativeId(docRef.id);
      
      if (relatives.length === 0) {
         await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'notifications'), {
           title: 'Tebrikler! Kupon Kazandınız 🎉', message: `Sisteme ilk mezarı eklediğiniz için 50₺ değerinde ILKBAKIM50 kupon kodu hesabınıza tanımlanmıştır.`, createdAt: Date.now(), read: false
         });
      }
    } catch (err) { console.error(err); }
  };

  const openFamilyShareModal = () => {
    setIsFamilyShareOpen(true);
  };

  const handleAddFamilyMember = () => {
    if (!newFamilyMemberName.trim()) return;
    const newMember = { id: Date.now().toString(), name: newFamilyMemberName, amount: 0, isMe: false };
    const updatedMembers = [...familyMembers, newMember];
    
    const splitAmount = totalCartPrice / updatedMembers.length;
    const balanced = updatedMembers.map(m => ({ ...m, amount: parseFloat(splitAmount.toFixed(2)) }));
    
    setFamilyMembers(balanced);
    setNewFamilyMemberName('');
  };

  const handleRemoveFamilyMember = (id) => {
    const filtered = familyMembers.filter(m => m.id !== id);
    const splitAmount = totalCartPrice / filtered.length;
    setFamilyMembers(filtered.map(m => ({ ...m, amount: parseFloat(splitAmount.toFixed(2)) })));
  };

  const handleCustomAmountChange = (id, newAmount) => {
    let val = parseFloat(newAmount) || 0;
    if (val > totalCartPrice) val = totalCartPrice;
    
    const updated = familyMembers.map(m => m.id === id ? { ...m, amount: val } : m);
    const othersTotal = updated.filter(m => m.id !== 'me').reduce((s, m) => s + m.amount, 0);
    const myNewAmount = Math.max(0, totalCartPrice - othersTotal);
    
    setFamilyMembers(updated.map(m => m.id === 'me' ? { ...m, amount: parseFloat(myNewAmount.toFixed(2)) } : m));
  };

  const confirmFamilyShare = () => {
    const code = `HZ-PAY-${Math.floor(Math.random()*9000)+1000}`;
    
    let textToCopy = `Huzur Bahçesi Ortak Ödeme Daveti!\nToplam Tutar: ${totalCartPrice.toFixed(2)} ₺\n\nPaylaşım Tablosu:\n`;
    familyMembers.forEach(m => {
       textToCopy += `- ${m.name}: ${m.amount.toFixed(2)} ₺\n`;
    });
    textToCopy += `\nÖdemeye katıl: https://huzurbahcesi.app/pay/${code}`;
    
    if (safeCopyToClipboard(textToCopy)) {
      setFamilyShareCopied(true);
      setTimeout(() => {
        setFamilyShareCopied(false);
        setIsFamilyShareOpen(false);
      }, 2500);
    }
  };

  const handleAdminSendCoupon = async (e) => {
    e.preventDefault();
    if (adminCouponTarget && adminCouponTarget !== 'ALL') {
      if (adminCouponTarget.id.startsWith('U-')) {
        setAdminStatusMsg({ type: 'success', text: `${adminCouponTarget.name} demo kullanıcısı olduğu için işlem simüle edildi.` });
      } else {
        try {
          await addDoc(collection(db, 'artifacts', appId, 'users', adminCouponTarget.id, 'coupons'), {
            code: adminCouponData.code, title: adminCouponData.title, desc: 'Yönetici tarafından tanımlandı.', type: adminCouponData.type, value: parseFloat(adminCouponData.value), validUntil: '31.12.2026', used: false
          });
          await addDoc(collection(db, 'artifacts', appId, 'users', adminCouponTarget.id, 'notifications'), {
            title: '🎁 Yeni İndirim Kuponu!', message: `Hesabınıza "${adminCouponData.code}" kodlu yeni bir kupon tanımlandı.`, createdAt: Date.now(), read: false
          });
          setAdminStatusMsg({ type: 'success', text: `${adminCouponTarget.name} adlı kullanıcıya kupon başarıyla tanımlandı!` });
        } catch (err) { console.error(err); }
      }
    } else {
      const realUsers = combinedUsersList.filter(u => !u.id.startsWith('U-'));
      if (realUsers.length > 0) {
         realUsers.forEach(async (ru) => {
            try {
              await addDoc(collection(db, 'artifacts', appId, 'users', ru.id, 'coupons'), {
                code: adminCouponData.code, title: adminCouponData.title, desc: 'Yönetici tarafından tanımlandı.', type: adminCouponData.type, value: parseFloat(adminCouponData.value), validUntil: '31.12.2026', used: false
              });
              await addDoc(collection(db, 'artifacts', appId, 'users', ru.id, 'notifications'), {
                title: '🎁 Yeni İndirim Kuponu!', message: `Hesabınıza "${adminCouponData.code}" kodlu yeni bir kupon tanımlandı.`, createdAt: Date.now(), read: false
              });
            } catch(err) {}
         });
         setAdminStatusMsg({ type: 'success', text: `Sistemdeki tüm gerçek müşterilere (${realUsers.length} kişi) kupon tanımlandı!` });
      } else {
         setAdminStatusMsg({ type: 'success', text: `Gerçek müşteri olmadığı için kupon kendinize (Demo) tanımlandı.` });
         if (user) {
           try {
             await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'coupons'), {
               code: adminCouponData.code, title: adminCouponData.title, desc: 'Yönetici tarafından tanımlandı.', type: adminCouponData.type, value: parseFloat(adminCouponData.value), validUntil: '31.12.2026', used: false
             });
             await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'notifications'), {
                title: '🎁 Yeni İndirim Kuponu!', message: `Hesabınıza "${adminCouponData.code}" kodlu yeni bir kupon tanımlandı.`, createdAt: Date.now(), read: false
             });
           } catch(err) {}
         }
      }
    }
    setIsAdminCouponModalOpen(false);
    setAdminCouponData({ code: '', value: 50, type: 'fixed', title: 'Özel İndirim' });
    setTimeout(() => setAdminStatusMsg({ type: '', text: '' }), 4000);
  };

  const handleVendorOnboardingSubmit = async (e) => {
    e.preventDefault();
    if(!user) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'vendor_applications'), {
        ...vendorApplicationData, userId: user.uid, status: 'Bekliyor', createdAt: Date.now()
      });
      alert('Satıcı başvurunuz başarıyla alındı. Yönetici onayından sonra bilgilendirileceksiniz.');
      setViewMode('customer');
    } catch(e) { console.error(e); }
  };

  const handleCheckout = async () => {
    if (!user || !selectedRelative || isCheckingOut) return;
    setCheckoutError('');
    setIsCheckingOut(true);

    try {
      if (paymentMethod === 'iyzico') {
        // ── Güvenli ödeme: kart bilgileri hiçbir zaman Firestore'a gitmez ──
        // Tüm doğrulama ve ödeme Cloud Function'da gerçekleşir.
        const [expireMonth, expireYear] = cardExpiry.split('/').map(s => s.trim());
        const createIyzicoPayment = httpsCallable(functions, 'createIyzicoPayment');
        const result = await createIyzicoPayment({
          cardHolder,
          cardNumber:  cardNumber.replace(/\s/g, ''),
          expireMonth,
          expireYear,
          cvc:         cardCvc,
          cart,
          relativeName:      selectedRelative.name,
          relativeCemetery:  selectedRelative.cemetery,
          liveVideoRequested: liveVideo,
          coupon:    appliedCoupon || null,
          usePoints,
          userPoints: huzurPoints,
        });

        if (!result.data.success) {
          setCheckoutError('Ödeme başarısız. Lütfen kart bilgilerinizi kontrol edin.');
          return;
        }
      } else {
        // ── Havale / EFT: doğrudan Firestore yazısı (güvenli – iyzico yok) ──
        const orderNo = `HZ-${Math.floor(Math.random() * 90000) + 10000}`;
        const orderRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), {
          orderNumber:       orderNo,
          userId:            user.uid,
          userName:          user.displayName || 'Üye',
          userEmail:         user.email || 'E-posta Gizli',
          date:              new Date().toLocaleDateString('tr-TR'),
          items:             cart,
          total:             totalCartPrice,
          status:            'Ödeme Onayı Bekliyor',
          relativeName:      selectedRelative.name,
          relativeCemetery:  selectedRelative.cemetery,
          liveVideoRequested: liveVideo,
          paymentMethod:     'transfer',
          messages:          [],
          createdAt:         Date.now(),
        });

        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'notifications'), {
          title:     'Sipariş Alındı',
          message:   `${orderNo} numaralı siparişiniz başarıyla oluşturuldu. Satıcı onayı bekleniyor.`,
          createdAt: Date.now(),
          read:      false,
          orderId:   orderRef.id,
        });

        if (appliedCoupon && appliedCoupon.id) {
          try { await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'coupons', appliedCoupon.id), { used: true }); } catch (_) {}
        }
      }

      if (usePoints) setHuzurPoints(0);
      setCart([]); setLiveVideo(false); setOrderPlaced(true); setAppliedCoupon(null);
      setCardHolder(''); setCardNumber(''); setCardExpiry(''); setCardCvc('');
      setTimeout(() => { setOrderPlaced(false); setIsCartOpen(false); }, 4000);
    } catch (err) {
      console.error(err);
      setCheckoutError(err?.message || 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const markNotificationsAsRead = async () => {
    if(!user) return;
    setIsNotificationsOpen(!isNotificationsOpen);
    const unread = notifications.filter(n => !n.read);
    unread.forEach(async (n) => {
      try { await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'notifications', n.id), { read: true }); } catch(e) {}
    });
  };

  const handleNotificationClick = (notif) => {
    if (notif.orderId) {
      const targetOrder = orders.find(o => o.id === notif.orderId);
      if (targetOrder) {
        setChatOrder(targetOrder);
        setIsNotificationsOpen(false);
      }
    }
  };

  const handleSendMessage = async (senderRole) => {
    if (!chatMessage.trim() || !chatOrder) return;
    try {
      const newMessage = { sender: senderRole, text: chatMessage, timestamp: Date.now() };
      const updatedMessages = [...(chatOrder.messages || []), newMessage];
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', chatOrder.id), { messages: updatedMessages });
      
      if (senderRole === 'vendor') {
        await addDoc(collection(db, 'artifacts', appId, 'users', chatOrder.userId, 'notifications'), {
          title: 'Yeni Mesajınız Var', message: `${chatOrder.orderNumber} numaralı siparişiniz için satıcı bir mesaj gönderdi.`, createdAt: Date.now(), read: false, orderId: chatOrder.id
        });
      }
      setChatMessage('');
    } catch (e) { console.error(e); }
  };

  const handleSubmitReview = async () => {
    if (!reviewOrder || reviewRating === 0) return;
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', reviewOrder.id), {
        rating: reviewRating,
        reviewText: reviewText
      });
      setReviewOrder(null);
      setReviewRating(0);
      setReviewText('');
    } catch (e) { console.error(e); }
  };

  const handleCustomerDisputeSubmit = async (e) => {
    e.preventDefault();
    if (!disputeOrder || !disputeReason.trim()) return;
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', disputeOrder.id), { 
        status: 'Revize İstenildi', 
        revisionNote: disputeReason 
      });
      
      await addDoc(collection(db, 'artifacts', appId, 'users', disputeOrder.vendorId || 'v1', 'notifications'), {
        title: 'Revize Talebi Geldi ⚠️', message: `${disputeOrder.orderNumber} numaralı işlem için müşteri revize talep etti. Lütfen eksiklikleri giderip yeni rapor sunun.`, createdAt: Date.now(), read: false, orderId: disputeOrder.id
      });

      setDisputeOrder(null);
      setDisputeReason('');
      alert('Revize talebiniz satıcıya başarıyla iletildi. Satıcı işlemi düzeltip yeni bir rapor sunacaktır.');
    } catch (e) { console.error(e); }
  };

  const handleAdminResolveDispute = async (orderId, resolution, orderNo) => {
    if (!user) return;
    const newStatus = resolution === 'refund' ? 'İade Edildi' : 'Tamamlandı';
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId), { status: newStatus });
      alert(`${orderNo} numaralı anlaşmazlık çözüldü. Yeni durum: ${newStatus}`);
    } catch (e) { console.error(e); }
  };

  const handleCustomerApproveOrder = async (orderId, orderNo, isAuto = false) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId), { status: 'Tamamlandı' });
      if (!isAuto) {
        alert('Rapor başarıyla onaylandı. İyzico havuzundaki ödeme satıcıya aktarılacaktır. Teşekkür ederiz.');
      } else {
         await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'notifications'), {
           title: 'Otomatik Onay Gerçekleşti ⏳', message: `${orderNo} numaralı işleminizin 15 dakikalık onay süresi dolduğu için sistem tarafından otomatik olarak onaylanmıştır.`, createdAt: Date.now(), read: false, orderId: orderId
         });
      }
    } catch (e) { console.error(e); }
  };

  const toggleAudio = (id, audioUrl) => {
    if (playingPrayerId === id) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setPlayingPrayerId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.play().catch(e => {
        console.error("Ses çalınamadı", e);
        alert("Ses dosyası çalınamadı. Lütfen internet bağlantınızı kontrol edin.");
      });
      setPlayingPrayerId(id);
      audio.onended = () => setPlayingPrayerId(null);
    }
  };

  const handleOrientation = (event) => {
    let alpha = event.webkitCompassHeading || Math.abs(event.alpha - 360);
    if(alpha) setCompassHeading(alpha);
  };

  const startCompass = () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
            setCompassActive(true);
          } else {
            alert("Pusula izni reddedildi. Lütfen ayarlarınızdan izin verin.");
          }
        })
        .catch((e) => console.error(e));
    } else {
      window.addEventListener('deviceorientationabsolute', handleOrientation);
      window.addEventListener('deviceorientation', handleOrientation);
      setCompassActive(true);
    }
  };

  const handleVendorUpdateStatus = async (orderId, customerId, orderNo, newStatus) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId), { status: newStatus });
      await addDoc(collection(db, 'artifacts', appId, 'users', customerId, 'notifications'), {
        title: 'Sipariş Durumu Güncellendi', message: `${orderNo} numaralı siparişinizin durumu "${newStatus}" olarak güncellendi.`, createdAt: Date.now(), read: false, orderId: orderId
      });
    } catch (err) { console.error(err); }
  };

  const handleVendorVerifyLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => setVendorLocationVerified(true),
        (error) => setVendorLocationVerified(true) 
      );
    } else {
      setVendorLocationVerified(true);
    }
  };

  const handleVendorCompleteOrder = async (order) => {
    if (!user) return;
    try {
      const finalBefore = vendorOrderImageBefore || order.beforeImage || 'https://images.unsplash.com/photo-1416879598555-220b3cc5fa70?auto=format&fit=crop&q=80&w=300';
      const finalAfter = vendorOrderImageAfter || order.afterImage || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=300';

      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', order.id), { 
        status: 'Müşteri Onayı Bekliyor',
        beforeImage: finalBefore,
        afterImage: finalAfter,
        reportSubmittedAt: Date.now() 
      });
      await addDoc(collection(db, 'artifacts', appId, 'users', order.userId, 'notifications'), {
        title: 'İşlem Raporu İletildi! 📋', message: `${order.orderNumber} numaralı işlem tamamlandı. 15 dakika içinde raporu inceleyerek onaylayabilir veya revize isteyebilirsiniz.`, createdAt: Date.now(), read: false, orderId: order.id
      });
      setActiveVendorOrderId(null); 
      setVendorOrderImageBefore(''); 
      setVendorOrderImageAfter('');
      setVendorLocationVerified(false);
    } catch (err) { console.error(err); }
  };

  const handleImageUpload = (e, setImage) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800; // Genişliği 800px ile sınırla
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          setImage(canvas.toDataURL('image/jpeg', 0.7)); 
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const generatePDFReport = (order) => {
    if (!window.jspdf) {
      alert("Lütfen bekleyin, PDF modülü yükleniyor...");
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(22); doc.setTextColor(5, 150, 105); doc.text("Huzur Bahcesi - Bakim Raporu", 20, 20);
    doc.setFontSize(12); doc.setTextColor(100);
    doc.text(`Siparis No: ${order.orderNumber} | Tarih: ${order.date}`, 20, 35);
    doc.text(`Musteri: ${order.userName}`, 20, 42);
    doc.text(`Mezar: ${order.relativeCemetery} (${order.relativeName})`, 20, 49);
    doc.line(20, 55, 190, 55); doc.setFontSize(14); doc.setTextColor(0); doc.text("Hizmet Detaylari", 20, 65);
    order.items?.forEach((it, i) => doc.text(`- ${it.name}`, 25, 75 + (i * 7)));
    
    if (order.beforeImage && order.afterImage) {
      doc.text("Islem Oncesi:", 20, 100);
      doc.addImage(order.beforeImage, 'JPEG', 20, 105, 75, 75);
      doc.text("Islem Sonrasi:", 110, 100);
      doc.addImage(order.afterImage, 'JPEG', 110, 105, 75, 75);
      doc.setFontSize(12); doc.text("Sonuc: Basarili. Huzur Bahcesi'ni tercih ettiginiz icin tesekkur ederiz.", 20, 195);
    } else {
      doc.setFontSize(12); doc.text("Sonuc: Basarili. Huzur Bahcesi'ni tercih ettiginiz icin tesekkur ederiz.", 20, 150);
    }

    doc.save(`HuzurBahcesi_Rapor_${order.orderNumber}.pdf`);
  };

  const handleAddServiceSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
       const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'products'), {
         ...newServiceData,
         vendorId: 'v1', 
         price: parseFloat(newServiceData.price),
         createdAt: Date.now()
       });
       // OPTİMİZASYON: Yerel UI Güncellemesi
       setProducts([...products, { id: docRef.id, ...newServiceData, vendorId: 'v1', price: parseFloat(newServiceData.price), createdAt: Date.now() }]);

       setVendorStatusMsg({ type: 'success', text: 'Yeni hizmet vitrinize başarıyla eklendi!' });
       setIsAddServiceOpen(false);
       setNewServiceData({ name: '', desc: '', price: '', image: '', category: 'Bakım' });
       setTimeout(() => setVendorStatusMsg({ type: '', text: '' }), 3000);
    } catch (e) { console.error(e); }
  };

  const handleAddReferenceSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
       const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'references'), {
         ...newReferenceData,
         vendorId: 'v1',
         createdAt: Date.now()
       });
       // OPTİMİZASYON: Yerel UI Güncellemesi
       setVendorGallery([...vendorGallery, { id: docRef.id, ...newReferenceData, vendorId: 'v1', createdAt: Date.now() }]);

       setVendorStatusMsg({ type: 'success', text: 'Yeni referans çalışmanız portfolyoya eklendi!' });
       setIsAddReferenceOpen(false);
       setNewReferenceData({ title: '', before: '', after: '' });
       setTimeout(() => setVendorStatusMsg({ type: '', text: '' }), 3000);
    } catch (e) { console.error(e); }
  };

  // --- TASARIM ---
  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>;

  // ==========================================
  // VENDOR ONBOARDING (KAYIT) GÖRÜNÜMÜ
  // ==========================================
  if (viewMode === 'vendor_onboarding') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans animate-in fade-in">
        <div className="bg-white rounded-[44px] w-full max-w-2xl p-10 shadow-2xl border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-emerald-800 uppercase tracking-tighter flex items-center gap-3"><Briefcase className="text-emerald-600"/> Kurumsal Satıcı Başvurusu</h2>
            <button onClick={() => setViewMode('customer')} className="text-gray-400 hover:text-red-500 bg-gray-50 p-2 rounded-2xl"><X/></button>
          </div>
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-3xl mb-8 flex gap-4">
            <Info className="text-blue-600 shrink-0"/>
            <p className="text-[11px] text-blue-800 font-bold leading-relaxed">Pazaryerimizde satıcı olabilmek için yasal bir şirket (Şahıs veya Limited) olmanız gerekmektedir. İyzico altyapısıyla çalışıyoruz.</p>
          </div>
          <form onSubmit={handleVendorOnboardingSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Şirket/Ticari Ünvan</label>
                <input required type="text" placeholder="Örn: Yeşil Vadi Peyzaj Ltd." value={vendorApplicationData.companyName} onChange={e=>setVendorApplicationData({...vendorApplicationData, companyName:e.target.value})} className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-xs outline-none focus:ring-2 ring-emerald-500"/>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Vergi Numarası / TCKN</label>
                <input required type="text" placeholder="Vergi No" value={vendorApplicationData.taxNumber} onChange={e=>setVendorApplicationData({...vendorApplicationData, taxNumber:e.target.value})} className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-xs outline-none focus:ring-2 ring-emerald-500"/>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Kurumsal İletişim Numarası</label>
              <input required type="tel" placeholder="0850 XXX XX XX" value={vendorApplicationData.phone} onChange={e=>setVendorApplicationData({...vendorApplicationData, phone:e.target.value})} className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-xs outline-none focus:ring-2 ring-emerald-500"/>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">İban Numarası (Hakedişler İçin)</label>
              <input required type="text" placeholder="TR00 0000..." value={vendorApplicationData.iban} onChange={e=>setVendorApplicationData({...vendorApplicationData, iban:e.target.value})} className="w-full bg-gray-50 p-4 rounded-2xl font-mono text-xs font-bold outline-none focus:ring-2 ring-emerald-500"/>
            </div>
            <div className="bg-gray-50 p-6 rounded-3xl border-2 border-dashed border-gray-200">
               <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-3 flex items-center gap-2"><FileSignature size={14}/> Vergi Levhası Yükle</label>
               <label className="w-full h-20 bg-white border border-gray-200 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-emerald-50 transition-colors relative overflow-hidden">
                  {vendorApplicationData.documentImage ? <><img src={vendorApplicationData.documentImage} className="absolute inset-0 w-full h-full object-cover opacity-30"/><span className="text-xs font-bold text-emerald-600 relative z-10">✓ Belge Eklendi</span></> : <><Upload className="w-4 h-4 text-gray-400 mr-2"/><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Görsel Seç</span></>}
                  <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={e => handleImageUpload(e, (img) => setVendorApplicationData({...vendorApplicationData, documentImage: img}))}/>
               </label>
            </div>
            <button type="submit" className="w-full bg-emerald-600 text-white font-black py-5 rounded-[24px] shadow-xl hover:bg-emerald-700 transition uppercase tracking-widest">Başvuruyu Gönder</button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // YÖNETİCİ (ADMIN) PANELİ GÖRÜNÜMÜ
  // ==========================================
  if (viewMode === 'admin' && isAdmin) {
    const totalRevenue = allOrders.reduce((sum, o) => sum + o.total, 0);
    const escrowBalance = allOrders.filter(o => o.status !== 'Tamamlandı' && o.status !== 'İade Edildi').reduce((sum, o) => sum + o.total, 0);
    
    return (
      <div className="min-h-screen bg-gray-100 flex font-sans">
        {/* Sol Menü (Sidebar) */}
        <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex">
           <div className="p-6 border-b border-slate-800 flex items-center gap-3 text-white">
              <div className="bg-emerald-500 p-2 rounded-lg"><Activity className="w-5 h-5"/></div>
              <h1 className="font-black text-lg tracking-tight">Sistem Admin</h1>
           </div>
           <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              <button onClick={() => setAdminTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-colors ${adminTab === 'dashboard' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}><LayoutDashboard className="w-4 h-4"/> Dashboard</button>
              <button onClick={() => setAdminTab('finance')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-colors ${adminTab === 'finance' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}><WalletCards className="w-4 h-4"/> Hakedişler (İyzico)</button>
              <button onClick={() => setAdminTab('disputes')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-colors ${adminTab === 'disputes' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}><Scale className="w-4 h-4"/> Revize Takibi</button>
              <button onClick={() => setAdminTab('orders')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-colors ${adminTab === 'orders' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}><Receipt className="w-4 h-4"/> Siparişler</button>
              <button onClick={() => setAdminTab('applications')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-colors ${adminTab === 'applications' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}><Briefcase className="w-4 h-4"/> Satıcı Başvuruları</button>
              <button onClick={() => setAdminTab('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-colors ${adminTab === 'users' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}><Users className="w-4 h-4"/> Müşteriler (CRM)</button>
           </nav>
           <div className="p-4 border-t border-slate-800">
              <button onClick={() => setViewMode('customer')} className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition"><LogOut className="w-4 h-4"/> Siteye Dön</button>
           </div>
        </aside>

        {/* Ana İçerik Alanı */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
           <header className="bg-white px-8 py-5 flex justify-between items-center shadow-sm z-10 border-b border-gray-100">
             <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest">{adminTab === 'dashboard' ? 'Genel Bakış' : adminTab === 'finance' ? 'Pazaryeri Finans Havuzu' : adminTab === 'disputes' ? 'Revize Takip Merkezi' : adminTab === 'applications' ? 'Satıcı Başvuruları' : 'Yönetim'}</h2>
             <div className="flex items-center gap-4">
               <div className="relative hidden sm:block">
                 <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400"/>
                 <input type="text" placeholder="ID veya İsim ara..." className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 w-64 transition-all"/>
               </div>
               
               <div className="relative">
                 <button onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)} className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-black shadow-sm hover:ring-2 hover:ring-emerald-500 transition-all focus:outline-none">
                   AD
                 </button>

                 {isAdminMenuOpen && (
                   <>
                     <div className="fixed inset-0 z-40" onClick={() => setIsAdminMenuOpen(false)}></div>
                     <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                        <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                           <p className="text-xs font-black text-slate-800">Sistem Yöneticisi</p>
                           <p className="text-[10px] font-bold text-slate-400">admin@huzurbahcesi.app</p>
                        </div>
                        <div className="p-2 flex flex-col">
                           <button onClick={() => { setIsAdminMenuOpen(false); alert('Yönetici ayarları paneline hoş geldiniz. (Demo)'); }} className="w-full text-left px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-emerald-600 rounded-xl transition flex items-center gap-2"><Settings className="w-4 h-4"/> Yönetici Ayarları</button>
                           <button onClick={() => { setIsAdminMenuOpen(false); setViewMode('customer'); }} className="w-full text-left px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition flex items-center gap-2"><Store className="w-4 h-4"/> Müşteri Görünümü</button>
                        </div>
                        <div className="p-2 border-t border-slate-50">
                           <button onClick={() => { setIsAdminMenuOpen(false); handleLogout(); }} className="w-full text-left px-3 py-2 text-xs font-black text-red-500 hover:bg-red-50 rounded-xl transition flex items-center gap-2"><LogOut className="w-4 h-4"/> Güvenli Çıkış</button>
                        </div>
                     </div>
                   </>
                 )}
               </div>
             </div>
           </header>

           <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
              {adminStatusMsg.text && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in-95 mb-6 ${adminStatusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                  <CheckCircle className="w-5 h-5"/>
                  <span className="text-xs font-black uppercase tracking-widest">{adminStatusMsg.text}</span>
                </div>
              )}
              {adminTab === 'dashboard' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                     <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                       <div className="flex justify-between items-start mb-4"><div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><BarChart3 className="w-6 h-6"/></div><span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">+12%</span></div>
                       <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sistemdeki Toplam Ciro</h3>
                       <div className="text-3xl font-black text-slate-800">{totalRevenue.toLocaleString('tr-TR')} ₺</div>
                     </div>
                     <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                       <div className="flex justify-between items-start mb-4"><div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Receipt className="w-6 h-6"/></div></div>
                       <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Aktif Siparişler</h3>
                       <div className="text-3xl font-black text-slate-800">{activeOrdersCount}</div>
                     </div>
                     <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                       <div className="flex justify-between items-start mb-4"><div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Store className="w-6 h-6"/></div></div>
                       <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kayıtlı Taşeron / Satıcı</h3>
                       <div className="text-3xl font-black text-slate-800">{vendors.length}</div>
                     </div>
                     <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                       <div className="flex justify-between items-start mb-4"><div className="p-3 bg-orange-50 text-orange-600 rounded-2xl"><Users className="w-6 h-6"/></div></div>
                       <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kayıtlı Müşteri</h3>
                       <div className="text-3xl font-black text-slate-800">{combinedUsersList.length}</div>
                     </div>
                  </div>

                  <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                     <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-black text-slate-800">Son Sistem İşlemleri</h3>
                        <button onClick={() => setAdminTab('orders')} className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline">Tümünü Gör</button>
                     </div>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                           <thead>
                             <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                               <th className="p-4">Sipariş No</th>
                               <th className="p-4">Müşteri</th>
                               <th className="p-4">Hizmet Noktası</th>
                               <th className="p-4">Tutar</th>
                               <th className="p-4">Durum</th>
                             </tr>
                           </thead>
                           <tbody className="text-xs font-bold text-slate-700">
                             {allOrders.slice(0, 5).map(o => (
                               <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                 <td className="p-4 font-mono">{o.orderNumber}</td>
                                 <td className="p-4">{o.userName}</td>
                                 <td className="p-4 text-slate-500 truncate max-w-[150px]">{o.relativeCemetery}</td>
                                 <td className="p-4 text-emerald-600">{o.total} ₺</td>
                                 <td className="p-4"><span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${o.status === 'Tamamlandı' ? 'bg-emerald-100 text-emerald-700' : o.status === 'İşlemde' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>{o.status}</span></td>
                               </tr>
                             ))}
                             {allOrders.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-slate-400">Sistemde henüz sipariş bulunmuyor.</td></tr>}
                           </tbody>
                        </table>
                     </div>
                  </div>
                </div>
              )}

              {adminTab === 'finance' && (
                <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden animate-in fade-in">
                   <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-emerald-900 to-emerald-700 text-white flex justify-between items-center">
                      <div>
                        <h3 className="font-black text-xl flex items-center gap-2 uppercase tracking-widest"><ShieldCheck/> İyzico Pazaryeri Havuzu</h3>
                        <p className="text-xs font-bold text-emerald-200 mt-2">Müşterinin ödediği para iş bitene kadar bu havuzda (Escrow) güvende tutulur.</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest mb-1">Havuzdaki Toplam Bloke</p>
                         <h2 className="text-4xl font-black">{escrowBalance.toLocaleString('tr-TR')} ₺</h2>
                      </div>
                   </div>
                   <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <th className="p-4">İşlem / Sipariş No</th>
                          <th className="p-4">Satıcı (Taşeron)</th>
                          <th className="p-4">Tutar</th>
                          <th className="p-4">Havuz Durumu</th>
                          <th className="p-4 text-right">Aksiyon</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs font-bold text-slate-700">
                        {allOrders.map(o => (
                          <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50">
                            <td className="p-4 font-mono">{o.orderNumber}</td>
                            <td className="p-4">{o.vendorId === 'v3' ? 'Aktaş Mermer' : 'Huzur Mezar Bakım'} <span className="block text-[9px] text-slate-400">TR00 0001 ...</span></td>
                            <td className="p-4 text-emerald-600">{o.total} ₺</td>
                            <td className="p-4">
                              {o.status === 'Tamamlandı' 
                                ? <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[9px] uppercase">SATICIYA AKTARILDI</span>
                                : <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-[9px] uppercase">HAVUZDA BLOKELİ</span>}
                            </td>
                            <td className="p-4 text-right">
                              {o.status === 'Tamamlandı' ? (
                                <button disabled className="text-[9px] font-black bg-gray-100 text-gray-400 px-3 py-2 rounded-xl">Ödendi</button>
                              ) : (
                                <button className="text-[9px] font-black bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-xl transition shadow-sm">Bekliyor</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
              )}

              {adminTab === 'disputes' && (
                <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden animate-in fade-in">
                   <div className="p-8 border-b border-slate-100 bg-orange-50 flex justify-between items-center">
                      <div>
                        <h3 className="font-black text-xl flex items-center gap-2 uppercase tracking-widest text-orange-800"><Scale/> Revize Takibi</h3>
                        <p className="text-xs font-bold text-orange-600 mt-2">Müşterilerin 15 dakikalık süre içinde talep ettiği revizeleri (yeniden işlem) buradan takip edebilirsiniz.</p>
                      </div>
                   </div>
                   <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <th className="p-4">Sipariş No</th>
                          <th className="p-4">Müşteri</th>
                          <th className="p-4">Revize Notu</th>
                          <th className="p-4">Tutar</th>
                          <th className="p-4 text-right">Durum</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs font-bold text-slate-700">
                        {allOrders.filter(o => o.status === 'Revize İstenildi').length === 0 ? (
                          <tr><td colSpan="5" className="p-12 text-center text-gray-400 uppercase font-black text-sm">Aktif revize talebi bulunmuyor.</td></tr>
                        ) : (
                          allOrders.filter(o => o.status === 'Revize İstenildi').map(o => (
                            <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50">
                              <td className="p-4 font-mono">{o.orderNumber}</td>
                              <td className="p-4">{o.userName}</td>
                              <td className="p-4 text-orange-500 italic max-w-xs truncate" title={o.revisionNote}>"{o.revisionNote}"</td>
                              <td className="p-4 font-black">{o.total} ₺</td>
                              <td className="p-4 text-right">
                                <span className="text-[9px] font-black bg-orange-100 text-orange-700 px-3 py-2 rounded-xl uppercase tracking-widest">Satıcıdan Bekleniyor</span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                   </table>
                </div>
              )}

              {adminTab === 'orders' && (
                <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden animate-in fade-in">
                   <div className="p-6 border-b border-slate-100">
                      <h3 className="font-black text-slate-800">Merkezi Sipariş Yönetimi</h3>
                   </div>
                   <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                         <thead>
                           <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                             <th className="p-4">Sipariş No</th>
                             <th className="p-4">Müşteri / Alıcı</th>
                             <th className="p-4">İşlem Görülen Yakın</th>
                             <th className="p-4">Tutar</th>
                             <th className="p-4">Güncel Durum</th>
                             <th className="p-4 text-right">Aksiyon (Admin)</th>
                           </tr>
                         </thead>
                         <tbody className="text-xs font-bold text-slate-700">
                           {allOrders.map(o => (
                             <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                               <td className="p-4 font-mono">{o.orderNumber}</td>
                               <td className="p-4">{o.userName}</td>
                               <td className="p-4 text-slate-500">{o.relativeName} <span className="block text-[9px] text-slate-400">{o.relativeCemetery}</span></td>
                               <td className="p-4 text-emerald-600">{o.total} ₺</td>
                               <td className="p-4"><span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${o.status === 'Tamamlandı' ? 'bg-emerald-100 text-emerald-700' : o.status === 'İşlemde' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>{o.status}</span></td>
                               <td className="p-4 text-right">
                                 <button className="text-[9px] font-black bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-xl transition shadow-sm">İptal / İade Et</button>
                               </td>
                             </tr>
                           ))}
                         </tbody>
                      </table>
                   </div>
                </div>
              )}

              {adminTab === 'applications' && (
                <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden animate-in fade-in">
                   <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                      <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest"><Briefcase className="w-5 h-5 text-emerald-600"/> Onay Bekleyen Satıcılar</h3>
                   </div>
                   <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                          <th className="p-4 pl-6">Şirket Ünvanı</th>
                          <th className="p-4">Vergi No</th>
                          <th className="p-4">İletişim</th>
                          <th className="p-4">Durum</th>
                          <th className="p-4 text-right pr-6">Karar</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs font-bold text-slate-700">
                        {[...mockVendorApplications, ...vendorApplications].map(a => (
                          <tr key={a.id} className="border-b border-slate-50">
                            <td className="p-4 pl-6">
                              {a.companyName}
                              <div className="mt-1">
                                {a.documentImage ? (
                                  <button onClick={() => setDocumentModalOpen(a.documentImage)} className="text-[9px] text-blue-500 font-black uppercase tracking-widest flex items-center gap-1 hover:underline"><FileSignature size={12}/> Evrakı Gör</button>
                                ) : (
                                  <span className="text-[9px] text-slate-400 uppercase tracking-widest">Evrak Yok</span>
                                )}
                              </div>
                            </td>
                            <td className="p-4 font-mono">{a.taxNumber}</td>
                            <td className="p-4">{a.phone}</td>
                            <td className="p-4"><span className="bg-orange-50 text-orange-600 px-2.5 py-1 rounded-md text-[9px] font-black uppercase">{a.status}</span></td>
                            <td className="p-4 text-right pr-6 space-x-2">
                              <button className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-2 rounded-xl hover:bg-emerald-100 uppercase">Onayla</button>
                              <button className="bg-red-50 text-red-600 text-[10px] font-black px-3 py-2 rounded-xl hover:bg-red-100 uppercase">Reddet</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
              )}

              {adminTab === 'users' && (
                <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden animate-in fade-in">
                   <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <div>
                        <h3 className="font-black text-slate-800 flex items-center gap-2"><Users className="w-5 h-5 text-emerald-600"/> Müşteri Veritabanı (CRM)</h3>
                        <p className="text-[10px] text-slate-500 font-bold mt-1">Sisteme kayıtlı tüm kullanıcıları ve harcama istatistiklerini buradan yönetebilirsiniz.</p>
                      </div>
                      <button onClick={() => { setAdminCouponTarget('ALL'); setIsAdminCouponModalOpen(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-md transition-colors flex items-center gap-2">
                        <Ticket className="w-4 h-4"/> Toplu Kupon Tanımla
                      </button>
                   </div>
                   <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                         <thead>
                           <tr className="bg-white text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                             <th className="p-4 pl-6">Müşteri Detayları</th>
                             <th className="p-4">Kayıt Tarihi</th>
                             <th className="p-4">Toplam Sipariş</th>
                             <th className="p-4">Toplam Harcama</th>
                             <th className="p-4">Durum</th>
                             <th className="p-4 text-right pr-6">Aksiyonlar</th>
                           </tr>
                         </thead>
                         <tbody className="text-xs font-bold text-slate-700">
                           {combinedUsersList.map((u, idx) => (
                             <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                               <td className="p-4 pl-6">
                                 <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-black text-sm">{u.name.charAt(0)}</div>
                                   <div>
                                      <div className="font-black text-slate-800">{u.name}</div>
                                      <div className="text-[10px] text-slate-500 font-medium flex items-center gap-2 mt-0.5"><Mail className="w-3 h-3"/> {u.email}</div>
                                   </div>
                                 </div>
                               </td>
                               <td className="p-4 text-slate-500 font-medium">{u.joinDate}</td>
                               <td className="p-4">
                                 {u.totalOrders > 0 ? (
                                   <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-[10px]">{u.totalOrders} Sipariş</span>
                                 ) : (
                                   <span className="text-slate-400 text-[10px]">Sipariş Yok</span>
                                 )}
                               </td>
                               <td className="p-4 text-emerald-600 text-sm">{u.totalSpent > 0 ? `${u.totalSpent} ₺` : '-'}</td>
                               <td className="p-4">
                                 <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${u.status === 'Aktif' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                                   {u.status}
                                 </span>
                               </td>
                               <td className="p-4 text-right pr-6 space-x-2">
                                 <button className="text-[10px] font-black bg-white hover:bg-slate-100 text-slate-600 px-3 py-2 rounded-xl transition shadow-sm border border-slate-200" title="Kupon Tanımla" onClick={() => { setAdminCouponTarget(u); setIsAdminCouponModalOpen(true); }}><Gift className="w-4 h-4"/></button>
                                 <button className="text-[10px] font-black bg-white hover:bg-slate-100 text-slate-600 px-3 py-2 rounded-xl transition shadow-sm border border-slate-200" title="Kullanıcı ID Kopyala" onClick={() => { if(safeCopyToClipboard(u.id)) alert('Kullanıcı ID kopyalandı!'); }}><Copy className="w-4 h-4"/></button>
                               </td>
                             </tr>
                           ))}
                         </tbody>
                      </table>
                   </div>
                </div>
              )}
           </div>

           {/* ADMIN CRM KUPON MODALI */}
           {isAdminCouponModalOpen && (
             <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95">
                   <div className="flex justify-between items-center mb-6">
                      <h3 className="font-black text-xl text-slate-800 flex items-center gap-2 uppercase tracking-tighter"><Ticket className="text-emerald-600"/> {adminCouponTarget === 'ALL' ? 'Toplu Kupon Tanımla' : 'Kupon Tanımla'}</h3>
                      <button onClick={() => setIsAdminCouponModalOpen(false)} className="text-gray-400 hover:bg-gray-100 p-2 rounded-xl transition"><X/></button>
                   </div>
                   
                   {adminCouponTarget && adminCouponTarget !== 'ALL' && (
                     <div className="bg-slate-50 p-4 rounded-2xl mb-6 flex items-center gap-3 border border-slate-100">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-black">{adminCouponTarget.name?.charAt(0)}</div>
                        <div>
                           <p className="font-black text-sm text-slate-800">{adminCouponTarget.name}</p>
                           <p className="text-[10px] text-slate-500 font-bold">{adminCouponTarget.email}</p>
                        </div>
                     </div>
                   )}
                   
                   <form onSubmit={handleAdminSendCoupon} className="space-y-4">
                      <div>
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Kupon Kodu</label>
                         <input required type="text" placeholder="Örn: OZEL100" value={adminCouponData.code} onChange={e => setAdminCouponData({...adminCouponData, code: e.target.value.toUpperCase()})} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-black uppercase outline-none focus:ring-2 focus:ring-emerald-500"/>
                      </div>
                      <div>
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Kampanya Başlığı</label>
                         <input required type="text" placeholder="Örn: Sadakat İndirimi" value={adminCouponData.title} onChange={e => setAdminCouponData({...adminCouponData, title: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 uppercase"/>
                      </div>
                      <div className="flex gap-4">
                         <div className="flex-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">İndirim Türü</label>
                            <select value={adminCouponData.type} onChange={e => setAdminCouponData({...adminCouponData, type: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500">
                               <option value="fixed">Sabit Tutar (₺)</option>
                               <option value="percent">Yüzde (%)</option>
                            </select>
                         </div>
                         <div className="flex-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Değer</label>
                            <input required type="number" value={adminCouponData.value} onChange={e => setAdminCouponData({...adminCouponData, value: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-black outline-none focus:ring-2 focus:ring-emerald-500"/>
                         </div>
                      </div>
                      <button type="submit" className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-emerald-700 transition mt-4 uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                        <Send size={16}/> {adminCouponTarget === 'ALL' ? 'Tümüne Gönder' : 'Kullanıcıya Tanımla'}
                      </button>
                   </form>
                </div>
             </div>
           )}

           {/* EVRAK GÖRÜNTÜLEME MODALI */}
           {documentModalOpen && (
             <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={() => setDocumentModalOpen(null)}>
               <div className="relative max-w-3xl w-full max-h-[90vh] flex flex-col items-center justify-center animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                 <button onClick={() => setDocumentModalOpen(null)} className="absolute -top-12 right-0 text-white hover:text-red-400 bg-white/20 p-2 rounded-full transition"><X size={24}/></button>
                 <img src={documentModalOpen} alt="Satıcı Evrakı" className="w-full h-auto max-h-[85vh] object-contain rounded-2xl shadow-2xl border-4 border-white"/>
               </div>
             </div>
           )}
        </main>
      </div>
    );
  }

  // ==========================================
  // VENDOR (SATICI) PANELİ GÖRÜNÜMÜ
  // ==========================================
  if (viewMode === 'vendor') {
    return (
      <div className="min-h-screen bg-gray-100 font-sans">
        <header className="bg-emerald-900 text-white p-4 sticky top-0 z-30 flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-2">
            <Store className="w-6 h-6 text-emerald-300" />
            <h1 className="font-bold">Satıcı İşlem Merkezi</h1>
          </div>
          <button onClick={() => setViewMode('customer')} className="text-xs font-black bg-emerald-800 hover:bg-emerald-700 px-4 py-2 rounded-xl transition border border-emerald-700 uppercase tracking-widest">Siteye Dön</button>
        </header>
        <main className="max-w-5xl mx-auto p-4 py-8 space-y-8 animate-in fade-in">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
             <div className="bg-gradient-to-br from-sky-400 to-blue-500 rounded-3xl p-6 shadow-lg text-white flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-80">Akıllı Hava Durumu API</h4>
                  <div className="text-2xl font-black mb-2 flex items-center gap-2">24°C Güneşli <CloudSun className="text-yellow-300"/></div>
                  <p className="text-xs font-medium leading-relaxed opacity-90 max-w-[300px]">Yarın bölgenizde hava güneşli olacak. Mermer cila ve peyzaj işleri için mükemmel bir gün.</p>
                </div>
             </div>
             <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 shadow-lg text-white flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-80">Rota Optimizasyonu (AI)</h4>
                  <div className="text-xl font-black mb-2 flex items-center gap-2">Zincirlikuyu Mezarlığı <Route className="text-indigo-200"/></div>
                  <p className="text-xs font-medium leading-relaxed opacity-90 mb-4 max-w-[300px]">Bu mezarlıkta aynı gün tamamlanması gereken 3 aktif işiniz tespit edildi.</p>
                  <button className="text-[10px] font-black bg-white text-indigo-700 px-4 py-2.5 rounded-xl uppercase tracking-widest shadow-sm hover:scale-105 transition-transform">En Kısa Rotayı Çiz</button>
                </div>
             </div>
          </div>

          {vendorStatusMsg.text && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in-95 ${vendorStatusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
              <CheckCircle className="w-5 h-5"/>
              <span className="text-xs font-black uppercase tracking-widest">{vendorStatusMsg.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">Aylık Kazanç</p>
              <h3 className="text-3xl font-black text-emerald-600">12.450 ₺</h3>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-5"><Zap className="w-32 h-32"/></div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">Bekleyen İşler</p>
              <h3 className="text-3xl font-black text-blue-600">{allOrders.filter(o => o.status !== 'Tamamlandı' && o.status !== 'İade Edildi').length} Sipariş</h3>
            </div>
            
            <button onClick={() => setIsAddServiceOpen(true)} className="bg-indigo-600 p-6 rounded-3xl shadow-lg text-white hover:bg-indigo-700 transition active:scale-95 flex flex-col justify-center items-center gap-2 group">
              <PlusCircle className="w-8 h-8 group-hover:rotate-90 transition-transform"/>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Hizmet Ekle</span>
            </button>

            <button onClick={() => setIsAddReferenceOpen(true)} className="bg-emerald-600 p-6 rounded-3xl shadow-lg text-white hover:bg-emerald-700 transition active:scale-95 flex flex-col justify-center items-center gap-2 group">
              <ImagePlusLucide className="w-8 h-8 group-hover:scale-110 transition-transform"/>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Referans Ekle</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm min-h-[400px]">
              <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-3 uppercase tracking-tighter"><Clock className="text-emerald-600"/> Aktif Siparişler</h2>
              <div className="space-y-6">
                {allOrders.filter(o => o.status !== 'Tamamlandı' && o.status !== 'İade Edildi').length === 0 ? (
                  <div className="p-10 border-2 border-dashed border-gray-200 rounded-3xl text-center flex flex-col items-center gap-4">
                    <Package className="w-12 h-12 text-gray-300"/>
                    <span className="text-gray-400 font-bold text-sm">Şu an atanmış sipariş bulunmuyor.</span>
                  </div>
                ) : (
                  allOrders.filter(o => o.status !== 'Tamamlandı' && o.status !== 'İade Edildi').map(o => (
                    <div key={o.id} className={`p-6 border rounded-[28px] relative ${o.status === 'Revize İstenildi' ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
                      {o.liveVideoRequested && <span className="absolute -top-3 -right-3 bg-blue-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 animate-pulse"><Video className="w-3 h-3"/> Canlı Yayın İsteniyor</span>}
                      
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-black text-gray-800 uppercase">{o.orderNumber}</span>
                          </div>
                          <div className="text-xs text-gray-500 font-medium flex items-center gap-2"><User className="w-3.5 h-3.5"/> Müşteri: {o.userName}</div>
                          <div className="text-xs text-gray-500 font-medium flex items-center gap-2 mt-1"><MapPin className="w-3.5 h-3.5"/> Konum: {o.relativeCemetery} ({o.relativeName})</div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          <div className="text-xl font-black text-emerald-600">{o.total} ₺</div>
                          <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${o.status === 'Revize İstenildi' ? 'bg-orange-100 text-orange-700' : o.status === 'Müşteri Onayı Bekliyor' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{o.status}</span>
                          <button onClick={() => setChatOrder(o)} className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-1 transition">
                            <MessageSquareText className="w-3.5 h-3.5"/> Müşteriyle Mesajlaş
                          </button>
                        </div>
                      </div>

                      {o.status === 'Revize İstenildi' && (
                        <div className="bg-white p-4 rounded-xl border border-orange-100 mb-4 shadow-sm animate-in fade-in">
                          <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1 flex items-center gap-1"><AlertTriangle size={14}/> Müşteri Revize Notu:</h4>
                          <p className="text-xs font-bold text-gray-700 italic">"{o.revisionNote}"</p>
                        </div>
                      )}
                      
                      <div className="flex gap-2 border-t border-gray-200 pt-4">
                        {(o.status === 'Ödeme Onayı Bekliyor' || o.status === 'Ödeme Havuzda') && (
                          <button onClick={() => handleVendorUpdateStatus(o.id, o.userId, o.orderNumber, 'İşlemde')} className="flex-1 bg-blue-600 text-white text-xs font-black py-3 rounded-xl shadow-lg hover:bg-blue-700 transition uppercase tracking-widest">İşi Üzerine Al</button>
                        )}
                        {(o.status === 'İşlemde' || o.status === 'Revize İstenildi') && activeVendorOrderId !== o.id && (
                          <button onClick={() => { setActiveVendorOrderId(o.id); setVendorLocationVerified(false); }} className="flex-1 bg-emerald-600 text-white text-xs font-black py-3 rounded-xl shadow-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2 uppercase tracking-widest"><Camera className="w-4 h-4"/> {o.status === 'Revize İstenildi' ? 'Revize Raporu Yükle' : 'Raporla ve Bitir'}</button>
                        )}
                      </div>

                      {(o.status === 'İşlemde' || o.status === 'Revize İstenildi') && activeVendorOrderId === o.id && (
                        <div className="mt-4 p-5 bg-white border border-emerald-100 rounded-2xl animate-in fade-in zoom-in-95">
                          <h4 className="text-xs font-black text-emerald-800 mb-4 flex items-center gap-2 uppercase tracking-widest"><ImageIcon className="w-4 h-4"/> Görsel İş Raporu Yükle</h4>
                          
                          <div className="grid grid-cols-2 gap-4 mb-5">
                            <label className="relative aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition overflow-hidden group">
                              {(vendorOrderImageBefore || o.beforeImage) ? (
                                <>
                                  <img src={vendorOrderImageBefore || o.beforeImage} className="absolute inset-0 w-full h-full object-cover" alt="Öncesi" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-black uppercase tracking-widest"><RefreshCw className="w-4 h-4 mr-1"/> Değiştir</div>
                                </>
                              ) : (
                                <>
                                  <Camera className="w-8 h-8 text-gray-300 mb-2 group-hover:scale-110 transition-transform" />
                                  <span className="text-[9px] font-black text-gray-400 text-center uppercase">Öncesi</span>
                                </>
                              )}
                              <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={(e) => handleImageUpload(e, setVendorOrderImageBefore)} />
                            </label>

                            <label className="relative aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition overflow-hidden group">
                              {(vendorOrderImageAfter) ? (
                                 <>
                                   <img src={vendorOrderImageAfter} className="absolute inset-0 w-full h-full object-cover" alt="Sonrası" />
                                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-black uppercase tracking-widest"><RefreshCw className="w-4 h-4 mr-1"/> Değiştir</div>
                                 </>
                              ) : (
                                <>
                                  <Camera className="w-8 h-8 text-gray-300 mb-2 group-hover:scale-110 transition-transform" />
                                  <span className="text-[9px] font-black text-gray-400 text-center uppercase">Sonrası {o.status === 'Revize İstenildi' && '(YENİ)'}</span>
                                </>
                              )}
                              <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={(e) => handleImageUpload(e, setVendorOrderImageAfter)} />
                            </label>
                          </div>

                          <div className="mb-5 border-t border-gray-100 pt-5">
                            {!vendorLocationVerified ? (
                              <button onClick={handleVendorVerifyLocation} className="w-full bg-blue-50 text-blue-600 font-black py-3.5 rounded-xl flex justify-center items-center gap-2 hover:bg-blue-100 transition shadow-sm border border-blue-100">
                                <MapPin className="w-5 h-5"/> Rapor İçin Konum Doğrula (Zorunlu)
                              </button>
                            ) : (
                              <div className="w-full bg-emerald-50 text-emerald-700 font-black py-3.5 rounded-xl flex justify-center items-center gap-2 border border-emerald-100 shadow-sm animate-in fade-in">
                                <ShieldCheck className="w-5 h-5"/> Konum Doğrulandı (Bölgedesiniz)
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                             <button onClick={() => { setActiveVendorOrderId(null); setVendorLocationVerified(false); }} className="flex-1 bg-gray-100 text-gray-600 text-xs font-black py-3 rounded-xl hover:bg-gray-200 transition">İptal</button>
                             <button onClick={() => handleVendorCompleteOrder(o)} disabled={!(vendorOrderImageBefore || o.beforeImage) || !vendorOrderImageAfter || !vendorLocationVerified} className="flex-[2] bg-emerald-600 disabled:bg-emerald-300 text-white text-xs font-black py-3 rounded-xl shadow-lg hover:bg-emerald-700 transition uppercase tracking-widest">Gönder & Onay Bekle</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-8">
               <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2"><Layers className="w-4 h-4 text-emerald-600"/> Mağaza Vitrinim</h3>
                  <div className="space-y-4">
                     {products.filter(p => p.vendorId === 'v1').slice(0, 3).map(p => (
                       <div key={p.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl group border border-transparent hover:border-emerald-100 transition">
                          <img src={p.image || 'https://via.placeholder.com/60'} className="w-12 h-12 rounded-xl object-cover shadow-sm"/>
                          <div className="flex-1 overflow-hidden">
                             <h4 className="text-[11px] font-black text-slate-800 truncate uppercase tracking-tighter">{p.name}</h4>
                             <div className="text-[10px] text-emerald-600 font-black">{p.price} ₺</div>
                          </div>
                          <button className="p-2 text-gray-300 hover:text-red-500 transition-colors" onClick={() => setProducts(products.filter(x => x.id !== p.id))}><Trash2 size={14}/></button>
                       </div>
                     ))}
                     <button onClick={() => setIsAddServiceOpen(true)} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-[10px] font-black text-gray-400 hover:bg-gray-50 uppercase tracking-widest transition">Hizmet Ekle</button>
                  </div>
               </div>

               <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2"><ImageIconLucide className="w-4 h-4 text-emerald-600"/> Referanslarım</h3>
                  <div className="grid grid-cols-2 gap-3">
                     {vendorGallery.filter(g => g.vendorId === 'v1').map(g => (
                       <div key={g.id} className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative group shadow-sm">
                          <img src={g.after} className="w-full h-full object-cover"/>
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                             <span className="text-[8px] font-black text-white text-center uppercase tracking-widest leading-tight">{g.title}</span>
                          </div>
                       </div>
                     ))}
                     <button onClick={() => setIsAddReferenceOpen(true)} className="aspect-square border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-300 hover:bg-gray-50 transition">
                        <Plus size={24}/>
                        <span className="text-[8px] font-black uppercase mt-1">Yükle</span>
                     </button>
                  </div>
               </div>
            </div>
          </div>
          
          {/* VENDOR CHAT MODAL */}
          {chatOrder && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-[32px] w-full max-w-md h-[500px] flex flex-col shadow-2xl animate-in zoom-in-95">
                <div className="p-5 border-b bg-emerald-600 text-white rounded-t-[32px] flex justify-between items-center">
                  <div>
                    <h3 className="font-black text-sm flex items-center gap-2 uppercase tracking-widest"><MessageSquareText className="w-4 h-4"/> Müşteri ile Görüşme</h3>
                    <p className="text-[10px] text-emerald-100 mt-1 opacity-90">{chatOrder.orderNumber} - {chatOrder.userName}</p>
                  </div>
                  <button onClick={() => setChatOrder(null)} className="p-2 bg-emerald-700 hover:bg-emerald-800 rounded-xl transition"><X className="w-4 h-4"/></button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3" ref={chatScrollRef}>
                   {(!chatOrder.messages || chatOrder.messages.length === 0) ? (
                     <div className="text-center text-xs text-gray-400 my-auto font-bold uppercase">Henüz mesaj yok. Müşteriye bilgi verebilirsiniz.</div>
                   ) : (
                     chatOrder.messages.map((m, i) => (
                       <div key={i} className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium shadow-sm ${m.sender === 'vendor' ? 'bg-emerald-600 text-white self-end rounded-br-none' : 'bg-white border border-gray-100 text-gray-700 self-start rounded-bl-none'}`}>
                         {m.text}
                       </div>
                     ))
                   )}
                </div>
                <div className="p-4 bg-white border-t rounded-b-[32px] flex gap-2">
                  <input type="text" value={chatMessage} onChange={e=>setChatMessage(e.target.value)} onKeyPress={e => e.key==='Enter' && handleSendMessage('vendor')} placeholder="Müşteriye mesaj yazın..." className="flex-1 bg-gray-100 border-none rounded-2xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-emerald-500"/>
                  <button onClick={() => handleSendMessage('vendor')} className="bg-emerald-600 text-white p-3 rounded-2xl shadow-md hover:bg-emerald-700 transition"><Send className="w-4 h-4"/></button>
                </div>
              </div>
            </div>
          )}
          
          {/* MODAL: HİZMET EKLEME */}
          {isAddServiceOpen && (
            <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
               <div className="bg-white rounded-[44px] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-8"><h3 className="font-black text-2xl text-emerald-800 tracking-tighter uppercase">Yeni Hizmet Tanımla</h3><button onClick={() => setIsAddServiceOpen(false)} className="bg-gray-50 p-2 rounded-2xl text-gray-400 hover:text-red-500 transition-colors"><X/></button></div>
                  <form onSubmit={handleAddServiceSubmit} className="space-y-4">
                     <div className="bg-gray-50 p-6 rounded-[28px] border border-gray-100 space-y-4">
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Hizmet Başlığı</label>
                          <input required placeholder="Örn: Mermer Parlatma & Cila" className="w-full bg-white p-4 rounded-2xl border-none font-bold text-xs outline-none focus:ring-2 ring-emerald-500 shadow-sm" value={newServiceData.name} onChange={e => setNewServiceData({...newServiceData, name: e.target.value})}/>
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Fiyat (₺)</label>
                          <div className="relative"><input required type="number" placeholder="0.00" className="w-full bg-white p-4 rounded-2xl border-none font-black text-sm outline-none focus:ring-2 ring-emerald-500 shadow-sm pl-10" value={newServiceData.price} onChange={e => setNewServiceData({...newServiceData, price: e.target.value})}/><Landmark className="absolute left-3.5 top-3.5 text-gray-300" size={18}/></div>
                        </div>
                        <div>
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Açıklama</label>
                           <textarea required placeholder="Müşteriye hizmetin detaylarını anlatın..." className="w-full bg-white p-4 rounded-2xl border-none font-bold text-xs h-24 resize-none outline-none focus:ring-2 ring-emerald-500 shadow-sm" value={newServiceData.desc} onChange={e => setNewServiceData({...newServiceData, desc: e.target.value})} />
                        </div>
                     </div>
                     <div className="bg-gray-50 p-5 rounded-[28px] border border-dashed border-gray-200">
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-3 flex items-center gap-2"><ImageIconLucide size={14}/> Vitrin Görseli</p>
                        <label className="w-full h-24 bg-white border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-all overflow-hidden relative group">
                          {newServiceData.image ? (
                            <img src={newServiceData.image} className="w-full h-full object-cover"/>
                          ) : (
                            <><Plus className="text-gray-300"/><span className="text-[10px] font-bold text-gray-400 ml-2 uppercase">Dosya Seç</span></>
                          )}
                          <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={(e) => handleImageUpload(e, (img) => setNewServiceData({...newServiceData, image: img}))}/>
                        </label>
                     </div>
                     <button type="submit" className="w-full bg-indigo-600 text-white p-5 rounded-[28px] font-black shadow-xl hover:bg-indigo-700 transition tracking-[0.2em] uppercase text-xs">Vitrinde Yayınla</button>
                  </form>
               </div>
            </div>
          )}

          {/* MODAL: REFERANS EKLEME (ÖNCESİ/SONRASI) */}
          {isAddReferenceOpen && (
            <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
               <div className="bg-white rounded-[44px] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-8"><h3 className="font-black text-2xl text-emerald-800 tracking-tighter uppercase">Portfolyoya İş Ekle</h3><button onClick={() => setIsAddReferenceOpen(false)} className="bg-gray-50 p-2 rounded-2xl text-gray-400 hover:text-red-500 transition-colors"><X/></button></div>
                  <form onSubmit={handleAddReferenceSubmit} className="space-y-4">
                     <input required placeholder="Çalışma Başlığı (Örn: Karacaahmet Yabani Ot Temizliği)" className="w-full bg-gray-50 p-5 rounded-[24px] font-bold text-sm border-2 border-transparent focus:border-emerald-500 outline-none transition-all" value={newReferenceData.title} onChange={e => setNewReferenceData({...newReferenceData, title: e.target.value})}/>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 text-center">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Öncesi</label>
                           <label className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-white transition-all overflow-hidden relative">
                             {newReferenceData.before ? <img src={newReferenceData.before} className="absolute inset-0 w-full h-full object-cover"/> : <Camera className="text-gray-300"/>}
                             <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={(e) => handleImageUpload(e, (img) => setNewReferenceData({...newReferenceData, before: img}))}/>
                           </label>
                        </div>
                        <div className="space-y-2 text-center">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sonrası</label>
                           <label className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-white transition-all overflow-hidden relative">
                             {newReferenceData.after ? <img src={newReferenceData.after} className="absolute inset-0 w-full h-full object-cover"/> : <Camera className="text-gray-300"/>}
                             <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={(e) => handleImageUpload(e, (img) => setNewReferenceData({...newReferenceData, after: img}))}/>
                           </label>
                        </div>
                     </div>
                     <button type="submit" disabled={!newReferenceData.before || !newReferenceData.after} className="w-full bg-emerald-600 text-white p-5 rounded-[28px] font-black shadow-xl hover:bg-emerald-700 disabled:bg-gray-300 transition tracking-[0.2em] uppercase text-xs">Referansı Kaydet</button>
                  </form>
               </div>
            </div>
          )}

        </main>
      </div>
    );
  }

  // ==========================================
  // MÜŞTERİ (STANDART) PANELİ GÖRÜNÜMÜ
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20 md:pb-0 relative">
      <header className="bg-white shadow-sm sticky top-0 z-40 px-4 py-3 flex justify-between items-center border-b border-gray-100">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setSelectedVendor(null)}>
          <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-emerald-100 shadow-lg group-hover:rotate-12 transition-transform"><Flower2 className="w-6 h-6"/></div>
          <h1 className="text-xl font-black text-emerald-800 tracking-tight uppercase">Huzur Bahçesi</h1>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-3">
          {user && (
            <div className="relative">
              <button onClick={markNotificationsAsRead} className="relative p-2 text-gray-600 hover:bg-gray-50 rounded-full transition">
                <Bell className="w-6 h-6" />
                {unreadNotifications > 0 && <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center border-2 border-white">{unreadNotifications}</span>}
              </button>
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4">
                  <div className="p-4 border-b bg-gray-50"><h4 className="font-black text-xs text-gray-800 uppercase tracking-widest">Bildirimler</h4></div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-gray-400 font-bold uppercase">Bildiriminiz bulunmuyor.</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} onClick={() => handleNotificationClick(n)} className={`p-4 border-b border-gray-50 transition flex items-start gap-3 cursor-pointer ${n.orderId ? 'hover:bg-emerald-50' : 'hover:bg-gray-50'}`}>
                           <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center ${n.read ? 'bg-gray-100 text-gray-500' : 'bg-emerald-100 text-emerald-600'}`}><Bell className="w-4 h-4"/></div>
                           <div>
                             <p className={`text-xs font-black mb-1 uppercase ${n.read ? 'text-gray-600' : 'text-gray-800'}`}>{n.title}</p>
                             <p className="text-[10px] text-gray-500 leading-tight uppercase tracking-tight">{n.message}</p>
                             {n.orderId && <p className="text-[9px] font-black text-emerald-600 mt-2 flex items-center gap-1"><ArrowRight className="w-3 h-3"/> Görüntülemek için tıklayın</p>}
                           </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <button onClick={() => { setAccountView('menu'); setIsAccountOpen(true); }} className="flex items-center gap-2 text-gray-600 font-bold hover:text-emerald-600 transition-colors p-2 hover:bg-gray-50 rounded-full">
            <div className="relative"><User className="w-6 h-6" />{user && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>}</div>
            <span className="hidden sm:block text-sm uppercase tracking-widest text-[10px]">{user?.displayName || 'Hesabım'}</span>
          </button>
          
          <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
            <ShoppingBag className="w-6 h-6" />{cart.length > 0 && <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">{cart.length}</span>}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Kayıtlı Mezarlar</h2>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-1">
            {relatives.length === 0 ? (
              <div className="bg-emerald-50 p-6 rounded-[32px] text-center w-full border border-emerald-100 shadow-inner">
                <User className="mx-auto text-emerald-200 mb-2 w-10 h-10"/><p className="text-sm text-emerald-800 font-bold uppercase">Kayıtlı yakın bulunmuyor.</p>
                <button onClick={() => setIsAddRelativeOpen(true)} className="mt-4 bg-emerald-600 text-white text-xs font-bold px-6 py-2.5 rounded-2xl shadow-lg uppercase tracking-widest">Yakın Ekle</button>
              </div>
            ) : (
              relatives.map(r => (
                <button key={r.id} onClick={() => { setSelectedRelativeId(r.id); setSelectedVendor(null); }} className={`flex items-center gap-3 p-4 rounded-[28px] border-2 min-w-[260px] text-left transition-all ${selectedRelativeId === r.id ? 'border-emerald-600 bg-emerald-50 shadow-md shadow-emerald-50' : 'border-gray-100 bg-white'}`}>
                  <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-sm shrink-0"><img src={r.image} className="w-full h-full object-cover" alt=""/></div>
                  <div className="flex-1 overflow-hidden">
                    <div className="font-bold text-sm text-gray-800 flex justify-between items-center uppercase tracking-tighter">{r.name} {selectedRelativeId === r.id && <CheckCircle className="w-4 h-4 text-emerald-600" />}</div>
                    <div className="text-[10px] text-emerald-700 font-medium flex items-center gap-1 mt-1 truncate uppercase tracking-widest"><MapPin className="w-3 h-3 flex-shrink-0"/> <span className="truncate">{r.cemetery}</span></div>
                    {r.deathDate && <div className="text-[9px] text-gray-400 font-bold mt-0.5 opacity-70 uppercase tracking-widest">Vefat: {new Date(r.deathDate).toLocaleDateString('tr-TR')}</div>}
                  </div>
                </button>
              ))
            )}
            <button onClick={() => setIsAddRelativeOpen(true)} className="flex items-center justify-center gap-2 p-3.5 rounded-[28px] border-2 border-dashed border-gray-200 min-w-[130px] bg-gray-50 text-gray-500 hover:bg-gray-100 transition-all active:scale-95"><Plus className="w-5 h-5"/><span className="font-bold text-xs uppercase tracking-widest">Yeni Ekle</span></button>
          </div>

          {selectedRelative && (
             <div className="flex justify-end mt-3 animate-in fade-in">
               <button onClick={() => setIsVisitorGuideOpen(true)} className="flex items-center justify-center gap-2 bg-white text-emerald-700 border border-emerald-100 px-6 py-2.5 rounded-2xl text-[10px] font-black hover:bg-emerald-50 transition shadow-sm uppercase tracking-widest">
                 <Book className="w-4 h-4"/> Ziyaret Rehberi & Kıble
               </button>
            </div>
          )}
        </section>

        {selectedRelative?.deathDate && !selectedVendor && !isAnniversaryDismissed && (
          <div className="relative bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-3xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 mb-8 shadow-sm animate-in fade-in zoom-in-95">
            <button onClick={() => setIsAnniversaryDismissed(true)} className="absolute top-3 right-3 p-1.5 bg-orange-100/50 hover:bg-orange-200 text-orange-500 rounded-xl transition-colors">
              <X className="w-4 h-4"/>
            </button>
            <div className="flex items-start md:items-center gap-4 pr-8">
              <div className="bg-orange-100 text-orange-600 p-3.5 rounded-2xl flex-shrink-0 shadow-inner"><Calendar className="w-6 h-6"/></div>
              <div>
                <h4 className="text-sm font-black text-orange-800 mb-1 uppercase tracking-tight">Yaklaşan Özel Gün (Vefat Yıldönümü)</h4>
                <p className="text-[11px] text-orange-700 font-medium leading-relaxed uppercase tracking-tighter">Seçili yakınınızın vefat yıldönümü yaklaşıyor. Kabrini bu özel güne hazırlamak ve çiçeklendirmek için onay vererek hemen planlama yapabilirsiniz.</p>
              </div>
            </div>
            <div className="w-full md:w-auto flex-shrink-0">
               <button onClick={() => setSelectedVendor(vendors[0])} className="w-full md:w-auto bg-orange-500 text-white font-black text-xs px-6 py-3.5 rounded-xl shadow-lg shadow-orange-200 hover:bg-orange-600 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
                 <CheckSquare className="w-4 h-4"/> Onayla ve Gör
               </button>
            </div>
          </div>
        )}

        {!selectedVendor && (
          <div className="bg-emerald-800 p-8 rounded-[48px] text-white mb-8 shadow-2xl relative overflow-hidden animate-in fade-in">
             <div className="absolute -right-10 -top-10 opacity-10"><Flower2 className="w-48 h-48"/></div>
             <div className="relative z-10">
                <span className="bg-yellow-400 text-yellow-900 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-3 inline-block shadow-sm">Bayram Kampanyası</span>
                <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter">Mezarlar Hazır Olsun ✨</h3>
                <p className="text-sm opacity-90 max-w-sm leading-relaxed mb-6 uppercase tracking-tighter">Sevdiklerinizin mezarları bayrama profesyonel ellerde özenle hazırlansın.</p>
                <div className="flex gap-4">
                  <button onClick={()=>setSelectedVendor(vendors[0])} className="bg-white text-emerald-900 px-8 py-3 rounded-2xl font-black text-sm shadow-xl hover:bg-emerald-50 transition-all uppercase tracking-widest">Şimdi Randevu Al</button>
                </div>
             </div>
          </div>
        )}

        {!selectedVendor && (
           <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide animate-in fade-in">
              {categoryFilters.map(filter => (
                 <button 
                   key={filter} 
                   onClick={() => setActiveCategoryFilter(filter)} 
                   className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all shadow-sm ${activeCategoryFilter === filter ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
                 >
                    {filter}
                 </button>
              ))}
           </div>
        )}

        {selectedRelative && (
          <>
            {!selectedVendor ? (
              <div className="animate-in fade-in slide-in-from-bottom-6">
                <h2 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2 px-2 uppercase tracking-widest"><BadgeCheck className="text-blue-500"/> Hizmet Verenler</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredVendors.map(v => (
                    <button key={v.id} onClick={() => setSelectedVendor(v)} className="bg-white p-5 rounded-[32px] border border-gray-100 flex gap-5 hover:border-emerald-500 hover:shadow-xl transition-all text-left shadow-sm group">
                      <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform"><img src={v.image} className="w-full h-full object-cover" alt=""/></div>
                      <div className="flex-1 py-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-gray-800 group-hover:text-emerald-700 transition-colors uppercase tracking-tight text-sm">{v.name} {v.isVerified && <BadgeCheck className="w-4 h-4 text-blue-500 inline ml-1"/>}</h4>
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-1 rounded-xl flex items-center gap-1 shadow-sm"><Star className="w-3 h-3 fill-current"/> {v.rating}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mb-3 uppercase tracking-tighter">{v.tags}</p>
                        <div className="flex gap-3 font-black text-[9px] text-gray-400 uppercase tracking-widest">
                          <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md"><Clock className="w-3.5 h-3.5"/> {v.time}</span>
                          <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md"><ShoppingBag className="w-3.5 h-3.5"/> {v.minOrder} ₺</span>
                          {v.id === 'v3' && <Bitcoin size={14} className="text-amber-500"/>}
                        </div>
                      </div>
                    </button>
                  ))}
                  {filteredVendors.length === 0 && <div className="col-span-2 text-center py-10 text-gray-400 text-xs font-bold uppercase">Bu kategoriye ait hizmet veren bulunamadı.</div>}
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-6">
                <button onClick={() => setSelectedVendor(null)} className="flex items-center gap-1 text-emerald-600 text-[10px] font-black mb-6 hover:underline uppercase tracking-widest bg-white px-4 py-2 rounded-xl shadow-sm w-fit"><ChevronLeft className="w-4 h-4"/> Firmalara Dön</button>
                <div className="bg-white p-8 rounded-[40px] border flex flex-col md:flex-row items-center gap-8 shadow-sm mb-8">
                  <div className="w-32 h-32 rounded-[32px] border-4 border-emerald-50 shadow-lg overflow-hidden flex-shrink-0"><img src={selectedVendor.image} className="w-full h-full object-cover" alt=""/></div>
                  <div className="text-center md:text-left flex-1">
                    <h2 className="text-2xl font-black text-gray-800 mb-1 uppercase tracking-tighter">{selectedVendor.name} {selectedVendor.isVerified && <BadgeCheck className="w-6 h-6 text-blue-500 inline ml-2"/>}</h2>
                    <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">{selectedVendor.tags}</p>
                    <div className="flex justify-center md:justify-start gap-4 mt-6"><span className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest">★ {selectedVendor.rating} Değerlendirme</span><span className="bg-gray-50 text-gray-500 px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest">⏱ {selectedVendor.time} Termin</span></div>
                  </div>
                </div>
                <div className="flex border-b mb-8 text-[11px] font-black uppercase tracking-[0.2em] bg-white rounded-3xl px-2 shadow-sm overflow-hidden">
                  <button onClick={() => setVendorTab('hizmetler')} className={`flex-1 py-4 transition-all ${vendorTab === 'hizmetler' ? 'text-emerald-700 bg-emerald-50 border-b-4 border-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}>Tüm Hizmetler</button>
                  <button onClick={() => setVendorTab('galeri')} className={`flex-1 py-4 transition-all ${vendorTab === 'galeri' ? 'text-emerald-700 bg-emerald-50 border-b-4 border-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}>Öncesi / Sonrası</button>
                </div>
                
                {vendorTab === 'hizmetler' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map(p => (
                      <div key={p.id} className="bg-white rounded-[32px] overflow-hidden border border-gray-100 flex flex-col hover:shadow-xl transition-all group">
                        <div className="h-44 bg-gray-100 relative overflow-hidden">
                          <img src={p.image || 'https://images.unsplash.com/photo-1592424001809-5b9c24ce4e73?auto=format&fit=crop&q=80&w=300'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt=""/>
                          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-2xl font-black text-emerald-800 text-sm shadow-xl">{p.price} ₺</div>
                        </div>
                        <div className="p-6 flex flex-col flex-1 text-center items-center">
                          <h3 className="font-black text-sm text-gray-800 mb-2 leading-tight uppercase tracking-tighter">{p.name}</h3>
                          <p className="text-[10px] text-gray-400 mb-6 leading-relaxed flex-1 uppercase tracking-tighter line-clamp-3">{p.desc}</p>
                          <button onClick={() => setCart([...cart, {...p, cartId: Math.random(), vendorName: selectedVendor.name}])} className="w-full bg-emerald-600 text-white font-black py-3.5 rounded-[20px] shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]"><Plus className="w-4 h-4"/> Sepete Ekle</button>
                        </div>
                      </div>
                    ))}
                    {filteredProducts.length === 0 && <div className="col-span-full text-center py-10 text-gray-400 text-xs font-bold uppercase">Bu kategoriye ait hizmet bulunamadı.</div>}
                  </div>
                )}
                {vendorTab === 'galeri' && (
                   <div className="space-y-8">
                     {vendorGallery.filter(g => g.vendorId === selectedVendor.id).length === 0 ? (
                       <div className="p-12 text-center text-gray-400 font-bold uppercase text-xs border-2 border-dashed rounded-[32px]">Bu satıcı henüz referans çalışması eklememiş.</div>
                     ) : (
                       vendorGallery.filter(g => g.vendorId === selectedVendor.id).map(g => (
                         <div key={g.id} className="bg-white p-5 rounded-[32px] shadow-sm border border-gray-100">
                           <h4 className="font-black text-xs text-gray-800 mb-4 uppercase tracking-widest">{g.title}</h4>
                           <BeforeAfterSlider before={g.before} after={g.after}/>
                         </div>
                       ))
                     )}
                   </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t py-16 px-4 relative z-10 text-center md:text-left mt-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div><div className="flex items-center justify-center md:justify-start gap-2 mb-4"><div className="bg-emerald-600 p-1.5 rounded-lg text-white"><Flower2 size={20}/></div><span className="text-2xl font-black text-emerald-800 uppercase tracking-tight">Huzur Bahçesi</span></div><p className="text-[10px] text-gray-400 leading-relaxed max-w-xs mx-auto md:mx-0 font-bold uppercase tracking-widest">Huzur Bahçesi, sevdiklerinizin mezarlarına profesyonel özenle bakıyoruz. Türkiye'nin dijital mezar bakım pazaryeri.</p></div>
          <div className="flex flex-col gap-3 font-black text-[10px] uppercase tracking-[0.2em] text-gray-400">
            <button onClick={() => setInfoModal('about')} className="hover:text-emerald-600 transition">Hakkımızda</button>
            <button onClick={() => setInfoModal('howItWorks')} className="hover:text-emerald-600 transition">İyzico Güvenli Ödeme</button>
            <button onClick={() => setInfoModal('terms')} className="hover:text-emerald-600 transition">Gizlilik Politikası</button>
            <div className="pt-4 mt-2 border-t border-gray-100 flex flex-col gap-3">
              <button onClick={() => setViewMode('vendor_onboarding')} className="text-emerald-600 hover:scale-105 transition-transform flex items-center justify-center md:justify-start gap-1 bg-emerald-50 px-3 py-2 rounded-xl"><Briefcase className="w-3.5 h-3.5"/> Hizmet Veren Ol (Satıcı Başvurusu)</button>
              <button onClick={() => setViewMode('vendor')} className="text-emerald-600 hover:scale-105 transition-transform flex items-center justify-center md:justify-start gap-1 bg-emerald-50 px-3 py-2 rounded-xl"><Store className="w-3.5 h-3.5"/> Satıcı Girişi</button>
              <button onClick={() => setViewMode('admin')} className="text-indigo-600 hover:scale-105 transition-transform flex items-center justify-center md:justify-start gap-1 bg-indigo-50 px-3 py-2 rounded-xl"><Shield className="w-3.5 h-3.5"/> Yönetici Paneli</button>
            </div>
          </div>
          <div><h4 className="font-black text-[10px] uppercase tracking-widest text-gray-800 mb-4">Güvenli Altyapı</h4><div className="flex gap-2 justify-center md:justify-start opacity-30 grayscale"><CheckCircle/><ShieldCheck/><Lock/></div><p className="text-[10px] text-gray-300 mt-4 font-bold uppercase tracking-widest">© 2026 Huzur Bahçesi Pazaryeri.</p></div>
        </div>
      </footer>

      {/* WHATSAPP FLOAT */}
      <a href="https://wa.me/908501234567" target="_blank" rel="noreferrer" className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-3xl shadow-2xl shadow-green-200 hover:scale-110 active:scale-95 transition z-40"><MessageCircle className="w-8 h-8"/></a>

      {/* SEPET MODALI (İYZİCO KORUMALI) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-8 border-b flex justify-between items-center bg-white shadow-sm"><h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2"><ShoppingBag className="text-emerald-600"/> Sepetim</h3><button onClick={() => setIsCartOpen(false)} className="p-2 bg-gray-50 rounded-2xl"><X className="w-6 h-6"/></button></div>
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-gray-50/30">
              {cart.length === 0 && !orderPlaced ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-300 opacity-50"><ShoppingBag className="w-24 h-24 mb-6"/><p className="font-black text-lg uppercase tracking-widest">Sepetiniz Boş</p></div>
              ) : orderPlaced ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-10 animate-in zoom-in-95">
                  <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[40px] flex items-center justify-center mb-8 shadow-xl shadow-emerald-50"><CheckCircle className="w-12 h-12"/></div>
                  <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">Sipariş Alındı!</h3>
                  <p className="text-[11px] text-gray-500 font-bold mt-4 leading-relaxed uppercase tracking-widest">Ödemeniz İyzico havuzuna alındı. Hizmet tamamlandığında satıcıya aktarılacaktır.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {cart.map(item => (
                    <div key={item.cartId} className="flex gap-4 p-5 bg-white rounded-[32px] border border-gray-100 shadow-sm relative group">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white shadow-sm shrink-0"><img src={item.image || 'https://images.unsplash.com/photo-1592424001809-5b9c24ce4e73?auto=format&fit=crop&q=80&w=300'} className="w-full h-full object-cover" alt=""/></div>
                      <div className="flex-1 overflow-hidden">
                         <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1 truncate">{item.vendorName}</div>
                         <h4 className="font-black text-sm text-slate-800 truncate uppercase tracking-tighter">{item.name}</h4>
                         <div className="text-sm font-black text-emerald-600 mt-1">{item.price} ₺</div>
                      </div>
                      <button onClick={() => setCart(cart.filter(i => i.cartId !== item.cartId))} className="text-gray-300 hover:text-red-500 transition-all self-center p-2"><X size={18}/></button>
                    </div>
                  ))}
                  
                  {/* İndirim Kuponu */}
                  {!appliedCoupon ? (
                    <div className="bg-white border border-gray-100 p-5 rounded-[28px] shadow-sm">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">İndirim Kuponu</p>
                       <div className="flex gap-2">
                         <input type="text" value={cartCouponInput} onChange={(e) => setCartCouponInput(e.target.value)} placeholder="KOD GİRİN" className="flex-1 bg-gray-50 border-none rounded-2xl px-4 py-3 text-xs font-black outline-none focus:ring-2 focus:ring-emerald-500 uppercase tracking-widest shadow-inner"/>
                         <button onClick={handleApplyCoupon} className="bg-slate-800 text-white font-black text-[10px] tracking-widest uppercase px-6 py-3 rounded-2xl shadow-md hover:bg-slate-900 transition">Uygula</button>
                       </div>
                       {couponError && <p className="text-[9px] font-bold text-red-500 mt-3">{couponError}</p>}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-orange-50 border border-orange-100 p-5 rounded-[28px] animate-in fade-in zoom-in-95">
                      <div className="flex items-center gap-3"><div className="bg-orange-100 p-2.5 rounded-xl text-orange-600"><Ticket size={20}/></div><div><p className="text-[10px] font-black text-orange-800 uppercase tracking-widest">{appliedCoupon.code}</p><p className="text-[9px] font-bold text-orange-600 uppercase tracking-widest mt-0.5">{appliedCoupon.title} uygulandı.</p></div></div>
                      <button onClick={() => setAppliedCoupon(null)} className="text-red-500 p-2 hover:scale-110 transition"><X size={18}/></button>
                    </div>
                  )}

                  {/* AİLE İLE ÖDE */}
                  <div className="pt-2 border-t border-gray-100">
                     <button onClick={openFamilyShareModal} className="w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-100 px-4 py-4.5 rounded-[28px] text-[10px] font-black hover:bg-indigo-100 transition shadow-sm uppercase tracking-widest">
                       <Share2 size={18} /> Ortak Öde (Harcamayı Bölüştür)
                     </button>
                  </div>

                  {/* ÖDEME YÖNTEMİ SEÇİMİ VE FORMU */}
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h4 className="text-[10px] font-black text-gray-400 mb-4 uppercase tracking-widest text-center">Ödeme Yöntemi</h4>
                    <div className="flex gap-2 mb-5 bg-white border border-gray-100 p-1.5 rounded-[20px] shadow-sm">
                      <button onClick={() => setPaymentMethod('iyzico')} className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-2xl transition-all ${paymentMethod === 'iyzico' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>İyzico Güvencesiyle</button>
                      <button onClick={() => setPaymentMethod('transfer')} className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-2xl transition-all ${paymentMethod === 'transfer' ? 'bg-white text-emerald-700 shadow-md border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}>Havale / EFT</button>
                    </div>

                    {paymentMethod === 'iyzico' && (
                       <div className="bg-emerald-800 p-6 rounded-[32px] text-white shadow-xl relative overflow-hidden animate-in fade-in zoom-in-95">
                         <div className="absolute right-0 top-0 opacity-10"><ShieldCheck size={100}/></div>
                         <h5 className="text-[11px] font-black uppercase tracking-widest mb-2">Güvenli Pazaryeri Ödemesi</h5>
                         <p className="text-[9px] font-medium opacity-90 leading-relaxed mb-6">Ödemeniz havuz hesabına aktarılır. İşlem başarıyla tamamlandığında ve siz onayladığınızda satıcıya iletilir.</p>
                         <input type="text" placeholder="KART ÜZERİNDEKİ İSİM" className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-3.5 text-xs font-bold outline-none placeholder-emerald-200 mb-3 uppercase tracking-widest"/>
                         <div className="relative mb-3"><input type="text" placeholder="KART NUMARASI" maxLength="19" className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-3.5 text-xs font-bold outline-none placeholder-emerald-200 uppercase tracking-widest"/><CreditCard className="absolute right-5 top-3.5 text-emerald-200" size={20}/></div>
                         <div className="flex gap-3"><input type="text" placeholder="AY/YIL" maxLength="5" className="w-1/2 bg-white/10 border border-white/20 rounded-2xl px-5 py-3.5 text-xs font-bold outline-none placeholder-emerald-200 uppercase tracking-widest"/><input type="text" placeholder="CVV" maxLength="3" className="w-1/2 bg-white/10 border border-white/20 rounded-2xl px-5 py-3.5 text-xs font-bold outline-none placeholder-emerald-200 uppercase tracking-widest"/></div>
                       </div>
                    )}
                  </div>
                  
                  {/* Alt Toplam Detayları */}
                  <div className="bg-white p-7 rounded-[40px] shadow-sm border border-gray-100 space-y-4">
                    <div className="flex justify-between items-center text-[11px] font-black text-gray-400 uppercase tracking-widest"><span>Ara Toplam</span><span>{baseTotal} ₺</span></div>
                    {appliedCoupon && <div className="flex justify-between items-center text-[11px] font-black text-orange-600 uppercase tracking-widest"><span>İndirim</span><span>-{discountAmount.toFixed(2)} ₺</span></div>}
                    <div className="border-t border-gray-100 pt-4 flex justify-between items-center"><span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Ödenecek Tutar</span><span className="text-3xl font-black text-emerald-700">{totalCartPrice.toFixed(2)} ₺</span></div>
                  </div>

                  <button onClick={handleCheckout} disabled={isCheckingOut} className="w-full bg-emerald-600 text-white py-6 rounded-[32px] font-black shadow-2xl shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-3 disabled:bg-emerald-300">
                     {isCheckingOut ? <RefreshCw className="animate-spin" size={20}/> : <><ShieldCheck size={20}/> HAVUZA AKTAR VE ONAYLA</>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AİLE ORTAK ÖDEME MODALI */}
      {isFamilyShareOpen && (
        <div className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-[44px] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
               <h3 className="font-black text-xl text-emerald-800 tracking-tighter uppercase">Ortak Ödeme Havuzu</h3>
               <button onClick={() => setIsFamilyShareOpen(false)} className="bg-gray-50 p-2 rounded-2xl text-gray-400 hover:text-red-500 transition-colors"><X/></button>
            </div>
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-[28px] text-center border border-gray-100 flex justify-between items-center">
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Toplam Sepet Tutarı</span>
                 <span className="text-2xl font-black text-slate-800">{totalCartPrice.toFixed(2)} ₺</span>
              </div>
              <div className="space-y-4">
                 <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1 bg-emerald-50 px-3 py-1.5 rounded-xl w-fit">Tutar Dağılımı</p>
                 <div className="max-h-48 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                    {familyMembers.map((member) => (
                       <div key={member.id} className="flex items-center gap-3 bg-white border border-gray-100 p-3 rounded-2xl shadow-sm hover:border-emerald-100 transition-colors">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[9px] font-black text-white ${member.isMe ? 'bg-emerald-500' : 'bg-indigo-500'}`}>
                             {member.isMe ? 'BEN' : member.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1"><p className="text-[11px] font-black text-gray-800 uppercase tracking-tighter">{member.name}</p></div>
                          <div className="flex items-center gap-2">
                             <input type="number" value={member.amount} onChange={(e) => handleCustomAmountChange(member.id, e.target.value)} className="w-16 bg-gray-50 border border-gray-200 rounded-lg p-1.5 text-[10px] font-black text-center outline-none focus:border-emerald-500 focus:bg-white transition-colors"/>
                             <span className="text-[10px] font-bold text-gray-500">₺</span>
                             {!member.isMe && <button onClick={() => handleRemoveFamilyMember(member.id)} className="text-gray-300 hover:text-red-500 transition ml-1"><X size={14}/></button>}
                          </div>
                       </div>
                    ))}
                 </div>
                 <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <input type="text" placeholder="Yeni Kişi (Örn: Kardeşim)" value={newFamilyMemberName} onChange={e => setNewFamilyMemberName(e.target.value)} className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 uppercase tracking-widest"/>
                    <button onClick={handleAddFamilyMember} className="bg-indigo-600 text-white font-black text-xs px-5 rounded-xl hover:bg-indigo-700 transition shadow-md uppercase tracking-widest"><Plus size={18}/></button>
                 </div>
              </div>
              <button onClick={confirmFamilyShare} className="w-full bg-emerald-600 text-white p-5 rounded-[28px] font-black shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition active:scale-95 text-xs tracking-widest uppercase flex justify-center items-center gap-2 mt-4">
                <Share2 size={16}/> {familyShareCopied ? "LİNK KOPYALANDI!" : "LİNK OLUŞTUR VE PAYLAŞ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HESABIM MODALI */}
      {isAccountOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in" onClick={() => { setIsAccountOpen(false); setAccountView('menu'); setSettingsSuccess(false); }}></div>
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b flex justify-between items-center bg-white"><h2 className="text-xl font-black flex items-center gap-2 uppercase tracking-tighter"><User className="text-emerald-600 w-6 h-6"/> Profilim</h2><button onClick={() => { setIsAccountOpen(false); setAccountView('menu'); setSettingsSuccess(false); }} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition"><X className="w-5 h-5"/></button></div>
            
            <div className="flex-1 overflow-y-auto bg-gray-50/50 custom-scrollbar">
              {accountView === 'menu' && (
                <div className="p-6 space-y-5">
                  <div className="flex items-center gap-4 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                     <div className="w-16 h-16 bg-emerald-50 rounded-[20px] flex items-center justify-center text-emerald-600 shadow-inner"><User className="w-8 h-8"/></div>
                     <div className="flex-1 overflow-hidden">
                         <h3 className="font-black text-base text-gray-800 truncate uppercase">{user?.displayName || 'Üyemiz'}</h3>
                         <p className="text-[10px] font-bold uppercase text-gray-400 truncate">{user?.email}</p>
                     </div>
                  </div>

                  <div className="bg-emerald-600 rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden">
                      <div className="absolute -right-6 -bottom-6 opacity-10"><Wallet size={120}/></div>
                      <div className="relative z-10">
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Cüzdan Bakiye</p>
                          <h3 className="text-3xl font-black">{huzurPoints} ₺</h3>
                          <div className="mt-4 flex gap-2"><div className="bg-white/20 px-3 py-1.5 rounded-xl backdrop-blur-sm text-[9px] font-black uppercase tracking-widest">Huzur Puan</div></div>
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setAccountView('orders')} className="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-3xl border border-gray-100 shadow-sm hover:border-emerald-200 transition-all group">
                      <div className="relative">
                        <Package className="w-6 h-6 text-gray-400 group-hover:text-emerald-600 transition-colors"/>
                        {orders.length > 0 && <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">{orders.length}</span>}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 group-hover:text-emerald-700">Siparişler</span>
                    </button>
                    <button onClick={() => setAccountView('coupons')} className="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-3xl border border-gray-100 shadow-sm hover:border-emerald-200 transition-all group">
                      <div className="relative">
                        <Ticket className="w-6 h-6 text-gray-400 group-hover:text-emerald-600 transition-colors"/>
                        {coupons.filter(c => !c.used).length > 0 && <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">{coupons.filter(c => !c.used).length}</span>}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 group-hover:text-emerald-700">Kuponlar</span>
                    </button>
                  </div>

                  <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm space-y-5">
                    <h4 className="text-[10px] font-black text-gray-800 uppercase tracking-widest flex items-center gap-2 border-b border-gray-50 pb-3"><Settings className="w-4 h-4 text-emerald-600"/> Profil Ayarları</h4>
                    
                    {settingsSuccess && (
                      <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-3 rounded-xl text-[10px] font-bold flex items-center gap-2 animate-in fade-in uppercase">
                        <CheckCircle className="w-4 h-4 flex-shrink-0"/> Güncellendi!
                      </div>
                    )}

                    <div className="space-y-3">
                      <input type="text" value={settingsName} onChange={e => setSettingsName(e.target.value)} placeholder="Adınız Soyadınız" className="w-full bg-gray-50 p-4 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"/>
                      <input type="tel" value={settingsPhone} onChange={e => setSettingsPhone(e.target.value)} placeholder="Telefon No" className="w-full bg-gray-50 p-4 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"/>
                      <button onClick={handleUpdateProfile} className="w-full bg-emerald-600 text-white font-black py-3.5 rounded-xl shadow-lg hover:bg-emerald-700 transition-all text-[11px] uppercase tracking-widest">Bilgileri Kaydet</button>
                    </div>

                    <div className="pt-4 border-t border-gray-50 space-y-3">
                       <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Şifre Değiştir</label>
                       {passwordMsg.text && (
                        <div className={`p-3 rounded-xl text-[9px] font-bold flex items-center gap-2 animate-in fade-in uppercase ${passwordMsg.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                          {passwordMsg.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0"/> : <CheckCircle className="w-4 h-4 shrink-0"/>} {passwordMsg.text}
                        </div>
                      )}
                      <div className="space-y-2">
                        <input type="password" value={settingsOldPassword} onChange={e => setSettingsOldPassword(e.target.value)} placeholder="Eski Şifreniz" className="w-full bg-gray-50 p-4 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"/>
                        <input type="password" value={settingsNewPassword} onChange={e => setSettingsNewPassword(e.target.value)} placeholder="Yeni Şifreniz" className="w-full bg-gray-50 p-4 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"/>
                        <input type="password" value={settingsConfirmPassword} onChange={e => setSettingsConfirmPassword(e.target.value)} placeholder="Yeni Şifreniz (Tekrar)" className="w-full bg-gray-50 p-4 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"/>
                      </div>
                      <button onClick={handleUpdatePassword} className="w-full bg-slate-800 text-white font-black py-3.5 rounded-xl shadow-md hover:bg-slate-900 transition-all text-[11px] uppercase tracking-widest flex justify-center items-center gap-2"><Shield className="w-4 h-4" /> Şifreyi Güncelle</button>
                    </div>

                  </div>
                  
                  <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-500 font-black py-4.5 rounded-[24px] hover:bg-red-100 transition text-[10px] tracking-[0.2em] uppercase">Güvenli Çıkış</button>
                  
                </div>
              )}

            {accountView === 'orders' && (
              <div className="p-6 flex-1 overflow-y-auto bg-gray-50/50">
                <button onClick={() => setAccountView('menu')} className="text-emerald-600 hover:text-emerald-800 font-black text-[10px] uppercase tracking-widest mb-6 flex items-center gap-1 transition-colors"><ChevronLeft size={16}/> Menüye Dön</button>
                <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-tighter text-xl">Siparişlerim</h3>
                {orders.length === 0 ? (
                  <div className="text-center text-gray-400 py-10 text-xs font-bold border-2 border-dashed border-gray-200 rounded-[32px] uppercase">Henüz siparişiniz bulunmuyor.</div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(o => {
                      const reportTime = o.reportSubmittedAt || Date.now();
                      const timeLeft = Math.max(0, 15 * 60 * 1000 - (currentTime - reportTime));
                      const minutesLeft = Math.floor(timeLeft / 60000);
                      const secondsLeft = Math.floor((timeLeft % 60000) / 1000);

                      return (
                      <div key={o.id} className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm relative hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center mb-2">
                           <span className="font-black text-xs text-gray-800 flex items-center gap-2 uppercase tracking-widest">{o.orderNumber} {o.liveVideoRequested && <Video className="w-3.5 h-3.5 text-blue-500" title="Canlı Yayın İstendi"/>}</span>
                           <span className="text-emerald-600 font-black text-sm">{o.total} ₺</span>
                        </div>
                        <div className="text-[10px] text-gray-500 font-bold mb-4 flex items-center gap-2 uppercase tracking-tighter"><Calendar className="w-3 h-3"/> {o.date} <span className="opacity-50">•</span> {o.relativeName}</div>
                        
                        <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black inline-block mb-3 uppercase tracking-widest ${o.status === 'Tamamlandı' ? 'bg-emerald-100 text-emerald-700' : o.status === 'İşlemde' ? 'bg-blue-100 text-blue-700' : o.status === 'Revize İstenildi' ? 'bg-orange-100 text-orange-700' : o.status === 'Müşteri Onayı Bekliyor' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>{o.status}</span>
                        
                        {o.rating && (
                           <div className="mt-2 mb-3 bg-yellow-50 p-2.5 rounded-xl flex items-center gap-1 text-[10px] font-black text-yellow-600 uppercase tracking-widest">
                             Değerlendirme: {[...Array(o.rating)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current"/>)}
                           </div>
                        )}

                        <div className="flex gap-2 mt-2 border-t pt-4">
                          <button onClick={() => setChatOrder(o)} className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-700 text-[9px] font-black py-3 rounded-xl flex items-center justify-center gap-1.5 transition uppercase tracking-widest">
                            <MessageSquareText className="w-3.5 h-3.5"/> Mesajlaş
                          </button>
                          {o.status === 'Tamamlandı' && !o.rating && (
                             <button onClick={() => setReviewOrder(o)} className="flex-1 text-center bg-yellow-400 hover:bg-yellow-500 text-yellow-900 text-[9px] font-black py-3 rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm uppercase tracking-widest">
                               <Star className="w-3.5 h-3.5"/> Puanla
                             </button>
                          )}
                        </div>

                        {/* ONAY VEYA REVİZE ALANI */}
                        {o.status === 'Müşteri Onayı Bekliyor' && (
                          <div className="bg-purple-50 border border-purple-100 p-5 rounded-[24px] mt-4 text-center animate-in fade-in relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-purple-200">
                               <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${(timeLeft / (15 * 60 * 1000)) * 100}%` }}></div>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-purple-800 font-black text-xl mb-2 mt-2">
                              <Clock className="w-5 h-5"/> {minutesLeft.toString().padStart(2, '0')}:{secondsLeft.toString().padStart(2, '0')}
                            </div>
                            <p className="text-[10px] text-purple-700 font-bold mb-4 uppercase tracking-widest leading-relaxed">
                              Süreniz dolduğunda sistem işlemi otomatik olarak onaylayacaktır. Lütfen raporu inceleyip kararınızı verin.
                            </p>
                            <div className="flex gap-2">
                              <button onClick={() => setDisputeOrder(o)} className="flex-1 bg-white text-orange-600 border border-orange-200 font-black py-3 rounded-xl uppercase tracking-widest text-[9px] hover:bg-orange-50 transition flex justify-center items-center gap-1"><RefreshCw size={14}/> Revize İste</button>
                              <button onClick={() => handleCustomerApproveOrder(o.id, o.orderNumber)} className="flex-[2] bg-emerald-600 text-white font-black py-3 rounded-xl uppercase tracking-widest text-[10px] hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition flex justify-center items-center gap-1"><CheckCircle size={16}/> Raporu Onayla</button>
                            </div>
                          </div>
                        )}

                        {o.status === 'Tamamlandı' && o.beforeImage && o.afterImage && (
                          <div className="mt-4 border-t pt-4">
                            <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">İşlem Sonucu Raporu</h4>
                            <div className="h-28 rounded-2xl overflow-hidden shadow-inner"><BeforeAfterSlider before={o.beforeImage} after={o.afterImage}/></div>
                            <div className="flex gap-2 mt-3">
                              <button onClick={()=>generatePDFReport(o)} className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[9px] font-black py-3 rounded-xl flex items-center justify-center gap-2 transition uppercase tracking-widest"><Download size={14}/> İndir (PDF)</button>
                              <button onClick={()=>{ if(safeCopyToClipboard(`https://huzurbahcesi.app/rapor/${o.orderNumber}`)) alert('Rapor linki kopyalandı!'); }} className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[9px] font-black py-3 rounded-xl flex items-center justify-center gap-2 transition uppercase tracking-widest"><Share2 size={14}/> Paylaş (Link)</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )})}
                  </div>
                )}
              </div>
            )}

            {/* KUPONLARIM EKRANI */}
            {accountView === 'coupons' && (
              <div className="p-6 flex-1 overflow-y-auto bg-gray-50/50">
                <button onClick={() => setAccountView('menu')} className="text-emerald-600 hover:text-emerald-800 font-black text-[10px] flex items-center gap-1 transition-colors uppercase tracking-widest mb-6"><ChevronLeft size={16}/> Menüye Dön</button>
                <h3 className="text-xl font-black text-gray-800 mb-6 uppercase tracking-tighter">İndirim Kuponlarım</h3>
                
                {coupons.length === 0 ? (
                   <div className="text-center text-gray-400 py-10 text-xs font-bold border-2 border-dashed border-gray-200 rounded-[32px] uppercase">Henüz kuponunuz bulunmuyor.</div>
                ) : (
                   <div className="space-y-4">
                     {coupons.map(coupon => (
                       <div key={coupon.id} className={`relative overflow-hidden rounded-[28px] border-2 border-dashed transition-all ${coupon.used ? 'bg-gray-100 border-gray-200 opacity-50' : 'bg-orange-50 border-orange-200 shadow-sm hover:shadow-orange-100/50'}`}>
                         <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full border-r-2 border-dashed border-gray-200"></div>
                         <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full border-l-2 border-dashed border-gray-200"></div>
                         
                         <div className="flex justify-between items-start p-5 pl-6 pr-6">
                           <div>
                             <h4 className={`font-black text-sm uppercase tracking-tighter mb-1 ${coupon.used ? 'text-gray-500' : 'text-orange-700'}`}>{coupon.title}</h4>
                             <div className="inline-flex items-center gap-2">
                               <span className="font-bold text-[10px] uppercase tracking-widest text-orange-600/70">{coupon.code}</span>
                               {!coupon.used && (
                                 <button onClick={() => { if(safeCopyToClipboard(coupon.code)) alert('Kupon kodu kopyalandı!'); }} className="text-emerald-600 hover:text-emerald-700 transition" title="Kopyala"><Copy size={12}/></button>
                               )}
                             </div>
                           </div>
                           <div className="text-right flex flex-col items-end justify-between">
                             <div className={`text-2xl font-black ${coupon.used ? 'text-gray-400' : 'text-orange-700'}`}>
                               {coupon.type === 'percent' ? `%${coupon.value}` : `${coupon.value}₺`}
                             </div>
                             <div className="text-[9px] font-bold text-gray-400 mt-2 uppercase tracking-widest">S.K.T: {coupon.validUntil}</div>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                )}
              </div>
            )}
            </div>
          </div>
        </div>
      )}

      {/* YENİ: REVİZE TALEBİ MODALI */}
      {disputeOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[44px] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-orange-500"></div>
             <button onClick={() => setDisputeOrder(null)} className="absolute top-6 right-6 text-gray-400 hover:text-orange-500 bg-gray-50 p-2 rounded-full transition"><X size={18}/></button>
             <div className="flex items-center gap-3 mb-6">
               <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-[20px] flex items-center justify-center shadow-inner"><RefreshCw size={24}/></div>
               <div><h3 className="font-black text-xl text-slate-800 uppercase tracking-tighter">Revize Talep Et</h3><p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{disputeOrder.orderNumber} nolu sipariş</p></div>
             </div>
             
             <p className="text-xs font-bold text-gray-500 leading-relaxed mb-6">Satıcının ilettiği öncesi/sonrası raporunda eksik veya hatalı bir işlem olduğunu düşünüyorsanız durumu açıklayın. Satıcı hatayı giderip yeni bir rapor sunacaktır.</p>

             <form onSubmit={handleCustomerDisputeSubmit}>
               <textarea required value={disputeReason} onChange={e => setDisputeReason(e.target.value)} placeholder="Revize detaylarını yazın (Örn: Mermerin sağ köşesi tam temizlenmemiş)..." className="w-full bg-gray-50 border-none rounded-[24px] p-5 text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500 h-32 resize-none mb-6 shadow-inner transition-all"></textarea>
               <button type="submit" disabled={!disputeReason.trim()} className="w-full font-black py-4 rounded-[24px] shadow-lg transition-all uppercase tracking-widest text-xs bg-orange-600 text-white hover:bg-orange-700 active:scale-95 disabled:bg-gray-300">Revize Talebi Oluştur</button>
             </form>
          </div>
        </div>
      )}

      {/* ZİYARET REHBERİ VE KIBLE MODALI */}
      {isVisitorGuideOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#fcfbf9] rounded-[44px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[85vh]">
             <div className="p-8 border-b border-emerald-100 bg-emerald-50/50 flex justify-between items-center relative">
                <div className="flex items-center gap-3"><Book className="w-7 h-7 text-emerald-700"/><h3 className="font-black text-xl text-emerald-900 uppercase tracking-tighter">Ziyaret Rehberi</h3></div>
                <button onClick={() => { setIsVisitorGuideOpen(false); if(audioRef.current) audioRef.current.pause(); setPlayingPrayerId(null); }} className="bg-white text-emerald-800 p-2.5 rounded-xl shadow-sm hover:bg-emerald-100 transition-colors"><X size={18}/></button>
             </div>
             <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                {/* DİNAMİK KIBLE PUSULASI */}
                <div className="mb-10 bg-white border border-emerald-50 rounded-[32px] p-8 shadow-sm flex flex-col items-center">
                   <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><Compass size={16}/> Kıble Pusulası</h4>
                   {!compassActive ? (
                     <div className="text-center">
                       <p className="text-[10px] text-gray-400 font-bold mb-6 uppercase tracking-widest leading-relaxed">Kıble yönünü bulmak için cihazınızın pusula sensörünü başlatın.</p>
                       <button onClick={startCompass} className="bg-emerald-600 text-white font-black text-xs px-8 py-4 rounded-[24px] shadow-xl hover:bg-emerald-700 active:scale-95 transition-all uppercase tracking-widest">PUSULAYI BAŞLAT</button>
                     </div>
                   ) : (
                     <div className="flex flex-col items-center animate-in fade-in">
                       <div className="w-48 h-48 rounded-full border-8 border-emerald-50 flex items-center justify-center relative shadow-inner transition-transform duration-500 ease-out bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" style={{ transform: `rotate(${-compassHeading}deg)` }}>
                          <div className="absolute top-3 text-sm font-black text-red-500">K</div>
                          <div className="w-px h-full bg-gray-200 absolute"></div>
                          <div className="w-full h-px bg-gray-200 absolute"></div>
                          <div className="absolute w-1.5 h-24 bg-emerald-600 rounded-full origin-bottom" style={{ bottom: '50%', transform: `rotate(153deg)` }}>
                             <div className="w-5 h-5 bg-emerald-500 rounded-full absolute -top-2.5 -left-1.5 shadow-lg flex items-center justify-center border-4 border-white"></div>
                          </div>
                       </div>
                       <p className="text-[9px] text-emerald-700 mt-6 text-center font-black uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">Cihazınızı düz tutun. Yeşil ok kıble yönüdür.</p>
                     </div>
                   )}
                </div>

                {/* SESLİ DUA OKUMA (TTS) */}
                <div>
                  <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] mb-5 flex items-center gap-2 pl-2"><BookOpen size={16} className="text-emerald-600"/> Okunacak Dualar</h4>
                  <div className="space-y-4">
                     {prayers.map(prayer => (
                       <div key={prayer.id} className="bg-white p-6 rounded-[28px] border border-emerald-50 shadow-sm relative overflow-hidden group">
                          <div className="flex justify-between items-center mb-4">
                            <h5 className="font-black text-sm text-emerald-800 uppercase tracking-tight">{prayer.title}</h5>
                            <button onClick={() => toggleAudio(prayer.id, prayer.audioUrl)} className={`px-3 py-2 rounded-xl flex items-center gap-2 text-[9px] font-black transition-all uppercase tracking-widest ${playingPrayerId === prayer.id ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}>
                              {playingPrayerId === prayer.id ? <><Square size={12} className="fill-current"/> Durdur</> : <><Volume2 size={12}/> Dinle</>}
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed font-bold italic opacity-90">"{prayer.text}"</p>
                          {playingPrayerId === prayer.id && <div className="absolute bottom-0 left-0 h-1.5 bg-emerald-400 animate-pulse w-full"></div>}
                       </div>
                     ))}
                  </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* INFO MODALLAR */}
      {infoModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[44px] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95">
             <div className="p-8 border-b bg-emerald-50 flex justify-between items-center"><h3 className="font-black text-emerald-800 flex items-center gap-3 uppercase tracking-tighter text-xl">{infoModal === 'about' ? 'Hakkımızda' : infoModal === 'terms' ? 'Gizlilik Politikası' : infoModal === 'howItWorks' ? 'Nasıl Çalışır?' : infoModal === 'userAgreement' ? 'Kullanıcı Sözleşmesi' : infoModal === 'disclaimer' ? 'Sorumluluk Reddi' : ''}</h3><button onClick={() => setInfoModal(null)} className="text-emerald-800 bg-white p-2.5 rounded-2xl shadow-sm hover:bg-emerald-100 transition"><X size={18}/></button></div>
             <div className="p-10 max-h-[60vh] overflow-y-auto text-xs text-gray-500 leading-relaxed font-bold uppercase tracking-widest">
                {infoModal === 'about' && "Huzur Bahçesi, sevdiklerinizin mezarlarını profesyonel özenle takip etmenizi sağlayan dijital bir platformdur."}
                {infoModal === 'terms' && "Kişisel verileriniz 6698 sayılı KVKK kapsamında işlenmekte ve korunmaktadır."}
                {infoModal === 'howItWorks' && "Platform üzerindeki adımları izleyerek onaylı iş ortaklarımızdan mezar bakım hizmeti alabilirsiniz. İşlemler öncesi ve sonrası fotoğraflandırılarak size raporlanır."}
                {infoModal === 'userAgreement' && "Platform üzerinden alınan hizmetler onaylı iş ortaklarımızca verilmektedir. Kullanıcılar randevu ve ödeme kurallarına uymakla yükümlüdür."}
                {infoModal === 'disclaimer' && "Hizmet esnasında oluşabilecek doğal afet (fırtına, sel vb.) veya üçüncü şahıslar tarafından verilebilecek zararlardan platformumuz doğrudan sorumlu tutulamaz."}
             </div>
             <div className="p-8 border-t bg-gray-50 text-center"><button onClick={() => setInfoModal(null)} className="w-full bg-emerald-600 text-white font-black py-5 rounded-[28px] shadow-xl hover:bg-emerald-700 transition uppercase tracking-widest text-sm">ANLADIM</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
