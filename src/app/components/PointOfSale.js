'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { 
  FiShoppingCart, FiGrid, FiX, FiPlus, FiMinus,
  FiBookOpen, FiUser, FiClock, FiCalendar,
  FiDollarSign, FiCreditCard, FiPrinter, FiCoffee,
  FiSearch, FiArrowLeft, FiArrowRight, FiAlertCircle, FiSave, FiEdit
} from 'react-icons/fi'
import { useProducts } from '../context/ProductContext'
import { useTables } from '../context/TableContext'
import { format, parseISO, isBefore } from 'date-fns'
import PaymentSection from './PaymentSection'
import { toast } from 'react-toastify'

const PointOfSale = () => {
  // Context hooks with safe defaults
  const { 
    products = [], 
    isLoaded = false, 
    categories: productCategories = [] 
  } = useProducts()
  
  const {
    tables = [],
    selectedTable,
    setSelectedTable,
    activeBills = [],
    addActiveBill,
    removeActiveBill,
    updateTableStatus
  } = useTables()
  
  // State management
  const [cart, setCart] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [showTableSelection, setShowTableSelection] = useState(false)
  const [showActiveBills, setShowActiveBills] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [customerName, setCustomerName] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [error, setError] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isUpdatingBill, setIsUpdatingBill] = useState(false)
  
  // Generate stable categories list
  const displayCategories = useMemo(() => {
    const baseCategories = ['Semua']
    
    // Use categories from context if available
    if (Array.isArray(productCategories) && productCategories.length > 0) {
      return [...baseCategories, ...productCategories]
    }
    
    // Fallback: extract from products
    const categoriesFromProducts = [
      ...new Set(
        products
          .map(product => product?.category)
          .filter(Boolean)
      )
    ]
    
    return [...baseCategories, ...categoriesFromProducts]
  }, [products, productCategories])
  
  // Memoized filtered products
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return []
    
    return products.filter(product => {
      if (!product) return false
      
      const searchLower = searchQuery.toLowerCase()
      const nameMatch = String(product.name || '').toLowerCase().includes(searchLower)
      const categoryMatch = String(product.category || '').toLowerCase().includes(searchLower)
      
      const matchesSearch = nameMatch || categoryMatch
      const matchesCategory = selectedCategory === 'Semua' || product.category === selectedCategory
      
      return matchesSearch && matchesCategory
    })
  }, [products, searchQuery, selectedCategory])
  
  // Pagination
  const paginatedProducts = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    return filteredProducts.slice(indexOfFirstItem, indexOfLastItem)
  }, [filteredProducts, currentPage, itemsPerPage])
  
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  
  // Cart operations with stock validation
  const addToCart = (product) => {
    if (!selectedTable) {
      setError('Silakan pilih meja terlebih dahulu')
      return
    }
    const existingItem = cart.find(item => item.id === product.id)
    const availableStock = product.stock || 0
    if (existingItem) {
      if (existingItem.quantity >= availableStock) {
        setError(`Stok ${product.name} tidak mencukupi!`)
        return
      }
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ))
    } else {
      if (availableStock < 1) {
        setError(`Stok ${product.name} habis!`)
        return
      }
      setCart([...cart, { ...product, quantity: 1 }])
    }
    setError(null)
  }
  
  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id))
  }
  
  const updateQuantity = (id, quantity) => {
    if (quantity < 1) {
      removeFromCart(id)
      return
    }
    
    const product = products.find(p => p.id === id)
    const availableStock = product?.stock || 0
    
    if (quantity > availableStock) {
      setError(`Stok tidak mencukupi! Maksimal ${availableStock}`)
      return
    }
    
    setCart(cart.map(item => 
      item.id === id ? { ...item, quantity } : item
    ))
    setError(null)
  }
  
  // Calculate totals
  const calculateSubtotal = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const calculateTax = () => calculateSubtotal() * 0.1
  const calculateTotal = () => calculateSubtotal() + calculateTax()
  
  // Reset transaction
  const resetTransaction = () => {
    setCart([])
    setCustomerName('')
    setPaymentMethod('cash')
    setIsUpdatingBill(false)
    setError(null)
  }
  
  // Table selection with booking validation
  const handleTableSelect = (table) => {
    if (!table) {
      setError('Meja tidak valid')
      return
    }
    
    // Check if table has active bill
    const activeBill = activeBills.find(bill => bill.table?.id === table.id)
    
    if (table.status === 'booked') {
      const now = new Date()
      const bookingTime = parseISO(table.bookingInfo?.bookingTime)
      
      if (isBefore(now, bookingTime)) {
        setError(
          `Meja ini sudah dipesan untuk ${table.bookingInfo?.customerName} pada ${format(bookingTime, 'dd/MM/yyyy HH:mm')}`
        )
        return
      }
    }
    
    setSelectedTable(table)
    setShowTableSelection(false)
    
    // If table has active bill, load it into cart
    if (activeBill) {
      setCart(activeBill.items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        notes: item.notes || ''
      })))
      setCustomerName(activeBill.customerName || '')
      setIsUpdatingBill(true)
    } else {
      updateTableStatus(table.id, 'occupied')
    }
    
    setError(null)
  }
  
  // Update active bill - FUNGSI BARU UNTUK UPDATE BILL
  const updateActiveBill = async (billData) => {
    try {
      console.log("Updating active bill:", billData);
      
      if (!billData || !billData.id) {
        throw new Error("Data bill tidak valid untuk update");
      }
      
      // Find the bill index in activeBills
      const billIndex = activeBills.findIndex(bill => bill.id === billData.id);
      
      if (billIndex === -1) {
        throw new Error("Bill tidak ditemukan dalam daftar bill aktif");
      }
      
      // Update the bill in the array
      const updatedBills = [...activeBills];
      updatedBills[billIndex] = billData;
      
      // Update localStorage
      localStorage.setItem('activeBills', JSON.stringify(updatedBills));
      
      console.log("Bill updated successfully");
      return true;
    } catch (err) {
      console.error("Update active bill error:", err);
      throw err;
    }
  }
  
  // Bill management - PERBAIKAN UTAMA DI SINI
  const openBill = async () => {
    try {
      console.log("Opening bill for table:", selectedTable);
      console.log("Cart items:", cart);
      console.log("Is updating bill:", isUpdatingBill);
      
      if (!selectedTable) {
        setError('Meja belum dipilih')
        return
      }
      
      if (cart.length === 0) {
        setError('Tidak ada item di keranjang')
        return
      }
      
      // Format data bill sesuai dengan yang diharapkan oleh TableContext
      const billData = {
        table: { 
          id: selectedTable.id,
          number: selectedTable.number,
          capacity: selectedTable.capacity 
        },
        // Pastikan items selalu berupa array yang valid
        items: cart.map(item => ({
          id: item.id || Date.now().toString(),
          name: item.name || 'Produk tanpa nama',
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          notes: item.notes || '',
          subtotal: (Number(item.price) || 0) * (Number(item.quantity) || 1)
        })),
        staff: {
          id: 'current-user', // Sesuaikan dengan data user yang sedang login
          name: 'Staff' // Sesuaikan dengan nama user yang sedang login
        },
        customerName: customerName || `Pelanggan Meja ${selectedTable.number}`,
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        total: calculateTotal(),
        createdAt: new Date().toISOString(),
        status: 'hold'
      }
      
      console.log('Sending bill data:', billData);
      
      // Check if we're updating an existing bill or creating a new one
      if (isUpdatingBill) {
        const activeBill = activeBills.find(bill => bill.table?.id === selectedTable.id)
        if (activeBill) {
          console.log("Updating existing bill:", activeBill);
          
          // Update existing bill - PERBAIKAN DI SINI
          const updatedBill = {
            ...activeBill,
            ...billData,
            // Preserve the original bill ID and creation time
            id: activeBill.id,
            createdAt: activeBill.createdAt,
            // Update the last modified time
            updatedAt: new Date().toISOString()
          }
          
          console.log("Updated bill data:", updatedBill);
          
          // Use our custom updateActiveBill function
          const result = await updateActiveBill(updatedBill);
          
          if (result) {
            toast.success(`Bill meja ${selectedTable.number} berhasil diperbarui`);
            resetTransaction();
            return result;
          } else {
            setError('Gagal memperbarui bill');
            return null;
          }
        }
      }
      
      // Create new bill
      console.log("Creating new bill");
      const result = await addActiveBill(billData);
      
      console.log("Open bill result:", result);
      
      // Jika berhasil, tampilkan pesan sukses dan reset transaksi
      if (result) {
        toast.success(`Bill meja ${selectedTable.number} berhasil dihold`);
        resetTransaction();
        return result;
      } else {
        // Jika addActiveBill mengembalikan false (misalnya karena items kosong)
        setError('Gagal menyimpan bill');
        return null;
      }
    } catch (err) {
      console.error('Open Bill Error:', err);
      setError(err.message || 'Gagal membuka bill');
      toast.error(err.message || 'Gagal membuka bill');
      return null;
    }
  }
  
  // Process payment
  const processPayment = async (paymentData) => {
    setIsProcessing(true)
    setError(null)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update table status
      updateTableStatus(selectedTable.id, 'available')
      removeActiveBill(selectedTable.id)
      
      return { success: true }
    } catch (err) {
      setError('Gagal memproses pembayaran: ' + err.message)
      return { success: false }
    } finally {
      setIsProcessing(false)
    }
  }
  
  // Check if current table has active bill
  const isHoldingBill = selectedTable && 
    activeBills.some(bill => bill.table?.id === selectedTable.id)
  
  // Handle customer modal
  const handleSaveCustomer = () => {
    setShowCustomerModal(false)
    // You might want to save this to the active bill if there is one
  }
  
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
      {/* Error Display */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-700 p-3 rounded-lg shadow-lg z-50 flex items-center max-w-md">
          <FiAlertCircle className="mr-2 flex-shrink-0" />
          <span>{error}</span>
          <button 
            onClick={() => setError(null)} 
            className="ml-4 text-red-500 hover:text-red-700"
          >
            <FiX />
          </button>
        </div>
      )}
      
      {/* Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold">Informasi Pelanggan</h3>
              <button 
                onClick={() => setShowCustomerModal(false)} 
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Nama Pelanggan</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan nama pelanggan"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCustomerModal(false)}
                  className="flex-1 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveCustomer}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Table Selection Modal */}
      {showTableSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold">Pilih Meja</h3>
              <button 
                onClick={() => setShowTableSelection(false)} 
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              {tables.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {tables.map(table => {
                    const activeBill = activeBills.find(bill => bill.table?.id === table.id)
                    return (
                      <div
                        key={table.id}
                        onClick={() => handleTableSelect(table)}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          table.status === 'available' 
                            ? 'hover:shadow-md hover:border-blue-300 bg-white' 
                            : 'bg-gray-50'
                        } ${activeBill ? 'border-yellow-300 bg-yellow-50' : ''}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-lg">Meja {table.number}</h3>
                            <p className="text-sm text-gray-600">{table.capacity} Orang</p>
                            {activeBill && (
                              <p className="text-xs text-yellow-700 mt-1">
                                {activeBill.customerName || 'Pelanggan'}
                              </p>
                            )}
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            activeBill ? 'bg-yellow-100 text-yellow-800' :
                            table.status === 'available' ? 'bg-green-100 text-green-800' :
                            table.status === 'occupied' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {activeBill ? 'Active Bill' : 
                             table.status === 'available' ? 'Tersedia' : 
                             table.status === 'occupied' ? 'Terisi' : 'Dipesan'}
                          </span>
                        </div>
                        {table.status === 'booked' && table.bookingInfo && (
                          <div className="mt-2 text-xs text-gray-500">
                            <p>Dipesan oleh: {table.bookingInfo.customerName}</p>
                            <p>Pada: {format(parseISO(table.bookingInfo.bookingTime), 'dd/MM/yyyy HH:mm')}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FiCoffee className="mx-auto text-3xl mb-2" />
                  <p>Tidak ada meja tersedia</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Active Bills Modal */}
      {showActiveBills && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold">Transaksi Aktif</h3>
              <button 
                onClick={() => setShowActiveBills(false)} 
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              {activeBills.length > 0 ? (
                <div className="space-y-4">
                  {activeBills.map(bill => (
                    <div key={bill.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-lg">Meja {bill.table?.number}</h4>
                          <p className="text-sm text-gray-600">
                            {format(parseISO(bill.createdAt), 'dd/MM/yyyy HH:mm')}
                          </p>
                          {bill.customerName && (
                            <p className="text-sm text-blue-600">{bill.customerName}</p>
                          )}
                        </div>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          Hold
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <h5 className="font-medium mb-2">Items:</h5>
                        <div className="space-y-1">
                          {bill.items?.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.quantity}x {item.name}</span>
                              <span>
                                {new Intl.NumberFormat('id-ID', {
                                  style: 'currency',
                                  currency: 'IDR',
                                  minimumFractionDigits: 0
                                }).format(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="border-t pt-3 flex justify-between items-center">
                        <div>
                          <p className="font-medium">Total: 
                            <span className="text-blue-600 ml-1">
                              {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0
                              }).format(bill.total)}
                            </span>
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedTable(bill.table);
                              setShowActiveBills(false);
                              // Isi cart dengan items dari bill
                              setCart(bill.items.map(item => ({
                                id: item.id,
                                name: item.name,
                                price: item.price,
                                quantity: item.quantity,
                                notes: item.notes || ''
                              })));
                              setCustomerName(bill.customerName || '');
                              setIsUpdatingBill(true);
                            }}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-1"
                          >
                            <FiEdit size={14} /> Update
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Batalkan transaksi untuk meja ${bill.table?.number}?`)) {
                                removeActiveBill(bill.table.id);
                                updateTableStatus(bill.table.id, 'available');
                              }
                            }}
                            className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200"
                          >
                            Batalkan
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FiBookOpen className="mx-auto text-3xl mb-2" />
                  <p>Tidak ada transaksi aktif</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Product Menu (Left Side) - PERBAIKAN RESPONSIVE DI SINI */}
      <div className="lg:col-span-2 bg-white rounded-lg shadow p-4 flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
          <select
            className="w-full md:w-auto px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value)
              setCurrentPage(1)
            }}
          >
            {displayCategories.map((category, index) => (
              <option 
                key={`${category}-${index}`} 
                value={category}
              >
                {category || 'Unknown Category'}
              </option>
            ))}
          </select>
          
          <div className="relative w-full md:w-auto">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari produk..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {paginatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {paginatedProducts.map(product => (
                <div 
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className={`border rounded-lg p-3 hover:shadow-md cursor-pointer flex flex-col items-center transition-all h-full ${
                    product.stock < 1 ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-300'
                  }`}
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full mb-2 flex items-center justify-center flex-shrink-0">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <FiCoffee className="text-gray-500 text-xl sm:text-2xl" />
                    )}
                  </div>
                  <h4 className="font-medium text-center text-sm sm:text-base truncate w-full">{product.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0
                    }).format(product.price)}
                  </p>
                  <p className={`text-xs mt-1 ${
                    product.stock < 1 ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {product.stock < 1 ? 'Stok habis' : `Stok: ${product.stock}`}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-8 text-gray-500">
              <FiSearch className="text-3xl mb-2" />
              <p className="text-center">Tidak ada produk yang ditemukan</p>
              {filteredProducts.length > 0 && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('Semua')
                  }}
                  className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm"
                >
                  Reset Pencarian
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {filteredProducts.length > itemsPerPage && (
          <div className="flex justify-center mt-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border disabled:opacity-50 hover:bg-gray-100"
              >
                <FiArrowLeft />
              </button>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border disabled:opacity-50 hover:bg-gray-100"
              >
                <FiArrowRight />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Payment Area (Right Side) */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-col">
        {!selectedTable ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-500">
            <FiGrid size={48} className="mb-4 text-blue-300" />
            <h3 className="text-lg font-medium mb-2">Pilih Meja Terlebih Dahulu</h3>
            <div className="space-y-2 w-full">
              <button 
                onClick={() => setShowTableSelection(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center w-full justify-center"
              >
                <FiGrid className="mr-2" /> Pilih Meja
              </button>
              <button 
                onClick={() => setShowActiveBills(true)}
                disabled={activeBills.length === 0}
                className={`px-4 py-2 rounded-lg flex items-center w-full justify-center ${
                  activeBills.length > 0
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                <FiBookOpen className="mr-2" /> Transaksi Aktif ({activeBills.length})
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 p-3 bg-blue-50 rounded-lg flex justify-between items-center">
              <div>
                <h3 className="font-medium">Meja {selectedTable.number}</h3>
                <p className="text-sm text-gray-600">{selectedTable.capacity} orang</p>
                {customerName && (
                  <p className="text-sm text-blue-600">{customerName}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowCustomerModal(true)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 flex items-center gap-1"
                >
                  <FiUser size={14} /> {customerName || 'Tambah Nama'}
                </button>
                <button 
                  onClick={() => {
                    if (cart.length > 0 && !confirm('Batalkan transaksi dan ganti meja?')) return
                    resetTransaction()
                    setSelectedTable(null)
                  }}
                  className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                >
                  Ganti Meja
                </button>
              </div>
            </div>
            
            <PaymentSection 
              cart={cart}
              updateQuantity={updateQuantity}
              removeFromCart={removeFromCart}
              selectedTable={selectedTable}
              calculateTotal={calculateTotal}
              resetTransaction={resetTransaction}
              processPayment={processPayment}
              openBill={openBill}
              isHoldingBill={isHoldingBill}
              isUpdatingBill={isUpdatingBill}
              onCancelHoldBill={() => {
                if (confirm('Batalkan transaksi yang dihold?')) {
                  removeActiveBill(selectedTable.id)
                  updateTableStatus(selectedTable.id, 'available')
                  resetTransaction()
                }
              }}
              onNewTransaction={() => {
                if (confirm('Mulai transaksi baru untuk meja ini? Item yang ada di keranjang akan dihapus.')) {
                  resetTransaction()
                  setIsUpdatingBill(false)
                }
              }}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default PointOfSale