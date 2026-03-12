import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  FiCheckCircle, FiDownload, FiMail, FiCalendar, 
  FiCopy, FiShoppingBag, FiHome, FiCheck,
  FiShield, FiPackage, FiClock, FiUser,
  FiExternalLink, FiChevronRight, FiShare2,
  FiPrinter, FiFileText, FiCreditCard, FiStar
} from 'react-icons/fi';
import { GiGamepad, GiTrophy } from 'react-icons/gi';
import { useTheme } from '../contexts/ThemeContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import confetti from 'canvas-confetti';

const CheckoutSuccess = () => {
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [showConfetti, setShowConfetti] = useState(true);

  // Default order data (tax, discount, shipping removed)
  const defaultOrder = {
    orderId: `ORD${Date.now().toString().slice(-8)}`,
    total: 0,
    subtotal: 0,
    items: [],
    paymentMethod: 'credit-card',
    date: new Date().toISOString(),
    user: {
      name: 'Customer',
      email: 'customer@example.com'
    }
  };

  useEffect(() => {
    // Get order data from location state or localStorage
    const orderData = location.state || JSON.parse(localStorage.getItem('lastOrder')) || defaultOrder;
    setOrderDetails(orderData);

    // Save to localStorage for persistence
    localStorage.setItem('lastOrder', JSON.stringify(orderData));

    // Redirect if no order data
    if (!location.state && !localStorage.getItem('lastOrder')) {
      navigate('/');
      return;
    }

    // Trigger confetti animation
    triggerConfetti();

    // Clear cart from localStorage
    localStorage.removeItem('gameProviderCart');

    // Send cart update event
    window.dispatchEvent(new Event('cartUpdated'));
  }, [location.state, navigate]);

  const triggerConfetti = () => {
    if (showConfetti) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });

      setTimeout(() => {
        confetti({
          particleCount: 100,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
      }, 250);

      setTimeout(() => {
        confetti({
          particleCount: 100,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 500);
    }
  };

  const handleCopyOrderId = () => {
    if (orderDetails?.orderId) {
      navigator.clipboard.writeText(orderDetails.orderId);
      toast.success('Order ID copied to clipboard!', {
        position: "top-right",
        theme,
        autoClose: 2000
      });
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleShareOrder = async () => {
    if (navigator.share && orderDetails) {
      try {
        await navigator.share({
          title: 'Order Confirmation',
          text: `I just purchased ${orderDetails.items?.length ?? 0} game providers for ₹${Number(orderDetails.total ?? 0).toLocaleString('en-IN')}!`,
          url: window.location.href
        });
      } catch (err) {
        if (process.env.NODE_ENV === 'development') console.warn('Share error:', err);
      }
    } else {
      handleCopyOrderId();
    }
  };

  const handleDownloadInvoice = () => {
    // Generate invoice PDF logic here
    toast.info('Invoice download started!', { theme });
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
      gradient: 'from-blue-600 to-indigo-600',
      success: 'from-green-600 to-emerald-600'
    },
    light: {
      bg: 'bg-gradient-to-b from-gray-50 to-white',
      card: 'bg-gradient-to-br from-white to-gray-50',
      text: 'text-gray-900',
      textSecondary: 'text-gray-700',
      textMuted: 'text-gray-600',
      border: 'border-gray-200',
      gradient: 'from-blue-500 to-indigo-500',
      success: 'from-green-500 to-emerald-500'
    }
  };

  const colors = themeColors[theme];

  if (!orderDetails) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${colors.bg}`}>
        <div className={`animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 ${
          theme === 'dark' ? 'border-blue-500' : 'border-blue-600'
        }`}></div>
        <p className={`mt-4 ${colors.textMuted}`}>Loading order details...</p>
      </div>
    );
  }

  // Defensive fallback, always ensure numbers and arrays for toLocaleString/map
  const orderId = orderDetails.orderId || defaultOrder.orderId;
  const total = typeof orderDetails.total === 'number' ? orderDetails.total : 0;
  const subtotal = typeof orderDetails.subtotal === 'number' ? orderDetails.subtotal : 0;
  const items = Array.isArray(orderDetails.items) ? orderDetails.items : [];
  const paymentMethod = orderDetails.paymentMethod || defaultOrder.paymentMethod;
  const date = orderDetails.date || defaultOrder.date;
  const user = orderDetails.user || defaultOrder.user;

  // Same currency format as Cart & Checkout: ₹ with en-IN
  const formatCurrency = (value) => `₹${Number(value).toLocaleString('en-IN')}`;

  const nextSteps = [
    {
      icon: FiMail,
      title: 'Email Confirmation',
      description: 'Receipt and provider credentials sent to your email',
      time: 'Immediately',
      color: 'blue'
    },
    {
      icon: FiPackage,
      title: 'API Documentation',
      description: 'Access integration guides and API documentation',
      time: 'Within 1 hour',
      color: 'purple'
    },
    {
      icon: GiGamepad,
      title: 'Provider Access',
      description: 'Get login credentials for your purchased providers',
      time: 'Within 24 hours',
      color: 'green'
    },
    {
      icon: FiDownload,
      title: 'Game Assets',
      description: 'Download game assets and integration files',
      time: 'Available now',
      color: 'orange'
    }
  ];

  const supportFeatures = [
    { icon: FiClock, text: '24/7 Technical Support', color: 'blue' },
    { icon: FiShield, text: 'Dedicated Account Manager', color: 'green' },
    { icon: FiStar, text: 'Priority Updates', color: 'yellow' },
    { icon: GiTrophy, text: 'VIP Customer Status', color: 'purple' }
  ];

  return (
    <div className={`min-h-screen ${colors.bg} py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6`}>
      <ToastContainer />
      
      <div className=" mx-auto space-y-6">
        {/* Success Header */}
        <div className={`rounded-2xl ${colors.card} border ${colors.border} overflow-hidden`}>
          <div className="relative p-6 sm:p-8 text-center">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-green-500/5 to-teal-500/5 rounded-full -translate-y-32 translate-x-32" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-500/3 to-indigo-500/3 rounded-full translate-y-48 -translate-x-48" />
            
            <div className="relative z-10">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/30">
                <FiCheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
              </div>
              
              <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-3 ${colors.text}`}>
                Payment Successful! 🎉
              </h1>
              
              <p className={`text-base sm:text-lg mb-6 max-w-xl mx-auto ${colors.textMuted}`}>
                Thank you for your purchase! Your order has been confirmed and is being processed.
              </p>
              
              {/* Order ID */}
              <div className={`inline-flex items-center gap-3 px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl mb-8 ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
                <span className={colors.textSecondary}>Order ID:</span>
                <span className={`font-bold text-sm sm:text-base ${colors.text}`}>{orderId}</span>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyOrderId}
                    className={`p-1.5 rounded-lg hover:bg-gray-700 transition-colors ${
                      theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                    }`}
                    title="Copy Order ID"
                  >
                    <FiCopy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleShareOrder}
                    className={`p-1.5 rounded-lg hover:bg-gray-700 transition-colors ${
                      theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                    }`}
                    title="Share Order"
                  >
                    <FiShare2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Summary & Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <div className={`rounded-2xl ${colors.card} border ${colors.border}`}>
              <div className={`p-4 sm:p-6 border-b ${colors.border}`}>
                <h2 className={`text-xl font-bold mb-2 ${colors.text}`}>
                  Order Summary
                </h2>
                <p className={`text-sm ${colors.textMuted}`}>
                  Complete details of your purchase
                </p>
              </div>
              
              <div className="p-4 sm:p-6">
                {/* Order Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  <div className={`p-4 rounded-xl border ${colors.border} ${theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
                      }`}>
                        <FiCalendar className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Date & Time</div>
                        <div className={`font-medium text-sm ${colors.text}`}>
                          {date ? new Date(date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : ''}
                        </div>
                        <div className={`text-xs ${colors.textMuted}`}>
                          {date ? new Date(date).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-xl border ${colors.border} ${theme === 'dark' ? 'bg-green-500/5' : 'bg-green-50'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'
                      }`}>
                        <FiShoppingBag className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Total Amount</div>
                        <div className={`text-xl font-bold ${colors.text}`}>
                          {formatCurrency(total)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-xl border ${colors.border} ${theme === 'dark' ? 'bg-purple-500/5' : 'bg-purple-50'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'
                      }`}>
                        <FiCreditCard className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Payment Method</div>
                        <div className={`font-medium text-sm ${colors.text}`}>
                          {paymentMethod === 'credit-card' ? 'Credit Card' : 
                           paymentMethod === 'paypal' ? 'PayPal' :
                           paymentMethod === 'crypto' ? 'Cryptocurrency' :
                           paymentMethod === 'upi' ? 'UPI' :
                           paymentMethod === 'usdt' ? 'USDT' :
                           paymentMethod === 'zilpay' ? 'ZilPay' :
                           'Other'
                          }
                        </div>
                        <div className={`text-xs ${colors.textMuted}`}>
                          •••• •••• •••• 4242
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Price Breakdown */}
                <div className={`p-4 rounded-xl border ${colors.border} ${theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
                  <h3 className={`font-medium mb-4 ${colors.text}`}>Price Breakdown</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={`text-sm ${colors.textMuted}`}>Subtotal</span>
                      <span className={`font-medium ${colors.text}`}>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className={`pt-3 mt-3 border-t ${colors.border}`}>
                      <div className="flex justify-between items-center">
                        <span className={`text-lg font-bold ${colors.text}`}>
                          Total Amount
                        </span>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${colors.text}`}>
                            {formatCurrency(total)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Purchased Items */}
            <div className={`rounded-2xl ${colors.card} border ${colors.border}`}>
              <div className={`p-4 sm:p-6 border-b ${colors.border}`}>
                <div className="flex justify-between items-center">
                  <h2 className={`text-xl font-bold ${colors.text}`}>
                    Purchased Items ({items.length})
                  </h2>
                  <span className={`text-sm px-3 py-1 rounded-full ${
                    theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {items.length} provider{items.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              
              <div className="p-4 sm:p-6">
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div 
                      key={index}
                      className={`flex items-center justify-between p-3 sm:p-4 rounded-xl ${
                        theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-100'
                      } hover:${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-200'} transition-colors`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className="relative">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden">
                            <img
                              src={item.image || item.img || 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?q=80&w=500'}
                              alt={item.name || item.provider}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                            theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                          }`}>
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-medium text-sm sm:text-base truncate ${colors.text}`}>
                            {item.name || item.provider}
                          </h4>
                          <div className="flex items-center flex-wrap gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                            }`}>
                              {item.type || 'Game Provider'}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
                            }`}>
                              {item.games || '50+'} Games
                            </span>
                            <span className="flex items-center text-xs text-yellow-500">
                              <FiStar className="w-3 h-3 fill-current mr-0.5" />
                              {item.rating || '4.8'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right ml-3">
                        <div className={`font-bold text-sm sm:text-base ${colors.text}`}>
                          {formatCurrency((item.price ?? 1999) * (item.quantity ?? 1))}
                        </div>
                        <div className="text-xs text-gray-400">
                          {(item.quantity ?? 1)} license{(item.quantity ?? 1) > 1 ? 's' : ''}
                        </div>
                        <div className={`text-xs mt-1 ${colors.textMuted}`}>
                          {formatCurrency(item.price ?? 1999)} each
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Next Steps Timeline */}
            <div className={`rounded-2xl ${colors.card} border ${colors.border}`}>
              <div className={`p-4 sm:p-6 border-b ${colors.border}`}>
                <h2 className={`text-xl font-bold mb-2 ${colors.text}`}>
                  What Happens Next?
                </h2>
                <p className={`text-sm ${colors.textMuted}`}>
                  Your order is being processed. Here's what to expect:
                </p>
              </div>
              
              <div className="p-4 sm:p-6">
                <div className="space-y-4">
                  {nextSteps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <div key={index} className="flex items-start gap-4">
                        <div className={`relative flex-shrink-0`}>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            step.color === 'blue' ? (theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100') :
                            step.color === 'purple' ? (theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100') :
                            step.color === 'green' ? (theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100') :
                            (theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-100')
                          }`}>
                            <Icon className={`w-5 h-5 ${
                              step.color === 'blue' ? 'text-blue-400' :
                              step.color === 'purple' ? 'text-purple-400' :
                              step.color === 'green' ? 'text-green-400' :
                              'text-orange-400'
                            }`} />
                          </div>
                          {index < nextSteps.length - 1 && (
                            <div className={`absolute top-10 left-1/2 w-0.5 h-8 -translate-x-1/2 ${
                              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                            }`} />
                          )}
                        </div>
                        
                        <div className="flex-1 pb-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className={`font-medium ${colors.text}`}>{step.title}</h4>
                              <p className={`text-sm mt-1 ${colors.textMuted}`}>{step.description}</p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-600'
                            }`}>
                              {step.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Actions & Support */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className={`rounded-2xl ${colors.card} border ${colors.border}`}>
              <div className={`p-4 sm:p-6 border-b ${colors.border}`}>
                <h2 className={`text-xl font-bold mb-2 ${colors.text}`}>
                  Customer Information
                </h2>
              </div>
              
              <div className="p-4 sm:p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
                    }`}>
                      <FiUser className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Name</div>
                      <div className={`font-medium ${colors.text}`}>{user.name}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'
                    }`}>
                      <FiMail className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Email</div>
                      <div className={`font-medium ${colors.text}`}>{user.email}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Actions */}
            <div className={`rounded-2xl ${colors.card} border ${colors.border}`}>
              <div className={`p-4 sm:p-6 border-b ${colors.border}`}>
                <h2 className={`text-xl font-bold mb-2 ${colors.text}`}>
                  Order Actions
                </h2>
              </div>
              
              <div className="p-4 sm:p-6">
                <div className="space-y-3">
                  <button
                    onClick={handleDownloadInvoice}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border ${
                      theme === 'dark'
                        ? 'border-gray-700 hover:bg-gray-800/50 text-gray-300'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    } transition-all duration-300 hover:scale-[1.02]`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
                      }`}>
                        <FiFileText className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Download Invoice</div>
                        <div className="text-xs text-gray-400">PDF format</div>
                      </div>
                    </div>
                    <FiDownload className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={handlePrintReceipt}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border ${
                      theme === 'dark'
                        ? 'border-gray-700 hover:bg-gray-800/50 text-gray-300'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    } transition-all duration-300 hover:scale-[1.02]`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'
                      }`}>
                        <FiPrinter className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Print Receipt</div>
                        <div className="text-xs text-gray-400">For your records</div>
                      </div>
                    </div>
                    <FiPrinter className="w-5 h-5" />
                  </button>
                  
                  <Link
                    to="/dashboard"
                    className={`w-full flex items-center justify-between p-3 rounded-xl border ${
                      theme === 'dark'
                        ? 'border-gray-700 hover:bg-gray-800/50 text-gray-300'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    } transition-all duration-300 hover:scale-[1.02]`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'
                      }`}>
                        <FiExternalLink className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Go To Access Provider </div>
                        <div className="text-xs text-gray-400">Manage your providers</div>
                      </div>
                    </div>
                    <FiChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Support Features */}
            <div className={`rounded-2xl ${colors.card} border ${colors.border}`}>
              <div className={`p-4 sm:p-6 border-b ${colors.border}`}>
                <h2 className={`text-xl font-bold mb-2 ${colors.text}`}>
                  Premium Support
                </h2>
                <p className={`text-sm ${colors.textMuted}`}>
                  You now have access to:
                </p>
              </div>
              
              <div className="p-4 sm:p-6">
                <div className="space-y-3">
                  {supportFeatures.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                        }`}>
                          <Icon className={`w-4 h-4 ${
                            feature.color === 'blue' ? 'text-blue-400' :
                            feature.color === 'green' ? 'text-green-400' :
                            feature.color === 'yellow' ? 'text-yellow-400' :
                            'text-purple-400'
                          }`} />
                        </div>
                        <span className={`text-sm ${colors.text}`}>{feature.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Need Help Card */}
            <div className={`rounded-2xl p-6 ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-800/30'
                : 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200'
            }`}>
              <h3 className={`text-lg font-bold mb-2 ${colors.text}`}>
                Need Help with Setup?
              </h3>
              <p className={`text-sm mb-4 ${colors.textMuted}`}>
                Our technical support team is ready to help you integrate the providers.
              </p>
              <div className="space-y-2">
                <button className={`w-full py-2.5 rounded-lg border transition-colors ${
                  theme === 'dark'
                    ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}>
                  Contact Support
                </button>
                <button className={`w-full py-2.5 rounded-lg border transition-colors ${
                  theme === 'dark'
                    ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}>
                  View Documentation
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/dashboard"
            className={`py-3.5 px-6 rounded-xl font-bold bg-gradient-to-r ${colors.gradient} text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center flex items-center justify-center gap-2`}
          >
            <FiExternalLink className="w-5 h-5" />
            Go To Access Provider 
          </Link>
          
          <Link
            to="/providers"
            className={`py-3.5 px-6 rounded-xl border transition-colors text-center flex items-center justify-center gap-2 ${
              theme === 'dark'
                ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <GiGamepad className="w-5 h-5" />
            Browse More Providers
          </Link>
        </div>

        {/* Print-only styles */}
        <style jsx>{`
          @media print {
            .no-print {
              display: none !important;
            }
            body {
              background: white !important;
              color: black !important;
            }
            .print-content {
              display: block !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default CheckoutSuccess;