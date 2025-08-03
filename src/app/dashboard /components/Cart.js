import React from 'react';
import { FiShoppingCart, FiXCircle } from 'react-icons/fi';
import { formatRupiah } from '@/utils/formatCurrency';

const Cart = ({ cart, updateQuantity, removeFromCart }) => {
  return (
    <div className="space-y-3 mb-4 max-h-96 overflow-y-auto flex-grow">
      {cart.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FiShoppingCart size={48} className="mx-auto mb-2" />
          <p>Keranjang kosong</p>
          <p className="text-sm">Tambahkan produk</p>
        </div>
      ) : (
        cart.map(item => (
          <div key={item.id} className="flex justify-between items-center border-b pb-3">
            <div className="flex-1">
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-gray-500">{formatRupiah(item.price)}</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="bg-gray-200 w-8 h-8 rounded flex items-center justify-center hover:bg-gray-300"
              >
                -
              </button>
              <span className="w-10 text-center font-medium">{item.quantity}</span>
              <button 
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="bg-gray-200 w-8 h-8 rounded flex items-center justify-center hover:bg-gray-300"
              >
                +
              </button>
              <button 
                onClick={() => removeFromCart(item.id)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <FiXCircle size={20} />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Cart;