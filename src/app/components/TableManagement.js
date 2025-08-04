'use client';
import React, { useState, useEffect } from 'react';
import { 
  FiPlus, FiEdit2, FiTrash2, FiCheck, 
  FiX, FiCoffee, FiArrowLeft, FiSave, FiRotateCcw,
  FiSearch, FiMenu, FiShoppingCart
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TableManagement = ({ onTableSelect, onBack }) => {
  const [tables, setTables] = useState([]);
  const [newTable, setNewTable] = useState({
    number: '',
    capacity: 4,
    status: 'available',
    location: 'indoor'
  });
  const [editingTable, setEditingTable] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTable, setSelectedTable] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check mobile view on mount and resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Load tables on component mount
  useEffect(() => {
    const loadTables = async () => {
      setIsLoading(true);
      try {
        const sampleTables = [
          { id: 1, number: 'A1', capacity: 4, status: 'available', location: 'indoor' },
          { id: 2, number: 'A2', capacity: 6, status: 'occupied', location: 'indoor' },
          { id: 3, number: 'B1', capacity: 2, status: 'reserved', location: 'outdoor' },
          { id: 4, number: 'VIP1', capacity: 8, status: 'available', location: 'vip' },
        ];
        setTables(sampleTables);
        toast.success('Data meja berhasil dimuat');
      } catch (error) {
        toast.error('Gagal memuat data meja');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTables();
  }, []);

  // Toggle action menu for a table
  const toggleActionMenu = (tableId, e) => {
    e.stopPropagation();
    setShowActionMenu(showActionMenu === tableId ? null : tableId);
  };

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showActionMenu) {
        setShowActionMenu(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showActionMenu]);

  // Add new table
  const handleAddTable = () => {
    if (!newTable.number.trim()) {
      toast.error('Nomor meja tidak boleh kosong');
      return;
    }

    if (tables.some(table => table.number === newTable.number)) {
      toast.error('Nomor meja sudah ada');
      return;
    }

    const table = {
      id: Date.now(),
      ...newTable
    };
    
    setTables([...tables, table]);
    setNewTable({
      number: '',
      capacity: 4,
      status: 'available',
      location: 'indoor'
    });
    setIsAdding(false);
    toast.success('Meja berhasil ditambahkan');
  };

  // Start editing a table
  const startEditing = (table) => {
    setEditingTable({...table});
    setIsAdding(false);
    setShowActionMenu(null);
  };

  // Update existing table
  const handleUpdateTable = () => {
    if (!editingTable.number.trim()) {
      toast.error('Nomor meja tidak boleh kosong');
      return;
    }

    const isDuplicate = tables.some(table => 
      table.number === editingTable.number && table.id !== editingTable.id
    );
    
    if (isDuplicate) {
      toast.error('Nomor meja sudah ada');
      return;
    }

    setTables(tables.map(table => 
      table.id === editingTable.id ? editingTable : table
    ));
    setEditingTable(null);
    toast.success('Meja berhasil diperbarui');
  };

  // Delete table with enhanced confirmation
  const handleDeleteTable = (id) => {
    const tableToDelete = tables.find(table => table.id === id);
    
    if (!tableToDelete) return;

    const confirmationMessage = tableToDelete.status === 'occupied' || tableToDelete.status === 'reserved'
      ? `Meja ${tableToDelete.number} sedang digunakan/dipesan. Yakin ingin menghapus?`
      : 'Apakah Anda yakin ingin menghapus meja ini?';

    if (window.confirm(confirmationMessage)) {
      setTables(tables.filter(table => table.id !== id));
      if (editingTable && editingTable.id === id) {
        setEditingTable(null);
      }
      setShowActionMenu(null);
      toast.success(`Meja ${tableToDelete.number} berhasil dihapus`);
    }
  };

  // Reset form
  const resetForm = () => {
    setNewTable({
      number: '',
      capacity: 4,
      status: 'available',
      location: 'indoor'
    });
    setIsAdding(false);
  };

  // Status and location styling
  const getStatusColor = (status) => {
    switch(status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'reserved': return 'bg-yellow-100 text-yellow-800';
      case 'cleaning': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLocationColor = (location) => {
    switch(location) {
      case 'indoor': return 'bg-indigo-100 text-indigo-800';
      case 'outdoor': return 'bg-teal-100 text-teal-800';
      case 'vip': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter tables based on status and search term
  const filteredTables = tables.filter(table => {
    const matchesFilter = filter === 'all' || table.status === filter;
    const matchesSearch = table.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         table.capacity.toString().includes(searchTerm) ||
                         table.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-4 md:p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-6 gap-4">
        <div className="flex items-center">
          {/* <button
            onClick={onBack}
            className="mr-4 text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            <FiArrowLeft size={20} className="mr-1" />
            <span className="hidden sm:inline">Kembali</span>
          </button> */}
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Manajemen Meja</h1>
        </div>
        
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari meja..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div className="flex gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
            >
              <option value="all">Semua</option>
              <option value="available">Tersedia</option>
              <option value="occupied">Terisi</option>
              <option value="reserved">Dipesan</option>
              <option value="cleaning">Pembersihan</option>
            </select>
            
            <button
              onClick={() => {
                setIsAdding(true);
                setEditingTable(null);
                setShowActionMenu(null);
              }}
              className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center"
            >
              <FiPlus className="mr-1 md:mr-2" />
              <span className="hidden sm:inline">Tambah Meja</span>
              <span className="sm:hidden">Tambah</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {/* Add Table Form */}
      {!isLoading && isAdding && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Tambah Meja Baru</h2>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700 flex items-center"
            >
              <FiRotateCcw className="mr-1" /> Reset
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Meja*</label>
              <input
                type="text"
                value={newTable.number}
                onChange={(e) => setNewTable({...newTable, number: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="A1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kapasitas*</label>
              <select
                value={newTable.capacity}
                onChange={(e) => setNewTable({...newTable, capacity: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {[2, 4, 6, 8, 10].map(num => (
                  <option key={num} value={num}>{num} Orang</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status*</label>
              <select
                value={newTable.status}
                onChange={(e) => setNewTable({...newTable, status: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="available">Tersedia</option>
                <option value="occupied">Terisi</option>
                <option value="reserved">Dipesan</option>
                <option value="cleaning">Pembersihan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi*</label>
              <select
                value={newTable.location}
                onChange={(e) => setNewTable({...newTable, location: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
                <option value="vip">VIP</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-4 space-x-2">
            <button
              onClick={() => setIsAdding(false)}
              className="px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <FiX className="mr-1 md:mr-2" /> Batal
            </button>
            <button
              onClick={handleAddTable}
              className="px-3 py-2 md:px-4 md:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
            >
              <FiSave className="mr-1 md:mr-2" /> Simpan
            </button>
          </div>
        </div>
      )}

      {/* Edit Table Form */}
      {!isLoading && editingTable && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Edit Meja {editingTable.number}</h2>
            <button
              onClick={() => setEditingTable(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Meja*</label>
              <input
                type="text"
                value={editingTable.number}
                onChange={(e) => setEditingTable({...editingTable, number: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kapasitas*</label>
              <select
                value={editingTable.capacity}
                onChange={(e) => setEditingTable({...editingTable, capacity: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {[2, 4, 6, 8, 10].map(num => (
                  <option key={num} value={num}>{num} Orang</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status*</label>
              <select
                value={editingTable.status}
                onChange={(e) => setEditingTable({...editingTable, status: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="available">Tersedia</option>
                <option value="occupied">Terisi</option>
                <option value="reserved">Dipesan</option>
                <option value="cleaning">Pembersihan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi*</label>
              <select
                value={editingTable.location}
                onChange={(e) => setEditingTable({...editingTable, location: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
                <option value="vip">VIP</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-4 space-x-2">
            <button
              onClick={() => setEditingTable(null)}
              className="px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <FiX className="mr-1 md:mr-2" /> Batal
            </button>
            <button
              onClick={handleUpdateTable}
              className="px-3 py-2 md:px-4 md:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
            >
              <FiSave className="mr-1 md:mr-2" /> Simpan
            </button>
          </div>
        </div>
      )}

      {/* Tables List */}
      {!isLoading && !isAdding && !editingTable && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredTables.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 p-3 md:p-4">
              {filteredTables.map(table => (
                <div 
                  key={table.id} 
                  className={`border rounded-lg p-3 md:p-4 hover:shadow-md transition-shadow relative ${
                    table.status !== 'available' ? 'opacity-80' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <FiCoffee className="text-gray-500 mr-2" />
                      <h3 className="font-bold text-base md:text-lg">Meja {table.number}</h3>
                    </div>
                    <button
                      onClick={(e) => toggleActionMenu(table.id, e)}
                      className="text-gray-500 hover:text-gray-700 p-1"
                      title="Aksi"
                    >
                      <FiMenu />
                    </button>
                    
                    {/* Action Menu Popup */}
                    {showActionMenu === table.id && (
                      <div 
                        className={`absolute ${isMobile ? 'bottom-full mb-2' : 'top-10'} right-0 z-10 bg-white shadow-lg rounded-md py-1 w-48 border`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => startEditing(table)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <FiEdit2 className="mr-2" /> Edit Data
                        </button>
                        <button
                          onClick={() => handleDeleteTable(table.id)}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          <FiTrash2 className="mr-2" /> Hapus Data
                        </button>
                        {table.status === 'available' && onTableSelect && (
                          <button
                            onClick={() => {
                              onTableSelect(table);
                              setShowActionMenu(null);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-green-600 hover:bg-gray-100"
                          >
                            <FiShoppingCart className="mr-2" /> Pilih untuk Transaksi
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 mt-2 md:mt-3">
                    <div className="flex items-center">
                      <span className="text-xs md:text-sm text-gray-500">Kapasitas:</span>
                      <span className="ml-2 font-medium text-sm md:text-base">{table.capacity} Orang</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs md:text-sm text-gray-500">Status:</span>
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(table.status)}`}>
                        {table.status === 'available' && 'Tersedia'}
                        {table.status === 'occupied' && 'Terisi'}
                        {table.status === 'reserved' && 'Dipesan'}
                        {table.status === 'cleaning' && 'Pembersihan'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs md:text-sm text-gray-500">Lokasi:</span>
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getLocationColor(table.location)}`}>
                        {table.location === 'indoor' && 'Indoor'}
                        {table.location === 'outdoor' && 'Outdoor'}
                        {table.location === 'vip' && 'VIP'}
                      </span>
                    </div>
                  </div>
                  {table.status !== 'available' && onTableSelect && (
                    <div className="mt-2 md:mt-3 text-xs md:text-sm text-red-500">
                      Meja tidak tersedia untuk dipilih
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              {searchTerm ? 'Tidak ada meja yang cocok dengan pencarian' : 'Tidak ada meja yang ditemukan'}
              <button
                onClick={() => setIsAdding(true)}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center mx-auto"
              >
                <FiPlus className="mr-2" /> Tambah Meja Baru
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TableManagement;