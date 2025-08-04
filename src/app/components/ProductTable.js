'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  FiPlus, FiPackage, FiEdit2, FiTrash2, FiUpload, FiDownload, 
  FiSearch, FiX, FiCheck, FiAlertCircle, FiBarChart2, FiImage,
  FiClipboard, FiList, FiCheckCircle, FiRotateCcw, FiSave, FiPrinter,
  FiArrowUp, FiArrowDown, FiDollarSign, FiTrendingUp, FiTrendingDown,
  FiPieChart
} from 'react-icons/fi';
import { formatRupiah } from '@/utils/formatCurrency';
import * as XLSX from 'xlsx';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useProducts } from '../context/ProductContext';
import Image from 'next/image';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const ProductTable = () => {
  const { products, addProduct, updateProduct, deleteProduct, addStockHistory } = useProducts();
  
  // State management
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '', category: '', price: '', stock: '', image: null
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [errors, setErrors] = useState({});
  const [categoryData, setCategoryData] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [activeTab, setActiveTab] = useState('products');
  
  // Stock Opname specific state
  const [stockOpnameData, setStockOpnameData] = useState([]);
  const [isStockOpnameMode, setIsStockOpnameMode] = useState(false);
  const [stockOpnameDate, setStockOpnameDate] = useState(new Date().toISOString().split('T')[0]);
  const [showStockOpnameSummary, setShowStockOpnameSummary] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  
  const [stockOpnameSummary, setStockOpnameSummary] = useState({
    totalItems: 0,
    matched: 0,
    discrepancies: 0,
    positiveDiff: 0,
    negativeDiff: 0,
    totalPositiveDiff: 0,
    totalNegativeDiff: 0,
    totalPositiveValue: 0,
    totalNegativeValue: 0,
    highestDiscrepancy: { name: '', difference: 0, value: 0 },
    mostDiscrepantCategory: { category: '', count: 0 }
  });
  const [discrepancyChartData, setDiscrepancyChartData] = useState([]);
  const [categoryDiscrepancyData, setCategoryDiscrepancyData] = useState([]);
  const [valueImpactChartData, setValueImpactChartData] = useState([]);
  
  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    return products.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);
  
  // Initialize data
  useEffect(() => {
    const categories = {};
    products.forEach(product => {
      categories[product.category] = (categories[product.category] || 0) + 1;
    });
    
    setCategoryData(Object.keys(categories).map(category => ({
      name: category,
      value: categories[category]
    }))); 
    
    setStockData(products.map(product => ({
      name: product.name,
      stok: product.stock,
      price: product.price
    })));
    
    // Initialize stock opname data with product data
    setStockOpnameData(products.map(product => ({
      id: product.id,
      name: product.name,
      category: product.category,
      currentStock: product.stock,
      actualStock: product.stock,
      difference: 0,
      notes: '',
      image: product.image,
      price: product.price,
      valueDifference: 0,
      lastOpnameDate: product.lastOpnameDate || null,
      lastOpnameDifference: product.lastOpnameDifference || 0
    })));
  }, [products]);
  
  // Update stock opname summary when data changes
  useEffect(() => {
    if (activeTab === 'stockOpname') {
      const positiveItems = stockOpnameData.filter(item => item.difference > 0);
      const negativeItems = stockOpnameData.filter(item => item.difference < 0);
      const matchedItems = stockOpnameData.filter(item => item.difference === 0);
      
      // Find highest discrepancy
      const highestDiscrepancy = stockOpnameData.reduce((max, item) => {
        const absDiff = Math.abs(item.difference);
        return absDiff > Math.abs(max.difference) ? 
          { name: item.name, difference: item.difference, value: item.valueDifference } : max;
      }, { name: '', difference: 0, value: 0 });
      
      // Find most discrepant category
      const categoryDiscrepancies = {};
      stockOpnameData.forEach(item => {
        if (item.difference !== 0) {
          categoryDiscrepancies[item.category] = (categoryDiscrepancies[item.category] || 0) + 1;
        }
      });
      
      const mostDiscrepantCategory = Object.entries(categoryDiscrepancies).reduce((max, [category, count]) => 
        count > max.count ? { category, count } : max, 
        { category: '', count: 0 }
      );
      
      const summary = {
        totalItems: stockOpnameData.length,
        matched: matchedItems.length,
        discrepancies: stockOpnameData.length - matchedItems.length,
        positiveDiff: positiveItems.length,
        negativeDiff: negativeItems.length,
        totalPositiveDiff: positiveItems.reduce((sum, item) => sum + item.difference, 0),
        totalNegativeDiff: negativeItems.reduce((sum, item) => sum + item.difference, 0),
        totalPositiveValue: positiveItems.reduce((sum, item) => sum + (item.difference * item.price), 0),
        totalNegativeValue: negativeItems.reduce((sum, item) => sum + (item.difference * item.price), 0),
        highestDiscrepancy,
        mostDiscrepantCategory
      };
      setStockOpnameSummary(summary);
      
      // Prepare chart data for discrepancies
      const topDiscrepancies = [...stockOpnameData]
        .filter(item => item.difference !== 0)
        .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference))
        .slice(0, 5)
        .map(item => ({
          name: item.name,
          difference: item.difference,
          value: Math.abs(item.valueDifference),
          category: item.category
        }));
      setDiscrepancyChartData(topDiscrepancies);
      
      // Prepare category discrepancy data
      const categoryData = Object.entries(categoryDiscrepancies).map(([category, count]) => ({
        name: category,
        value: count,
        items: stockOpnameData.filter(item => item.category === category && item.difference !== 0)
                            .map(item => item.name)
      }));
      setCategoryDiscrepancyData(categoryData);
      
      // Prepare value impact data
      const valueImpactData = [
        { name: 'Nilai Positif', value: Math.abs(summary.totalPositiveValue), color: '#10B981' },
        { name: 'Nilai Negatif', value: Math.abs(summary.totalNegativeValue), color: '#EF4444' }
      ];
      setValueImpactChartData(valueImpactData);
    }
  }, [stockOpnameData, activeTab]);
  
  // Stock Opname functions
  const handleStockOpnameChange = (id, value) => {
    setStockOpnameData(stockOpnameData.map(item => {
      if (item.id === id) {
        const actual = parseInt(value) || 0;
        const difference = actual - item.currentStock;
        return {
          ...item,
          actualStock: actual,
          difference,
          valueDifference: difference * item.price
        };
      }
      return item;
    }));
  };
  
  const handleNotesChange = (id, value) => {
    setStockOpnameData(stockOpnameData.map(item => {
      if (item.id === id) {
        return {
          ...item,
          notes: value
        };
      }
      return item;
    }));
  };
  
  // Sorting function
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const sortedStockOpnameData = useMemo(() => {
    let sortableData = [...stockOpnameData];
    if (filter === 'discrepancies') {
      sortableData = sortableData.filter(item => item.difference !== 0);
    } else if (filter === 'matched') {
      sortableData = sortableData.filter(item => item.difference === 0);
    }
    
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [stockOpnameData, sortConfig, filter]);
  
  const startStockOpname = () => {
    setIsStockOpnameMode(true);
    setStockOpnameDate(new Date().toISOString().split('T')[0]);
  };
  
  const cancelStockOpname = () => {
    if (window.confirm('Batalkan stock opname? Semua perubahan yang belum disimpan akan hilang.')) {
      setIsStockOpnameMode(false);
      // Reset to current stock values
      setStockOpnameData(products.map(product => ({
        id: product.id,
        name: product.name,
        category: product.category,
        currentStock: product.stock,
        actualStock: product.stock,
        difference: 0,
        notes: '',
        image: product.image,
        price: product.price,
        valueDifference: 0,
        lastOpnameDate: product.lastOpnameDate || null,
        lastOpnameDifference: product.lastOpnameDifference || 0
      })));
    }
  };
  
  const submitStockOpname = () => {
    setShowStockOpnameSummary(true);
  };
  
  const confirmStockOpname = () => {
    stockOpnameData.forEach(item => {
      if (item.difference !== 0) {
        // Update product stock
        updateProduct(item.id, { 
          stock: item.actualStock,
          lastOpnameDate: stockOpnameDate,
          lastOpnameDifference: item.difference
        });
        
        // Add to stock history
        addStockHistory({
          id: Date.now(),
          productId: item.id,
          productName: item.name,
          oldStock: item.currentStock,
          adjustment: item.difference,
          newStock: item.actualStock,
          date: new Date().toISOString(),
          type: 'stock-opname',
          notes: item.notes,
          valueImpact: item.valueDifference
        });
      }
    });
    
    setShowStockOpnameSummary(false);
    setIsStockOpnameMode(false);
    alert('Stock opname berhasil disimpan!');
  };
  
  const exportStockOpname = () => {
    const data = stockOpnameData.map(item => ({
      'Nama Produk': item.name,
      'Kategori': item.category,
      'Stok Sistem': item.currentStock,
      'Stok Fisik': item.actualStock,
      'Selisih (Qty)': item.difference,
      'Harga Satuan': formatRupiah(item.price),
      'Nilai Selisih': formatRupiah(item.valueDifference),
      'Status': item.difference > 0 ? 'Stok Bertambah' : item.difference < 0 ? 'Stok Berkurang' : 'Cocok',
      'Catatan': item.notes,
      'Terakhir Opname': item.lastOpnameDate || 'Belum pernah',
      'Selisih Terakhir': item.lastOpnameDifference || 0
    }));
    
    // Add summary sheet
    const summaryData = [
      ['Laporan Stock Opname', '', '', '', '', '', '', ''],
      ['Tanggal', stockOpnameDate, '', '', '', '', '', ''],
      ['Total Item', stockOpnameSummary.totalItems, '', '', '', '', '', ''],
      ['Item yang Cocok', stockOpnameSummary.matched, '', '', '', '', '', ''],
      ['Item Perlu Penyesuaian', stockOpnameSummary.discrepancies, '', '', '', '', '', ''],
      ['Item Stok Bertambah', stockOpnameSummary.positiveDiff, '', '', '', '', '', ''],
      ['Item Stok Berkurang', stockOpnameSummary.negativeDiff, '', '', '', '', '', ''],
      ['Total Qty Bertambah', stockOpnameSummary.totalPositiveDiff, '', '', '', '', '', ''],
      ['Total Qty Berkurang', stockOpnameSummary.totalNegativeDiff, '', '', '', '', '', ''],
      ['Total Nilai Bertambah', formatRupiah(stockOpnameSummary.totalPositiveValue), '', '', '', '', '', ''],
      ['Total Nilai Berkurang', formatRupiah(stockOpnameSummary.totalNegativeValue), '', '', '', '', '', ''],
      ['Selisih Nilai Bersih', formatRupiah(stockOpnameSummary.totalPositiveValue + stockOpnameSummary.totalNegativeValue), '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['Produk dengan Selisih Terbesar', stockOpnameSummary.highestDiscrepancy.name, '', '', '', '', '', ''],
      ['Selisih Qty Terbesar', stockOpnameSummary.highestDiscrepancy.difference, '', '', '', '', '', ''],
      ['Nilai Selisih Terbesar', formatRupiah(stockOpnameSummary.highestDiscrepancy.value), '', '', '', '', '', ''],
      ['Kategori dengan Selisih Terbanyak', stockOpnameSummary.mostDiscrepantCategory.category, '', '', '', '', '', ''],
      ['Jumlah Item dengan Selisih', stockOpnameSummary.mostDiscrepantCategory.count, '', '', '', '', '', '']
    ];
    
    // Add chart sheet with data for charts
    const chartData = discrepancyChartData.map(item => ({
      'Produk': item.name,
      'Selisih Qty': item.difference,
      'Nilai Selisih': item.valueDifference,
      'Kategori': item.category
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    const chartSheet = XLSX.utils.json_to_sheet(chartData);
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Detail Stock Opname');
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan');
    XLSX.utils.book_append_sheet(workbook, chartSheet, 'Data Chart');
    
    XLSX.writeFile(workbook, `stock_opname_${stockOpnameDate}.xlsx`);
  };
  
  const printStockOpname = () => {
    const printContent = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="margin-bottom: 5px;">Laporan Stock Opname</h1>
          <p style="margin: 0;">Tanggal: ${new Date(stockOpnameDate).toLocaleDateString('id-ID')}</p>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <div style="flex: 1; padding: 15px; border-radius: 8px; background-color: #f8fafc; border: 1px solid #e2e8f0; margin: 0 10px;">
            <h3 style="margin-top: 0;">Total Item</h3>
            <p style="font-size: 24px; font-weight: bold; margin: 5px 0;">${stockOpnameSummary.totalItems}</p>
            <p style="margin: 5px 0;">${stockOpnameSummary.matched} item cocok</p>
            <p style="margin: 5px 0;">${stockOpnameSummary.discrepancies} item perlu penyesuaian</p>
          </div>
          
          <div style="flex: 1; padding: 15px; border-radius: 8px; background-color: #f0fdf4; border: 1px solid #bbf7d0; margin: 0 10px;">
            <h3 style="margin-top: 0; color: #15803d;">Stok Bertambah</h3>
            <p style="font-size: 24px; font-weight: bold; color: #15803d; margin: 5px 0;">
              +${stockOpnameSummary.totalPositiveDiff} item
            </p>
            <p style="margin: 5px 0;">Nilai: ${formatRupiah(stockOpnameSummary.totalPositiveValue)}</p>
          </div>
          
          <div style="flex: 1; padding: 15px; border-radius: 8px; background-color: #fef2f2; border: 1px solid #fecaca; margin: 0 10px;">
            <h3 style="margin-top: 0; color: #b91c1c;">Stok Berkurang</h3>
            <p style="font-size: 24px; font-weight: bold; color: #b91c1c; margin: 5px 0;">
              ${stockOpnameSummary.totalNegativeDiff} item
            </p>
            <p style="margin: 5px 0;">Nilai: ${formatRupiah(stockOpnameSummary.totalNegativeValue)}</p>
          </div>
          
          <div style="flex: 1; padding: 15px; border-radius: 8px; background-color: #f8fafc; border: 1px solid #e2e8f0; margin: 0 10px;">
            <h3 style="margin-top: 0;">Selisih Bersih</h3>
            <p style="font-size: 24px; font-weight: bold; color: ${(stockOpnameSummary.totalPositiveValue + stockOpnameSummary.totalNegativeValue) >= 0 ? '#15803d' : '#b91c1c'}; margin: 5px 0;">
              ${formatRupiah(stockOpnameSummary.totalPositiveValue + stockOpnameSummary.totalNegativeValue)}
            </p>
            <p style="margin: 5px 0;">${stockOpnameSummary.positiveDiff + stockOpnameSummary.negativeDiff} item</p>
          </div>
        </div>
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin-top: 0;">Detail Penting</h3>
          <p style="margin: 5px 0;"><strong>Produk dengan Selisih Terbesar:</strong> ${stockOpnameSummary.highestDiscrepancy.name} 
            (${stockOpnameSummary.highestDiscrepancy.difference > 0 ? '+' : ''}${stockOpnameSummary.highestDiscrepancy.difference})
          </p>
          <p style="margin: 5px 0;"><strong>Nilai Selisih Terbesar:</strong> 
            <span style="color: ${stockOpnameSummary.highestDiscrepancy.value >= 0 ? '#15803d' : '#b91c1c'}">
              ${formatRupiah(stockOpnameSummary.highestDiscrepancy.value)}
            </span>
          </p>
          <p style="margin: 5px 0;"><strong>Kategori dengan Selisih Terbanyak:</strong> ${stockOpnameSummary.mostDiscrepantCategory.category} 
            (${stockOpnameSummary.mostDiscrepantCategory.count} item)
          </p>
        </div>
        
        <h3 style="margin-bottom: 10px;">Detail Stock Opname</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Produk</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Kategori</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Stok Sistem</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Stok Fisik</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Selisih (Qty)</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Nilai Selisih</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Catatan</th>
            </tr>
          </thead>
          <tbody>
            ${sortedStockOpnameData.map(item => `
              <tr style="${item.difference > 0 ? 'background-color: #f0fdf4;' : item.difference < 0 ? 'background-color: #fef2f2;' : ''}">
                <td style="border: 1px solid #ddd; padding: 8px;">${item.name}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.category}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.currentStock}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.actualStock}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right; color: ${item.difference > 0 ? 'green' : item.difference < 0 ? 'red' : 'black'}">
                  ${item.difference > 0 ? '+' : ''}${item.difference}
                </td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right; color: ${item.valueDifference > 0 ? 'green' : item.valueDifference < 0 ? 'red' : 'black'}">
                  ${formatRupiah(item.valueDifference)}
                </td>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.notes}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Laporan Stock Opname - ${stockOpnameDate}</title>
          <style>
            @media print {
              body { visibility: hidden; }
              .print-content { visibility: visible; position: absolute; left: 0; top: 0; }
              @page { size: landscape; margin: 5mm; }
            }
          </style>
        </head>
        <body>
          <div class="print-content">${printContent}</div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 200);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };
  
  // Product management functions
  const validateProduct = (product) => {
    const newErrors = {};
    if (!product.name.trim()) newErrors.name = 'Nama produk harus diisi';
    if (!product.category.trim()) newErrors.category = 'Kategori harus diisi';
    if (!product.price || product.price <= 0) newErrors.price = 'Harga harus lebih dari 0';
    if (!product.stock || product.stock < 0) newErrors.stock = 'Stok tidak boleh negatif';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleImageUpload = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit) {
          setEditImagePreview(reader.result);
          setEditProduct({...editProduct, image: file});
        } else {
          setImagePreview(reader.result);
          setNewProduct({...newProduct, image: file});
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleAddProduct = () => {
    if (!validateProduct(newProduct)) return;
    
    const product = {
      id: Date.now(),
      ...newProduct,
      price: parseInt(newProduct.price),
      stock: parseInt(newProduct.stock),
      image: imagePreview || '/default-product.png'
    };
    
    addProduct(product);
    setShowAddModal(false);
    setNewProduct({ name: '', category: '', price: '', stock: '', image: null });
    setImagePreview(null);
    setErrors({});
  };
  
  const handleEditProduct = () => {
    if (!validateProduct(editProduct)) return;
    
    updateProduct(editProduct.id, {
      name: editProduct.name,
      category: editProduct.category,
      price: parseInt(editProduct.price),
      stock: parseInt(editProduct.stock),
      image: editImagePreview || editProduct.image || '/default-product.png'
    });
    setEditProduct(null);
    setEditImagePreview(null);
    setErrors({});
  };
  
  const handleDeleteProduct = () => {
    if (showDeleteConfirm) {
      deleteProduct(showDeleteConfirm);
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
          stock: parseInt(item.Stok || item.stock || 0),
          image: '/default-product.png'
        }));
        
        importedProducts.forEach(product => addProduct(product));
        setShowImportModal(false);
      } catch (error) {
        console.error('Error importing Excel:', error);
        alert('Format file tidak valid!');
      }
    };
    reader.readAsArrayBuffer(file);
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
  
  // Modal Component
  const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    const sizeClasses = {
      sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', 
      xl: 'max-w-xl', '2xl': 'max-w-2xl', '3xl': 'max-w-3xl'
    };
    
    return isOpen ? (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size]}`}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{title}</h3>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <FiX className="w-6 h-6" />
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    ) : null;
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header with Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold">Manajemen Produk</h2>
          <p className="text-gray-600">
            {activeTab === 'products' ? 'Kelola produk dan stok' : 'Stock Opname'}
          </p>
          
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mt-4">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-2 px-4 font-medium text-sm flex items-center ${activeTab === 'products' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <FiPackage className="mr-2" /> Produk
            </button>
            <button
              onClick={() => setActiveTab('stockOpname')}
              className={`py-2 px-4 font-medium text-sm flex items-center ${activeTab === 'stockOpname' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <FiClipboard className="mr-2" /> Stock Opname
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {activeTab === 'products' && (
            <>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari produk..."
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <button 
                onClick={() => setShowImportModal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center"
              >
                <FiUpload className="mr-2" /> Import
              </button>
              
              <button 
                onClick={exportToExcel}
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg flex items-center"
              >
                <FiDownload className="mr-2" /> Export
              </button>
              
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg flex items-center"
              >
                <FiPlus className="mr-2" /> Tambah
              </button>
            </>
          )}
          
          {activeTab === 'stockOpname' && (
            <div className="flex flex-wrap gap-2">
              {!isStockOpnameMode ? (
                <button 
                  onClick={startStockOpname}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg flex items-center"
                >
                  <FiCheckCircle className="mr-2" /> Input Data Stock Opname
                </button>
              ) : (
                <>
                  <button 
                    onClick={submitStockOpname}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center"
                  >
                    <FiSave className="mr-2" /> Simpan
                  </button>
                  <button 
                    onClick={cancelStockOpname}
                    className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg flex items-center"
                  >
                    <FiRotateCcw className="mr-2" /> Batal
                  </button>
                  <button 
                    onClick={exportStockOpname}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center"
                  >
                    <FiDownload className="mr-2" /> Export
                  </button>
                  <button 
                    onClick={printStockOpname}
                    className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg flex items-center"
                  >
                    <FiPrinter className="mr-2" /> Cetak
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Products Tab Content */}
      {activeTab === 'products' && (
        <>
          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FiPieChart className="mr-2 text-indigo-600" />
                Kategori Produk
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FiBarChart2 className="mr-2 text-yellow-600" />
                Sisa Stok Produk
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stockData.slice(0, 6)}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="stok" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Product Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">Gambar</th>
                  <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                  <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                  <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
                  <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">Stok</th>
                  <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden">
                          <Image
                            src={product.image || '/default-product.png'}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="object-cover"
                          />
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-medium">{product.name}</span>
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="p-4 font-medium">{formatRupiah(product.price)}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.stock > 10 ? 'bg-green-100 text-green-800' : 
                          product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.stock} pcs
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => {
                              setEditProduct({...product});
                              setEditImagePreview(null);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50"
                          >
                            <FiEdit2 />
                          </button>
                          <button 
                            onClick={() => setShowDeleteConfirm(product.id)}
                            className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">
                      Tidak ada produk yang ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
      
      {/* Stock Opname Tab Content */}
      {activeTab === 'stockOpname' && (
        <div className="space-y-6">
          {/* Mode Input Data - Hanya tampil saat mode aktif */}
          {isStockOpnameMode ? (
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FiCheckCircle className="mr-2 text-indigo-600" />
                Mode Input Data Stock Opname
              </h3>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                    <input
                      type="date"
                      className="p-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={stockOpnameDate}
                      onChange={(e) => setStockOpnameDate(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter</label>
                    <select
                      className="p-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      <option value="all">Semua Item</option>
                      <option value="matched">Cocok</option>
                      <option value="discrepancies">Perlu Penyesuaian</option>
                    </select>
                  </div>
                </div>
                
                <div className="text-sm">
                  {stockOpnameSummary.discrepancies > 0 && (
                    <span className="font-medium text-indigo-700">
                      {stockOpnameSummary.discrepancies} item perlu penyesuaian (Total nilai: {formatRupiah(stockOpnameSummary.totalPositiveValue + stockOpnameSummary.totalNegativeValue)})
                    </span>
                  )}
                </div>
              </div>
              
              {/* Stock Opname Table - Mode Input */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th 
                          className="p-4 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                          onClick={() => requestSort('name')}
                        >
                          <div className="flex items-center">
                            Produk
                            {sortConfig.key === 'name' && (
                              sortConfig.direction === 'asc' ? <FiArrowUp className="ml-1" /> : <FiArrowDown className="ml-1" />
                            )}
                          </div>
                        </th>
                        <th 
                          className="p-4 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                          onClick={() => requestSort('category')}
                        >
                          <div className="flex items-center">
                            Kategori
                            {sortConfig.key === 'category' && (
                              sortConfig.direction === 'asc' ? <FiArrowUp className="ml-1" /> : <FiArrowDown className="ml-1" />
                            )}
                          </div>
                        </th>
                        <th 
                          className="p-4 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                          onClick={() => requestSort('currentStock')}
                        >
                          <div className="flex items-center">
                            Stok Sistem
                            {sortConfig.key === 'currentStock' && (
                              sortConfig.direction === 'asc' ? <FiArrowUp className="ml-1" /> : <FiArrowDown className="ml-1" />
                            )}
                          </div>
                        </th>
                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">Stok Fisik</th>
                        <th 
                          className="p-4 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                          onClick={() => requestSort('difference')}
                        >
                          <div className="flex items-center">
                            Selisih
                            {sortConfig.key === 'difference' && (
                              sortConfig.direction === 'asc' ? <FiArrowUp className="ml-1" /> : <FiArrowDown className="ml-1" />
                            )}
                          </div>
                        </th>
                        <th 
                          className="p-4 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                          onClick={() => requestSort('valueDifference')}
                        >
                          <div className="flex items-center">
                            Nilai Selisih
                            {sortConfig.key === 'valueDifference' && (
                              sortConfig.direction === 'asc' ? <FiArrowUp className="ml-1" /> : <FiArrowDown className="ml-1" />
                            )}
                          </div>
                        </th>
                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">Catatan</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedStockOpnameData.length > 0 ? (
                        sortedStockOpnameData.map(item => (
                          <tr 
                            key={item.id} 
                            className={`hover:bg-gray-50 ${
                              item.difference > 0 ? 'bg-green-50' : item.difference < 0 ? 'bg-red-50' : ''
                            }`}
                          >
                            <td className="p-4">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-lg overflow-hidden mr-3">
                                  <Image
                                    src={item.image || '/default-product.png'}
                                    alt={item.name}
                                    width={40}
                                    height={40}
                                    className="object-cover"
                                  />
                                </div>
                                <span className="font-medium">{item.name}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {item.category}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                item.currentStock > 10 ? 'bg-green-100 text-green-800' : 
                                item.currentStock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {item.currentStock} pcs
                              </span>
                            </td>
                            <td className="p-4">
                              <input
                                type="number"
                                className="w-20 p-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={item.actualStock}
                                onChange={(e) => handleStockOpnameChange(item.id, e.target.value)}
                              />
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                item.difference === 0 ? 'bg-gray-100 text-gray-800' :
                                item.difference > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {item.difference > 0 ? '+' : ''}{item.difference}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                item.valueDifference === 0 ? 'bg-gray-100 text-gray-800' :
                                item.valueDifference > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {formatRupiah(item.valueDifference)}
                              </span>
                            </td>
                            <td className="p-4">
                              <input
                                type="text"
                                className="w-full p-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={item.notes}
                                onChange={(e) => handleNotesChange(item.id, e.target.value)}
                                placeholder="Catatan..."
                              />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-gray-500">
                            Tidak ada data yang ditemukan
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Summary Cards - Selalu Tampil di luar mode input */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-500">Total Item</h3>
                    <FiList className="text-gray-400" />
                  </div>
                  <p className="text-2xl font-bold mt-2">{stockOpnameSummary.totalItems}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stockOpnameSummary.matched} cocok, {stockOpnameSummary.discrepancies} selisih
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-500">Stok Bertambah</h3>
                    <FiTrendingUp className="text-green-500" />
                  </div>
                  <p className="text-2xl font-bold mt-2 text-green-600">+{stockOpnameSummary.totalPositiveDiff}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatRupiah(stockOpnameSummary.totalPositiveValue)}
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-500">Stok Berkurang</h3>
                    <FiTrendingDown className="text-red-500" />
                  </div>
                  <p className="text-2xl font-bold mt-2 text-red-600">{stockOpnameSummary.totalNegativeDiff}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatRupiah(stockOpnameSummary.totalNegativeValue)}
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-500">Selisih Bersih</h3>
                    <FiDollarSign className="text-indigo-500" />
                  </div>
                  <p className={`text-2xl font-bold mt-2 ${
                    (stockOpnameSummary.totalPositiveValue + stockOpnameSummary.totalNegativeValue) >= 0 ? 
                    'text-green-600' : 'text-red-600'
                  }`}>
                    {formatRupiah(stockOpnameSummary.totalPositiveValue + stockOpnameSummary.totalNegativeValue)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stockOpnameSummary.positiveDiff + stockOpnameSummary.negativeDiff} item
                  </p>
                </div>
              </div>
              
              {/* Charts Section - Selalu Tampil di luar mode input */}
              {stockOpnameSummary.discrepancies > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Top Discrepancies Chart */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <FiBarChart2 className="mr-2 text-indigo-600" />
                      Produk dengan Selisih Terbesar
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={discrepancyChartData}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={100} />
                          <Tooltip 
                            formatter={(value, name, props) => [
                              name === 'difference' ? value : formatRupiah(value), 
                              name === 'difference' ? 'Selisih (Qty)' : 'Nilai Selisih'
                            ]}
                            contentStyle={{
                              backgroundColor: '#fff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '0.5rem',
                              padding: '0.5rem'
                            }}
                          />
                          <Legend />
                          <Bar dataKey="difference" fill="#8884d8" name="Selisih (Qty)" />
                          <Bar dataKey="value" fill="#82ca9d" name="Nilai Selisih" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  {/* Category Discrepancy Chart */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <FiPieChart className="mr-2 text-yellow-600" />
                      Selisih per Kategori
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryDiscrepancyData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {categoryDiscrepancyData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => [`${value} item`, 'Jumlah Selisih']}
                            contentStyle={{
                              backgroundColor: '#fff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '0.5rem',
                              padding: '0.5rem'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 p-6 rounded-lg text-center">
                  <FiPieChart className="mx-auto h-12 w-12 text-blue-500 mb-3" />
                  <h3 className="text-lg font-medium text-blue-800 mb-2">Belum Ada Data Stock Opname</h3>
                  <p className="text-blue-600">Klik tombol "Input Data Stock Opname" untuk memulai pencatatan stok fisik</p>
                </div>
              )}
              
              {/* Value Impact Chart - Selalu Tampil di luar mode input */}
              {stockOpnameSummary.discrepancies > 0 && (
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <FiDollarSign className="mr-2 text-green-600" />
                    Dampak Nilai Selisih
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={valueImpactChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {valueImpactChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [formatRupiah(value), 'Nilai']}
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '0.5rem',
                            padding: '0.5rem'
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
              
              {/* Stock Opname Table - Hanya tampil di luar mode input */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th 
                          className="p-4 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                          onClick={() => requestSort('name')}
                        >
                          <div className="flex items-center">
                            Produk
                            {sortConfig.key === 'name' && (
                              sortConfig.direction === 'asc' ? <FiArrowUp className="ml-1" /> : <FiArrowDown className="ml-1" />
                            )}
                          </div>
                        </th>
                        <th 
                          className="p-4 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                          onClick={() => requestSort('category')}
                        >
                          <div className="flex items-center">
                            Kategori
                            {sortConfig.key === 'category' && (
                              sortConfig.direction === 'asc' ? <FiArrowUp className="ml-1" /> : <FiArrowDown className="ml-1" />
                            )}
                          </div>
                        </th>
                        <th 
                          className="p-4 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                          onClick={() => requestSort('currentStock')}
                        >
                          <div className="flex items-center">
                            Stok Sistem
                            {sortConfig.key === 'currentStock' && (
                              sortConfig.direction === 'asc' ? <FiArrowUp className="ml-1" /> : <FiArrowDown className="ml-1" />
                            )}
                          </div>
                        </th>
                        <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">Stok Fisik</th>
                        <th 
                          className="p-4 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                          onClick={() => requestSort('difference')}
                        >
                          <div className="flex items-center">
                            Selisih
                            {sortConfig.key === 'difference' && (
                              sortConfig.direction === 'asc' ? <FiArrowUp className="ml-1" /> : <FiArrowDown className="ml-1" />
                            )}
                          </div>
                        </th>
                        <th 
                          className="p-4 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                          onClick={() => requestSort('valueDifference')}
                        >
                          <div className="flex items-center">
                            Nilai Selisih
                            {sortConfig.key === 'valueDifference' && (
                              sortConfig.direction === 'asc' ? <FiArrowUp className="ml-1" /> : <FiArrowDown className="ml-1" />
                            )}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedStockOpnameData.length > 0 ? (
                        sortedStockOpnameData.map(item => (
                          <tr 
                            key={item.id} 
                            className={`hover:bg-gray-50 ${
                              item.difference > 0 ? 'bg-green-50' : item.difference < 0 ? 'bg-red-50' : ''
                            }`}
                          >
                            <td className="p-4">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-lg overflow-hidden mr-3">
                                  <Image
                                    src={item.image || '/default-product.png'}
                                    alt={item.name}
                                    width={40}
                                    height={40}
                                    className="object-cover"
                                  />
                                </div>
                                <span className="font-medium">{item.name}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {item.category}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                item.currentStock > 10 ? 'bg-green-100 text-green-800' : 
                                item.currentStock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {item.currentStock} pcs
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                item.actualStock > 10 ? 'bg-green-100 text-green-800' : 
                                item.actualStock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {item.actualStock} pcs
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                item.difference === 0 ? 'bg-gray-100 text-gray-800' :
                                item.difference > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {item.difference > 0 ? '+' : ''}{item.difference}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                item.valueDifference === 0 ? 'bg-gray-100 text-gray-800' :
                                item.valueDifference > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {formatRupiah(item.valueDifference)}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-gray-500">
                            Tidak ada data yang ditemukan
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Add Product Modal */}
      <Modal 
        isOpen={showAddModal} 
        onClose={() => {
          setShowAddModal(false);
          setNewProduct({ name: '', category: '', price: '', stock: '', image: null });
          setImagePreview(null);
          setErrors({});
        }}
        title="Tambah Produk Baru"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
            <input
              type="text"
              className={`w-full p-2 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              value={newProduct.name}
              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <input
              type="text"
              className={`w-full p-2 border rounded-lg ${errors.category ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              value={newProduct.category}
              onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
            />
            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Harga</label>
              <input
                type="number"
                className={`w-full p-2 border rounded-lg ${errors.price ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
              />
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
              <input
                type="number"
                className={`w-full p-2 border rounded-lg ${errors.stock ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                value={newProduct.stock}
                onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
              />
              {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock}</p>}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gambar Produk</label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <FiImage className="text-gray-400 w-8 h-8" />
                )}
              </div>
              <label className="cursor-pointer">
                <span className="bg-indigo-600 text-white py-2 px-4 rounded-lg inline-flex items-center">
                  <FiUpload className="mr-2" /> Upload
                </span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e)}
                />
              </label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => {
                setShowAddModal(false);
                setNewProduct({ name: '', category: '', price: '', stock: '', image: null });
                setImagePreview(null);
                setErrors({});
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              onClick={handleAddProduct}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
            >
              <FiPlus className="mr-2" /> Tambah Produk
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Edit Product Modal */}
      <Modal 
        isOpen={editProduct !== null} 
        onClose={() => {
          setEditProduct(null);
          setEditImagePreview(null);
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
                className={`w-full p-2 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                value={editProduct.name}
                onChange={(e) => setEditProduct({...editProduct, name: e.target.value})}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <input
                type="text"
                className={`w-full p-2 border rounded-lg ${errors.category ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                value={editProduct.category}
                onChange={(e) => setEditProduct({...editProduct, category: e.target.value})}
              />
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga</label>
                <input
                  type="number"
                  className={`w-full p-2 border rounded-lg ${errors.price ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  value={editProduct.price}
                  onChange={(e) => setEditProduct({...editProduct, price: e.target.value})}
                />
                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
                <input
                  type="number"
                  className={`w-full p-2 border rounded-lg ${errors.stock ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  value={editProduct.stock}
                  onChange={(e) => setEditProduct({...editProduct, stock: e.target.value})}
                />
                {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock}</p>}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gambar Produk</label>
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                  {editImagePreview ? (
                    <img src={editImagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : editProduct.image ? (
                    <img src={editProduct.image} alt="Current" className="w-full h-full object-cover" />
                  ) : (
                    <FiImage className="text-gray-400 w-8 h-8" />
                  )}
                </div>
                <label className="cursor-pointer">
                  <span className="bg-indigo-600 text-white py-2 px-4 rounded-lg inline-flex items-center">
                    <FiUpload className="mr-2" /> Ganti Gambar
                  </span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, true)}
                  />
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => {
                  setEditProduct(null);
                  setEditImagePreview(null);
                  setErrors({});
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleEditProduct}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
              >
                <FiSave className="mr-2" /> Simpan Perubahan
              </button>
            </div>
          </div>
        )}
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={showDeleteConfirm !== null} 
        onClose={() => setShowDeleteConfirm(null)}
        title="Konfirmasi Hapus Produk"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-center text-red-500 mb-4">
            <FiAlertCircle className="w-12 h-12" />
          </div>
          <p className="text-center text-gray-600">Apakah Anda yakin ingin menghapus produk ini? Aksi ini tidak dapat dibatalkan.</p>
          
          <div className="flex justify-center space-x-3 pt-4">
            <button
              onClick={() => setShowDeleteConfirm(null)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              onClick={handleDeleteProduct}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
            >
              <FiTrash2 className="mr-2" /> Hapus
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Import Excel Modal */}
      <Modal 
        isOpen={showImportModal} 
        onClose={() => setShowImportModal(false)}
        title="Import Produk dari Excel"
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <FiDownload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Upload File Excel</h3>
            <p className="text-gray-500 mb-4">Format file harus sesuai dengan template</p>
            <label className="cursor-pointer">
              <span className="bg-indigo-600 text-white py-2 px-4 rounded-lg inline-flex items-center">
                <FiUpload className="mr-2" /> Pilih File
              </span>
              <input 
                type="file" 
                className="hidden" 
                accept=".xlsx,.xls"
                onChange={handleImportExcel}
              />
            </label>
            <p className="text-xs text-gray-500 mt-3">Format yang didukung: .xlsx, .xls</p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center">
              <FiAlertCircle className="mr-2" /> Petunjuk Format Excel
            </h4>
            <ul className="text-sm text-blue-700 list-disc pl-5 space-y-1">
              <li>Kolom harus berisi: Nama, Kategori, Harga, Stok</li>
              <li>Baris pertama dianggap sebagai header</li>
              <li>File harus dalam format Excel (.xlsx atau .xls)</li>
              <li>Pastikan data sudah benar sebelum mengimport</li>
            </ul>
          </div>
          
          <div className="flex justify-end pt-4">
            <button
              onClick={() => setShowImportModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Tutup
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Stock Opname Summary Modal */}
      <Modal 
        isOpen={showStockOpnameSummary} 
        onClose={() => setShowStockOpnameSummary(false)}
        title="Ringkasan Stock Opname"
        size="2xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Total Item</h3>
              <p className="text-2xl font-bold mt-2">{stockOpnameSummary.totalItems}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stockOpnameSummary.matched} cocok, {stockOpnameSummary.discrepancies} selisih
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 shadow-sm">
              <h3 className="text-sm font-medium text-green-800">Stok Bertambah</h3>
              <p className="text-2xl font-bold mt-2 text-green-600">+{stockOpnameSummary.totalPositiveDiff}</p>
              <p className="text-xs text-green-600 mt-1">
                {formatRupiah(stockOpnameSummary.totalPositiveValue)}
              </p>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg border border-red-200 shadow-sm">
              <h3 className="text-sm font-medium text-red-800">Stok Berkurang</h3>
              <p className="text-2xl font-bold mt-2 text-red-600">{stockOpnameSummary.totalNegativeDiff}</p>
              <p className="text-xs text-red-600 mt-1">
                {formatRupiah(stockOpnameSummary.totalNegativeValue)}
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center">
              <FiAlertCircle className="mr-2" /> Detail Penting
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-blue-700">
                  <strong>Produk dengan Selisih Terbesar:</strong> {stockOpnameSummary.highestDiscrepancy.name}
                </p>
                <p className="text-sm text-blue-700">
                  <strong>Selisih Qty:</strong> {stockOpnameSummary.highestDiscrepancy.difference > 0 ? '+' : ''}{stockOpnameSummary.highestDiscrepancy.difference}
                </p>
                <p className="text-sm text-blue-700">
                  <strong>Nilai Selisih:</strong> {formatRupiah(stockOpnameSummary.highestDiscrepancy.value)}
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-700">
                  <strong>Kategori dengan Selisih Terbanyak:</strong> {stockOpnameSummary.mostDiscrepantCategory.category}
                </p>
                <p className="text-sm text-blue-700">
                  <strong>Jumlah Item:</strong> {stockOpnameSummary.mostDiscrepantCategory.count}
                </p>
                <p className="text-sm text-blue-700">
                  <strong>Selisih Nilai Bersih:</strong> {formatRupiah(stockOpnameSummary.totalPositiveValue + stockOpnameSummary.totalNegativeValue)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            <h4 className="font-medium text-gray-700 mb-2">Detail Perubahan Stok</h4>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase border">Produk</th>
                  <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase border">Stok Sistem</th>
                  <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase border">Stok Fisik</th>
                  <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase border">Selisih</th>
                  <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase border">Nilai</th>
                </tr>
              </thead>
              <tbody>
                {sortedStockOpnameData.filter(item => item.difference !== 0).map(item => (
                  <tr key={item.id} className="border">
                    <td className="p-2 border">{item.name}</td>
                    <td className="p-2 border">{item.currentStock}</td>
                    <td className="p-2 border">{item.actualStock}</td>
                    <td className={`p-2 border ${item.difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.difference > 0 ? '+' : ''}{item.difference}
                    </td>
                    <td className={`p-2 border ${item.valueDifference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatRupiah(item.valueDifference)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setShowStockOpnameSummary(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Kembali
            </button>
            <button
              onClick={confirmStockOpname}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
            >
              <FiCheck className="mr-2" /> Konfirmasi Stock Opname
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductTable;