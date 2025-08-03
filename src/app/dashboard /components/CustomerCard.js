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
    <div className={`${bgColor} p-4 rounded-lg`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg">{title}</h3>
          <p className="text-3xl font-bold mt-2">{value}</p>
          <p className="text-green-600 text-sm mt-1">{trend}</p>
        </div>
        <div className={`${iconBg} p-3 rounded-full`}>
          <div className={iconColor}>{icon}</div>
        </div>
      </div>
    </div>
  );
};

export default CustomerCard;