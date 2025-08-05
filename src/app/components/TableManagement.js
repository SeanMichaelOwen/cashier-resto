'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiPlus, FiEdit2, FiTrash2, FiCheck, 
  FiX, FiCoffee, FiClock, FiCalendar,
  FiUser, FiRotateCcw, FiPhone, FiMail,
  FiSearch, FiAlertCircle
} from 'react-icons/fi';
import { format, parseISO, isBefore } from 'date-fns';
import { useTables } from '../context/TableContext';

const TableManagement = ({ 
  onTableSelect, 
  isSelectMode = false, 
  onBookTable,
  showOnlyAvailable = false
}) => {
  const {
    tables,
    selectedTable,
    addTable,
    updateTable,
    deleteTable,
    updateTableStatus,
    addBooking,
    cancelBooking,
    activeBills,
    removeActiveBill,
    isLoading
  } = useTables();

  // State management with validation
  const [newTable, setNewTable] = useState({
    number: '',
    capacity: 4,
    status: 'available'
  });
  const [editingTable, setEditingTable] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({
    tableId: null,
    customerName: '',
    phone: '',
    email: '',
    bookingTime: '',
    people: 2,
    notes: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  // Filter tables with memoization
  const filteredTables = React.useMemo(() => {
    try {
      return tables.filter(table => {
        const matchesSearch = table.number.toLowerCase().includes(searchTerm.toLowerCase());
        const statusMatch = showOnlyAvailable ? table.status === 'available' : true;
        return matchesSearch && statusMatch;
      });
    } catch (err) {
      console.error("Filter error:", err);
      return [];
    }
  }, [tables, searchTerm, showOnlyAvailable]);

  // Handle table selection
  const handleTableClick = useCallback((table) => {
    try {
      if (isSelectMode && table.status === 'available') {
        if (onTableSelect) onTableSelect(table);
      }
    } catch (err) {
      console.error("Table selection error:", err);
      setError("Gagal memilih meja");
    }
  }, [isSelectMode, onTableSelect]);

  // Add new table with validation
  const handleAddTable = () => {
    try {
      if (!newTable.number.trim()) {
        throw new Error("Nomor meja tidak boleh kosong");
      }

      if (tables.some(t => t.number === newTable.number)) {
        throw new Error("Nomor meja sudah ada");
      }

      addTable({
        ...newTable,
        number: newTable.number.trim()
      });
      setNewTable({ number: '', capacity: 4, status: 'available' });
      setIsAdding(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Update table with validation
  const handleUpdateTable = () => {
    try {
      if (!editingTable?.number.trim()) {
        throw new Error("Nomor meja tidak boleh kosong");
      }

      updateTable(editingTable.id, {
        ...editingTable,
        number: editingTable.number.trim()
      });
      setEditingTable(null);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle booking submission
  const handleConfirmBooking = () => {
    try {
      if (!bookingData.customerName.trim()) {
        throw new Error("Nama pelanggan harus diisi");
      }

      if (!bookingData.bookingTime) {
        throw new Error("Waktu booking harus diisi");
      }

      const booking = {
        ...bookingData,
        customerName: bookingData.customerName.trim(),
        bookingTime: new Date(bookingData.bookingTime).toISOString()
      };
      
      addBooking(booking);
      
      if (onBookTable) {
        onBookTable(booking);
      }
      
      setShowBookingForm(false);
      setBookingData({
        tableId: null,
        customerName: '',
        phone: '',
        email: '',
        bookingTime: '',
        people: 2,
        notes: ''
      });
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Status styling
  const getStatusColor = (status) => {
    switch(status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'booked': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'available': return 'Tersedia';
      case 'occupied': return 'Terisi';
      case 'booked': return 'Dipesan';
      default: return status;
    }
  };

  // Format booking time with error handling
  const formatBookingTime = (bookingTime) => {
    try {
      return format(parseISO(bookingTime), 'dd/MM/yyyy HH:mm');
    } catch {
      return bookingTime;
    }
  };

  // Load active bill
  const loadActiveBill = (tableId) => {
    try {
      const bill = activeBills.find(b => b.table.id === tableId);
      if (!bill) {
        throw new Error("Transaksi aktif tidak ditemukan");
      }
      
      if (onTableSelect) {
        onTableSelect(bill.table);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-4">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 flex items-center">
          <FiAlertCircle className="text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
        <h2 className="text-xl font-bold">
          {isSelectMode ? 'Pilih Meja' : 'Manajemen Meja'}
          {activeBills.length > 0 && (
            <span className="ml-2 bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
              Transaksi Aktif: {activeBills.length}
            </span>
          )}
        </h2>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari meja..."
              className="w-full pl-10 pr-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Cari meja"
            />
          </div>
          
          {!isSelectMode && (
            <button
              onClick={() => setIsAdding(true)}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors"
            >
              <FiPlus className="mr-1" /> Tambah
            </button>
          )}
        </div>
      </div>

      {/* Add Table Form */}
      {isAdding && (
        <div className="bg-white p-4 rounded-lg shadow mb-4 border border-gray-200">
          <h3 className="font-medium mb-3">Tambah Meja Baru</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Nomor Meja*</label>
              <input
                type="text"
                value={newTable.number}
                onChange={(e) => setNewTable({...newTable, number: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: A1"
                maxLength={10}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kapasitas*</label>
              <select
                value={newTable.capacity}
                onChange={(e) => setNewTable({...newTable, capacity: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {[2, 4, 6, 8, 10, 12].map(num => (
                  <option key={num} value={num}>{num} Orang</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={newTable.status}
                onChange={(e) => setNewTable({...newTable, status: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="available">Tersedia</option>
                <option value="occupied">Terisi</option>
                <option value="booked">Dipesan</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={() => {
                setIsAdding(false);
                setError(null);
              }}
              className="px-3 py-1.5 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleAddTable}
              disabled={!newTable.number.trim()}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                newTable.number.trim()
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-blue-300 text-white cursor-not-allowed'
              }`}
            >
              Simpan
            </button>
          </div>
        </div>
      )}

      {/* Edit Table Form */}
      {editingTable && (
        <div className="bg-white p-4 rounded-lg shadow mb-4 border border-gray-200">
          <h3 className="font-medium mb-3">Edit Meja</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Nomor Meja*</label>
              <input
                type="text"
                value={editingTable.number}
                onChange={(e) => setEditingTable({...editingTable, number: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                maxLength={10}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kapasitas*</label>
              <select
                value={editingTable.capacity}
                onChange={(e) => setEditingTable({...editingTable, capacity: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {[2, 4, 6, 8, 10, 12].map(num => (
                  <option key={num} value={num}>{num} Orang</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={editingTable.status}
                onChange={(e) => setEditingTable({...editingTable, status: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="available">Tersedia</option>
                <option value="occupied">Terisi</option>
                <option value="booked">Dipesan</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={() => {
                setEditingTable(null);
                setError(null);
              }}
              className="px-3 py-1.5 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleUpdateTable}
              disabled={!editingTable.number.trim()}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                editingTable.number.trim()
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-blue-300 text-white cursor-not-allowed'
              }`}
            >
              Simpan Perubahan
            </button>
          </div>
        </div>
      )}

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full animate-fade-in">
            <h3 className="text-lg font-bold mb-4">Booking Meja</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Pelanggan*</label>
                <input
                  type="text"
                  value={bookingData.customerName}
                  onChange={(e) => setBookingData({...bookingData, customerName: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nama lengkap"
                  maxLength={50}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">No. HP</label>
                  <input
                    type="tel"
                    value={bookingData.phone}
                    onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0812..."
                    maxLength={15}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={bookingData.email}
                    onChange={(e) => setBookingData({...bookingData, email: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="email@contoh.com"
                    maxLength={50}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Waktu Booking*</label>
                <input
                  type="datetime-local"
                  value={bookingData.bookingTime}
                  onChange={(e) => setBookingData({...bookingData, bookingTime: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Jumlah Orang*</label>
                  <input
                    type="number"
                    min="1"
                    value={bookingData.people}
                    onChange={(e) => setBookingData({
                      ...bookingData, 
                      people: Math.max(1, parseInt(e.target.value) || 1)
                    })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Meja</label>
                  <input
                    type="text"
                    value={tables.find(t => t.id === bookingData.tableId)?.number || ''}
                    className="w-full px-3 py-2 border rounded-lg bg-gray-100 focus:ring-2 focus:ring-blue-500"
                    readOnly
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Catatan</label>
                <textarea
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Permintaan khusus..."
                  maxLength={200}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setShowBookingForm(false);
                  setError(null);
                }}
                className="px-3 py-1.5 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmBooking}
                disabled={!bookingData.customerName.trim() || !bookingData.bookingTime}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  bookingData.customerName.trim() && bookingData.bookingTime
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-300 text-white cursor-not-allowed'
                }`}
              >
                Konfirmasi Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tables List */}
      {isLoading ? (
        <div className="text-center py-8">
          <FiRotateCcw className="animate-spin mx-auto text-2xl text-blue-500" />
          <p className="mt-2">Memuat data meja...</p>
        </div>
      ) : filteredTables.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredTables.map(table => (
            <div
              key={table.id}
              onClick={() => handleTableClick(table)}
              className={`border rounded-lg p-4 transition-all ${
                table.status === 'available' && isSelectMode
                  ? 'cursor-pointer hover:shadow-md hover:border-blue-300'
                  : ''
              } ${
                table.id === selectedTable?.id ? 'ring-2 ring-blue-500' : ''
              } ${
                table.status === 'occupied' ? 'bg-red-50' : 
                table.status === 'booked' ? 'bg-yellow-50' : 'bg-white'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">Meja {table.number}</h3>
                  <p className="text-sm text-gray-600">{table.capacity} Orang</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(table.status)}`}>
                  {getStatusText(table.status)}
                </span>
              </div>
              
              {table.status === 'booked' && table.bookingInfo && (
                <div className="mt-3 space-y-1 text-sm">
                  <div className="flex items-center text-gray-700">
                    <FiUser className="mr-2 flex-shrink-0" />
                    <span className="truncate">{table.bookingInfo.customerName}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <FiClock className="mr-2 flex-shrink-0" />
                    <span>{formatBookingTime(table.bookingInfo.bookingTime)}</span>
                  </div>
                  {table.bookingInfo.phone && (
                    <div className="flex items-center text-gray-700">
                      <FiPhone className="mr-2 flex-shrink-0" />
                      <span className="truncate">{table.bookingInfo.phone}</span>
                    </div>
                  )}
                </div>
              )}

              {table.status === 'occupied' && (
                <div className="mt-3 text-sm">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      loadActiveBill(table.id);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Lihat Transaksi Aktif
                  </button>
                </div>
              )}

              {!isSelectMode && (
                <div className="flex justify-end gap-2 mt-3">
                  {table.status === 'available' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setBookingData({
                          ...bookingData,
                          tableId: table.id,
                          people: table.capacity
                        });
                        setShowBookingForm(true);
                      }}
                      className="p-1.5 text-yellow-600 hover:bg-yellow-100 rounded-full transition-colors"
                      title="Booking meja"
                      aria-label="Booking meja"
                    >
                      <FiCalendar size={18} />
                    </button>
                  )}
                  
                  {table.status === 'booked' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Batalkan booking untuk meja ${table.number}?`)) {
                          cancelBooking(table.id);
                        }
                      }}
                      className="p-1.5 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                      title="Batalkan booking"
                      aria-label="Batalkan booking"
                    >
                      <FiX size={18} />
                    </button>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingTable(table);
                    }}
                    className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                    title="Edit meja"
                    aria-label="Edit meja"
                  >
                    <FiEdit2 size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Hapus meja ${table.number}?`)) {
                        deleteTable(table.id);
                      }
                    }}
                    className="p-1.5 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                    title="Hapus meja"
                    aria-label="Hapus meja"
                    disabled={table.status === 'occupied'}
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <FiCoffee className="mx-auto text-3xl mb-2" />
          <p>Tidak ada meja yang ditemukan</p>
          {!isSelectMode && (
            <button
              onClick={() => setIsAdding(true)}
              className="mt-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors"
            >
              Tambah Meja Baru
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TableManagement;