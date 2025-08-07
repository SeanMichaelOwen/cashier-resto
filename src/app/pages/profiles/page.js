'use client';
import React, { useState } from 'react';
import { 
  FiUser, FiMail, FiPhone, FiLock, FiCalendar, 
  FiMapPin, FiSave, FiEdit2, FiArrowLeft, FiShield,
  FiBell, FiSettings, FiHelpCircle, FiLogOut
} from 'react-icons/fi';
import Link from 'next/link';

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  // State untuk form profil
  const [profileData, setProfileData] = useState({
    name: 'Admin Restoran',
    email: 'admin@restoran.com',
    phone: '+62 812 3456 7890',
    position: 'Administrator',
    joinDate: '15 Januari 2022',
    address: 'Jl. Raya No. 123, Jakarta',
    bio: 'Administrator sistem dengan 5 tahun pengalaman di industri restoran.'
  });
  
  // State untuk form password
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // State untuk preferensi notifikasi
  const [notificationPreferences, setNotificationPreferences] = useState({
    email: true,
    push: true,
    sms: false,
    orderUpdates: true,
    promotions: false,
    systemAlerts: true
  });
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationPreferences(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleSaveProfile = (e) => {
    e.preventDefault();
    // Logika untuk menyimpan profil
    setIsEditing(false);
    alert('Profil berhasil diperbarui!');
  };
  
  const handleSavePassword = (e) => {
    e.preventDefault();
    // Validasi password
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Password baru tidak cocok!');
      return;
    }
    
    // Logika untuk mengubah password
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    alert('Password berhasil diubah!');
  };
  
  const renderProfileTab = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Informasi Profil</h2>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          {isEditing ? <FiSave className="mr-2" /> : <FiEdit2 className="mr-2" />}
          {isEditing ? 'Simpan' : 'Edit'}
        </button>
      </div>
      
      <form onSubmit={handleSaveProfile}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center mb-4">
              <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-4">
                <FiUser size={40} />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{profileData.name}</h3>
                <p className="text-gray-600">{profileData.position}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-indigo-500' : 'border-gray-200 bg-gray-50'}`}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-indigo-500' : 'border-gray-200 bg-gray-50'}`}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-indigo-500' : 'border-gray-200 bg-gray-50'}`}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Posisi</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="position"
                  value={profileData.position}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-indigo-500' : 'border-gray-200 bg-gray-50'}`}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Bergabung</label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="joinDate"
                  value={profileData.joinDate}
                  disabled
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <textarea
                  name="address"
                  value={profileData.address}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                  rows={2}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-indigo-500' : 'border-gray-200 bg-gray-50'}`}
                ></textarea>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                name="bio"
                value={profileData.bio}
                onChange={handleProfileChange}
                disabled={!isEditing}
                rows={3}
                className={`w-full p-3 rounded-lg border ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-indigo-500' : 'border-gray-200 bg-gray-50'}`}
              ></textarea>
            </div>
          </div>
        </div>
        
        {isEditing && (
          <div className="mt-6 flex justify-end">
            <button 
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg mr-2 hover:bg-gray-50"
            >
              Batal
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Simpan Perubahan
            </button>
          </div>
        )}
      </form>
    </div>
  );
  
  const renderSecurityTab = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-6">Keamanan & Privasi</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiLock className="mr-2" /> Ubah Password
          </h3>
          
          <form onSubmit={handleSavePassword}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password Saat Ini</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
              
              <div className="pt-2">
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Ubah Password
                </button>
              </div>
            </div>
          </form>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiShield className="mr-2" /> Keamanan Akun
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Autentikasi Dua Faktor</span>
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Nonaktif</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">Tambahkan lapisan keamanan ekstra untuk akun Anda</p>
              <button className="text-sm text-indigo-600 hover:text-indigo-800">
                Aktifkan Sekarang
              </button>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Login Terakhir</span>
              </div>
              <p className="text-sm text-gray-600">15 Juni 2023, 14:30 WIB</p>
              <p className="text-xs text-gray-500">Dari: Chrome di Windows</p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Perangkat Terdaftar</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">1 perangkat terdaftar</p>
              <button className="text-sm text-indigo-600 hover:text-indigo-800">
                Kelola Perangkat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderNotificationsTab = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-6">Preferensi Notifikasi</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiBell className="mr-2" /> Saluran Notifikasi
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-gray-600">Terima notifikasi melalui email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="email"
                  checked={notificationPreferences.email}
                  onChange={handleNotificationChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium">Push Notification</p>
                <p className="text-sm text-gray-600">Terima notifikasi di browser</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="push"
                  checked={notificationPreferences.push}
                  onChange={handleNotificationChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium">SMS</p>
                <p className="text-sm text-gray-600">Terima notifikasi melalui SMS</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="sms"
                  checked={notificationPreferences.sms}
                  onChange={handleNotificationChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiSettings className="mr-2" /> Jenis Notifikasi
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium">Update Pesanan</p>
                <p className="text-sm text-gray-600">Notifikasi untuk status pesanan</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="orderUpdates"
                  checked={notificationPreferences.orderUpdates}
                  onChange={handleNotificationChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium">Promosi & Penawaran</p>
                <p className="text-sm text-gray-600">Promosi khusus dan penawaran menarik</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="promotions"
                  checked={notificationPreferences.promotions}
                  onChange={handleNotificationChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium">Alert Sistem</p>
                <p className="text-sm text-gray-600">Pembaruan sistem dan notifikasi penting</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="systemAlerts"
                  checked={notificationPreferences.systemAlerts}
                  onChange={handleNotificationChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex justify-end">
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          Simpan Preferensi
        </button>
      </div>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <Link href="/" className="mr-4 text-gray-600 hover:text-gray-900">
              <FiArrowLeft size={24} />
            </Link>
            <h1 className="text-xl font-bold">Profil Pengguna</h1>
          </div>
          
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              <FiUser size={18} />
            </div>
            <span className="ml-2 font-medium">Admin</span>
          </div>
        </div>
      </header>
      
      <main className="p-4 bg-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Informasi Profil
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'security'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Keamanan
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'notifications'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Notifikasi
              </button>
            </nav>
          </div>
          
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'security' && renderSecurityTab()}
          {activeTab === 'notifications' && renderNotificationsTab()}
        </div>
      </main>
    </div>
  );
}