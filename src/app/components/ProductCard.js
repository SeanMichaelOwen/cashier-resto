import React from 'react';
import { FiPackage, FiPlus, FiAlertTriangle } from 'react-icons/fi';
import { formatRupiah } from '@/utils/formatCurrency';

const ProductCard = ({ product, addToCart, isOutOfStock = false }) => {
  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart(product);
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        className={`w-full h-full border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col
          ${isOutOfStock ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-indigo-300'}
        `}
      >
        {/* Product Image Placeholder */}
        <div className={`relative w-full h-32 bg-gray-100 flex items-center justify-center
          ${isOutOfStock ? 'bg-gray-200' : 'group-hover:bg-gray-50'}`}
        >
          <FiPackage 
            size={40} 
            className={`${isOutOfStock ? 'text-gray-400' : 'text-indigo-400'}`} 
          />
          
          {/* Stock Badge */}
          <div className={`absolute bottom-2 right-2 px-2 py-1 rounded-full text-xs font-medium
            ${isOutOfStock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
          >
            {isOutOfStock ? 'Stok Habis' : `Stok: ${product.stock || 0}`}
          </div>
        </div>

        {/* Product Info */}
        <div className="p-3 flex-1 flex flex-col">
          <h3 className="font-medium text-gray-900 line-clamp-2">{product.name}</h3>
          <p className="text-indigo-600 font-semibold mt-1 text-sm">
            {formatRupiah(product.price)}
          </p>
          <span className="text-xs text-gray-500 mt-1">{product.category}</span>
        </div>

        {/* Add Button */}
        {!isOutOfStock && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              className="p-2 bg-indigo-600 text-white rounded-full shadow-md hover:bg-indigo-700 transition-colors"
              aria-label="Tambahkan ke keranjang"
            >
              <FiPlus size={16} />
            </button>
          </div>
        )}
      </button>

      {/* Out of Stock Overlay */}
      {isOutOfStock && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white bg-opacity-90 p-2 rounded-lg flex items-center">
            <FiAlertTriangle className="text-yellow-500 mr-1" size={14} />
            <span className="text-xs text-gray-700">Stok tidak tersedia</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;