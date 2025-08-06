'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const TableContext = createContext();

export function TableProvider({ children }) {
  // Initial state
  const initialTables = [
    { id: 1, number: 'A1', capacity: 4, status: 'available', bookingInfo: null },
    { id: 2, number: 'A2', capacity: 6, status: 'available', bookingInfo: null },
    { id: 3, number: 'B1', capacity: 2, status: 'available', bookingInfo: null },
    { id: 4, number: 'B2', capacity: 8, status: 'available', bookingInfo: null },
  ];

  // State management
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [activeBills, setActiveBills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedTables = JSON.parse(localStorage.getItem('tables')) || initialTables;
        const savedBills = JSON.parse(localStorage.getItem('activeBills')) || [];
        const savedSelected = JSON.parse(localStorage.getItem('selectedTable'));
        setTables(savedTables);
        setActiveBills(savedBills);
        if (savedSelected) setSelectedTable(savedSelected);
      } catch (err) {
        console.error("Failed to load data:", err);
        setTables(initialTables);
        setError("Gagal memuat data meja");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Persist data
  useEffect(() => {
    try {
      localStorage.setItem('tables', JSON.stringify(tables));
      localStorage.setItem('activeBills', JSON.stringify(activeBills));
      if (selectedTable) {
        localStorage.setItem('selectedTable', JSON.stringify(selectedTable));
      }
    } catch (err) {
      console.error("Failed to save data:", err);
    }
  }, [tables, activeBills, selectedTable]);

  // Validate table data
  const validateTable = (table) => {
    if (!table?.number || typeof table.capacity !== 'number') {
      throw new Error("Data meja tidak valid");
    }
    return true;
  };

  // Add new table
  const addTable = useCallback((newTable) => {
    try {
      validateTable(newTable);
      
      if (tables.some(t => t.number === newTable.number)) {
        throw new Error(`Meja ${newTable.number} sudah ada`);
      }
      const tableToAdd = {
        ...newTable,
        id: Date.now(),
        status: 'available',
        bookingInfo: null
      };
      setTables(prev => [...prev, tableToAdd]);
      return tableToAdd;
    } catch (err) {
      console.error("Add table error:", err);
      setError(err.message);
      throw err;
    }
  }, [tables]);

  // Update table
  const updateTable = useCallback((id, updatedData) => {
    try {
      validateTable(updatedData);
      
      setTables(prev =>
        prev.map(table =>
          table.id === id ? { ...table, ...updatedData } : table
        )
      );
      return true;
    } catch (err) {
      console.error("Update table error:", err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Delete table
  const deleteTable = useCallback((id) => {
    try {
      setTables(prev => prev.filter(table => table.id !== id));
      setActiveBills(prev => prev.filter(bill => bill.table.id !== id));
      
      if (selectedTable?.id === id) {
        setSelectedTable(null);
      }
      return true;
    } catch (err) {
      console.error("Delete table error:", err);
      setError(err.message);
      throw err;
    }
  }, [selectedTable]);

  // Update table status
  const updateTableStatus = useCallback((tableId, status, bookingInfo = null) => {
    try {
      setTables(prev =>
        prev.map(table =>
          table.id === tableId
            ? { ...table, status, bookingInfo }
            : table
        )
      );
      return true;
    } catch (err) {
      console.error("Update status error:", err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Validate bill data - IMPROVED
  const validateBill = (bill) => {
    console.log("Validating bill:", bill); // Tambahkan logging untuk debugging
    
    if (!bill?.table?.id) {
      console.error("Invalid table in bill:", bill);
      throw new Error("Meja tidak valid");
    }
    
    // Perbaiki pengecekan untuk items dengan pesan error lebih jelas
    if (!bill.items) {
      console.error("Bill items is undefined or null:", bill);
      throw new Error("Items tidak ditemukan dalam bill");
    }
    
    if (!Array.isArray(bill.items)) {
      console.error("Bill items is not an array:", bill.items, typeof bill.items);
      throw new Error("Format items tidak valid, harap berikan array");
    }
    
    // Jika items kosong, kita bisa mengembalikan false alih-alih melempar error
    // Ini akan memungkinkan komponen pemanggil untuk menangani kasus ini
    if (bill.items.length === 0) {
      console.warn("Bill items is empty");
      return false;
    }
    
    bill.items.forEach((item, index) => {
      if (!item) {
        console.error(`Item ${index + 1} is null or undefined`);
        throw new Error(`Item ${index + 1}: Data tidak valid`);
      }
      
      if (!item.name && !item.id) {
        console.error(`Item ${index + 1} missing name and ID:`, item);
        throw new Error(`Item ${index + 1}: Nama atau ID tidak valid`);
      }
      
      const price = Number(item.price);
      if (isNaN(price)) {
        console.error(`Item ${index + 1} has invalid price:`, item.price);
        throw new Error(`Item ${index + 1}: Harga tidak valid`);
      }
      
      const quantity = Number(item.quantity);
      if (isNaN(quantity)) {
        console.error(`Item ${index + 1} has invalid quantity:`, item.quantity);
        throw new Error(`Item ${index + 1}: Jumlah tidak valid`);
      }
    });
    
    return true;
  };

  // Add active bill (Hold Bill) - IMPROVED
  const addActiveBill = useCallback((bill) => {
    try {
      console.log("Adding active bill:", bill); // Tambahkan logging untuk debugging
      
      // Pastikan bill memiliki struktur yang benar sebelum validasi
      const normalizedBill = {
        ...bill,
        items: Array.isArray(bill.items) ? bill.items : []
      };
      
      // Validasi bill, tetapi tangani kasus ketika items kosong
      const isValid = validateBill(normalizedBill);
      
      // Jika items kosong, kembalikan bill tanpa menyimpannya
      if (!isValid) {
        console.warn("Cannot add bill with empty items");
        return {
          ...normalizedBill,
          id: Date.now(),
          createdAt: new Date().toISOString(),
          subtotal: 0,
          tax: 0,
          total: 0,
          paymentStatus: 'draft',
          items: []
        };
      }
      
      const subtotal = normalizedBill.items.reduce((sum, item) => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 1;
        return sum + (price * quantity);
      }, 0);
      
      const tax = subtotal * 0.1;
      const total = subtotal + tax;
      const newBill = {
        ...normalizedBill,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        subtotal,
        tax,
        total,
        paymentStatus: 'hold',
        items: normalizedBill.items.map(item => ({
          id: item.id || Date.now().toString(),
          name: item.name || 'Produk tanpa nama',
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          notes: item.notes || '',
          subtotal: (Number(item.price) || 0) * (Number(item.quantity) || 1)
        }))
      };
      
      setActiveBills(prev => [
        ...prev.filter(b => b.table.id !== normalizedBill.table.id),
        newBill
      ]);
      
      updateTableStatus(normalizedBill.table.id, 'occupied');
      return newBill;
    } catch (err) {
      console.error("Add active bill error:", err);
      setError(err.message);
      throw err;
    }
  }, [updateTableStatus]);

  // Remove active bill
  const removeActiveBill = useCallback((tableId) => {
    try {
      setActiveBills(prev => prev.filter(bill => bill.table.id !== tableId));
      updateTableStatus(tableId, 'available');
      return true;
    } catch (err) {
      console.error("Remove active bill error:", err);
      setError(err.message);
      throw err;
    }
  }, [updateTableStatus]);

  // Add booking
  const addBooking = useCallback((booking) => {
    try {
      if (!booking.tableId || !booking.customerName || !booking.bookingTime) {
        throw new Error("Data booking tidak lengkap");
      }
      const bookingInfo = {
        customerName: booking.customerName.trim(),
        phone: booking.phone || '',
        email: booking.email || '',
        bookingTime: booking.bookingTime,
        people: booking.people || 2,
        notes: booking.notes || '',
        bookingDate: new Date().toISOString()
      };
      updateTableStatus(booking.tableId, 'booked', bookingInfo);
      return true;
    } catch (err) {
      console.error("Add booking error:", err);
      setError(err.message);
      throw err;
    }
  }, [updateTableStatus]);

  // Cancel booking
  const cancelBooking = useCallback((tableId) => {
    try {
      updateTableStatus(tableId, 'available');
      return true;
    } catch (err) {
      console.error("Cancel booking error:", err);
      setError(err.message);
      throw err;
    }
  }, [updateTableStatus]);

  // Get table by ID
  const getTableById = useCallback((id) => {
    return tables.find(table => table.id === id) || null;
  }, [tables]);

  // Complete payment
  const completePayment = useCallback((billId, paymentData) => {
    try {
      if (!paymentData?.amount || !paymentData?.method) {
        throw new Error("Data pembayaran tidak lengkap");
      }
      setActiveBills(prev =>
        prev.map(bill =>
          bill.id === billId
            ? {
                ...bill,
                paymentStatus: 'paid',
                paymentMethod: paymentData.method,
                paymentAmount: paymentData.amount,
                change: paymentData.amount - bill.total,
                paidAt: new Date().toISOString()
              }
            : bill
        )
      );
      const bill = activeBills.find(b => b.id === billId);
      if (bill) {
        updateTableStatus(bill.table.id, 'available');
      }
      return true;
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message);
      throw err;
    }
  }, [activeBills, updateTableStatus]);

  // Context value
  const contextValue = {
    tables,
    selectedTable,
    setSelectedTable,
    activeBills,
    isLoading,
    error,
    setError,
    addTable,
    updateTable,
    deleteTable,
    updateTableStatus,
    addBooking,
    cancelBooking,
    addActiveBill,
    removeActiveBill,
    getTableById,
    completePayment
  };

  return (
    <TableContext.Provider value={contextValue}>
      {children}
    </TableContext.Provider>
  );
}

export const useTables = () => {
  const context = useContext(TableContext);
  if (context === undefined) {
    throw new Error('useTables must be used within a TableProvider');
  }
  return context;
};