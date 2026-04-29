import React, { useState, useEffect } from 'react';
import { 
  Search, ShoppingBag, User, MapPin, Flower2, 
  Droplets, Sparkles, BookOpen, Plus, X, CheckCircle, Clock, 
  Package, Settings, LogOut, Zap, Star, ChevronLeft, Calendar, History,
  Bell, Smartphone, Lock, Trash2, Edit2, Info, Phone, Mail,
  CalendarDays, RefreshCw, ImageIcon, Store, Upload, ImagePlus, TrendingUp, CheckSquare, Camera,
  Navigation, Users, Share2, Copy, Heart, Video, Map, Crosshair, Ticket, Gift, Percent,
  MessageSquare, FileText, FileCheck, AlertCircle, ShieldCheck,
  Shield, Check, XCircle, MessageCircle, BadgeCheck, MoveHorizontal, Wallet, HelpCircle, ArrowRight,
  Gavel, FileWarning, Scale
} from 'lucide-react';

// --- FİREBASE SDK ---
import { initializeApp } from 'firebase/app';
import { 
  getAuth, onAuthStateChanged, signOut, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider, signInAnonymously
} from 'firebase/auth';
import { 
  getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc, query, setDoc, getDoc
} from 'firebase/firestore';

// --- SABİT TANITIM VERİLERİ ---
const initialRelatives = [
  { id: 'sample-1', name: 'AHMET YILMAZ', relation: 'Baba', cemetery: 'Karacaahmet Mezarlığı, 5. Ada', gps: '41.0112,29.0256', image: 'https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?auto=format&fit=crop&q=80&w=150&h=150' },
  { id: 'sample-2', name: 'AYŞE DEMİR', relation: 'Anneanne', cemetery: 'Zincirlikuyu Mezarlığı, D Blok', gps: '41.0743,29.0084', image: 'https://images.unsplash.com/photo-1596435436665-271391cb4570?auto=format&fit=crop&q=80&w=150&h=150' },
];

const vendors = [
  { 
    id: 'v1', name: 'Huzur Mezar Bakım', isVerified: true, rating: 4.9, time: '24-48 Saat', minOrder: 150, image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=300', tags: 'Bakım, Onarım, Peyzaj',
    gallery: [{ id: 1, before: 'https://images.unsplash.com/photo-1416879598555-220b3cc5fa70?auto=format&fit=crop&q=80&w=300', after: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=300', title: 'Genel Bakım ve Temizlik' }],
    reviews: [{ id: 1, user: 'Mustafa Y.', rating: 5, text: 'Hizmet profesyonel bir şekilde tamamlandı.', date: '12 Mayıs 2026' }]
  },
  { id: 'v2', name: 'Gültekin Peyzaj', isVerified: false, rating: 4.7, time: '48 Saat', minOrder: 100, image: 'https://images.unsplash.com/photo-1589136655160-59fdb2b07e5b?auto=format&fit=crop&q=80&w=300', tags: 'Çiçek Dikimi, Toprak Yenileme', gallery: [], reviews: [] },
];

const products = [
  { id: 104, vendorId: 'v1', category: 'bakim', name: 'Mezar Durum Analizi', desc: 'Mezarın güncel fotoğrafları ile teknik durum analizi ve bakım önerileri.', price: 150 },
  { id: 102, vendorId: 'v1', category: 'bakim', name: 'Kapsamlı Mezar Temizliği', desc: 'Mermer beyazlatma, yabani ot temizliği ve çevre düzenlemesi.', price: 650, image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=300' },
  { id: 101, vendorId: 'v1', category: 'bakim', name: 'Periyodik Aylık Bakım', desc: 'Her ay düzenli temizlik, sulama ve fotoğraflı raporlama hizmeti.', price: 400, image: 'https://images.unsplash.com/photo-1416879598555-220b3cc5fa70?auto=format&fit=crop&q=80&w=300', isSubscription: true },
];

const initialVendorOrders = [
  { id: 'HZ-84729', customer: 'Mustafa Y.', relative: 'Ahmet Yılmaz', cemetery: 'Karacaahmet Mezarlığı', service: 'Kapsamlı Mezar Temizliği', price: 650, status: 'Yeni', date: 'Bugün 14:30' },
];

const initialUploadedDocs = [
  { id: 1, vendorName: 'Huzur Mezar Bakım', type: 'Belediye Çalışma Ruhsatı', status: 'Onaylandı', date: '10.01.2026' },
  { id: 2, vendorName: 'Gültekin Peyzaj', type: 'Mezarlıklar Müdürlüğü İzin Belgesi', status: 'Bekliyor', date: '28.04.2026' }
];

// --- BİLEŞENLER ---
const BeforeAfterSlider = ({ before, after }) => {
  const [sliderValue, setSliderValue] = useState(50);
  return (
    <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden bg-gray-200 border border-gray-200 shadow-sm touch-none">
      <img src={after} alt="Sonrası" className="absolute inset-0 w-full h-full object-cover" />
      <img src={before} alt="Öncesi" className="absolute inset-0 w-full h-full object-cover" style={{ clipPath: `inset(0 ${100 - sliderValue}% 0 0)` }} />
      <input type="range" min="0" max="100" value={sliderValue} onChange={(e) => setSliderValue(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20" />
      <div className="absolute top-0 bottom-0 w-0.5 bg-white pointer-events-none z-10 shadow-lg" style={{ left: `${sliderValue}%` }}>
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white text-gray-800 rounded-full p-1.5 shadow-md border border-gray-200"><MoveHorizontal size={16} /></div>
      </div>
      <div className="absolute bottom-4 left-4 bg-black/70 text-white text-[9px] font-bold px-3 py-1 rounded-md backdrop-blur-sm tracking-widest uppercase">ÖNCESİ</div>
      <div className="absolute bottom-4 right-4 bg-emerald-700/90 text-white text-[9px] font-bold px-3 py-1 rounded-md backdrop-blur-sm tracking-widest uppercase">SONRASI</div>
    </div>
  );
};

const HowItWorks = () => {
  const steps = [
    { icon: MapPin, title: "Mezar Kaydı", desc: "Bakım yapılacak mezarın konum ve bilgilerini sisteme kaydedin." },
    { icon: Store, title: "Hizmet Seçimi", desc: "Uzman ekiplerin sunduğu profesyonel paketlerden birini seçin." },
    { icon: Wallet, title: "Güvenli Ödeme", desc: "Banka havalesi ile ödemenizi yapın, işleminiz onaylansın." },
    { icon: Camera, title: "İşlem Raporu", desc: "Hizmet tamamlandığında fotoğraflı raporunuz anında iletilir." }
  ];
  return (
    <section className="bg-white rounded-[32px] p-8 border border-gray-200 mb-10 shadow-sm">
      <h2 className="text-xl font-bold text-gray-800 mb-8 flex items-center gap-2 px-2 uppercase tracking-tight"><HelpCircle className="text-emerald-700" /> Hizmet Süreci</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, idx) => (
          <div key={idx} className="flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-gray-50 text-emerald-700 rounded-2xl flex items-center justify-center mb-4 border border-gray-200 transition-colors hover:bg-emerald-50 shadow-sm"><step.icon size={26} /></div>
            <h3 className="font-bold text-gray-900 text-sm mb-1 uppercase tracking-tight">{step.title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default function App() {
  // --- FİREBASE YAPILANDIRMASI ---
  const firebaseConfig = {
    apiKey: "AIzaSyDkKQVGOuad4VysYDBY0Kto-pYqgxAA7b8",
    authDomain: "huzur-bahcesi-ce407.firebaseapp.com",
    projectId: "huzur-bahcesi-ce407",
    storageBucket: "huzur-bahcesi-ce407.firebasestorage.app",
    messagingSenderId: "1049610915083",
    appId: "1:1049610915083:web:4d57be32ebb6dfa79d660e",
    measurementId: "G-J6XF3SZVVK"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const googleProvider = new GoogleAuthProvider();
  const appId = 'huzurbahcesi-official';

  // --- STATES ---
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [authError, setAuthError] = useState('');

  const [relatives, setRelatives] = useState(initialRelatives); 
  const [orders, setOrders] = useState([]);
  const [selectedRelativeId, setSelectedRelativeId] = useState('sample-1');
  const [cart, setCart] = useState([]);
  const [huzurPoints, setHuzurPoints] = useState(0); 
  const [usePoints, setUsePoints] = useState(false);
  const [orderNote, setOrderNote] = useState('');
  
  const [viewMode, setViewMode] = useState('customer'); // customer, vendor, admin
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [accountView, setAccountView] = useState('menu'); 
  const [isAddRelativeOpen, setIsAddRelativeOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [infoModal, setInfoModal] = useState(null); 
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorTab, setVendorTab] = useState('hizmetler');
  const [liveVideo, setLiveVideo] = useState(false);
  const [newRelativeData, setNewRelativeData] = useState({ name: '', relation: '', cemetery: '', ada: '', parsel: '', gps: '' });

  const [showMapMockup, setShowMapMockup] = useState(false); // Harita Seçimi
  const [vendorOrders, setVendorOrders] = useState(initialVendorOrders);
  const [uploadedDocs, setUploadedDocs] = useState(initialUploadedDocs);
  const [vendorPanelTab, setVendorPanelTab] = useState('siparisler');
  const [uploadModalOpen, setUploadModalOpen] = useState(null);

  // --- DERIVED ---
  const selectedRelative = relatives.find(r => r.id === selectedRelativeId);
  const vendorProducts = selectedVendor ? products.filter(p => p.vendorId === selectedVendor.id) : [];
  const baseTotal = cart.reduce((sum, item) => sum + item.price, 0);
  const extrasTotal = (liveVideo ? 250 : 0);
  const pointsDiscount = usePoints ? Math.min(huzurPoints, baseTotal + extrasTotal) : 0;
  const totalCartPrice = Math.max(0, baseTotal + extrasTotal - pointsDiscount);

  // --- FİREBASE ETKİLEŞİMİ ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && !currentUser.isAnonymous) {
        try {
          const profile = await getDoc(doc(db, 'artifacts', appId, 'users', currentUser.uid, 'profile', 'data'));
          if (profile.exists()) setHuzurPoints(profile.data().points || 0);
        } catch (e) { console.error(e); }
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [auth, db]);

  useEffect(() => {
    if (!user) { setRelatives(initialRelatives); return; }
    const unsubscribeRel = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'relatives'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (data.length > 0) {
        setRelatives(data);
        if(!selectedRelativeId || selectedRelativeId.startsWith('sample')) setSelectedRelativeId(data[0].id);
      } else {
        setRelatives(initialRelatives);
      }
    });
    const unsubscribeOrd = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'orders'), (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => b.createdAt - a.createdAt));
    });
    return () => { unsubscribeRel(); unsubscribeOrd(); };
  }, [user, db, selectedRelativeId]);

  // --- AUTH ACTIONS ---
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isRegistering) {
        const res = await createUserWithEmailAndPassword(auth, loginEmail, loginPassword);
        await updateProfile(res.user, { displayName: registerName });
        await setDoc(doc(db, 'artifacts', appId, 'users', res.user.uid, 'profile', 'data'), { name: registerName, points: 50, createdAt: Date.now() });
        setHuzurPoints(50);
      } else {
        await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      }
      setShowAuthModal(false);
    } catch (err) { setAuthError("Giriş bilgileri doğrulanamadı."); }
  };

  const handleGoogleLogin = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const profileRef = doc(db, 'artifacts', appId, 'users', res.user.uid, 'profile', 'data');
      const profileSnap = await getDoc(profileRef);
      if (!profileSnap.exists()) await setDoc(profileRef, { name: res.user.displayName, points: 50, createdAt: Date.now() });
      setShowAuthModal(false);
    } catch (err) { setAuthError("Google bağlantısı başarısız."); }
  };

  const handleGuestContinue = async () => {
    try { await signInAnonymously(auth); setShowAuthModal(false); } catch (err) { setAuthError("Hizmet şu an kullanılamıyor."); }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setCart([]); setIsAccountOpen(false); setRelatives(initialRelatives); setSelectedRelativeId('sample-1');
  };

  // --- İŞLEMLER ---
  const handleAddRelativeSubmit = async (e) => {
    e.preventDefault();
    if (!user || !db) return;
    const fullCemetery = `${newRelativeData.cemetery} ${newRelativeData.ada ? `${newRelativeData.ada}. Ada` : ''} ${newRelativeData.parsel ? `${newRelativeData.parsel}. Parsel` : ''}`;
    try {
      const docRef = await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'relatives'), {
        ...newRelativeData, cemetery: fullCemetery, image: 'https://images.unsplash.com/photo-1505692794401-f111dfdb059f?auto=format&fit=crop&q=80&w=150', createdAt: Date.now()
      });
      setIsAddRelativeOpen(false); setSelectedRelativeId(docRef.id);
      setNewRelativeData({ name: '', relation: '', cemetery: '', ada: '', parsel: '', gps: '' });
    } catch (err) {}
  };

  const handleCheckout = async () => {
    if (!user || !selectedRelative) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'orders'), {
        orderNumber: `HZ-${Math.floor(Math.random()*90000)+10000}`, date: new Date().toLocaleDateString('tr-TR'),
        items: cart, total: totalCartPrice, status: 'Havale Bekliyor', relativeName: selectedRelative.name, note: orderNote, createdAt: Date.now()
      });
      if (usePoints) setHuzurPoints(prev => prev - pointsDiscount);
      setCart([]); setOrderPlaced(true); setOrderNote('');
      setTimeout(() => { setOrderPlaced(false); setIsCartOpen(false); }, 4000);
    } catch (err) {}
  };

  const handleCompleteOrder = (orderId) => {
    setVendorOrders(vendorOrders.map(o => o.id === orderId ? { ...o, status: 'Tamamlandı' } : o));
    setUploadModalOpen(null);
  };

  const handleApproveDoc = (id) => {
    setUploadedDocs(uploadedDocs.map(doc => doc.id === id ? { ...doc, status: 'Onaylandı' } : doc));
  };
  const handleRejectDoc = (id) => {
    setUploadedDocs(uploadedDocs.map(doc => doc.id === id ? { ...doc, status: 'Reddedildi' } : doc));
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700"></div></div>;

  // ==========================================
  // 1. ADMIN PANELİ GÖRÜNÜMÜ
  // ==========================================
  if (viewMode === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
        <header className="bg-slate-900 text-white shadow-md sticky top-0 z-30 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3"><Shield className="text-blue-400" size={24} /><h1 className="text-xl font-bold tracking-tight uppercase">Yönetici Paneli</h1></div>
          <button onClick={() => setViewMode('customer')} className="text-xs bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl transition font-bold uppercase tracking-widest">Uygulamaya Dön</button>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-200 border-l-4 border-l-blue-500 flex items-center gap-5">
              <div className="bg-blue-50 p-4 rounded-2xl text-blue-600"><Users size={28}/></div>
              <div><p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Toplam Kullanıcı</p><h3 className="text-2xl font-black text-gray-900">1,248</h3></div>
            </div>
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-200 border-l-4 border-l-orange-500 flex items-center gap-5">
              <div className="bg-orange-50 p-4 rounded-2xl text-orange-600"><FileText size={28}/></div>
              <div><p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Onay Bekleyen Evrak</p><h3 className="text-2xl font-black text-gray-900">{uploadedDocs.filter(d => d.status === 'Bekliyor').length} Adet</h3></div>
            </div>
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-200 border-l-4 border-l-emerald-500 flex items-center gap-5">
              <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600"><Store size={28}/></div>
              <div><p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Aktif İş Ortağı</p><h3 className="text-2xl font-black text-gray-900">24</h3></div>
            </div>
          </div>

          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6 uppercase tracking-tighter"><ShieldCheck className="text-slate-600"/> İş Ortağı Evrak Onay Merkezi</h2>
            <div className="space-y-4">
              {uploadedDocs.map(doc => (
                <div key={doc.id} className="flex flex-col md:flex-row md:items-center justify-between bg-gray-50 p-5 rounded-3xl border border-gray-200 gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm"><FileText size={24} className="text-slate-500"/></div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">{doc.type}</h4>
                      <div className="text-[10px] text-gray-500 mt-1 flex items-center gap-2 font-bold uppercase tracking-wider"><span className="text-emerald-700 flex items-center gap-1"><Store size={12}/> {doc.vendorName}</span> <span>|</span> <Calendar size={12}/> {doc.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest ${doc.status === 'Onaylandı' ? 'bg-emerald-100 text-emerald-700' : doc.status === 'Reddedildi' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{doc.status}</div>
                    {doc.status === 'Bekliyor' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleRejectDoc(doc.id)} className="p-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-xl transition"><XCircle size={20}/></button>
                        <button onClick={() => handleApproveDoc(doc.id)} className="p-2 bg-white border border-emerald-200 text-emerald-600 hover:bg-emerald-50 rounded-xl transition"><Check size={20}/></button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // 2. VENDOR (SATICI) PANELİ GÖRÜNÜMÜ
  // ==========================================
  if (viewMode === 'vendor') {
    return (
      <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
        <header className="bg-emerald-900 text-white px-6 py-4 sticky top-0 z-30 flex justify-between items-center shadow-md border-b border-emerald-800">
          <div className="flex items-center gap-3"><Store size={24} className="text-emerald-400" /><h1 className="text-xl font-bold tracking-tight uppercase">Satıcı Paneli</h1></div>
          <button onClick={() => setViewMode('customer')} className="text-[10px] bg-emerald-800 hover:bg-emerald-700 px-4 py-2 rounded-xl transition font-bold uppercase tracking-widest border border-emerald-700">Uygulamaya Dön</button>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-center">
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-200"><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Aylık Kazanç</p><h3 className="text-3xl font-black text-emerald-700">12.450 ₺</h3></div>
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-200"><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Aktif İşler</p><h3 className="text-3xl font-black text-blue-600">{vendorOrders.filter(o => o.status === 'Yeni').length} Sipariş</h3></div>
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-200"><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Müşteri Puanı</p><h3 className="text-3xl font-black text-yellow-500">4.9 / 5.0</h3></div>
           </div>
           
           <div className="flex border-b border-gray-200 mb-8 font-bold text-xs uppercase tracking-widest">
            <button onClick={() => setVendorPanelTab('siparisler')} className={`pb-4 px-4 border-b-2 transition-colors ${vendorPanelTab === 'siparisler' ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>Gelen Siparişler</button>
            <button onClick={() => setVendorPanelTab('evraklar')} className={`pb-4 px-4 border-b-2 transition-colors ${vendorPanelTab === 'evraklar' ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>Resmi Evraklar</button>
          </div>

           {vendorPanelTab === 'siparisler' ? (
             <div className="space-y-4">
               {vendorOrders.map(order => (
                  <div key={order.id} className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${order.status === 'Yeni' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                    <div className="flex-1 pl-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded">{order.id}</span>
                        <span className={`text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${order.status === 'Yeni' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>{order.status}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1"><Clock size={12}/> {order.date}</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 tracking-tight">{order.service}</h3>
                      <div className="text-[11px] text-gray-500 mt-2 font-medium flex flex-col sm:flex-row sm:gap-4 uppercase">
                        <span className="flex items-center gap-1.5"><User size={14} className="text-gray-400"/> Müşteri: {order.customer}</span>
                        <span className="flex items-center gap-1.5"><MapPin size={14} className="text-gray-400"/> Konum: {order.relative} ({order.cemetery})</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3 border-t md:border-t-0 pt-4 md:pt-0">
                      <div className="text-2xl font-black text-emerald-800">{order.price} ₺</div>
                      {order.status === 'Yeni' ? (
                        <button onClick={() => setUploadModalOpen(order.id)} className="bg-emerald-700 text-white px-6 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg hover:bg-emerald-800 transition active:scale-95 uppercase tracking-widest"><Camera size={16}/> İşlem Raporla</button>
                      ) : (
                        <button disabled className="bg-gray-100 text-gray-400 px-6 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 uppercase tracking-widest"><CheckCircle size={16}/> Tamamlandı</button>
                      )}
                    </div>
                  </div>
               ))}
             </div>
           ) : (
             <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-200">
                <div className="mb-8"><h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2 uppercase tracking-tight"><ShieldCheck className="text-emerald-700"/> Çalışma İzin Belgeleri</h3><p className="text-xs text-gray-500 font-medium">Hizmet verebilmeniz için mezarlıklar müdürlüğü onaylı çalışma ruhsatınızı sisteme yüklemeniz zorunludur.</p></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="border-2 border-dashed border-gray-200 p-10 rounded-[32px] flex flex-col items-center justify-center text-center hover:bg-emerald-50 hover:border-emerald-300 cursor-pointer transition" onClick={() => alert("Dosya yükleme penceresi açıldı.")}><Upload size={36} className="text-gray-300 mb-4"/><h4 className="font-bold text-gray-700 text-sm uppercase tracking-widest">Yeni Evrak Yükle</h4><p className="text-[10px] text-gray-400 mt-2 font-bold uppercase">PDF, JPG VEYA PNG</p></div>
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-100 pb-2">Mevcut Evraklarınız</h4>
                    {uploadedDocs.filter(d => d.vendorName === 'Huzur Mezar Bakım').map(doc => (
                      <div key={doc.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center">
                        <div className="flex items-center gap-4"><FileText className="text-emerald-700" size={20}/><div><p className="text-xs font-bold text-gray-900">{doc.type}</p><p className="text-[9px] text-gray-400 font-bold uppercase mt-1">{doc.date}</p></div></div>
                        <span className={`text-[9px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${doc.status === 'Onaylandı' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>{doc.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
             </div>
           )}

           {/* FOTOĞRAF YÜKLEME MODALI (SATICI) */}
           {uploadModalOpen && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 border border-gray-100">
                  <div className="p-8 border-b border-gray-100 flex justify-between items-center"><h2 className="font-bold text-gray-900 uppercase tracking-tighter">İşlem Raporlama</h2><button onClick={() => setUploadModalOpen(null)} className="p-2 bg-gray-50 rounded-2xl hover:bg-gray-100 transition"><X size={20}/></button></div>
                  <div className="p-8 space-y-6">
                    <div className="bg-blue-50 text-blue-800 p-4 rounded-2xl text-[10px] font-bold border border-blue-100 uppercase tracking-tight leading-relaxed">Müşteriye iletilmek üzere hizmetin öncesi ve sonrası fotoğraflarını yükleyin.</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border-2 border-dashed border-gray-200 rounded-[28px] p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-emerald-50 hover:border-emerald-300 transition h-36 group"><ImagePlus className="w-8 h-8 text-gray-300 group-hover:text-emerald-600 mb-3" /><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest group-hover:text-emerald-700">Öncesi</span></div>
                      <div className="border-2 border-dashed border-gray-200 rounded-[28px] p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-emerald-50 hover:border-emerald-300 transition h-36 group"><Upload className="w-8 h-8 text-gray-300 group-hover:text-emerald-600 mb-3" /><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest group-hover:text-emerald-700">Sonrası</span></div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Ekstra Not (Müşteriye Gider)</label>
                      <textarea className="w-full bg-gray-50 border border-gray-200 rounded-3xl p-4 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-700 h-24 resize-none" placeholder="Örn: Toprak çok kurumuştu, ekstra sulama yapıldı..."></textarea>
                    </div>
                    <button onClick={() => handleCompleteOrder(uploadModalOpen)} className="w-full bg-emerald-800 text-white font-bold py-5 rounded-3xl shadow-xl hover:bg-emerald-900 transition active:scale-95 text-xs uppercase tracking-[0.2em]">Raporu Gönder ve Tamamla</button>
                  </div>
                </div>
             </div>
           )}
        </main>
      </div>
    );
  }

  // ==========================================
  // 3. MÜŞTERİ (ANA VİTRİN) GÖRÜNÜMÜ
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20 md:pb-0">
      
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedVendor(null)}>
          <div className="bg-emerald-700 p-2.5 rounded-[18px] text-white shadow-sm"><Flower2 size={24}/></div>
          <h1 className="text-2xl font-black text-gray-900 hidden sm:block tracking-tighter uppercase">HuzurBahçesi</h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => { if (!user || user.isAnonymous) setShowAuthModal(true); else { setAccountView('menu'); setIsAccountOpen(true); } }} className="flex items-center gap-2 text-gray-700 font-bold hover:text-emerald-700 transition-colors p-2.5 rounded-2xl hover:bg-gray-50">
            <div className="relative"><User size={22} />{user && <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>}</div>
            <span className="hidden sm:block text-xs uppercase tracking-widest">{(user && !user.isAnonymous) ? (user.displayName?.split(' ')[0] || 'Hesabım') : 'Giriş / Kayıt'}</span>
          </button>
          <button onClick={() => setIsCartOpen(true)} className="relative p-3 bg-gray-50 rounded-2xl text-gray-700 border border-gray-200 transition-all active:scale-95 hover:bg-gray-100">
            <ShoppingBag size={22} />
            {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black rounded-full w-6 h-6 flex items-center justify-center animate-pulse shadow-md">{cart.length}</span>}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        
        {/* MEZAR KAYITLARI */}
        <section className="mb-12">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-5 px-2">Mezar Kayıtları</h2>
          <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide">
            {relatives.length === 0 ? (
              <div className="bg-emerald-50/50 p-8 rounded-[40px] text-center w-full border border-emerald-100 shadow-inner">
                <div className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center mx-auto mb-4 text-emerald-300 shadow-sm"><User size={32}/></div>
                <p className="text-sm text-emerald-800 font-bold uppercase tracking-tight">Kayıtlı Yakınınız Bulunmuyor</p>
                <button onClick={() => setIsAddRelativeOpen(true)} className="mt-6 bg-emerald-700 text-white text-xs font-bold px-10 py-3 rounded-2xl shadow-lg active:scale-95 transition-all uppercase tracking-widest">Yeni Kayıt Ekle</button>
              </div>
            ) : (
              relatives.map(r => (
                <button key={r.id} onClick={() => { setSelectedRelativeId(r.id); setSelectedVendor(null); }} className={`flex items-center gap-4 p-5 rounded-[36px] border-2 min-w-[280px] text-left transition-all duration-300 ${selectedRelativeId === r.id ? 'border-emerald-600 bg-emerald-50 shadow-md shadow-emerald-100/50' : 'border-gray-200 bg-white hover:border-gray-300 shadow-sm'}`}>
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200"><img src={r.image} className="w-full h-full object-cover opacity-90" alt=""/></div>
                  <div className="flex-1 overflow-hidden">
                    <div className="font-bold text-sm text-gray-900 flex justify-between items-center uppercase tracking-tight">{r.name} {selectedRelativeId === r.id && <CheckCircle size={18} className="text-emerald-600" />}</div>
                    <div className="text-[10px] text-emerald-800 font-bold mt-1 truncate uppercase tracking-widest opacity-80">{r.cemetery}</div>
                  </div>
                </button>
              ))
            )}
            <button onClick={() => { if(!user) setShowAuthModal(true); else setIsAddRelativeOpen(true); }} className="flex items-center justify-center gap-3 p-5 rounded-[36px] border-2 border-dashed border-gray-300 min-w-[140px] bg-gray-50 text-gray-500 hover:bg-white hover:border-emerald-500 hover:text-emerald-700 transition-all active:scale-95 group"><Plus className="group-hover:rotate-90 transition-transform"/><span className="font-bold text-[10px] uppercase tracking-[0.2em]">Yeni Kayıt</span></button>
          </div>
        </section>

        {!selectedVendor && <HowItWorks />}

        {/* ANA AKIŞ */}
        {selectedRelative && (
          <>
            {!selectedVendor ? (
              <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 p-12 rounded-[48px] text-white mb-12 shadow-xl relative overflow-hidden border border-emerald-900">
                  <div className="absolute -right-16 -top-16 opacity-10 rotate-12"><Flower2 size={300}/></div>
                  <div className="relative z-10">
                    <div className="bg-yellow-500 text-yellow-950 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.3em] mb-5 inline-block shadow-sm">Bayram Kampanyası</div>
                    <h3 className="text-4xl font-black mb-4 tracking-tighter leading-none">Mezar Bakım Hizmetleri</h3>
                    <p className="text-sm opacity-90 max-w-md leading-relaxed mb-10 font-medium">Onaylı profesyonel ekiplerimiz ile mezar temizliği, çiçeklendirme ve onarım hizmetlerini yerinde gerçekleştiriyor, fotoğraf ile raporluyoruz.</p>
                    <button onClick={() => setSelectedVendor(vendors[0])} className="bg-white text-emerald-950 px-12 py-4 rounded-3xl font-black text-xs shadow-2xl active:scale-95 transition-all uppercase tracking-[0.2em] hover:bg-gray-100">Hizmetleri Görüntüle</button>
                  </div>
                </div>
                <h2 className="text-lg font-black text-gray-900 flex items-center gap-3 mb-8 px-2 uppercase tracking-tighter"><BadgeCheck className="text-emerald-700" size={24}/> Onaylı İş Ortakları</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {vendors.map(v => (
                    <button key={v.id} onClick={() => setSelectedVendor(v)} className="bg-white p-6 rounded-[40px] border border-gray-200 flex gap-6 hover:border-emerald-700 transition-all duration-300 text-left shadow-sm group">
                      <div className="w-28 h-28 rounded-3xl overflow-hidden shadow-sm flex-shrink-0"><img src={v.image} className="w-full h-full object-cover grayscale-[15%] group-hover:grayscale-0 transition-all duration-500" alt=""/></div>
                      <div className="flex-1 py-1">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-base text-gray-900 tracking-tight">{v.name} {v.isVerified && <BadgeCheck size={18} className="text-blue-600 inline ml-1"/>}</h4>
                          <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2.5 py-1 rounded-xl border border-gray-200 flex items-center gap-1"><Star size={12} className="fill-yellow-500 text-yellow-500"/> {v.rating}</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-5 font-medium">{v.tags}</p>
                        <div className="flex gap-5 font-bold text-[9px] text-gray-400 uppercase tracking-widest">
                          <span className="flex items-center gap-1.5"><Clock size={14} className="text-emerald-700"/> {v.time}</span>
                          <span className="flex items-center gap-1.5 text-gray-700"><ShoppingBag size={14} className="text-emerald-700"/> {v.minOrder} ₺ Min.</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-6 duration-300">
                <button onClick={() => setSelectedVendor(null)} className="flex items-center gap-2 text-emerald-700 text-[10px] font-bold mb-8 hover:underline uppercase tracking-[0.3em] group"><ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> Hizmetlere Dön</button>
                <div className="bg-white p-10 rounded-[48px] border border-gray-200 flex flex-col md:flex-row items-center gap-10 shadow-sm mb-12">
                  <div className="w-36 h-36 rounded-[32px] border-4 border-gray-50 overflow-hidden shadow-md flex-shrink-0"><img src={selectedVendor.image} className="w-full h-full object-cover" alt=""/></div>
                  <div className="text-center md:text-left flex-1">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-3 uppercase">{selectedVendor.name} {selectedVendor.isVerified && <span className="bg-blue-50 text-blue-700 text-[10px] px-3 py-1 rounded-full flex items-center gap-1 border border-blue-100 inline-block align-middle ml-2"><BadgeCheck size={14}/> ONAYLI</span>}</h2>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] opacity-80">{selectedVendor.tags}</p>
                    <div className="flex justify-center md:justify-start gap-4 mt-8 font-bold text-xs uppercase tracking-tight"><span className="bg-emerald-50 text-emerald-800 px-6 py-2.5 rounded-2xl border border-emerald-100">Puan: {selectedVendor.rating}</span><span className="bg-gray-50 text-gray-700 px-6 py-2.5 rounded-2xl border border-gray-200">Hız: {selectedVendor.time}</span></div>
                  </div>
                </div>
                <div className="flex border-b mb-10 text-[11px] font-bold uppercase tracking-[0.25em] bg-white rounded-3xl px-2 shadow-sm border border-gray-100">
                  <button onClick={() => setVendorTab('hizmetler')} className={`flex-1 py-4 border-b-2 transition-all rounded-xl ${vendorTab === 'hizmetler' ? 'border-emerald-700 text-emerald-800 bg-emerald-50/50' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>Hizmetler</button>
                  <button onClick={() => setVendorTab('galeri')} className={`flex-1 py-4 border-b-2 transition-all rounded-xl ${vendorTab === 'galeri' ? 'border-emerald-700 text-emerald-800 bg-emerald-50/50' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>Referanslar</button>
                  <button onClick={() => setVendorTab('yorumlar')} className={`flex-1 py-4 border-b-2 transition-all rounded-xl ${vendorTab === 'yorumlar' ? 'border-emerald-700 text-emerald-800 bg-emerald-50/50' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>Yorumlar</button>
                </div>
                {vendorTab === 'hizmetler' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {vendorProducts.map(p => (
                      <div key={p.id} className="bg-white rounded-[40px] overflow-hidden border border-gray-200 flex flex-col hover:shadow-xl transition-all duration-500 group shadow-sm">
                        <div className="h-52 bg-gray-100 relative overflow-hidden"><img src={p.image || 'https://images.unsplash.com/photo-1592424001809-5b9c24ce4e73?auto=format&fit=crop&q=80&w=300'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt=""/><div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-5 py-2 rounded-2xl font-black text-emerald-900 text-sm shadow-xl border border-gray-100">{p.price} ₺</div></div>
                        <div className="p-8 flex flex-col flex-1 text-center items-center">
                          <h3 className="font-bold text-sm text-gray-900 mb-3 uppercase tracking-tight">{p.name}</h3>
                          {p.isSubscription && <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-blue-800 bg-blue-50 px-3 py-1.5 rounded-xl mb-4 border border-blue-100 uppercase tracking-widest"><RefreshCw size={12}/> Düzenli Paket</span>}
                          <p className="text-[11px] text-gray-500 mb-8 font-medium leading-relaxed flex-1 px-2">{p.desc}</p>
                          <button onClick={() => { if(!user) setShowAuthModal(true); else setCart([...cart, {...p, cartId: Math.random(), vendorName: selectedVendor.name}]); }} className="w-full bg-emerald-800 text-white font-bold py-4 rounded-3xl shadow-lg shadow-emerald-100 hover:bg-emerald-950 active:scale-95 transition-all flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.2em]">Sepete Ekle</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : vendorTab === 'galeri' ? (
                  <div className="space-y-10">{selectedVendor.gallery.map(g => (<div key={g.id} className="bg-white p-8 rounded-[48px] shadow-sm border border-gray-200"><h4 className="font-bold text-xs text-gray-800 mb-6 uppercase tracking-[0.2em] px-2">{g.title}</h4><BeforeAfterSlider before={g.before} after={g.after}/></div>))}</div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-gray-50 text-gray-800 p-6 rounded-[32px] text-[10px] font-bold border border-gray-200 shadow-inner flex items-center gap-4"><ShieldCheck size={24} className="text-emerald-700 flex-shrink-0"/><p className="uppercase tracking-tight opacity-70 leading-relaxed">Sistemimizdeki tüm değerlendirmeler sadece doğrulanmış hizmet alımları sonrası yapılabilmektedir.</p></div>
                    {selectedVendor.reviews.map(r => (<div key={r.id} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm text-left"><div className="flex justify-between items-center mb-5"><div className="flex items-center gap-4 font-bold text-xs text-gray-800"><div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-base border border-gray-200">{r.user.substring(0,1)}</div><div className="flex flex-col gap-1"><span className="uppercase tracking-tight">{r.user}</span><span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{r.date}</span></div></div><div className="text-yellow-500 text-xs tracking-widest">★ ★ ★ ★ ★</div></div><p className="text-xs text-gray-600 font-medium italic leading-relaxed px-1">"{r.text}"</p></div>))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 py-20 px-8 relative z-10 text-center md:text-left mt-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-3 mb-6 text-emerald-800 font-bold"><Flower2 size={32}/><span className="text-2xl tracking-tighter uppercase">HuzurBahçesi</span></div>
            <p className="text-[11px] text-gray-500 font-medium leading-relaxed max-w-xs uppercase tracking-wider opacity-80">Kurumsal mezar bakım ve onarım hizmetleri takip platformu.</p>
          </div>
          <div className="flex flex-col gap-5 font-bold text-[10px] uppercase tracking-[0.3em] text-gray-500">
            <h4 className="text-gray-900 mb-2 border-b-2 border-emerald-700 w-max pb-2">Bilgi Merkezi</h4>
            <button onClick={() => setInfoModal('about')} className="hover:text-emerald-700 transition text-left">Hakkımızda</button>
            <button onClick={() => setInfoModal('help')} className="hover:text-emerald-700 transition text-left">Yardım ve SSS</button>
            <button onClick={() => setInfoModal('terms')} className="hover:text-emerald-700 transition text-left">Yasal Sözleşmeler</button>
          </div>
          <div className="flex flex-col items-center md:items-start font-bold">
            <h4 className="text-[10px] uppercase tracking-[0.3em] text-gray-900 mb-6 border-b-2 border-emerald-700 w-max pb-2">Güvenlik</h4>
            <div className="flex gap-5 opacity-30 grayscale mb-8"><CheckCircle size={28}/><ShieldCheck size={28}/><Lock size={28}/></div>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">© 2026 HuzurBahçesi. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>

      {/* WHATSAPP FLOAT */}
      <a href="https://wa.me/908501234567" target="_blank" rel="noreferrer" className="fixed bottom-8 right-8 bg-[#25D366] text-white p-5 rounded-3xl shadow-xl hover:scale-110 active:scale-95 transition-all z-40"><MessageCircle size={32}/></a>

      {/* MODALLAR */}
      
      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative bg-white rounded-[56px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="bg-emerald-900 p-12 text-center text-white relative">
              <button onClick={() => setShowAuthModal(false)} className="absolute top-8 right-8 text-emerald-300 hover:text-white transition-all"><X size={28}/></button>
              <h1 className="text-3xl font-black tracking-tighter uppercase mb-2">HuzurBahçesi</h1>
              <p className="text-emerald-300 text-[10px] font-bold tracking-[0.3em] uppercase opacity-80">{isRegistering ? 'Yeni Hesap Oluşturun' : 'Hoş Geldiniz'}</p>
            </div>
            <div className="p-10">
              {authError && <div className="bg-red-50 text-red-700 text-[10px] font-bold p-4 rounded-2xl border border-red-100 text-center mb-6">{authError}</div>}
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {isRegistering && (
                  <div className="relative"><User className="absolute left-6 top-4.5 w-5 h-5 text-gray-400" style={{marginTop: '12px'}}/><input type="text" required value={registerName} onChange={(e) => setRegisterName(e.target.value)} className="w-full pl-16 pr-8 py-4.5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-2 focus:ring-emerald-700 font-bold text-sm transition-all" placeholder="AD SOYAD"/></div>
                )}
                <div className="relative"><Mail className="absolute left-6 top-4.5 w-5 h-5 text-gray-400" style={{marginTop: '12px'}}/><input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full pl-16 pr-8 py-4.5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-2 focus:ring-emerald-700 font-bold text-sm transition-all" placeholder="E-POSTA ADRESİ"/></div>
                <div className="relative"><Lock className="absolute left-6 top-4.5 w-5 h-5 text-gray-400" style={{marginTop: '12px'}}/><input type="password" required minLength="6" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full pl-16 pr-8 py-4.5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-2 focus:ring-emerald-700 font-bold text-sm transition-all" placeholder="ŞİFRE"/></div>
                <button type="submit" className="w-full bg-emerald-800 text-white font-bold py-5 rounded-3xl shadow-xl hover:bg-emerald-950 transition active:scale-95 text-lg mt-2 uppercase tracking-widest">{isRegistering ? 'Hesap Aç' : 'Giriş Yap'}</button>
                <div className="grid grid-cols-1 gap-3 mt-8">
                   <button type="button" onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-4 bg-white border border-gray-200 text-gray-700 font-bold py-4 rounded-3xl hover:bg-gray-50 transition active:scale-95 text-[10px] uppercase tracking-[0.2em]">
                     <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                     Google ile Devam Et
                   </button>
                   <button type="button" onClick={handleGuestContinue} className="w-full py-2 text-emerald-800 font-bold text-[10px] uppercase tracking-widest hover:underline mt-2">Kayıt Olmadan Devam Et</button>
                </div>
                <div className="text-center mt-6">
                   <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="text-gray-500 font-bold text-[10px] uppercase tracking-widest hover:text-emerald-700 transition-colors">
                      {isRegistering ? 'Zaten hesabınız var mı? Giriş Yapın' : 'Henüz üye değil misiniz? Kayıt Olun'}
                   </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ACCOUNT MODAL */}
      {isAccountOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md animate-in fade-in" onClick={() => setIsAccountOpen(false)}></div>
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {accountView === 'menu' && (
              <>
                <div className="p-8 border-b border-gray-100 flex justify-between items-center"><h2 className="text-xl font-bold uppercase text-gray-900 tracking-tighter">Hesap Bilgileri</h2><button onClick={() => setIsAccountOpen(false)} className="p-2 bg-gray-50 rounded-2xl transition hover:bg-gray-100"><X size={24}/></button></div>
                <div className="p-8 flex flex-col items-center border-b border-gray-100 bg-gray-50/50">
                  <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center mb-5 text-emerald-800 shadow-sm border border-gray-200"><User size={40}/></div>
                  <h3 className="font-bold text-lg text-gray-900 uppercase tracking-tight">{user?.displayName || 'Kullanıcı'}</h3>
                  <p className="text-[11px] text-gray-500 font-bold mt-1 uppercase tracking-widest">{user?.email}</p>
                  <div className="mt-8 bg-emerald-900 w-full rounded-[32px] p-6 flex justify-between items-center text-white shadow-xl">
                    <div className="flex items-center gap-3 font-bold text-[11px] uppercase tracking-[0.2em]"><Wallet size={20}/> Puan Bakiyesi</div>
                    <span className="text-2xl font-black">{huzurPoints} ₺</span>
                  </div>
                </div>
                <div className="p-6 flex-1 space-y-3 overflow-y-auto font-bold text-[11px] uppercase tracking-widest text-gray-600">
                  <button onClick={() => setAccountView('orders')} className="w-full flex justify-between items-center p-5 rounded-3xl hover:bg-emerald-50 hover:text-emerald-800 transition-all border border-transparent hover:border-emerald-100"><span>Siparişlerim</span><span className="bg-emerald-800 text-white text-[10px] px-3 py-1 rounded-full">{orders.length}</span></button>
                  <button onClick={() => setAccountView('reminders')} className="w-full flex justify-between items-center p-5 rounded-3xl hover:bg-emerald-50 hover:text-emerald-800 transition-all border border-transparent hover:border-emerald-100"><span>Hatırlatıcılar</span><span className="bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-md">YENİ</span></button>
                  <button onClick={() => setAccountView('settings')} className="w-full flex items-center gap-4 p-5 rounded-3xl hover:bg-emerald-50 hover:text-emerald-800 transition-all border border-transparent hover:border-emerald-100 text-left"><span>Hesap Ayarları</span></button>
                </div>
                <div className="p-8 border-t border-gray-100"><button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 bg-red-50 text-red-700 font-bold py-5 rounded-[28px] hover:bg-red-100 transition active:scale-95 uppercase tracking-widest text-xs">Güvenli Çıkış</button></div>
              </>
            )}

            {accountView === 'orders' && (
              <>
                <div className="p-8 border-b border-gray-100 flex items-center gap-4"><button onClick={() => setAccountView('menu')} className="p-2 hover:bg-gray-100 rounded-2xl transition"><ChevronLeft size={24}/></button><h2 className="text-xl font-bold uppercase text-gray-900 tracking-tighter">Siparişlerim</h2></div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                  {orders.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50"><Package size={48} className="mb-4"/><p className="font-bold text-xs uppercase tracking-widest">Kayıt Bulunamadı</p></div> : orders.map(o => (
                    <div key={o.id} className="bg-white p-5 rounded-[32px] border border-gray-200 shadow-sm relative overflow-hidden">
                      <div className={`absolute top-0 left-0 w-2 h-full ${o.status.includes('Bekliyor') ? 'bg-orange-400' : 'bg-emerald-500'}`}></div>
                      <div className="flex justify-between items-start mb-3 pl-2"><div><div className="text-[9px] font-bold text-gray-400 tracking-widest mb-1">{o.orderNumber}</div><div className="font-bold text-sm text-gray-900 uppercase tracking-tight">{o.relativeName}</div></div><span className="text-[9px] bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">{o.status}</span></div>
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50 pl-2"><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{o.date}</span><span className="font-black text-emerald-800">{o.total} ₺</span></div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {accountView === 'reminders' && (
              <>
                <div className="p-8 border-b border-gray-100 flex items-center gap-4"><button onClick={() => setAccountView('menu')} className="p-2 hover:bg-gray-100 rounded-2xl transition"><ChevronLeft size={24}/></button><h2 className="text-xl font-bold uppercase text-gray-900 tracking-tighter">Hatırlatıcılar</h2></div>
                <div className="flex-1 p-8 space-y-6 bg-gray-50/50 overflow-y-auto">
                   <div className="bg-emerald-50 p-6 rounded-[32px] border border-emerald-100"><p className="text-[11px] text-emerald-800 font-bold uppercase tracking-wide leading-relaxed">Özel günleri ve vefat yıldönümlerini kaydedin, zamanı geldiğinde bakım planlaması için size haber verelim.</p></div>
                   <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-200 opacity-60"><div className="flex justify-between items-center mb-2"><h4 className="font-bold text-sm text-gray-900 uppercase tracking-tight">Anneler Günü</h4><span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Mayıs 11</span></div><p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1 text-emerald-600">Bakım Planlandı</p></div>
                   <button className="w-full border-2 border-dashed border-gray-300 p-6 rounded-[32px] flex items-center justify-center gap-2 text-gray-500 font-bold text-xs uppercase tracking-widest hover:bg-white hover:border-emerald-500 hover:text-emerald-700 transition-all"><Plus size={18}/> Yeni Kayıt</button>
                </div>
              </>
            )}

            {accountView === 'settings' && (
              <>
                <div className="p-8 border-b border-gray-100 flex items-center gap-4"><button onClick={() => setAccountView('menu')} className="p-2 hover:bg-gray-100 rounded-2xl transition"><ChevronLeft size={24}/></button><h2 className="text-xl font-bold uppercase text-gray-900 tracking-tighter">Ayarlar</h2></div>
                <div className="flex-1 p-8 space-y-8 bg-gray-50/50">
                   <div><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">Hesap E-Postası</label><input type="text" readOnly value={user?.email} className="w-full border-b-2 border-gray-200 py-3 bg-transparent outline-none text-sm font-bold text-gray-800 uppercase tracking-tight"/></div>
                   <div className="flex items-center justify-between py-4 border-b border-gray-200"><span className="text-xs font-bold text-gray-700 uppercase tracking-widest">SMS Bildirimleri</span><div className="w-12 h-7 bg-emerald-600 rounded-full p-1 transition-all"><div className="w-5 h-5 bg-white rounded-full ml-auto shadow-sm"></div></div></div>
                   <div className="flex items-center justify-between py-4 border-b border-gray-200"><span className="text-xs font-bold text-gray-700 uppercase tracking-widest">E-Posta Kampanyaları</span><div className="w-12 h-7 bg-gray-300 rounded-full p-1 transition-all"><div className="w-5 h-5 bg-white rounded-full shadow-sm"></div></div></div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* CART MODAL */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center"><h2 className="text-2xl font-bold uppercase text-gray-900 tracking-tighter">Sepet Detayı</h2><button onClick={() => setIsCartOpen(false)} className="p-2 bg-gray-50 rounded-2xl hover:bg-gray-100 transition"><X size={24}/></button></div>
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
              {cart.length === 0 && !orderPlaced ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-40"><ShoppingBag size={64} className="mb-6"/><p className="font-bold text-sm uppercase tracking-[0.2em]">Sepetiniz Boş</p></div>
              ) : orderPlaced ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-10">
                  <div className="w-28 h-28 bg-emerald-50 text-emerald-700 rounded-[40px] flex items-center justify-center mb-8 shadow-inner border border-emerald-100"><Check size={48}/></div>
                  <h3 className="text-2xl font-bold text-gray-900 uppercase tracking-tighter leading-tight mb-2">Sipariş Alındı</h3>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest leading-relaxed">Ödemeniz doğrulandıktan sonra bakım süreci planlanacaktır.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {cart.map(item => (
                    <div key={item.cartId} className="flex gap-5 p-5 bg-white rounded-[32px] border border-gray-200 shadow-sm relative group">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200 shadow-sm"><img src={item.image} className="w-full h-full object-cover grayscale-[20%]" alt=""/></div>
                      <div className="flex-1 py-1"><div className="text-[9px] text-emerald-800 font-bold uppercase tracking-[0.2em] mb-1.5">{item.vendorName}</div><h4 className="font-bold text-sm text-gray-900 uppercase tracking-tight leading-tight">{item.name}</h4><div className="text-base font-black text-emerald-700 mt-2 tracking-tighter">{item.price} ₺</div></div>
                      <button onClick={() => setCart(cart.filter(i => i.cartId !== item.cartId))} className="text-gray-400 hover:text-red-500 transition-all self-start p-1"><X size={20}/></button>
                    </div>
                  ))}
                  
                  <div className="mt-8 space-y-4">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] px-2">Ekstra Hizmet</h4>
                    <label className={`flex items-center justify-between p-6 rounded-[32px] border-2 transition-all cursor-pointer ${liveVideo ? 'border-emerald-600 bg-emerald-50' : 'border-gray-200 bg-white hover:border-emerald-200'}`}>
                      <div className="flex items-center gap-5"><Video size={28} className={liveVideo ? 'text-emerald-700' : 'text-gray-400'}/><div className="text-xs font-bold uppercase tracking-tight">Canlı İzleme <span className="block text-[9px] text-gray-500 font-bold mt-1 tracking-widest">(+250 ₺)</span></div></div>
                      <input type="checkbox" checked={liveVideo} onChange={e => setLiveVideo(e.target.checked)} className="w-6 h-6 accent-emerald-700 rounded-full"/>
                    </label>
                  </div>

                  <div className="mt-8">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3 px-2">Sipariş Notu</h4>
                    <textarea value={orderNote} onChange={e => setOrderNote(e.target.value)} placeholder="Ekiplerimize iletmek istediğiniz notları yazınız..." className="w-full bg-white border border-gray-200 rounded-[32px] p-6 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-700 h-32 resize-none shadow-sm uppercase tracking-wide"></textarea>
                  </div>

                  <div className="mt-10 p-8 rounded-[48px] bg-emerald-950 text-white shadow-xl relative overflow-hidden border border-emerald-900">
                    <div className="absolute top-0 right-0 p-6 opacity-5"><Shield size={100}/></div>
                    <h4 className="text-[10px] font-bold mb-8 flex items-center gap-3 uppercase tracking-[0.3em] text-emerald-400"><Lock size={16}/> Ödeme (Havale/EFT)</h4>
                    <div className="space-y-6 text-sm font-bold uppercase tracking-tight">
                      <div><div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1.5">Hesap Ünvanı</div><div className="text-xs">HuzurBahçesi Bakım Hizmetleri Ltd. Şti.</div></div>
                      <div><div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1.5">Ziraat Bankası IBAN</div><div className="font-mono text-xs text-emerald-400 tracking-wider flex justify-between items-center bg-black/20 p-5 rounded-3xl border border-white/5 shadow-inner">TR00 0000 0000 0000 0000 0000 00 <Copy size={18} className="cursor-pointer hover:text-white transition-colors"/></div></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {cart.length > 0 && !orderPlaced && (
              <div className="p-8 bg-white border-t border-gray-100 space-y-6 shadow-[0_-20px_50px_rgba(0,0,0,0.05)] rounded-t-[48px] relative z-10">
                {huzurPoints > 0 && (
                  <label className="flex items-center justify-between bg-yellow-50 border border-yellow-200 p-6 rounded-[32px] cursor-pointer shadow-sm hover:bg-yellow-100 transition-colors">
                    <div className="flex items-center gap-4 text-yellow-900"><Wallet size={24}/><div className="text-[11px] font-bold uppercase tracking-widest">Puan Kullan <span className="block text-[9px] opacity-70 font-bold mt-1">Bakiyeniz: {huzurPoints} ₺</span></div></div>
                    <input type="checkbox" checked={usePoints} onChange={e => setUsePoints(e.target.checked)} className="w-6 h-6 accent-yellow-600 rounded-full"/>
                  </label>
                )}
                <div className="flex justify-between items-center px-2 font-bold uppercase tracking-[0.2em] mb-2"><span className="text-gray-400 text-xs">Toplam</span><span className="text-4xl text-emerald-900 tracking-tighter">{totalCartPrice} ₺</span></div>
                <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 mb-2"><div className="flex items-start gap-4"><input type="checkbox" required id="sales-check" className="mt-1 w-5 h-5 accent-emerald-800 rounded-md"/><label htmlFor="sales-check" className="text-[9px] text-gray-600 leading-relaxed font-bold uppercase tracking-widest"><button type="button" onClick={() => setInfoModal('terms')} className="text-emerald-700 underline">Mesafeli Satış Sözleşmesini</button> ve hizmet şartlarını onaylıyorum.</label></div></div>
                <button onClick={handleCheckout} className="w-full bg-emerald-900 text-white font-bold py-5 rounded-[32px] shadow-xl hover:bg-black active:scale-95 transition-all text-sm uppercase tracking-[0.3em]">Ödemeyi Onayla</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* YAKIN EKLE MODAL */}
      {isAddRelativeOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-md p-10 md:p-12 animate-in zoom-in-95 border border-gray-100">
            <div className="flex justify-between items-center mb-10"><h2 className="font-bold text-2xl text-gray-900 uppercase tracking-tighter">Yeni Kayıt</h2><button onClick={() => setIsAddRelativeOpen(false)} className="p-2 bg-gray-50 rounded-2xl hover:bg-gray-100 transition"><X size={24}/></button></div>
            <form onSubmit={handleAddRelativeSubmit} className="space-y-5">
              <input type="text" required placeholder="MERHUM ADI SOYADI" value={newRelativeData.name} onChange={e => setNewRelativeData({...newRelativeData, name: e.target.value.toUpperCase()})} className="w-full bg-gray-50 border border-gray-100 rounded-[32px] px-8 py-5 outline-none focus:ring-2 focus:ring-emerald-700 font-bold text-sm tracking-tight transition-all"/>
              <input type="text" required placeholder="YAKINLIK DERECESİ" value={newRelativeData.relation} onChange={e => setNewRelativeData({...newRelativeData, relation: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-[32px] px-8 py-5 outline-none focus:ring-2 focus:ring-emerald-700 font-bold text-sm tracking-tight transition-all"/>
              <select required value={newRelativeData.cemetery} onChange={e => setNewRelativeData({...newRelativeData, cemetery: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-[32px] px-8 py-5 outline-none focus:ring-2 focus:ring-emerald-700 font-bold text-sm text-gray-600 uppercase tracking-tight transition-all"><option value="">Mezarlık Seçiniz</option><option value="Karacaahmet Mezarlığı">Karacaahmet Mezarlığı</option><option value="Zincirlikuyu Mezarlığı">Zincirlikuyu Mezarlığı</option></select>
              <div className="flex gap-4">
                 <input type="text" placeholder="ADA NO" className="w-1/2 bg-gray-50 border border-gray-100 rounded-[32px] px-6 py-5 font-bold text-sm text-center tracking-widest transition-all" onChange={e => setNewRelativeData({...newRelativeData, ada: e.target.value})}/>
                 <input type="text" placeholder="PARSEL NO" className="w-1/2 bg-gray-50 border border-gray-100 rounded-[32px] px-6 py-5 font-bold text-sm text-center tracking-widest transition-all" onChange={e => setNewRelativeData({...newRelativeData, parsel: e.target.value})}/>
              </div>
              <button type="submit" className="w-full bg-emerald-900 text-white font-bold py-5 rounded-[32px] shadow-xl hover:bg-black transition active:scale-95 text-sm uppercase tracking-[0.3em] mt-8">Kaydet</button>
            </form>
          </div>
        </div>
      )}

      {/* BİLGİ MODALLARI (SSS, YASAL, KURUMSAL) */}
      {infoModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-[48px] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 border border-gray-100">
             <div className="p-10 border-b bg-gray-50 flex justify-between items-center"><h3 className="font-bold text-gray-900 uppercase tracking-[0.3em] text-[11px] flex items-center gap-3">{infoModal === 'about' ? <Shield size={18}/> : infoModal === 'help' ? <HelpCircle size={18}/> : <Gavel size={18}/>} {infoModal === 'about' ? 'Kurumsal Bilgiler' : infoModal === 'help' ? 'Müşteri Hizmetleri' : 'Yasal Mevzuat'}</h3><button onClick={() => setInfoModal(null)} className="text-gray-900 bg-white p-3 rounded-2xl shadow-sm border border-gray-200 hover:bg-gray-100 transition-colors"><X size={20}/></button></div>
             <div className="p-12 max-h-[65vh] overflow-y-auto text-sm text-gray-600 leading-relaxed font-semibold">
                {infoModal === 'about' && (
                  <div className="space-y-8 uppercase tracking-tight text-xs leading-loose text-gray-700">
                    <p>HuzurBahçesi, ebediyete intikal etmiş yakınlarımızın kabirlerinin profesyonel, şeffaf ve güvenilir bir şekilde bakımının yapılmasını sağlayan kurumsal bir pazar yeridir.</p>
                    <p>Hizmetlerimiz sadece belediye ve mezarlıklar müdürlüğünden çalışma ruhsatı bulunan uzman ekipler tarafından verilmektedir. Her işlemin öncesi ve sonrası fotoğraflanarak platform üzerinden raporlanır.</p>
                  </div>
                )}
                {infoModal === 'help' && (
                  <div className="space-y-10 tracking-tight font-bold text-gray-700">
                    <div><h4 className="text-gray-900 text-sm mb-3 uppercase tracking-widest border-l-4 border-emerald-700 pl-4">Hizmet Onay Süreci</h4><p className="text-xs text-gray-500 font-medium normal-case leading-relaxed">Talebiniz havale onayından sonra işleme alınır. Seçtiğiniz pakete göre 24-48 saat içerisinde hizmet tamamlanarak tarafınıza raporlanır.</p></div>
                    <div><h4 className="text-gray-900 text-sm mb-3 uppercase tracking-widest border-l-4 border-emerald-700 pl-4">Konum Hataları</h4><p className="text-xs text-gray-500 font-medium normal-case leading-relaxed">Ada ve parsel bilgileriniz esastır. Ekiplerimiz mezarı bulamazsa sizinle iletişime geçer. Yanlış adres nedeniyle yapılamayan hizmetler iade kapsamındadır.</p></div>
                    <div><h4 className="text-gray-900 text-sm mb-3 uppercase tracking-widest border-l-4 border-emerald-700 pl-4">Ücret İadesi</h4><p className="text-xs text-gray-500 font-medium normal-case leading-relaxed">Hizmet icra edilmediği veya eksik yapıldığı durumlarda platform güvencesi ile iade hakkınız mevcuttur.</p></div>
                  </div>
                )}
                {infoModal === 'terms' && (
                  <div className="space-y-8 text-[11px] text-gray-500 uppercase tracking-tighter leading-snug">
                    <div className="bg-gray-50 p-8 rounded-[32px] border border-gray-100"><h5 className="text-gray-900 font-black mb-4 tracking-widest">1. Mesafeli Satış Sözleşmesi</h5><p className="leading-relaxed">Hizmet alıcısı, platform üzerinden sipariş onayladığında sözleşme şartlarını peşinen kabul etmiş sayılır. Satıcı, taahhüt edilen hizmeti profesyonel standartlarda sunmakla yükümlüdür.</p></div>
                    <div className="bg-gray-50 p-8 rounded-[32px] border border-gray-100"><h5 className="text-gray-900 font-black mb-4 tracking-widest">2. Sorumluluk Reddi</h5><p className="leading-relaxed">Platform üzerindeki konum verileri yardımcı niteliktedir. Mezarın tam tespiti için kullanıcı tarafından girilen ada ve parsel numaraları ana belirleyicidir.</p></div>
                    <div className="bg-gray-50 p-8 rounded-[32px] border border-gray-100"><h5 className="text-gray-900 font-black mb-4 tracking-widest">3. KVKK Aydınlatma</h5><p className="leading-relaxed">Paylaşılan kimlik ve konum bilgileri sadece hizmetin ifası amacıyla yetkili bakım ekibiyle paylaşılır. Üçüncü şahıslara ticari maksatla aktarılmaz.</p></div>
                  </div>
                )}
             </div>
             <div className="p-10 border-t bg-gray-50 text-center"><button onClick={() => setInfoModal(null)} className="bg-emerald-900 text-white font-bold px-20 py-5 rounded-[32px] shadow-xl uppercase text-[11px] tracking-[0.3em] hover:bg-black transition-all active:scale-95">Anladım</button></div>
          </div>
        </div>
      )}

    </div>
  );
}
