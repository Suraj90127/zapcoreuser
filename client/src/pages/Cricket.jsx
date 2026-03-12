


import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FiSearch, FiFilter, FiChevronDown, FiKey, FiCode, FiClock, FiCalendar, FiCheckCircle, FiXCircle, FiAlertCircle, FiCopy, FiExternalLink, FiRefreshCw
} from 'react-icons/fi';
import { GiCricketBat, GiSoccerBall, GiTennisBall, GiGamepad } from 'react-icons/gi';
import { BsStarFill, BsStarHalf, BsShieldCheck, BsLightningCharge, BsGraphUp, BsWallet2 } from 'react-icons/bs';
import { MdOutlinePayment, MdAccessTime, MdDateRange, MdOutlineKey, MdOutlineTimeline } from 'react-icons/md';
import { FaRegClock, FaRegCalendarAlt, FaRegCheckCircle, FaRegTimesCircle } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import { getCricketProvider, createCricketAccess, getCricketAccessProvider } from '../reducer/CricketSlice';
import { useDispatch, useSelector } from 'react-redux';

const APIKeyMarketplace = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState({});
  const [activeTab, setActiveTab] = useState('my-keys');
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const { providers, AccessProviders, loading } = useSelector((state) => state.cricket);

  console.log("AccessProviders", AccessProviders);

  // ✅ Auto-switch to marketplace if no AccessProviders
    useEffect(() => {
      const hasData =
        AccessProviders &&
        (
          (Array.isArray(AccessProviders) && AccessProviders.length > 0) ||
          (typeof AccessProviders === "object" &&
            !Array.isArray(AccessProviders) &&
            Object.keys(AccessProviders).length > 0)
        );

      if (hasData) {
        setActiveTab("my-keys");
      } else {
        setActiveTab("marketplace");
      }
    }, [AccessProviders]);

  // Check if AccessProviders exists and is an object with data
  const hasPurchasedKey = AccessProviders && 
                         typeof AccessProviders === 'object' && 
                         Object.keys(AccessProviders).length > 0;

  const purchasedKey = hasPurchasedKey ? AccessProviders : null;

  // Calculate days remaining for a plan
  const getDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Calculate percentage of subscription completed
  const getSubscriptionProgress = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    
    const total = end - start;
    const elapsed = now - start;
    
    const percentage = (elapsed / total) * 100;
    return Math.min(100, Math.max(0, percentage));
  };

  // Get status badge based on plan status
  const getStatusBadge = (isActive, endDate) => {
    const daysRemaining = getDaysRemaining(endDate);
    
    if (!isActive) {
      return {
        text: 'Inactive',
        color: 'bg-gradient-to-r from-red-500 to-red-600',
        icon: <FaRegTimesCircle className="w-4 h-4" />,
        bgLight: 'bg-red-50 dark:bg-red-900/20',
        textLight: 'text-red-700 dark:text-red-300'
      };
    }
    
    if (daysRemaining <= 0) {
      return {
        text: 'Expired',
        color: 'bg-gradient-to-r from-gray-500 to-gray-600',
        icon: <FiAlertCircle className="w-4 h-4" />,
        bgLight: 'bg-gray-50 dark:bg-gray-800/50',
        textLight: 'text-gray-700 dark:text-gray-300'
      };
    }
    
    if (daysRemaining <= 7) {
      return {
        text: `Expiring Soon • ${daysRemaining} days`,
        color: 'bg-gradient-to-r from-yellow-500 to-orange-500',
        icon: <FiClock className="w-4 h-4" />,
        bgLight: 'bg-yellow-50 dark:bg-yellow-900/20',
        textLight: 'text-yellow-700 dark:text-yellow-300'
      };
    }
    
    return {
      text: 'Active',
      color: 'bg-gradient-to-r from-green-500 to-emerald-500',
      icon: <FaRegCheckCircle className="w-4 h-4" />,
      bgLight: 'bg-green-50 dark:bg-green-900/20',
      textLight: 'text-green-700 dark:text-green-300'
    };
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // const handleBuyNow = async (item) => {
  //   const endDate = selectedDate[item._id];

  //   if (!endDate) {
  //     alert("Please select end date");
  //     return;
  //   }

  //   const today = new Date();
  //   const selected = new Date(endDate);

  //   const diffTime = selected - today;

  //   if (diffTime <= 0) {
  //     alert("Invalid date selected");
  //     return;
  //   }

  //   const months = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
  //   const totalPrice = months * item.price;

  //   dispatch(
  //     createCricketAccess({
  //       months,
  //       price: totalPrice,
  //     })
  //   ).then((res) => {
  //     if (res.meta.requestStatus === "fulfilled") {
  //       navigate("/checkout", {
  //         state: {
  //           purchaseType: "cricket",
  //           id: item._id,
  //           name: item.name,
  //           cartItems: [item],
  //           subtotal: totalPrice,
  //           discount: 0,
  //           amount: totalPrice,
  //           platformFee: 0,
  //           total: totalPrice,
  //           months,
  //         },
  //       });
  //     }
  //   });
  // };

  
  const handleBuyNow = async (item) => {
  const months = selectedDate[item._id];

  if (!months) {
    alert("Please select subscription duration");
    return;
  }

  const totalPrice = months * item.price;

  dispatch(
    createCricketAccess({
      months: parseInt(months),
      price: totalPrice,
    })
  ).then((res) => {
    if (res.meta.requestStatus === "fulfilled") {
      navigate("/checkout", {
        state: {
          purchaseType: "cricket",
          id: item._id,
          name: item.name,
          cartItems: [item],
          subtotal: totalPrice,
          discount: 0,
          amount: totalPrice,
          platformFee: 0,
          total: totalPrice,
          months: parseInt(months),
        },
      });
    }
  });
};
  
  const handleCopyKey = (keyId) => {
    navigator.clipboard.writeText(keyId);
    setShowCopyTooltip(true);
    setTimeout(() => setShowCopyTooltip(false), 2000);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) stars.push(<BsStarFill key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />);
      else if (i === fullStars && hasHalfStar) stars.push(<BsStarHalf key="half" className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />);
      else stars.push(<BsStarFill key={`empty-${i}`} className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300 dark:text-gray-600" />);
    }
    return stars;
  };

  useEffect(() => {
    dispatch(getCricketProvider());
    dispatch(getCricketAccessProvider());
  }, [dispatch]);

  // Theme-based styles
  const containerBg = theme === 'dark' 
    ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-black' 
    : 'bg-gradient-to-br from-slate-50 via-white to-white';
  const cardBg = theme === 'dark' 
    ? 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl' 
    : 'bg-gradient-to-br from-white to-slate-50/90 backdrop-blur-xl';
  const borderColor = theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200/50';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const textMuted = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';

  const formatRupees = (amount) => `₹${amount?.toLocaleString('en-IN') || 0}`;

  return (
    <div className={`min-h-screen ${containerBg} py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8 xl:px-10`}>
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        
        {/* Hero Header with Tabs */}
        <div className={`relative overflow-hidden rounded-3xl ${cardBg} border ${borderColor} p-0 md:p-10 shadow-2xl`}>
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl shadow-lg">
                    <FiKey className="w-4 h-4 md:w-6 md:h-6 text-white" />
                  </div>
                  <h1 className={`text-2xl sm:text-2xl md:text-5xl lg:text-6xl font-black ${textPrimary}`}>
                    API<span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">Market</span>
                  </h1>
                </div>
                <p className={`text-sm md:text-lg ${textSecondary} max-w-2xl`}>
                  Deploy premium sports data APIs with enterprise-grade security and real-time access.
                </p>
              </div>
              
              {/* Live Status Badge */}
              <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-green-500/10 border border-green-500/20">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">All Systems Operational</span>
              </div>
            </div>

            {/* Tabs - My Keys tab disabled when no purchased key */}
            <div className="flex space-x-1 p-1 rounded-2xl bg-gray-100 dark:bg-gray-800/50 w-fit">
              <button
                onClick={() => setActiveTab('marketplace')}
                className={`relative px-3 md:px-3 py-1 md:py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === 'marketplace'
                    ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-lg text-sm'
                    : `${textMuted} hover:${textSecondary}`
                }`}
              >
                <div className="flex items-center gap-2">
                  <FiKey className="w-4 h-4" />
                  Marketplace
                </div>
              </button>
              <button
                onClick={() => {
                  if (hasPurchasedKey) {
                    setActiveTab('my-keys');
                  }
                }}
                className={`relative md:px-6 px-6 md:py-3 py-3 rounded-xl font-medium transition-all duration-300 ${
                  !hasPurchasedKey ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                } ${
                  activeTab === 'my-keys'
                    ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-lg'
                    : `${textMuted} hover:${textSecondary}`
                }`}
                disabled={!hasPurchasedKey}
              >
                <div className="flex items-center gap-2">
                  {/* <BsShieldCheck className="w-4 h-4" /> */}
                  My Keys
                  {hasPurchasedKey && (
                    <span className="ml-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                      1
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Filters - Only show in marketplace tab */}
        {activeTab === 'marketplace' && (
          <div className={`p-6 rounded-3xl ${cardBg} border ${borderColor} backdrop-blur-xl shadow-xl`}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search APIs by name, category, or features..." 
                  className={`w-full pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                    theme === 'dark' 
                      ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-500' 
                      : 'bg-white border-gray-200 placeholder-gray-400'
                  } border`}
                />
              </div>
              <button className={`px-6 py-4 rounded-xl border ${borderColor} flex items-center gap-2 ${textSecondary} hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all`}>
                <FiFilter /> Advanced Filters <FiChevronDown />
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        {/* Content based on active tab */}
        {!loading && (
          <>
            {activeTab === 'marketplace' ? (
              /* API Cards Grid */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {providers?.map((item) => (
                  <div key={item._id} className={`group relative rounded-3xl border ${borderColor} ${cardBg} overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2`}>
                    {/* Card Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/10 group-hover:to-indigo-500/10 transition-all duration-500" />
                    
                    {/* Image Header */}
                    <div className="relative h-56 overflow-hidden">
                      <img src={item.img} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Badges */}
                      <div className="absolute top-4 right-4 flex gap-2">
                        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs font-bold flex items-center gap-2 border border-white/10">
                          <FiCode className="w-3 h-3" /> Premium Access
                        </div>
                      </div>
                      
                      {/* Rating Badge */}
                      <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full">
                        <div className="flex">{renderStars(item.rating)}</div>
                        <span className="text-white text-sm font-medium">{item.rating}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-5">
                      <div className="flex justify-between items-start">
                        <h3 className={`text-xl font-bold ${textPrimary}`}>{item.name}</h3>
                        <div className="px-3 py-1 bg-blue-500/10 rounded-full">
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">LIVE</span>
                        </div>
                      </div>

                      {/* Tags/Features */}
                      <div className="flex flex-wrap gap-2">
                        {item.features?.map((f, i) => (
                          <span key={i} className={`px-3 py-1.5 text-xs font-medium rounded-full ${
                            theme === 'dark' 
                              ? 'bg-gray-800/80 text-gray-300 border border-gray-700' 
                              : 'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}>
                            {f}
                          </span>
                        ))}
                      </div>

                      <hr className={`${borderColor} opacity-50`} />

                      {/* Price & Subscription */}
                      <div className="space-y-4">
                        <div className="flex items-end justify-between">
                          <div>
                            <p className={`text-sm ${textMuted}`}>Monthly License</p>
                            <p className={`text-3xl font-bold ${textPrimary}`}>
                              {formatRupees(item.price)} 
                              <span className={`text-sm font-normal ${textMuted} ml-1`}>/month</span>
                            </p>
                          </div>
                          <div className="p-3 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl">
                            <BsGraphUp className="w-6 h-6 text-blue-500" />
                          </div>
                        </div>

                    {/* Months Selector */}
                        <div className="relative">
                          <label className={`text-sm ${textMuted} flex items-center gap-2 mb-2`}>
                            <MdDateRange className="w-4 h-4" />
                            Select Subscription Duration (Months)
                          </label>
                          <select
                            value={selectedDate[item._id] || ''}
                            onChange={(e) =>
                              setSelectedDate((prev) => ({
                                ...prev,
                                [item._id]: e.target.value,
                              }))
                            }
                            className={`w-full p-3 rounded-xl border transition-all focus:ring-2 focus:ring-blue-500/50 cursor-pointer appearance-none bg-no-repeat bg-right pr-10 ${
                              theme === "dark"
                                ? "bg-gray-800/50 border-gray-700 text-white"
                                : "bg-white border-gray-200 text-gray-900"
                            }`}
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                              backgroundPosition: 'right 0.75rem center',
                              backgroundSize: '1.5em 1.5em'
                            }}
                          >
                            <option value="" disabled className={theme === "dark" ? "bg-gray-800" : "bg-white"}>
                              Choose duration...
                            </option>
                            {[...Array(24)].map((_, i) => {
                              const months = i + 1;
                              const totalPrice = months * item.price;
                              return (
                                <option 
                                  key={months} 
                                  value={months}
                                  className={theme === "dark" ? "bg-gray-800" : "bg-white"}
                                >
                                  {months} {months === 1 ? 'Month' : 'Months'} • ₹{totalPrice.toLocaleString('en-IN')}
                                </option>
                              );
                            })}
                          </select>
                          
                          {/* Show price preview if selected */}
                          {selectedDate[item._id] && (
                            <div className={`mt-2 p-2 rounded-lg text-sm ${theme === 'dark' ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-700'} border ${theme === 'dark' ? 'border-blue-800' : 'border-blue-200'}`}>
                              <span className="font-medium">Total Price: </span>
                              ₹{(item.price * parseInt(selectedDate[item._id])).toLocaleString('en-IN')}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleBuyNow(item)}
                          className="w-full relative group/btn overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 transition-all transform active:scale-95"
                        >
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            <BsLightningCharge className="w-5 h-5" />
                            Purchase Access Now
                          </span>
                          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* My API Key Section - Only shown when hasPurchasedKey is true */
              hasPurchasedKey && purchasedKey && (
                <div className="space-y-6">
                  {/* Hero Stats Card */}
                  <div className={`relative overflow-hidden rounded-3xl ${cardBg} border ${borderColor} p-4 md:p-8 shadow-2xl`}>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5" />
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl shadow-xl">
                          <BsShieldCheck className="md:w-8 md:h-8 w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h2 className={`text-xl md:text-2xl font-bold ${textPrimary}`}>Your Active Subscription</h2>
                          <p className={textSecondary}>Manage your API access and usage</p>
                        </div>
                      </div>

                      {/* Quick Stats Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
                          <p className={`text-sm ${textMuted} mb-1`}>Status</p>
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className={`font-semibold ${textPrimary}`}>
                              {purchasedKey.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                          <p className={`text-sm ${textMuted} mb-1`}>Plan Type</p>
                          <p className={`font-semibold ${textPrimary}`}>{purchasedKey.providers?.toUpperCase() || 'API'} Access</p>
                        </div>
                        
                        <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
                          <p className={`text-sm ${textMuted} mb-1`}>Duration</p>
                          <p className={`font-semibold ${textPrimary}`}>{purchasedKey.months} Months</p>
                        </div>
                        
                        <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                          <p className={`text-sm ${textMuted} mb-1`}>Investment</p>
                          <p className={`font-semibold ${textPrimary}`}>{formatRupees(purchasedKey.totalAmount)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Key Details Card */}
                  <div className={`rounded-3xl border ${borderColor} ${cardBg} overflow-hidden shadow-2xl`}>
                    {/* Header with Gradient */}
                    <div className="relative h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6">
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="relative z-10 flex justify-between items-start">
                        <div>
                          <h3 className="text-white text-2xl font-bold mb-1">{purchasedKey.providers?.toUpperCase()} API Key</h3>
                          <p className="text-white/80 text-sm flex items-center gap-2">
                            <FaRegCalendarAlt className="w-3 h-3" />
                            Purchased on {formatDate(purchasedKey.createdAt)}
                          </p>
                        </div>
                        {(() => {
                          const status = getStatusBadge(purchasedKey.isActive, purchasedKey.endDate);
                          return (
                            <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 text-white shadow-lg ${status.color}`}>
                              {status.icon}
                              {status.text}
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-0 md:p-8 space-y-8">
                      {/* Key ID with Copy */}
                      <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'} border ${borderColor}`}>
                        <div className="flex items-center justify-between mb-3">
                          <p className={`text-sm ${textMuted} flex items-center gap-2`}>
                            <MdOutlineKey className="w-4 h-4" />
                            Your Unique Key Identifier
                          </p>
                          <div className="relative">
                            <button
                              onClick={() => handleCopyKey(purchasedKey._id)}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 transition-all"
                            >
                              <FiCopy className="w-4 h-4" />
                              <span className="text-sm font-medium">Copy Key</span>
                            </button>
                            {showCopyTooltip && (
                              <div className="absolute -top-10 right-0 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap">
                                Copied! ✨
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="font-mono text-sm break-all p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                          {purchasedKey._id}
                        </div>
                      </div>

                      {/* Timeline Section */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Date Details */}
                        <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'} border ${borderColor}`}>
                          <h4 className={`font-semibold ${textPrimary} mb-4 flex items-center gap-2`}>
                            <MdOutlineTimeline className="w-5 h-5 text-blue-500" />
                            Subscription Timeline
                          </h4>
                          <div className="space-y-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-green-500/10 rounded-lg">
                                <FaRegCheckCircle className="w-4 h-4 text-green-500" />
                              </div>
                              <div>
                                <p className={`text-sm ${textMuted}`}>Started On</p>
                                <p className={`font-medium ${textPrimary}`}>{formatDate(purchasedKey.startDate)}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-red-500/10 rounded-lg">
                                <FaRegTimesCircle className="w-4 h-4 text-red-500" />
                              </div>
                              <div>
                                <p className={`text-sm ${textMuted}`}>Expires On</p>
                                <p className={`font-medium ${textPrimary}`}>{formatDate(purchasedKey.endDate)}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-blue-500/10 rounded-lg">
                                <FiClock className="w-4 h-4 text-blue-500" />
                              </div>
                              <div>
                                <p className={`text-sm ${textMuted}`}>Time Remaining</p>
                                <p className={`font-medium ${textPrimary}`}>{getDaysRemaining(purchasedKey.endDate)} days</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Progress & Stats */}
                        <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'} border ${borderColor}`}>
                          <h4 className={`font-semibold ${textPrimary} mb-4 flex items-center gap-2`}>
                            <BsGraphUp className="w-5 h-5 text-blue-500" />
                            Usage Statistics
                          </h4>
                          
                          {/* Progress Circle */}
                          <div className="flex justify-center mb-6">
                            <div className="relative w-32 h-32">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle
                                  cx="64"
                                  cy="64"
                                  r="54"
                                  stroke={theme === 'dark' ? '#374151' : '#E5E7EB'}
                                  strokeWidth="8"
                                  fill="none"
                                />
                                <circle
                                  cx="64"
                                  cy="64"
                                  r="54"
                                  stroke="url(#gradient)"
                                  strokeWidth="8"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeDasharray={`${2 * Math.PI * 54}`}
                                  strokeDashoffset={`${2 * Math.PI * 54 * (1 - getSubscriptionProgress(purchasedKey.startDate, purchasedKey.endDate) / 100)}`}
                                  className="transition-all duration-1000"
                                />
                              </svg>
                              <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor="#3B82F6" />
                                  <stop offset="100%" stopColor="#8B5CF6" />
                                </linearGradient>
                              </defs>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className={`text-2xl font-bold ${textPrimary}`}>
                                  {Math.round(getSubscriptionProgress(purchasedKey.startDate, purchasedKey.endDate))}%
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="text-center p-3 rounded-xl bg-white dark:bg-gray-900">
                              <p className={`text-xs ${textMuted}`}>Days Used</p>
                              <p className={`text-lg font-bold ${textPrimary}`}>
                                {purchasedKey.months * 30 - getDaysRemaining(purchasedKey.endDate)}
                              </p>
                            </div>
                            <div className="text-center p-3 rounded-xl bg-white dark:bg-gray-900">
                              <p className={`text-xs ${textMuted}`}>Total Days</p>
                              <p className={`text-lg font-bold ${textPrimary}`}>{purchasedKey.months * 30}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* User & Payment Info */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'} border ${borderColor}`}>
                          <h4 className={`font-semibold ${textPrimary} mb-4 flex items-center gap-2`}>
                            <BsWallet2 className="w-5 h-5 text-blue-500" />
                            Payment Details
                          </h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className={textMuted}>Total Amount</span>
                              <span className={`font-bold ${textPrimary}`}>{formatRupees(purchasedKey.totalAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className={textMuted}>Paid Amount</span>
                              <span className={`font-bold ${textPrimary}`}>{formatRupees(purchasedKey.totalPayAmount || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className={textMuted}>Duration</span>
                              <span className={`font-bold ${textPrimary}`}>{purchasedKey.months} Months</span>
                            </div>
                          </div>
                        </div>

                        <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'} border ${borderColor}`}>
                          <h4 className={`font-semibold ${textPrimary} mb-4 flex items-center gap-2`}>
                            <FiExternalLink className="w-5 h-5 text-blue-500" />
                            Quick Actions
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            <button className="p-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium hover:shadow-lg transition-all transform hover:scale-105">
                              View Usage
                            </button>
                            <button className="p-4 rounded-xl border-2 border-blue-500 text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-500 hover:text-white transition-all">
                              API Docs
                            </button>
                          </div>
                          
                          {/* Renew Option */}
                          {getDaysRemaining(purchasedKey.endDate) <= 30 && purchasedKey.isActive && (
                            <button
                              onClick={() => setActiveTab('marketplace')}
                              className="w-full mt-3 p-4 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                              <FiRefreshCw className="w-4 h-4" />
                              Renew Subscription
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default APIKeyMarketplace;