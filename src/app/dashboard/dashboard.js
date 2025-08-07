'use client';
import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { 
  FiMenu, FiSearch, FiBell, FiUser, FiShoppingCart,
  FiPackage, FiUsers, FiGrid, FiDollarSign, FiBarChart2,
  FiHome, FiTrendingUp, FiCreditCard, FiPieChart, FiActivity,
  FiShoppingBag, FiStar, FiAward, FiAlertTriangle, FiCalendar,
  FiRefreshCw, FiCheckCircle, FiXCircle, FiPlus, FiMessageSquare
} from 'react-icons/fi';
import Sidebar from '../nav/nav';
import LoadingSpinner from '../components/LoadingSpinner';
import { useProducts } from '../context/ProductContext';
// Dynamic imports
const ProductTable = React.lazy(() => import('../components/ProductTable'));
const CustomerCard = React.lazy(() => import('../components/CustomerCard'));
const ReportCard = React.lazy(() => import('../components/ReportCard'));
const SalesChart = React.lazy(() => import('../components/SalesChart'));
const AnalysisProfit = React.lazy(() => import('../components/analisis/AnalysisProfit'));
const TableManagement = React.lazy(() => import('../components/TableManagement'));
const PointOfSale = React.lazy(() => import('../components/PointOfSale'));
const SalesAnalysisPage = React.lazy(() => import('../components/analisis/AnalisisPenjualan'));
const InventoryAnalysis = React.lazy(() => import ('../components/analisis/InventoryAnalysis'));
const ProdukTrending = React.lazy(() => import('../components/analisis/ProdukTrending'));
const IntegrationGoFood = React.lazy(() => import('../components/integrasi/GoFood'));
const IntegrationGrabFood = React.lazy(() => import('../components/integrasi/GrabFood'));
const IntegrationShopeeFood = React.lazy(() => import('../components/integrasi/ShopeeFood')); // Perbaiki typo di sini

export default function Dashboard() {
  const { isLoaded, products } = useProducts(); // Tambahkan products di sini
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State untuk filter grafik penjualan
  const [salesTimeFilter, setSalesTimeFilter] = useState('week');
  
  // State untuk filter status stok
  const [stockTimeFilter, setStockTimeFilter] = useState('today');
  
  if (!isLoaded) {
    return <LoadingSpinner fullScreen />;
  }
  
  // Data untuk grafik dan statistik
  const salesData = {
    week: [
      { name: 'Sen', value: 4000 },
      { name: 'Sel', value: 3000 },
      { name: 'Rab', value: 2000 },
      { name: 'Kam', value: 2780 },
      { name: 'Jum', value: 1890 },
      { name: 'Sab', value: 2390 },
      { name: 'Min', value: 3490 },
    ],
    month: [
      { name: 'Minggu 1', value: 12000 },
      { name: 'Minggu 2', value: 15000 },
      { name: 'Minggu 3', value: 18000 },
      { name: 'Minggu 4', value: 22000 },
    ],
    today: [
      { time: '09:00', value: 1200000 },
      { time: '11:00', value: 2500000 },
      { time: '13:00', value: 3200000 },
      { time: '15:00', value: 2800000 },
      { time: '17:00', value: 4500000 },
      { time: '19:00', value: 5200000 },
      { time: '21:00', value: 3800000 },
    ],
    yesterday: [
      { time: '09:00', value: 1000000 },
      { time: '11:00', value: 2200000 },
      { time: '13:00', value: 3000000 },
      { time: '15:00', value: 2500000 },
      { time: '17:00', value: 4000000 },
      { time: '19:00', value: 4800000 },
      { time: '21:00', value: 3500000 },
    ]
  };
  
  const topProducts = [
    { name: 'Nasi Goreng', value: 85, percentage: 85 },
    { name: 'Ayam Bakar', value: 75, percentage: 75 },
    { name: 'Sate Ayam', value: 65, percentage: 65 },
    { name: 'Mie Goreng', value: 55, percentage: 55 },
    { name: 'Gado-Gado', value: 45, percentage: 45 },
  ];
  
  const topTables = [
    { name: 'Meja 5', value: 92, percentage: 92 },
    { name: 'Meja 2', value: 85, percentage: 85 },
    { name: 'Meja 8', value: 78, percentage: 78 },
    { name: 'Meja 3', value: 70, percentage: 70 },
    { name: 'Meja 10', value: 65, percentage: 65 },
  ];
  
  const revenueData = [
    { time: '09:00', value: 1200000 },
    { time: '11:00', value: 2500000 },
    { time: '13:00', value: 3200000 },
    { time: '15:00', value: 2800000 },
    { time: '17:00', value: 4500000 },
    { time: '19:00', value: 5200000 },
    { time: '21:00', value: 3800000 },
  ];
  
  // Data untuk stok produk
  const stockData = {
    today: [
      { name: 'Nasi Goreng', current: 45, min: 20, max: 100, status: 'normal' },
      { name: 'Ayam Bakar', current: 15, min: 20, max: 100, status: 'low' },
      { name: 'Sate Ayam', current: 8, min: 15, max: 80, status: 'critical' },
      { name: 'Mie Goreng', current: 32, min: 20, max: 80, status: 'normal' },
      { name: 'Gado-Gado', current: 25, min: 15, max: 60, status: 'normal' },
      { name: 'Es Teh', current: 120, min: 50, max: 200, status: 'normal' },
      { name: 'Es Jeruk', current: 30, min: 40, max: 100, status: 'low' },
    ],
    yesterday: [
      { name: 'Nasi Goreng', current: 50, min: 20, max: 100, status: 'normal' },
      { name: 'Ayam Bakar', current: 25, min: 20, max: 100, status: 'normal' },
      { name: 'Sate Ayam', current: 18, min: 15, max: 80, status: 'normal' },
      { name: 'Mie Goreng', current: 40, min: 20, max: 80, status: 'normal' },
      { name: 'Gado-Gado', current: 30, min: 15, max: 60, status: 'normal' },
      { name: 'Es Teh', current: 100, min: 50, max: 200, status: 'low' },
      { name: 'Es Jeruk', current: 35, min: 40, max: 100, status: 'low' },
    ]
  };
  
  // Data untuk aktivitas terkini
  const recentActivities = [
    { id: 1, type: 'order', description: 'Pesanan baru #1234 - Meja 5', time: '10 menit yang lalu', status: 'success' },
    { id: 2, type: 'payment', description: 'Pembayaran berhasil #1233 - Meja 3', time: '25 menit yang lalu', status: 'success' },
    { id: 3, type: 'inventory', description: 'Stok Ayam Bakar hampir habis', time: '1 jam yang lalu', status: 'warning' },
    { id: 4, type: 'order', description: 'Pesanan dibatalkan #1232 - Meja 7', time: '2 jam yang lalu', status: 'error' },
    { id: 5, type: 'table', description: 'Meja 2 telah dibersihkan', time: '3 jam yang lalu', status: 'info' },
  ];
  
  // Data untuk feedback pelanggan
  const customerFeedback = [
    { id: 1, name: 'Ahmad Fauzi', rating: 5, comment: 'Makanan enak dan pelayanan cepat!', time: '2 jam yang lalu', table: 'Meja 3' },
    { id: 2, name: 'Siti Rahayu', rating: 4, comment: 'Suasana nyaman, tapi perlu tambah menu', time: '3 jam yang lalu', table: 'Meja 7' },
    { id: 3, name: 'Budi Santoso', rating: 4, comment: 'Harga terjangkau dengan porsi yang besar', time: '5 jam yang lalu', table: 'Meja 5' },
    { id: 4, name: 'Dewi Lestari', rating: 3, comment: 'Rasa makanan kurang konsisten', time: '1 hari yang lalu', table: 'Meja 2' },
    { id: 5, name: 'Eko Prasetyo', rating: 5, comment: 'Sangat puas, akan datang lagi', time: '1 hari yang lalu', table: 'Meja 8' },
  ];
  // Sample data for integrations
  const integrationData = {
    gofood: {
      totalOrders: 1250,
      totalRevenue: 31250000,
      activeProducts: 45,
      status: 'connected'
    },
    grabfood: {
      totalOrders: 980,
      totalRevenue: 24500000,
      activeProducts: 38,
      status: 'connected'
    },
    shopeefood: {
      totalOrders: 1550,
      totalRevenue: 38750000,
      activeProducts: 42,
      status: 'connected'
    }
  };
  
  // Render active tab content
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Suspense fallback={<LoadingSpinner />}>
                <ReportCard 
                  title="Total Penjualan"
                  value="Rp 12.450.000"
                  icon={<FiDollarSign size={24} />}
                  trend="up"
                  description="Dibandingkan bulan lalu"
                />
                <ReportCard 
                  title="Pelanggan Baru"
                  value="24"
                  icon={<FiUsers size={24} />}
                  trend="up"
                  description="+12% dari bulan lalu"
                />
                <ReportCard 
                  title="Produk Terjual"
                  value="156"
                  icon={<FiPackage size={24} />}
                  trend="stable"
                  description="Sama seperti bulan lalu"
                />
                <ReportCard 
                  title="Meja Terisi"
                  value="8/12"
                  icon={<FiGrid size={24} />}
                  trend="down"
                  description="-2 dari kemarin"
                />
              </Suspense>
            </div>
            
            {/* Additional Business Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                    <FiTrendingUp size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pendapatan Hari Ini</p>
                    <p className="text-xl font-bold">Rp 3.850.000</p>
                    <p className="text-xs text-green-600 flex items-center">
                      <FiTrendingUp className="mr-1" /> 8.5% dari kemarin
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                    <FiShoppingBag size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Transaksi Hari Ini</p>
                    <p className="text-xl font-bold">42</p>
                    <p className="text-xs text-green-600 flex items-center">
                      <FiTrendingUp className="mr-1" /> 5 transaksi/jam
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                    <FiStar size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Rating Rata-rata</p>
                    <p className="text-xl font-bold">4.7/5.0</p>
                    <p className="text-xs text-green-600 flex items-center">
                      <FiTrendingUp className="mr-1" /> 0.3 dari bulan lalu
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                    <FiRefreshCw size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Produk Perlu Restok</p>
                    <p className="text-xl font-bold">3</p>
                    <p className="text-xs text-red-600">
                      2 produk stok kritis
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales Chart */}
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Grafik Penjualan</h3>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setSalesTimeFilter('today')}
                      className={`px-3 py-1 text-xs rounded-lg ${
                        salesTimeFilter === 'today' 
                          ? 'bg-indigo-100 text-indigo-800' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Hari Ini
                    </button>
                    <button 
                      onClick={() => setSalesTimeFilter('yesterday')}
                      className={`px-3 py-1 text-xs rounded-lg ${
                        salesTimeFilter === 'yesterday' 
                          ? 'bg-indigo-100 text-indigo-800' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Kemarin
                    </button>
                    <button 
                      onClick={() => setSalesTimeFilter('week')}
                      className={`px-3 py-1 text-xs rounded-lg ${
                        salesTimeFilter === 'week' 
                          ? 'bg-indigo-100 text-indigo-800' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Minggu
                    </button>
                    <button 
                      onClick={() => setSalesTimeFilter('month')}
                      className={`px-3 py-1 text-xs rounded-lg ${
                        salesTimeFilter === 'month' 
                          ? 'bg-indigo-100 text-indigo-800' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Bulan
                    </button>
                  </div>
                </div>
                <Suspense fallback={<LoadingSpinner />}>
                  <SalesChart data={salesData[salesTimeFilter]} />
                </Suspense>
              </div>
              
              {/* Stock Status Chart */}
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Status Stok Produk</h3>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setStockTimeFilter('today')}
                      className={`px-3 py-1 text-xs rounded-lg ${
                        stockTimeFilter === 'today' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Hari Ini
                    </button>
                    <button 
                      onClick={() => setStockTimeFilter('yesterday')}
                      className={`px-3 py-1 text-xs rounded-lg ${
                        stockTimeFilter === 'yesterday' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Kemarin
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {stockData[stockTimeFilter].map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{item.name}</span>
                        <span className={`text-sm ${
                          item.status === 'critical' ? 'text-red-600' : 
                          item.status === 'low' ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {item.current}/{item.max}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            item.status === 'critical' ? 'bg-gradient-to-r from-red-500 to-red-700' : 
                            item.status === 'low' ? 'bg-gradient-to-r from-yellow-500 to-yellow-700' : 
                            'bg-gradient-to-r from-green-500 to-green-700'
                          }`}
                          style={{ width: `${(item.current / item.max) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center mt-2 space-x-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>
                    <span className="text-xs">Kritis</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded mr-1"></div>
                    <span className="text-xs">Rendah</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
                    <span className="text-xs">Normal</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Activities and Customer Feedback */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activities */}
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Aktivitas Terkini</h3>
                  <Link href="/pages/recentactivities" className="text-sm text-blue-600 hover:text-blue-800">
                    Lihat Semua
                  </Link>
                </div>
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start p-2 hover:bg-gray-50 rounded-lg">
                      <div className={`p-2 rounded-full mr-3 ${
                        activity.status === 'success' ? 'bg-green-100 text-green-600' :
                        activity.status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                        activity.status === 'error' ? 'bg-red-100 text-red-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {activity.status === 'success' ? <FiCheckCircle size={16} /> :
                         activity.status === 'warning' ? <FiAlertTriangle size={16} /> :
                         activity.status === 'error' ? <FiXCircle size={16} /> :
                         <FiCalendar size={16} />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Customer Feedback */}
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Feedback Pelanggan</h3>
                  <Link href="/pages/customerfeedback" className="text-sm text-blue-600 hover:text-blue-800">
                    Lihat Semua
                  </Link>
                </div>
                <div className="space-y-3">
                  {customerFeedback.map((feedback) => (
                    <div key={feedback.id} className="p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-medium">{feedback.name}</p>
                          <p className="text-xs text-gray-500">{feedback.table} • {feedback.time}</p>
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <FiStar 
                              key={i} 
                              className={`${i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                              size={14} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{feedback.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Top Products and Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Products */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-medium mb-4">Produk Terlaris</h3>
                <div className="space-y-3">
                  {topProducts.map((product, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{product.name}</span>
                        <span className="text-sm text-gray-600">{product.value} pesanan</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full" 
                          style={{ width: `${product.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Top Tables */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-medium mb-4">Meja Terpopuler</h3>
                <div className="space-y-3">
                  {topTables.map((table, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{table.name}</span>
                        <span className="text-sm text-gray-600">{table.value}% penggunaan</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full" 
                          style={{ width: `${table.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Performance Summary */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-medium mb-4">Ringkasan Kinerja</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-800">Efisiensi Meja</span>
                    <FiActivity className="text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-700 mt-1">78%</p>
                  <p className="text-xs text-blue-600">Di atas target (75%)</p>
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-800">Waktu Proses Rata-rata</span>
                    <FiRefreshCw className="text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-700 mt-1">15m</p>
                  <p className="text-xs text-green-600">Dari pesanan ke pembayaran</p>
                </div>
                
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-purple-800">Stok Optimal</span>
                    <FiPackage className="text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-purple-700 mt-1">92%</p>
                  <p className="text-xs text-purple-600">Produk dengan stok normal</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'pos':
        return (
          <div className="bg-white rounded-lg shadow">
            <Suspense fallback={<LoadingSpinner />}>
              <PointOfSale />
            </Suspense>
          </div>
        );
      case 'products':
        return (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-6">Manajemen Produk</h2>
            <Suspense fallback={<LoadingSpinner />}>
              <ProductTable />
            </Suspense>
          </div>
        );
      case 'customers':
        return (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-6">Manajemen Pelanggan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Suspense fallback={<LoadingSpinner />}>
                <CustomerCard 
                  title="Total Pelanggan"
                  value={125}
                  icon={<FiUsers size={24} />}
                />
                <CustomerCard 
                  title="Pelanggan Baru (Bulan Ini)"
                  value={15}
                  icon={<FiUser size={24} />}
                />
                <CustomerCard 
                  title="Pelanggan Aktif"
                  value={89}
                  icon={<FiTrendingUp size={24} />}
                />
              </Suspense>
            </div>
          </div>
        );
      case 'tables':
        return (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-6">Manajemen Meja</h2>
            <Suspense fallback={<LoadingSpinner />}>
              <TableManagement />
            </Suspense>
          </div>
        );
      case 'analysis':
        return (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-6">Analisis Bisnis</h2>
            <Suspense fallback={<LoadingSpinner />}>
              <AnalysisProfit />
            </Suspense>
          </div>
        );
      // Tambahkan case baru untuk analisis penjualan
      case 'analysis-sales':
        return (
          <div className="bg-white rounded-lg shadow">
            <Suspense fallback={<LoadingSpinner />}>
              <SalesAnalysisPage />
            </Suspense>
          </div>
        );
      case 'inventory-analysis':
        return (
          <div className="bg-white rounded-lg shadow">
            <Suspense fallback={<LoadingSpinner />}>
              <InventoryAnalysis />
            </Suspense>
          </div>
        );
      case 'analysis-trending':
        return (
          <div className="bg-white rounded-lg shadow">
            <Suspense fallback={<LoadingSpinner />}>
              <ProdukTrending />
            </Suspense>
          </div>
        );
      // Integrasi platform
      case 'integration-gofood':
        return (
          <div className="bg-white rounded-lg shadow">
            <Suspense fallback={<LoadingSpinner />}>
              <IntegrationGoFood 
                isConnected={integrationData.gofood.status === 'connected'}
                integrationData={integrationData.gofood}
                products={products || []} // Tambahkan fallback empty array
                onConnect={() => console.log('Connect GoFood')}
                onDisconnect={() => console.log('Disconnect GoFood')}
                onUpdateSettings={(platform, settings) => console.log('Update settings', platform, settings)}
              />
            </Suspense>
          </div>
        );
      case 'integration-grabfood':
        return (
          <div className="bg-white rounded-lg shadow">
            <Suspense fallback={<LoadingSpinner />}>
              <IntegrationGrabFood 
                isConnected={integrationData.grabfood.status === 'connected'}
                integrationData={integrationData.grabfood}
                products={products || []} // Tambahkan fallback empty array
                onConnect={() => console.log('Connect GrabFood')}
                onDisconnect={() => console.log('Disconnect GrabFood')}
                onUpdateSettings={(platform, settings) => console.log('Update settings', platform, settings)}
              />
            </Suspense>
          </div>
        );
      case 'integration-shopeefood':
        return (
          <div className="bg-white rounded-lg shadow">
            <Suspense fallback={<LoadingSpinner />}>
              <IntegrationShopeeFood 
                isConnected={integrationData.shopeefood.status === 'connected'}
                integrationData={integrationData.shopeefood}
                products={products || []} // Tambahkan fallback empty array
                onConnect={() => console.log('Connect ShopeeFood')}
                onDisconnect={() => console.log('Disconnect ShopeeFood')}
                onUpdateSettings={(platform, settings) => console.log('Update settings', platform, settings)}
              />
            </Suspense>
          </div>
        );
      case 'reports':
        return (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-6">Laporan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Suspense fallback={<LoadingSpinner />}>
                <ReportCard 
                  title="Laporan Harian"
                  value="Download"
                  icon={<FiCreditCard size={24} />}
                  action
                />
                <ReportCard 
                  title="Laporan Bulanan"
                  value="Download"
                  icon={<FiBarChart2 size={24} />}
                  action
                />
              </Suspense>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-6">Modul Dashboard</h2>
            <p>Pilih modul dari menu sidebar untuk melihat tampilan</p>
          </div>
        );
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
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
                  placeholder="Cari..."
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={activeTab === 'pos'}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {activeTab === 'pos' && (
                <div className="flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                  <FiShoppingCart className="mr-2" />
                  <span>POS Mode</span>
                </div>
              )}
              
              <button className="relative p-2 text-gray-600 hover:text-indigo-600">
                  <Link href='/pages/notification'><FiBell size={20} /></Link>
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      3
                  </span>
              </button>
              
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <FiUser size={18} />
                </div>
                <span className="ml-2 font-medium">
                  <Link href="/pages/profiles">Admin</Link>
                </span>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 bg-gray-100">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
}