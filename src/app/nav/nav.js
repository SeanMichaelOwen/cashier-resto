'use client';
import React from 'react';
import { FiShoppingCart, FiPackage, FiUsers, FiDollarSign, FiX } from 'react-icons/fi';

const Sidebar = ({ sidebarOpen, setSidebarOpen, activeTab, setActiveTab }) => {
  return (
    <div 
      className={`fixed inset-y-0 left-0 z-30 bg-indigo-800 text-white w-64 transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
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
      
      <nav className="mt-5">
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
  );
};

export default Sidebar;