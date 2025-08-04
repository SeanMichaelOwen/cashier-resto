'use client';
import React, { useState } from 'react';
import { 
  FiShoppingCart, 
  FiPackage, 
  FiUsers, 
  FiDollarSign, 
  FiX, 
  FiBarChart2, 
  FiTrendingUp, 
  FiTruck, 
  FiSmartphone, 
  FiChevronDown, 
  FiChevronRight,
  FiGrid
} from 'react-icons/fi';

const Sidebar = ({ sidebarOpen, setSidebarOpen, activeTab, setActiveTab }) => {
  const [expandedMenus, setExpandedMenus] = useState({
    analysis: false,
    integrations: false
  });

  const toggleMenu = (menu) => {
    setExpandedMenus({
      ...expandedMenus,
      [menu]: !expandedMenus[menu]
    });
  };

  return (
    <div 
      className={`fixed inset-y-0 left-0 z-30 bg-indigo-800 text-white w-64 transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Header Section */}
      <div className="p-5 flex items-center justify-between border-b border-indigo-700">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 w-10 h-10 rounded-full flex items-center justify-center">
            <FiShoppingCart size={20} />
          </div>
          <h1 className="text-xl font-bold">Kasir Pro</h1>
        </div>
        <button 
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden"
        >
          <FiX size={24} />
        </button>
      </div>
      
      {/* Scrollable Navigation - Perubahan utama di sini */}
      <div className="flex flex-col h-[calc(100vh-120px)]"> {/* Menggunakan viewport height */}
        <nav className="flex-1 overflow-y-auto"> {/* flex-1 dan overflow-y-auto untuk scrolling */}
          <button 
            onClick={() => setActiveTab('pos')}
            className={`flex items-center w-full p-4 text-left ${
              activeTab === 'pos' ? 'bg-indigo-700' : 'hover:bg-indigo-700'
            }`}
          >
            <FiShoppingCart className="mr-3" />
            Point of Sale
          </button>
          
          <button 
            onClick={() => setActiveTab('products')}
            className={`flex items-center w-full p-4 text-left ${
              activeTab === 'products' ? 'bg-indigo-700' : 'hover:bg-indigo-700'
            }`}
          >
            <FiPackage className="mr-3" />
            Produk
          </button>
          
          <button 
            onClick={() => setActiveTab('customers')}
            className={`flex items-center w-full p-4 text-left ${
              activeTab === 'customers' ? 'bg-indigo-700' : 'hover:bg-indigo-700'
            }`}
          >
            <FiUsers className="mr-3" />
            Pelanggan
          </button>

          <button 
            onClick={() => setActiveTab('tables')}
            className={`flex items-center w-full p-4 text-left ${
              activeTab === 'tables' ? 'bg-indigo-700' : 'hover:bg-indigo-700'
            }`}
          >
            <FiGrid className="mr-3" />
            Manajemen Meja
          </button>
          
          <div className="relative">
            <button 
              onClick={() => toggleMenu('analysis')}
              className={`flex items-center justify-between w-full p-4 text-left ${
                activeTab.startsWith('analysis-') ? 'bg-indigo-700' : 'hover:bg-indigo-700'
              }`}
            >
              <div className="flex items-center">
                <FiBarChart2 className="mr-3" />
                Analisis Produk
              </div>
              {expandedMenus.analysis ? <FiChevronDown /> : <FiChevronRight />}
            </button>
            
            {expandedMenus.analysis && (
              <div className="ml-8 mt-1 space-y-1">
                <button 
                  onClick={() => setActiveTab('analysis-sales')}
                  className={`flex items-center w-full p-3 text-left rounded-lg ${
                    activeTab === 'analysis-sales' ? 'bg-indigo-700' : 'hover:bg-indigo-700'
                  }`}
                >
                  <FiTrendingUp className="mr-3" />
                  Analisis Penjualan
                </button>
                
                <button 
                  onClick={() => setActiveTab('analysis-inventory')}
                  className={`flex items-center w-full p-3 text-left rounded-lg ${
                    activeTab === 'analysis-inventory' ? 'bg-indigo-700' : 'hover:bg-indigo-700'
                  }`}
                >
                  <FiPackage className="mr-3" />
                  Analisis Persediaan
                </button>
                
                <button 
                  onClick={() => setActiveTab('analysis-profit')}
                  className={`flex items-center w-full p-3 text-left rounded-lg ${
                    activeTab === 'analysis-profit' ? 'bg-indigo-700' : 'hover:bg-indigo-700'
                  }`}
                >
                  <FiDollarSign className="mr-3" />
                  Analisis Laba Rugi
                </button>
                
                <button 
                  onClick={() => setActiveTab('analysis-trending')}
                  className={`flex items-center w-full p-3 text-left rounded-lg ${
                    activeTab === 'analysis-trending' ? 'bg-indigo-700' : 'hover:bg-indigo-700'
                  }`}
                >
                  <FiTrendingUp className="mr-3" />
                  Produk Trending
                </button>
              </div>
            )}
          </div>
          
          <div className="relative">
            <button 
              onClick={() => toggleMenu('integrations')}
              className={`flex items-center justify-between w-full p-4 text-left ${
                activeTab.startsWith('integration-') ? 'bg-indigo-700' : 'hover:bg-indigo-700'
              }`}
            >
              <div className="flex items-center">
                <FiTruck className="mr-3" />
                Integrasi
              </div>
              {expandedMenus.integrations ? <FiChevronDown /> : <FiChevronRight />}
            </button>
            
            {expandedMenus.integrations && (
              <div className="ml-8 mt-1 space-y-1">
                <button 
                  onClick={() => setActiveTab('integration-grab')}
                  className={`flex items-center w-full p-3 text-left rounded-lg ${
                    activeTab === 'integration-grab' ? 'bg-indigo-700' : 'hover:bg-indigo-700'
                  }`}
                >
                  <FiSmartphone className="mr-3" />
                  Grab
                </button>
                
                <button 
                  onClick={() => setActiveTab('integration-gojek')}
                  className={`flex items-center w-full p-3 text-left rounded-lg ${
                    activeTab === 'integration-gojek' ? 'bg-indigo-700' : 'hover:bg-indigo-700'
                  }`}
                >
                  <FiSmartphone className="mr-3" />
                  Gojek
                </button>
                
                <button 
                  onClick={() => setActiveTab('integration-shopee')}
                  className={`flex items-center w-full p-3 text-left rounded-lg ${
                    activeTab === 'integration-shopee' ? 'bg-indigo-700' : 'hover:bg-indigo-700'
                  }`}
                >
                  <FiSmartphone className="mr-3" />
                  ShopeeFood
                </button>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setActiveTab('reports')}
            className={`flex items-center w-full p-4 text-left ${
              activeTab === 'reports' ? 'bg-indigo-700' : 'hover:bg-indigo-700'
            }`}
          >
            <FiDollarSign className="mr-3" />
            Laporan Penjualan
          </button>
        </nav>
      </div>

      {/* Footer Section (non-scrollable) */}
      <div className="absolute bottom-0 w-full pt-4 border-t border-indigo-700 bg-indigo-800">
        <div className="px-4 py-3 text-xs text-indigo-300">
          <p>Kasir Pro v2.0.1</p>
          <p className="mt-1">© 2023 PT. Teknologi Kasir Indonesia</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;