'use client';
import React, { useState } from 'react';
import { 
  FiArrowLeft, FiBarChart2, FiTrendingUp, FiDollarSign, 
  FiShoppingBag, FiUsers, FiCalendar, FiDownload, FiRefreshCw,
  FiFilter, FiChevronDown, FiChevronRight, FiPrinter
} from 'react-icons/fi';

const SalesAnalysisPage = () => {
  const [timeFilter, setTimeFilter] = useState('week');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  
  // Data penjualan berdasarkan filter waktu
  const salesData = {
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
    ],
    week: [
      { name: 'Sen', value: 40000000 },
      { name: 'Sel', value: 35000000 },
      { name: 'Rab', value: 45000000 },
      { name: 'Kam', value: 38000000 },
      { name: 'Jum', value: 55000000 },
      { name: 'Sab', value: 65000000 },
      { name: 'Min', value: 48000000 },
    ],
    month: [
      { name: 'Minggu 1', value: 180000000 },
      { name: 'Minggu 2', value: 210000000 },
      { name: 'Minggu 3', value: 195000000 },
      { name: 'Minggu 4', value: 230000000 },
    ],
    quarter: [
      { name: 'Jan', value: 650000000 },
      { name: 'Feb', value: 720000000 },
      { name: 'Mar', value: 810000000 },
    ],
    year: [
      { name: 'Q1', value: 2180000000 },
      { name: 'Q2', value: 2350000000 },
      { name: 'Q3', value: 2480000000 },
      { name: 'Q4', value: 2650000000 },
    ]
  };
  
  // Data produk terlaris
  const topProducts = [
    { name: 'Nasi Goreng', value: 125, percentage: 25 },
    { name: 'Ayam Bakar', value: 98, percentage: 20 },
    { name: 'Sate Ayam', value: 85, percentage: 17 },
    { name: 'Mie Goreng', value: 72, percentage: 14 },
    { name: 'Gado-Gado', value: 65, percentage: 13 },
    { name: 'Es Teh', value: 55, percentage: 11 },
  ];
  
  // Data kategori penjualan
  const categorySales = [
    { name: 'Makanan Utama', value: 320000000, percentage: 65 },
    { name: 'Minuman', value: 120000000, percentage: 24 },
    { name: 'Makanan Penutup', value: 55000000, percentage: 11 },
  ];
  
  // Data metrik penjualan
  const salesMetrics = {
    today: {
      total: 18500000,
      transactions: 42,
      avgTransaction: 440476,
      growth: 8.5
    },
    week: {
      total: 286000000,
      transactions: 654,
      avgTransaction: 437312,
      growth: 12.3
    },
    month: {
      total: 815000000,
      transactions: 1850,
      avgTransaction: 440540,
      growth: 15.7
    }
  };
  
  // Data perbandingan periode
  const comparisonData = {
    current: {
      total: 815000000,
      transactions: 1850,
      avgTransaction: 440540,
      customers: 1240
    },
    previous: {
      total: 705000000,
      transactions: 1620,
      avgTransaction: 435185,
      customers: 1080
    }
  };
  
  // Fungsi untuk kembali ke halaman sebelumnya tanpa router
  const handleBackClick = () => {
    if (typeof window !== 'undefined') {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        // Jika tidak ada history, kembali ke dashboard
        window.location.href = '/dashboard';
      }
    }
  };
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  const handleCustomDateSubmit = (e) => {
    e.preventDefault();
    // Logika untuk filter dengan tanggal custom
    alert(`Filter dari ${dateRange.start} sampai ${dateRange.end}`);
    setShowCustomDate(false);
  };
  
  const handleExportReport = () => {
    alert('Laporan penjualan sedang diunduh...');
  };
  
  const handlePrintReport = () => {
    alert('Laporan penjualan sedang disiapkan untuk dicetak...');
  };
  
  const renderChart = () => {
    const data = salesData[timeFilter];
    const maxValue = Math.max(...data.map(item => item.value));
    
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Grafik Penjualan</h3>
          <div className="flex space-x-2">
            <button 
              onClick={() => setShowFilterOptions(!showFilterOptions)}
              className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <FiFilter className="mr-1" />
              Filter
              {showFilterOptions ? <FiChevronDown className="ml-1" /> : <FiChevronRight className="ml-1" />}
            </button>
            <button 
              onClick={handleExportReport}
              className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <FiDownload className="mr-1" />
              Export
            </button>
            <button 
              onClick={handlePrintReport}
              className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <FiPrinter className="mr-1" />
              Cetak
            </button>
          </div>
        </div>
        
        {showFilterOptions && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex flex-wrap gap-2 mb-3">
              <button 
                onClick={() => setTimeFilter('today')}
                className={`px-3 py-1 rounded-lg text-sm ${
                  timeFilter === 'today' 
                    ? 'bg-indigo-100 text-indigo-800' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Hari Ini
              </button>
              <button 
                onClick={() => setTimeFilter('yesterday')}
                className={`px-3 py-1 rounded-lg text-sm ${
                  timeFilter === 'yesterday' 
                    ? 'bg-indigo-100 text-indigo-800' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Kemarin
              </button>
              <button 
                onClick={() => setTimeFilter('week')}
                className={`px-3 py-1 rounded-lg text-sm ${
                  timeFilter === 'week' 
                    ? 'bg-indigo-100 text-indigo-800' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Minggu Ini
              </button>
              <button 
                onClick={() => setTimeFilter('month')}
                className={`px-3 py-1 rounded-lg text-sm ${
                  timeFilter === 'month' 
                    ? 'bg-indigo-100 text-indigo-800' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Bulan Ini
              </button>
              <button 
                onClick={() => setTimeFilter('quarter')}
                className={`px-3 py-1 rounded-lg text-sm ${
                  timeFilter === 'quarter' 
                    ? 'bg-indigo-100 text-indigo-800' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Kuartal Ini
              </button>
              <button 
                onClick={() => setTimeFilter('year')}
                className={`px-3 py-1 rounded-lg text-sm ${
                  timeFilter === 'year' 
                    ? 'bg-indigo-100 text-indigo-800' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Tahun Ini
              </button>
              <button 
                onClick={() => setShowCustomDate(!showCustomDate)}
                className={`px-3 py-1 rounded-lg text-sm ${
                  showCustomDate 
                    ? 'bg-indigo-100 text-indigo-800' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Custom Tanggal
              </button>
            </div>
            
            {showCustomDate && (
              <form onSubmit={handleCustomDateSubmit} className="flex items-end space-x-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Dari Tanggal</label>
                  <input 
                    type="date" 
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    className="px-3 py-2 border rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Sampai Tanggal</label>
                  <input 
                    type="date" 
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    className="px-3 py-2 border rounded-lg text-sm"
                    required
                  />
                </div>
                <button type="submit" className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm">
                  Terapkan
                </button>
              </form>
            )}
          </div>
        )}
        
        <div className="h-64 flex items-end space-x-2 border-b border-l border-gray-200 pb-4 pl-8">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className="w-full bg-gradient-to-t from-indigo-500 to-indigo-300 rounded-t-lg"
                style={{ height: `${(item.value / maxValue) * 100}%` }}
              ></div>
              <span className="text-xs mt-2 text-gray-600">{item.name || item.time}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-600">
          Total Penjualan: {formatCurrency(data.reduce((sum, item) => sum + item.value, 0))}
        </div>
      </div>
    );
  };
  
  const renderMetrics = () => {
    const metrics = timeFilter === 'today' ? salesMetrics.today : 
                    timeFilter === 'week' ? salesMetrics.week : 
                    salesMetrics.month;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <FiDollarSign size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Penjualan</p>
              <p className="text-xl font-bold">{formatCurrency(metrics.total)}</p>
              <p className="text-xs text-green-600 flex items-center">
                <FiTrendingUp className="mr-1" /> {metrics.growth}% dari periode sebelumnya
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <FiShoppingBag size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Jumlah Transaksi</p>
              <p className="text-xl font-bold">{metrics.transactions}</p>
              <p className="text-xs text-green-600 flex items-center">
                <FiTrendingUp className="mr-1" /> {Math.round(metrics.growth * 0.8)}% dari periode sebelumnya
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <FiUsers size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Rata-rata Transaksi</p>
              <p className="text-xl font-bold">{formatCurrency(metrics.avgTransaction)}</p>
              <p className="text-xs text-green-600 flex items-center">
                <FiTrendingUp className="mr-1" /> {Math.round(metrics.growth * 0.5)}% dari periode sebelumnya
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderTopProducts = () => (
    <div className="bg-white p-4 rounded-lg shadow mb-6 mt-10">
      <h3 className="text-lg font-semibold mb-4">Produk Terlaris</h3>
      <div className="space-y-3">
        {topProducts.map((product, index) => (
          <div key={index}>
            <div className="flex justify-between mb-1">
              <span className="font-medium">{product.name}</span>
              <span className="text-sm text-gray-600">{product.value} pcs</span>
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
  );
  
  const renderCategorySales = () => (
    <div className="bg-white p-4 rounded-lg shadow mb-6 mt-10">
      <h3 className="text-lg font-semibold mb-4">Penjualan per Kategori</h3>
      <div className="space-y-3">
        {categorySales.map((category, index) => (
          <div key={index}>
            <div className="flex justify-between mb-1">
              <span className="font-medium">{category.name}</span>
              <span className="text-sm text-gray-600">{formatCurrency(category.value)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  index === 0 ? 'bg-gradient-to-r from-blue-400 to-blue-600' : 
                  index === 1 ? 'bg-gradient-to-r from-green-400 to-green-600' : 
                  'bg-gradient-to-r from-purple-400 to-purple-600'
                }`}
                style={{ width: `${category.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
  const renderComparison = () => (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Perbandingan Periode</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metrik</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Periode Saat Ini</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Periode Sebelumnya</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perubahan</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total Penjualan</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(comparisonData.current.total)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(comparisonData.previous.total)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className="text-green-600 flex items-center">
                  <FiTrendingUp className="mr-1" />
                  {Math.round(((comparisonData.current.total - comparisonData.previous.total) / comparisonData.previous.total) * 100)}%
                </span>
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Jumlah Transaksi</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comparisonData.current.transactions}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comparisonData.previous.transactions}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className="text-green-600 flex items-center">
                  <FiTrendingUp className="mr-1" />
                  {Math.round(((comparisonData.current.transactions - comparisonData.previous.transactions) / comparisonData.previous.transactions) * 100)}%
                </span>
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Rata-rata Transaksi</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(comparisonData.current.avgTransaction)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(comparisonData.previous.avgTransaction)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className="text-green-600 flex items-center">
                  <FiTrendingUp className="mr-1" />
                  {Math.round(((comparisonData.current.avgTransaction - comparisonData.previous.avgTransaction) / comparisonData.previous.avgTransaction) * 100)}%
                </span>
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Pelanggan</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comparisonData.current.customers}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comparisonData.previous.customers}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className="text-green-600 flex items-center">
                  <FiTrendingUp className="mr-1" />
                  {Math.round(((comparisonData.current.customers - comparisonData.previous.customers) / comparisonData.previous.customers) * 100)}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {/* <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button 
                onClick={handleBackClick}
                className="mr-4 p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                <FiArrowLeft size={20} />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Analisis Penjualan</h1>
            </div>
          </div>
        </div>
      </header> */}
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderMetrics()}
        {renderChart()}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {renderTopProducts()}
          {renderCategorySales()}
        </div>
        
        {renderComparison()}
      </main>
    </div>
  );
};

export default SalesAnalysisPage;