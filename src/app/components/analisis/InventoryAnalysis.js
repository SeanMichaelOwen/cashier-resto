'use client';
import React, { useState, useMemo } from 'react';
import { 
  FiBarChart2, FiTrendingUp, FiClock, FiPackage, 
  FiDollarSign, FiAlertTriangle, FiFilter, FiLoader, FiAlertCircle
} from 'react-icons/fi';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { formatRupiah } from '@/utils/formatCurrency';

const InventoryAnalysis = ({ products = [], stockOpnameHistory = [] }) => {
  // State untuk filter
  const [timeFilter, setTimeFilter] = useState('month');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState('all');
  const [error, setError] = useState(null);

  // Hitung nilai statistik menggunakan useMemo
  const { inventoryValue, lowStockProducts, soldProductsCount } = useMemo(() => {
    try {
      const inventoryValue = products.reduce((total, product) => {
        return total + (product.price * (product.stock || 0));
      }, 0);

      const lowStockProducts = products.filter(p => (p.stock || 0) < 10).length;

      const soldProductsCount = products.reduce((total, product) => {
        return total + ((product.initialStock || 0) - (product.stock || 0));
      }, 0);

      return { inventoryValue, lowStockProducts, soldProductsCount };
    } catch (err) {
      setError(err.message);
      return { inventoryValue: 0, lowStockProducts: 0, soldProductsCount: 0 };
    }
  }, [products]);

  // Generate data untuk chart menggunakan useMemo
  const { salesData, stockMovementData, stockStatusData, categorySalesData } = useMemo(() => {
    try {
      // Produk terlaris
      const salesData = [...products]
        .sort((a, b) => (b.sold || 0) - (a.sold || 0))
        .slice(0, 5)
        .map(product => ({
          name: product.name.length > 12 ? `${product.name.substring(0, 12)}...` : product.name,
          penjualan: product.sold || 0,
          kategori: product.category || 'Unknown'
        }));

      // Status stok
      const inStock = products.filter(p => (p.stock || 0) >= 10).length;
      const lowStock = products.filter(p => (p.stock || 0) < 10 && (p.stock || 0) > 0).length;
      const outOfStock = products.filter(p => (p.stock || 0) === 0).length;
      
      const stockStatusData = [
        { name: 'Stok Aman', value: inStock },
        { name: 'Stok Menipis', value: lowStock },
        { name: 'Stok Habis', value: outOfStock },
      ];

      // Penjualan per kategori
      const categoryMap = {};
      products.forEach(product => {
        const category = product.category || 'Unknown';
        if (!categoryMap[category]) {
          categoryMap[category] = 0;
        }
        categoryMap[category] += product.sold || 0;
      });

      const categorySalesData = Object.entries(categoryMap)
        .map(([name, penjualan]) => ({ name, penjualan }))
        .sort((a, b) => b.penjualan - a.penjualan);

      // Data pergerakan stok (mock data)
      const stockMovementData = [
        { name: 'Jan', masuk: 4000, keluar: 2400 },
        { name: 'Feb', masuk: 3000, keluar: 1398 },
        { name: 'Mar', masuk: 2000, keluar: 9800 },
        { name: 'Apr', masuk: 2780, keluar: 3908 },
        { name: 'Mei', masuk: 1890, keluar: 4800 },
        { name: 'Jun', masuk: 2390, keluar: 3800 },
      ];

      return { salesData, stockMovementData, stockStatusData, categorySalesData };
    } catch (err) {
      setError(err.message);
      return {
        salesData: [],
        stockMovementData: [],
        stockStatusData: [],
        categorySalesData: []
      };
    }
  }, [products]);

  // Warna untuk chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  const STOCK_COLORS = ['#00C49F', '#FFBB28', '#FF8042'];

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center text-red-500">
        <FiAlertCircle className="inline-block text-2xl mb-2" />
        <p>Gagal memuat data inventaris: {error}</p>
        <button 
          onClick={() => setError(null)}
          className="mt-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

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
              <option value="snack">Snack</option>
            </select>
          </div>

          <div className="flex items-center">
            <label className="mr-2 text-sm">Status Stok:</label>
            <select 
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-1 text-sm"
            >
              <option value="all">Semua</option>
              <option value="safe">Aman</option>
              <option value="low">Menipis</option>
              <option value="out">Habis</option>
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
              <h3 className="text-2xl font-bold">{soldProductsCount}</h3>
            </div>
            <FiTrendingUp className="text-green-500 text-2xl" />
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-yellow-600">Stok Menipis</p>
              <h3 className="text-2xl font-bold">{lowStockProducts}</h3>
            </div>
            <FiAlertTriangle className="text-yellow-500 text-2xl" />
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-purple-600">Nilai Persediaan</p>
              <h3 className="text-2xl font-bold">{formatRupiah(inventoryValue)}</h3>
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
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} unit`, 'Penjualan']}
                    labelFormatter={(label) => `Produk: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="penjualan" name="Penjualan" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Tidak ada data penjualan
              </div>
            )}
          </div>
        </div>
        
        {/* Stock Status */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiPackage className="mr-2 text-yellow-600" />
            Status Stok
          </h3>
          <div className="h-80">
            {stockStatusData.some(item => item.value > 0) ? (
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
                  <Tooltip 
                    formatter={(value) => [`${value} produk`, 'Jumlah']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Tidak ada data stok
              </div>
            )}
          </div>
        </div>
        
        {/* Stock Movement */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiClock className="mr-2 text-purple-600" />
            Pergerakan Stok
          </h3>
          <div className="h-80">
            {stockMovementData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={stockMovementData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value} unit`, 
                      name === 'masuk' ? 'Stok Masuk' : 'Stok Keluar'
                    ]}
                  />
                  <Legend 
                    formatter={(value) => value === 'masuk' ? 'Stok Masuk' : 'Stok Keluar'}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="masuk" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="keluar" 
                    stroke="#82ca9d" 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Tidak ada data pergerakan stok
              </div>
            )}
          </div>
        </div>
        
        {/* Sales by Category */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiBarChart2 className="mr-2 text-indigo-600" />
            Penjualan per Kategori
          </h3>
          <div className="h-80">
            {categorySalesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categorySalesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} unit`, 'Penjualan']}
                    labelFormatter={(label) => `Kategori: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="penjualan" name="Penjualan" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Tidak ada data penjualan per kategori
              </div>
            )}
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
          {products.filter(p => (p.stock || 0) < 10).length > 0 ? (
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
                  .filter(p => (p.stock || 0) < 10)
                  .sort((a, b) => (a.stock || 0) - (b.stock || 0))
                  .map((product, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="p-3 font-medium">{product.name}</td>
                      <td className="p-3">{product.category || 'Unknown'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          (product.stock || 0) < 5 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {product.stock || 0} pcs
                        </span>
                      </td>
                      <td className="p-3">
                        {(product.stock || 0) > 0 ? `${Math.ceil((product.stock || 0)/3)} hari` : 'Habis'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-4 text-gray-500">
              Tidak ada produk dengan stok menipis
            </div>
          )}
        </div>
      </div>
      
      {/* Stock Opname History */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FiClock className="mr-2 text-purple-600" />
          History Stock Opname
        </h3>
        <div className="overflow-x-auto">
          {stockOpnameHistory.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="p-3 text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="p-3 text-xs font-medium text-gray-500 uppercase">Produk</th>
                  <th className="p-3 text-xs font-medium text-gray-500 uppercase">Stok Sebelum</th>
                  <th className="p-3 text-xs font-medium text-gray-500 uppercase">Penyesuaian</th>
                  <th className="p-3 text-xs font-medium text-gray-500 uppercase">Stok Sesudah</th>
                </tr>
              </thead>
              <tbody>
                {stockOpnameHistory
                  .slice(0, 10)
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                  .map((record, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="p-3">{new Date(record.timestamp).toLocaleDateString('id-ID')}</td>
                      <td className="p-3 font-medium">{record.productName}</td>
                      <td className="p-3">{record.previousStock}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          record.adjustment > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {record.adjustment > 0 ? '+' : ''}{record.adjustment}
                        </span>
                      </td>
                      <td className="p-3">{record.newStock}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-4 text-gray-500">
              Tidak ada history stock opname
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryAnalysis;