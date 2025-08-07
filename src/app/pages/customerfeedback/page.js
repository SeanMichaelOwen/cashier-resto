'use client';
import React, { useState, useEffect } from 'react';
import { FiStar, FiSearch, FiFilter, FiArrowLeft, FiMessageSquare, FiClock, FiUser } from 'react-icons/fi';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

const CustomerFeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Data feedback pelanggan
  const sampleFeedbacks = [
    { id: 1, name: 'Ahmad Fauzi', rating: 5, comment: 'Makanan enak dan pelayanan cepat! Sangat puas dengan pengalaman di restoran ini.', time: '2023-06-15T14:30:00', table: 'Meja 3' },
    { id: 2, name: 'Siti Rahayu', rating: 4, comment: 'Suasana nyaman, tapi perlu tambah menu. Rasa makanan sudah enak.', time: '2023-06-15T12:15:00', table: 'Meja 7' },
    { id: 3, name: 'Budi Santoso', rating: 4, comment: 'Harga terjangkau dengan porsi yang besar. Recommended untuk keluarga.', time: '2023-06-14T19:45:00', table: 'Meja 5' },
    { id: 4, name: 'Dewi Lestari', rating: 3, comment: 'Rasa makanan kurang konsisten. Kadang enak kadang kurang.', time: '2023-06-14T13:20:00', table: 'Meja 2' },
    { id: 5, name: 'Eko Prasetyo', rating: 5, comment: 'Sangat puas, akan datang lagi. Pelayanan ramah dan profesional.', time: '2023-06-13T20:10:00', table: 'Meja 8' },
    { id: 6, name: 'Rina Susanti', rating: 4, comment: 'Menu variatif dan harga bersaing. Suasana cocok untuk kumpul keluarga.', time: '2023-06-13T18:30:00', table: 'Meja 1' },
    { id: 7, name: 'Agus Wijaya', rating: 2, comment: 'Pelayanan lambat saat ramai. Harus diperbaiki sistem antriannya.', time: '2023-06-12T12:45:00', table: 'Meja 4' },
    { id: 8, name: 'Maya Sari', rating: 5, comment: 'Makanan selalu segar dan enak. Favorit saya adalah Ayam Bakar nya.', time: '2023-06-12T19:15:00', table: 'Meja 6' },
    { id: 9, name: 'Hendra Gunawan', rating: 4, comment: 'Tempat bersih dan nyaman. Porsi makanan cukup besar.', time: '2023-06-11T13:00:00', table: 'Meja 9' },
    { id: 10, name: 'Linda Permata', rating: 3, comment: 'Rasa makanan biasa saja, tidak ada yang spesial. Harga sedikit mahal.', time: '2023-06-11T20:30:00', table: 'Meja 10' },
    { id: 11, name: 'Fajar Nugroho', rating: 5, comment: 'Restoran favorit keluarga! Selalu puas dengan makanan dan pelayanannya.', time: '2023-06-10T18:45:00', table: 'Meja 3' },
    { id: 12, name: 'Yuni Astuti', rating: 4, comment: 'Cocok untuk acara bisnis atau kumpul dengan teman. Wifi kencang.', time: '2023-06-10T12:30:00', table: 'Meja 5' },
  ];

  useEffect(() => {
    // Simulasi loading data
    setTimeout(() => {
      setFeedbacks(sampleFeedbacks);
      setFilteredFeedbacks(sampleFeedbacks);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    // Filter feedbacks based on search query and rating
    let result = feedbacks;
    
    if (searchQuery) {
      result = result.filter(feedback => 
        feedback.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feedback.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feedback.table.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (ratingFilter !== 'all') {
      const rating = parseInt(ratingFilter);
      result = result.filter(feedback => feedback.rating === rating);
    }
    
    setFilteredFeedbacks(result);
  }, [searchQuery, ratingFilter, feedbacks]);

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
      const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) return 'Hari ini';
      if (diffInDays === 1) return 'Kemarin';
      if (diffInDays < 7) return `${diffInDays} hari yang lalu`;
      if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} minggu yang lalu`;
      return format(date, 'dd/MM/yyyy', { locale: id });
    } catch (error) {
      return timeString;
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <FiStar 
            key={i} 
            className={`${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
            size={16} 
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
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
              <h1 className="text-xl font-bold text-gray-900">Feedback Pelanggan</h1>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <FiMessageSquare size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Feedback</p>
                <p className="text-xl font-bold">{feedbacks.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                <FiStar size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Rating Rata-rata</p>
                <p className="text-xl font-bold">
                  {feedbacks.length > 0 
                    ? (feedbacks.reduce((sum, item) => sum + item.rating, 0) / feedbacks.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <FiStar size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Feedback Positif</p>
                <p className="text-xl font-bold">
                  {feedbacks.filter(f => f.rating >= 4).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                <FiStar size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Feedback Negatif</p>
                <p className="text-xl font-bold">
                  {feedbacks.filter(f => f.rating <= 2).length}
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
                placeholder="Cari feedback pelanggan..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <FiFilter className="text-gray-500" />
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Rating</option>
                <option value="5">5 Bintang</option>
                <option value="4">4 Bintang</option>
                <option value="3">3 Bintang</option>
                <option value="2">2 Bintang</option>
                <option value="1">1 Bintang</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Feedback List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {filteredFeedbacks.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {filteredFeedbacks.map((feedback) => (
                    <div key={feedback.id} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                            <FiUser size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{feedback.name}</p>
                            <p className="text-xs text-gray-500">{feedback.table} • {formatTime(feedback.time)}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {renderStars(feedback.rating)}
                          <span className="ml-2 text-xs text-gray-500">
                            {getRelativeTime(feedback.time)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{feedback.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FiMessageSquare className="mx-auto text-gray-400 text-3xl mb-2" />
                  <p className="text-gray-500">Tidak ada feedback yang ditemukan</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default CustomerFeedbackPage;