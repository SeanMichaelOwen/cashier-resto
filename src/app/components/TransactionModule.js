'use client';
import React, { useState } from 'react';
import PaymentSection from '../components/PaymentSection';
import TableManagement from '../components/TableManagement';

const TransactionModule = () => {
  const [currentTable, setCurrentTable] = useState(null);
  const [cart, setCart] = useState([]);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [change, setChange] = useState(0);
  const [total, setTotal] = useState(0);
  const [tables, setTables] = useState([
    { id: 1, number: 'A1', capacity: 4, status: 'available', location: 'indoor' },
    { id: 2, number: 'A2', capacity: 6, status: 'available', location: 'indoor' },
    { id: 3, number: 'B1', capacity: 2, status: 'available', location: 'outdoor' },
    { id: 4, number: 'VIP1', capacity: 8, status: 'available', location: 'vip' },
  ]);
  
  // Function to handle table selection
  const handleTableSelect = (table) => {
    setCurrentTable(table);
  };
  
  // Function to handle table status change
  const handleTableStatusChange = (tableId, newStatus) => {
    setTables(prevTables => 
      prevTables.map(table => 
        table.id === tableId ? { ...table, status: newStatus } : table
      )
    );
  };
  
  // Function to add item to cart
  const handleAddToCart = (item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };
  
  // Function to remove item from cart
  const handleRemoveItem = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };
  
  // Function to update item quantity
  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };
  
  // Function to reset cart and payment data
  const handleReset = () => {
    setCart([]);
    setPaymentAmount('');
    setChange(0);
    setTotal(0);
  };
  
  // Function to process payment
  const handleProcessPayment = async (paymentData) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Payment processed:', paymentData);
        resolve({ success: true });
      }, 1000);
    });
  };
  
  // Calculate total whenever cart changes
  React.useEffect(() => {
    const newTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotal(newTotal);
  }, [cart]);
  
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Table Management Section */}
      <div className="w-full md:w-1/2 p-4 border-r border-gray-200">
        <TableManagement 
          onTableSelect={handleTableSelect}
          onTableStatusChange={handleTableStatusChange}
        />
      </div>
      
      {/* Payment Section */}
      <div className="w-full md:w-1/2 p-4">
        {currentTable ? (
          <PaymentSection
            paymentAmount={paymentAmount}
            setPaymentAmount={setPaymentAmount}
            change={change}
            setChange={setChange}
            total={total}
            processPayment={handleProcessPayment}
            cart={cart}
            onReset={handleReset}
            onRemoveItem={handleRemoveItem}
            onUpdateQuantity={handleUpdateQuantity}
            currentTable={currentTable.number}
            tableCapacity={`${currentTable.capacity} orang`}
            onTableStatusChange={handleTableStatusChange}
            tableId={currentTable.id}
          />
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Silakan Pilih Meja</h2>
            <p className="text-gray-600">Pilih meja dari daftar di sebelah kiri untuk memulai transaksi</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionModule;