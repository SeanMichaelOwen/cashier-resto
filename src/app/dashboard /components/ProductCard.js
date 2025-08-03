import React from 'react';
import { FiPackage } from 'react-icons/fi';
import { formatRupiah } from '@/utils/formatCurrency';

const ProductCard = ({ product, addToCart }) => {
  return (
    <button
      onClick={() => addToCart(product)}
      className="border rounded-lg p-3 text-left hover:bg-gray-50 transition-colors flex flex-col h-full"
    >
      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-24 mb-2 flex items-center justify-center">
        <FiPackage size={32} className="text-gray-500" />
      </div>
      <h3 className="font-medium text-sm">{product.name}</h3>
      <p className="text-indigo-600 font-semibold mt-1">
        {formatRupiah(product.price)}
      </p>
      <span className="text-xs text-gray-500 mt-1">{product.category}</span>
    </button>
  );
};

export default ProductCard;