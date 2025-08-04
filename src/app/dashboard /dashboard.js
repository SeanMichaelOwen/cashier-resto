'use client';

import React, { useState } from 'react';
import { 
  FiShoppingCart, FiDollarSign, FiUsers, FiPackage, 
  FiMenu, FiBell, FiUser, FiSearch, FiPlus,
  FiCreditCard, FiRefreshCw, FiPrinter, FiTrash2,
  FiBarChart2, FiTrendingUp, FiTruck, FiSmartphone,
  FiClock, FiList, FiGrid
} from 'react-icons/fi';
import Sidebar from '../nav/nav';
import Cart from '../components/Cart';
import CategoryFilter from '../components/CategoryFilter';
import PaymentSection from '../components/PaymentSection';
import ProductCard from '../components/ProductCard';
import ProductTable from '../components/ProductTable';
import CustomerCard from '../components/CustomerCard';
import ReportCard from '../components/ReportCard';
import SalesChart from '../components/SalesChart';
import InventoryAnalysis from '../components/analisis/InventoryAnalysis';
import IntegrationManagement from '../components/IntegrationManagement';
import TableManagement from '../components/TableManagement';
import { formatRupiah, parseRupiah } from '@/utils/formatCurrency';
import { useProducts } from '../context/ProductContext';

export default function Dashboard() {
  const { products, updateProduct, addStockHistory, isLoaded } = useProducts();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pos');
  const [cart, setCart] = useState([]);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [change, setChange] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedTable, setSelectedTable] = useState(null);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Generate categories from products
  const categories = ['Semua', ...new Set(products.map(p => p.category))];
  
  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = 
      selectedCategory === 'Semua' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Add product to cart
  const addToCart = (product) => {
    if (product.stock < 1) {
      alert('Stok produk habis!');
      return;
    }

    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity + 1 > product.stock) {
        alert(`Stok tidak mencukupi! Stok tersedia: ${product.stock}`);
        return;
      }
      setCart(cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  // Remove product from cart
  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // Update product quantity in cart
  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return;
    
    const product = products.find(p => p.id === id);
    if (!product || quantity > product.stock) {
      alert(`Stok tidak mencukupi! Stok tersedia: ${product?.stock || 0}`);
      return;
    }
    
    setCart(cart.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };

  // Calculate order totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  // Process payment
  const processPayment = () => {
    const amount = parseRupiah(paymentAmount);
    if (isNaN(amount) || amount < total) {
      alert('Jumlah pembayaran harus lebih besar atau sama dengan total');
      return;
    }

    // Update product stock and add to history
    cart.forEach(cartItem => {
      const product = products.find(p => p.id === cartItem.id);
      if (product) {
        const newStock = product.stock - cartItem.quantity;
        
        addStockHistory({
          id: Date.now(),
          productId: product.id,
          productName: product.name,
          oldStock: product.stock,
          adjustment: -cartItem.quantity,
          newStock,
          date: new Date().toISOString(),
          type: 'penjualan'
        });

        updateProduct(product.id, { stock: newStock });
      }
    });

    setChange(amount - total);
    
    setTimeout(() => {
      alert(`Pembayaran berhasil! Kembalian: ${formatRupiah(amount - total)}`);
      setCart([]);
      setPaymentAmount('');
      setChange(0);
      setSelectedTable(null);
    }, 500);
  };

  // Handle table selection
  const handleTableSelect = (table) => {
    setSelectedTable(table);
    alert(`Meja ${table.number} dipilih untuk order ini`);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
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
              {activeTab === 'pos' && selectedTable && (
                <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full flex items-center">
                  <FiGrid className="mr-2" />
                  Meja: {selectedTable.number} ({selectedTable.capacity} orang)
                </div>
              )}
              
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
                <div className="flex justify-between items-center mb-4">
                  <CategoryFilter 
                    categories={categories} 
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                  />
                  {!selectedTable && (
                    <button 
                      onClick={() => setActiveTab('tables')}
                      className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      <FiGrid className="mr-2" /> Pilih Meja
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                      <ProductCard 
                        key={product.id}
                        product={product}
                        addToCart={addToCart}
                        disabled={!selectedTable}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      {products.length === 0 
                        ? 'Belum ada produk. Tambahkan produk melalui menu Produk' 
                        : 'Tidak ada produk yang sesuai dengan pencarian'}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Cart and Payment */}
              <div className="bg-white rounded-lg shadow p-4 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold">Order Sekarang</h2>
                  <button 
                    onClick={() => setCart([])}
                    className="text-red-500 hover:text-red-700 flex items-center"
                    disabled={!selectedTable}
                  >
                    <FiTrash2 size={18} className="mr-1" /> Hapus
                  </button>
                </div>
                
                {!selectedTable ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-500">
                    <FiGrid size={48} className="mb-4 text-indigo-300" />
                    <h3 className="text-lg font-medium mb-2">Pilih Meja Terlebih Dahulu</h3>
                    <p className="mb-4">Silakan pilih meja untuk memulai order</p>
                    <button 
                      onClick={() => setActiveTab('tables')}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
                    >
                      <FiGrid className="mr-2" /> Pilih Meja
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 p-3 bg-indigo-50 rounded-lg flex justify-between items-center">
                      <div>
                        <span className="font-medium">Meja {selectedTable.number}</span>
                        <span className="text-sm text-gray-600 ml-2">({selectedTable.capacity} orang)</span>
                      </div>
                      <button 
                        onClick={() => setSelectedTable(null)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm"
                      >
                        Ganti Meja
                      </button>
                    </div>
                    
                    <Cart 
                      cart={cart}
                      products={products}
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
                  </>
                )}
              </div>
            </div>
          )}
          
          {/* Products Tab */}
          {activeTab === 'products' && (
            <ProductTable />
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

          {/* Table Management Tab */}
          {activeTab === 'tables' && (
            <TableManagement 
              onTableSelect={handleTableSelect}
              isSelectMode={activeTab === 'pos'}
            />
          )}
          
          {/* Analysis Tabs */}
          {activeTab === 'analysis-sales' && (
            <InventoryAnalysis type="sales" />
          )}
          
          {activeTab === 'analysis-inventory' && (
            <InventoryAnalysis type="inventory" />
          )}
          
          {activeTab === 'analysis-profit' && (
            <InventoryAnalysis type="profit" />
          )}
          
          {activeTab === 'analysis-trending' && (
            <InventoryAnalysis type="trending" />
          )}
          
          {/* Integration Tabs */}
          {activeTab === 'integration-grab' && (
            <IntegrationManagement platform="Grab" />
          )}
          
          {activeTab === 'integration-gojek' && (
            <IntegrationManagement platform="Gojek" />
          )}
          
          {activeTab === 'integration-shopee' && (
            <IntegrationManagement platform="ShopeeFood" />
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