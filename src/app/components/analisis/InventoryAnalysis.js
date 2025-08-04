'use client';
import React, { useState, useEffect } from 'react';
import { 
  FiBarChart2, FiTrendingUp, FiClock, FiPackage, 
  FiDollarSign, FiAlertTriangle, FiFilter 
} from 'react-icons/fi';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { formatRupiah } from '@/utils/formatCurrency';

const InventoryAnalysis = ({ products, stockOpnameHistory }) => {
  // State for filters
  const [timeFilter, setTimeFilter] = useState('month');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState('all');
  
  // Chart data state
  const [salesData, setSalesData] = useState([]);
  const [stockMovementData, setStockMovementData] = useState([]);
  const [stockStatusData, setStockStatusData] = useState([]);
  const [categorySalesData, setCategorySalesData] = useState([]);
  
  // Initialize data
  useEffect(() => {
    // Mock data - replace with real API calls
    const topProducts = [
      { name: 'Kopi Latte', penjualan: 120, kategori: 'Minuman' },
      { name: 'Cappuccino', penjualan: 98, kategori: 'Minuman' },
      { name: 'Croissant', penjualan: 86, kategori: 'Makanan' },
      // ... more products
    ];
    
    const movementData = [
      { name: 'Jan', masuk: 4000, keluar: 2400 },
      { name: 'Feb', masuk: 3000, keluar: 1398 },
      // ... more months
    ];
    
    const statusData = [
      { name: 'Stok Aman', value: 35 },
      { name: 'Stok Menipis', value: 15 },
      { name: 'Stok Habis', value: 5 },
    ];
    
    const categoryData = [
      { name: 'Minuman', penjualan: 478 },
      { name: 'Makanan', penjualan: 271 },
      { name: 'Snack', penjualan: 98 },
    ];
    
    setSalesData(topProducts);
    setStockMovementData(movementData);
    setStockStatusData(statusData);
    setCategorySalesData(categoryData);
  }, [products, stockOpnameHistory]);

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  const STOCK_COLORS = ['#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold">Analisis Persediaan</h2>
          <p className="text-gray-600">Laporan lengkap persediaan dan penjualan</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center">
            <label className="mr-2 text-sm">Periode:</label>
            <select 
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-1 text-sm"
            >
              <option value="week">Minggu Ini</option>
              <option value="month">Bulan Ini</option>
              <option value="year">Tahun Ini</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <label className="mr-2 text-sm">Kategori:</label>
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-1 text-sm"
            >
              <option value="all">Semua</option>
              <option value="food">Makanan</option>
              <option value="drink">Minuman</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-blue-600">Total Produk</p>
              <h3 className="text-2xl font-bold">{products.length}</h3>
            </div>
            <FiPackage className="text-blue-500 text-2xl" />
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-green-600">Produk Terjual</p>
              <h3 className="text-2xl font-bold">1,248</h3>
            </div>
            <FiTrendingUp className="text-green-500 text-2xl" />
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-yellow-600">Stok Menipis</p>
              <h3 className="text-2xl font-bold">15</h3>
            </div>
            <FiAlertTriangle className="text-yellow-500 text-2xl" />
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-purple-600">Nilai Persediaan</p>
              <h3 className="text-2xl font-bold">{formatRupiah(12500000)}</h3>
            </div>
            <FiDollarSign className="text-purple-500 text-2xl" />
          </div>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Best Selling Products */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiTrendingUp className="mr-2 text-green-600" />
            Produk Terlaris
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="penjualan" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Stock Status */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiPackage className="mr-2 text-yellow-600" />
            Status Stok
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stockStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {stockStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STOCK_COLORS[index % STOCK_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Stock Movement */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiClock className="mr-2 text-purple-600" />
            Pergerakan Stok
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stockMovementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="masuk" stroke="#8884d8" />
                <Line type="monotone" dataKey="keluar" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Sales by Category */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiBarChart2 className="mr-2 text-indigo-600" />
            Penjualan per Kategori
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categorySalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="penjualan" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Low Stock Products */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FiAlertTriangle className="mr-2 text-yellow-600" />
          Produk Stok Menipis
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-3 text-xs font-medium text-gray-500 uppercase">Produk</th>
                <th className="p-3 text-xs font-medium text-gray-500 uppercase">Kategori</th>
                <th className="p-3 text-xs font-medium text-gray-500 uppercase">Stok</th>
                <th className="p-3 text-xs font-medium text-gray-500 uppercase">Estimasi Habis</th>
              </tr>
            </thead>
            <tbody>
              {products
                .filter(p => p.stock < 10)
                .map(product => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="p-3 font-medium">{product.name}</td>
                    <td className="p-3">{product.category}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        product.stock < 5 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {product.stock} pcs
                      </span>
                    </td>
                    <td className="p-3">
                      {product.stock > 0 ? `${Math.ceil(product.stock/3)} hari` : 'Habis'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Stock Opname History */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FiClock className="mr-2 text-purple-600" />
          History Stock Opname
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-3 text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="p-3 text-xs font-medium text-gray-500 uppercase">Produk</th>
                <th className="p-3 text-xs font-medium text-gray-500 uppercase">Penyesuaian</th>
              </tr>
            </thead>
            <tbody>
              {stockOpnameHistory.slice(0, 10).map((record, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="p-3">{new Date(record.timestamp).toLocaleDateString()}</td>
                  <td className="p-3 font-medium">{record.productName}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      record.adjustment > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {record.adjustment > 0 ? '+' : ''}{record.adjustment}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryAnalysis;