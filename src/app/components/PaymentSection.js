'use client'

import React, { useState } from 'react';
import { FiCreditCard, FiCheckCircle, FiPrinter, FiRefreshCw, FiDollarSign, FiTag, FiPercent } from 'react-icons/fi';
import { formatRupiah, parseRupiah } from '@/utils/formatCurrency';

const PaymentSection = ({ 
  paymentAmount, 
  setPaymentAmount, 
  change, 
  total, 
  processPayment, 
  cart 
}) => {
  const [error, setError] = useState('');
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showReceiptPopup, setShowReceiptPopup] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash', 'non-cash', 'promo'
  const [promoAmount, setPromoAmount] = useState('');
  const [notes, setNotes] = useState('');
  
  const quickAmounts = [50000, 100000, 200000, 500000, 1000000];
  
  const handleQuickAmount = (amount) => {
    setPaymentAmount(amount.toString());
    setError('');
  };
  
  const handleProcessPayment = async () => {
    let numericAmount = parseRupiah(paymentAmount) || 0;
    let numericPromo = parseRupiah(promoAmount) || 0;
    
    if (paymentMethod === 'promo' && numericPromo <= 0) {
      setError('Masukkan jumlah promo yang valid');
      return;
    }
    
    if (isNaN(numericAmount) || numericAmount === 0) {
      setError('Masukkan jumlah pembayaran yang valid');
      return;
    }
    
    const amountAfterPromo = numericAmount - numericPromo;
    
    if (amountAfterPromo < total) {
      setError(`Jumlah pembayaran minimal ${formatRupiah(total)}`);
      return;
    }
    
    setError('');
    setShowConfirmPopup(true);
  };
  
  const confirmPayment = async () => {
    setIsProcessing(true);
    try {
      await processPayment();
      setShowConfirmPopup(false);
      showReceipt();
    } catch (err) {
      setError('Gagal memproses pembayaran');
    } finally {
      setIsProcessing(false);
    }
  };

  const showReceipt = () => {
    const numericPromo = parseRupiah(promoAmount) || 0;
    const numericPayment = parseRupiah(paymentAmount) || 0;
    const calculatedChange = numericPayment - numericPromo - total;
    
    const transactionId = `TRX-${Date.now().toString().slice(-6)}`;
    
    const now = new Date();
    const transactionDate = now.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    const transactionTime = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const receiptContent = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Struk Pembayaran</title>
        <style>
          /* ... (style receipt tetap sama) ... */
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="store-name">TOKO KU</div>
            <div>Jl. Contoh No. 123, Jakarta</div>
            <div>Telp: (021) 123-4567</div>
          </div>
          
          <div class="transaction-info">
            <div class="info-row">
              <span>No. Transaksi:</span>
              <span>${transactionId}</span>
            </div>
            <div class="info-row">
              <span>Tanggal:</span>
              <span>${transactionDate}</span>
            </div>
            <div class="info-row">
              <span>Waktu:</span>
              <span>${transactionTime}</span>
            </div>
            <div class="info-row">
              <span>Metode Pembayaran:</span>
              <span>${paymentMethod === 'cash' ? 'Tunai' : paymentMethod === 'non-cash' ? 'Non-Tunai' : 'Promo'}</span>
            </div>
          </div>
          
          <table class="items">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Harga</th>
              </tr>
            </thead>
            <tbody>
              ${cart.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}x</td>
                  <td>${formatRupiah(item.price * item.quantity)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total-section">
            <div class="total-row">
              <span>Total Belanja:</span>
              <span>${formatRupiah(total)}</span>
            </div>
            ${paymentMethod === 'promo' ? `
            <div class="total-row">
              <span>Promo:</span>
              <span>-${formatRupiah(numericPromo)}</span>
            </div>
            ` : ''}
            <div class="total-row">
              <span>Jumlah Bayar:</span>
              <span>${formatRupiah(numericPayment)}</span>
            </div>
            <div class="change-row">
              <span>Kembalian:</span>
              <span class="change-value">${formatRupiah(calculatedChange)}</span>
            </div>
          </div>
          
          ${notes ? `
          <div class="notes-section">
            <p><strong>Catatan:</strong> ${notes}</p>
          </div>
          ` : ''}
          
          <div class="footer">
            <p>Terima kasih telah berbelanja</p>
            <p>Barang yang sudah dibeli tidak dapat dikembalikan</p>
          </div>
          
          <div class="actions no-print">
            <button class="btn btn-print" onclick="window.print()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              Cetak Struk
            </button>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    printWindow.document.write(receiptContent);
    printWindow.document.close();
    setShowReceiptPopup(true);
  };

  return (
    <div className="space-y-4">
      {/* Confirmation Popup */}
      {showConfirmPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
            <h3 className="text-xl font-semibold mb-4 text-center">Konfirmasi Pembayaran</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Belanja:</span>
                <span className="font-medium">{formatRupiah(total)}</span>
              </div>
              {paymentMethod === 'promo' && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Promo:</span>
                  <span className="font-medium text-red-500">-{formatRupiah(parseRupiah(promoAmount) || 0)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Jumlah Bayar:</span>
                <span className="font-medium">{formatRupiah(parseRupiah(paymentAmount) || 0)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600">Kembalian:</span>
                <span className="font-bold text-green-600">
                  {formatRupiah((parseRupiah(paymentAmount) || 0) - (paymentMethod === 'promo' ? parseRupiah(promoAmount) || 0 : 0) - total)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Metode Pembayaran:</span>
                <span className="font-medium">
                  {paymentMethod === 'cash' ? 'Tunai' : paymentMethod === 'non-cash' ? 'Non-Tunai' : 'Promo'}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowConfirmPopup(false)}
                className="bg-gray-100 hover:bg-gray-200 p-3 rounded-lg flex items-center justify-center gap-2"
              >
                <FiRefreshCw /> Batal
              </button>
              <button
                onClick={confirmPayment}
                disabled={isProcessing}
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <FiCheckCircle />
                )}
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Popup */}
      {showReceiptPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4 text-center">
            <FiCheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Pembayaran Berhasil!</h3>
            <p className="text-gray-600 mb-4">Struk telah terbuka di jendela baru</p>
            <button
              onClick={() => setShowReceiptPopup(false)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Payment Method Selection */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <button
          onClick={() => setPaymentMethod('cash')}
          className={`p-2 rounded-lg flex flex-col items-center justify-center ${
            paymentMethod === 'cash' ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <FiDollarSign className="mb-1" />
          <span className="text-xs">Tunai</span>
        </button>
        <button
          onClick={() => setPaymentMethod('non-cash')}
          className={`p-2 rounded-lg flex flex-col items-center justify-center ${
            paymentMethod === 'non-cash' ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <FiCreditCard className="mb-1" />
          <span className="text-xs">Non-Tunai</span>
        </button>
        <button
          onClick={() => setPaymentMethod('promo')}
          className={`p-2 rounded-lg flex flex-col items-center justify-center ${
            paymentMethod === 'promo' ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <FiPercent className="mb-1" />
          <span className="text-xs">Promo</span>
        </button>
      </div>

      {/* Promo Input */}
      {paymentMethod === 'promo' && (
        <div className="border rounded-lg overflow-hidden mb-3">
          <div className="flex items-center">
            <span className="bg-gray-100 px-3 py-2">Rp</span>
            <input
              type="text"
              placeholder="Masukkan jumlah promo"
              className="flex-1 p-2 focus:outline-none"
              value={promoAmount}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setPromoAmount(value);
                setError('');
              }}
            />
          </div>
          
          {promoAmount && (
            <div className="bg-gray-50 px-3 py-1 text-sm text-gray-600">
              Jumlah Promo: -{formatRupiah(parseRupiah(promoAmount) || 0)}
            </div>
          )}
        </div>
      )}

      {/* Quick Amounts */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {quickAmounts.map(amount => (
          <button
            key={amount}
            onClick={() => handleQuickAmount(amount)}
            className="bg-gray-100 hover:bg-gray-200 p-2 rounded text-sm"
          >
            {formatRupiah(amount)}
          </button>
        ))}
        <button
          onClick={() => handleQuickAmount(total)}
          className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 p-2 rounded text-sm col-span-3"
        >
          Bayar Pas ({formatRupiah(total)})
        </button>
      </div>
      
      {/* Payment Input */}
      <div className="border rounded-lg overflow-hidden">
        <div className="flex items-center">
          <span className="bg-gray-100 px-3 py-2">Rp</span>
          <input
            type="text"
            placeholder="Masukkan jumlah pembayaran"
            className="flex-1 p-2 focus:outline-none"
            value={paymentAmount}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              setPaymentAmount(value);
              setError('');
            }}
          />
        </div>
        
        {paymentAmount && (
          <div className="bg-gray-50 px-3 py-1 text-sm text-gray-600">
            Jumlah: {formatRupiah(parseRupiah(paymentAmount) || 0)}
          </div>
        )}
      </div>
      
      {/* Notes Input */}
      <div className="border rounded-lg overflow-hidden">
        <textarea
          placeholder="Catatan (Opsional)"
          className="w-full p-2 focus:outline-none"
          rows="2"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      
      {error && (
        <div className="text-red-500 text-sm p-2 bg-red-50 rounded-lg">
          {error}
        </div>
      )}
      
      {change > 0 && (
        <div className="flex justify-between items-center bg-green-50 p-3 rounded-lg">
          <span className="text-green-700 font-medium">Kembalian:</span>
          <span className="text-green-700 font-bold text-lg">
            {formatRupiah(change)}
          </span>
        </div>
      )}
      
      <button
        onClick={handleProcessPayment}
        disabled={cart.length === 0 || !paymentAmount || (paymentMethod === 'promo' && !promoAmount)}
        className={`w-full py-3 rounded-lg font-medium flex items-center justify-center mt-2 ${
          cart.length === 0 || !paymentAmount || (paymentMethod === 'promo' && !promoAmount)
            ? 'bg-gray-300 cursor-not-allowed' 
            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
        }`}
      >
        <FiCreditCard className="mr-2" />
        Proses Pembayaran
      </button>
    </div>
  );
};

export default PaymentSection;