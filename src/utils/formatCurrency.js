export const formatRupiah = (amount) => {
  if (isNaN(amount)) return "Rp 0";
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const parseRupiah = (formattedValue) => {
  if (!formattedValue) return 0;
  const numericString = formattedValue.toString().replace(/\D/g, '');
  return numericString ? parseInt(numericString, 10) : 0;
};