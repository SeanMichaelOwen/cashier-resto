'use client';
import React, { useState } from 'react';
import { 
  FiBell, FiCheck, FiTrash2, FiFilter, FiSearch, 
  FiClock, FiShoppingBag, FiAlertCircle, FiInfo,
  FiUser, FiMessageSquare, FiArrowLeft, FiSettings
} from 'react-icons/fi';
import Link from 'next/link';

export default function Notifications() {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data notifikasi
  const [notifications, setNotifications] = useState([
    { 
      id: 1, 
      title: 'Pesanan Baru', 
      description: 'Pesanan #1234 dari Meja 5', 
      time: '10 menit yang lalu', 
      read: false, 
      type: 'order',
      icon: <FiShoppingBag />,
      color: 'blue'
    },
    { 
      id: 2, 
      title: 'Pembayaran Berhasil', 
      description: 'Pembayaran #1233 telah diterima', 
      time: '25 menit yang lalu', 
      read: false, 
      type: 'payment',
      icon: <FiCheck />,
      color: 'green'
    },
    { 
      id: 3, 
      title: 'Stok Menipis', 
      description: 'Stok Ayam Bakar hampir habis', 
      time: '1 jam yang lalu', 
      read: true, 
      type: 'inventory',
      icon: <FiAlertCircle />,
      color: 'yellow'
    },
    { 
      id: 4, 
      title: 'Pesanan Dibatalkan', 
      description: 'Pesanan #1232 telah dibatalkan', 
      time: '2 jam yang lalu', 
      read: true, 
      type: 'order',
      icon: <FiShoppingBag />,
      color: 'red'
    },
    { 
      id: 5, 
      title: 'Feedback Pelanggan', 
      description: 'Pelanggan di Meja 3 memberikan rating 5 bintang', 
      time: '3 jam yang lalu', 
      read: true, 
      type: 'feedback',
      icon: <FiUser />,
      color: 'purple'
    },
    { 
      id: 6, 
      title: 'Pembaruan Sistem', 
      description: 'Sistem akan diperbarui malam ini pukul 23.00', 
      time: '5 jam yang lalu', 
      read: false, 
      type: 'system',
      icon: <FiInfo />,
      color: 'indigo'
    },
    { 
      id: 7, 
      title: 'Promo Baru', 
      description: 'Promo "Hari Raya" telah aktif', 
      time: '1 hari yang lalu', 
      read: true, 
      type: 'promotion',
      icon: <FiMessageSquare />,
      color: 'pink'
    },
    { 
      id: 8, 
      title: 'Laporan Harian', 
      description: 'Laporan penjualan kemarin sudah tersedia', 
      time: '1 hari yang lalu', 
      read: false, 
      type: 'report',
      icon: <FiInfo />,
      color: 'teal'
    }
  ]);
  
  // Filter notifikasi berdasarkan kategori
  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || notification.type === filter;
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         notification.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  
  // Menandai notifikasi sebagai dibaca
  const markAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };
  
  // Menandai semua notifikasi sebagai dibaca
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => 
      ({ ...notification, read: true })
    ));
  };
  
  // Menghapus notifikasi
  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };
  
  // Menghapus semua notifikasi yang sudah dibaca
  const clearReadNotifications = () => {
    setNotifications(notifications.filter(notification => !notification.read));
  };
  
  // Menghitung notifikasi yang belum dibaca
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  // Mendapatkan warna berdasarkan tipe notifikasi
  const getColorClass = (color) => {
    switch(color) {
      case 'blue': return 'bg-blue-100 text-blue-600';
      case 'green': return 'bg-green-100 text-green-600';
      case 'yellow': return 'bg-yellow-100 text-yellow-600';
      case 'red': return 'bg-red-100 text-red-600';
      case 'purple': return 'bg-purple-100 text-purple-600';
      case 'indigo': return 'bg-indigo-100 text-indigo-600';
      case 'pink': return 'bg-pink-100 text-pink-600';
      case 'teal': return 'bg-teal-100 text-teal-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <Link href="/" className="mr-4 text-gray-600 hover:text-gray-900">
              <FiArrowLeft size={24} />
            </Link>
            <h1 className="text-xl font-bold">Notifikasi</h1>
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari notifikasi..."
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <FiUser size={18} />
              </div>
              <Link href='./profiles'><span className="ml-2 font-medium">Admin</span></Link>
            </div>
          </div>
        </div>
      </header>
      
      <main className="p-4 bg-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between">
              <div className="flex items-center mb-2 sm:mb-0">
                <FiBell className="mr-2 text-gray-600" />
                <h2 className="text-lg font-semibold">Daftar Notifikasi</h2>
                <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                  {notifications.length} notifikasi
                </span>
              </div>
              
              <div className="flex space-x-2">
                <div className="relative">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="all">Semua Notifikasi</option>
                    <option value="order">Pesanan</option>
                    <option value="payment">Pembayaran</option>
                    <option value="inventory">Stok</option>
                    <option value="feedback">Feedback</option>
                    <option value="system">Sistem</option>
                    <option value="promotion">Promo</option>
                    <option value="report">Laporan</option>
                  </select>
                  <FiFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
                  >
                    <FiCheck className="mr-1" />
                    <span>Tandai semua dibaca</span>
                  </button>
                )}
                
                <button 
                  onClick={clearReadNotifications}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
                >
                  <FiTrash2 className="mr-1" />
                  <span>Hapus yang dibaca</span>
                </button>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex items-start">
                      <div className={`p-2 rounded-full mr-3 ${getColorClass(notification.color)}`}>
                        {notification.icon}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 flex items-center">
                              <FiClock className="mr-1" size={12} />
                              {notification.time}
                            </span>
                            
                            {!notification.read && (
                              <button 
                                onClick={() => markAsRead(notification.id)}
                                className="text-gray-500 hover:text-indigo-600"
                                title="Tandai sebagai dibaca"
                              >
                                <FiCheck size={16} />
                              </button>
                            )}
                            
                            <button 
                              onClick={() => deleteNotification(notification.id)}
                              className="text-gray-500 hover:text-red-600"
                              title="Hapus notifikasi"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
                        
                        <div className="mt-2 flex items-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            notification.type === 'order' ? 'bg-blue-100 text-blue-800' :
                            notification.type === 'payment' ? 'bg-green-100 text-green-800' :
                            notification.type === 'inventory' ? 'bg-yellow-100 text-yellow-800' :
                            notification.type === 'feedback' ? 'bg-purple-100 text-purple-800' :
                            notification.type === 'system' ? 'bg-indigo-100 text-indigo-800' :
                            notification.type === 'promotion' ? 'bg-pink-100 text-pink-800' :
                            notification.type === 'report' ? 'bg-teal-100 text-teal-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {notification.type === 'order' ? 'Pesanan' :
                             notification.type === 'payment' ? 'Pembayaran' :
                             notification.type === 'inventory' ? 'Stok' :
                             notification.type === 'feedback' ? 'Feedback' :
                             notification.type === 'system' ? 'Sistem' :
                             notification.type === 'promotion' ? 'Promo' :
                             notification.type === 'report' ? 'Laporan' : 'Umum'}
                          </span>
                          
                          {!notification.read && (
                            <span className="ml-2 inline-block h-2 w-2 rounded-full bg-blue-600"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <FiBell className="mx-auto text-gray-400" size={48} />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Tidak ada notifikasi</h3>
                  <p className="mt-1 text-gray-500">
                    {filter === 'all' 
                      ? 'Anda tidak memiliki notifikasi saat ini.' 
                      : `Tidak ada notifikasi dengan kategori "${filter}".`}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FiSettings className="mr-2" /> Pengaturan Notifikasi
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium mb-2">Notifikasi Pesanan</h3>
                <p className="text-sm text-gray-600 mb-3">Notifikasi untuk pesanan baru, perubahan status, dan pembatalan</p>
                <div className="flex items-center">
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input type="checkbox" id="order-notifications" className="sr-only" defaultChecked />
                    <div className="block bg-gray-300 w-10 h-6 rounded-full"></div>
                    <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                  </div>
                  <label htmlFor="order-notifications" className="text-gray-700">Aktif</label>
                </div>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium mb-2">Notifikasi Stok</h3>
                <p className="text-sm text-gray-600 mb-3">Notifikasi untuk stok menipis dan perlu restok</p>
                <div className="flex items-center">
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input type="checkbox" id="stock-notifications" className="sr-only" defaultChecked />
                    <div className="block bg-gray-300 w-10 h-6 rounded-full"></div>
                    <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                  </div>
                  <label htmlFor="stock-notifications" className="text-gray-700">Aktif</label>
                </div>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium mb-2">Notifikasi Sistem</h3>
                <p className="text-sm text-gray-600 mb-3">Notifikasi untuk pembaruan sistem dan laporan</p>
                <div className="flex items-center">
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input type="checkbox" id="system-notifications" className="sr-only" defaultChecked />
                    <div className="block bg-gray-300 w-10 h-6 rounded-full"></div>
                    <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                  </div>
                  <label htmlFor="system-notifications" className="text-gray-700">Aktif</label>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Link href="/profile" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center">
                <FiSettings className="mr-2" />
                Pengaturan Lengkap
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}