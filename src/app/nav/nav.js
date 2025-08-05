'use client';
import React, { useState } from 'react';
import { 
  FiShoppingCart, FiPackage, FiUsers, FiDollarSign, 
  FiX, FiBarChart2, FiTrendingUp, FiTruck, 
  FiSmartphone, FiChevronDown, FiChevronRight,
  FiGrid, FiHome, FiSettings, FiLogOut, FiCreditCard,
  FiUser
} from 'react-icons/fi';

const Sidebar = ({ sidebarOpen, setSidebarOpen, activeTab, setActiveTab }) => {
  const [expandedMenus, setExpandedMenus] = useState({
    analysis: false,
    integrations: false,
    management: false
  });

  const toggleMenu = (menu) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const mainMenuItems = [
    { id: 'dashboard', icon: <FiHome />, label: 'Dashboard' },
    { id: 'pos', icon: <FiShoppingCart />, label: 'Point of Sale' },
    { id: 'products', icon: <FiPackage />, label: 'Produk' },
    { id: 'customers', icon: <FiUser />, label: 'Pelanggan' },
    { id: 'tables', icon: <FiGrid />, label: 'Meja' },
    { id: 'transactions', icon: <FiCreditCard />, label: 'Transaksi' }
  ];

  const analysisSubItems = [
    { id: 'analysis-sales', icon: <FiTrendingUp />, label: 'Penjualan' },
    { id: 'analysis-inventory', icon: <FiPackage />, label: 'Persediaan' },
    { id: 'analysis-profit', icon: <FiDollarSign />, label: 'Laba Rugi' },
    { id: 'analysis-trending', icon: <FiTrendingUp />, label: 'Trending' }
  ];

  const integrationSubItems = [
    { id: 'integration-grab', icon: <FiSmartphone />, label: 'Grab' },
    { id: 'integration-gojek', icon: <FiSmartphone />, label: 'Gojek' },
    { id: 'integration-shopee', icon: <FiSmartphone />, label: 'ShopeeFood' }
  ];

  const managementSubItems = [
    { id: 'management-users', icon: <FiUsers />, label: 'Pengguna' },
    { id: 'management-roles', icon: <FiSettings />, label: 'Peran' },
    { id: 'management-settings', icon: <FiSettings />, label: 'Pengaturan' }
  ];

  const isActive = (tabId) => activeTab === tabId;
  const isSubmenuActive = (prefix) => activeTab.startsWith(prefix);

  return (
    <div className={`fixed inset-y-0 left-0 z-30 bg-indigo-800 text-white w-64 transition-all duration-300 ease-in-out shadow-xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-indigo-700">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 w-10 h-10 rounded-lg flex items-center justify-center">
            <FiShoppingCart size={20} />
          </div>
          <h1 className="text-xl font-bold">KasirPro</h1>
        </div>
        <button 
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1 rounded-full hover:bg-indigo-700 transition-colors"
        >
          <FiX size={20} />
        </button>
      </div>
      
      {/* Scrollable Content */}
      <div className="h-[calc(100vh-120px)] overflow-y-auto">
        <nav className="p-2 space-y-1">
          {/* Main Menu Items */}
          {mainMenuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                isActive(item.id) 
                  ? 'bg-indigo-700 text-white shadow-md' 
                  : 'text-indigo-100 hover:bg-indigo-700/50'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}

          {/* Analysis Dropdown */}
          <div className="mt-2">
            <button
              onClick={() => toggleMenu('analysis')}
              className={`flex items-center justify-between w-full p-3 rounded-lg transition-colors ${
                isSubmenuActive('analysis') 
                  ? 'bg-indigo-700 text-white' 
                  : 'text-indigo-100 hover:bg-indigo-700/50'
              }`}
            >
              <div className="flex items-center">
                <FiBarChart2 className="mr-3" />
                <span className="font-medium">Analisis</span>
              </div>
              {expandedMenus.analysis ? (
                <FiChevronDown className="text-sm" />
              ) : (
                <FiChevronRight className="text-sm" />
              )}
            </button>

            {expandedMenus.analysis && (
              <div className="ml-6 mt-1 space-y-1">
                {analysisSubItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center w-full p-2 pl-4 rounded-lg text-sm transition-colors ${
                      isActive(item.id)
                        ? 'bg-indigo-600/80 text-white'
                        : 'text-indigo-100 hover:bg-indigo-700/30'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Integrations Dropdown */}
          <div className="mt-1">
            <button
              onClick={() => toggleMenu('integrations')}
              className={`flex items-center justify-between w-full p-3 rounded-lg transition-colors ${
                isSubmenuActive('integration') 
                  ? 'bg-indigo-700 text-white' 
                  : 'text-indigo-100 hover:bg-indigo-700/50'
              }`}
            >
              <div className="flex items-center">
                <FiTruck className="mr-3" />
                <span className="font-medium">Integrasi</span>
              </div>
              {expandedMenus.integrations ? (
                <FiChevronDown className="text-sm" />
              ) : (
                <FiChevronRight className="text-sm" />
              )}
            </button>

            {expandedMenus.integrations && (
              <div className="ml-6 mt-1 space-y-1">
                {integrationSubItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center w-full p-2 pl-4 rounded-lg text-sm transition-colors ${
                      isActive(item.id)
                        ? 'bg-indigo-600/80 text-white'
                        : 'text-indigo-100 hover:bg-indigo-700/30'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Management Dropdown */}
          <div className="mt-1">
            <button
              onClick={() => toggleMenu('management')}
              className={`flex items-center justify-between w-full p-3 rounded-lg transition-colors ${
                isSubmenuActive('management') 
                  ? 'bg-indigo-700 text-white' 
                  : 'text-indigo-100 hover:bg-indigo-700/50'
              }`}
            >
              <div className="flex items-center">
                <FiSettings className="mr-3" />
                <span className="font-medium">Manajemen</span>
              </div>
              {expandedMenus.management ? (
                <FiChevronDown className="text-sm" />
              ) : (
                <FiChevronRight className="text-sm" />
              )}
            </button>

            {expandedMenus.management && (
              <div className="ml-6 mt-1 space-y-1">
                {managementSubItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center w-full p-2 pl-4 rounded-lg text-sm transition-colors ${
                      isActive(item.id)
                        ? 'bg-indigo-600/80 text-white'
                        : 'text-indigo-100 hover:bg-indigo-700/30'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 w-full p-4 border-t border-indigo-700 bg-indigo-800">
        <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
            <FiUser size={16} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-indigo-300">Super Admin</p>
          </div>
          <button className="text-indigo-300 hover:text-white">
            <FiLogOut size={16} />
          </button>
        </div>
        <div className="mt-2 text-xs text-indigo-300 text-center">
          KasirPro v2.1.0 © 2023
        </div>
      </div>
    </div>
  );
};

export default Sidebar;