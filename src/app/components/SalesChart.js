import React from 'react';

const SalesChart = () => {
  // Data dummy untuk chart
  const salesData = [
    { day: 'Sen', sales: 1200000 },
    { day: 'Sel', sales: 1900000 },
    { day: 'Rab', sales: 1500000 },
    { day: 'Kam', sales: 2200000 },
    { day: 'Jum', sales: 3000000 },
    { day: 'Sab', sales: 4500000 },
    { day: 'Min', sales: 3800000 },
  ];

  const maxSales = Math.max(...salesData.map(item => item.sales));

  return (
    <div className="h-64 bg-white border rounded-lg p-4">
      <div className="flex items-end h-48 gap-2 mt-4">
        {salesData.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div 
              className="w-full bg-indigo-500 rounded-t hover:bg-indigo-600 transition-colors"
              style={{ height: `${(item.sales / maxSales) * 100}%` }}
            />
            <span className="text-xs mt-2">{item.day}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-indigo-500 rounded mr-2"></div>
          <span className="text-sm">Penjualan Harian (Rp)</span>
        </div>
      </div>
    </div>
  );
};

export default SalesChart;