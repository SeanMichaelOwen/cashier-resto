import React from 'react';

const CustomerCard = ({ 
  title, 
  value, 
  trend, 
  icon, 
  bgColor, 
  iconBg, 
  iconColor 
}) => {
  return (
    <div className={`${bgColor} p-4 rounded-lg shadow`}>
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{trend}</p>
        </div>
        <div className={`${iconBg} w-12 h-12 rounded-full flex items-center justify-center`}>
          <span className={`${iconColor}`}>{icon}</span>
        </div>
      </div>
    </div>
  );
};

export default CustomerCard;