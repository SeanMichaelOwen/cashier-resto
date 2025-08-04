import React from 'react';
import { FiX, FiTrash2 } from 'react-icons/fi';
import { formatRupiah } from '@/utils/formatCurrency';

const Cart = ({ cart, products, updateQuantity, removeFromCart }) => {
  return (
    <div className="flex-1 overflow-y-auto mb-4">
      {cart.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Keranjang kosong. Tambahkan produk terlebih dahulu.
        </div>
      ) : (
        <div className="space-y-3">
          {cart.map(item => {
            const product = products.find(p => p.id === item.id);
            const stock = product ? product.stock : 0;
            
            return (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-500">{formatRupiah(item.price)}</p>
                  <p className="text-xs text-gray-400">Stok: {stock}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-lg"
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-lg"
                  >
                    +
                  </button>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Cart;