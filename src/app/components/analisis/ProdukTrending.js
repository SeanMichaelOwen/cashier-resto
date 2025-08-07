'use client';
import React, { useState, useMemo } from 'react';
import { 
  FiTrendingUp, FiFilter, FiRefreshCw, FiBarChart2, 
  FiStar, FiShoppingBag, FiClock, FiDollarSign,
  FiChevronDown, FiChevronRight, FiExternalLink, FiHome
} from 'react-icons/fi';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { formatRupiah } from '@/utils/formatCurrency';

const ProdukTrending = ({ 
  products = [], 
  integrationData = {},
  dineInData = {} // Tambahkan data untuk dine-in
}) => {
  // State untuk filter
  const [platformFilter, setPlatformFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('week');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('trending');
  const [sortOrder, setSortOrder] = useState('desc');
  const [expandedRows, setExpandedRows] = useState({});
  
  // Generate data untuk chart menggunakan useMemo
  const { 
    trendingData, 
    platformComparisonData, 
    categoryTrendingData,
    salesChannelData,
    topProductsByChannel
  } = useMemo(() => {
    try {
      // Data produk tren berdasarkan platform dan dine-in
      const trendingData = products
        .filter(product => {
          // Filter berdasarkan platform
          if (platformFilter !== 'all' && platformFilter !== 'dine-in') {
            if (!product.trending?.[platformFilter]) {
              return false;
            }
          }
          
          // Filter khusus untuk dine-in
          if (platformFilter === 'dine-in' && (!product.sold || product.sold === 0)) {
            return false;
          }
          
          // Filter berdasarkan kategori
          if (categoryFilter !== 'all' && product.category !== categoryFilter) {
            return false;
          }
          
          // Filter berdasarkan status tren
          return (
            (product.trending && Object.keys(product.trending).length > 0) || 
            (product.sold && product.sold > 0)
          );
        })
        .map(product => {
          // Hitung total tren dari semua platform
          const totalTrending = Object.values(product.trending || {}).reduce(
            (sum, platform) => sum + (platform.count || 0), 0
          );
          
          // Hitung total penjualan (dine-in + integrasi)
          const totalSales = (product.sold || 0) + totalTrending;
          
          return {
            ...product,
            totalTrending,
            totalSales,
            // Ambil data platform yang relevan
            gofood: product.trending?.gofood?.count || 0,
            grabfood: product.trending?.grabfood?.count || 0,
            shopeefood: product.trending?.shopeefood?.count || 0,
            // Data dine-in
            dineIn: product.sold || 0
          };
        })
        .sort((a, b) => {
          // Sorting berdasarkan kriteria yang dipilih
          if (sortBy === 'trending') {
            return sortOrder === 'desc' 
              ? b.totalTrending - a.totalTrending 
              : a.totalTrending - b.totalTrending;
          } else if (sortBy === 'sales') {
            return sortOrder === 'desc'
              ? b.totalSales - a.totalSales
              : a.totalSales - b.totalSales;
          } else if (sortBy === 'name') {
            return sortOrder === 'desc'
              ? b.name.localeCompare(a.name)
              : a.name.localeCompare(b.name);
          }
          return 0;
        });
      
      // Data perbandingan platform (termasuk dine-in)
      const platformComparisonData = [
        {
          name: 'Go-Food',
          orders: integrationData.gofood?.totalOrders || 0,
          revenue: integrationData.gofood?.totalRevenue || 0,
          products: integrationData.gofood?.activeProducts || 0,
          color: '#00AA13'
        },
        {
          name: 'GrabFood',
          orders: integrationData.grabfood?.totalOrders || 0,
          revenue: integrationData.grabfood?.totalRevenue || 0,
          products: integrationData.grabfood?.activeProducts || 0,
          color: '#00B14F'
        },
        {
          name: 'ShopeeFood',
          orders: integrationData.shopeefood?.totalOrders || 0,
          revenue: integrationData.shopeefood?.totalRevenue || 0,
          products: integrationData.shopeefood?.activeProducts || 0,
          color: '#EE4D2D'
        },
        {
          name: 'Dine-In',
          orders: dineInData.totalOrders || 0,
          revenue: dineInData.totalRevenue || 0,
          products: products.filter(p => p.sold > 0).length,
          color: '#6366F1'
        }
      ];
      
      // Data tren per kategori
      const categoryMap = {};
      products.forEach(product => {
        const category = product.category || 'Unknown';
        if (!categoryMap[category]) {
          categoryMap[category] = {
            name: category,
            gofood: 0,
            grabfood: 0,
            shopeefood: 0,
            dineIn: 0,
            total: 0
          };
        }
        
        categoryMap[category].gofood += product.trending?.gofood?.count || 0;
        categoryMap[category].grabfood += product.trending?.grabfood?.count || 0;
        categoryMap[category].shopeefood += product.trending?.shopeefood?.count || 0;
        categoryMap[category].dineIn += product.sold || 0;
        categoryMap[category].total += (
          (product.trending?.gofood?.count || 0) +
          (product.trending?.grabfood?.count || 0) +
          (product.trending?.shopeefood?.count || 0) +
          (product.sold || 0)
        );
      });
      
      const categoryTrendingData = Object.values(categoryMap)
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);
      
      // Data perbandingan saluran penjualan
      const totalIntegrationOrders = 
        (integrationData.gofood?.totalOrders || 0) + 
        (integrationData.grabfood?.totalOrders || 0) + 
        (integrationData.shopeefood?.totalOrders || 0);
      
      const totalIntegrationRevenue = 
        (integrationData.gofood?.totalRevenue || 0) + 
        (integrationData.grabfood?.totalRevenue || 0) + 
        (integrationData.shopeefood?.totalRevenue || 0);
      
      const salesChannelData = [
        { name: 'Dine-In', value: dineInData.totalOrders || 0, revenue: dineInData.totalRevenue || 0 },
        { name: 'Integrasi', value: totalIntegrationOrders, revenue: totalIntegrationRevenue }
      ];
      
      // Produk teratas per saluran
      const topProductsByChannel = {
        dineIn: products
          .filter(p => p.sold > 0)
          .sort((a, b) => (b.sold || 0) - (a.sold || 0))
          .slice(0, 3)
          .map(p => ({ ...p, channel: 'Dine-In', count: p.sold || 0 })),
        
        integration: products
          .filter(p => p.trending && Object.keys(p.trending).length > 0)
          .sort((a, b) => {
            const aTotal = Object.values(a.trending || {}).reduce((sum, p) => sum + (p.count || 0), 0);
            const bTotal = Object.values(b.trending || {}).reduce((sum, p) => sum + (p.count || 0), 0);
            return bTotal - aTotal;
          })
          .slice(0, 3)
          .map(p => ({ 
            ...p, 
            channel: 'Integrasi', 
            count: Object.values(p.trending || {}).reduce((sum, p) => sum + (p.count || 0), 0)
          }))
      };
      
      return { 
        trendingData, 
        platformComparisonData, 
        categoryTrendingData,
        salesChannelData,
        topProductsByChannel
      };
    } catch (err) {
      console.error('Error processing trending data:', err);
      return {
        trendingData: [],
        platformComparisonData: [],
        categoryTrendingData: [],
        salesChannelData: [],
        topProductsByChannel: { dineIn: [], integration: [] }
      };
    }
  }, [products, integrationData, dineInData, platformFilter, categoryFilter, sortBy, sortOrder]);
  
  // Toggle expanded row
  const toggleRow = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Warna untuk platform
  const PLATFORM_COLORS = {
    gofood: '#00AA13',
    grabfood: '#00B14F',
    shopeefood: '#EE4D2D',
    dineIn: '#6366F1'
  };
  
  // Fungsi untuk mendapatkan status integrasi
  const getIntegrationStatus = (platform) => {
    return integrationData[platform]?.status === 'connected';
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <FiTrendingUp className="mr-2 text-green-500" />
            Produk Tren
          </h2>
          <p className="text-gray-600">Analisis produk tren di restoran dan platform integrasi</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center">
            <label className="mr-2 text-sm">Saluran:</label>
            <select 
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-1 text-sm"
            >
              <option value="all">Semua Saluran</option>
              <option value="dine-in">Dine-In</option>
              <option value="gofood">Go-Food</option>
              <option value="grabfood">GrabFood</option>
              <option value="shopeefood">ShopeeFood</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <label className="mr-2 text-sm">Periode:</label>
            <select 
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-1 text-sm"
            >
              <option value="today">Hari Ini</option>
              <option value="week">Minggu Ini</option>
              <option value="month">Bulan Ini</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <label className="mr-2 text-sm">Kategori:</label>
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-1 text-sm"
            >
              <option value="all">Semua Kategori</option>
              <option value="food">Makanan</option>
              <option value="drink">Minuman</option>
              <option value="snack">Snack</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-green-600">Total Pesanan</p>
              <h3 className="text-2xl font-bold">
                {platformComparisonData.reduce((sum, platform) => sum + platform.orders, 0)}
              </h3>
              <p className="text-xs text-green-600 mt-1">
                <FiTrendingUp className="inline mr-1" />
                +12% dari periode sebelumnya
              </p>
            </div>
            <FiShoppingBag className="text-green-500 text-2xl" />
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-blue-600">Pendapatan</p>
              <h3 className="text-2xl font-bold">
                {formatRupiah(platformComparisonData.reduce((sum, platform) => sum + platform.revenue, 0))}
              </h3>
              <p className="text-xs text-blue-600 mt-1">
                <FiTrendingUp className="inline mr-1" />
                +8% dari periode sebelumnya
              </p>
            </div>
            <FiDollarSign className="text-blue-500 text-2xl" />
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-purple-600">Produk Tren</p>
              <h3 className="text-2xl font-bold">{trendingData.length}</h3>
              <p className="text-xs text-purple-600 mt-1">
                <FiStar className="inline mr-1" />
                {trendingData.filter(p => p.totalTrending > 50 || p.dineIn > 50).length} produk sangat tren
              </p>
            </div>
            <FiTrendingUp className="text-purple-500 text-2xl" />
          </div>
        </div>
        
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-indigo-600">Dine-In</p>
              <h3 className="text-2xl font-bold">
                {dineInData.totalOrders || 0}
              </h3>
              <p className="text-xs text-indigo-600 mt-1">
                <FiHome className="inline mr-1" />
                {formatRupiah(dineInData.totalRevenue || 0)}
              </p>
            </div>
            <FiHome className="text-indigo-500 text-2xl" />
          </div>
        </div>
      </div>
      
      {/* Sales Channel Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiBarChart2 className="mr-2 text-indigo-600" />
            Perbandingan Saluran Penjualan
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={salesChannelData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {salesChannelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#6366F1' : '#00C49F'} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} pesanan`, 'Jumlah']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiBarChart2 className="mr-2 text-green-600" />
            Perbandingan Platform
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? formatRupiah(value) : value, 
                    name === 'orders' ? 'Pesanan' : 
                    name === 'revenue' ? 'Pendapatan' : 'Produk'
                  ]}
                />
                <Legend 
                  formatter={(value) => 
                    value === 'orders' ? 'Pesanan' : 
                    value === 'revenue' ? 'Pendapatan' : 'Produk Aktif'
                  }
                />
                <Bar dataKey="orders" name="orders" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Top Products by Channel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiHome className="mr-2 text-indigo-600" />
            Produk Terlaris Dine-In
          </h3>
          <div className="space-y-4">
            {topProductsByChannel.dineIn.length > 0 ? (
              topProductsByChannel.dineIn.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{product.count} unit</p>
                    <p className="text-sm text-gray-600">#{index + 1}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                Tidak ada data produk dine-in
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiStar className="mr-2 text-yellow-500" />
            Produk Terlaris Integrasi
          </h3>
          <div className="space-y-4">
            {topProductsByChannel.integration.length > 0 ? (
              topProductsByChannel.integration.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{product.count} unit</p>
                    <p className="text-sm text-gray-600">#{index + 1}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                Tidak ada data produk integrasi
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Category Trending Chart */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FiStar className="mr-2 text-yellow-500" />
          Tren per Kategori
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryTrendingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  `${value} unit`, 
                  name === 'gofood' ? 'Go-Food' : 
                  name === 'grabfood' ? 'GrabFood' : 
                  name === 'shopeefood' ? 'ShopeeFood' : 'Dine-In'
                ]}
              />
              <Legend 
                formatter={(value) => 
                  value === 'gofood' ? 'Go-Food' : 
                  value === 'grabfood' ? 'GrabFood' : 
                  value === 'shopeefood' ? 'ShopeeFood' : 'Dine-In'
                }
              />
              <Bar dataKey="gofood" name="gofood" fill={PLATFORM_COLORS.gofood} />
              <Bar dataKey="grabfood" name="grabfood" fill={PLATFORM_COLORS.grabfood} />
              <Bar dataKey="shopeefood" name="shopeefood" fill={PLATFORM_COLORS.shopeefood} />
              <Bar dataKey="dineIn" name="dineIn" fill={PLATFORM_COLORS.dineIn} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Trending Products Table */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <FiTrendingUp className="mr-2 text-green-500" />
            Daftar Produk Tren
          </h3>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <label className="mr-2 text-sm">Urutkan:</label>
              <select 
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="rounded-lg border border-gray-300 px-3 py-1 text-sm"
              >
                <option value="trending-desc">Tren (Tertinggi)</option>
                <option value="trending-asc">Tren (Terendah)</option>
                <option value="sales-desc">Penjualan (Tertinggi)</option>
                <option value="sales-asc">Penjualan (Terendah)</option>
                <option value="name-desc">Nama (Z-A)</option>
                <option value="name-asc">Nama (A-Z)</option>
              </select>
            </div>
            
            <button className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50">
              <FiRefreshCw />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {trendingData.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="p-3 text-xs font-medium text-gray-500 uppercase">Produk</th>
                  <th className="p-3 text-xs font-medium text-gray-500 uppercase">Kategori</th>
                  <th className="p-3 text-xs font-medium text-gray-500 uppercase">Total Penjualan</th>
                  <th className="p-3 text-xs font-medium text-gray-500 uppercase">Saluran</th>
                  <th className="p-3 text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {trendingData.map((product, index) => (
                  <React.Fragment key={product.id}>
                    <tr className="hover:bg-gray-50 border-b">
                      <td className="p-3 font-medium">{product.name}</td>
                      <td className="p-3">{product.category}</td>
                      <td className="p-3">
                        <div className="flex items-center">
                          <span className="font-medium">{product.totalSales}</span>
                          <span className="ml-2 text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                            #{index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {product.dineIn > 0 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-800">
                              Dine-In: {product.dineIn}
                            </span>
                          )}
                          {getIntegrationStatus('gofood') && product.gofood > 0 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                              Go-Food: {product.gofood}
                            </span>
                          )}
                          {getIntegrationStatus('grabfood') && product.grabfood > 0 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                              GrabFood: {product.grabfood}
                            </span>
                          )}
                          {getIntegrationStatus('shopeefood') && product.shopeefood > 0 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                              ShopeeFood: {product.shopeefood}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <button 
                          onClick={() => toggleRow(product.id)}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          {expandedRows[product.id] ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                      </td>
                    </tr>
                    
                    {expandedRows[product.id] && (
                      <tr className="bg-gray-50">
                        <td colSpan="5" className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <h4 className="font-medium mb-2">Detail per Saluran</h4>
                              <div className="space-y-2">
                                {product.dineIn > 0 && (
                                  <div className="flex justify-between">
                                    <span>Dine-In:</span>
                                    <span className="font-medium">{product.dineIn} unit</span>
                                  </div>
                                )}
                                {getIntegrationStatus('gofood') && product.gofood > 0 && (
                                  <div className="flex justify-between">
                                    <span>Go-Food:</span>
                                    <span className="font-medium">{product.gofood} unit</span>
                                  </div>
                                )}
                                {getIntegrationStatus('grabfood') && product.grabfood > 0 && (
                                  <div className="flex justify-between">
                                    <span>GrabFood:</span>
                                    <span className="font-medium">{product.grabfood} unit</span>
                                  </div>
                                )}
                                {getIntegrationStatus('shopeefood') && product.shopeefood > 0 && (
                                  <div className="flex justify-between">
                                    <span>ShopeeFood:</span>
                                    <span className="font-medium">{product.shopeefood} unit</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-2">Informasi Produk</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span>Harga:</span>
                                  <span className="font-medium">{formatRupiah(product.price)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Stok:</span>
                                  <span className="font-medium">{product.stock || 0} unit</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Total Penjualan:</span>
                                  <span className="font-medium">{product.totalSales} unit</span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-2">Aksi Cepat</h4>
                              <div className="flex flex-wrap gap-2">
                                <button className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm hover:bg-indigo-200">
                                  Edit Produk
                                </button>
                                <button className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200">
                                  Promosikan
                                </button>
                                <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 flex items-center">
                                  <FiExternalLink className="mr-1" />
                                  Lihat di Platform
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Tidak ada data produk tren untuk filter yang dipilih
            </div>
          )}
        </div>
      </div>
      
      {/* Platform Status */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-lg border ${getIntegrationStatus('gofood') ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${getIntegrationStatus('gofood') ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="font-medium">Go-Food</span>
            <span className="ml-auto text-sm">
              {getIntegrationStatus('gofood') ? 'Terhubung' : 'Tidak Terhubung'}
            </span>
          </div>
        </div>
        
        <div className={`p-4 rounded-lg border ${getIntegrationStatus('grabfood') ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${getIntegrationStatus('grabfood') ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="font-medium">GrabFood</span>
            <span className="ml-auto text-sm">
              {getIntegrationStatus('grabfood') ? 'Terhubung' : 'Tidak Terhubung'}
            </span>
          </div>
        </div>
        
        <div className={`p-4 rounded-lg border ${getIntegrationStatus('shopeefood') ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${getIntegrationStatus('shopeefood') ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="font-medium">ShopeeFood</span>
            <span className="ml-auto text-sm">
              {getIntegrationStatus('shopeefood') ? 'Terhubung' : 'Tidak Terhubung'}
            </span>
          </div>
        </div>
        
        <div className="p-4 rounded-lg border border-indigo-200 bg-indigo-50">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2 bg-indigo-500"></div>
            <span className="font-medium">Dine-In</span>
            <span className="ml-auto text-sm">
              Aktif
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProdukTrending;