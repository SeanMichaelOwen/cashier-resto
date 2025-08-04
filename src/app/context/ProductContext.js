'use client';

import { createContext, useState, useContext, useEffect } from 'react';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [stockOpnameHistory, setStockOpnameHistory] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedProducts = localStorage.getItem('kasir-products');
    const savedHistory = localStorage.getItem('kasir-stock-history');
    
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedHistory) setStockOpnameHistory(JSON.parse(savedHistory));
    
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('kasir-products', JSON.stringify(products));
    }
  }, [products, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('kasir-stock-history', JSON.stringify(stockOpnameHistory));
    }
  }, [stockOpnameHistory, isLoaded]);

  const addProduct = (product) => {
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    setProducts([...products, { ...product, id: newId }]);
  };

  const updateProduct = (id, updatedProduct) => {
    setProducts(products.map(p => p.id === id ? { ...p, ...updatedProduct } : p));
  };

  const deleteProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const addStockHistory = (record) => {
    setStockOpnameHistory([record, ...stockOpnameHistory]);
  };

  return (
    <ProductContext.Provider value={{
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      stockOpnameHistory,
      addStockHistory,
      isLoaded
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};