'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

const ActiveBillsContext = createContext();

export const useActiveBills = () => {
  return useContext(ActiveBillsContext);
};

export const ActiveBillsProvider = ({ children }) => {
  const [activeBills, setActiveBillsState] = useState([]);
  
  // Load from localStorage on mount
  useEffect(() => {
    const savedBills = localStorage.getItem('activeBills');
    if (savedBills) {
      try {
        setActiveBillsState(JSON.parse(savedBills));
      } catch (error) {
        console.error('Failed to parse active bills from localStorage:', error);
      }
    }
  }, []);
  
  // Save to localStorage whenever activeBills changes
  useEffect(() => {
    localStorage.setItem('activeBills', JSON.stringify(activeBills));
  }, [activeBills]);
  
  const addActiveBill = (billData) => {
    const newBill = {
      ...billData,
      id: billData.id || `bill-${Date.now()}`,
      createdAt: billData.createdAt || new Date().toISOString()
    };
    
    setActiveBillsState(prev => [...prev, newBill]);
    return newBill;
  };
  
  const updateActiveBill = (billData) => {
    setActiveBillsState(prev => 
      prev.map(bill => bill.id === billData.id ? billData : bill)
    );
    return billData;
  };
  
  const removeActiveBill = (tableId) => {
    setActiveBillsState(prev => prev.filter(bill => bill.table?.id !== tableId));
  };
  
  const getActiveBillByTableId = (tableId) => {
    return activeBills.find(bill => bill.table?.id === tableId);
  };
  
  return (
    <ActiveBillsContext.Provider value={{
      activeBills,
      addActiveBill,
      updateActiveBill,
      removeActiveBill,
      getActiveBillByTableId
    }}>
      {children}
    </ActiveBillsContext.Provider>
  );
};