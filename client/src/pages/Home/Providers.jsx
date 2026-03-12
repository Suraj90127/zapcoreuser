

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiSearch, FiFilter, FiGrid, FiList, FiShoppingCart,
  FiEye, FiStar, FiPackage, FiTrendingUp, FiChevronRight,
  FiChevronLeft, FiChevronDown
} from 'react-icons/fi';
import { GiGamepad } from 'react-icons/gi';
import { BsStarFill, BsStarHalf } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../contexts/ThemeContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import Redux actions
import {
  getAllProviders,
  addProvidersToCart,
  getCartProviders,
  updateProviderStatus,
  clearProviderState,
  deleteProviderFromCart,
} from '../../reducer/providerSlice';
// import { getGames} from '../../reducer/gameSlice';

const Providers = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux selectors
  const {
    providers,
    cartProviders,
    loading,
    error,
    activeProviders,
    disabledProviders,
    inCartIds  // Get the cart IDs from Redux
  } = useSelector((state) => state.providers);

  const { user } = useSelector((state) => state.auth);
  const { games,totalGames,  } = useSelector((state) => state.games);
  

  // Local state for UI
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('active'); // Default to active providers
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);
  // Track only per item loading for cart button
  const [loadingCartItems, setLoadingCartItems] = useState({}); // { [providerId]: true/false }

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Check if provider is in cart (using Redux state)
  const isProviderInCart = (provider) => {
    const pid = provider.id || provider._id;
    return inCartIds.includes(pid);
  };



  useEffect(() => {
    dispatch(getAllProviders());

    return () => {
      dispatch(clearProviderState());
    };
  }, [dispatch, user]);

  // For counting items in the cart (from Redux)
  const cartTotalItems = cartProviders?.reduce?.((total, item) => total + (item.quantity || 1), 0) || 0;

  // Search suggestions handler
  const handleSearch = (searchTerm) => {
    setSearchTerm(searchTerm);
    if (searchTerm.length > 2) {
      // Only search among active providers (status === 1), as per optimization
      const filtered = providers.filter(provider =>
        provider.status === 1 &&
        (
          provider.provider?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          provider.path?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          provider.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setSearchSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (provider) => {
    navigate(`/provider/${provider.id || provider._id || provider.provider}`, {
      state: {
        searchData: searchTerm,
        providerData: provider
      }
    });
    setShowSuggestions(false);
    setSearchTerm('');
  };

  // Provider categories
  const categories = [
    {
      id: 'all',
      label: 'All Providers',
      count: providers?.filter(p => p.status === 1).length,
      icon: <FiPackage className="w-4 h-4" />,
      color: 'blue'
    },
    {
      id: 'active',
      label: 'Active',
      count: activeProviders.length || providers.filter(p => p.status === 1).length,
      icon: <FiTrendingUp className="w-4 h-4" />,
      color: 'green'
    },
    {
      id: 'disabled',
      label: 'Disabled',
      count: disabledProviders.length || providers.filter(p => p.status === 0).length,
      icon: <FiPackage className="w-4 h-4" />,
      color: 'red'
    },
    {
      id: 'premium',
      label: 'Premium',
      count: providers.filter(p => p.status === 1 && p.price >= 3000).length,
      icon: <FiStar className="w-4 h-4" />,
      color: 'yellow'
    },
  ];

  const priceRanges = [
    { id: 'all', label: 'All Prices', min: 0, max: 10000 },
    { id: 'budget', label: 'Budget ($0-1000)', min: 0, max: 1000 },
    { id: 'mid', label: 'Mid Range ($1001-2999)', min: 1001, max: 2999 },
    { id: 'premium', label: 'Premium ($3000+)', min: 3000, max: 10000 },
  ];

  // Status toggle
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    try {
      await dispatch(updateProviderStatus({ id, status: newStatus })).unwrap();
      // dispatch(getAllProviders());
      toast.success(`Provider status updated to ${newStatus === 1 ? 'Active' : 'Disabled'}`, {
        position: "top-right",
        theme: theme,
      });
    } catch (error) {
      toast.error('Failed to update provider status', {
        position: "top-right",
        theme: theme,
      });
    }
  };

  // Add to cart function (only operates on one item at a time)
  const handleAddToCart = async (provider) => {
    const pid = provider.id || provider._id;
    if (!user) {
      toast.error('Please login to add items to cart!', {
        position: "top-right",
        autoClose: 3000,
        theme: theme,
      });
      navigate('/login');
      return;
    }

    // Optimization: Only allow active (status === 1) providers for add to cart
    if (provider.status !== 1) {
      toast.error('This provider is currently inactive and cannot be added to cart!', {
        position: "top-right",
        autoClose: 3000,
        theme: theme,
      });
      return;
    }

    // Set per item loading true
    setLoadingCartItems(prev => ({ ...prev, [pid]: true }));

    try {
      // Prepare cart item
      const cartItem = {
        providerId: pid,
        provider: provider.provider,
        name: provider.provider,
        price: provider.price,
        status: provider.status,
        image: provider.img || 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?q=80&w=500',
        gameCount: provider.gameCount,
        rating: provider.rating,
        quantity: 1
      };

      await dispatch(addProvidersToCart(cartItem)).unwrap();
      await dispatch(getCartProviders());

      toast.success(`${provider.provider} added to cart!`, {
        position: "top-right",
        autoClose: 3000,
        theme: theme,
      });

    } catch (error) {
      toast.error(`${error.message || error}`, {
        position: "top-right",
        autoClose: 3000,
        theme: theme,
      });
    } finally {
      setLoadingCartItems(prev => ({ ...prev, [pid]: false }));
    }
  };

  // Remove from cart function (only operates on one item at a time)
  const handleRemoveFromCart = async (provider) => {
    const pid = provider.id || provider._id;
    const providerName = provider.provider || provider.name;
    setLoadingCartItems(prev => ({ ...prev, [pid]: true }));

    try {
      await dispatch(deleteProviderFromCart({ providerName })).unwrap();
      await dispatch(getCartProviders());

      toast.success('Removed from cart!', {
        position: "top-right",
        autoClose: 3000,
        theme: theme,
      });

    } catch (error) {
      toast.error(`${error.message || error}`, {
        position: "top-right",
        autoClose: 3000,
        theme: theme,
      });
    } finally {
      setLoadingCartItems(prev => ({ ...prev, [pid]: false }));
    }
  };

  // Cart toggle function, optimized (only triggers one cart update per click)
  const handleCartToggle = (provider) => {
    const pid = provider.id || provider._id;
    if (loadingCartItems[pid]) return; // Prevent double click

    if (isProviderInCart(provider)) {
      handleRemoveFromCart(provider);
    } else {
      handleAddToCart(provider);
    }
  };

  const handleViewProvider = (provider) => {
    navigate(`/provider/${provider.provider}`, { state: { provider } });
  };

  const filteredProviders = useMemo(() => {
    return providers
      .filter(provider => provider.status === 1)
      .filter(provider => {
        const matchesSearch =
          provider.provider?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          provider.path?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
          filterStatus === 'all' ||
          (filterStatus === 'active' && provider.status === 1) ||
          (filterStatus === 'inactive' && provider.status === 0);
        const matchesCategory =
          selectedCategory === 'all' ||
          (selectedCategory === 'active' && provider.status === 1) ||
          (selectedCategory === 'disabled' && provider.status === 0) ||
          (selectedCategory === 'premium' && provider.price >= 3000);
        const matchesPrice =
          priceFilter === 'all' ||
          (priceFilter === 'budget' && provider.price <= 1000) ||
          (priceFilter === 'mid' && provider.price > 1000 && provider.price < 3000) ||
          (priceFilter === 'premium' && provider.price >= 3000);
        return matchesSearch && matchesStatus && matchesCategory && matchesPrice;
      })
      .map(provider => {
        const id = provider.id || provider._id;
        const gameCount = id ? 50 + (id % 150) : 100;
        const rating = id ? (3.5 + (id % 15) / 10).toFixed(1) : '4.0';
        const inCart = inCartIds.includes(id);
        const category = provider.price >= 4000 ? 'premium' :
          provider.price >= 2000 ? 'popular' : 'standard';
        const features = provider.price >= 3000
          ? ['Premium Support', 'API Access', 'HD Games', 'Regular Updates']
          : ['API Access', 'Standard Support', 'Regular Updates'];

        return {
          ...provider,
          gameCount,
          rating,
          inCart,
          category,
          features,
          description: provider.description || `Professional ${provider.provider} gaming platform with ${gameCount}+ games and 24/7 support.`
        };
      });
  }, [providers, searchTerm, filterStatus, selectedCategory, priceFilter, inCartIds]);

  const sortedProviders = useMemo(() => {
    return [...filteredProviders].sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.provider.localeCompare(b.provider);
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'rating': return b.rating - a.rating;
        default: return 0;
      }
    });
  }, [filteredProviders, sortBy]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProviders = sortedProviders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedProviders.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => currentPage < totalPages && setCurrentPage(prev => prev + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(prev => prev - 1);

  // Handle items per page change
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  // Theme-based styles (unchanged)
  const containerBg = theme === 'dark'
    ? 'bg-gradient-to-b from-gray-900 to-black'
    : 'bg-gradient-to-b from-gray-50 to-white';
  const cardBg = theme === 'dark'
    ? 'bg-gradient-to-r from-gray-800/50 to-black/50'
    : 'bg-gradient-to-r from-white to-gray-50';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const textMuted = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  const hoverBorder = theme === 'dark' ? 'hover:border-blue-500/50' : 'hover:border-blue-400';
  const tagBg = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100';
  const tagText = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';

  const stats = [
    {
      label: 'Total Providers',
      value: providers.filter(p => p.status === 1).length,
      icon: <FiPackage className="w-6 h-6" />,
      change: providers.filter(p => p.status === 1).length > 0 ? '+' + Math.floor(providers.filter(p => p.status === 1).length * 0.1) : '0',
      color: 'blue'
    },
    {
      label: 'Active Providers',
      value: providers.filter(p => p.status === 1).length,
      icon: <FiTrendingUp className="w-6 h-6" />,
      change: '+3',
      color: 'green'
    },
    {
      label: 'Total Games',
      value: totalGames || 0,
      icon: <GiGamepad className="w-6 h-6" />,
      change: '+150',
      color: 'purple'
    },
    {
      label: 'In Cart',
      value: cartTotalItems,
      icon: <FiShoppingCart className="w-6 h-6" />,
      change: cartTotalItems > 0 ? '+' + cartTotalItems : '0',
      color: 'orange'
    }
  ];

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    for (let i = 0; i < fullStars; i++) {
      stars.push(<BsStarFill key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />);
    }
    if (hasHalfStar) {
      stars.push(<BsStarHalf key="half" className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />);
    }
    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<BsStarFill key={`empty-${i}`} className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300 dark:text-gray-600" />);
    }
    return stars;
  };

  return (
    <div className={`min-h-screen ${containerBg} py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6 xl:px-8`}>
      <div className=" mx-auto space-y-6 sm:space-y-8 animate-fade-in">
        {/* Hero Header */}
        <div className={`relative overflow-hidden rounded-2xl ${cardBg} border ${borderColor} p-4 sm:p-6 md:p-8`}>
          {theme === 'dark' ? (
            <>
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-500/5 to-purple-500/5 rounded-full -translate-y-32 translate-x-32" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-green-500/3 to-teal-500/3 rounded-full translate-y-48 -translate-x-48" />
            </>
          ) : (
            <>
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-100 to-purple-100 rounded-full -translate-y-32 translate-x-32" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-green-100 to-teal-100 rounded-full translate-y-48 -translate-x-48" />
            </>
          )}
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 ${theme === 'dark'
                    ? 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent'
                    : 'bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'
                  }`}>
                  Game Providers Marketplace
                </h1>
                <p className={`text-base sm:text-lg md:text-xl mb-4 sm:mb-6 ${textSecondary}`}>
                  Browse and purchase premium game providers for your platform
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/cart"
                  className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 text-sm sm:text-base ${theme === 'dark'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-xl hover:shadow-blue-600/30'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-xl hover:shadow-blue-400/30'
                    } hover:scale-105`}
                >
                  <FiShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                  View Cart ({cartTotalItems})
                </Link>
              </div>
            </div>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className={`p-3 sm:p-4 rounded-xl border ${borderColor} transition-all duration-300 hover:-translate-y-1`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-1.5 sm:p-2 rounded-lg ${theme === 'dark'
                        ? (stat.color === 'blue' ? 'bg-blue-500/20' :
                          stat.color === 'green' ? 'bg-green-500/20' :
                            stat.color === 'purple' ? 'bg-purple-500/20' :
                              'bg-orange-500/20')
                        : (stat.color === 'blue' ? 'bg-blue-100' :
                          stat.color === 'green' ? 'bg-green-100' :
                            stat.color === 'purple' ? 'bg-purple-100' :
                              'bg-orange-100')
                      }`}>
                      <span className={`${theme === 'dark'
                          ? (stat.color === 'blue' ? 'text-blue-400' :
                            stat.color === 'green' ? 'text-green-400' :
                              stat.color === 'purple' ? 'text-purple-400' :
                                'text-orange-400')
                          : (stat.color === 'blue' ? 'text-blue-600' :
                            stat.color === 'green' ? 'text-green-600' :
                              stat.color === 'purple' ? 'text-purple-600' :
                                'text-orange-600')
                        }`}>
                        {stat.icon}
                      </span>
                    </div>
                    <span className={`text-xs sm:text-sm font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${stat.change.startsWith('+')
                        ? theme === 'dark' ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-600'
                        : theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
                      }`}>
                      {stat.change}
                    </span>
                  </div>
                  <div>
                    <p className={`text-xl sm:text-2xl font-bold ${textPrimary}`}>
                      {stat.value.toLocaleString()}
                    </p>
                    <p className={`text-xs sm:text-sm ${textMuted} mt-1`}>
                      {stat.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Search and Filters Section */}
        <div className={`p-4 sm:p-6 rounded-2xl  top-4 z-10 ${theme === 'dark'
            ? 'bg-gray-900/80 backdrop-blur-sm border border-gray-800'
            : 'bg-white/80 backdrop-blur-sm border border-gray-200'
          }`}>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
            <div className="lg:w-1/3">
              <h2 className={`text-xl sm:text-2xl font-bold mb-2 ${textPrimary}`}>
                Premium Providers
              </h2>
              <p className={`text-sm sm:text-base ${textMuted}`}>
                Select from our curated collection of top providers
              </p>
            </div>
            <div className="lg:w-2/3 w-full">
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 
                      ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      placeholder="Search providers..."
                      className={`w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-lg focus:outline-none text-sm sm:text-base ${theme === 'dark'
                          ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-500'
                          : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400'
                        } ${showSuggestions ? 'rounded-b-none' : ''}`}
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      onFocus={() => searchTerm.length > 2 && setShowSuggestions(true)}
                    />
                    {showSuggestions && searchSuggestions.length > 0 && (
                      <div className={`absolute top-full left-0 right-0 z-50 mt-1 rounded-b-lg border ${theme === 'dark'
                          ? 'bg-gray-900 border-gray-700'
                          : 'bg-white border-gray-200'
                        } shadow-xl max-h-60 overflow-y-auto`}>
                        {searchSuggestions.map((provider) => (
                          <div
                            key={provider.id}
                            className={`p-3 cursor-pointer transition-colors ${theme === 'dark'
                                ? 'hover:bg-gray-800'
                                : 'hover:bg-gray-100'
                              }`}
                            onClick={() => handleSuggestionClick(provider)}
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={provider.img || 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?q=80&w=100'}
                                alt={provider.provider}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                  <p className={`font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {provider.provider}
                                  </p>
                                  <span className={`text-xs px-2 py-0.5 rounded ${provider.status === 1
                                      ? theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
                                      : theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'
                                    }`}>
                                    {provider.status === 1 ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                                  ${provider.price} • Click to view details
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Filter Toggle Button */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-2.5 sm:py-3 rounded-lg border ${borderColor} flex items-center gap-2 text-sm sm:text-base ${theme === 'dark'
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <FiFilter className="w-4 h-4" />
                    Filters
                    <FiChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </button>
                  {/* View Toggle */}
                  <div className={`flex items-center rounded-lg p-1 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                    }`}>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded ${viewMode === 'grid' ?
                        theme === 'dark' ? 'bg-gray-700' : 'bg-white shadow-sm' :
                        'hover:opacity-80'
                        }`}
                    >
                      <FiGrid className={`w-4 h-4 ${viewMode === 'grid' ?
                          theme === 'dark' ? 'text-white' : 'text-blue-600' :
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded ${viewMode === 'list' ?
                        theme === 'dark' ? 'bg-gray-700' : 'bg-white shadow-sm' :
                        'hover:opacity-80'
                        }`}
                    >
                      <FiList className={`w-4 h-4 ${viewMode === 'list' ?
                          theme === 'dark' ? 'text-white' : 'text-blue-600' :
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                    </button>
                  </div>
                </div>
                {/* Expanded Filters */}
                {showFilters && (
                  <div className={`p-4 rounded-xl border ${borderColor} animate-slideDown ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-white/50'
                    }`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Category Filter */}
                      <div>
                        <label className={`text-sm font-medium mb-2 block ${textPrimary}`}>
                          Category
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {categories.map(cat => (
                            <button
                              key={cat.id}
                              onClick={() => setSelectedCategory(cat.id)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-all ${selectedCategory === cat.id
                                  ? theme === 'dark'
                                    ? `bg-${cat.color}-600 text-white`
                                    : `bg-${cat.color}-600 text-white`
                                  : theme === 'dark'
                                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                              {cat.icon}
                              <span>{cat.label}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded-full ${selectedCategory === cat.id
                                  ? 'bg-white/20'
                                  : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                                }`}>
                                {cat.count}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Status Filter */}
                      <div>
                        <label className={`text-sm font-medium mb-2 block ${textPrimary}`}>
                          Status
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setFilterStatus('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm ${filterStatus === 'all'
                                ? theme === 'dark'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-blue-600 text-white'
                                : theme === 'dark'
                                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                          >
                            All Status
                          </button>
                          <button
                            onClick={() => setFilterStatus('active')}
                            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm ${filterStatus === 'active'
                                ? theme === 'dark'
                                  ? 'bg-green-600 text-white'
                                  : 'bg-green-600 text-white'
                                : theme === 'dark'
                                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                          >
                            Active
                          </button>
                          <button
                            onClick={() => setFilterStatus('inactive')}
                            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm ${filterStatus === 'inactive'
                                ? theme === 'dark'
                                  ? 'bg-red-600 text-white'
                                  : 'bg-red-600 text-white'
                                : theme === 'dark'
                                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                          >
                            Inactive
                          </button>
                        </div>
                      </div>
                      {/* Price Filter */}
                      <div>
                        <label className={`text-sm font-medium mb-2 block ${textPrimary}`}>
                          Price Range
                        </label>
                        <select
                          value={priceFilter}
                          onChange={(e) => setPriceFilter(e.target.value)}
                          className={`w-full px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm ${theme === 'dark'
                              ? 'bg-gray-800 border border-gray-700 text-white'
                              : 'bg-white border border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                          {priceRanges.map(range => (
                            <option key={range.id} value={range.id}>
                              {range.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {/* Sort Options */}
                      <div>
                        <label className={`text-sm font-medium mb-2 block ${textPrimary}`}>
                          Sort By
                        </label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className={`w-full px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm ${theme === 'dark'
                              ? 'bg-gray-800 border border-gray-700 text-white'
                              : 'bg-white border border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                          <option value="name">Name A-Z</option>
                          <option value="price-low">Price: Low to High</option>
                          <option value="price-high">Price: High to Low</option>
                          <option value="rating">Highest Rated</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Items per page and results count */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className={`text-sm ${textMuted}`}>
            Showing {Math.min(indexOfFirstItem + 1, sortedProviders.length)}-
            {Math.min(indexOfLastItem, sortedProviders.length)} of {sortedProviders.length} providers
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm ${textMuted}`}>Items per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(e.target.value)}
              className={`px-3 py-1.5 rounded-lg text-sm ${theme === 'dark'
                  ? 'bg-gray-800 border border-gray-700 text-white'
                  : 'bg-white border border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="12">12</option>
              <option value="24">24</option>
              <option value="36">36</option>
              <option value="48">48</option>
            </select>
          </div>
        </div>
        {/* Error Message */}
        {error && (
          <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'border-red-500/20 bg-red-500/10' : 'border-red-200 bg-red-50'
            }`}>
            <p className={theme === 'dark' ? 'text-red-400' : 'text-red-600'}>{error}</p>
          </div>
        )}
        {/* Providers Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {currentProviders.map((provider) => (
              <div
                key={provider._id || provider.id}
                className={`group relative overflow-hidden rounded-2xl border transition-all duration-500 hover:-translate-y-2 ${hoverBorder} ${theme === 'dark'
                    ? 'bg-gray-900/30 border-gray-800'
                    : 'bg-white border-gray-200 shadow-sm'
                  }`}
              >
                {/* Provider Image */}
                <div className="relative h-40 sm:h-48 overflow-hidden">
                  <img
                    src={provider.img || 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?q=80&w=1000'}
                    alt={provider.provider}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${provider.provider}&background=0a0b0e&color=fff&bold=true&size=256`;
                    }}
                  />
                  <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gradient-to-t from-black/70 via-black/50 to-transparent' : 'bg-gradient-to-t from-white/20 via-transparent to-transparent'
                    }`} />
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <span className={`px-2 sm:px-3 py-1 text-xs font-bold rounded-full ${theme === 'dark' ? 'bg-black/80 text-white' : 'bg-white/90 text-gray-900'
                      } backdrop-blur-sm`}>
                      ₹{provider.price}
                    </span>
                    <span className={`px-2 sm:px-3 py-1 text-xs font-bold rounded-full ${provider.category === 'premium' ?
                        theme === 'dark' ? 'bg-yellow-500/90 text-yellow-100' : 'bg-yellow-100 text-yellow-800' :
                        provider.category === 'popular' ?
                          theme === 'dark' ? 'bg-blue-500/90 text-blue-100' : 'bg-blue-100 text-blue-800' :
                          theme === 'dark' ? 'bg-green-500/90 text-green-100' : 'bg-green-100 text-green-800'
                      }`}>
                      {provider.category?.toUpperCase()}
                    </span>
                  </div>
                  {/* Status Badge with Toggle */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(provider.id, provider.status);
                      }}
                      className={`px-2 sm:px-3 py-1 text-xs font-bold rounded-full transition-colors flex items-center gap-1 ${provider.status === 1
                          ? theme === 'dark'
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                          : theme === 'dark'
                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${provider.status === 1 ? 'bg-green-400' : 'bg-red-400'}`} />
                      {provider.status === 1 ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>
                {/* Provider Info */}
                <div className="p-4 sm:p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className={`font-bold text-base sm:text-lg mb-1 ${textPrimary} truncate`}>
                        {provider.provider}
                      </h3>
                      <div className="flex items-center gap-1 flex-wrap">
                        <div className="flex items-center">
                          {renderStars(provider.rating)}
                          <span className={`text-xs sm:text-sm ${textSecondary} ml-1`}>{provider.rating}</span>
                        </div>
                        <span className={`text-xs sm:text-sm ${textMuted} mx-2`}>•</span>
                        <span className={`text-xs sm:text-sm ${textMuted}`}>{provider.gameCount} Games</span>
                      </div>
                    </div>
                    <div className="text-right pl-2">
                      <div className={`text-lg sm:text-xl font-bold ${textPrimary}`}>₹{provider.price.toLocaleString()}</div>
                      <div className={`text-xs ${textMuted}`}>one-time fee</div>
                    </div>
                  </div>
                  <p className={`text-xs sm:text-sm ${textMuted} mb-3 sm:mb-4 line-clamp-2`}>
                    {provider.description}
                  </p>
                  {/* Features */}
                  <div className="flex flex-wrap gap-1.5 mb-3 sm:mb-4">
                    {provider.features?.slice(0, 2).map((feature, idx) => (
                      <span key={idx} className={`px-2 py-0.5 text-xs rounded-lg ${tagBg} ${tagText}`}>
                        {feature}
                      </span>
                    ))}
                    {provider.features?.length > 2 && (
                      <span className={`px-2 py-0.5 text-xs rounded-lg ${tagBg} ${tagText}`}>
                        +{provider.features.length - 2} more
                      </span>
                    )}
                  </div>
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCartToggle(provider);
                      }}
                      disabled={loadingCartItems[provider.id || provider._id]}
                      className={`flex-1 py-2 sm:py-2.5 rounded-lg font-medium transition-all duration-300 hover:shadow-lg text-xs sm:text-sm
                        ${isProviderInCart(provider)
                          ? theme === 'dark'
                            ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700'
                            : 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600'
                          : theme === 'dark'
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600'
                        }
                        ${loadingCartItems[provider.id || provider._id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {loadingCartItems[provider.id || provider._id]
                        ? 'Processing...'
                        : isProviderInCart(provider)
                          ? 'Remove from Cart'
                          : 'Add to Cart'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewProvider(provider);
                      }}
                      className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border ${borderColor} ${textPrimary} hover:bg-gray-800/20 transition-all duration-300 flex items-center gap-1 text-xs sm:text-sm`}
                    >
                      <FiEye className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline">View</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className="space-y-3 sm:space-y-4">
            {currentProviders.map((provider) => (
              <div
                key={provider._id || provider.id}
                className={`group rounded-2xl border transition-all duration-500 hover:-translate-y-1 ${hoverBorder} ${theme === 'dark'
                    ? 'bg-gray-900/30 border-gray-800'
                    : 'bg-white border-gray-200 shadow-sm'
                  }`}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                    {/* Provider Image */}
                    <div className="w-full sm:w-32 md:w-40 h-40 sm:h-32 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={provider.img || 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?q=80&w=500'}
                        alt={provider.provider}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${provider.provider}&background=0a0b0e&color=fff&bold=true&size=256`;
                        }}
                      />
                    </div>
                    {/* Provider Info */}
                    <div className="flex-1">
                      <div className="flex flex-col lg:flex-row justify-between items-start gap-3 sm:gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                            <h3 className={`font-bold text-lg sm:text-xl ${textPrimary}`}>
                              {provider.provider}
                            </h3>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                              <span className={`px-2 sm:px-3 py-1 text-xs font-bold rounded-full ${provider.category === 'premium' ?
                                  theme === 'dark' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-800' :
                                  provider.category === 'popular' ?
                                    theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-800' :
                                    theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-800'
                                }`}>
                                {provider.category?.toUpperCase()}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleStatus(provider.id, provider.status);
                                }}
                                className={`px-2 sm:px-3 py-1 text-xs font-bold rounded-full transition-colors flex items-center gap-1 ${provider.status === 1
                                    ? theme === 'dark'
                                      ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                      : 'bg-green-100 text-green-600 hover:bg-green-200'
                                    : theme === 'dark'
                                      ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                      : 'bg-red-100 text-red-600 hover:bg-red-200'
                                  }`}
                              >
                                <div className={`w-1.5 h-1.5 rounded-full ${provider.status === 1 ? 'bg-green-400' : 'bg-red-400'}`} />
                                {provider.status === 1 ? 'Active' : 'Inactive'}
                              </button>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-3">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center">
                                {renderStars(provider.rating)}
                              </div>
                              <span className={`text-sm ${textSecondary}`}>{provider.rating}</span>
                            </div>
                            <span className={`text-sm ${textMuted}`}>• {provider.gameCount} Games</span>
                            <div className="flex flex-wrap gap-1.5">
                              {provider.features?.slice(0, 2).map((feature, idx) => (
                                <span key={idx} className={`px-2 py-0.5 text-xs rounded-lg ${tagBg} ${tagText}`}>
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                          <p className={`text-sm ${textMuted} mb-3 sm:mb-4 line-clamp-2`}>
                            {provider.description}
                          </p>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className={`text-2xl sm:text-3xl font-bold mb-2 ${textPrimary}`}>₹{provider.price.toLocaleString()}</div>
                          <div className={`text-sm ${textMuted} mb-4`}>one-time license fee</div>
                        </div>
                      </div>
                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 sm:gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCartToggle(provider);
                          }}
                          disabled={loadingCartItems[provider.id || provider._id]}
                          className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium transition-all duration-300 hover:shadow-lg text-sm
                            ${isProviderInCart(provider)
                              ? theme === 'dark'
                                ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700'
                                : 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600'
                              : theme === 'dark'
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                                : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600'
                            }
                            ${loadingCartItems[provider.id || provider._id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {loadingCartItems[provider.id || provider._id]
                            ? 'Processing...'
                            : isProviderInCart(provider)
                              ? 'Remove from Cart'
                              : 'Add to Cart'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewProvider(provider);
                          }}
                          className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg border ${borderColor} ${textPrimary} hover:bg-gray-800/20 transition-all duration-300 flex items-center gap-2 text-sm`}
                        >
                          <FiEye className="w-4 h-4" />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Pagination Controls */}
        {sortedProviders.length > itemsPerPage && (
          <div className={`p-4 sm:p-6 rounded-2xl border ${borderColor} ${theme === 'dark' ? 'bg-gray-900/30' : 'bg-white/50'
            }`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className={`text-sm ${textMuted}`}>Page {currentPage} of {totalPages}</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg border ${borderColor} transition-all duration-300 ${currentPage === 1
                      ? 'opacity-50 cursor-not-allowed'
                      : theme === 'dark'
                        ? 'hover:bg-gray-800 hover:border-blue-500/50'
                        : 'hover:bg-gray-100 hover:border-blue-400'
                    }`}
                >
                  <FiChevronLeft className={`w-5 h-5 ${textPrimary}`} />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => paginate(pageNumber)}
                        className={`w-10 h-10 rounded-lg border transition-all duration-300 ${currentPage === pageNumber
                            ? theme === 'dark'
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : 'bg-blue-600 border-blue-500 text-white'
                            : theme === 'dark'
                              ? 'border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-blue-500/50'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-blue-400'
                          }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <span className={`px-2 ${textMuted}`}>...</span>
                  )}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <button
                      onClick={() => paginate(totalPages)}
                      className={`w-10 h-10 rounded-lg border transition-all duration-300 ${currentPage === totalPages
                          ? theme === 'dark'
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-blue-600 border-blue-500 text-white'
                          : theme === 'dark'
                            ? 'border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-blue-500/50'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-blue-400'
                        }`}
                    >
                      {totalPages}
                    </button>
                  )}
                </div>
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg border ${borderColor} transition-all duration-300 ${currentPage === totalPages
                      ? 'opacity-50 cursor-not-allowed'
                      : theme === 'dark'
                        ? 'hover:bg-gray-800 hover:border-blue-500/50'
                        : 'hover:bg-gray-100 hover:border-blue-400'
                    }`}
                >
                  <FiChevronRight className={`w-5 h-5 ${textPrimary}`} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${textMuted}`}>Go to:</span>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value, 10);
                    if (page >= 1 && page <= totalPages) {
                      paginate(page);
                    }
                  }}
                  className={`w-20 px-3 py-1.5 rounded-lg border ${borderColor} text-center ${theme === 'dark'
                      ? 'bg-gray-800 text-white'
                      : 'bg-white text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>
          </div>
        )}
        {/* Empty State */}
        {filteredProviders.length === 0 && !loading && (
          <div className="text-center py-12 sm:py-16">
            <div className="relative inline-block mb-6 sm:mb-8">
              <div className={`text-6xl sm:text-8xl ${textMuted}`}>🎮</div>
              <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full animate-pulse ${theme === 'dark' ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gradient-to-r from-blue-400 to-purple-400'
                }`}></div>
            </div>
            <h3 className={`text-xl sm:text-2xl font-bold mb-3 ${textPrimary}`}>No providers found</h3>
            <p className={`${textMuted} max-w-md mx-auto mb-6 sm:mb-8 text-sm sm:text-base`}>
              Try adjusting your search or filter to find what you're looking for.
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setSelectedCategory('all');
                  setPriceFilter('all');
                  setSortBy('name');
                }}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl border ${borderColor} ${textPrimary} hover:bg-gray-800/20 transition-all duration-300 text-sm sm:text-base`}
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
        {/* Footer CTA */}
        {filteredProviders.length > 0 && (
          <div className={`p-6 sm:p-8 rounded-2xl text-center ${theme === 'dark'
              ? 'bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-800/30'
              : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100'
            }`}>
            <h3 className={`text-xl sm:text-2xl font-bold mb-3 ${textPrimary}`}>
              Ready to Expand Your Platform?
            </h3>
            <p className={`text-base sm:text-lg mb-6 ${textSecondary}`}>
              Start with our most popular providers and grow your game library.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link
                to="/cart"
                className={`px-6 sm:px-8 py-3 sm:py-3 rounded-xl font-bold transition-all duration-300 ${theme === 'dark'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-xl hover:shadow-blue-600/30'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-xl hover:shadow-blue-400/30'
                  } hover:scale-105 text-sm sm:text-base`}
              >
                Proceed to Checkout ({cartTotalItems} items)
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Providers;