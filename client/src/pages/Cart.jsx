import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiShoppingCart, FiTrash2, FiArrowLeft,
  FiCreditCard, FiCheck, FiChevronRight,
  FiHeart, FiStar, FiArrowRight, FiShield,
  FiClock, FiAlertCircle, FiPlus,
  FiPackage, FiTag, FiPercent, FiTruck,
  FiRefreshCw, FiX, FiChevronLeft, FiCheckCircle,
  FiMinus, FiPlusCircle, FiInfo, FiMoreVertical,
  FiBox, FiAward, FiZap, FiUsers, FiBarChart2,
  FiLock, FiMail, FiPhone,
  FiHeadphones
} from 'react-icons/fi';
import { GiTrophy, GiPriceTag, GiGamepad } from 'react-icons/gi';
import { MdSecurity, MdVerified, MdPayment } from 'react-icons/md';
import { useTheme } from '../contexts/ThemeContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  getCartProviders,
  deleteProviderFromCart,
  addProvidersToCart,
  clearProviderState,
} from '../reducer/providerSlice';

const Cart = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const { cartProviders, totalPayAmount, loading, error } = useSelector((state) => state.providers);
  const { user } = useSelector((state) => state.auth);

  // Local state
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [removingItem, setRemovingItem] = useState(null);
  const [quantity, setQuantity] = useState({});

  // Helper to display currency
  const formatCurrency = (value) => `₹${Number(value).toLocaleString('en-IN')}`;

  // Initialize cart
  useEffect(() => {
    // if (!user) {
    //   toast.error('Please login to view your cart!', {
    //     position: "top-center",
    //     autoClose: 3000,
    //     theme,
    //   });
    //   navigate('/login');
    //   return;
    // }

    // dispatch(getCartProviders());
    // dispatch(getCartProviders());

    return () => {
      dispatch(clearProviderState());
    };
  }, [dispatch]);

  // Sync state with Redux cart
  useEffect(() => {
    if (cartProviders && cartProviders.length > 0) {
      setSelectedItems(cartProviders.map(item => item._id || item.id || item.providerId));
      const initialQuantities = {};
      cartProviders.forEach(item => {
        const itemId = item._id || item.id || item.providerId;
        initialQuantities[itemId] = item.quantity || 1;
      });
      setQuantity(initialQuantities);
    } else {
      setSelectedItems([]);
      setQuantity({});
    }
  }, [cartProviders]);

  // Calculate cart totals (platform fee removed)
  const calculateTotals = () => {
    const selectedCartItems = (cartProviders || []).filter(item => {
      const itemId = item._id || item.id || item.providerId;
      return selectedItems.includes(itemId);
    });

    const subtotal = selectedCartItems.reduce((sum, item) => {
      const itemId = item._id || item.id || item.providerId;
      const itemQuantity = quantity[itemId] || 1;
      return sum + (Number(item.price) * itemQuantity);
    }, 0);

    const bundleDiscount = selectedCartItems.length >= 3 ? subtotal * 0.40 : 0;
    // const platformFee = subtotal * 0.05; // removed
    const total = subtotal - bundleDiscount; // platformFee removed

    return {
      subtotal,
      bundleDiscount,
      // platformFee, // removed
      total,
      itemCount: selectedCartItems.reduce((sum, item) => {
        const itemId = item._id || item.id || item.providerId;
        return sum + (quantity[itemId] || 1);
      }, 0)
    };
  };

  // Destructure platformFee out (removed)
  const { subtotal, bundleDiscount, total, itemCount } = calculateTotals();

  // Update quantity
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    setQuantity(prev => ({ ...prev, [itemId]: newQuantity }));
  };

  // Remove item from cart
  const handleRemoveItem = async (itemId, provider) => {
    setRemovingItem(itemId);
    try {
      const providerName = provider?.provider || provider?.name;
      if (!providerName) {
        toast.error('Provider name not found', { theme });
        return;
      }
      await dispatch(deleteProviderFromCart({ providerName })).unwrap();
      setSelectedItems(prev => prev.filter(id => id !== itemId));
      window.dispatchEvent(new Event('cartUpdated'));
      dispatch(getCartProviders());
      toast.success('Item removed from cart', { theme });
    } catch (error) {
      console.error('Remove item error:', error);
      toast.error(error.message || 'Failed to remove item', { theme });
    } finally {
      setRemovingItem(null);
    }
  };

  // Move to wishlist
  const handleMoveToWishlist = (item) => {
    toast.info('Wishlist feature coming soon!', { theme });
    const itemId = item._id || item.id || item.providerId;
    handleRemoveItem(itemId, item);
  };

  // Clear entire cart
  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your entire cart?')) return;
    setIsUpdating(true);
    try {
      for (const item of (cartProviders || [])) {
        const providerName = item.provider || item.name;
        if (providerName) {
          await dispatch(deleteProviderFromCart({ providerName })).unwrap();
        }
      }
      setSelectedItems([]);
      setQuantity({});
      window.dispatchEvent(new Event('cartUpdated'));
      dispatch(getCartProviders());
      toast.success('Cart cleared successfully', { theme });
    } catch (error) {
      console.error('Clear cart error:', error);
      toast.error('Failed to clear cart', { theme });
    } finally {
      setIsUpdating(false);
    }
  };

  // Toggle item selection
  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  // Select all items
  const selectAllItems = () => {
    const cartLength = (cartProviders || []).length;
    if (selectedItems.length === cartLength && cartLength > 0) {
      setSelectedItems([]);
    } else {
      setSelectedItems((cartProviders || []).map(item => item._id || item.id || item.providerId));
    }
  };

  // Handle checkout
  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error('Please select at least one item to checkout', { theme, autoClose: 3000 });
      return;
    }
    const selectedCartItems = (cartProviders || [])
      .filter(item => {
        const itemId = item._id || item.id || item.providerId;
        return selectedItems.includes(itemId);
      })
      .map(item => {
        const itemId = item._id || item.id || item.providerId;
        return { ...item, quantity: quantity[itemId] || 1 };
      });
    navigate('/checkout', {
      state: {
        cartItems: selectedCartItems,
        subtotal,
        discount: bundleDiscount,
        // platformFee, // removed
        total,
      }
    });
  };

  // Continue shopping
  const handleContinueShopping = () => navigate('/providers');
  const handleViewProvider = (providerName) => navigate(`/provider/${providerName}`);
  const updateReduxCart = async () => {
    try {
      setIsUpdating(true);
      await dispatch(getCartProviders()).unwrap();
      toast.success('Cart synced successfully', { theme });
    } catch (error) {
      toast.error('Failed to sync cart', { theme });
    } finally {
      setIsUpdating(false);
    }
  };

  // Professional theme colors with gradients
  const themeStyles = {
    dark: {
      bg: 'bg-gray-950',
      bgSecondary: 'bg-gray-900',
      card: 'bg-gradient-to-br from-gray-900 to-gray-950',
      cardHover: 'from-gray-800 to-gray-900',
      text: 'text-gray-100',
      textSecondary: 'text-gray-400',
      textMuted: 'text-gray-500',
      border: 'border-gray-800',
      borderHover: 'hover:border-gray-700',
      input: 'bg-gray-900 border-gray-800 text-gray-100 placeholder-gray-500',
      primary: 'from-blue-500 to-indigo-600',
      primaryHover: 'from-blue-600 to-indigo-700',
      secondary: 'from-purple-500 to-pink-600',
      accent: 'bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10',
      success: 'from-emerald-500 to-teal-600',
      warning: 'from-orange-500 to-red-600',
      danger: 'from-rose-500 to-pink-600',
      info: 'from-cyan-500 to-blue-600',
      glass: 'bg-gray-900/80 backdrop-blur-xl',
      glassBorder: 'border-gray-800/50',
      shadow: 'shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
    },
    light: {
      bg: 'bg-gray-50',
      bgSecondary: 'bg-white',
      card: 'bg-white',
      cardHover: 'from-gray-50 to-white',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      textMuted: 'text-gray-500',
      border: 'border-gray-200',
      borderHover: 'hover:border-gray-300',
      input: 'bg-white border-gray-300 text-gray-900 placeholder-gray-400',
      primary: 'from-blue-600 to-indigo-700',
      primaryHover: 'from-blue-700 to-indigo-800',
      secondary: 'from-purple-600 to-pink-700',
      accent: 'bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50',
      success: 'from-emerald-600 to-teal-700',
      warning: 'from-orange-600 to-red-700',
      danger: 'from-rose-600 to-pink-700',
      info: 'from-cyan-600 to-blue-700',
      glass: 'bg-white/90 backdrop-blur-xl',
      glassBorder: 'border-gray-200/50',
      shadow: 'shadow-[0_8px_32px_rgba(0,0,0,0.08)]',
    }
  };

  const styles = themeStyles[theme];

  // Loading state
  if (loading && (!cartProviders || cartProviders.length === 0)) {
    return (
      <div className={`min-h-screen ${styles.bg} flex flex-col items-center justify-center p-4`}>
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-gray-800 border-t-blue-500 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="mt-8 text-center">
          <h2 className={`text-2xl font-bold ${styles.text} mb-2`}>Loading your cart</h2>
          <p className={styles.textMuted}>Please wait while we fetch your items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${styles.bg} ${styles.text}`}>
      <ToastContainer position="top-center" theme={theme} />

     

      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Banner */}
        {error && (
          <div className={`mb-6 p-4 rounded-xl bg-gradient-to-r from-rose-500/10 to-pink-500/10 border border-rose-500/20 flex items-center gap-3`}>
            <FiAlertCircle className="w-5 h-5 text-rose-500" />
            <p className={`flex-1 ${styles.textSecondary}`}>{error}</p>
            <button
              // onClick={() => dispatch(getCartProviders())}
              className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-500 text-sm font-medium hover:bg-rose-500/20 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {(!cartProviders || cartProviders.length === 0) && !loading && (
          <div className="max-w-md mx-auto text-center py-12">
            <div className={`w-32 h-32 mx-auto mb-6 rounded-2xl ${styles.accent} flex items-center justify-center`}>
              <FiShoppingCart className="w-16 h-16 text-blue-500" />
            </div>
            <h2 className={`text-2xl font-bold ${styles.text} mb-3`}>Your cart is empty</h2>
            <p className={`${styles.textMuted} mb-8`}>
              Looks like you haven't added any providers yet
            </p>
            <button
              onClick={handleContinueShopping}
              className={`px-6 py-3 bg-gradient-to-r ${styles.primary} text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto`}
            >
              <FiPlus className="w-5 h-5" />
              Browse Providers
            </button>
          </div>
        )}

        {/* Cart Content */}
        {(cartProviders || []).length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items - Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Selection Header */}
              <div className={`${styles.card} rounded-xl p-4 border ${styles.border}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={selectAllItems}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${selectedItems.length === (cartProviders || []).length
                        ? 'bg-blue-500 border-blue-500'
                        : `${styles.border} ${styles.textMuted}`
                        }`}
                    >
                      {selectedItems.length === (cartProviders || []).length && (
                        <FiCheck className="w-3 h-3 text-white" />
                      )}
                    </button>
                    <span className={`font-medium ${styles.text}`}>
                      Select All ({selectedItems.length} of {(cartProviders || []).length})
                    </span>
                  </div>
                  <button
                    onClick={handleClearCart}
                    className={`px-3 py-1.5 rounded-lg ${styles.textMuted} hover:${styles.text} hover:bg-gray-800/50 transition-colors text-sm flex items-center gap-1`}
                  >
                    <FiTrash2 className="w-4 h-4" />
                    Clear
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                {(cartProviders || []).map((item) => {
                  const itemId = item._id || item.id || item.providerId;
                  const isSelected = selectedItems.includes(itemId);
                  const isRemoving = removingItem === itemId;
                  const itemQuantity = quantity[itemId] || 1;

                  return (
                    <div
                      key={itemId}
                      className={`${styles.card} rounded-xl border ${styles.border} overflow-hidden transition-all duration-300 ${isRemoving ? 'opacity-50' : ''
                        } ${isSelected ? 'ring-2 ring-blue-500/20' : ''}`}
                    >
                      <div className="p-4 sm:p-6">
                        <div className="flex  sm:flex-row gap-4">
                          {/* Checkbox */}
                          <div className="flex items-start">
                            <button
                              onClick={() => toggleItemSelection(itemId)}
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors mt-1 ${isSelected
                                ? 'bg-blue-500 border-blue-500'
                                : `${styles.border} ${styles.textMuted}`
                                }`}
                            >
                              {isSelected && <FiCheck className="w-3 h-3 text-white" />}
                            </button>
                          </div>

                          {/* Image */}
                          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={item.image || item.img || 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?q=80&w=500'}
                              alt={item.name || item.provider}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[10px] font-medium text-white">
                              {item.category || 'Premium'}
                            </div>
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className={`font-semibold ${styles.text} truncate`}>
                                    {item.name || item.provider}
                                  </h3>
                                  {item.status !== 0 && (
                                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-medium">
                                      Active
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-4 mb-3">
                                  <div className="flex items-center gap-1">
                                    <FiStar className="w-4 h-4 text-yellow-500 fill-current" />
                                    <span className={`text-sm ${styles.text}`}>{item.rating || '4.8'}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <FiPackage className={`w-4 h-4 ${styles.textMuted}`} />
                                    <span className={`text-sm ${styles.textMuted}`}>{item.games || 50}+ Games</span>
                                  </div>
                                </div>

                               
                              </div>

                              {/* Price & Actions */}
                              <div className="flex flex-row sm:flex-col items-center sm:items-end gap-4 sm:gap-2">
                                <div className="text-right">
                                  <div className={`text-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent`}>
                                    {formatCurrency((item.price || 1999) * itemQuantity)}
                                  </div>
                                  {itemQuantity > 1 && (
                                    <div className={`text-xs ${styles.textMuted}`}>
                                      {formatCurrency(item.price || 1999)} each
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleMoveToWishlist(item)}
                                    className={`p-2 rounded-lg ${styles.textMuted} hover:text-rose-500 hover:bg-rose-500/10 transition-colors`}
                                  >
                                    <FiHeart className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleRemoveItem(itemId, item)}
                                    disabled={isRemoving}
                                    className={`p-2 rounded-lg ${styles.textMuted} hover:text-rose-500 hover:bg-rose-500/10 transition-colors`}
                                  >
                                    {isRemoving ? (
                                      <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <FiTrash2 className="w-4 h-4" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary - Right Column */}
            <div className="space-y-6">
              <div className={`${styles.card} rounded-xl border ${styles.border} overflow-hidden sticky top-24`}>
                <div className={`p-5 bg-gradient-to-r ${styles.primary}`}>
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <FiCreditCard className="w-5 h-5" />
                    Order Summary
                  </h2>
                </div>

                <div className="p-5 space-y-4">
                  {/* Price Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className={styles.textMuted}>Subtotal ({itemCount} items)</span>
                      <span className={`font-medium ${styles.text}`}>{formatCurrency(subtotal)}</span>
                    </div>

                    {bundleDiscount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-500 flex items-center gap-1">
                          <GiTrophy className="w-4 h-4" />
                          Bundle Discount (40%)
                        </span>
                        <span className="text-emerald-500 font-medium">
                          -{formatCurrency(bundleDiscount)}
                        </span>
                      </div>
                    )}

                    {/* Platform Fee removed */}
                    {/* 
                    <div className="flex justify-between items-center">
                      <span className={styles.textMuted}>Platform Fee</span>
                      <span className={styles.textSecondary}>+{formatCurrency(platformFee)}</span>
                    </div>
                    */}

                    <div className="pt-3 border-t border-gray-800">
                      <div className="flex justify-between items-center">
                        <span className={`text-base font-semibold ${styles.text}`}>Total</span>
                        <div className="text-right">
                          <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                            {formatCurrency(total)}
                          </span>
                          <span className={`text-xs ${styles.textMuted} block`}>Discount all Provider</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    disabled={itemCount === 0}
                    className={`w-full py-3.5 px-4 bg-gradient-to-r ${styles.primary} text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                  >
                    <FiLock className="w-4 h-4" />
                    Proceed to Checkout
                  </button>

                  {/* Bundle Progress */}
                  {(cartProviders || []).length < 3 && (
                    <div className={`p-4 rounded-lg ${styles.accent} border ${styles.border}`}>
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-yellow-500/20">
                          <GiTrophy className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${styles.text} mb-2`}>
                            Add {3 - (cartProviders || []).length} more to get 40% off
                          </p>
                          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-500"
                              style={{ width: `${((cartProviders || []).length / 3) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Security Badge */}
                  <div className="flex items-center gap-3 p-3">
                    <MdSecurity className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className={`text-xs font-medium ${styles.text}`}>Secure Checkout</p>
                      <p className={`text-[10px] ${styles.textMuted}`}>SSL Encrypted Payment</p>
                    </div>
                    <div className="flex-1 flex justify-end gap-1">
                      <div className="w-8 h-5 bg-gray-800 rounded text-[8px] flex items-center justify-center text-white">UPI</div>
                      <div className="w-8 h-5 bg-gray-800 rounded text-[8px] flex items-center justify-center text-white">USDT</div>
                      <div className="w-8 h-5 bg-gray-800 rounded text-[8px] flex items-center justify-center text-white">ZillPay</div>
                    </div>
                  </div>
                </div>
              </div>

              
            </div>
          </div>
        )}
      </div>

      {/* Mobile Checkout Bar */}
      {(cartProviders || []).length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-xs">Total</p>
              <p className="text-white text-xl font-bold">{formatCurrency(total)}</p>
            </div>
            <button
              onClick={handleCheckout}
              disabled={itemCount === 0}
              className="px-6 py-2.5 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Checkout
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Cart;