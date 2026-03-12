import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiSearch, FiGrid, FiList, FiFilter, FiStar, 
  FiChevronLeft, FiChevronRight, FiPackage, FiUsers,
  FiTrendingUp, FiBox, FiAlertCircle, FiX, FiMenu
} from 'react-icons/fi';
import { GiGamepad } from 'react-icons/gi';
import { useDispatch, useSelector } from 'react-redux';
import { getGames, getGameTypes, getGameProviders } from '../reducer/gameSlice';
import GameCard from '../components/UI/GameCard';
import { useTheme } from '../contexts/ThemeContext';

const AllPages = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  
  // Get data from Redux store
  const { 
    games, 
    totalGames, 
    currentPage, 
    perPage, 
    gameTypes, 
    providers: gameProviders,
    loading 
  } = useSelector((state) => state.games);
  
  const { providers: allProviders } = useSelector((state) => state.providers);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(24);
  const [localFilteredGames, setLocalFilteredGames] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);

  // Check mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check if filters are active
  useEffect(() => {
    setIsFilterActive(
      searchTerm !== '' || 
      selectedProvider !== 'all' || 
      selectedType !== 'all'
    );
  }, [searchTerm, selectedProvider, selectedType]);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth" 
    });
  }, []);

  // Theme-based styles with mobile optimizations
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
  const inputBg = theme === 'dark' ? 'bg-gray-900/50' : 'bg-white';
  const selectBg = theme === 'dark' ? 'bg-gray-900' : 'bg-white';
  const tagBg = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100';
  const tagText = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const activeFilter = theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600';

  // Initial data loading
  useEffect(() => {
    dispatch(getGames({ page: 1, size: 96 }));
    dispatch(getGameTypes());
    dispatch(getGameProviders());
  }, [dispatch]);

  // Filter and sort games locally
  useEffect(() => {
    if (games.length > 0) {
      let filtered = [...games];
      
      if (searchTerm) {
        filtered = filtered.filter(game => 
          game.game_name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (selectedProvider !== 'all') {
        filtered = filtered.filter(game => 
          game.provider === selectedProvider
        );
      }
      
      if (selectedType !== 'all') {
        filtered = filtered.filter(game => 
          game.game_type === selectedType
        );
      }
      
      filtered.sort((a, b) => {
        switch(sortBy) {
          case 'name': 
            return (a.game_name || '').localeCompare(b.game_name || '');
          case 'provider': 
            return (a.provider || '').localeCompare(b.provider || '');
          default: 
            return 0;
        }
      });
      
      setLocalFilteredGames(filtered);
      setPage(1);
    }
  }, [games, searchTerm, selectedProvider, selectedType, sortBy]);

  // Get paginated games
  const getPaginatedGames = () => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return localFilteredGames.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(localFilteredGames.length / itemsPerPage);
  const paginatedGames = getPaginatedGames();

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setPage(1);
  };

  const getProviderName = (providerId) => {
    const provider = allProviders.find(p => p.provider === providerId);
    return provider?.game_name || providerId;
  };

  const providerOptions = ['all', ...gameProviders];
  const gameTypeOptions = ['all', ...gameTypes];

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedProvider('all');
    setSelectedType('all');
    setSortBy('name');
    if (isMobile) {
      setShowMobileFilters(false);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = isMobile ? 3 : 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, page - Math.floor(maxVisiblePages / 2));
      let end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      for (let i = start; i <= end; i++) pages.push(i);
    }
    
    return pages;
  };

  // Stats data
  const stats = [
    { 
      value: totalGames, 
      label: 'Total Games',
      icon: <GiGamepad className="w-5 h-5 md:w-6 md:h-6" />,
      color: 'blue'
    },
    { 
      value: gameProviders.length, 
      label: 'Providers',
      icon: <FiUsers className="w-5 h-5 md:w-6 md:h-6" />,
      color: 'green'
    },
    { 
      value: gameTypes.length, 
      label: 'Game Types',
      icon: <FiPackage className="w-5 h-5 md:w-6 md:h-6" />,
      color: 'purple'
    },
    { 
      value: localFilteredGames.length, 
      label: 'Showing',
      icon: <FiTrendingUp className="w-5 h-5 md:w-6 md:h-6" />,
      color: 'orange'
    },
  ];

  if (loading && games.length === 0) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${containerBg} px-4`}>
        <div className={`animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 ${
          theme === 'dark' ? 'border-blue-500' : 'border-blue-600'
        }`} />
        <p className={`mt-4 ${textMuted} text-sm sm:text-base`}>Loading games...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${containerBg} py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6 xl:px-8`}>
      <div className=" mx-auto space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in">
        
        {/* Mobile Header */}
        {isMobile && (
          <div className="flex items-center justify-between sticky top-0 z-40 py-2 bg-inherit">
            <h1 className="text-lg font-bold truncate max-w-[200px]">All Games</h1>
            <div className="flex items-center gap-2">
              {isFilterActive && (
                <span className={`px-2 py-1 text-xs rounded-full ${activeFilter}`}>
                  {localFilteredGames.length} results
                </span>
              )}
              <button
                onClick={() => setShowMobileFilters(true)}
                className={`p-2.5 rounded-lg relative ${inputBg} ${borderColor} border min-h-[44px] min-w-[44px] flex items-center justify-center`}
              >
                <FiFilter className="w-5 h-5" />
                {isFilterActive && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Mobile Filters Modal */}
        {isMobile && showMobileFilters && (
          <>
            <div 
              className="fixed inset-0 z-50 bg-black/50 animate-fadeIn"
              onClick={() => setShowMobileFilters(false)}
            />
            
            <div className={`fixed bottom-0 left-0 right-0 z-50 mobile-filters-panel ${cardBg} backdrop-blur-sm rounded-t-2xl border-t ${borderColor} max-h-[85vh] overflow-y-auto animate-slideUp`}>
              <div className="sticky top-0 bg-inherit p-4 border-b ${borderColor} flex items-center justify-between">
                <h3 className={`font-bold text-lg ${textPrimary}`}>Filters</h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 rounded-lg hover:bg-gray-800/20 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Search */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                    Search Games
                  </label>
                  <div className="relative">
                    <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textMuted}`} />
                    <input
                      type="text"
                      placeholder="Search by game name..."
                      className={`w-full pl-10 pr-4 py-3 ${inputBg} border ${borderColor} rounded-lg ${textPrimary} placeholder-gray-500 focus:outline-none focus:ring-2 ${
                        theme === 'dark' ? 'focus:ring-blue-500/50' : 'focus:ring-blue-400'
                      } text-base`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Provider Filter */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                    Provider
                  </label>
                  <select
                    className={`w-full px-4 py-3 ${inputBg} border ${borderColor} rounded-lg ${textPrimary} focus:outline-none focus:ring-2 ${
                      theme === 'dark' ? 'focus:ring-blue-500/50' : 'focus:ring-blue-400'
                    } text-base`}
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                  >
                    {providerOptions.map(provider => (
                      <option key={provider} value={provider} className={selectBg}>
                        {provider === 'all' ? 'All Providers' : getProviderName(provider)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type Filter */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                    Game Type
                  </label>
                  <select
                    className={`w-full px-4 py-3 ${inputBg} border ${borderColor} rounded-lg ${textPrimary} focus:outline-none focus:ring-2 ${
                      theme === 'dark' ? 'focus:ring-blue-500/50' : 'focus:ring-blue-400'
                    } text-base`}
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    {gameTypeOptions.map(type => (
                      <option key={type} value={type} className={selectBg}>
                        {type === 'all' ? 'All Types' : type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                    Sort By
                  </label>
                  <select
                    className={`w-full px-4 py-3 ${inputBg} border ${borderColor} rounded-lg ${textPrimary} focus:outline-none focus:ring-2 ${
                      theme === 'dark' ? 'focus:ring-blue-500/50' : 'focus:ring-blue-400'
                    } text-base`}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="name">Name (A-Z)</option>
                    <option value="provider">Provider</option>
                  </select>
                </div>

                {/* Items Per Page */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                    Items Per Page
                  </label>
                  <select
                    className={`w-full px-4 py-3 ${inputBg} border ${borderColor} rounded-lg ${textPrimary} focus:outline-none focus:ring-2 ${
                      theme === 'dark' ? 'focus:ring-blue-500/50' : 'focus:ring-blue-400'
                    } text-base`}
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(e.target.value)}
                  >
                    <option value={12}>12</option>
                    <option value={24}>24</option>
                    <option value={48}>48</option>
                    <option value={96}>96</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <button
                    onClick={clearFilters}
                    className={`py-3 ${inputBg} ${borderColor} border rounded-lg font-medium ${textPrimary} hover:bg-gray-800/20 transition-colors min-h-[44px]`}
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className={`py-3 bg-gradient-to-r ${
                      theme === 'dark' ? 'from-blue-600 to-indigo-600' : 'from-blue-500 to-indigo-500'
                    } text-white rounded-lg font-medium min-h-[44px]`}
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Hero Section - Simplified for mobile */}
        <div className={`relative overflow-hidden rounded-xl sm:rounded-2xl ${cardBg} border ${borderColor} p-4 sm:p-6 md:p-8`}>
          {/* Background Patterns - Hidden on mobile */}
          {!isMobile && (
            <>
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
            </>
          )}
          
          <div className="relative z-10">
            <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 ${
              theme === 'dark' 
                ? 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent'
                : 'bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'
            }`}>
              All Games Collection
            </h1>
            <p className={`text-sm sm:text-base ${textSecondary}`}>
              Browse through {localFilteredGames.length} of {totalGames} games
            </p>
          </div>
        </div>

        {/* Stats Bar - Horizontal scroll on mobile */}
        <div className="overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
          <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 min-w-max sm:min-w-0">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className={`w-40 sm:w-auto ${cardBg} backdrop-blur-sm rounded-xl sm:rounded-2xl border ${borderColor} p-3 sm:p-4 transition-all duration-300 hover:-translate-y-1`}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`p-1.5 sm:p-2 rounded-lg ${
                    theme === 'dark' 
                      ? (stat.color === 'blue' ? 'bg-blue-500/20' :
                         stat.color === 'green' ? 'bg-green-500/20' :
                         stat.color === 'purple' ? 'bg-purple-500/20' :
                         'bg-orange-500/20')
                      : (stat.color === 'blue' ? 'bg-blue-100' :
                         stat.color === 'green' ? 'bg-green-100' :
                         stat.color === 'purple' ? 'bg-purple-100' :
                         'bg-orange-100')
                  }`}>
                    <span className={`${
                      theme === 'dark'
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
                  <div>
                    <div className={`text-lg sm:text-xl md:text-2xl font-bold ${textPrimary}`}>{stat.value}</div>
                    <div className={`text-xs sm:text-sm ${textMuted}`}>{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Filters - Hidden on mobile */}
        {!isMobile && (
          <div className={`${cardBg} backdrop-blur-sm rounded-2xl border ${borderColor} p-6`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                  Search Games
                </label>
                <div className="relative">
                  <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textMuted}`} />
                  <input
                    type="text"
                    placeholder="Search by game name..."
                    className={`w-full pl-10 pr-4 py-2 ${inputBg} border ${borderColor} rounded-lg ${textPrimary} placeholder-gray-500 focus:outline-none focus:ring-2 ${
                      theme === 'dark' ? 'focus:ring-blue-500/50 focus:border-blue-500/30' : 'focus:ring-blue-400 focus:border-blue-300'
                    } transition-all`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                  Filter by Provider
                </label>
                <select
                  className={`w-full px-4 py-2 ${inputBg} border ${borderColor} rounded-lg ${textPrimary} focus:outline-none focus:ring-2 ${
                    theme === 'dark' ? 'focus:ring-blue-500/50' : 'focus:ring-blue-400'
                  } transition-all`}
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                >
                  {providerOptions.map(provider => (
                    <option key={provider} value={provider} className={selectBg}>
                      {provider === 'all' ? 'All Providers' : getProviderName(provider)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                  Filter by Type
                </label>
                <select
                  className={`w-full px-4 py-2 ${inputBg} border ${borderColor} rounded-lg ${textPrimary} focus:outline-none focus:ring-2 ${
                    theme === 'dark' ? 'focus:ring-blue-500/50' : 'focus:ring-blue-400'
                  } transition-all`}
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  {gameTypeOptions.map(type => (
                    <option key={type} value={type} className={selectBg}>
                      {type === 'all' ? 'All Types' : type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                  Sort By
                </label>
                <select
                  className={`w-full px-4 py-2 ${inputBg} border ${borderColor} rounded-lg ${textPrimary} focus:outline-none focus:ring-2 ${
                    theme === 'dark' ? 'focus:ring-blue-500/50' : 'focus:ring-blue-400'
                  } transition-all`}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="provider">Provider</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                  Items Per Page
                </label>
                <select
                  className={`w-full px-4 py-2 ${inputBg} border ${borderColor} rounded-lg ${textPrimary} focus:outline-none focus:ring-2 ${
                    theme === 'dark' ? 'focus:ring-blue-500/50' : 'focus:ring-blue-400'
                  } transition-all`}
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(e.target.value)}
                >
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                  <option value={96}>96</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-6">
              <div className={`text-sm ${textMuted}`}>
                Showing {paginatedGames.length} of {localFilteredGames.length} games 
                {isFilterActive && ' (filtered)'}
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${textMuted}`}>View:</span>
                  <div className={`flex items-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-1`}>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded min-h-[36px] min-w-[36px] flex items-center justify-center ${
                        viewMode === 'grid' ? 
                        theme === 'dark' ? 'bg-gray-700' : 'bg-white shadow-sm' : 
                        'hover:opacity-80'
                      }`}
                    >
                      <FiGrid className={`w-4 h-4 ${
                        viewMode === 'grid' ? 
                          theme === 'dark' ? 'text-white' : 'text-blue-600' : 
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded min-h-[36px] min-w-[36px] flex items-center justify-center ${
                        viewMode === 'list' ? 
                        theme === 'dark' ? 'bg-gray-700' : 'bg-white shadow-sm' : 
                        'hover:opacity-80'
                      }`}
                    >
                      <FiList className={`w-4 h-4 ${
                        viewMode === 'list' ? 
                          theme === 'dark' ? 'text-white' : 'text-blue-600' : 
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                    </button>
                  </div>
                </div>

                {isFilterActive && (
                  <button 
                    onClick={clearFilters}
                    className={`flex items-center gap-2 px-4 py-2 ${inputBg} border ${borderColor} rounded-lg ${
                      theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                    } transition-colors min-h-[44px]`}
                  >
                    <FiX className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Clear Filters</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Featured Games - Hide on mobile when filters active */}
        {selectedProvider === 'all' && selectedType === 'all' && !searchTerm && games.length > 0 && !isFilterActive && (
          <div className={`${cardBg} backdrop-blur-sm rounded-xl sm:rounded-2xl border ${borderColor} p-4 sm:p-6`}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${
                  theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
                } flex items-center justify-center`}>
                  <FiStar className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                </div>
                <h2 className={`text-base sm:text-lg md:text-xl font-bold ${textPrimary}`}>Featured Games</h2>
              </div>
              <Link to="/dashboard" className={`text-xs sm:text-sm ${textSecondary} hover:${textPrimary} transition-colors`}>
                View Dashboard
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {games.slice(0, 5).map((game, index) => (
                <div key={game._id || index} className="transform transition-all duration-500 hover:-translate-y-2">
                  <GameCard game={game} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Games Display */}
        {paginatedGames.length > 0 ? (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {paginatedGames.map((game) => (
                  <div key={game._id || game.id} className="transform transition-all duration-500 hover:-translate-y-2">
                    <GameCard game={game} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {paginatedGames.map((game) => (
                  <div
                    key={game._id || game.id}
                    className={`group ${cardBg} backdrop-blur-sm border ${borderColor} rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-xl ${
                      theme === 'dark' 
                        ? 'hover:shadow-blue-500/10 hover:-translate-y-1' 
                        : 'hover:shadow-gray-300 hover:-translate-y-1'
                    } transition-all duration-500`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
                      <div className="flex items-start gap-4 sm:gap-6 w-full">
                        <img
                          src={game.icon}
                          alt={game.game_name}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border-2 border-gray-700 group-hover:border-blue-500/50 transition-colors duration-300"
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-bold text-base sm:text-lg mb-1 sm:mb-2 ${textPrimary} truncate`}>
                            {game.game_name}
                          </h3>
                          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                            <div className="flex items-center gap-1">
                              <div className={`w-5 h-5 rounded ${
                                theme === 'dark' 
                                  ? 'bg-gradient-to-br from-gray-800 to-black' 
                                  : 'bg-gradient-to-br from-gray-200 to-gray-300'
                              } flex items-center justify-center ${textPrimary} text-xs`}>
                                {game.provider?.charAt(0) || 'P'}
                              </div>
                              <span className={`text-xs sm:text-sm ${textMuted} truncate max-w-[100px] sm:max-w-[150px]`}>
                                {getProviderName(game.provider)}
                              </span>
                            </div>
                            <span className={`px-2 py-0.5 sm:px-3 sm:py-1 text-xs rounded ${
                              theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700'
                            }`}>
                              {game.game_type}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className={`w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 ${
                        theme === 'dark'
                          ? 'bg-gradient-to-r from-gray-800 to-black border-gray-700 text-white'
                          : 'bg-gradient-to-r from-gray-100 to-white border-gray-300 text-gray-900'
                      } border-2 rounded-xl font-medium hover:shadow-lg ${
                        theme === 'dark' ? 'hover:border-blue-500/50' : 'hover:border-blue-400'
                      } transition-all duration-300 group-hover:scale-105 active:scale-95 text-sm sm:text-base`}>
                        Play Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-4 py-6 sm:py-8">
                {/* Mobile Pagination */}
                {isMobile ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg border ${borderColor} ${
                        page === 1 ? 'opacity-50' : inputBg
                      } min-h-[44px] min-w-[44px]`}
                    >
                      <FiChevronLeft className="w-5 h-5" />
                    </button>
                    
                    <span className={`px-4 py-2 ${inputBg} rounded-lg ${textPrimary} min-w-[80px] text-center`}>
                      {page} / {totalPages}
                    </span>
                    
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg border ${borderColor} ${
                        page === totalPages ? 'opacity-50' : inputBg
                      } min-h-[44px] min-w-[44px]`}
                    >
                      <FiChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  /* Desktop Pagination */
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl border transition-all duration-300 ${
                        page === 1 
                          ? `${theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-100'} ${borderColor} ${
                              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                            } cursor-not-allowed` 
                          : `${theme === 'dark' ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-gray-100 hover:bg-gray-200'} ${borderColor} ${textMuted} hover:${textPrimary} hover:shadow-lg ${
                              theme === 'dark' ? 'hover:border-blue-500/50' : 'hover:border-blue-400'
                            }`
                      }`}
                    >
                      <FiChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-2">
                      {getPageNumbers().map(pageNum => (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl border transition-all duration-300 ${
                            page === pageNum
                              ? theme === 'dark'
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 shadow-lg shadow-blue-500/20'
                                : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-400 shadow-lg shadow-blue-400/20'
                              : `${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'} ${borderColor} ${
                                  textMuted
                                } hover:${textPrimary} ${
                                  theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
                                } hover:border-gray-600`
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>
                    
                    <button 
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                      className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl border transition-all duration-300 ${
                        page === totalPages
                          ? `${theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-100'} ${borderColor} ${
                              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                            } cursor-not-allowed` 
                          : `${theme === 'dark' ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-gray-100 hover:bg-gray-200'} ${borderColor} ${textMuted} hover:${textPrimary} hover:shadow-lg ${
                              theme === 'dark' ? 'hover:border-blue-500/50' : 'hover:border-blue-400'
                            }`
                      }`}
                    >
                      Next
                      <FiChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                <div className={`text-xs sm:text-sm ${textMuted}`}>
                  Page {page} of {totalPages}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-12 sm:py-16">
            <div className="relative inline-block mb-6 sm:mb-8">
              <div className={`w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 flex items-center justify-center ${
                theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'
              } rounded-full`}>
                <GiGamepad className={`w-10 h-10 sm:w-12 sm:h-12 ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                }`} />
              </div>
            </div>
            <h3 className={`text-lg sm:text-xl lg:text-2xl font-bold mb-3 ${textPrimary}`}>No games found</h3>
            <p className={`${textMuted} max-w-md mx-auto mb-6 sm:mb-8 text-sm sm:text-base px-4`}>
              {isFilterActive 
                ? "Try adjusting your search or filter to find what you're looking for."
                : "Loading games..."}
            </p>
            <div className="flex flex-wrap gap-3 justify-center px-4">
              {isFilterActive && (
                <button
                  onClick={clearFilters}
                  className={`px-5 sm:px-6 py-2.5 sm:py-3 ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-gray-800 to-black border-gray-700 text-white'
                      : 'bg-gradient-to-r from-gray-100 to-white border-gray-300 text-gray-900'
                  } rounded-xl hover:shadow-lg transition-all duration-300 text-sm sm:text-base min-h-[44px]`}
                >
                  Clear Filters
                </button>
              )}
              <Link
                to="/providers"
                className={`px-5 sm:px-6 py-2.5 sm:py-3 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-600/30'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-blue-400/30'
                } rounded-xl hover:shadow-lg transition-all duration-300 text-sm sm:text-base min-h-[44px]`}
              >
                Browse Providers
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AllPages;