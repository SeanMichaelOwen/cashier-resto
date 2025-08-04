// app/dashboard/components/AnalysisProfit.js
'use client';
import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiCalendar, FiFilter, FiDownload, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { formatRupiah } from '@/utils/formatCurrency';

const AnalysisProfit = ({ products, transactions }) => {
  const [dateRange, setDateRange] = useState('month');
  const [profitData, setProfitData] = useState([]);
  const [profitByCategory, setProfitByCategory] = useState([]);
  const [topProfitProducts, setTopProfitProducts] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [netProfitData, setNetProfitData] = useState([]);

  useEffect(() => {
    // Data laba rugi per kategori
    const categories = {};
    transactions.forEach(transaction => {
      transaction.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const profit = (item.price - product.price * 0.7) * item.quantity; // Asumsi COGS 70%
          if (!categories[product.category]) {
            categories[product.category] = 0;
          }
          categories[product.category] += profit;
        }
      });
    });

    const categoryData = Object.keys(categories).map(category => ({
      name: category,
      value: categories[category]
    }));
    setProfitByCategory(categoryData);

    // Data produk paling menguntungkan
    const productProfits = {};
    transactions.forEach(transaction => {
      transaction.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const profit = (item.price - product.price * 0.7) * item.quantity; // Asumsi COGS 70%
          if (!productProfits[item.productId]) {
            productProfits[item.productId] = 0;
          }
          productProfits[item.productId] += profit;
        }
      });
    });

    const topProductsData = Object.keys(productProfits)
      .map(productId => {
        const product = products.find(p => p.id === parseInt(productId));
        return {
          name: product ? product.name : 'Unknown',
          profit: productProfits[productId]
        };
      })
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 10);
    setTopProfitProducts(topProductsData);

    // Data laba rugi harian (contoh data)
    const dailyProfitData = [
      { date: '01/07', revenue: 15000000, expense: 9000000, profit: 6000000 },
      { date: '02/07', revenue: 17000000, expense: 10000000, profit: 7000000 },
      { date: '03/07', revenue: 14000000, expense: 8500000, profit: 5500000 },
      { date: '04/07', revenue: 19000000, expense: 11000000, profit: 8000000 },
      { date: '05/07', revenue: 21000000, expense: 12000000, profit: 9000000 },
      { date: '06/07', revenue: 18000000, expense: 10500000, profit: 7500000 },
      { date: '07/07', revenue: 23000000, expense: 13000000, profit: 10000000 }
    ];
    setNetProfitData(dailyProfitData);

    // Data pendapatan vs pengeluaran (contoh data)
    const revenueExpenseData = [
      { date: '01/07', revenue: 15000000, expense: 9000000 },
      { date: '02/07', revenue: 17000000, expense: 10000000 },
      { date: '03/07', revenue: 14000000, expense: 8500000 },
      { date: '04/07', revenue: 19000000, expense: 11000000 },
      { date: '05/07', revenue: 21000000, expense: 12000000 },
      { date: '06/07', revenue: 18000000, expense: 10500000 },
      { date: '07/07', revenue: 23000000, expense: 13000000 }
    ];
    setExpenseData(revenueExpenseData);

    // Data profit margin per kategori (contoh data)
    const marginData = [
      { name: 'Minuman', margin: 65 },
      { name: 'Makanan', margin: 45 },
      { name: 'Roti', margin: 55 },
      { name: 'Dessert', margin: 70 },
      { name: 'Lainnya', margin: 40 }
    ];
    setProfitData(marginData);
  }, [products, transactions]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const exportReport = () => {
    alert('Laporan laba rugi akan diunduh');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analisis Laba Rugi</h2>
          <p className="text-gray-600">Analisis profitabilitas usaha</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="day">Hari Ini</option>
              <option value="week">Minggu Ini</option>
              <option value="month">Bulan Ini</option>
              <option value="year">Tahun Ini</option>
            </select>
          </div>
          
          <button 
            onClick={exportReport}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg flex items-center transition-colors"
          >
            <FiDownload className="mr-2" />
            Export Laporan
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Grafik Laba Rugi Harian */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiDollarSign className="mr-2 text-green-600" />
            Laba Rugi Harian
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={netProfitData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatRupiah(value)} />
                <Legend />
                <Bar dataKey="profit" fill="#82ca9d" name="Laba" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Grafik Pendapatan vs Pengeluaran */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiDollarSign className="mr-2 text-blue-600" />
            Pendapatan vs Pengeluaran
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={expenseData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatRupiah(value)} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Pendapatan" />
                <Line type="monotone" dataKey="expense" stroke="#ff7300" name="Pengeluaran" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Grafik Laba Rugi per Kategori */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiDollarSign className="mr-2 text-yellow-600" />
            Laba Rugi per Kategori
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={profitByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {profitByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatRupiah(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Grafik Margin Profit per Kategori */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiDollarSign className="mr-2 text-purple-600" />
            Margin Profit per Kategori
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={profitData}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 30,
                  left: 100,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
                <Bar dataKey="margin" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Tabel Produk Paling Menguntungkan */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <h3 className="text-lg font-semibold mb-4">Produk Paling Menguntungkan</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Jual</th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Pokok</th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margin</th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Laba</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topProfitProducts.map((product, index) => {
                const productData = products.find(p => p.name === product.name);
                const sellingPrice = productData ? productData.price : 0;
                const costPrice = productData ? productData.price * 0.7 : 0; // Asumsi COGS 70%
                const margin = sellingPrice - costPrice;
                const marginPercent = ((margin / sellingPrice) * 100).toFixed(1);
                const totalProfit = margin * 10; // Asumsi terjual 10 pcs
                
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-3 font-medium">{index + 1}</td>
                    <td className="p-3">{product.name}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {productData ? productData.category : 'Unknown'}
                      </span>
                    </td>
                    <td className="p-3">{formatRupiah(sellingPrice)}</td>
                    <td className="p-3">{formatRupiah(costPrice)}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {marginPercent}%
                      </span>
                    </td>
                    <td className="p-3 font-medium">{formatRupiah(totalProfit)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Ringkasan Laba Rugi */}
      <div className="bg-green-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FiTrendingUp className="mr-2 text-green-600" />
          Ringkasan Laba Rugi
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-2">Total Pendapatan</h4>
            <p className="text-2xl font-bold text-green-700">
              {formatRupiah(netProfitData.reduce((sum, item) => sum + item.revenue, 0))}
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-2">Total Pengeluaran</h4>
            <p className="text-2xl font-bold text-green-700">
              {formatRupiah(netProfitData.reduce((sum, item) => sum + item.expense, 0))}
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-2">Total Laba Bersih</h4>
            <p className="text-2xl font-bold text-green-700">
              {formatRupiah(netProfitData.reduce((sum, item) => sum + item.profit, 0))}
            </p>
          </div>
        </div>
        
        <div className="mt-4">
          <h4 className="font-medium text-green-800 mb-2">Analisis</h4>
          <p className="text-sm text-green-700">
            Berdasarkan analisis, kategori Minuman memberikan kontribusi laba tertinggi dengan margin rata-rata 65%. 
            Produk dengan margin tertinggi adalah Kue dengan margin 70%. 
            Disarankan untuk meningkatkan stok produk-produk dengan margin tinggi.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisProfit;