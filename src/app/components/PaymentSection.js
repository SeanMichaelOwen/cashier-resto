'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiCreditCard, FiCheckCircle, FiPrinter, 
  FiRefreshCw, FiX, FiPlus, FiMinus,
  FiDollarSign, FiSave, FiAlertCircle
} from 'react-icons/fi';
import { toast } from 'react-toastify';

const PaymentSection = ({
  cart = [],
  updateQuantity = () => {},
  removeFromCart = () => {},
  selectedTable = null,
  calculateTotal = () => 0,
  resetTransaction = () => {},
  processPayment = async () => {},
  openBill = async () => { throw new Error('openBill function not implemented') },
  isHoldingBill = false,
  onCancelHoldBill = () => {},
  currentUser = {}
}) => {
  // State management
  const [paymentAmount, setPaymentAmount] = useState('');
  const [change, setChange] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [error, setError] = useState(null);

  // Calculate total with memoization
  const total = React.useMemo(() => {
    try {
      const subtotal = calculateTotal();
      const tax = subtotal * 0.1;
      return subtotal + tax;
    } catch (err) {
      console.error("Calculate total error:", err);
      return 0;
    }
  }, [calculateTotal]);

  // Format currency
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount).replace(/\u00A0/g, ' ');
  };

  // Parse currency input
  const parseRupiah = (formattedValue) => {
    if (!formattedValue) return 0;
    const numericString = formattedValue.toString().replace(/\D/g, '');
    return parseInt(numericString) || 0;
  };

  // Generate payment recommendations
  const generateRecommendedPayments = useCallback(() => {
    if (total <= 0) return [];
    
    const recommendations = new Set();
    recommendations.add(Math.ceil(total));
    
    // Rounded amounts
    const roundTo = total < 50000 ? 5000 : 
                   total < 200000 ? 10000 : 50000;
    const roundedUp = Math.ceil(total / roundTo) * roundTo;
    recommendations.add(roundedUp);
    
    // Common denominations
    [50000, 100000, 200000, 500000].forEach(denom => {
      if (denom >= roundedUp) recommendations.add(denom);
    });

    return Array.from(recommendations).sort((a, b) => a - b);
  }, [total]);

  const recommendedAmounts = generateRecommendedPayments();

  // Handle payment amount input
  const handlePaymentAmountChange = (e) => {
    try {
      const value = e.target.value;
      const numericValue = value.replace(/\D/g, '');
      
      const formattedValue = numericValue ? 
        new Intl.NumberFormat('id-ID').format(parseInt(numericValue)) : '';
      
      setPaymentAmount(formattedValue);
      
      const paidAmount = parseInt(numericValue) || 0;
      setChange(Math.max(0, paidAmount - total));
    } catch (err) {
      console.error("Payment input error:", err);
      setError("Format nominal tidak valid");
    }
  };

  // Set default payment amount
  useEffect(() => {
    if (recommendedAmounts.length > 0 && total > 0 && !paymentAmount) {
      const defaultAmount = recommendedAmounts[0];
      const formattedValue = new Intl.NumberFormat('id-ID').format(defaultAmount);
      setPaymentAmount(formattedValue);
      setChange(defaultAmount - total);
    }
  }, [total, recommendedAmounts]);

  // Validate payment data
  const validatePayment = () => {
    if (!cart || cart.length === 0) {
      throw new Error("Keranjang kosong, tidak bisa melakukan pembayaran");
    }

    if (!selectedTable?.id) {
      throw new Error("Silakan pilih meja terlebih dahulu");
    }

    const amount = parseRupiah(paymentAmount);
    if (amount <= 0) {
      throw new Error("Nominal pembayaran tidak valid");
    }

    if (amount < total) {
      throw new Error(`Jumlah pembayaran minimal ${formatRupiah(total)}`);
    }

    return true;
  };

  // Handle payment submission
  const handlePayment = () => {
    try {
      setError(null);
      validatePayment();
      setShowConfirm(true);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  // Confirm payment
  const confirmPayment = async () => {
    setIsProcessing(true);
    try {
      const amount = parseRupiah(paymentAmount);
      
      const paymentData = {
        table: { ...selectedTable },
        items: cart.map(item => ({
          id: item.id || Date.now().toString(),
          name: item.name || 'Produk tanpa nama',
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          notes: item.notes || '',
          subtotal: (Number(item.price) || 0) * (Number(item.quantity) || 1)
        })),
        staff: {
          id: currentUser.id,
          name: currentUser.name
        },
        subtotal: total / 1.1,
        tax: total * 0.1,
        total,
        paymentAmount: amount,
        paymentMethod,
        change: amount - total,
        date: new Date().toISOString(),
        receiptNumber: `INV-${Date.now().toString().slice(-6)}`
      };

      await processPayment(paymentData);
      
      setReceiptData(paymentData);
      setShowConfirm(false);
      setShowSuccess(true);
      toast.success("Pembayaran berhasil diproses");
    } catch (err) {
      console.error("Payment processing error:", err);
      setError(err.message || "Gagal memproses pembayaran");
      toast.error(err.message || "Gagal memproses pembayaran");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle hold bill - IMPROVED VERSION
  const handleOpenBill = async () => {
    try {
      if (!cart || cart.length === 0) {
        throw new Error("Keranjang kosong, tidak bisa hold bill");
      }

      if (!selectedTable?.id) {
        throw new Error("Silakan pilih meja terlebih dahulu");
      }

      const validItems = cart.map(item => ({
        id: item.id || Date.now().toString(),
        name: item.name || 'Produk tanpa nama',
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        notes: item.notes || '',
        subtotal: (Number(item.price) || 0) * (Number(item.quantity) || 1)
      }));

      if (validItems.some(item => item.price <= 0 || item.quantity <= 0)) {
        throw new Error("Ada item dengan harga atau jumlah tidak valid");
      }

      const billData = {
        table: { 
          id: selectedTable.id,
          number: selectedTable.number,
          capacity: selectedTable.capacity 
        },
        items: validItems,
        staff: {
          id: currentUser.id,
          name: currentUser.name
        },
        subtotal: calculateTotal(),
        tax: calculateTotal() * 0.1,
        total: total,
        createdAt: new Date().toISOString(),
        status: 'hold'
      };

      console.log('Sending bill data:', billData);

      await openBill(billData);
      toast.success(`Bill meja ${selectedTable.number} berhasil dihold`);
      resetTransaction();
    } catch (err) {
      console.error('Hold Bill Error:', err);
      setError(err.message);
      toast.error(err.message);
    }
  };

  // Print receipt function
  const printReceipt = () => {
    if (!receiptData) return;
    
    const popup = window.open('', 'Struk Pembayaran', 'width=600,height=700');
    popup.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Struk Pembayaran</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .receipt { width: 80mm; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 10px; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .item-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .total-row { font-weight: bold; margin-top: 10px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h2>KasirPro</h2>
              <p>Jl. Contoh No. 123, Jakarta</p>
            </div>
            
            <div class="divider"></div>
            
            <div class="info">
              <p>No: ${receiptData.receiptNumber}</p>
              <p>Tanggal: ${new Date(receiptData.date).toLocaleString('id-ID')}</p>
              <p>Meja: ${receiptData.table?.number || '-'}</p>
              <p>Kasir: ${receiptData.staff.name}</p>
            </div>
            
            <div class="divider"></div>
            
            <div class="items">
              ${receiptData.items.map(item => `
                <div class="item-row">
                  <span>${item.name} (${item.quantity}x)</span>
                  <span>${formatRupiah(item.price * item.quantity)}</span>
                </div>
              `).join('')}
            </div>
            
            <div class="divider"></div>
            
            <div class="totals">
              <div class="item-row">
                <span>Subtotal:</span>
                <span>${formatRupiah(receiptData.subtotal)}</span>
              </div>
              <div class="item-row">
                <span>Pajak (10%):</span>
                <span>${formatRupiah(receiptData.tax)}</span>
              </div>
              <div class="total-row">
                <span>TOTAL:</span>
                <span>${formatRupiah(receiptData.total)}</span>
              </div>
              <div class="item-row">
                <span>Dibayar:</span>
                <span>${formatRupiah(receiptData.paymentAmount)}</span>
              </div>
              <div class="item-row">
                <span>Kembali:</span>
                <span>${formatRupiah(receiptData.change)}</span>
              </div>
            </div>
            
            <div class="divider"></div>
            
            <div class="footer">
              <p>Terima kasih telah berbelanja</p>
              <p>KasirPro v2.1.0</p>
            </div>
          </div>
          
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 300);
          </script>
        </body>
      </html>
    `);
    popup.document.close();
  };

  return (
    <div className="flex-1 flex flex-col bg-white rounded-lg shadow-md p-4">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 flex items-center">
          <FiAlertCircle className="text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto mb-4 max-h-[40vh]">
        {cart.length > 0 ? (
          <div className="space-y-3">
            {cart.map(item => (
              <div key={`${item.id}-${item.quantity}`} className="flex justify-between items-center border-b pb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{item.name}</h4>
                  <p className="text-sm text-gray-600">{formatRupiah(item.price)}</p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <button 
                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                    aria-label="Kurangi jumlah"
                  >
                    <FiMinus size={14} />
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                    aria-label="Tambah jumlah"
                  >
                    <FiPlus size={14} />
                  </button>
                  <span className="w-20 text-right font-medium whitespace-nowrap">
                    {formatRupiah(item.price * item.quantity)}
                  </span>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 text-red-500 hover:text-red-700"
                    aria-label="Hapus item"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Keranjang kosong</p>
          </div>
        )}
      </div>

      {/* Payment Summary */}
      <div className="border-t pt-4">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatRupiah(total / 1.1)}</span>
          </div>
          <div className="flex justify-between">
            <span>Pajak (10%):</span>
            <span>{formatRupiah(total * 0.1)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span className="text-blue-600">{formatRupiah(total)}</span>
          </div>
        </div>

        {/* Recommended Payments */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Rekomendasi Pembayaran</label>
          <div className="grid grid-cols-2 gap-2">
            {recommendedAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => {
                  const formattedValue = new Intl.NumberFormat('id-ID').format(amount);
                  setPaymentAmount(formattedValue);
                  setChange(amount - total);
                  setError(null);
                }}
                className={`p-3 rounded-lg transition-colors ${
                  parseRupiah(paymentAmount) === amount
                    ? 'bg-blue-100 border-blue-500 border-2'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <span className="text-sm font-medium">{formatRupiah(amount)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Payment Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Jumlah Pembayaran</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
            <input
              type="text"
              value={paymentAmount}
              onChange={handlePaymentAmountChange}
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              aria-label="Masukkan jumlah pembayaran"
            />
          </div>
        </div>

        {/* Change Display */}
        {change > 0 && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex justify-between font-medium">
              <span className="text-green-700">Kembalian:</span>
              <span className="text-green-800">{formatRupiah(change)}</span>
            </div>
          </div>
        )}

        {/* Payment Method */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Metode Pembayaran</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="cash">Tunai</option>
            <option value="debit">Kartu Debit</option>
            <option value="credit">Kartu Kredit</option>
            <option value="qris">QRIS</option>
            <option value="ewallet">E-Wallet</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={isHoldingBill ? onCancelHoldBill : handleOpenBill}
            disabled={cart.length === 0 || (!isHoldingBill && !selectedTable)}
            className={`px-4 py-2 rounded-lg flex items-center justify-center gap-2 ${
              isHoldingBill
                ? 'bg-red-100 text-red-800 hover:bg-red-200'
                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
            } ${cart.length === 0 || (!isHoldingBill && !selectedTable) ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label={isHoldingBill ? "Batalkan hold bill" : "Hold bill"}
          >
            {isHoldingBill ? (
              <>
                <FiX size={16} /> Batalkan Hold
              </>
            ) : (
              <>
                <FiSave size={16} /> Hold Bill
              </>
            )}
          </button>
          <button
            onClick={handlePayment}
            className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 ${
              cart.length === 0 || !paymentAmount || parseRupiah(paymentAmount) < total ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={cart.length === 0 || !paymentAmount || parseRupiah(paymentAmount) < total}
            aria-label="Proses pembayaran"
          >
            <FiCreditCard size={16} /> Bayar
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full animate-fade-in">
            <h3 className="text-lg font-bold mb-4">Konfirmasi Pembayaran</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-medium">{formatRupiah(total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Dibayar:</span>
                <span className="font-medium">{formatRupiah(parseRupiah(paymentAmount))}</span>
              </div>
              <div className="flex justify-between">
                <span>Metode:</span>
                <span className="font-medium">
                  {paymentMethod === 'cash' ? 'Tunai' : 
                   paymentMethod === 'debit' ? 'Kartu Debit' :
                   paymentMethod === 'credit' ? 'Kartu Kredit' :
                   paymentMethod === 'qris' ? 'QRIS' : 'E-Wallet'}
                </span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Kembalian:</span>
                <span className="text-green-600">{formatRupiah(change)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmPayment}
                disabled={isProcessing}
                className={`flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                  isProcessing ? 'opacity-70' : ''
                }`}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <FiRefreshCw className="animate-spin" /> Memproses...
                  </span>
                ) : (
                  'Konfirmasi'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && receiptData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full animate-fade-in text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle className="text-green-500 text-3xl" />
            </div>
            <h3 className="text-xl font-bold mb-2">Pembayaran Berhasil!</h3>
            <div className="mb-4 space-y-1">
              <p className="font-medium text-lg">{formatRupiah(receiptData.paymentAmount)}</p>
              <p className="text-gray-600">
                {receiptData.table ? `Meja ${receiptData.table.number}` : 'Tanpa meja'}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                No. Transaksi: {receiptData.receiptNumber}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={printReceipt}
                className="flex-1 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center justify-center gap-2 transition-colors"
              >
                <FiPrinter size={16} /> Cetak Struk
              </button>
              <button
                onClick={() => {
                  resetTransaction();
                  setShowSuccess(false);
                  setReceiptData(null);
                }}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSection;