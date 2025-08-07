'use client';
import React, { useState, useMemo } from 'react';
import { 
  FiCheckCircle, FiXCircle, FiRefreshCw, FiSettings, 
  FiBarChart2, FiShoppingBag, FiDollarSign, FiPackage,
  FiTrendingUp, FiClock, FiAlertTriangle, FiExternalLink,
  FiPlus, FiEdit, FiTrash2, FiFilter, FiDownload,
  FiStar
} from 'react-icons/fi';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { formatRupiah } from '@/utils/formatCurrency';

const IntegrationGoFood = ({ 
  isConnected = false, 
  integrationData = {}, 
  products = [],
  onConnect, 
  onDisconnect,
  onUpdateSettings
}) => {
  // State untuk komponen
  const [activeTab, setActiveTab] = useState('overview');
  const [timeFilter, setTimeFilter] = useState('week');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [settings, setSettings] = useState({
    autoSync: true,
    syncInterval: 30, // minutes
    autoUpdateStock: true,
    enablePromotions: true,
    notificationEnabled: true
  });
  
  // Generate data untuk chart menggunakan useMemo
  const { salesData, performanceData, topProducts } = useMemo(() => {
    try {
      // Data penjualan berdasarkan filter waktu
      const salesData = [
        { name: 'Sen', orders: 45, revenue: 1125000 },
        { name: 'Sel', orders: 52, revenue: 1300000 },
        { name: 'Rab', orders: 38, revenue: 950000 },
        { name: 'Kam', orders: 65, revenue: 1625000 },
        { name: 'Jum', orders: 78, revenue: 1950000 },
        { name: 'Sab', orders: 92, revenue: 2300000 },
        { name: 'Min', orders: 85, revenue: 2125000 },
      ];
      
      // Data performa platform
      const performanceData = [
        { name: 'Jan', orders: 1200, revenue: 30000000 },
        { name: 'Feb', orders: 1350, revenue: 33750000 },
        { name: 'Mar', orders: 1500, revenue: 37500000 },
        { name: 'Apr', orders: 1420, revenue: 35500000 },
        { name: 'Mei', orders: 1650, revenue: 41250000 },
        { name: 'Jun', orders: 1800, revenue: 45000000 },
      ];
      
      // Produk terlaris di GoFood
      const topProducts = products
        .filter(p => p.trending?.gofood?.count > 0)
        .sort((a, b) => (b.trending?.gofood?.count || 0) - (a.trending?.gofood?.count || 0))
        .slice(0, 5)
        .map(product => ({
          ...product,
          gofoodOrders: product.trending?.gofood?.count || 0,
          gofoodRevenue: (product.trending?.gofood?.count || 0) * product.price
        }));
      
      return { salesData, performanceData, topProducts };
    } catch (err) {
      console.error('Error processing GoFood data:', err);
      return {
        salesData: [],
        performanceData: [],
        topProducts: []
      };
    }
  }, [products, timeFilter]);
  
  // Handle perubahan pengaturan
  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onUpdateSettings('gofood', newSettings);
  };
  
  // Toggle pemilihan produk
  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };
  
  // Produk yang terintegrasi dengan GoFood
  const integratedProducts = products.filter(p => p.integrations?.gofood);
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mr-3">
            <div className="w-6 h-6 rounded-full bg-green-500"></div>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Integrasi GoFood</h2>
            <div className="flex items-center mt-1">
              {isConnected ? (
                <>
                  <FiCheckCircle className="text-green-500 mr-1" />
                  <span className="text-green-600">Terhubung</span>
                </>
              ) : (
                <>
                  <FiXCircle className="text-red-500 mr-1" />
                  <span className="text-red-600">Tidak Terhubung</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {isConnected ? (
            <button 
              onClick={onDisconnect}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center"
            >
              <FiXCircle className="mr-2" />
              Putuskan Koneksi
            </button>
          ) : (
            <button 
              onClick={onConnect}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 flex items-center"
            >
              <FiCheckCircle className="mr-2" />
              Hubungkan Sekarang
            </button>
          )}
          
          <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center">
            <FiRefreshCw className="mr-2" />
            Sinkronkan Data
          </button>
          
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center">
            <FiSettings className="mr-2" />
            Pengaturan
          </button>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Ringkasan
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'products'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Produk
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pengaturan
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Analitik
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-green-600">Total Pesanan</p>
                  <h3 className="text-2xl font-bold">{integrationData.totalOrders || 0}</h3>
                  <p className="text-xs text-green-600 mt-1">
                    <FiTrendingUp className="inline mr-1" />
                    +12% dari bulan lalu
                  </p>
                </div>
                <FiShoppingBag className="text-green-500 text-2xl" />
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-blue-600">Total Pendapatan</p>
                  <h3 className="text-2xl font-bold">
                    {formatRupiah(integrationData.totalRevenue || 0)}
                  </h3>
                  <p className="text-xs text-blue-600 mt-1">
                    <FiTrendingUp className="inline mr-1" />
                    +8% dari bulan lalu
                  </p>
                </div>
                <FiDollarSign className="text-blue-500 text-2xl" />
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-purple-600">Produk Aktif</p>
                  <h3 className="text-2xl font-bold">{integrationData.activeProducts || 0}</h3>
                  <p className="text-xs text-purple-600 mt-1">
                    Dari {products.length} produk total
                  </p>
                </div>
                <FiPackage className="text-purple-500 text-2xl" />
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-yellow-600">Rating Rata-rata</p>
                  <h3 className="text-2xl font-bold">4.7/5.0</h3>
                  <p className="text-xs text-yellow-600 mt-1">
                    <FiTrendingUp className="inline mr-1" />
                    +0.2 dari bulan lalu
                  </p>
                </div>
                <FiStar className="text-yellow-500 text-2xl" />
              </div>
            </div>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Chart */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Pesanan Mingguan</h3>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setTimeFilter('week')}
                    className={`px-3 py-1 text-xs rounded-lg ${
                      timeFilter === 'week' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Minggu
                  </button>
                  <button 
                    onClick={() => setTimeFilter('month')}
                    className={`px-3 py-1 text-xs rounded-lg ${
                      timeFilter === 'month' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Bulan
                  </button>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'revenue' ? formatRupiah(value) : value, 
                        name === 'orders' ? 'Pesanan' : 'Pendapatan'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="orders" name="orders" fill="#00AA13" />
                    <Bar dataKey="revenue" name="revenue" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Performance Chart */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-medium mb-4">Performa 6 Bulan Terakhir</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'revenue' ? formatRupiah(value) : value, 
                        name === 'orders' ? 'Pesanan' : 'Pendapatan'
                      ]}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="orders" 
                      name="orders" 
                      stroke="#00AA13" 
                      activeDot={{ r: 8 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      name="revenue" 
                      stroke="#82ca9d" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Top Products */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="font-medium mb-4">Produk Terlaris di GoFood</h3>
            <div className="overflow-x-auto">
              {topProducts.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="p-3 text-xs font-medium text-gray-500 uppercase">Produk</th>
                      <th className="p-3 text-xs font-medium text-gray-500 uppercase">Pesanan</th>
                      <th className="p-3 text-xs font-medium text-gray-500 uppercase">Pendapatan</th>
                      <th className="p-3 text-xs font-medium text-gray-500 uppercase">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((product, index) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="p-3 font-medium">{product.name}</td>
                        <td className="p-3">{product.gofoodOrders}</td>
                        <td className="p-3">{formatRupiah(product.gofoodRevenue)}</td>
                        <td className="p-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <FiStar
                                key={i} 
                                className={`${i < (product.rating || 4) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                size={14} 
                              />
                            ))}
                            <span className="ml-1 text-sm">{product.rating || 4.0}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Tidak ada data produk terlaris
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Produk Terintegrasi</h3>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
                <FiPlus className="mr-2" />
                Tambah Produk
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center">
                <FiDownload className="mr-2" />
                Ekspor Data
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {integratedProducts.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="p-3 text-xs font-medium text-gray-500 uppercase">
                      <input type="checkbox" className="rounded" />
                    </th>
                    <th className="p-3 text-xs font-medium text-gray-500 uppercase">Produk</th>
                    <th className="p-3 text-xs font-medium text-gray-500 uppercase">Kategori</th>
                    <th className="p-3 text-xs font-medium text-gray-500 uppercase">Harga</th>
                    <th className="p-3 text-xs font-medium text-gray-500 uppercase">Pesanan</th>
                    <th className="p-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="p-3 text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {integratedProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="p-3">
                        <input 
                          type="checkbox" 
                          className="rounded"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => toggleProductSelection(product.id)}
                        />
                      </td>
                      <td className="p-3 font-medium">{product.name}</td>
                      <td className="p-3">{product.category}</td>
                      <td className="p-3">{formatRupiah(product.price)}</td>
                      <td className="p-3">{product.trending?.gofood?.count || 0}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          product.integrations?.gofood?.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {product.integrations?.gofood?.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <button className="p-1 text-blue-600 hover:text-blue-800">
                            <FiEdit size={16} />
                          </button>
                          <button className="p-1 text-red-600 hover:text-red-800">
                            <FiTrash2 size={16} />
                          </button>
                          <button className="p-1 text-green-600 hover:text-green-800">
                            <FiExternalLink size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FiPackage className="mx-auto text-4xl text-gray-300 mb-2" />
                <p>Belum ada produk yang terintegrasi dengan GoFood</p>
                <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Tambah Produk Sekarang
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-5 rounded-lg">
              <h3 className="font-medium mb-4">Pengaturan Sinkronisasi</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Sinkronisasi Otomatis</p>
                    <p className="text-sm text-gray-500">Sinkronkan data secara otomatis</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={settings.autoSync}
                      onChange={(e) => handleSettingChange('autoSync', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Interval Sinkronisasi</p>
                    <p className="text-sm text-gray-500">Frekuensi sinkronisasi data</p>
                  </div>
                  <select 
                    value={settings.syncInterval}
                    onChange={(e) => handleSettingChange('syncInterval', parseInt(e.target.value))}
                    className="rounded-lg border border-gray-300 px-3 py-1 text-sm"
                  >
                    <option value="15">15 menit</option>
                    <option value="30">30 menit</option>
                    <option value="60">1 jam</option>
                    <option value="180">3 jam</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Update Stok Otomatis</p>
                    <p className="text-sm text-gray-500">Update stok di GoFood otomatis</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={settings.autoUpdateStock}
                      onChange={(e) => handleSettingChange('autoUpdateStock', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-5 rounded-lg">
              <h3 className="font-medium mb-4">Pengaturan Lainnya</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Aktifkan Promosi</p>
                    <p className="text-sm text-gray-500">Ikuti promosi dari GoFood</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={settings.enablePromotions}
                      onChange={(e) => handleSettingChange('enablePromotions', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notifikasi Pesanan</p>
                    <p className="text-sm text-gray-500">Terima notifikasi pesanan baru</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={settings.notificationEnabled}
                      onChange={(e) => handleSettingChange('notificationEnabled', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex">
              <FiAlertTriangle className="text-yellow-500 mt-1 mr-3" />
              <div>
                <h4 className="font-medium text-yellow-800">Penting</h4>
                <p className="text-sm text-yellow-700">
                  Pastikan stok produk selalu update untuk menghindari pembatalan pesanan. 
                  GoFood akan memberikan penalti jika pesanan sering dibatalkan karena stok habis.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-medium mb-4">Waktu Puncak Pesanan</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Siang (11:00 - 14:00)</span>
                  <span className="font-medium">45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Malam (18:00 - 21:00)</span>
                  <span className="font-medium">35%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Sore (15:00 - 17:00)</span>
                  <span className="font-medium">20%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-medium mb-4">Metode Pembayaran</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>GoPay</span>
                  <span className="font-medium">65%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>COD</span>
                  <span className="font-medium">25%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Transfer Bank</span>
                  <span className="font-medium">10%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-medium mb-4">Performa Pengiriman</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Tepat Waktu</span>
                  <span className="font-medium">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Terlambat</span>
                  <span className="font-medium">6%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '6%' }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Dibatalkan</span>
                  <span className="font-medium">2%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '2%' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="font-medium mb-4">Feedback Pelanggan</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="p-3 text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                    <th className="p-3 text-xs font-medium text-gray-500 uppercase">Pesanan</th>
                    <th className="p-3 text-xs font-medium text-gray-500 uppercase">Pelanggan</th>
                    <th className="p-3 text-xs font-medium text-gray-500 uppercase">Rating</th>
                    <th className="p-3 text-xs font-medium text-gray-500 uppercase">Komentar</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-50">
                    <td className="p-3">12 Jun 2023</td>
                    <td className="p-3">#GF-12345</td>
                    <td className="p-3">Ahmad Fauzi</td>
                    <td className="p-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <FiStar 
                            key={i} 
                            className={`${i < 5 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            size={14} 
                          />
                        ))}
                      </div>
                    </td>
                    <td className="p-3">Makanan enak dan pengiriman cepat!</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="p-3">11 Jun 2023</td>
                    <td className="p-3">#GF-12344</td>
                    <td className="p-3">Siti Rahayu</td>
                    <td className="p-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <FiStar 
                            key={i} 
                            className={`${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            size={14} 
                          />
                        ))}
                      </div>
                    </td>
                    <td className="p-3">Rasa makanan kurang konsisten</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="p-3">10 Jun 2023</td>
                    <td className="p-3">#GF-12343</td>
                    <td className="p-3">Budi Santoso</td>
                    <td className="p-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <FiStar 
                            key={i} 
                            className={`${i < 5 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            size={14} 
                          />
                        ))}
                      </div>
                    </td>
                    <td className="p-3">Porsi besar dan harga terjangkau</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationGoFood;