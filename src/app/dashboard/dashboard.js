'use client';
import React, { useState, Suspense } from 'react';
import { 
  FiMenu, FiSearch, FiBell, FiUser, FiShoppingCart,
  FiPackage, FiUsers, FiGrid, FiDollarSign, FiBarChart2,
  FiHome, FiTrendingUp, FiCreditCard
} from 'react-icons/fi';
import Sidebar from '../nav/nav';
import LoadingSpinner from '../components/LoadingSpinner';
import { useProducts } from '../context/ProductContext';

// Dynamic imports
const ProductTable = React.lazy(() => import('../components/ProductTable'));
const CustomerCard = React.lazy(() => import('../components/CustomerCard'));
const ReportCard = React.lazy(() => import('../components/ReportCard'));
const SalesChart = React.lazy(() => import('../components/SalesChart'));
const AnalysisProfit = React.lazy(() => import('../components/analisis/AnalysisProfit'));
const TableManagement = React.lazy(() => import('../components/TableManagement'));
const PointOfSale = React.lazy(() => import('../components/PointOfSale'));

export default function Dashboard() {
  const { isLoaded } = useProducts();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isLoaded) {
    return <LoadingSpinner fullScreen />;
  }

  // Render active tab content
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-6">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Suspense fallback={<LoadingSpinner />}>
                <ReportCard 
                  title="Total Penjualan"
                  value="Rp 12.450.000"
                  icon={<FiDollarSign size={24} />}
                  trend="up"
                />
                <ReportCard 
                  title="Pelanggan Baru"
                  value="24"
                  icon={<FiUsers size={24} />}
                  trend="up"
                />
                <ReportCard 
                  title="Produk Terjual"
                  value="156"
                  icon={<FiPackage size={24} />}
                  trend="stable"
                />
                <ReportCard 
                  title="Meja Terisi"
                  value="8/12"
                  icon={<FiGrid size={24} />}
                  trend="down"
                />
              </Suspense>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium mb-4">Grafik Penjualan</h3>
              <Suspense fallback={<LoadingSpinner />}>
                <SalesChart />
              </Suspense>
            </div>
          </div>
        );

      case 'pos':
        return (
          <div className="bg-white rounded-lg shadow">
            <Suspense fallback={<LoadingSpinner />}>
              <PointOfSale />
            </Suspense>
          </div>
        );

      case 'products':
        return (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-6">Manajemen Produk</h2>
            <Suspense fallback={<LoadingSpinner />}>
              <ProductTable />
            </Suspense>
          </div>
        );

      case 'customers':
        return (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-6">Manajemen Pelanggan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Suspense fallback={<LoadingSpinner />}>
                <CustomerCard 
                  title="Total Pelanggan"
                  value={125}
                  icon={<FiUsers size={24} />}
                />
                <CustomerCard 
                  title="Pelanggan Baru (Bulan Ini)"
                  value={15}
                  icon={<FiUser size={24} />}
                />
                <CustomerCard 
                  title="Pelanggan Aktif"
                  value={89}
                  icon={<FiTrendingUp size={24} />}
                />
              </Suspense>
            </div>
          </div>
        );

      case 'tables':
        return (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-6">Manajemen Meja</h2>
            <Suspense fallback={<LoadingSpinner />}>
              <TableManagement />
            </Suspense>
          </div>
        );

      case 'analysis':
        return (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-6">Analisis Bisnis</h2>
            <Suspense fallback={<LoadingSpinner />}>
              <AnalysisProfit />
            </Suspense>
          </div>
        );

      case 'reports':
        return (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-6">Laporan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Suspense fallback={<LoadingSpinner />}>
                <ReportCard 
                  title="Laporan Harian"
                  value="Download"
                  icon={<FiCreditCard size={24} />}
                  action
                />
                <ReportCard 
                  title="Laporan Bulanan"
                  value="Download"
                  icon={<FiBarChart2 size={24} />}
                  action
                />
              </Suspense>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-6">Modul Dashboard</h2>
            <p>Pilih modul dari menu sidebar untuk melihat tampilan</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden mr-4 text-gray-600"
              >
                <FiMenu size={24} />
              </button>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari..."
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={activeTab === 'pos'}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {activeTab === 'pos' && (
                <div className="flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                  <FiShoppingCart className="mr-2" />
                  <span>POS Mode</span>
                </div>
              )}
              
              <button className="relative p-2 text-gray-600 hover:text-indigo-600">
                <FiBell size={20} />
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </button>
              
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <FiUser size={18} />
                </div>
                <span className="ml-2 font-medium">Admin</span>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 bg-gray-100">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
}