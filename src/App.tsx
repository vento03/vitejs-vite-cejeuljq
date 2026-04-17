import React, { useState, useMemo, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

// --- KHỞI TẠO CLOUD DATABASE (TỪ FIREBASE CỦA BẠN) ---
let app, auth, db, appId;
try {
  const firebaseConfig = {
    apiKey: "AIzaSyDFjSupDYSX3Uj692UrIuSRp3JrXbAultY",
    authDomain: "project-ceec3d44-0b20-4104-b6b.firebaseapp.com",
    projectId: "project-ceec3d44-0b20-4104-b6b",
    storageBucket: "project-ceec3d44-0b20-4104-b6b.firebasestorage.app",
    messagingSenderId: "454572687986",
    appId: "1:454572687986:web:1648087d8e581b575438eb",
    measurementId: "G-SE33B4N6PZ"
  };
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  appId = 'gearshop-os'; // ID tĩnh cho database của bạn
} catch (e) {
  console.error("Lỗi khởi tạo máy chủ đồng bộ", e);
}

// --- ICONS ---
const Icons = {
  Home: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Package: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>,
  Database: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>,
  ShoppingCart: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>,
  DollarSign: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  BarChart: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>,
  Clock: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>,
  AlertTriangle: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>,
  X: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>,
  Refresh: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
};

// --- UTILS ---
const formatVND = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};
const generateId = () => Math.random().toString(36).substr(2, 9);
const getNow = () => new Date().toLocaleString('vi-VN');
const getTodayStr = () => new Date().toLocaleDateString('vi-VN');

// --- DỮ LIỆU MẪU KHI MỚI KHỞI TẠO LẦN ĐẦU ---
const initialAccounts = [
  { id: 'cake', name: 'Cake (Nhận tiền từ khách)', balance: 0, order: 1 },
  { id: 'vietinbank', name: 'Vietinbank (Tiền nhập hàng)', balance: 10000000, order: 2 },
  { id: 'mbank', name: 'MBank (Tiền lãi)', balance: 0, order: 3 },
];

const initialProducts = [
  { id: 'p1', name: 'Bàn phím cơ Keychron K8 Pro', category: 'Bàn phím', importPrice: 1500000, salePrice: 2200000, stock: 15, variant: 'Blue Switch / Đen', timestamp: Date.now() },
  { id: 'p2', name: 'Chuột Logitech G102', category: 'Chuột', importPrice: 300000, salePrice: 450000, stock: 4, variant: 'Đen', timestamp: Date.now() + 1 },
  { id: 'p3', name: 'Bộ Keycap PBT Olivia', category: 'Keycap', importPrice: 500000, salePrice: 850000, stock: 10, variant: 'Cherry Profile', timestamp: Date.now() + 2 },
  { id: 'p4', name: 'Switch Akko V3 Cream Yellow', category: 'Switch', importPrice: 4500, salePrice: 7000, stock: 450, variant: 'Linear (Hộp 45c)', timestamp: Date.now() + 3 },
];

export default function App() {
  // --- STATE ---
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState('');

  const [activeTab, setActiveTab] = useState('dashboard');
  const [accounts, setAccounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [logs, setLogs] = useState([]);

  const [isOrderModalOpen, setOrderModalOpen] = useState(false);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);
  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [isTransferModalOpen, setTransferModalOpen] = useState(false);
  
  // State quản lý việc xóa sản phẩm
  const [productToDelete, setProductToDelete] = useState(null);

  // --- XÁC THỰC (AUTHENTICATION) ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Lỗi xác thực:", error);
        showToast("Lỗi xác thực! Vui lòng kiểm tra đã bật Anonymous trong Firebase chưa.");
        setIsLoading(false);
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- ĐỒNG BỘ DỮ LIỆU REAL-TIME (FIRESTORE) ---
  useEffect(() => {
    if (!user) return;
    const userPath = `artifacts/${appId}/users/${user.uid}`;
    
    const unsubs = [];

    unsubs.push(onSnapshot(collection(db, userPath, 'accounts'), (snap) => {
      const data = snap.docs.map(d => d.data());
      if(data.length === 0) {
        initialAccounts.forEach(acc => setDoc(doc(db, userPath, 'accounts', acc.id), acc));
      } else {
        setAccounts(data.sort((a,b) => a.order - b.order));
      }
    }, (err) => {
        console.error(err);
        showToast("Vui lòng thiết lập quyền Firestore trong tab Rules thành true!");
    }));
    
    unsubs.push(onSnapshot(collection(db, userPath, 'products'), (snap) => {
      const data = snap.docs.map(d => d.data());
      if(data.length === 0) {
        initialProducts.forEach(p => setDoc(doc(db, userPath, 'products', p.id), p));
      } else {
        setProducts(data.sort((a,b) => b.timestamp - a.timestamp));
      }
    }, (err) => console.error(err)));

    unsubs.push(onSnapshot(collection(db, userPath, 'orders'), (snap) => {
      const data = snap.docs.map(d => d.data());
      setOrders(data.sort((a,b) => b.timestamp - a.timestamp));
    }, (err) => console.error(err)));

    unsubs.push(onSnapshot(collection(db, userPath, 'transactions'), (snap) => {
      const data = snap.docs.map(d => d.data());
      setTransactions(data.sort((a,b) => b.timestamp - a.timestamp));
    }, (err) => console.error(err)));

    unsubs.push(onSnapshot(collection(db, userPath, 'logs'), (snap) => {
      const data = snap.docs.map(d => d.data());
      setLogs(data.sort((a,b) => b.timestamp - a.timestamp));
      setIsLoading(false); // Dữ liệu cuối cùng đã load xong
    }, (err) => console.error(err)));

    return () => unsubs.forEach(fn => fn());
  }, [user]);

  // --- HELPER FUNCTIONS ---
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const getBasePath = () => `artifacts/${appId}/users/${user.uid}`;

  const addLog = async (action, detail) => {
    if (!user) return;
    const id = generateId();
    await setDoc(doc(db, getBasePath(), 'logs', id), {
      id, time: getNow(), action, detail, timestamp: Date.now()
    });
  };

  const createTransaction = async (type, amount, accountId, note, currentBalance) => {
    if (!user) return;
    const id = generateId();
    await setDoc(doc(db, getBasePath(), 'transactions', id), {
      id, type, amount, accountId, note, time: getNow(), date: getTodayStr(), timestamp: Date.now()
    });
    
    const isDeduction = type === 'Chi phí khác' || type === 'Nhập hàng' || type === 'Chuyển đi';
    const newBalance = currentBalance + (isDeduction ? -amount : amount);
    
    await setDoc(doc(db, getBasePath(), 'accounts', accountId), { 
      balance: newBalance 
    }, { merge: true });
  };

  // --- HANDLERS ---
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.target);
    const productId = formData.get('productId');
    const qty = parseInt(formData.get('qty'));
    const customer = formData.get('customer');
    const extraFee = parseInt(formData.get('extraFee')) || 0;
    const accountId = formData.get('accountId');

    const product = products.find(p => p.id === productId);
    if (!product) return showToast("Vui lòng chọn sản phẩm!");
    if (product.stock < qty) return showToast("Không đủ hàng trong kho!");

    // Trừ kho
    await setDoc(doc(db, getBasePath(), 'products', product.id), { 
      stock: product.stock - qty 
    }, { merge: true });

    const totalRevenue = product.salePrice * qty;
    const totalCost = (product.importPrice * qty) + extraFee;
    const profit = totalRevenue - totalCost;
    const orderId = `ORD-${generateId().toUpperCase()}`;

    const newOrder = {
      id: orderId,
      productName: product.name,
      qty,
      salePrice: product.salePrice,
      total: totalRevenue,
      customer,
      extraFee,
      profit,
      status: 'Đã giao',
      time: getNow(),
      date: getTodayStr(),
      timestamp: Date.now()
    };

    // Lưu đơn hàng
    await setDoc(doc(db, getBasePath(), 'orders', orderId), newOrder);
    
    // Tạo giao dịch & Lưu log
    const account = accounts.find(a => a.id === accountId);
    await createTransaction('Bán hàng', totalRevenue, accountId, `Thu tiền đơn ${orderId}`, account.balance);
    await addLog('Tạo đơn', `Bán ${qty}x ${product.name} cho ${customer || 'Khách lẻ'}`);
    
    setOrderModalOpen(false);
    showToast("Tạo đơn hàng thành công!");
  };

  const handleImportStock = async (e) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.target);
    const productId = formData.get('productId');
    const qty = parseInt(formData.get('qty'));
    const accountId = formData.get('accountId');

    const product = products.find(p => p.id === productId);
    if (!product) return showToast("Vui lòng chọn sản phẩm!");

    const totalCost = product.importPrice * qty;
    const account = accounts.find(a => a.id === accountId);
    
    if (account.balance < totalCost) {
      return showToast(`Tài khoản ${account.name} không đủ tiền (${formatVND(account.balance)})`);
    }

    // Cộng kho
    await setDoc(doc(db, getBasePath(), 'products', product.id), { 
      stock: product.stock + qty 
    }, { merge: true });

    // Tạo giao dịch & Log
    await createTransaction('Nhập hàng', totalCost, accountId, `Nhập ${qty}x ${product.name}`, account.balance);
    await addLog('Nhập kho', `Nhập ${qty} ${product.name} (Tổng chi: ${formatVND(totalCost)})`);
    
    setImportModalOpen(false);
    showToast("Nhập hàng vào kho thành công!");
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.target);
    const amount = parseInt(formData.get('amount'));
    const note = formData.get('note');
    const accountId = formData.get('accountId');

    const account = accounts.find(a => a.id === accountId);
    if (account.balance < amount) return showToast("Tài khoản không đủ tiền!");

    await createTransaction('Chi phí khác', amount, accountId, note, account.balance);
    await addLog('Chi phí', `Chi ${formatVND(amount)}: ${note}`);
    
    setExpenseModalOpen(false);
    showToast("Ghi nhận chi phí thành công!");
  };

  const handleTransferProfit = async (e) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.target);
    const amount = parseInt(formData.get('amount'));
    
    const cakeAccount = accounts.find(a => a.id === 'cake');
    const mbankAccount = accounts.find(a => a.id === 'mbank');

    if (cakeAccount.balance < amount) {
      return showToast("Tài khoản Cake không đủ số dư để chuyển (Hoặc hôm nay bạn chưa bán được hàng)!");
    }

    // Trừ tiền Cake, Cộng tiền MBank
    await createTransaction('Chuyển đi', amount, 'cake', `Chuyển lãi sang MBank`, cakeAccount.balance);
    
    // Do Firebase chạy bất đồng bộ, ta tạo giao dịch tiếp theo bằng balance ảo được cộng dồn nếu chạy song song
    // Nhưng vì createTransaction đã tự tính nên ta chỉ cần truyền đúng số dư cũ.
    await createTransaction('Nhận tiền', amount, 'mbank', `Nhận tiền lãi từ Cake`, mbankAccount.balance);
    
    await addLog('Chốt lãi', `Đã chuyển ${formatVND(amount)} tiền lãi vào MBank`);
    
    setTransferModalOpen(false);
    showToast("Chốt lãi và chuyển tiền thành công!");
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.target);
    const newProd = {
      id: `p-${generateId()}`,
      name: formData.get('name'),
      category: formData.get('category'),
      variant: formData.get('variant'),
      importPrice: parseInt(formData.get('importPrice')),
      salePrice: parseInt(formData.get('salePrice')),
      stock: 0, 
      timestamp: Date.now()
    };
    
    await setDoc(doc(db, getBasePath(), 'products', newProd.id), newProd);
    await addLog('Sản phẩm', `Thêm mới: ${newProd.name}`);
    
    setProductModalOpen(false);
    showToast("Đã thêm sản phẩm mới!");
  };

  const handleDeleteProduct = async () => {
    if (!user || !productToDelete) return;
    
    try {
      await deleteDoc(doc(db, getBasePath(), 'products', productToDelete.id));
      await addLog('Sản phẩm', `Đã xóa: ${productToDelete.name}`);
      showToast('Đã xóa sản phẩm thành công!');
    } catch (error) {
      console.error(error);
      showToast('Có lỗi xảy ra khi xóa!');
    } finally {
      setProductToDelete(null);
    }
  };

  // --- CALCULATIONS FOR REPORTS ---
  const totalBalance = useMemo(() => accounts.reduce((sum, acc) => sum + acc.balance, 0), [accounts]);
  const totalInventoryValue = useMemo(() => products.reduce((sum, p) => sum + (p.importPrice * p.stock), 0), [products]);
  const totalRevenue = useMemo(() => transactions.filter(t => t.type === 'Bán hàng').reduce((sum, t) => sum + t.amount, 0), [transactions]);
  const totalProfit = useMemo(() => orders.reduce((sum, o) => sum + o.profit, 0), [orders]);

  const today = getTodayStr();
  const todayProfit = useMemo(() => {
    const todayOrders = orders.filter(o => o.date === today);
    const todayExpenses = transactions.filter(t => t.date === today && t.type === 'Chi phí khác');
    const sumProfit = todayOrders.reduce((sum, o) => sum + o.profit, 0);
    const sumExpense = todayExpenses.reduce((sum, t) => sum + t.amount, 0);
    return sumProfit - sumExpense;
  }, [orders, transactions, today]);

  // --- MÀN HÌNH TẢI (LOADING STATE) ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin text-blue-600"><Icons.Refresh /></div>
        <div className="text-gray-600 font-medium animate-pulse">Đang đồng bộ dữ liệu đám mây...</div>
      </div>
    );
  }

  // --- COMPONENTS ---
  const SidebarItem = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        activeTab === id 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <Icon />
      <span className="font-medium">{label}</span>
    </button>
  );

  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center p-5 border-b border-gray-100">
            <h3 className="font-bold text-lg text-gray-800">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
              <Icons.X />
            </button>
          </div>
          <div className="p-5 max-h-[80vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    );
  };

  // --- RENDER VIEWS ---
  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-full inline-flex">
        <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
        Đã đồng bộ đám mây
      </div>

      {/* Daily Profit Alert for transferring */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 shadow-md text-white flex flex-col md:flex-row items-center justify-between">
        <div>
          <h3 className="text-lg font-medium opacity-90 mb-1">Lãi ròng hôm nay ({today})</h3>
          <div className="text-3xl font-bold">{formatVND(todayProfit)}</div>
          <p className="text-sm opacity-80 mt-1">Lãi bán được trừ đi các chi phí phát sinh trong ngày.</p>
        </div>
        <button 
          onClick={() => setTransferModalOpen(true)}
          className="mt-4 md:mt-0 px-6 py-3 bg-white text-blue-700 font-bold rounded-xl shadow-sm hover:bg-blue-50 transition active:scale-95"
        >
          Chốt chuyển lãi sang MBank
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-gray-500 text-sm mb-1">Tổng tiền các tài khoản</div>
          <div className="text-2xl font-bold text-blue-600">{formatVND(totalBalance)}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-gray-500 text-sm mb-1">Tổng doanh thu bán hàng</div>
          <div className="text-2xl font-bold text-green-600">{formatVND(totalRevenue)}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-gray-500 text-sm mb-1">Tổng lợi nhuận (đã trừ phí)</div>
          <div className="text-2xl font-bold text-purple-600">{formatVND(totalProfit)}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-gray-500 text-sm mb-1">Giá trị tồn kho (Vốn)</div>
          <div className="text-2xl font-bold text-orange-600">{formatVND(totalInventoryValue)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-lg mb-4 flex items-center text-red-600">
            <Icons.AlertTriangle /> <span className="ml-2">Cảnh báo kho</span>
          </h3>
          <div className="space-y-3">
            {products.filter(p => p.stock < 5).length === 0 ? (
              <p className="text-gray-500 text-sm">Mọi mặt hàng đều đủ số lượng.</p>
            ) : (
              products.filter(p => p.stock < 5).map(p => (
                <div key={p.id} className="flex justify-between items-center p-3 bg-red-50 rounded-xl border border-red-100">
                  <div>
                    <div className="font-medium text-gray-800">{p.name}</div>
                    <div className="text-sm text-red-500">Chỉ còn {p.stock} sản phẩm</div>
                  </div>
                  <button onClick={() => setImportModalOpen(true)} className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200">
                    Nhập thêm
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-lg mb-4 flex items-center text-gray-800">
            <Icons.Clock /> <span className="ml-2">Hoạt động gần đây</span>
          </h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {logs.slice(0, 5).map(log => (
              <div key={log.id} className="flex flex-col border-b border-gray-50 pb-3 last:border-0">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-blue-600">{log.action}</span>
                  <span className="text-gray-400 text-xs">{log.time}</span>
                </div>
                <div className="text-gray-600 text-sm mt-1">{log.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 md:p-5 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">Danh mục Sản phẩm</h2>
        <button onClick={() => setProductModalOpen(true)} className="flex items-center space-x-1 px-3 py-2 md:px-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition text-sm md:text-base">
          <Icons.Plus /> <span>Thêm SP</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm">
              <th className="p-4 font-medium">Tên SP & Phân loại</th>
              <th className="p-4 font-medium">Biến thể</th>
              <th className="p-4 font-medium">Giá nhập/bán</th>
              <th className="p-4 font-medium text-center">Tồn kho</th>
              <th className="p-4 font-medium text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-gray-50/50 transition">
                <td className="p-4">
                  <div className="font-medium text-gray-900">{p.name}</div>
                  <div className="text-xs text-gray-500 mt-1 px-2 py-0.5 bg-gray-100 rounded-md inline-block">{p.category}</div>
                </td>
                <td className="p-4 text-sm text-gray-600">{p.variant}</td>
                <td className="p-4 text-sm text-gray-600">
                  <div className="text-gray-500 text-xs border-b border-gray-100 pb-1 mb-1">N: {formatVND(p.importPrice)}</div>
                  <div className="text-green-600 font-medium">B: {formatVND(p.salePrice)}</div>
                </td>
                <td className="p-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${p.stock < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                    {p.stock}
                  </span>
                </td>
                <td className="p-4 text-center">
                  {p.stock === 0 ? (
                    <button 
                      onClick={() => setProductToDelete(p)} 
                      title="Xóa sản phẩm này"
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                    >
                      <Icons.Trash />
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Đang có hàng</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800">Lịch sử Đơn hàng</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm">
              <th className="p-4 font-medium">Mã Đơn</th>
              <th className="p-4 font-medium">Thời gian</th>
              <th className="p-4 font-medium">Khách hàng</th>
              <th className="p-4 font-medium">Sản phẩm (SL)</th>
              <th className="p-4 font-medium">Tổng thu</th>
              <th className="p-4 font-medium">Lãi</th>
              <th className="p-4 font-medium">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.length === 0 && (
              <tr><td colSpan="7" className="p-8 text-center text-gray-500">Chưa có đơn hàng nào.</td></tr>
            )}
            {orders.map(o => (
              <tr key={o.id} className="hover:bg-gray-50/50 transition">
                <td className="p-4 font-mono text-sm text-blue-600">{o.id}</td>
                <td className="p-4 text-sm text-gray-500">{o.time}</td>
                <td className="p-4 text-sm font-medium">{o.customer || 'Khách lẻ'}</td>
                <td className="p-4 text-sm">
                  {o.productName} <span className="text-gray-400">x{o.qty}</span>
                </td>
                <td className="p-4 font-medium text-gray-900">{formatVND(o.total)}</td>
                <td className="p-4 font-medium text-green-600">{formatVND(o.profit)}</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCashFlow = () => (
    <div className="space-y-6">
      {/* Account Balances */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {accounts.map(acc => (
          <div key={acc.id} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 text-white/10">
              <Icons.DollarSign />
            </div>
            <div className="text-gray-300 text-sm mb-2">{acc.name}</div>
            <div className="text-2xl font-bold tracking-wider">{formatVND(acc.balance)}</div>
          </div>
        ))}
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 md:p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Lịch sử Giao dịch</h2>
          <button onClick={() => setExpenseModalOpen(true)} className="px-3 py-2 md:px-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition">
            + Chi phí
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm">
                <th className="p-4 font-medium">Thời gian</th>
                <th className="p-4 font-medium">Loại</th>
                <th className="p-4 font-medium">Số tiền</th>
                <th className="p-4 font-medium">Tài khoản</th>
                <th className="p-4 font-medium">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.length === 0 && (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Chưa có giao dịch.</td></tr>
              )}
              {transactions.map(t => (
                <tr key={t.id} className="hover:bg-gray-50/50 transition">
                  <td className="p-4 text-sm text-gray-500">{t.time}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                      t.type === 'Bán hàng' || t.type === 'Nhận tiền' ? 'bg-green-100 text-green-700' :
                      t.type === 'Nhập hàng' ? 'bg-orange-100 text-orange-700' :
                      t.type === 'Chuyển đi' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {t.type}
                    </span>
                  </td>
                  <td className={`p-4 font-medium ${t.type === 'Bán hàng' || t.type === 'Nhận tiền' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'Bán hàng' || t.type === 'Nhận tiền' ? '+' : '-'}{formatVND(t.amount)}
                  </td>
                  <td className="p-4 text-sm text-gray-700">
                    {accounts.find(a => a.id === t.accountId)?.name}
                  </td>
                  <td className="p-4 text-sm text-gray-500 max-w-xs truncate">{t.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex text-gray-900 relative">
      
      {/* Cảnh báo nổi (Toast Message) */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl font-medium animate-in slide-in-from-top-5">
          {toast}
        </div>
      )}

      {/* --- SIDEBAR --- */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
        <div className="p-6 flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            G
          </div>
          <h1 className="font-extrabold text-xl tracking-tight text-gray-900">GearShop OS</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <SidebarItem id="dashboard" icon={Icons.Home} label="Tổng quan" />
          <SidebarItem id="products" icon={Icons.Package} label="Sản phẩm & Kho" />
          <SidebarItem id="orders" icon={Icons.ShoppingCart} label="Đơn hàng" />
          <SidebarItem id="cashflow" icon={Icons.DollarSign} label="Dòng tiền" />
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="text-xs text-green-500 font-medium text-center flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span> Cloud Sync Đang Chạy
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* TOPBAR */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-lg font-bold text-gray-800 md:hidden">GearShop OS</h2>
          <div className="hidden md:block">
            <h2 className="text-xl font-bold text-gray-800">
              {activeTab === 'dashboard' && 'Tổng quan hệ thống'}
              {activeTab === 'products' && 'Quản lý Sản phẩm & Kho'}
              {activeTab === 'orders' && 'Quản lý Đơn hàng'}
              {activeTab === 'cashflow' && 'Quản lý Dòng tiền'}
            </h2>
            <p className="text-sm text-gray-500">Cập nhật lúc: {getNow()}</p>
          </div>

          {/* Quick Actions */}
          <div className="flex space-x-2 md:space-x-3">
            <button 
              onClick={() => setImportModalOpen(true)}
              className="px-3 py-2 md:px-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition shadow-sm text-sm md:text-base"
            >
              Nhập Hàng
            </button>
            <button 
              onClick={() => setOrderModalOpen(true)}
              className="px-3 py-2 md:px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition shadow-sm shadow-blue-200 text-sm md:text-base"
            >
              + Tạo Đơn
            </button>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-auto p-4 md:p-6 pb-24 md:pb-6">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'products' && renderProducts()}
            {activeTab === 'orders' && renderOrders()}
            {activeTab === 'cashflow' && renderCashFlow()}
          </div>
        </div>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around py-3 pb-safe z-40">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center p-2 ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-gray-400'}`}>
          <Icons.Home /> <span className="text-[10px] mt-1 font-medium">Tổng quan</span>
        </button>
        <button onClick={() => setActiveTab('products')} className={`flex flex-col items-center p-2 ${activeTab === 'products' ? 'text-blue-600' : 'text-gray-400'}`}>
          <Icons.Package /> <span className="text-[10px] mt-1 font-medium">Kho hàng</span>
        </button>
        <button onClick={() => setActiveTab('orders')} className={`flex flex-col items-center p-2 ${activeTab === 'orders' ? 'text-blue-600' : 'text-gray-400'}`}>
          <Icons.ShoppingCart /> <span className="text-[10px] mt-1 font-medium">Đơn hàng</span>
        </button>
        <button onClick={() => setActiveTab('cashflow')} className={`flex flex-col items-center p-2 ${activeTab === 'cashflow' ? 'text-blue-600' : 'text-gray-400'}`}>
          <Icons.DollarSign /> <span className="text-[10px] mt-1 font-medium">Dòng tiền</span>
        </button>
      </nav>

      {/* --- MODALS (DIALOGS) --- */}
      
      {/* 1. Modal Tạo Đơn */}
      <Modal isOpen={isOrderModalOpen} onClose={() => setOrderModalOpen(false)} title="Tạo Đơn Hàng Mới">
        <form onSubmit={handleCreateOrder} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sản phẩm bán</label>
            <select name="productId" required className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
              <option value="">-- Chọn sản phẩm --</option>
              {products.filter(p => p.stock > 0).map(p => (
                <option key={p.id} value={p.id}>{p.name} (Tồn: {p.stock} - {formatVND(p.salePrice)})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
              <input type="number" name="qty" required min="1" defaultValue="1" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phí khác (Ship...)</label>
              <input type="number" name="extraFee" defaultValue="0" min="0" placeholder="VD: 30000" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng (Tùy chọn)</label>
            <input type="text" name="customer" placeholder="Tên / Số điện thoại" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tiền thu về tài khoản nào?</label>
            <select name="accountId" required defaultValue="cake" className="w-full border border-gray-300 rounded-lg p-2.5 bg-blue-50 text-blue-900 font-medium outline-none">
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <p className="text-xs text-gray-500 mt-2 italic">* Lợi nhuận = Giá bán - Giá nhập - Chi phí khác</p>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition mt-4 active:scale-95">
            Xác nhận tạo đơn
          </button>
        </form>
      </Modal>

      {/* 2. Modal Nhập Hàng */}
      <Modal isOpen={isImportModalOpen} onClose={() => setImportModalOpen(false)} title="Nhập Hàng Vào Kho">
        <form onSubmit={handleImportStock} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sản phẩm cần nhập</label>
            <select name="productId" required className="w-full border border-gray-300 rounded-lg p-2.5 outline-none bg-white">
              <option value="">-- Chọn sản phẩm --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} (Giá nhập: {formatVND(p.importPrice)})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng nhập</label>
            <input type="number" name="qty" required min="1" defaultValue="10" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lấy tiền từ tài khoản nào để nhập?</label>
            <select name="accountId" required defaultValue="vietinbank" className="w-full border border-gray-300 rounded-lg p-2.5 bg-orange-50 text-orange-900 font-medium outline-none">
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name} (Số dư: {formatVND(a.balance)})</option>)}
            </select>
          </div>
          <button type="submit" className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition mt-4 active:scale-95">
            Xác nhận nhập kho
          </button>
        </form>
      </Modal>

      {/* 3. Modal Thêm Chi Phí */}
      <Modal isOpen={isExpenseModalOpen} onClose={() => setExpenseModalOpen(false)} title="Ghi Nhận Chi Phí Mới">
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền chi</label>
            <input type="number" name="amount" required min="1000" placeholder="Ví dụ: 100000" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lý do (Ghi chú)</label>
            <input type="text" name="note" required placeholder="Ví dụ: Tiền điện, quảng cáo Facebook..." className="w-full border border-gray-300 rounded-lg p-2.5 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trừ tiền từ tài khoản nào?</label>
            <select name="accountId" required className="w-full border border-gray-300 rounded-lg p-2.5 bg-red-50 text-red-900 font-medium outline-none">
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name} (Số dư: {formatVND(a.balance)})</option>)}
            </select>
          </div>
          <button type="submit" className="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition mt-4 active:scale-95">
            Lưu chi phí
          </button>
        </form>
      </Modal>

      {/* 4. Modal Thêm Sản Phẩm Mới */}
      <Modal isOpen={isProductModalOpen} onClose={() => setProductModalOpen(false)} title="Thêm Sản Phẩm Mới">
        <form onSubmit={handleAddProduct} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
            <input type="text" name="name" required placeholder="VD: Bàn phím Aula F75" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phân loại</label>
              <select name="category" required className="w-full border border-gray-300 rounded-lg p-2.5 outline-none bg-white">
                <option value="Bàn phím">Bàn phím</option>
                <option value="Chuột">Chuột</option>
                <option value="Keycap">Keycap</option>
                <option value="Switch">Switch</option>
                <option value="Phụ kiện khác">Phụ kiện khác</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Biến thể</label>
              <input type="text" name="variant" placeholder="VD: Trắng/TTC Switch" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giá nhập</label>
              <input type="number" name="importPrice" required min="0" placeholder="VND" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán</label>
              <input type="number" name="salePrice" required min="0" placeholder="VND" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none" />
            </div>
          </div>
          <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded">Lưu ý: Sau khi thêm sản phẩm, tồn kho sẽ bằng 0. Bạn cần dùng nút "Nhập Hàng" để thêm số lượng.</p>
          <button type="submit" className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition mt-4 active:scale-95">
            Lưu sản phẩm
          </button>
        </form>
      </Modal>

      {/* 5. Modal Chuyển Lãi Cuối Ngày */}
      <Modal isOpen={isTransferModalOpen} onClose={() => setTransferModalOpen(false)} title="Chốt Lãi Hôm Nay">
        <form onSubmit={handleTransferProfit} className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-xl mb-4">
            <p className="text-sm text-blue-800 mb-1">Tổng lãi tính đến hiện tại ({today}):</p>
            <p className="text-2xl font-bold text-blue-600">{formatVND(todayProfit)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền chuyển sang MBank (Tiền lãi)</label>
            <input type="number" name="amount" required min="1" defaultValue={todayProfit > 0 ? todayProfit : 0} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none font-bold text-lg" />
            <p className="text-xs text-gray-500 mt-1">Bạn có thể sửa số tiền nếu muốn làm tròn.</p>
          </div>
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <p><strong>Từ (Trừ tiền):</strong> Cake (Nhận tiền từ khách)</p>
            <p className="mt-1"><strong>Đến (Cộng tiền):</strong> MBank (Tiền lãi)</p>
          </div>
          <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition mt-4 active:scale-95">
            Ghi nhận đã chuyển tiền
          </button>
        </form>
      </Modal>

      {/* 6. Modal Xác Nhận Xóa Sản Phẩm */}
      <Modal isOpen={!!productToDelete} onClose={() => setProductToDelete(null)} title="Xác nhận xóa sản phẩm">
        <div className="space-y-4">
          <p className="text-gray-700">Bạn có chắc chắn muốn xóa sản phẩm <strong className="text-red-600">{productToDelete?.name}</strong> không?</p>
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
            Hành động này không thể hoàn tác. Dữ liệu các đơn hàng cũ vẫn sẽ giữ tên sản phẩm này để đảm bảo báo cáo không bị sai lệch.
          </p>
          <div className="flex space-x-3 pt-2">
            <button onClick={() => setProductToDelete(null)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition">
              Giữ lại
            </button>
            <button onClick={handleDeleteProduct} className="flex-1 px-4 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition">
              Xóa vĩnh viễn
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}