'use client';
import React, { useState } from 'react';
import { 
  FiShoppingCart, FiDollarSign, FiUsers, FiPackage, 
  FiMenu, FiX, FiBell, FiUser, FiSearch, FiPlus,
  FiCreditCard, FiRefreshCw, FiPrinter, FiTrash2, FiXCircle
} from 'react-icons/fi';
import Cart from './components/Cart';
import CategoryFilter from './components/CategoryFilter';
import PaymentSection from './components/PaymentSection';
import ProductCard from './components/ProductCard';
import ProductTable from './components/ProductTable';
import CustomerCard from './components/CustomerCard';
import ReportCard from './components/ReportCard';
import SalesChart from './components/SalesChart';
import Sidebar from '../../app/nav/nav';
import { formatRupiah, parseRupiah } from '@/utils/formatCurrency';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pos');
  const [cart, setCart] = useState([]);
  const [products] = useState([
    { id: 1, name: 'Kopi Latte', price: 25000, category: 'Minuman', stock: 15 },
    { id: 2, name: 'Cappuccino', price: 28000, category: 'Minuman', stock: 12 },
    { id: 3, name: 'Croissant', price: 18000, category: 'Roti', stock: 8 },
    { id: 4, name: 'Muffin Blueberry', price: 15000, category: 'Roti', stock: 5 },
    { id: 5, name: 'Kue Coklat', price: 22000, category: 'Dessert', stock: 10 },
    { id: 6, name: 'Sandwich', price: 35000, category: 'Makanan', stock: 7 },
    { id: 7, name: 'Air Mineral', price: 8000, category: 'Minuman', stock: 20 },
    { id: 8, name: 'Es Teh', price: 10000, category: 'Minuman', stock: 18 },
  ]);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [change, setChange] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };
  
  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };
  
  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return;
    setCart(cart.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };
  
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1; // Pajak 10%
  const total = subtotal + tax;
  
  const processPayment = () => {
    const amount = parseRupiah(paymentAmount);
    if (isNaN(amount) || amount < total) {
      alert('Jumlah pembayaran harus lebih besar atau sama dengan total');
      return;
    }
    setChange(amount - total);
    setTimeout(() => {
      alert(`Pembayaran berhasil! Kembalian: ${formatRupiah(amount - total)}`);
      setCart([]);
      setPaymentAmount('');
      setChange(0);
    }, 500);
  };
  
  const categories = ['Semua', ...new Set(products.map(p => p.category))];
  
  // Filter produk berdasarkan pencarian dan kategori
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = 
      selectedCategory === 'Semua' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Component */}
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden mr-4 text-gray-600"
              >
                <FiMenu size={24} />
              </button>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari produk, pelanggan..."
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-indigo-600">
                <FiBell size={20} />
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </button>
              
              <div className="flex items-center">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8" />
                <span className="ml-2 font-medium">Kasir</span>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-100">
          {/* POS Interface */}
          {activeTab === 'pos' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Product Selection */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
                <CategoryFilter 
                  categories={categories} 
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                />
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredProducts.map(product => (
                    <ProductCard 
                      key={product.id}
                      product={product}
                      addToCart={addToCart}
                    />
                  ))}
                </div>
              </div>
              
              {/* Cart and Payment */}
              <div className="bg-white rounded-lg shadow p-4 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold">Order Sekarang</h2>
                  <button 
                    onClick={() => setCart([])}
                    className="text-red-500 hover:text-red-700 flex items-center"
                  >
                    <FiTrash2 size={18} className="mr-1" /> Hapus
                  </button>
                </div>
                
                <Cart 
                  cart={cart}
                  updateQuantity={updateQuantity}
                  removeFromCart={removeFromCart}
                />
                
                {/* Order Summary */}
                <div className="border-t pt-4">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>{formatRupiah(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pajak (10%):</span>
                      <span>{formatRupiah(tax)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg mt-3">
                      <span>Total:</span>
                      <span>{formatRupiah(total)}</span>
                    </div>
                  </div>
                  
                  <PaymentSection 
                    paymentAmount={paymentAmount}
                    setPaymentAmount={setPaymentAmount}
                    change={change}
                    total={total}
                    processPayment={processPayment}
                    cart={cart}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Products Tab */}
          {activeTab === 'products' && (
            <ProductTable products={products} />
          )}
          
          {/* Customers Tab */}
          {activeTab === 'customers' && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-xl font-bold mb-6">Manajemen Pelanggan</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CustomerCard 
                  title="Total Pelanggan"
                  value={248}
                  trend="↑ 12% dari bulan lalu"
                  icon={<FiUsers size={24} />}
                  bgColor="bg-blue-50"
                  iconBg="bg-blue-100"
                  iconColor="text-blue-600"
                />
                
                <CustomerCard 
                  title="Pelanggan VIP"
                  value={42}
                  trend="↑ 8% dari bulan lalu"
                  icon={<FiUser size={24} />}
                  bgColor="bg-yellow-50"
                  iconBg="bg-yellow-100"
                  iconColor="text-yellow-600"
                />
                
                <CustomerCard 
                  title="Pelanggan Baru"
                  value={18}
                  trend="↑ 5% dari bulan lalu"
                  icon={<FiPlus size={24} />}
                  bgColor="bg-purple-50"
                  iconBg="bg-purple-100"
                  iconColor="text-purple-600"
                />
              </div>
            </div>
          )}
          
          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-xl font-bold mb-6">Laporan Penjualan</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <ReportCard 
                  title="Penjualan Hari Ini"
                  value={1248750}
                />
                
                <ReportCard 
                  title="Minggu Ini"
                  value={8426300}
                />
                
                <ReportCard 
                  title="Bulan Ini"
                  value={32845200}
                />
                
                <ReportCard 
                  title="Rata-rata per Order"
                  value={248000}
                />
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold">Performa Penjualan Harian</h3>
                  <button className="flex items-center text-indigo-600">
                    <FiRefreshCw className="mr-1" /> Refresh
                  </button>
                </div>
                
                <SalesChart />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}