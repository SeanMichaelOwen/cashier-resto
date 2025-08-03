import React, { useState, useEffect } from 'react';
import { FiCreditCard, FiCheckCircle, FiEdit2, FiPrinter } from 'react-icons/fi';
import { formatRupiah } from '@/utils/formatCurrency';

const PaymentSection = ({ 
  setPaymentAmount, 
  change, 
  total, 
  processPayment, 
  cart 
}) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showReceiptPopup, setShowReceiptPopup] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Daftar nominal cepat yang umum digunakan
  const quickAmounts = [50000, 100000, 200000, 500000, 1000000];
  
  useEffect(() => {
    if (inputValue === '') {
      setPaymentAmount(0);
      return;
    }
    const numericValue = parseInt(inputValue, 10) || 0;
    setPaymentAmount(numericValue);
  }, [inputValue, setPaymentAmount]);

  const handleQuickAmount = (amount) => {
    setInputValue(amount.toString());
    setError('');
  };
  
  const handleProcessPayment = async () => {
    const numericAmount = parseInt(inputValue, 10) || 0;
    
    if (isNaN(numericAmount) || numericAmount === 0) {
      setError('Masukkan jumlah pembayaran yang valid');
      return;
    }
    
    if (numericAmount < total) {
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
    const calculatedChange = parseInt(inputValue) - total;
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
          @media print {
            body { -webkit-print-color-adjust: exact; }
            .no-print { display: none !important; }
            .receipt { width: 80mm !important; margin: 0 !important; }
            @page { size: auto; margin: 0; }
          }
          
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 10px;
            display: flex;
            justify-content: center;
            background: #f5f5f5;
          }
          
          .receipt {
            width: 100%;
            max-width: 80mm;
            background: white;
            padding: 15px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          
          .header {
            text-align: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px dashed #ccc;
          }
          
          .store-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          
          .transaction-info {
            margin-bottom: 15px;
            font-size: 13px;
          }
          
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          
          .items {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
          }
          
          .items th {
            text-align: left;
            padding: 5px 0;
            border-bottom: 1px solid #ddd;
            font-weight: bold;
            font-size: 13px;
          }
          
          .items td {
            padding: 8px 0;
            border-bottom: 1px solid #eee;
            font-size: 13px;
          }
          
          .total-section {
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px dashed #ccc;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
          }
          
          .change-row {
            display: flex;
            justify-content: space-between;
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px dashed #ccc;
            font-size: 15px;
            font-weight: bold;
          }
          
          .change-value {
            color: #2e7d32;
          }
          
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #666;
            padding-top: 10px;
            border-top: 1px dashed #ccc;
          }
          
          .actions {
            display: flex;
            gap: 10px;
            margin-top: 20px;
          }
          
          .btn {
            flex: 1;
            padding: 10px;
            border: none;
            border-radius: 5px;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
          }
          
          .btn-print {
            background: #2196F3;
            color: white;
          }
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
            <div class="total-row">
              <span>Jumlah Bayar:</span>
              <span>${formatRupiah(parseInt(inputValue))}</span>
            </div>
            <div class="change-row">
              <span>Kembalian:</span>
              <span class="change-value">${formatRupiah(calculatedChange)}</span>
            </div>
          </div>
          
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
    <div className="space-y-4 p-4 bg-white rounded-lg shadow">
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
              <div className="flex justify-between">
                <span className="text-gray-600">Jumlah Bayar:</span>
                <span className="font-medium">{formatRupiah(parseInt(inputValue) || 0)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600">Kembalian:</span>
                <span className="font-bold text-green-600">
                  {formatRupiah(parseInt(inputValue) - total)}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowConfirmPopup(false)}
                className="bg-gray-100 hover:bg-gray-200 p-3 rounded-lg flex items-center justify-center gap-2"
              >
                <FiEdit2 /> Edit
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

      <h3 className="text-lg font-semibold mb-3">Pembayaran</h3>
      
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
      
      <div className="border rounded-lg overflow-hidden">
        <div className="flex items-center">
          <span className="bg-gray-100 px-3 py-2">Rp</span>
          <input
            type="text"
            placeholder="Masukkan jumlah pembayaran"
            className="flex-1 p-2 focus:outline-none"
            value={inputValue}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              setInputValue(value);
              setError('');
            }}
          />
        </div>
        
        {inputValue && (
          <div className="bg-gray-50 px-3 py-1 text-sm text-gray-600">
            Jumlah: {formatRupiah(parseInt(inputValue, 10) || 0)}
          </div>
        )}
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
            {formatRupiah(parseInt(inputValue) - total)}
          </span>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => {
            setInputValue('');
            setPaymentAmount(0);
            setError('');
          }}
          className="bg-gray-100 p-2 rounded hover:bg-gray-200"
        >
          Reset
        </button>
        <button
          onClick={() => handleQuickAmount(total)}
          className="bg-indigo-100 p-2 rounded hover:bg-indigo-200 text-indigo-700"
        >
          Jumlah Pas
        </button>
      </div>
      
      <button
        onClick={handleProcessPayment}
        disabled={cart.length === 0 || !inputValue}
        className={`w-full py-3 rounded-lg font-medium flex items-center justify-center mt-2 ${
          cart.length === 0 || !inputValue
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