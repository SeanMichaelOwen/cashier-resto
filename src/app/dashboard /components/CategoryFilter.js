import React from 'react';
import { FiX } from 'react-icons/fi';

const CategoryFilter = ({ categories, selectedCategory, setSelectedCategory }) => {
  return (
    <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
      {categories.map(category => (
        <button
          key={category}
          onClick={() => setSelectedCategory(category)}
          className={`px-3 py-1 rounded-lg whitespace-nowrap flex items-center ${
            selectedCategory === category
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {category}
          {selectedCategory === category && category !== 'Semua' && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCategory('Semua');
              }}
              className="ml-2"
            >
              <FiX size={14} />
            </button>
          )}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;