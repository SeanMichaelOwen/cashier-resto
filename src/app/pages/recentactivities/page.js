'use client';
import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiArrowLeft, FiCheckCircle, FiXCircle, FiAlertTriangle, FiCalendar, FiShoppingBag, FiCreditCard, FiPackage, FiUser, FiGrid, FiClock } from 'react-icons/fi';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

const RecentActivitiesPage = () => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Data aktivitas terkini
  const sampleActivities = [
    { id: 1, type: 'order', description: 'Pesanan baru #1234 - Meja 5', details: '2x Nasi Goreng, 1x Ayam Bakar, 2x Es Teh', time: '2023-06-15T14:30:00', status: 'success', user: 'Budi Santoso' },
    { id: 2, type: 'payment', description: 'Pembayaran berhasil #1233 - Meja 3', details: 'Total: Rp 85.000 (Tunai)', time: '2023-06-15T14:15:00', status: 'success', user: 'Siti Rahayu' },
    { id: 3, type: 'inventory', description: 'Stok Ayam Bakar hampir habis', details: 'Sisa stok: 5 porsi (min: 20 porsi)', time: '2023-06-15T13:45:00', status: 'warning', user: 'System' },
    { id: 4, type: 'order', description: 'Pesanan dibatalkan #1232 - Meja 7', details: 'Pelanggan membatalkan pesanan', time: '2023-06-15T13:20:00', status: 'error', user: 'Ahmad Fauzi' },
    { id: 5, type: 'table', description: 'Meja 2 telah dibersihkan', details: 'Persiapan untuk pelanggan berikutnya', time: '2023-06-15T12:45:00', status: 'info', user: 'Dewi Lestari' },
    { id: 6, type: 'order', description: 'Pesanan baru #1231 - Meja 8', details: '1x Mie Goreng, 1x Sate Ayam, 1x Es Jeruk', time: '2023-06-15T12:30:00', status: 'success', user: 'Eko Prasetyo' },
    { id: 7, type: 'payment', description: 'Pembayaran berhasil #1230 - Meja 1', details: 'Total: Rp 120.000 (Kartu Debit)', time: '2023-06-15T12:15:00', status: 'success', user: 'Rina Susanti' },
    { id: 8, type: 'inventory', description: 'Restok Es Teh', details: 'Ditambah 50 unit (stok sekarang: 120)', time: '2023-06-15T11:30:00', status: 'success', user: 'Agus Wijaya' },
    { id: 9, type: 'customer', description: 'Pelanggan baru terdaftar', details: 'Maya Sari (mayas@example.com)', time: '2023-06-15T11:15:00', status: 'success', user: 'System' },
    { id: 10, type: 'table', description: 'Meja 10 telah dipesan', details: 'Oleh Hendra Gunawan untuk pukul 19:00', time: '2023-06-15T10:45:00', status: 'info', user: 'Linda Permata' },
    { id: 11, type: 'order', description: 'Pesanan baru #1229 - Meja 4', details: '3x Nasi Goreng, 2x Ayam Bakar, 3x Es Teh', time: '2023-06-15T10:30:00', status: 'success', user: 'Fajar Nugroho' },
    { id: 12, type: 'payment', description: 'Pembayaran berhasil #1228 - Meja 6', details: 'Total: Rp 150.000 (QRIS)', time: '2023-06-15T10:15:00', status: 'success', user: 'Yuni Astuti' },
    { id: 13, type: 'inventory', description: 'Stok Gado-Gado habis', details: 'Perlu restok segera (min: 15 porsi)', time: '2023-06-14T20:30:00', status: 'error', user: 'System' },
    { id: 14, type: 'order', description: 'Pesanan dibatalkan #1227 - Meja 9', details: 'Meja tidak tersedia', time: '2023-06-14T20:15:00', status: 'error', user: 'System' },
    { id: 15, type: 'table', description: 'Meja 3 telah dibersihkan', details: 'Persiapan untuk pelanggan berikutnya', time: '2023-06-14T19:45:00', status: 'info', user: 'Budi Santoso' },
  ];

  useEffect(() => {
    // Simulasi loading data
    setTimeout(() => {
      setActivities(sampleActivities);
      setFilteredActivities(sampleActivities);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    // Filter activities based on search query and type
    let result = activities;
    
    if (searchQuery) {
      result = result.filter(activity => 
        activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.user.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (typeFilter !== 'all') {
      result = result.filter(activity => activity.type === typeFilter);
    }
    
    setFilteredActivities(result);
  }, [searchQuery, typeFilter, activities]);

  const formatTime = (timeString) => {
    try {
      return format(parseISO(timeString), 'dd/MM/yyyy HH:mm', { locale: id });
    } catch (error) {
      return timeString;
    }
  };

  const getRelativeTime = (timeString) => {
    try {
      const date = parseISO(timeString);
      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Baru saja';
      if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`;
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours} jam yang lalu`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays} hari yang lalu`;
      
      return format(date, 'dd/MM/yyyy', { locale: id });
    } catch (error) {
      return timeString;
    }
  };

  const getActivityIcon = (type, status) => {
    const baseClasses = "p-2 rounded-full mr-3";
    
    switch (type) {
      case 'order':
        return (
          <div className={`${baseClasses} ${
            status === 'success' ? 'bg-green-100 text-green-600' :
            status === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
          }`}>
            <FiShoppingBag size={16} />
          </div>
        );
      case 'payment':
        return (
          <div className={`${baseClasses} ${
            status === 'success' ? 'bg-green-100 text-green-600' :
            status === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
          }`}>
            <FiCreditCard size={16} />
          </div>
        );
      case 'inventory':
        return (
          <div className={`${baseClasses} ${
            status === 'success' ? 'bg-green-100 text-green-600' :
            status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
            status === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
          }`}>
            <FiPackage size={16} />
          </div>
        );
      case 'customer':
        return (
          <div className={`${baseClasses} bg-green-100 text-green-600`}>
            <FiUser size={16} />
          </div>
        );
      case 'table':
        return (
          <div className={`${baseClasses} bg-blue-100 text-blue-600`}>
            <FiGrid size={16} />
          </div>
        );
      default:
        return (
          <div className={`${baseClasses} bg-gray-100 text-gray-600`}>
            <FiClock size={16} />
          </div>
        );
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <FiCheckCircle className="text-green-600" size={16} />;
      case 'warning':
        return <FiAlertTriangle className="text-yellow-600" size={16} />;
      case 'error':
        return <FiXCircle className="text-red-600" size={16} />;
      default:
        return <FiCalendar className="text-blue-600" size={16} />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'order': return 'Pesanan';
      case 'payment': return 'Pembayaran';
      case 'inventory': return 'Inventori';
      case 'customer': return 'Pelanggan';
      case 'table': return 'Meja';
      default: return 'Lainnya';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'success': return 'Berhasil';
      case 'warning': return 'Peringatan';
      case 'error': return 'Gagal';
      case 'info': return 'Informasi';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button 
                onClick={() => window.history.back()}
                className="mr-4 p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                <FiArrowLeft size={20} />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Aktivitas Terkini</h1>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <FiClock size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Aktivitas</p>
                <p className="text-xl font-bold">{activities.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <FiCheckCircle size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Berhasil</p>
                <p className="text-xl font-bold">{activities.filter(a => a.status === 'success').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                <FiAlertTriangle size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Peringatan</p>
                <p className="text-xl font-bold">{activities.filter(a => a.status === 'warning').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                <FiXCircle size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Gagal</p>
                <p className="text-xl font-bold">{activities.filter(a => a.status === 'error').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                <FiCalendar size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Hari Ini</p>
                <p className="text-xl font-bold">
                  {activities.filter(a => {
                    const today = new Date();
                    const activityDate = new Date(a.time);
                    return activityDate.toDateString() === today.toDateString();
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari aktivitas..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <FiFilter className="text-gray-500" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Tipe</option>
                <option value="order">Pesanan</option>
                <option value="payment">Pembayaran</option>
                <option value="inventory">Inventori</option>
                <option value="customer">Pelanggan</option>
                <option value="table">Meja</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Activities List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {filteredActivities.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {filteredActivities.map((activity) => (
                    <div key={activity.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start">
                        {getActivityIcon(activity.type, activity.status)}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <p className="text-sm font-medium">{activity.description}</p>
                              <p className="text-xs text-gray-500">{activity.details}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                activity.status === 'success' ? 'bg-green-100 text-green-800' :
                                activity.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                activity.status === 'error' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {getStatusLabel(activity.status)}
                              </span>
                              <span className="text-xs text-gray-500">
                                {getRelativeTime(activity.time)}
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <div className="flex items-center space-x-3">
                              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                {getTypeLabel(activity.type)}
                              </span>
                              <span className="text-xs text-gray-500">
                                Oleh: {activity.user}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatTime(activity.time)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FiClock className="mx-auto text-gray-400 text-3xl mb-2" />
                  <p className="text-gray-500">Tidak ada aktivitas yang ditemukan</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default RecentActivitiesPage;