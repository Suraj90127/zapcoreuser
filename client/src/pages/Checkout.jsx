import { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiCheckCircle, FiArrowLeft, FiShield, FiPackage, FiClock, FiAlertCircle, FiCheck, FiPercent,
  FiShoppingCart, FiAlertTriangle, FiLoader, FiCopy, FiDownload, FiEye, FiEyeOff, FiInfo, FiRefreshCw
} from 'react-icons/fi';
import { GiWallet } from 'react-icons/gi';
import { FaEthereum } from 'react-icons/fa';
import { TbCurrencyRupee } from 'react-icons/tb';
import { MdSecurity } from 'react-icons/md';
import { useTheme } from '../contexts/ThemeContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { upiRecharge, usdtRecharge, zilpayRecharge, fetchPaymentDetails } from '../reducer/walletSlice';
import { QRCodeSVG } from 'qrcode.react';
import { USDT_TO_INR } from '../utils/constant';

// const USDT_TO_INR = 92;

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

const Checkout = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isMobile = useIsMobile();
  const location = useLocation();
  // const { id } = useParams();

  // Redux state
  const { cartProviders, totalPayAmount, loading } = useSelector((state) => state.providers);
  const { user, } = useSelector((state) => state.auth);
  const { loading: walletLoading, paymentDetails } = useSelector((state) => state.wallet);

  // Get data from navigation state (coming from Cart or API Marketplace)
  const { state: locationState } = location;
  const { cartItems: cartItemsFromState, total: totalFromState, subtotal: subtotalFromState } = locationState || {};

  // This is the API data from Marketplace
  const apiData = locationState;
  console.log(apiData, "API Data from Marketplace");

  // Check if this is a cricket page purchase (coming from API Marketplace)
  const isCricketPage = apiData?.purchaseType === 'cricket';

  // Local state
  const [paymentMethod, setPaymentMethod] = useState('zilpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [upiFormData, setUpiFormData] = useState({ transactionId: '', remarks: 'Game Provider Purchase' });
  const [usdtFormData, setUsdtFormData] = useState({ transactionId: '', remarks: 'Game Provider Purchase' });
  const [showUpiId, setShowUpiId] = useState(false);
  const [showUsdtAddress, setShowUsdtAddress] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Coupon logic state
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Example coupon (simulate backend)
  const validCoupons = {
    SAVE10: {
      code: 'SAVE10',
      description: 'Flat 10% off',
      discountType: 'PERCENT',
      discountValue: 10,
    },
    GP50: {
      code: 'GP50',
      description: 'Flat ₹50 off',
      discountType: 'AMOUNT',
      discountValue: 50,
    }
  };

  // Create cart items array based on source
  let cartItems = [];
  if (isCricketPage && apiData?.cartItems) {
    // Coming from API Marketplace with single item
    cartItems = apiData.cartItems;
  } else if (cartItemsFromState) {
    // Coming from cart with items
    cartItems = cartItemsFromState;
  } else {
    // Coming from providers cart (Redux)
    cartItems = cartProviders || [];
  }

  // Order summary calculations
  const subtotalCalc = totalPayAmount || cartItems.reduce((sum, item) => sum + (Number(item.price) || 1999), 0);
  const bundleDiscountCalc = cartItems.length >= 3 ? subtotalCalc * 0.40 : 0;

  // Coupon Discount
  let couponDiscountCalc = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'PERCENT') {
      couponDiscountCalc = ((subtotalCalc - (isCricketPage ? (apiData?.discount || 0) : bundleDiscountCalc)) * appliedCoupon.discountValue) / 100;
    } else if (appliedCoupon.discountType === 'AMOUNT') {
      couponDiscountCalc = appliedCoupon.discountValue;
    }
    // prevent negative/over-discount
    couponDiscountCalc = Math.min(couponDiscountCalc, subtotalCalc);
  }

  // Calculate totals based on source & apply coupon
  const subtotal = isCricketPage 
    ? (apiData?.subtotal || subtotalCalc)
    : (typeof subtotalFromState === 'number' ? subtotalFromState : subtotalCalc);

  const totalBeforeCoupon = isCricketPage
    ? (typeof totalFromState === 'number' ? totalFromState : subtotalCalc - (apiData?.discount || 0))
    : (typeof totalFromState === 'number' ? totalFromState : (subtotalCalc - bundleDiscountCalc));
  const total = Math.max((totalBeforeCoupon - couponDiscountCalc), 0);

  // Single currency format: ₹ with en-IN
  const formatCurrency = (value) => `₹${Number(value).toLocaleString('en-IN')}`;

  // USDT calculations (converted to USD for display/amount)
  const usdtAmount = Number((total / USDT_TO_INR).toFixed(2));

  // UPI QR generation
  const upiQrString = paymentDetails?.upi
    ? `upi://pay?pa=${paymentDetails.upi}&pn=${user?.name || 'Customer'}&am=${total}&tn=Game Provider Purchase&cu=INR`
    : '';

  // USDT QR value (USDT address)
  const usdtQrString = paymentDetails?.usdtAddress || '';

  // Supported payment methods
  const paymentMethods = [
    {
      id: 'upi',
      name: 'UPI',
      icon: FiShoppingCart,
      description: 'Pay via UPI (Google Pay, PhonePe, etc)',
      color: 'purple'
    },
    {
      id: 'usdt',
      name: 'USDT',
      icon: FaEthereum,
      description: 'Pay with USDT (Crypto)',
      color: 'blue'
    },
    {
      id: 'zilpay',
      name: 'ZilPay',
      icon: GiWallet,
      description: 'Pay with ZilPay (ZIL Crypto)',
      color: 'orange'
    }
  ];

  useEffect(() => {
    if (user) dispatch(fetchPaymentDetails());
  }, [dispatch, user]);

  // Coupon logic
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponLoading(true);
    setCouponError('');
    setTimeout(() => { // simulate async API call
      const entered = coupon.trim().toUpperCase();
      if (entered && validCoupons[entered]) {
        setAppliedCoupon(validCoupons[entered]);
        setCouponError('');
      } else {
        setAppliedCoupon(null);
        setCouponError('Invalid coupon code');
      }
      setCouponLoading(false);
    }, 700);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCoupon('');
    setCouponError('');
  };

  // Refresh handler
  const handleRefreshDetails = async () => {
    setIsRefreshing(true);
    try {
      await dispatch(fetchPaymentDetails()).unwrap();
      toast.success('Payment details refreshed!', { theme });
    } catch {
      toast.error('Failed to refresh details', { theme });
    }
    setIsRefreshing(false);
  };

  // UPI copy helpers
  const copyUpiId = () => {
    if (paymentDetails?.upi) {
      navigator.clipboard.writeText(paymentDetails.upi);
      toast.success('UPI ID copied to clipboard!', { theme });
    }
  };

  const copyUsdtAddress = () => {
    if (paymentDetails?.usdtAddress) {
      navigator.clipboard.writeText(paymentDetails.usdtAddress);
      toast.success('USDT Address copied to clipboard!', { theme });
    }
  };

  // QR Copy/Download
  const copyUpiQrToClipboard = async () => {
    try {
      const canvas = document.querySelector('#upi-qr-code canvas');
      if (canvas) {
        canvas.toBlob(async (blob) => {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          toast.success('QR Code copied to clipboard!', { theme });
        });
      }
    } catch {
      toast.error('Failed to copy QR code', { theme });
    }
  };

  const downloadUpiQr = () => {
    const canvas = document.querySelector('#upi-qr-code canvas');
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `UPI-Payment-${total}-${Date.now()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      toast.success('QR Code downloaded!', { theme });
    }
  };

  const copyUsdtQrToClipboard = async () => {
    try {
      const canvas = document.querySelector('#usdt-qr-code canvas');
      if (canvas) {
        canvas.toBlob(async (blob) => {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          toast.success('QR Code copied to clipboard!', { theme });
        });
      }
    } catch {
      toast.error('Failed to copy QR code', { theme });
    }
  };

  const downloadUsdtQr = () => {
    const canvas = document.querySelector('#usdt-qr-code canvas');
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `USDT-Payment-${usdtAmount}-${Date.now()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      toast.success('QR Code downloaded!', { theme });
    }
  };

  // Input handlers
  const handleInputChange = (e) => {
    if (e.target.name === 'agreeTerms') setAgreeTerms(e.target.checked);
  };

  const handleUpiInputChange = (e) => {
    const { name, value } = e.target;
    setUpiFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUsdtInputChange = (e) => {
    const { name, value } = e.target;
    setUsdtFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit Handlers
  const handleUpiPayment = async () => {
    if (!upiFormData.transactionId) {
      toast.error('Please enter transaction ID (UTR)', { theme });
      return;
    }
    if (!agreeTerms) {
      toast.error('You must agree to the Terms before proceeding.', { theme });
      return;
    }
    setIsProcessing(true);
    try {
      const payload = {
        money: parseFloat(total),
        utr: upiFormData.transactionId,
        type: isCricketPage ? 'cricket' : 'provider_buy', // Fixed: cricket for cricket page, provider_buy for others
         providers:cartItems,
         months: apiData?.months || 0, // default to 1 month if not provided
          method: 'UPI',
        ...(isCricketPage && {
          itemType: 'API_KEY',
          sport: apiData?.sport,
          itemId: apiData?.id,
          itemName: apiData?.name
        })
      };
      await dispatch(upiRecharge(payload)).unwrap();
      toast.success('Payment successful!', { position: "top-center", autoClose: 5000, theme });
      setUpiFormData({ transactionId: '', remarks: 'Game Provider Purchase' });
      setTimeout(() => { navigateToSuccessPage('upi'); }, 2000);
    } catch (error) {
      toast.error(error || 'UPI payment failed. Please try again.', { theme });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUsdtPayment = async () => {
    if (!usdtFormData.transactionId) {
      toast.error('Please enter transaction Hash (TXID)', { theme });
      return;
    }
    if (!agreeTerms) {
      toast.error('You must agree to the Terms before proceeding.', { theme });
      return;
    }
    setIsProcessing(true);
    try {
      const payload = {
        money: parseFloat(usdtAmount),
        type: isCricketPage ? 'cricket' : 'provider_buy', // Fixed: cricket for cricket page, provider_buy for others
        method: 'USDT',
        txHash: usdtFormData.transactionId,
         providers:cartItems,
          months: apiData?.months || 0,
        ...(isCricketPage && {
          itemType: 'API_KEY',
          sport: apiData?.sport,
          itemId: apiData?.id,
          itemName: apiData?.name
        })
      };
      await dispatch(usdtRecharge(payload)).unwrap();
      toast.success('Payment successful!', { position: "top-center", autoClose: 5000, theme });
      setUsdtFormData({ transactionId: '', remarks: 'Game Provider Purchase' });
      setTimeout(() => { navigateToSuccessPage('usdt'); }, 2000);
    } catch (error) {
      toast.error(error || 'USDT payment failed. Please try again.', { theme });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleZilPayPayment = async () => {
    if (!agreeTerms) {
      toast.error('You must agree to the Terms before proceeding.', { theme });
      return;
    }
    setIsProcessing(true);
    try {
      const payload = {
        money: total,
        type: isCricketPage ? 'cricket' : 'provider_buy', // Fixed: cricket for cricket page, provider_buy for others
        providers:cartItems,
        method: 'zilpay',
         months: apiData?.months || 0,
        ...(isCricketPage && {
          itemType: 'API_KEY',
          sport: apiData?.sport,
          itemId: apiData?.id,
          itemName: apiData?.name

        })
      };
      const response = await dispatch(zilpayRecharge(payload)).unwrap();
      if (response?.data && response.data.url) {
        window.open(response.data.url, '_blank', 'noopener,noreferrer');
        toast.success('Redirecting to ZilPay Gateway...', { theme });
        setTimeout(() => navigateToSuccessPage('zilpay'), 3000);
      } else {
        toast.error('Failed to initiate ZilPay payment', { theme });
        setIsProcessing(false);
      }
    } catch (error) {
      toast.error(error || 'ZilPay payment failed. Please try again.', { theme });
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      toast.error('You must agree to the Terms before proceeding.', { theme });
      return;
    }
    switch (paymentMethod) {
      case 'upi':
        await handleUpiPayment();
        break;
      case 'usdt':
        await handleUsdtPayment();
        break;
      case 'zilpay':
        await handleZilPayPayment();
        break;
      default:
        toast.error('Please select a payment method', { theme });
    }
  };

  // Navigation to success page
  const navigateToSuccessPage = (method) => {
    const orderId = `ORD${Date.now().toString().slice(-8)}`;
    navigate('/checkout/success', {
      state: {
        orderId,
        total,
        subtotal,
        items: cartItems,
        paymentMethod: method,
        date: new Date().toISOString(),
        user: {
          name: user?.name || 'Customer',
          email: user?.email
        },
        ...(isCricketPage && {
          purchaseType: 'cricket',
          sport: apiData?.sport,
          itemName: apiData?.name
        })
      }
    });
  };

  // Theme colors
  const themeColors = {
    dark: {
      bg: 'bg-gradient-to-b from-gray-900 to-black',
      card: 'bg-gradient-to-br from-gray-800/50 to-gray-900/50',
      text: 'text-white',
      textSecondary: 'text-gray-300',
      textMuted: 'text-gray-400',
      border: 'border-gray-700',
      input: 'bg-gray-800 border-gray-700 text-white placeholder-gray-500',
      hover: 'hover:bg-gray-800/70',
      primary: 'from-blue-600 to-indigo-600'
    },
    light: {
      bg: 'bg-gradient-to-b from-gray-50 to-white',
      card: 'bg-gradient-to-br from-white to-gray-50',
      text: 'text-gray-900',
      textSecondary: 'text-gray-700',
      textMuted: 'text-gray-600',
      border: 'border-gray-200',
      input: 'bg-white border-gray-300 text-gray-900 placeholder-gray-400',
      hover: 'hover:bg-gray-100/70',
      primary: 'from-blue-500 to-indigo-500'
    }
  };
  const colors = themeColors[theme];

  // Empty cart check
  if (cartItems.length === 0 && !loading) {
    return (
      <div className={`min-h-screen ${colors.bg} py-8 px-4`}>
        <div className=" mx-auto">
          <button
            onClick={() => navigate(isCricketPage ? '/api-marketplace' : '/providers')}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl mb-8 transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900'
            }`}
          >
            <FiArrowLeft />
            Back to {isCricketPage ? 'API Marketplace' : 'Providers'}
          </button>
          <div className={`p-8 rounded-2xl text-center ${colors.card} border ${colors.border}`}>
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center">
              <FiShoppingCart className={`w-12 h-12 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
            </div>
            <h2 className={`text-2xl font-bold mb-3 ${colors.text}`}>Your cart is empty</h2>
            <p className={`mb-8 ${colors.textMuted}`}>
              Add some {isCricketPage ? 'API keys' : 'game providers'} to your cart before checkout
            </p>
            <button
              onClick={() => navigate(isCricketPage ? '/api-marketplace' : '/providers')}
              className={`px-8 py-3 rounded-xl font-bold bg-gradient-to-r ${colors.primary} text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
            >
              Browse {isCricketPage ? 'APIs' : 'Providers'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Progress bar component
  const renderProgressBar = () => (
    <div className="flex items-center justify-between w-full">
      {/* Cart Step */}
      <div className="flex flex-col items-center sm:flex-row sm:items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center
          ${theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'}`}>
          <FiCheck className="w-4 h-4" />
        </div>
        {!isMobile && (
          <div className="ml-3">
            <p className={`text-sm font-medium ${colors.text}`}>Cart</p>
            <p className={`text-xs ${colors.textMuted}`}>Items selected</p>
          </div>
        )}
      </div>
      {/* Progress Line */}
      <div className="flex-1 h-0.5 mx-2 sm:mx-4 bg-gray-700"></div>
      {/* Payment Step */}
      <div className="flex flex-col items-center sm:flex-row sm:items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center
          ${theme === 'dark' ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white'}`}>
          <span className="text-sm font-bold">2</span>
        </div>
        {!isMobile && (
          <div className="ml-3">
            <p className={`text-sm font-medium ${colors.text}`}>Payment</p>
            <p className={`text-xs ${colors.textMuted}`}>Enter details</p>
          </div>
        )}
      </div>
      <div className="flex-1 h-0.5 mx-2 sm:mx-4 bg-gray-700"></div>
      {/* Confirmation Step */}
      <div className="flex flex-col items-center sm:flex-row sm:items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center
          ${theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'}`}>
          <span className="text-sm font-bold">3</span>
        </div>
        {!isMobile && (
          <div className="ml-3">
            <p className={`text-sm font-medium ${colors.textSecondary}`}>Confirmation</p>
            <p className={`text-xs ${colors.textMuted}`}>Order complete</p>
          </div>
        )}
      </div>
    </div>
  );

  // --- Render UPI Section ---
  const renderUpiSection = () => (
    <div className={`rounded-2xl ${colors.card} border ${colors.border} p-4 sm:p-6 mt-4`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-lg sm:text-xl font-bold ${colors.text}`}>
          <TbCurrencyRupee className="inline mr-2" />
          UPI Payment
        </h3>
        <button
          onClick={handleRefreshDetails}
          disabled={isRefreshing}
          className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
        >
          <FiRefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''} ${colors.textMuted}`} />
        </button>
      </div>
      {paymentDetails?.upi ? (
        <>
          <div className={`mb-5 p-3 sm:p-4 rounded-xl ${
            theme === 'dark' ? 'bg-purple-900/20 border border-purple-800/30' : 'bg-purple-50 border border-purple-200'
          }`}>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <FiInfo className="w-5 h-5 text-purple-500" />
                <span className={`font-bold ${colors.text}`}>Send Payment To</span>
              </div>
              <button
                onClick={copyUpiId}
                className={`px-2 py-1 rounded-lg text-xs sm:text-sm flex items-center gap-2 ${
                  theme === 'dark'
                    ? 'bg-purple-700 hover:bg-purple-600'
                    : 'bg-purple-600 hover:bg-purple-700'
                } text-white`}
              >
                <FiCopy className="w-3 h-3" />
                Copy UPI ID
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className={`text-xs sm:text-sm ${colors.textMuted}`}>UPI ID:</span>
                <div className="flex items-center gap-2">
                  {showUpiId
                    ? <span className={`font-mono text-xs sm:text-sm ${colors.text}`}>{paymentDetails.upi}</span>
                    : <span className={`font-mono text-xs sm:text-sm ${colors.text}`}>••••••••@upi</span>
                  }
                  <button
                    onClick={() => setShowUpiId(!showUpiId)}
                    className="text-purple-500 hover:text-purple-400"
                  >
                    {showUpiId ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-xs sm:text-sm ${colors.textMuted}`}>Name:</span>
                <span className={`font-medium text-xs sm:text-sm ${colors.text}`}>{user?.name || 'Customer'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-xs sm:text-sm ${colors.textMuted}`}>Amount to Pay:</span>
                <span className={`font-bold text-base sm:text-lg text-green-500`}>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
          
          {/* QR Code */}
          <div className="mb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 sm:mb-3 gap-2 sm:gap-0">
              <label className={`block text-xs sm:text-sm font-medium ${colors.text}`}>
                Scan QR Code to Pay
              </label>
              <div className="flex gap-2">
                <button
                  onClick={copyUpiQrToClipboard}
                  className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm flex items-center gap-1 ${
                    theme === 'dark'
                      ? 'bg-purple-700 hover:bg-purple-600'
                      : 'bg-purple-600 hover:bg-purple-700'
                  } text-white`}
                >
                  <FiCopy className="w-3 h-3" />
                  Copy QR
                </button>
                <button
                  onClick={downloadUpiQr}
                  className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm flex items-center gap-1 ${
                    theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  <FiDownload className="w-3 h-3" />
                  Save
                </button>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="inline-block p-3 sm:p-6 bg-white rounded-xl shadow-lg" id="upi-qr-code">
                <QRCodeSVG
                  value={upiQrString}
                  size={isMobile ? 150 : 200}
                  fgColor="#000000"
                  bgColor="#ffffff"
                  level="H"
                  includeMargin={true}
                />
                <div className="mt-2 sm:mt-4">
                  <p className={`text-xs sm:text-sm font-medium ${colors.text}`}>
                    Amount: <span className="text-green-600 font-bold">{formatCurrency(total)}</span>
                  </p>
                  <p className={`text-xs ${colors.textMuted}`}>
                    Scan with any UPI app
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Transaction Details */}
          <div className="space-y-3 sm:space-y-4 mt-4">
            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${colors.text}`}>Transaction ID (UTR) *</label>
              <input
                type="text"
                name="transactionId"
                value={upiFormData.transactionId}
                onChange={handleUpiInputChange}
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Enter UPI transaction reference number"
              />
              <p className={`text-xs mt-1 ${colors.textMuted}`}>
                Find this in your bank statement or UPI app
              </p>
            </div>
            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${colors.text}`}>Remarks</label>
              <input
                type="text"
                name="remarks"
                value={upiFormData.remarks}
                readOnly
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Enter remarks for payment"
              />
            </div>
          </div>
          <p className={`text-xs text-center mt-3 ${colors.textMuted}`}>
            Note: Payment verification may take 5-10 minutes.
          </p>
        </>
      ) : (
        <div className={`mb-6 p-4 rounded-xl ${
          theme === 'dark'
            ? 'bg-red-900/20 border border-red-800/30'
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-2 text-red-500">
            <FiAlertCircle className="w-5 h-5" />
            <span className="font-medium">UPI details not available</span>
          </div>
          <p className={`text-sm mt-2 ${colors.textMuted}`}>
            Please contact support or try another payment method.
          </p>
        </div>
      )}
    </div>
  );

  // --- Render USDT Section ---
  const renderUsdtSection = () => (
    <div className={`rounded-2xl ${colors.card} border ${colors.border} p-4 sm:p-6 mt-4`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-lg sm:text-xl font-bold ${colors.text}`}>
          <FaEthereum className="inline mr-2" />
          USDT Payment
        </h3>
        <button
          onClick={handleRefreshDetails}
          disabled={isRefreshing}
          className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
        >
          <FiRefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''} ${colors.textMuted}`} />
        </button>
      </div>
      {paymentDetails?.usdtAddress ? (
        <>
          <div className={`mb-5 p-3 sm:p-4 rounded-xl ${
            theme === 'dark' ? 'bg-blue-900/20 border border-blue-800/30' : 'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <FaEthereum className="w-5 h-5 text-blue-500" />
                <span className={`font-bold ${colors.text}`}>Send USDT To</span>
              </div>
              <button
                onClick={copyUsdtAddress}
                className={`px-2 py-1 rounded-lg text-xs sm:text-sm flex items-center gap-2 ${
                  theme === 'dark'
                    ? 'bg-blue-700 hover:bg-blue-600'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                <FiCopy className="w-3 h-3" />
                Copy Address
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className={`text-xs sm:text-sm ${colors.textMuted}`}>USDT Address:</span>
                <div className="flex items-center gap-2">
                  {showUsdtAddress
                    ? <span className={`font-mono text-xs sm:text-xs ${colors.text} break-all`}>{paymentDetails.usdtAddress}</span>
                    : <span className={`font-mono text-xs sm:text-xs ${colors.text}`}>••••••••••••••••••••••••••••••••</span>
                  }
                  <button
                    onClick={() => setShowUsdtAddress(!showUsdtAddress)}
                    className="text-blue-500 hover:text-blue-400 flex-shrink-0"
                  >
                    {showUsdtAddress ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-xs sm:text-sm ${colors.textMuted}`}>Amount to Pay:</span>
                <span className={`font-bold text-base sm:text-lg text-green-500`}>{usdtAmount} USDT</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-xs sm:text-xs ${colors.textMuted}`}>INR Value</span>
                <span className={`font-bold text-xs sm:text-sm text-gray-800 dark:text-white`}>{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-xs sm:text-xs ${colors.textMuted}`}>Conversion Rate</span>
                <span className={`font-medium text-xs sm:text-sm`}>1 USDT = {formatCurrency(USDT_TO_INR)}</span>
              </div>
            </div>
          </div>
          
          {/* QR Code */}
          <div className="mb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 sm:mb-3 gap-2 sm:gap-0">
              <label className={`block text-xs sm:text-sm font-medium ${colors.text}`}>
                Scan QR Code to Copy USDT Address
              </label>
              <div className="flex gap-2">
                <button
                  onClick={copyUsdtQrToClipboard}
                  className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm flex items-center gap-1 ${
                    theme === 'dark'
                      ? 'bg-blue-700 hover:bg-blue-600'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white`}
                >
                  <FiCopy className="w-3 h-3" />
                  Copy QR
                </button>
                <button
                  onClick={downloadUsdtQr}
                  className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm flex items-center gap-1 ${
                    theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  <FiDownload className="w-3 h-3" />
                  Save
                </button>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="inline-block p-3 sm:p-6 bg-white rounded-xl shadow-lg" id="usdt-qr-code">
                {paymentDetails.usdtImage ? (
                  <img src={paymentDetails.usdtImage} alt="USDT QR" className="w-[150px] h-[150px] sm:w-[200px] sm:h-[200px]" />
                ) : (
                  <QRCodeSVG
                    value={usdtQrString}
                    size={isMobile ? 150 : 200}
                    fgColor="#000000"
                    bgColor="#ffffff"
                    level="H"
                    includeMargin={true}
                  />
                )}
                <div className="mt-2 sm:mt-4">
                  <p className={`text-xs sm:text-sm font-medium ${colors.text}`}>
                    Address: <span className="font-bold">{paymentDetails.usdtAddress.substring(0, 6)}•••{paymentDetails.usdtAddress.slice(-6)}</span>
                  </p>
                  <p className={`text-xs ${colors.textMuted}`}>
                    Scan with wallet to paste address
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Transaction Details */}
          <div className="space-y-3 sm:space-y-4 mt-4">
            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${colors.text}`}>Transaction Hash (TXID) *</label>
              <input
                type="text"
                name="transactionId"
                value={usdtFormData.transactionId}
                onChange={handleUsdtInputChange}
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Enter blockchain transaction hash"
              />
              <p className={`text-xs mt-1 ${colors.textMuted}`}>
                Paste the hash from your crypto wallet after you send USDT
              </p>
            </div>
            <div>
              <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${colors.text}`}>Remarks</label>
              <input
                type="text"
                name="remarks"
                value={usdtFormData.remarks}
                readOnly
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Enter remarks for payment"
              />
            </div>
          </div>
          <p className={`text-xs text-center mt-3 ${colors.textMuted}`}>
            Note: Blockchain confirmation may take 5-15 minutes.
          </p>
        </>
      ) : (
        <div className={`mb-6 p-4 rounded-xl ${
          theme === 'dark'
            ? 'bg-red-900/20 border border-red-800/30'
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-2 text-red-500">
            <FiAlertCircle className="w-5 h-5" />
            <span className="font-medium">USDT details not available</span>
          </div>
          <p className={`text-sm mt-2 ${colors.textMuted}`}>
            Please contact support or try another payment method.
          </p>
        </div>
      )}
    </div>
  );

  // --- Render ZilPay Section ---
  const renderZilPaySection = () => (
    <div className={`rounded-2xl ${colors.card} border ${colors.border} p-4 sm:p-6 mt-4`}>
      <h3 className={`text-lg sm:text-xl font-bold mb-4 ${colors.text}`}>
        <GiWallet className="inline mr-2" />
        ZilPay Payment
      </h3>
      <div className={`p-3 sm:p-4 rounded-xl mb-6 ${
        theme === 'dark'
          ? 'bg-orange-900/20 border border-orange-800/30'
          : 'bg-orange-50 border border-orange-200'
      }`}>
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <GiWallet className="w-6 h-6 text-orange-500" />
          <div>
            <h3 className={`font-bold ${colors.text}`}>Instant ZilPay Payment</h3>
            <p className={`text-xs sm:text-sm ${colors.textMuted}`}>
              Pay directly with ZIL cryptocurrency
            </p>
          </div>
        </div>
        <p className={`text-xs sm:text-sm mb-4 ${colors.textMuted}`}>
          Total Amount: <span className="font-bold text-green-500">{formatCurrency(total)}</span>
        </p>
        <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <FiCheckCircle className="w-4 h-4 text-green-500" />
            <span className={colors.textMuted}>Secure ZIL cryptocurrency payment</span>
          </div>
          <div className="flex items-center gap-2">
            <FiCheckCircle className="w-4 h-4 text-green-500" />
            <span className={colors.textMuted}>Instant confirmation</span>
          </div>
          <div className="flex items-center gap-2">
            <FiCheckCircle className="w-4 h-4 text-green-500" />
            <span className={colors.textMuted}>Low transaction fees</span>
          </div>
        </div>
      </div>
      <button
        onClick={handleZilPayPayment}
        disabled={isProcessing || !agreeTerms}
        className={`w-full py-3 rounded-xl font-bold ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-orange-900/50 disabled:to-red-900/50'
            : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-orange-300 disabled:to-red-300'
        } text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
      >
        {isProcessing ? (
          <>
            <FiLoader className="w-5 h-5 animate-spin" />
            {isMobile ? 'Processing...' : 'Processing ZilPay Payment...'}
          </>
        ) : (
          <>
            <GiWallet className="w-5 h-5" />
            {isMobile ? 'Pay with ZilPay' : `Pay with ZilPay - ${formatCurrency(total)}`}
          </>
        )}
      </button>
      <p className={`text-xs text-center mt-3 ${colors.textMuted}`}>
        You will be redirected to ZilPay gateway.
      </p>
    </div>
  );

  return (
    <div className={`min-h-screen ${colors.bg} py-4 sm:py-6 lg:py-8 px-2 sm:px-4 lg:px-6`}>
      <ToastContainer />
      <div className=" mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className={`p-3 sm:p-6 rounded-2xl ${colors.card} border ${colors.border}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
            <div>
              <button
                onClick={() => navigate(isCricketPage ? '/api-marketplace' : '/cart')}
                className={`flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg mb-3 sm:mb-4 transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900'
                }`}
              >
                <FiArrowLeft className="w-4 h-4" />
                <span className="text-xs sm:text-sm font-medium">
                  Back to {isCricketPage ? 'API Marketplace' : 'Cart'}
                </span>
              </button>
              <h1 className={`text-xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 ${colors.text}`}>
                Secure Checkout
              </h1>
              <p className={`text-xs sm:text-base ${colors.textMuted}`}>
                {isCricketPage 
                  ? 'Complete your API key purchase in just a few steps'
                  : 'Complete your purchase in just a few steps'
                }
              </p>
            </div>
            <div className="flex flex-col items-end">
              <div className={`px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold ${
                theme === 'dark'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-blue-100 text-blue-600'
              }`}>
                Order ID: <span className="font-black">ORD{Date.now().toString().slice(-6)}</span>
              </div>
              <p className={`text-xs mt-2 ${colors.textMuted}`}>
                {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in cart
              </p>
              {isCricketPage && (
                <p className={`text-xs mt-1 ${colors.textMuted} capitalize`}>
                  Type: {apiData?.sport || 'API'} License
                </p>
              )}
            </div>
          </div>
          <div className="mb-2">{renderProgressBar()}</div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Payment + Terms */}
          <div className="lg:col-span-2 flex flex-col gap-5 sm:gap-6">
            {/* Payment Methods */}
            <div className={`rounded-2xl ${colors.card} border ${colors.border} overflow-hidden`}>
              <div className={`p-3 sm:p-6 border-b ${colors.border}`}>
                <h2 className={`text-lg sm:text-xl font-bold mb-1 sm:mb-2 ${colors.text}`}>
                  Payment Method
                </h2>
                <p className={`text-xs sm:text-sm ${colors.textMuted}`}>Choose how you wish to pay</p>
              </div>
              <div className="p-3 sm:p-6">
                <div className="flex flex-col sm:grid sm:grid-cols-3 gap-3">
                  {paymentMethods.map(method => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`flex flex-row items-center gap-3 p-3 rounded-xl border transition-all duration-300 text-left focus:outline-none
                          ${
                            paymentMethod === method.id
                              ? theme === 'dark'
                                ? `border-${method.color}-500 bg-${method.color}-500/20`
                                : `border-${method.color}-500 bg-${method.color}-50`
                              : theme === 'dark'
                                ? 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }
                          active:scale-95
                        `}
                        style={{ minHeight: 56 }}
                      >
                        <div className={`p-2 rounded-lg flex-shrink-0 ${
                          paymentMethod === method.id
                            ? theme === 'dark'
                              ? `bg-${method.color}-500/30`
                              : `bg-${method.color}-100`
                            : theme === 'dark'
                              ? 'bg-gray-800'
                              : 'bg-gray-100'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            paymentMethod === method.id
                              ? theme === 'dark'
                                ? `text-${method.color}-400`
                                : `text-${method.color}-600`
                              : theme === 'dark'
                                ? 'text-gray-400'
                                : 'text-gray-600'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-bold text-xs sm:text-sm leading-tight ${
                            paymentMethod === method.id
                              ? theme === 'dark' ? 'text-white' : 'text-gray-900'
                              : colors.text
                          }`}>{method.name}</h3>
                          <p className={`text-xs mt-0.5 ${
                            paymentMethod === method.id
                              ? theme === 'dark'
                                ? `text-${method.color}-300`
                                : `text-${method.color}-600`
                              : colors.textMuted
                          }`}>
                            {method.description}
                          </p>
                        </div>
                        {paymentMethod === method.id && (
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            theme === 'dark'
                              ? `bg-${method.color}-500`
                              : `bg-${method.color}-600`
                          }`}>
                            <FiCheck className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                
                {/* Render actual payment form */}
                {paymentMethod === 'upi' && renderUpiSection()}
                {paymentMethod === 'usdt' && renderUsdtSection()}
                {paymentMethod === 'zilpay' && renderZilPaySection()}
              </div>
            </div>
            
            {/* Terms & conditions */}
            <div className={`rounded-2xl ${colors.card} border ${colors.border}`}>
              <div className="p-3 sm:p-6">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    id="agreeTerms"
                    required
                    checked={agreeTerms}
                    onChange={handleInputChange}
                    className="w-5 h-5 mt-1 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="agreeTerms" className={`ml-3 text-xs sm:text-sm ${colors.text}`}>
                    I agree to the{' '}
                    <button type="button" className="text-blue-500 hover:underline">
                      Terms of Service
                    </button>
                    {' '}and{' '}
                    <button type="button" className="text-blue-500 hover:underline">
                      Privacy Policy
                    </button>
                    . I understand this is a one-time purchase for licensing rights and all sales are final.
                  </label>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => navigate(isCricketPage ? '/api-marketplace' : '/cart')}
                className={`w-full py-3 px-4 rounded-xl font-medium border
                  ${
                    theme === 'dark'
                      ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  } transition-all duration-300`}
              >
                Back
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isProcessing || walletLoading || !agreeTerms}
                className={`w-full py-3 px-4 rounded-xl font-bold bg-gradient-to-r ${colors.primary} text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                {isProcessing || walletLoading ? (
                  <>
                    <FiLoader className="w-5 h-5 animate-spin" />
                    {isMobile ? 'Processing...' : 'Complete Purchase'}
                  </>
                ) : (
                  <>
                    <FiCheck className="w-5 h-5" />
                    {isMobile ? `Pay ${formatCurrency(total)}` : `Complete Purchase - ${formatCurrency(total)}`}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-5 sm:space-y-6 relative">
            <div className={`rounded-2xl ${colors.card} border ${colors.border} overflow-hidden`}>
              <div className={`p-3 sm:p-6 border-b ${colors.border}`}>
                <h2 className={`text-lg sm:text-xl font-bold mb-1 sm:mb-2 ${colors.text}`}>Order Summary</h2>
                <p className={`text-xs sm:text-sm ${colors.textMuted}`}>
                  {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your order
                </p>
              </div>
              <div className="p-3 sm:p-6">
                {/* Items List */}
                <div className="space-y-2 sm:space-y-3 max-h-64 overflow-y-auto mb-5 sm:mb-6">
                  {cartItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 sm:gap-3 p-2 rounded-lg hover:bg-gray-800/20 transition-colors">
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.img || 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?q=80&w=500'}
                          alt={item.name || item.provider}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium text-xs sm:text-sm truncate ${colors.text}`}>
                          {item.name || item.provider}
                        </h4>
                        <p className={`text-xs ${colors.textMuted}`}>
                          {item.type === 'API_KEY' ? 'API License' : 'Provider License'}: {formatCurrency(item.price || 1999)}
                        </p>
                        {item.sport && (
                          <p className={`text-xs capitalize ${colors.textMuted}`}>
                            Sport: {item.sport}
                          </p>
                        )}
                        {item.features && item.features.length > 0 && (
                          <p className={`text-xs ${colors.textMuted} truncate max-w-[150px]`}>
                            Features: {item.features.join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className={`font-medium text-xs sm:text-sm ${colors.text}`}>
                          {formatCurrency(item.price || 1999)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* COUPON CODE */}
                <div className="mb-5 sm:mb-6">
                  <form className="flex flex-col sm:flex-row items-stretch gap-2" onSubmit={handleApplyCoupon}>
                    <input
                      type="text"
                      className={`flex-1 px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm`}
                      placeholder="Enter coupon code"
                      value={coupon}
                      onChange={e => { setCoupon(e.target.value); setCouponError(''); }}
                      disabled={appliedCoupon}
                    />
                    {!appliedCoupon ? (
                      <button
                        type="submit"
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold bg-gradient-to-r ${colors.primary} text-white hover:shadow-lg duration-200 text-xs sm:text-sm disabled:opacity-50`}
                        disabled={couponLoading || !coupon.trim()}
                      >
                        <FiPercent className="w-4 h-4" />
                        {couponLoading ? 'Applying...' : 'Apply Coupon'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold bg-red-500 text-white hover:bg-red-600 duration-200 text-xs sm:text-sm`}
                      >
                        Remove
                      </button>
                    )}
                  </form>
                  <div className="mt-1 min-h-[20px]">
                    {appliedCoupon && (
                      <span className="text-green-500 text-xs sm:text-sm font-semibold">
                        Applied: {appliedCoupon.code} — {appliedCoupon.description}
                      </span>
                    )}
                    {!!couponError && (
                      <span className="text-red-500 text-xs sm:text-sm">{couponError}</span>
                    )}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-1 sm:space-y-2 mb-5 sm:mb-6">
                  <div className="flex justify-between">
                    <span className={`text-xs sm:text-sm ${colors.textMuted}`}>Subtotal</span>
                    <span className={`font-medium text-xs sm:text-sm ${colors.text}`}>{formatCurrency(subtotal)}</span>
                  </div>
                  
                  {!isCricketPage && bundleDiscountCalc > 0 && (
                    <div className="flex justify-between">
                      <span className={`text-xs sm:text-sm ${colors.textMuted}`}>Bundle Discount (40%)</span>
                      <span className={`font-medium text-xs sm:text-sm text-green-500`}>-{formatCurrency(bundleDiscountCalc)}</span>
                    </div>
                  )}
                  
                  {isCricketPage && apiData?.discount > 0 && (
                    <div className="flex justify-between">
                      <span className={`text-xs sm:text-sm ${colors.textMuted}`}>Discount</span>
                      <span className={`font-medium text-xs sm:text-sm text-green-500`}>-{formatCurrency(apiData.discount)}</span>
                    </div>
                  )}
                  
                  {appliedCoupon && couponDiscountCalc > 0 && (
                    <div className="flex justify-between">
                      <span className={`text-xs sm:text-sm ${colors.textMuted}`}>Coupon ({appliedCoupon.code})</span>
                      <span className="font-medium text-xs sm:text-sm text-green-500">-{formatCurrency(couponDiscountCalc)}</span>
                    </div>
                  )}
                  
                  <div className={`pt-3 sm:pt-4 mt-3 sm:mt-4 border-t ${colors.border}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-base sm:text-lg font-bold ${colors.text}`}>Total Amount</span>
                      <div className="text-right">
                        <div className={`text-lg sm:text-2xl font-bold ${colors.text}`}>{formatCurrency(total)}</div>
                        <div className={`text-xs ${colors.textMuted}`}>One-time payment</div>
                      </div>
                    </div>
                    
                    {/* Method info */}
                    <div className={`mt-2 sm:mt-3 p-2 sm:p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100/50'}`}>
                      <div className="flex justify-between items-center">
                        <span className={`text-xs sm:text-sm ${colors.textMuted}`}>Payment Method</span>
                        <span className={`text-xs sm:text-sm font-medium ${colors.text}`}>
                          {paymentMethods.find(m => m.id === paymentMethod)?.name}
                        </span>
                      </div>
                      {isCricketPage && (
                        <div className="flex justify-between items-center mt-1">
                          <span className={`text-xs sm:text-sm ${colors.textMuted}`}>Purchase Type</span>
                          <span className={`text-xs sm:text-sm font-medium capitalize ${colors.text}`}>
                            {apiData?.sport || 'API'} License
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Security Badge */}
                <div className={`p-2 sm:p-3 rounded-xl ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-800/30'
                    : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <FiShield className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                    <span className={`text-xs sm:text-sm font-bold ${colors.text}`}>Secure Payment</span>
                  </div>
                  <p className={`text-xs ${colors.textMuted}`}>Your payment is protected with 256-bit SSL encryption. We never store your card details.</p>
                </div>
              </div>
            </div>

            {/* Security Features */}
            <div className={`rounded-2xl ${colors.card} border ${colors.border} p-3 sm:p-6`}>
              <h3 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 ${colors.text}`}>Why shop with us?</h3>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <FiShield className="w-4 h-4 text-green-500" />
                  </div>
                  <span className={`text-xs sm:text-sm ${colors.text}`}>256-bit SSL Encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <FiPackage className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className={`text-xs sm:text-sm ${colors.text}`}>Instant Digital Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <FiClock className="w-4 h-4 text-orange-500" />
                  </div>
                  <span className={`text-xs sm:text-sm ${colors.text}`}>24/7 Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <MdSecurity className="w-4 h-4 text-purple-500" />
                  </div>
                  <span className={`text-xs sm:text-sm ${colors.text}`}>PCI DSS Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;