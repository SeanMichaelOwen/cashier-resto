import React from 'react';
import { formatRupiah } from '@/utils/formatCurrency';

const ReportCard = ({ title, value }) => {
  return (
    <div className="border rounded-lg p-4">
      <p className="text-gray-600">{title}</p>
      <p className="text-2xl font-bold mt-1">{formatRupiah(value)}</p>
    </div>
  );
};

export default ReportCard;