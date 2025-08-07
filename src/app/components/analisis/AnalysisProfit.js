'use client';
import React, { useState, useMemo, useRef } from 'react';
import { 
  FiDollarSign, FiTrendingUp, FiTrendingDown, FiPieChart, 
  FiBarChart2, FiCalendar, FiFilter, FiDownload, FiRefreshCw,
  FiPlus, FiUpload, FiX, FiSave, FiTrash2, FiEdit2,
  FiInfo, FiAlertCircle, FiCheckCircle, FiFileText, FiPrinter
} from 'react-icons/fi';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatRupiah } from '@/utils/formatCurrency';

const AnalysisProfit = ({ 
  transactions = [], 
  products = [], 
  expenses = [],
  timeFilter = 'month',
  onTimeFilterChange,
  onAddExpense,
  onDeleteExpense,
  onUpdateExpense
}) => {
  // State untuk filter kategori
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // State untuk modal tambah/edit pengeluaran
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  
  // State untuk form pengeluaran
  const [expenseForm, setExpenseForm] = useState({
    id: '',
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  // State untuk import Excel
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);
  
  // State untuk export laporan
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('excel');
  
  // Reset form
  const resetForm = () => {
    setExpenseForm({
      id: '',
      category: '',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    });
    setEditingExpense(null);
  };
  
  // Buka modal untuk tambah pengeluaran
  const openAddExpenseModal = () => {
    resetForm();
    setShowExpenseModal(true);
  };
  
  // Buka modal untuk edit pengeluaran
  const openEditExpenseModal = (expense) => {
    setExpenseForm({
      id: expense.id,
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      date: expense.date
    });
    setEditingExpense(expense);
    setShowExpenseModal(true);
  };
  
  // Handle submit form pengeluaran
  const handleSubmitExpense = () => {
    if (!expenseForm.category || !expenseForm.description || !expenseForm.amount) {
      alert('Semua field harus diisi');
      return;
    }
    
    const expenseData = {
      ...expenseForm,
      amount: parseFloat(expenseForm.amount)
    };
    
    if (editingExpense) {
      onUpdateExpense && onUpdateExpense(expenseData);
    } else {
      onAddExpense && onAddExpense(expenseData);
    }
    
    setShowExpenseModal(false);
    resetForm();
  };
  
  // Handle import Excel
  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setImporting(true);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Proses data dari Excel
        const importedExpenses = jsonData.map((row, index) => {
          // Sesuaikan dengan format kolom di Excel Anda
          return {
            id: `imported-${Date.now()}-${index}`,
            category: row['Kategori'] || row['Category'] || 'Lainnya',
            description: row['Deskripsi'] || row['Description'] || '',
            amount: parseFloat(row['Jumlah'] || row['Amount'] || 0),
            date: row['Tanggal'] || row['Date'] || new Date().toISOString().split('T')[0]
          };
        });
        
        // Kirim data ke parent component
        if (onAddExpense && importedExpenses.length > 0) {
          importedExpenses.forEach(expense => onAddExpense(expense));
          alert(`Berhasil mengimpor ${importedExpenses.length} data pengeluaran`);
        }
      } catch (error) {
        console.error('Error importing Excel:', error);
        alert('Gagal mengimpor file Excel. Pastikan format file benar.');
      } finally {
        setImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    
    reader.readAsArrayBuffer(file);
  };
  
  // Trigger file input
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Export ke Excel
  const exportToExcel = () => {
    setExporting(true);
    
    try {
      // Siapkan data untuk Excel
      const profitSummaryData = [
        { Kategori: 'Pendapatan', Jumlah: profitData.find(item => item.name === 'Pendapatan')?.value || 0 },
        { Kategori: 'Pengeluaran', Jumlah: profitData.find(item => item.name === 'Pengeluaran')?.value || 0 },
        { Kategori: 'Laba Bersih', Jumlah: profitData.find(item => item.name === 'Laba Bersih')?.value || 0 }
      ];
      
      const revenueExpenseData = revenueData.map(item => ({
        Bulan: item.name,
        Pendapatan: item.pendapatan,
        Pengeluaran: item.pengeluaran,
        Laba: item.pendapatan - item.pengeluaran
      }));
      
      const categoryData = categoryProfitData.map(item => ({
        Kategori: item.name,
        Pendapatan: item.revenue,
        Pengeluaran: item.cost,
        'Laba/Rugi': item.profit,
        'Margin %': item.revenue > 0 ? ((item.profit / item.revenue) * 100).toFixed(2) + '%' : '0%'
      }));
      
      const expenseListData = expenses.map(item => ({
        Tanggal: item.date,
        Kategori: item.category,
        Deskripsi: item.description,
        Jumlah: item.amount
      }));
      
      // Buat workbook
      const wb = XLSX.utils.book_new();
      
      // Tambah worksheet untuk ringkasan
      const wsSummary = XLSX.utils.json_to_sheet(profitSummaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan");
      
      // Tambah worksheet untuk pendapatan vs pengeluaran
      const wsRevenueExpense = XLSX.utils.json_to_sheet(revenueExpenseData);
      XLSX.utils.book_append_sheet(wb, wsRevenueExpense, "Pendapatan vs Pengeluaran");
      
      // Tambah worksheet untuk kategori
      const wsCategory = XLSX.utils.json_to_sheet(categoryData);
      XLSX.utils.book_append_sheet(wb, wsCategory, "Per Kategori");
      
      // Tambah worksheet untuk daftar pengeluaran
      const wsExpenses = XLSX.utils.json_to_sheet(expenseListData);
      XLSX.utils.book_append_sheet(wb, wsExpenses, "Daftar Pengeluaran");
      
      // Generate dan download file
      const fileName = `Laporan_Keuangan_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      alert(`Laporan keuangan berhasil diekspor ke ${fileName}`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Gagal mengekspor laporan ke Excel.');
    } finally {
      setExporting(false);
    }
  };
  
  // Export ke PDF
  const exportToPDF = () => {
    setExporting(true);
    
    try {
      // Buat dokumen PDF
      const doc = new jsPDF();
      
      // Tambah judul
      doc.setFontSize(18);
      doc.text('Laporan Keuangan', 105, 15, { align: 'center' });
      
      // Tambah tanggal
      doc.setFontSize(12);
      doc.text(`Periode: ${timeFilter === 'week' ? 'Minggu Ini' : timeFilter === 'month' ? 'Bulan Ini' : timeFilter === 'quarter' ? 'Kuartal Ini' : 'Tahun Ini'}`, 105, 25, { align: 'center' });
      doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 105, 32, { align: 'center' });
      
      // Tambah ringkasan
      doc.setFontSize(14);
      doc.text('Ringkasan Keuangan:', 14, 45);
      
      // Tambah tabel ringkasan
      const summaryData = [
        ['Kategori', 'Jumlah'],
        ['Pendapatan', formatRupiah(profitData.find(item => item.name === 'Pendapatan')?.value || 0)],
        ['Pengeluaran', formatRupiah(profitData.find(item => item.name === 'Pengeluaran')?.value || 0)],
        ['Laba Bersih', formatRupiah(profitData.find(item => item.name === 'Laba Bersih')?.value || 0)]
      ];
      
      // Perbaikan: Cek apakah autoTable tersedia
      if (typeof doc.autoTable === 'function') {
        doc.autoTable({
          head: [summaryData[0]],
          body: summaryData.slice(1),
          startY: 55,
          theme: 'grid',
          styles: {
            fontSize: 10,
            cellPadding: 3
          }
        });
      } else {
        // Fallback jika autoTable tidak tersedia
        let yPos = 55;
        doc.setFontSize(10);
        summaryData.forEach((row, i) => {
          if (i === 0) {
            doc.setFont(undefined, 'bold');
          } else {
            doc.setFont(undefined, 'normal');
          }
          row.forEach((cell, j) => {
            doc.text(cell, 14 + (j * 80), yPos);
          });
          yPos += 10;
        });
      }
      
      // Tambah grafik pendapatan vs pengeluaran
      doc.text('Grafik Pendapatan vs Pengeluaran:', 14, 90);
      
      // Siapkan data untuk grafik
      const chartData = revenueData.map(item => [
        item.name,
        formatRupiah(item.pendapatan),
        formatRupiah(item.pengeluaran),
        formatRupiah(item.pendapatan - item.pengeluaran)
      ]);
      
      // Tambah tabel grafik
      if (typeof doc.autoTable === 'function') {
        doc.autoTable({
          head: ['Bulan', 'Pendapatan', 'Pengeluaran', 'Laba'],
          body: chartData,
          startY: 100,
          theme: 'grid',
          styles: {
            fontSize: 9,
            cellPadding: 2
          }
        });
      } else {
        // Fallback jika autoTable tidak tersedia
        let yPos = 100;
        doc.setFontSize(9);
        
        // Header
        doc.setFont(undefined, 'bold');
        doc.text('Bulan', 14, yPos);
        doc.text('Pendapatan', 50, yPos);
        doc.text('Pengeluaran', 100, yPos);
        doc.text('Laba', 150, yPos);
        yPos += 10;
        
        // Body
        doc.setFont(undefined, 'normal');
        chartData.forEach(row => {
          doc.text(row[0], 14, yPos);
          doc.text(row[1], 50, yPos);
          doc.text(row[2], 100, yPos);
          doc.text(row[3], 150, yPos);
          yPos += 8;
        });
      }
      
      // Tambah interpretasi
      doc.text('Interpretasi Keuangan:', 14, 140);
      
      const interpretationData = [
        ['Metric', 'Nilai', 'Status'],
        ['Margin Laba', `${interpretation.profitMargin.toFixed(1)}%`, interpretation.profitMargin > 15 ? 'Baik' : interpretation.profitMargin > 10 ? 'Cukup' : 'Perlu Perhatian'],
        ['Tren Laba', interpretation.profitTrend, interpretation.profitTrend.includes('Tumbuh') ? 'Positif' : interpretation.profitTrend.includes('Stabil') ? 'Netral' : 'Negatif'],
        ['Tren Pengeluaran', interpretation.expenseTrend, interpretation.expenseTrend.includes('Menurun') ? 'Baik' : interpretation.expenseTrend.includes('Stabil') ? 'Netral' : 'Perlu Perhatian'],
        ['Kesehatan Keuangan', interpretation.financialHealth, interpretation.financialHealth === 'Sehat' ? 'Sehat' : interpretation.financialHealth === 'Cukup Sehat' ? 'Cukup Sehat' : 'Perlu Perhatian']
      ];
      
      if (typeof doc.autoTable === 'function') {
        doc.autoTable({
          head: [interpretationData[0]],
          body: interpretationData.slice(1),
          startY: 155,
          theme: 'grid',
          styles: {
            fontSize: 9,
            cellPadding: 2
          }
        });
      } else {
        // Fallback jika autoTable tidak tersedia
        let yPos = 155;
        doc.setFontSize(9);
        
        // Header
        doc.setFont(undefined, 'bold');
        doc.text('Metric', 14, yPos);
        doc.text('Nilai', 60, yPos);
        doc.text('Status', 110, yPos);
        yPos += 10;
        
        // Body
        doc.setFont(undefined, 'normal');
        interpretationData.slice(1).forEach(row => {
          doc.text(row[0], 14, yPos);
          doc.text(row[1], 60, yPos);
          doc.text(row[2], 110, yPos);
          yPos += 8;
        });
      }
      
      // Tambah rekomendasi
      doc.text('Rekomendasi:', 14, 185);
      
      const recommendations = [
        '1. Margin laba Anda ' + (interpretation.profitMargin > 15 ? 'sangat baik. Pertahankan efisiensi operasional.' : 
          interpretation.profitMargin > 10 ? 'cukup baik. Ada ruang untuk peningkatan.' : 
          'rendah. Perlu evaluasi pengeluaran dan strategi harga.'),
        '2. Pengeluaran Anda ' + (interpretation.expenseTrend.includes('Menurun') ? 'menurun. Kontrol pengeluaran Anda efektif.' : 
          interpretation.expenseTrend.includes('Stabil') ? 'stabil. Pertahankan kontrol pengeluaran.' : 
          'meningkat. Perlu evaluasi dan kontrol pengeluaran.'),
        '3. Kategori pengeluaran terbesar adalah ' + interpretation.topExpenseCategory.name + 
          '. ' + (interpretation.topExpenseCategory.name === 'Bahan Baku' ? 
          'Fokus pada negosiasi dengan pemasok atau efisiensi penggunaan bahan baku.' : 
          'Pertimbangkan untuk mengoptimalkan pengeluaran di kategori ini.')
      ];
      
      doc.setFontSize(10);
      recommendations.forEach((rec, index) => {
        doc.text(rec, 14, 200 + (index * 7), { maxWidth: 180 });
      });
      
      // Tambah daftar pengeluaran jika ada
      if (expenses.length > 0) {
        doc.addPage();
        doc.text('Daftar Pengeluaran:', 14, 15);
        
        const expenseTableData = expenses.map(expense => [
          expense.date,
          expense.category,
          expense.description,
          formatRupiah(expense.amount)
        ]);
        
        if (typeof doc.autoTable === 'function') {
          doc.autoTable({
            head: ['Tanggal', 'Kategori', 'Deskripsi', 'Jumlah'],
            body: expenseTableData,
            startY: 25,
            theme: 'grid',
            styles: {
              fontSize: 9,
              cellPadding: 2
            }
          });
        } else {
          // Fallback jika autoTable tidak tersedia
          let yPos = 25;
          doc.setFontSize(9);
          
          // Header
          doc.setFont(undefined, 'bold');
          doc.text('Tanggal', 14, yPos);
          doc.text('Kategori', 45, yPos);
          doc.text('Deskripsi', 80, yPos);
          doc.text('Jumlah', 140, yPos);
          yPos += 10;
          
          // Body
          doc.setFont(undefined, 'normal');
          expenseTableData.forEach(row => {
            doc.text(row[0], 14, yPos);
            doc.text(row[1], 45, yPos);
            doc.text(row[2], 80, yPos);
            doc.text(row[3], 140, yPos);
            yPos += 8;
          });
        }
      }
      
      // Generate dan download file
      const fileName = `Laporan_Keuangan_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      alert(`Laporan keuangan berhasil diekspor ke ${fileName}`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Gagal mengekspor laporan ke PDF.');
    } finally {
      setExporting(false);
    }
  };
  
  // Handle export berdasarkan format yang dipilih
  const handleExport = () => {
    if (exportFormat === 'excel') {
      exportToExcel();
    } else if (exportFormat === 'pdf') {
      exportToPDF();
    }
  };
  
  // Hitung data laba rugi menggunakan useMemo
  const { 
    profitData, 
    revenueData, 
    expenseData, 
    categoryProfitData, 
    monthlyTrendData,
    expenseTrendData,
    interpretation
  } = useMemo(() => {
    try {
      // Pastikan transactions ada dan merupakan array
      if (!Array.isArray(transactions)) {
        return {
          profitData: [],
          revenueData: [],
          expenseData: [],
          categoryProfitData: [],
          monthlyTrendData: [],
          expenseTrendData: [],
          interpretation: {}
        };
      }
      
      // Data laba rugi per kategori
      const categories = {};
      transactions.forEach(transaction => {
        // Pastikan transaction.items ada dan merupakan array
        if (Array.isArray(transaction.items)) {
          transaction.items.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            if (product) {
              const category = product.category || 'Unknown';
              if (!categories[category]) {
                categories[category] = {
                  revenue: 0,
                  cost: 0,
                  profit: 0
                };
              }
              
              const revenue = item.price * item.quantity;
              const cost = (product.cost || 0) * item.quantity;
              
              categories[category].revenue += revenue;
              categories[category].cost += cost;
              categories[category].profit += revenue - cost;
            }
          });
        }
      });
      
      // Tambahkan data pengeluaran
      if (Array.isArray(expenses)) {
        expenses.forEach(expense => {
          const category = expense.category || 'Pengeluaran Lainnya';
          if (!categories[category]) {
            categories[category] = {
              revenue: 0,
              cost: expense.amount || 0,
              profit: -(expense.amount || 0)
            };
          } else {
            categories[category].cost += expense.amount || 0;
            categories[category].profit -= expense.amount || 0;
          }
        });
      }
      
      // Ubah ke format array untuk chart
      const categoryProfitData = Object.entries(categories).map(([name, data]) => ({
        name,
        revenue: data.revenue,
        cost: data.cost,
        profit: data.profit
      }));
      
      // Hitung total pendapatan, pengeluaran, dan laba
      const totalRevenue = categoryProfitData.reduce((sum, item) => sum + item.revenue, 0);
      const totalCost = categoryProfitData.reduce((sum, item) => sum + item.cost, 0);
      const totalProfit = totalRevenue - totalCost;
      
      const profitData = [
        { name: 'Pendapatan', value: totalRevenue },
        { name: 'Pengeluaran', value: totalCost },
        { name: 'Laba Bersih', value: totalProfit }
      ];
      
      // Data pendapatan dan pengeluaran per bulan
      const revenueData = [
        { name: 'Jan', pendapatan: 45000000, pengeluaran: 30000000 },
        { name: 'Feb', pendapatan: 52000000, pengeluaran: 32000000 },
        { name: 'Mar', pendapatan: 48000000, pengeluaran: 35000000 },
        { name: 'Apr', pendapatan: 55000000, pengeluaran: 33000000 },
        { name: 'Mei', pendapatan: 60000000, pengeluaran: 36000000 },
        { name: 'Jun', pendapatan: 65000000, pengeluaran: 38000000 }
      ];
      
      // Data pengeluaran per kategori
      const expenseCategories = {};
      if (Array.isArray(expenses)) {
        expenses.forEach(expense => {
          const category = expense.category || 'Lainnya';
          if (!expenseCategories[category]) {
            expenseCategories[category] = 0;
          }
          expenseCategories[category] += expense.amount || 0;
        });
      }
      
      const expenseData = Object.entries(expenseCategories).map(([name, value]) => ({
        name,
        value
      }));
      
      // Data tren laba rugi per bulan
      const monthlyTrendData = [
        { name: 'Jan', laba: 15000000 },
        { name: 'Feb', laba: 20000000 },
        { name: 'Mar', laba: 13000000 },
        { name: 'Apr', laba: 22000000 },
        { name: 'Mei', laba: 24000000 },
        { name: 'Jun', laba: 27000000 }
      ];
      
      // Data tren pengeluaran per bulan
      const expenseTrendData = [
        { name: 'Jan', pengeluaran: 30000000 },
        { name: 'Feb', pengeluaran: 32000000 },
        { name: 'Mar', pengeluaran: 35000000 },
        { name: 'Apr', pengeluaran: 33000000 },
        { name: 'Mei', pengeluaran: 36000000 },
        { name: 'Jun', pengeluaran: 38000000 }
      ];
      
      // Interpretasi data
      const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
      const expenseGrowth = expenseTrendData.length > 1 
        ? ((expenseTrendData[expenseTrendData.length - 1].pengeluaran - expenseTrendData[0].pengeluaran) / expenseTrendData[0].pengeluaran) * 100 
        : 0;
      const profitGrowth = monthlyTrendData.length > 1 
        ? ((monthlyTrendData[monthlyTrendData.length - 1].laba - monthlyTrendData[0].laba) / monthlyTrendData[0].laba) * 100 
        : 0;
      
      // Kategori pengeluaran terbesar
      const topExpenseCategory = expenseData.length > 0 
        ? expenseData.reduce((max, item) => item.value > max.value ? item : max, expenseData[0])
        : { name: '', value: 0 };
      
      const interpretation = {
        profitMargin,
        expenseGrowth,
        profitGrowth,
        topExpenseCategory,
        financialHealth: profitMargin > 20 ? 'Sehat' : profitMargin > 10 ? 'Cukup Sehat' : 'Perlu Perhatian',
        expenseTrend: expenseGrowth > 10 ? 'Meningkat Cepat' : expenseGrowth > 5 ? 'Meningkat' : expenseGrowth > 0 ? 'Stabil' : 'Menurun',
        profitTrend: profitGrowth > 15 ? 'Tumbuh Cepat' : profitGrowth > 5 ? 'Tumbuh' : profitGrowth > 0 ? 'Stabil' : 'Menurun'
      };
      
      return { 
        profitData, 
        revenueData, 
        expenseData, 
        categoryProfitData, 
        monthlyTrendData,
        expenseTrendData,
        interpretation
      };
    } catch (err) {
      console.error('Error processing profit data:', err);
      return {
        profitData: [],
        revenueData: [],
        expenseData: [],
        categoryProfitData: [],
        monthlyTrendData: [],
        expenseTrendData: [],
        interpretation: {}
      };
    }
  }, [transactions, products, expenses, timeFilter]);
  
  // Warna untuk chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Analisis Laba Rugi</h2>
          <p className="text-gray-600">Laporan lengkap pendapatan, pengeluaran, dan laba bersih</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center">
            <label className="mr-2 text-sm text-gray-700">Periode:</label>
            <select 
              value={timeFilter}
              onChange={(e) => onTimeFilterChange && onTimeFilterChange(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">Minggu Ini</option>
              <option value="month">Bulan Ini</option>
              <option value="quarter">Kuartal Ini</option>
              <option value="year">Tahun Ini</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <label className="mr-2 text-sm text-gray-700">Kategori:</label>
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Kategori</option>
              <option value="food">Makanan</option>
              <option value="drink">Minuman</option>
              <option value="snack">Snack</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={openAddExpenseModal}
              className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center transition-colors duration-200"
            >
              <FiPlus className="mr-1" />
              Tambah Pengeluaran
            </button>
            
            <button
              onClick={triggerFileInput}
              disabled={importing}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center transition-colors duration-200 disabled:opacity-50"
            >
              {importing ? (
                <>
                  <FiRefreshCw className="mr-1 animate-spin" />
                  Mengimpor...
                </>
              ) : (
                <>
                  <FiUpload className="mr-1" />
                  Import Excel
                </>
              )}
            </button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportExcel}
              accept=".xlsx, .xls"
              className="hidden"
            />
            
            <div className="flex items-center">
              <label className="mr-2 text-sm text-gray-700">Export:</label>
              <select 
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="excel">Excel</option>
                <option value="pdf">PDF</option>
              </select>
              
              <button
                onClick={handleExport}
                disabled={exporting}
                className="ml-2 px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 flex items-center transition-colors duration-200 disabled:opacity-50"
              >
                {exporting ? (
                  <>
                    <FiRefreshCw className="mr-1 animate-spin" />
                    Mengekspor...
                  </>
                ) : (
                  <>
                    {exportFormat === 'excel' ? (
                      <>
                        <FiFileText className="mr-1" />
                        Excel
                      </>
                    ) : (
                      <>
                        <FiPrinter className="mr-1" />
                        PDF
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-50 p-4 rounded-lg border border-green-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Total Pendapatan</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {formatRupiah(profitData.find(item => item.name === 'Pendapatan')?.value || 0)}
              </h3>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <FiTrendingUp className="inline mr-1" />
                +12% dari periode sebelumnya
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FiDollarSign className="text-green-600 text-xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg border border-red-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Total Pengeluaran</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {formatRupiah(profitData.find(item => item.name === 'Pengeluaran')?.value || 0)}
              </h3>
              <p className="text-xs text-red-600 mt-1 flex items-center">
                <FiTrendingUp className="inline mr-1" />
                +5% dari periode sebelumnya
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <FiDollarSign className="text-red-600 text-xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Laba Bersih</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {formatRupiah(profitData.find(item => item.name === 'Laba Bersih')?.value || 0)}
              </h3>
              <p className="text-xs text-blue-600 mt-1 flex items-center">
                <FiTrendingUp className="inline mr-1" />
                +18% dari periode sebelumnya
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FiDollarSign className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Profit/Loss Pie Chart */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
            <FiPieChart className="mr-2 text-blue-600" />
            Perbandingan Pendapatan & Pengeluaran
          </h3>
          <div className="h-80">
            {profitData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={profitData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {profitData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [formatRupiah(value), 'Jumlah']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Tidak ada data laba rugi
              </div>
            )}
          </div>
        </div>
        
        {/* Revenue vs Expense Chart */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
            <FiBarChart2 className="mr-2 text-green-600" />
            Pendapatan vs Pengeluaran
          </h3>
          <div className="h-80">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [formatRupiah(value), 'Jumlah']}
                  />
                  <Legend />
                  <Bar dataKey="pendapatan" name="Pendapatan" fill="#00C49F" />
                  <Bar dataKey="pengeluaran" name="Pengeluaran" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Tidak ada data pendapatan dan pengeluaran
              </div>
            )}
          </div>
        </div>
        
        {/* Expense Breakdown */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
            <FiPieChart className="mr-2 text-red-600" />
            Rincian Pengeluaran
          </h3>
          <div className="h-80">
            {expenseData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [formatRupiah(value), 'Jumlah']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Tidak ada data pengeluaran
              </div>
            )}
          </div>
        </div>
        
        {/* Profit Trend */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
            <FiTrendingUp className="mr-2 text-blue-600" />
            Tren Laba Bersih
          </h3>
          <div className="h-80">
            {monthlyTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [formatRupiah(value), 'Laba']}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="laba" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Tidak ada data tren laba
              </div>
            )}
          </div>
        </div>
        
        {/* Expense Trend */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
            <FiTrendingUp className="mr-2 text-red-600" />
            Tren Pengeluaran
          </h3>
          <div className="h-80">
            {expenseTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={expenseTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [formatRupiah(value), 'Pengeluaran']}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="pengeluaran" 
                    stroke="#FF8042" 
                    fill="#FF8042" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Tidak ada data tren pengeluaran
              </div>
            )}
          </div>
        </div>
        
        {/* Combined Trend Chart */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
            <FiBarChart2 className="mr-2 text-purple-600" />
            Perbandingan Tren Pendapatan & Pengeluaran
          </h3>
          <div className="h-80">
            {revenueData.length > 0 && expenseTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData.map((rev, index) => ({
                  name: rev.name,
                  pendapatan: rev.pendapatan,
                  pengeluaran: expenseTrendData[index]?.pengeluaran || 0
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [formatRupiah(value), 'Jumlah']}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="pendapatan" 
                    stroke="#00C49F" 
                    activeDot={{ r: 8 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pengeluaran" 
                    stroke="#FF8042" 
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Tidak ada data tren untuk dibandingkan
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Expense List */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center text-gray-800">
            <FiBarChart2 className="mr-2 text-purple-600" />
            Daftar Pengeluaran
          </h3>
        </div>
        <div className="overflow-x-auto">
          {expenses.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                  <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                  <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                  <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {expenses.map((expense, index) => (
                  <tr key={expense.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="p-3 text-sm text-gray-900">{expense.date}</td>
                    <td className="p-3 text-sm text-gray-900">{expense.category}</td>
                    <td className="p-3 text-sm text-gray-900">{expense.description}</td>
                    <td className="p-3 text-sm font-medium text-gray-900">{formatRupiah(expense.amount)}</td>
                    <td className="p-3 text-sm">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => openEditExpenseModal(expense)}
                          className="p-1 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-100 transition-colors duration-200"
                          title="Edit"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button 
                          onClick={() => onDeleteExpense && onDeleteExpense(expense.id)}
                          className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-100 transition-colors duration-200"
                          title="Hapus"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FiAlertCircle className="mx-auto text-gray-400 mb-2" size={24} />
              <p>Tidak ada data pengeluaran</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Interpretasi Section */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
          <FiInfo className="mr-2 text-blue-600" />
          Interpretasi Keuangan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h4 className="font-medium mb-3 flex items-center text-gray-800">
              <FiDollarSign className="mr-2 text-blue-600" />
              Kinerja Keuangan
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-blue-100">
                <span className="text-gray-700">Margin Laba:</span>
                <span className={`font-medium ${interpretation.profitMargin > 15 ? 'text-green-600' : interpretation.profitMargin > 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {interpretation.profitMargin.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-blue-100">
                <span className="text-gray-700">Tren Laba:</span>
                <span className={`font-medium ${interpretation.profitTrend.includes('Tumbuh') ? 'text-green-600' : interpretation.profitTrend.includes('Stabil') ? 'text-yellow-600' : 'text-red-600'}`}>
                  {interpretation.profitTrend}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-blue-100">
                <span className="text-gray-700">Tren Pengeluaran:</span>
                <span className={`font-medium ${interpretation.expenseTrend.includes('Menurun') ? 'text-green-600' : interpretation.expenseTrend.includes('Stabil') ? 'text-yellow-600' : 'text-red-600'}`}>
                  {interpretation.expenseTrend}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Kesehatan Keuangan:</span>
                <span className={`font-medium ${interpretation.financialHealth === 'Sehat' ? 'text-green-600' : interpretation.financialHealth === 'Cukup Sehat' ? 'text-yellow-600' : 'text-red-600'}`}>
                  {interpretation.financialHealth}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
            <h4 className="font-medium mb-3 flex items-center text-gray-800">
              <FiAlertCircle className="mr-2 text-yellow-600" />
              Analisis & Rekomendasi
            </h4>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className={`mt-1 mr-3 flex-shrink-0 ${interpretation.profitMargin > 15 ? 'text-green-500' : interpretation.profitMargin > 10 ? 'text-yellow-500' : 'text-red-500'}`}>
                  <FiCheckCircle size={18} />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Margin Laba</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {interpretation.profitMargin > 15 
                      ? 'Margin laba Anda sangat baik. Pertahankan efisiensi operasional.'
                      : interpretation.profitMargin > 10 
                      ? 'Margin laba Anda cukup baik. Ada ruang untuk peningkatan.'
                      : 'Margin laba Anda rendah. Perlu evaluasi pengeluaran dan strategi harga.'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className={`mt-1 mr-3 flex-shrink-0 ${interpretation.expenseTrend.includes('Menurun') ? 'text-green-500' : interpretation.expenseTrend.includes('Stabil') ? 'text-yellow-500' : 'text-red-500'}`}>
                  <FiCheckCircle size={18} />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Tren Pengeluaran</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {interpretation.expenseTrend.includes('Menurun') 
                      ? 'Pengeluaran Anda menurun. Kontrol pengeluaran Anda efektif.'
                      : interpretation.expenseTrend.includes('Stabil') 
                      ? 'Pengeluaran Anda stabil. Pertahankan kontrol pengeluaran.'
                      : 'Pengeluaran Anda meningkat. Perlu evaluasi dan kontrol pengeluaran.'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mt-1 mr-3 flex-shrink-0 text-blue-500">
                  <FiInfo size={18} />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Kategori Pengeluaran Terbesar</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {interpretation.topExpenseCategory.name 
                      ? `Kategori pengeluaran terbesar adalah ${interpretation.topExpenseCategory.name}. ${interpretation.topExpenseCategory.name === 'Bahan Baku' 
                          ? 'Fokus pada negosiasi dengan pemasok atau efisiensi penggunaan bahan baku.' 
                          : 'Pertimbangkan untuk mengoptimalkan pengeluaran di kategori ini.'}`
                      : 'Tidak ada data pengeluaran untuk dianalisis.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal Tambah/Edit Pengeluaran */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {editingExpense ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}
                </h3>
                <button 
                  onClick={() => {
                    setShowExpenseModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 p-1 transition-colors duration-200"
                >
                  <FiX size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori
                  </label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Kategori</option>
                    <option value="Bahan Baku">Bahan Baku</option>
                    <option value="Tenaga Kerja">Tenaga Kerja</option>
                    <option value="Sewa">Sewa</option>
                    <option value="Listrik & Air">Listrik & Air</option>
                    <option value="Pemasaran">Pemasaran</option>
                    <option value="Transportasi">Transportasi</option>
                    <option value="Pajak">Pajak</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi
                  </label>
                  <input
                    type="text"
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Deskripsi pengeluaran"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jumlah (Rp)
                  </label>
                  <input
                    type="number"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowExpenseModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmitExpense}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors duration-200"
                >
                  <FiSave className="mr-2" />
                  {editingExpense ? 'Update' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisProfit;