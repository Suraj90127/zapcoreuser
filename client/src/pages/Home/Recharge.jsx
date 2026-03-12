import React, { useState, useEffect } from "react";
import { 
  FiCheckCircle,
  FiPlus,
  FiAlertCircle,
  FiDownload,
  FiRefreshCw,
  FiCopy,
  FiEye,
  FiEyeOff,
  FiInfo,
  FiLoader,
  FiArrowLeft
} from "react-icons/fi";
import { FaEthereum } from "react-icons/fa";
import { GiWallet, GiMoneyStack } from "react-icons/gi";
import { TbCurrencyRupee } from "react-icons/tb";
import { MdHistory, MdAccountBalanceWallet, MdSecurity } from "react-icons/md";
import { TbReportMoney } from "react-icons/tb";
import { BiRupee } from "react-icons/bi";
import { useTheme } from '../../contexts/ThemeContext';
import { useDispatch, useSelector } from 'react-redux';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from 'qrcode.react';
import {
  upiRecharge,
  usdtRecharge,
  zilpayRecharge,
  fetchPaymentDetails,
  fetchRechargeHistory
} from '../../reducer/walletSlice';
import { USDT_TO_INR } from "../../utils/constant";

// Media query for mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
};

const Recharge = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
    // const usdtAmount = Number((total / USDT_TO_INR).toFixed(2));
  // Redux state
  const { user, balance } = useSelector((state) => state.auth);
  const { loading: walletLoading, paymentDetails, rechargeHistory } = useSelector((state) => state.wallet);
  
  // Local state
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('ZilPay')
  const [depositLoading, setDepositLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPaymentSection, setShowPaymentSection] = useState(false);
  
  // Payment form states
  const [upiFormData, setUpiFormData] = useState({ transactionId: '', remarks: 'Wallet Recharge' });
  const [usdtFormData, setUsdtFormData] = useState({ transactionId: '', remarks: 'Wallet Recharge' });
  const [showUpiId, setShowUpiId] = useState(false);
  const [showUsdtAddress, setShowUsdtAddress] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Quick deposit amounts
  const quickDepositAmounts = [999, 4999, 9999, 49999, 99999];
  
  // Payment methods - Only UPI, USDT, ZilPay
  const paymentMethods = [
    { 
      id: 'UPI', 
      name: 'UPI', 
      description: 'Instant UPI Payment',
      fullDescription: 'Pay via Google Pay, PhonePe, Paytm, or any UPI app',
      icon: TbCurrencyRupee, 
      color: 'purple',
      processingTime: '5-10 mins',
      fee: 'No fee',
      minAmount: 100,
      maxAmount: 50000
    },
    { 
      id: 'USDT', 
      name: 'USDT', 
      description: 'Pay with USDT (Crypto)',
      fullDescription: 'Send USDT (ERC20/BEP20) to the address below',
      icon: FaEthereum, 
      color: 'blue',
      processingTime: '5-15 mins',
      fee: 'No fee',
      minAmount: 10,
      maxAmount: 10000
    },
    { 
      id: 'ZilPay', 
      name: 'ZilPay', 
      description: 'Pay with ZIL Cryptocurrency',
      fullDescription: 'Instant payment using ZilPay wallet',
      icon: GiWallet, 
      color: 'orange',
      processingTime: 'Instant',
      fee: 'No fee',
      minAmount: 10,
      maxAmount: 5000
    }
  ];

  // Amount to pay
  const amountToPay = depositAmount ? Number(depositAmount) : 0;
  const bonusAmount = Math.floor(amountToPay * 0);
  const totalCredit = amountToPay + bonusAmount;
  const usdtAmount = parseFloat((amountToPay / USDT_TO_INR).toFixed(2))

  // Get current payment method details
  const currentMethod = paymentMethods.find(m => m.id === selectedPaymentMethod);

  // UPI QR generation
  const upiQrString = paymentDetails?.upi && amountToPay > 0
    ? `upi://pay?pa=${paymentDetails.upi}&pn=${user?.name || 'Customer'}&am=${amountToPay}&tn=Wallet Recharge&cu=INR`
    : '';

  // USDT QR value
  const usdtQrString = paymentDetails?.usdtAddress || '';

  useEffect(() => {
    // if (!user) {
    //   toast.error('Please login to recharge wallet!');
    //   navigate('/login');
    //   return;
    // }
    fetchPaymentDetailsHandler();
    fetchRechargeHistoryHandler();
  }, [dispatch]);

  const fetchPaymentDetailsHandler = async () => {
    try {
      await dispatch(fetchPaymentDetails()).unwrap();
    } catch (error) {
      toast.error('Failed to fetch payment details');
    }
  };

  const fetchRechargeHistoryHandler = async () => {
    try {
      await dispatch(fetchRechargeHistory()).unwrap();
    } catch (error) {
      toast.error('Failed to fetch recharge history');
    }
  };

  const handleRefreshDetails = async () => {
    setIsRefreshing(true);
    try {
      await dispatch(fetchPaymentDetails()).unwrap();
      toast.success('Payment details refreshed!');
    } catch {
      toast.error('Failed to refresh details');
    }
    setIsRefreshing(false);
  };

  // Copy helpers
  const copyUpiId = () => {
    if (paymentDetails?.upi) {
      navigator.clipboard.writeText(paymentDetails.upi);
      toast.success('UPI ID copied to clipboard!');
    }
  };

  const copyUsdtAddress = () => {
    if (paymentDetails?.usdtAddress) {
      navigator.clipboard.writeText(paymentDetails.usdtAddress);
      toast.success('USDT Address copied to clipboard!');
    }
  };

  const copyTransactionId = (txId) => {
    navigator.clipboard.writeText(txId);
    toast.success('Transaction ID copied to clipboard!');
  };

  // QR Code handlers
  const copyUpiQrToClipboard = async () => {
    try {
      const canvas = document.querySelector('#upi-qr-code canvas');
      if (canvas) {
        canvas.toBlob(async (blob) => {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          toast.success('QR Code copied to clipboard!');
        });
      }
    } catch {
      toast.error('Failed to copy QR code');
    }
  };

  const downloadUpiQr = () => {
    const canvas = document.querySelector('#upi-qr-code canvas');
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `Recharge-${amountToPay}-${Date.now()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      toast.success('QR Code downloaded!');
    }
  };

  const copyUsdtQrToClipboard = async () => {
    try {
      const canvas = document.querySelector('#usdt-qr-code canvas');
      if (canvas) {
        canvas.toBlob(async (blob) => {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          toast.success('QR Code copied to clipboard!');
        });
      }
    } catch {
      toast.error('Failed to copy QR code');
    }
  };

  const downloadUsdtQr = () => {
    const canvas = document.querySelector('#usdt-qr-code canvas');
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `USDT-Recharge-${amountToPay}-${Date.now()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      toast.success('QR Code downloaded!');
    }
  };

  const handleQuickDeposit = (amount) => {
    setDepositAmount(amount.toString());
    setShowPaymentSection(true);
    toast.success(`₹${amount} selected for deposit`);
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setDepositAmount(value);
    if (value && Number(value) >= 100) {
      setShowPaymentSection(true);
    } else {
      setShowPaymentSection(false);
    }
  };

  const handlePaymentMethodChange = (methodId) => {
    setSelectedPaymentMethod(methodId);
    setShowPaymentSection(true);
  };

  // Payment Handlers
  const handleUpiPayment = async () => {
    if (!upiFormData.transactionId) {
      toast.error('Please enter transaction ID (UTR)');
      return;
    }
    if (!agreeTerms) {
      toast.error('You must agree to the Terms before proceeding.');
      return;
    }
    
    setDepositLoading(true);
    try {
      const payload = {
        money: amountToPay,
        // usdtAmount: pa,
        utr: upiFormData.transactionId,
        type: 'recharge',
        method: 'UPI'
      };
      
      await dispatch(upiRecharge(payload)).unwrap();
      toast.success(`Recharge of ₹${amountToPay} successful!`, {
        duration: 5000,
        icon: '✅'
      });
      
      setUpiFormData({ transactionId: '', remarks: 'Wallet Recharge' });
      await fetchRechargeHistoryHandler();
      
      setDepositAmount('');
      setShowPaymentSection(false);
      setAgreeTerms(false);
      
    } catch (error) {
      toast.error(error || 'UPI recharge failed. Please try again.');
    } finally {
      setDepositLoading(false);
    }
  };

  const handleUsdtPayment = async () => {
    if (!usdtFormData.transactionId) {
      toast.error('Please enter transaction Hash (TXID)');
      return;
    }
    if (!agreeTerms) {
      toast.error('You must agree to the Terms before proceeding.');
      return;
    }
    
    setDepositLoading(true);
    try {
      const payload = {
        money: usdtAmount,
        usdtAmount: usdtAmount,
        type: 'recharge',
        method: 'USDT',
        txHash: usdtFormData.transactionId
      };
      
      await dispatch(usdtRecharge(payload)).unwrap();
      // CHANGE: Convert $ sign to ₹
      toast.success(`USDT Recharge of $ ${usdtAmount} USDT successful!`, {
        duration: 5000,
        icon: '✅'
      });
      
      setUsdtFormData({ transactionId: '', remarks: 'Wallet Recharge' });
      await fetchRechargeHistoryHandler();
      
      setDepositAmount('');
      setShowPaymentSection(false);
      setAgreeTerms(false);
      
    } catch (error) {
      toast.error(error || 'USDT recharge failed. Please try again.');
    } finally {
      setDepositLoading(false);
    }
  };

  const handleZilPayPayment = async () => {
    if (!agreeTerms) {
      toast.error('You must agree to the Terms before proceeding.');
      return;
    }
    
    setDepositLoading(true);
    try {
      const payload = {
        money: amountToPay,
        type: 'recharge',
        method: 'zilpay'
      };
      
      const response = await dispatch(zilpayRecharge(payload)).unwrap();
      if (response?.data && response.data.url) {
        window.open(response.data.url, '_blank', 'noopener,noreferrer');
        toast.success('Redirecting to ZilPay Gateway...');
        
        setTimeout(async () => {
          await fetchRechargeHistoryHandler();
        }, 5000);
        
        setDepositAmount('');
        setShowPaymentSection(false);
        setAgreeTerms(false);
      } else {
        toast.error('Failed to initiate ZilPay recharge');
      }
    } catch (error) {
      toast.error(error || 'ZilPay recharge failed. Please try again.');
    } finally {
      setDepositLoading(false);
    }
  };

  const handleSubmitPayment = () => {
    switch (selectedPaymentMethod) {
      case 'UPI':
        handleUpiPayment();
        break;
      case 'USDT':
        handleUsdtPayment();
        break;
      case 'ZilPay':
        handleZilPayPayment();
        break;
      default:
        toast.error('Please select a valid payment method');
    }
  };

  // Stats calculation from real data
  const getStatsFromHistory = (period) => {
    const now = new Date();
    let filtered = [];
    
    if (rechargeHistory && rechargeHistory.length > 0) {
      filtered = rechargeHistory.filter(item => {
        const date = new Date(item.createdAt);
        switch(period) {
          case 'today':
            return date.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.setDate(now.getDate() - 7));
            return date >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
            return date >= monthAgo;
          default:
            return true;
        }
      });
    }
    
    const completed = filtered.filter(item => item.status === 'completed');
    const total = completed.reduce((sum, item) => sum + (item.amount || 0), 0);
    const bonus = completed.reduce((sum, item) => sum + (item.bonus || 0), 0);
    const successRate = filtered.length > 0 
      ? Math.round((completed.length / filtered.length) * 100) 
      : 0;
    
    return {
      total,
      deposits: completed.length,
      bonus,
      success: `${successRate}%`
    };
  };

  // Theme styles
  const containerBg = theme === 'dark' 
    ? 'bg-gradient-to-b from-gray-900 to-black' 
    : 'bg-gradient-to-b from-gray-50 to-gray-100';
  
  const cardBg = theme === 'dark'
    ? 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg'
    : 'bg-gradient-to-br from-white to-gray-50 backdrop-blur-lg';
  
  const borderColor = theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const textMuted = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  const inputBg = theme === 'dark' ? 'bg-gray-900/50' : 'bg-white/80';
  const shadowColor = theme === 'dark' ? 'shadow-gray-900/50' : 'shadow-gray-200/50';

  // Render UPI Payment Section
  const renderUpiSection = () => (
    <div className={`mt-6 p-4 sm:p-6 rounded-2xl ${cardBg} border ${borderColor} animate-slideDown`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h3 className={`text-base sm:text-lg font-bold ${textPrimary} flex items-center gap-2`}>
          <TbCurrencyRupee className="w-5 h-5 text-purple-500" />
          UPI Payment Details
        </h3>
        <button
          onClick={handleRefreshDetails}
          disabled={isRefreshing}
          className={`p-2 rounded-lg self-end sm:self-auto ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
        >
          <FiRefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''} ${textMuted}`} />
        </button>
      </div>
      
      {paymentDetails?.upi ? (
        <>
          {/* Payment Info Card */}
          <div className={`mb-5 p-4 rounded-xl ${
            theme === 'dark' ? 'bg-purple-900/20 border border-purple-800/30' : 'bg-purple-50 border border-purple-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <FiInfo className="w-4 h-4 text-purple-500" />
                <span className={`font-semibold text-sm sm:text-base ${textPrimary}`}>Send Payment To</span>
              </div>
              <button
                onClick={copyUpiId}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm flex items-center gap-2 w-full sm:w-auto justify-center ${
                  theme === 'dark'
                    ? 'bg-purple-700 hover:bg-purple-600 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                <FiCopy className="w-3 h-3" />
                Copy UPI ID
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                <span className={`text-xs ${textMuted}`}>UPI ID:</span>
                <div className="flex items-center gap-2">
                  {showUpiId
                    ? <span className={`font-mono text-xs sm:text-sm ${textPrimary} break-all`}>{paymentDetails.upi}</span>
                    : <span className={`font-mono text-xs sm:text-sm ${textPrimary}`}>••••••••@upi</span>
                  }
                  <button
                    onClick={() => setShowUpiId(!showUpiId)}
                    className="text-purple-500 hover:text-purple-400 flex-shrink-0"
                  >
                    {showUpiId ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                <span className={`text-xs ${textMuted}`}>Name:</span>
                <span className={`font-medium text-xs sm:text-sm ${textPrimary}`}>{user?.name || 'Customer'}</span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                <span className={`text-xs ${textMuted}`}>Amount to Pay:</span>
                <span className={`font-bold text-base sm:text-lg text-green-500`}>
                  <BiRupee className="inline mr-1" />
                  {amountToPay}
                </span>
              </div>
            </div>
          </div>

          {/* QR Code - Responsive */}
          {amountToPay > 0 && (
            <div className="mb-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <label className={`text-xs sm:text-sm font-medium ${textPrimary}`}>
                  Scan QR Code to Pay
                </label>
                <div className="flex gap-2 self-end sm:self-auto">
                  <button
                    onClick={copyUpiQrToClipboard}
                    className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 ${
                      theme === 'dark'
                        ? 'bg-purple-700 hover:bg-purple-600 text-white'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    <FiCopy className="w-3 h-3" />
                    Copy QR
                  </button>
                  <button
                    onClick={downloadUpiQr}
                    className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                  >
                    <FiDownload className="w-3 h-3" />
                    Save
                  </button>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="inline-block p-3 sm:p-4 bg-white rounded-xl shadow-lg" id="upi-qr-code">
                  <QRCodeSVG
                    value={upiQrString}
                    size={isMobile ? 150 : 180}
                    fgColor="#000000"
                    bgColor="#ffffff"
                    level="H"
                    includeMargin={true}
                  />
                  <div className="mt-2 sm:mt-3 text-center">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">
                      Amount: <span className="text-green-600 font-bold">₹{amountToPay}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Scan with any UPI app
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transaction ID Input */}
          <div className="space-y-3">
            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-2 ${textPrimary}`}>
                Transaction ID (UTR) *
              </label>
              <input
                type="text"
                value={upiFormData.transactionId}
                onChange={(e) => setUpiFormData({ ...upiFormData, transactionId: e.target.value })}
                placeholder="Enter UPI transaction reference number"
                className={`w-full px-4 py-3 text-sm sm:text-base rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${inputBg} ${textPrimary}`}
              />
              <p className={`text-xs mt-2 ${textMuted}`}>
                Find this in your bank statement or UPI app
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className={`p-4 rounded-xl ${
          theme === 'dark'
            ? 'bg-red-900/20 border border-red-800/30'
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-2 text-red-500">
            <FiAlertCircle className="w-5 h-5" />
            <span className="font-medium text-sm sm:text-base">UPI details not available</span>
          </div>
          <p className={`text-xs sm:text-sm mt-2 ${textMuted}`}>
            Please contact support or try another payment method.
          </p>
        </div>
      )}
    </div>
  );

  // Render USDT Payment Section
  const renderUsdtSection = () => (
    <div className={`mt-6 p-4 sm:p-6 rounded-2xl ${cardBg} border ${borderColor} animate-slideDown`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h3 className={`text-base sm:text-lg font-bold ${textPrimary} flex items-center gap-2`}>
          <FaEthereum className="w-5 h-5 text-blue-500" />
          USDT Payment Details
        </h3>
        <button
          onClick={handleRefreshDetails}
          disabled={isRefreshing}
          className={`p-2 rounded-lg self-end sm:self-auto ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
        >
          <FiRefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''} ${textMuted}`} />
        </button>
      </div>
      
      {paymentDetails?.usdtAddress ? (
        <>
          {/* Payment Info Card */}
          <div className={`mb-5 p-4 rounded-xl ${
            theme === 'dark' ? 'bg-blue-900/20 border border-blue-800/30' : 'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <FaEthereum className="w-4 h-4 text-blue-500" />
                <span className={`font-semibold text-sm sm:text-base ${textPrimary}`}>Send USDT To</span>
              </div>
              <button
                onClick={copyUsdtAddress}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm flex items-center gap-2 w-full sm:w-auto justify-center ${
                  theme === 'dark'
                    ? 'bg-blue-700 hover:bg-blue-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <FiCopy className="w-3 h-3" />
                Copy Address
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                <span className={`text-xs ${textMuted}`}>USDT Address:</span>
                <div className="flex items-center gap-2">
                  {showUsdtAddress
                    ? <span className={`font-mono text-xs ${textPrimary} break-all`}>{paymentDetails.usdtAddress}</span>
                    : <span className={`font-mono text-xs ${textPrimary}`}>••••••••••••••••••••••••••</span>
                  }
                  <button
                    onClick={() => setShowUsdtAddress(!showUsdtAddress)}
                    className="text-blue-500 hover:text-blue-400 flex-shrink-0"
                  >
                    {showUsdtAddress ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                <span className={`text-xs ${textMuted}`}>Amount to Pay In INR:</span>
                <span className={`font-bold text-base sm:text-lg text-green-500`}>
                  {/* CHANGED: Dollar sign --> Rupee sign */}
                  <BiRupee className="inline mr-1" />
                  {amountToPay}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                <span className={`text-xs ${textMuted}`}>Amount to Pay In USDT:</span>
                <span className={`font-bold text-base sm:text-lg text-green-500`}>
                  {/* CHANGED: Dollar sign --> Rupee sign */}
                  <BiRupee className="inline mr-1" />
                  {(USDT_TO_INR > 0) ? usdtAmount : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* QR Code - Responsive */}
          {amountToPay > 0 && (
            <div className="mb-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <label className={`text-xs sm:text-sm font-medium ${textPrimary}`}>
                  Scan QR Code to Copy Address
                </label>
                <div className="flex gap-2 self-end sm:self-auto">
                  <button
                    onClick={copyUsdtQrToClipboard}
                    className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 ${
                      theme === 'dark'
                        ? 'bg-blue-700 hover:bg-blue-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <FiCopy className="w-3 h-3" />
                    Copy QR
                  </button>
                  <button
                    onClick={downloadUsdtQr}
                    className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                  >
                    <FiDownload className="w-3 h-3" />
                    Save
                  </button>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="inline-block p-3 sm:p-4 bg-white rounded-xl shadow-lg" id="usdt-qr-code">
                  <QRCodeSVG
                    value={usdtQrString}
                    size={isMobile ? 150 : 180}
                    fgColor="#000000"
                    bgColor="#ffffff"
                    level="H"
                    includeMargin={true}
                  />
                  <div className="mt-2 sm:mt-3 text-center">
                    <p className={`text-xs sm:text-sm font-medium ${textPrimary}`}>
                      Address: <span className="font-bold">
                        {paymentDetails.usdtAddress?.substring(0, 6)}•••{paymentDetails.usdtAddress?.slice(-6)}
                      </span>
                    </p>
                    <p className={`text-xs ${textMuted}`}>
                      Scan with wallet to paste address
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transaction Hash Input */}
          <div className="space-y-3">
            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-2 ${textPrimary}`}>
                Transaction Hash (TXID) *
              </label>
              <input
                type="text"
                value={usdtFormData.transactionId}
                onChange={(e) => setUsdtFormData({ ...usdtFormData, transactionId: e.target.value })}
                placeholder="Enter blockchain transaction hash"
                className={`w-full px-4 py-3 text-sm sm:text-base rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputBg} ${textPrimary}`}
              />
              <p className={`text-xs mt-2 ${textMuted}`}>
                Paste the hash from your crypto wallet after you send USDT
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className={`p-4 rounded-xl ${
          theme === 'dark'
            ? 'bg-red-900/20 border border-red-800/30'
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-2 text-red-500">
            <FiAlertCircle className="w-5 h-5" />
            <span className="font-medium text-sm sm:text-base">USDT details not available</span>
          </div>
          <p className={`text-xs sm:text-sm mt-2 ${textMuted}`}>
            Please contact support or try another payment method.
          </p>
        </div>
      )}
    </div>
  );

  // Render ZilPay Payment Section
  const renderZilPaySection = () => (
    <div className={`mt-6 p-4 sm:p-6 rounded-2xl ${cardBg} border ${borderColor} animate-slideDown`}>
      <h3 className={`text-base sm:text-lg font-bold mb-4 ${textPrimary} flex items-center gap-2`}>
        <GiWallet className="w-5 h-5 text-orange-500" />
        ZilPay Payment
      </h3>
      
      <div className={`p-4 rounded-xl mb-4 ${
        theme === 'dark'
          ? 'bg-orange-900/20 border border-orange-800/30'
          : 'bg-orange-50 border border-orange-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
          <div className="flex items-center gap-3">
            <GiWallet className="w-8 h-8 text-orange-500" />
            <div>
              <h4 className={`font-bold text-sm sm:text-base ${textPrimary}`}>Instant ZilPay Payment</h4>
              <p className={`text-xs ${textMuted}`}>
                Pay directly with ZIL cryptocurrency
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-3">
          <span className={`text-xs sm:text-sm ${textMuted}`}>Total Amount:</span>
          <span className={`font-bold text-base sm:text-lg text-green-500`}>
            {/* CHANGED: $ to ₹ for ZilPay */}
            <BiRupee className="inline mr-1" />
            {amountToPay.toLocaleString()}
          </span>
        </div>
        
        <div className="space-y-2 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <FiCheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className={textMuted}>Secure ZIL cryptocurrency payment</span>
          </div>
          <div className="flex items-center gap-2">
            <FiCheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className={textMuted}>Instant confirmation</span>
          </div>
          <div className="flex items-center gap-2">
            <FiCheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className={textMuted}>Low transaction fees</span>
          </div>
        </div>
      </div>
      
      <p className={`text-xs text-center ${textMuted}`}>
        You will be redirected to ZilPay gateway to complete your payment.
      </p>
    </div>
  );

  // Render Payment Summary
  const renderPaymentSummary = () => (
    <div className={`mt-6 p-4 sm:p-6 rounded-2xl ${cardBg} border ${borderColor} bg-gradient-to-r ${
      theme === 'dark'
        ? 'from-green-600/10 via-emerald-600/5 to-green-600/10 border-green-500/20'
        : 'from-green-50 via-emerald-50/50 to-green-50 border-green-200'
    }`}>
      <h3 className={`text-base sm:text-lg font-bold mb-4 ${textPrimary}`}>
        Payment Summary
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="text-center p-3">
          <div className={`text-xs ${textMuted} mb-1`}>Deposit Amount</div>
          <div className={`text-xl sm:text-2xl font-bold ${textPrimary}`}>
            <BiRupee className="inline mr-1" />
            {amountToPay.toLocaleString()}
          </div>
        </div>
        <div className="text-center p-3">
          <div className={`text-xs ${textMuted} mb-1`}>Bonus (0%)</div>
          <div className={`text-xl sm:text-2xl font-bold ${
            theme === 'dark' ? 'text-green-400' : 'text-green-600'
          }`}>
            +<BiRupee className="inline mr-1" />
            {bonusAmount.toLocaleString()}
          </div>
        </div>
        <div className="text-center p-3">
          <div className={`text-xs ${textMuted} mb-1`}>Total Credit</div>
          <div className={`text-xl sm:text-2xl font-bold ${
            theme === 'dark' ? 'text-green-400' : 'text-green-600'
          }`}>
            <BiRupee className="inline mr-1" />
            {totalCredit.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );

  // Render Terms and Conditions
  const renderTerms = () => (
    <div className={`mt-4 p-4 rounded-xl ${cardBg} border ${borderColor}`}>
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agreeTerms}
          onChange={(e) => setAgreeTerms(e.target.checked)}
          className="w-4 h-4 mt-1 text-green-500 rounded focus:ring-green-500"
        />
        <span className={`text-xs sm:text-sm ${textMuted}`}>
          I agree to the <button className="text-green-500 hover:underline font-medium">Terms of Service</button> and{' '}
          <button className="text-green-500 hover:underline font-medium">Privacy Policy</button>. 
          I confirm that the transaction details are correct.
        </span>
      </label>
    </div>
  );

  return (
    <div className={`min-h-screen ${containerBg} py-4 sm:py-6 px-3 sm:px-4 lg:px-6`}>
      <Toaster 
        position={isMobile ? "top-center" : "top-right"}
        toastOptions={{
          style: {
            background: theme === 'dark' ? '#1f2937' : '#fff',
            color: theme === 'dark' ? '#fff' : '#000',
            border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
          },
        }}
      />
      
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div
  className={`relative overflow-hidden rounded-2xl 
    ${theme === "dark"
      ? "bg-[#111827] border border-gray-800"
      : "bg-white border border-gray-200"
    } p-4 sm:p-6`}
>
  {/* Background Patterns */}
  {theme === "dark" ? (
    <>
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-green-500/5 to-emerald-500/5 rounded-full -translate-y-32 translate-x-32" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-blue-500/5 to-indigo-500/5 rounded-full translate-y-40 -translate-x-40" />
    </>
  ) : (
    <>
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-green-100 to-emerald-100 rounded-full -translate-y-32 translate-x-32" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-blue-100 to-indigo-100 rounded-full translate-y-40 -translate-x-40" />
    </>
  )}

  <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    
    {/* LEFT SIDE */}
    <div className="flex items-center gap-3">
      <button
        onClick={() => navigate(-1)}
        className={`p-2 rounded-lg transition ${
          theme === "dark"
            ? "hover:bg-gray-800"
            : "hover:bg-gray-100"
        }`}
      >
        <FiArrowLeft className={`w-5 h-5 ${textPrimary}`} />
      </button>

      <div>
        <h1
          className={`text-xl sm:text-2xl lg:text-3xl font-bold 
            ${theme === "dark"
              ? "bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent"
              : "bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
            }`}
        >
          Wallet Recharge
        </h1>

        <p className={`text-xs sm:text-sm ${textMuted} mt-1`}>
          Add funds instantly with secure payment methods
        </p>
      </div>
    </div>

    {/* RIGHT SIDE */}
    <div className="flex items-center gap-3 w-full sm:w-auto">

      {/* Balance Card */}
      <div
        className={`flex-1 sm:flex-none px-4 py-2 rounded-xl 
          ${theme === "dark"
            ? "bg-gray-800 border border-gray-700"
            : "bg-gray-50 border border-gray-200"
          }`}
      >
        <span className={`text-xs ${textMuted}`}>Balance: </span>
        <span
          className={`text-base sm:text-lg font-bold ${
            theme === "dark"
              ? "text-green-400"
              : "text-green-600"
          }`}
        >
          <BiRupee className="inline mr-1" />
          {(user.balance || 0).toLocaleString()}
        </span>
      </div>

      {/* History Button */}
      <button
        onClick={() => navigate("/deposit-history")}
        className="px-4 py-2 rounded-xl font-medium flex items-center gap-2
          bg-gradient-to-r from-blue-600 to-indigo-600 text-white
          hover:shadow-lg hover:shadow-blue-500/30 transition-all"
      >
        <MdHistory className="w-4 h-4 sm:w-5 sm:h-5" />
        {!isMobile && "History"}
      </button>

    </div>
  </div>
</div>


        {/* Main Grid Layout */}
        <div className=" ">
          {/* Left Column - Deposit Form */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Balance Card */}
            {/* <div className={`${cardBg} rounded-2xl sm:rounded-3xl border ${borderColor} p-4 sm:p-6 shadow-xl ${shadowColor}`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`p-2 sm:p-3 rounded-xl ${
                    theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'
                  }`}>
                    <MdAccountBalanceWallet className={`text-2xl sm:text-3xl ${
                      theme === 'dark' ? 'text-green-400' : 'text-green-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className={`text-xs sm:text-sm font-medium ${textMuted} mb-1`}>
                      Available Balance
                    </h3>
                    <div className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${
                      theme === 'dark' ? 'text-green-400' : 'text-green-600'
                    }`}>
                      <BiRupee className="inline mr-1" />
                      {(user.balance || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className={`w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-3 rounded-xl border ${
                  theme === 'dark' ? 'border-green-500/30 bg-green-500/10' : 'border-green-200 bg-green-50'
                }`}>
                  <div className="text-center">
                    <div className={`text-xs ${textMuted}`}>Daily Limit</div>
                    <div className={`text-base sm:text-lg font-bold ${textPrimary}`}>₹50,000</div>
                  </div>
                </div>
              </div>
            </div> */}

            {/* Quick Deposit Amounts */}
            <div className={`${cardBg} rounded-2xl sm:rounded-3xl border ${borderColor} p-4 sm:p-6 shadow-xl ${shadowColor}`}>
              <h3 className={`text-base sm:text-lg font-semibold mb-4 sm:mb-6 ${textPrimary} flex items-center gap-2`}>
                <TbReportMoney className={`${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                Quick Deposit
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {quickDepositAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleQuickDeposit(amount)}
                    className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 ${
                      depositAmount === amount.toString()
                        ? theme === 'dark'
                          ? 'border-green-500 bg-green-600/10 shadow-lg shadow-green-600/20'
                          : 'border-green-500 bg-green-50 shadow-lg shadow-green-400/20'
                        : `${borderColor} hover:border-green-400/50`
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-2 ${
                        depositAmount === amount.toString()
                          ? theme === 'dark'
                            ? 'bg-green-500/20'
                            : 'bg-green-100'
                          : theme === 'dark'
                            ? 'bg-gray-800'
                            : 'bg-gray-100'
                      }`}>
                        <GiMoneyStack className={`text-lg sm:text-xl ${
                          depositAmount === amount.toString()
                            ? theme === 'dark'
                              ? 'text-green-400'
                              : 'text-green-600'
                            : textMuted
                        }`} />
                      </div>
                      <span className={`text-base sm:text-lg font-bold ${
                        depositAmount === amount.toString()
                          ? theme === 'dark'
                            ? 'text-green-400'
                            : 'text-green-600'
                          : textPrimary
                      }`}>
                        <BiRupee className="inline mr-1" />
                        {amount.toLocaleString()}
                      </span>
                      {amount === 10000 && (
                        <span className={`text-[10px] sm:text-xs mt-1 px-2 py-0.5 rounded-full ${
                          theme === 'dark'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-green-100 text-green-600'
                        }`}>
                          Popular
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className={`${cardBg} rounded-2xl sm:rounded-3xl border ${borderColor} p-4 sm:p-6 shadow-xl ${shadowColor}`}>
              <h3 className={`text-base sm:text-lg font-semibold mb-4 sm:mb-6 ${textPrimary}`}>
                Custom Amount
              </h3>
              
              <div className="relative mb-4 sm:mb-6">
                <div className="flex items-center">
                  <span className={`absolute left-4 text-lg sm:text-xl font-bold ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}>₹</span>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={handleAmountChange}
                    placeholder={`Enter amount (Min ₹${currentMethod?.minAmount || 100})`}
                    className={`w-full pl-10 pr-4 py-3 sm:py-4 text-base sm:text-lg ${inputBg} border-2 ${
                      depositAmount ? 'border-green-400/50' : borderColor
                    } rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-400 transition-all ${textPrimary}`}
                    min={currentMethod?.minAmount || 100}
                    step="100"
                  />
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className={`${cardBg} rounded-2xl sm:rounded-3xl border ${borderColor} p-4 sm:p-6 shadow-xl ${shadowColor}`}>
              <h3 className={`text-base sm:text-lg font-semibold mb-4 sm:mb-6 ${textPrimary}`}>
                Select Payment Method
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const isSelected = selectedPaymentMethod === method.id;
                  
                  return (
                    <button
                      key={method.id}
                      onClick={() => handlePaymentMethodChange(method.id)}
                      className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 ${
                        isSelected
                          ? theme === 'dark'
                            ? `border-${method.color}-500 bg-${method.color}-600/10`
                            : `border-${method.color}-500 bg-${method.color}-50`
                          : `${borderColor} hover:border-${method.color}-400/50`
                      }`}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className={`p-2 sm:p-3 rounded-xl mb-2 ${
                          isSelected
                            ? theme === 'dark'
                              ? `bg-${method.color}-500/20`
                              : `bg-${method.color}-100`
                            : theme === 'dark'
                              ? 'bg-gray-800'
                              : 'bg-gray-100'
                        }`}>
                          <Icon className={`text-xl sm:text-2xl ${
                            isSelected
                              ? theme === 'dark'
                                ? `text-${method.color}-400`
                                : `text-${method.color}-600`
                              : textMuted
                          }`} />
                        </div>
                        <div>
                          <div className={`font-semibold text-sm sm:text-base mb-1 ${
                            isSelected
                              ? theme === 'dark'
                                ? `text-${method.color}-400`
                                : `text-${method.color}-600`
                              : textPrimary
                          }`}>
                            {method.name}
                          </div>
                          <div className={`text-[10px] sm:text-xs ${textMuted}`}>
                            {method.processingTime}
                          </div>
                        </div>
                        {isSelected && (
                          <FiCheckCircle className={`text-base sm:text-lg mt-2 ${
                            theme === 'dark' ? 'text-green-400' : 'text-green-600'
                          }`} />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment Section - Only show when amount is selected */}
            {showPaymentSection && amountToPay >= (currentMethod?.minAmount || 100) && (
              <>
                {/* Payment Summary */}
                {renderPaymentSummary()}
                
                {/* Payment Method Specific Section */}
                {selectedPaymentMethod === 'UPI' && renderUpiSection()}
                {selectedPaymentMethod === 'USDT' && renderUsdtSection()}
                {selectedPaymentMethod === 'ZilPay' && renderZilPaySection()}
                
                {/* Terms and Conditions */}
                {renderTerms()}
                
                {/* Submit Button */}
                <button
                  onClick={handleSubmitPayment}
                  disabled={depositLoading || !agreeTerms}
                  className={`w-full py-3 sm:py-4 px-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base transition-all duration-300 ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-2xl hover:shadow-green-600/30 text-white'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-2xl hover:shadow-green-500/40 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                >
                  {depositLoading ? (
                    <>
                      <FiLoader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                      Complete {selectedPaymentMethod} Payment
                    </>
                  )}
                </button>
              </>
            )}

            {/* Show message when no amount selected */}
            {!showPaymentSection && (
              <div className={`p-6 sm:p-8 text-center ${cardBg} rounded-2xl sm:rounded-3xl border ${borderColor}`}>
                <GiMoneyStack className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 opacity-50 ${textMuted}`} />
                <h3 className={`text-base sm:text-lg font-semibold ${textPrimary} mb-2`}>
                  Select an Amount to Continue
                </h3>
                <p className={`text-xs sm:text-sm ${textMuted}`}>
                  Choose a quick deposit amount or enter a custom amount above
                </p>
              </div>
            )}
          </div>

         
        </div>
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Recharge;