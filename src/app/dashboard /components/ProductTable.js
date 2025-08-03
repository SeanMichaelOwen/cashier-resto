import React, { useState } from 'react';
import { FiPlus, FiPackage, FiEdit2, FiTrash2, FiUpload, FiDownload, FiSearch, FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { formatRupiah } from '@/utils/formatCurrency';
import * as XLSX from 'xlsx';

const ProductTable = ({ products, setProducts }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showStockOpnameModal, setShowStockOpnameModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: '',
    stock: ''
  });
  const [stockAdjustments, setStockAdjustments] = useState({});
  const [file, setFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [errors, setErrors] = useState({});
  
  // Filter produk berdasarkan pencarian
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Validasi form produk
  const validateProduct = (product) => {
    const newErrors = {};
    if (!product.name.trim()) newErrors.name = 'Nama produk harus diisi';
    if (!product.category.trim()) newErrors.category = 'Kategori harus diisi';
    if (!product.price || product.price <= 0) newErrors.price = 'Harga harus lebih dari 0';
    if (!product.stock || product.stock < 0) newErrors.stock = 'Stok tidak boleh negatif';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleAddProduct = () => {
    if (!validateProduct(newProduct)) return;
    
    const product = {
      id: Date.now(),
      name: newProduct.name,
      category: newProduct.category,
      price: parseInt(newProduct.price),
      stock: parseInt(newProduct.stock)
    };
    
    setProducts([...products, product]);
    setShowAddModal(false);
    setNewProduct({ name: '', category: '', price: '', stock: '' });
    setErrors({});
  };
  
  const handleEditProduct = () => {
    if (!validateProduct(editProduct)) return;
    
    setProducts(products.map(p => 
      p.id === editProduct.id ? editProduct : p
    ));
    setEditProduct(null);
    setErrors({});
  };
  
  const handleDeleteProduct = () => {
    if (showDeleteConfirm) {
      setProducts(products.filter(p => p.id !== showDeleteConfirm));
      setShowDeleteConfirm(null);
    }
  };
  
  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        const importedProducts = jsonData.map(item => ({
          id: Date.now() + Math.floor(Math.random() * 1000),
          name: item.Nama || item.name || '',
          category: item.Kategori || item.category || '',
          price: parseInt(item.Harga || item.price || 0),
          stock: parseInt(item.Stok || item.stock || 0)
        }));
        
        setProducts([...products, ...importedProducts]);
        setShowImportModal(false);
        setFile(null);
      } catch (error) {
        console.error('Error importing Excel file:', error);
        alert('Format file tidak valid. Pastikan file Excel memiliki format yang benar.');
      }
    };
    
    reader.readAsArrayBuffer(file);
  };
  
  const handleStockAdjustment = (id, adjustment) => {
    setStockAdjustments({
      ...stockAdjustments,
      [id]: adjustment
    });
  };
  
  const applyStockOpname = () => {
    const updatedProducts = products.map(p => {
      const adjustment = stockAdjustments[p.id] || 0;
      return {
        ...p,
        stock: Math.max(0, p.stock + adjustment)
      };
    });
    
    setProducts(updatedProducts);
    setStockAdjustments({});
    setShowStockOpnameModal(false);
  };
  
  const exportToExcel = () => {
    const data = products.map(p => ({
      'Nama Produk': p.name,
      'Kategori': p.category,
      'Harga': p.price,
      'Stok': p.stock
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Produk');
    XLSX.writeFile(workbook, 'daftar_produk.xlsx');
  };
  
  // Modal Component dengan ukuran yang dapat disesuaikan
  const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;
    
    // Tentukan width berdasarkan size
    const sizeClasses = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      '3xl': 'max-w-3xl',
      '4xl': 'max-w-4xl',
      '5xl': 'max-w-5xl',
      '6xl': 'max-w-6xl',
      full: 'max-w-full'
    };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size]} transform transition-all duration-300 scale-95 animate-scaleIn`}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    );
  };
  
  // Confirmation Dialog Component
  const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-95 animate-scaleIn">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <FiAlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            </div>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Produk</h2>
          <p className="text-gray-600">Kelola produk, stok, dan kategori</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari produk..."
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <button 
            onClick={() => setShowStockOpnameModal(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg flex items-center transition-colors"
          >
            <FiPackage className="mr-2" />
            Stock Opname
          </button>
          
          <button 
            onClick={() => setShowImportModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center transition-colors"
          >
            <FiUpload className="mr-2" />
            Import
          </button>
          
          <button 
            onClick={exportToExcel}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg flex items-center transition-colors"
          >
            <FiDownload className="mr-2" />
            Export
          </button>
          
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg flex items-center transition-colors"
          >
            <FiPlus className="mr-2" />
            Tambah
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center">
                      <div className="bg-indigo-100 rounded-xl w-12 h-12 mr-4 flex items-center justify-center">
                        <FiPackage className="text-indigo-600" />
                      </div>
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {product.category}
                    </span>
                  </td>
                  <td className="p-4 font-medium">{formatRupiah(product.price)}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.stock > 10 
                        ? 'bg-green-100 text-green-800' 
                        : product.stock > 0 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {product.stock} pcs
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setEditProduct(product)}
                        className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50 transition-colors"
                        title="Edit"
                      >
                        <FiEdit2 />
                      </button>
                      <button 
                        onClick={() => setShowDeleteConfirm(product.id)}
                        className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors"
                        title="Hapus"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">
                  Tidak ada produk yang ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Add Product Modal */}
      <Modal 
        isOpen={showAddModal} 
        onClose={() => {
          setShowAddModal(false);
          setNewProduct({ name: '', category: '', price: '', stock: '' });
          setErrors({});
        }}
        title="Tambah Produk Baru"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
            <input
              type="text"
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Masukkan nama produk"
              value={newProduct.name}
              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <input
              type="text"
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Masukkan kategori"
              value={newProduct.category}
              onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
            />
            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Harga</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
              <input
                type="number"
                className={`w-full pl-8 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
              />
            </div>
            {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
            <input
              type="number"
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.stock ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
              value={newProduct.stock}
              onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
            />
            {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock}</p>}
          </div>
          
          <button
            onClick={handleAddProduct}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            <FiPlus className="mr-2" />
            Tambah Produk
          </button>
        </div>
      </Modal>
      
      {/* Edit Product Modal */}
      <Modal 
        isOpen={!!editProduct} 
        onClose={() => {
          setEditProduct(null);
          setErrors({});
        }}
        title="Edit Produk"
      >
        {editProduct && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
              <input
                type="text"
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                value={editProduct.name}
                onChange={(e) => setEditProduct({...editProduct, name: e.target.value})}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <input
                type="text"
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
                value={editProduct.category}
                onChange={(e) => setEditProduct({...editProduct, category: e.target.value})}
              />
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Harga</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
                <input
                  type="number"
                  className={`w-full pl-8 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={editProduct.price}
                  onChange={(e) => setEditProduct({...editProduct, price: parseInt(e.target.value)})}
                />
              </div>
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
              <input
                type="number"
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.stock ? 'border-red-500' : 'border-gray-300'
                }`}
                value={editProduct.stock}
                onChange={(e) => setEditProduct({...editProduct, stock: parseInt(e.target.value)})}
              />
              {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock}</p>}
            </div>
            
            <button
              onClick={handleEditProduct}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <FiCheck className="mr-2" />
              Simpan Perubahan
            </button>
          </div>
        )}
      </Modal>
      
      {/* Import Excel Modal */}
      <Modal 
        isOpen={showImportModal} 
        onClose={() => setShowImportModal(false)}
        title="Import Produk dari Excel"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File Excel</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                    <span>Upload file</span>
                    <input 
                      type="file" 
                      accept=".xlsx, .xls" 
                      onChange={handleImportExcel}
                      className="sr-only" 
                    />
                  </label>
                  <p className="pl-1">atau drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">XLS, XLSX hingga 10MB</p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Format file harus mengandung kolom:</h4>
            <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
              <li>Nama (nama produk)</li>
              <li>Kategori</li>
              <li>Harga</li>
              <li>Stok</li>
            </ul>
          </div>
          
          <div className="text-sm text-gray-500">
            <p>Produk yang sudah ada akan ditambahkan ke daftar produk yang ada.</p>
          </div>
        </div>
      </Modal>
      
      {/* Stock Opname Modal dengan ukuran yang lebih besar */}
      <Modal 
        isOpen={showStockOpnameModal} 
        onClose={() => {
          setShowStockOpnameModal(false);
          setStockAdjustments({});
        }}
        title="Stock Opname"
        size="3xl" // Perbesar ukuran modal
      >
        <div className="max-h-[70vh] overflow-y-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Stok Saat Ini</th>
                <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Penyesuaian</th>
                <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Stok Baru</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map(product => {
                const adjustment = stockAdjustments[product.id] || 0;
                const newStock = product.stock + adjustment;
                
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="p-3 font-medium">{product.name}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.stock > 10 
                          ? 'bg-green-100 text-green-800' 
                          : product.stock > 0 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock} pcs
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center">
                        <button 
                          onClick={() => handleStockAdjustment(product.id, (adjustment || 0) - 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          className="w-20 mx-2 p-2 border rounded-lg text-center"
                          value={adjustment}
                          onChange={(e) => handleStockAdjustment(
                            product.id, 
                            parseInt(e.target.value) || 0
                          )}
                        />
                        <button 
                          onClick={() => handleStockAdjustment(product.id, (adjustment || 0) + 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        newStock > 10 
                          ? 'bg-green-100 text-green-800' 
                          : newStock > 0 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {newStock} pcs
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            <p>Total produk: {products.length} | Total penyesuaian: {Object.keys(stockAdjustments).length}</p>
          </div>
          <button
            onClick={applyStockOpname}
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            <FiCheck className="mr-2" />
            Simpan Penyesuaian Stok
          </button>
        </div>
      </Modal>
      
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={handleDeleteProduct}
        title="Hapus Produk"
        message="Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  );
};

export default ProductTable;