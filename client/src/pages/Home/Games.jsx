import { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { 
  FiSearch, FiGrid, FiList, FiFilter, FiStar, 
  FiChevronLeft, FiChevronRight, FiPackage, FiUsers,
  FiTrendingUp, FiBox, FiAlertCircle, FiX
} from 'react-icons/fi';
import { GiGamepad } from 'react-icons/gi';
import { useDispatch, useSelector } from 'react-redux';
import { getGames, getGameTypes, getGameProviders } from '../../reducer/gameSlice';
// import { getAllProviders } from '../../reducer/providerSlice';
import GameCard from '../../components/UI/GameCard';
import { useTheme } from '../../contexts/ThemeContext';

const Games = () => {
  const { provider } = useParams();
  const location = useLocation();
  const { theme } = useTheme();
  const dispatch = useDispatch();
  
  // Get data from Redux store
  const { 
    games, 
    totalGames, 
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

  // Check mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Theme colors
  const themeColors = {
    dark: {
      bg: 'bg-[#0d1117]',
      text: 'text-white',
      secondaryText: 'text-gray-300',
      mutedText: 'text-gray-400',
      border: 'border-gray-800',
      hoverBorder: 'border-blue-500/50',
      cardBg: 'bg-gray-900/50',
      inputBg: 'bg-gray-800/50',
      hoverBg: 'hover:bg-gray-800/50',
      gradient: 'from-blue-600 to-indigo-600',
      shadow: 'shadow-lg shadow-black/20',
      backdrop: 'backdrop-blur-xl'
    },
    light: {
      bg: 'bg-white',
      text: 'text-gray-900',
      secondaryText: 'text-gray-700',
      mutedText: 'text-gray-600',
      border: 'border-gray-200',
      hoverBorder: 'border-blue-400',
      cardBg: 'bg-gray-50/50',
      inputBg: 'bg-gray-100/50',
      hoverBg: 'hover:bg-gray-100/50',
      gradient: 'from-blue-500 to-indigo-500',
      shadow: 'shadow-lg shadow-gray-200/50',
      backdrop: 'backdrop-blur-xl'
    }
  };

  const colors = themeColors[theme];

  // Set provider from URL if available
  useEffect(() => {
    if (provider) {
      setSelectedProvider(provider);
    }
  }, [provider]);

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(getGames({ 
          provider: provider !== 'all' ? provider : undefined,
          page: 1,
          size: 96 
        }));
        await dispatch(getGameTypes());
        await dispatch(getGameProviders());
        // await dispatch(getAllProviders());
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    fetchData();
  }, [dispatch, provider]);

  // Filter and sort games locally
  useEffect(() => {
    if (games && games.length > 0) {
      let filtered = [...games];
      
      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(game => 
          game.game_name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Apply provider filter
      if (selectedProvider !== 'all') {
        filtered = filtered.filter(game => 
          game.provider === selectedProvider
        );
      }
      
      // Apply type filter
      if (selectedType !== 'all') {
        filtered = filtered.filter(game => 
          game.game_type === selectedType
        );
      }
      
      // Apply sorting
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
      setPage(1); // Reset to first page on filter change
    }
  }, [games, searchTerm, selectedProvider, selectedType, sortBy]);

  // Get paginated games
  const getPaginatedGames = () => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return localFilteredGames.slice(startIndex, endIndex);
  };

  // Calculate pagination values
  const totalPages = Math.ceil(localFilteredGames.length / itemsPerPage);
  const paginatedGames = getPaginatedGames();

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setPage(1);
  };

  // Get provider name from provider ID
  const getProviderName = (providerId) => {
    if (!providerId || providerId === 'all') return 'All Providers';
    const provider = allProviders?.find(p => p.provider === providerId);
    return provider?.game_name || providerId;
  };

  // Get provider options for filter
  const providerOptions = ['all', ...(gameProviders || [])];

  // Get game type options for filter
  const gameTypeOptions = ['all', ...(gameTypes || [])];

  // Stats data
  const stats = [
    { 
      value: totalGames || 0, 
      label: 'Total Games',
      icon: <GiGamepad className="w-5 h-5 md:w-6 md:h-6" />,
      color: 'blue'
    },
    { 
      value: gameProviders?.length || 0, 
      label: 'Providers',
      icon: <FiUsers className="w-5 h-5 md:w-6 md:h-6" />,
      color: 'green'
    },
    { 
      value: gameTypes?.length || 0, 
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

  if (loading && games?.length === 0) {
    return (
      <div className={`min-h-[60vh] flex flex-col items-center justify-center ${colors.bg} px-4`}>
        <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${theme === 'dark' ? 'border-blue-500' : 'border-blue-600'}`} />
        <p className={`mt-4 ${colors.mutedText}`}>Loading games...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${colors.bg} ${colors.text} transition-colors duration-300 px-4 sm:px-6 lg:px-8 py-6 md:py-8`}>
      <div className=" mx-auto space-y-6 md:space-y-8 animate-fade-in">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link to="/" className={`${colors.secondaryText} hover:${colors.text} transition-colors`}>
            Home
          </Link>
          <span className={colors.mutedText}>/</span>
          <span className={colors.text}>Games</span>
          {selectedProvider !== 'all' && (
            <>
              <span className={colors.mutedText}>/</span>
              <span className={colors.text}>{getProviderName(selectedProvider)}</span>
            </>
          )}
        </div>

        {/* Hero Section */}
        <div className={`relative overflow-hidden rounded-xl md:rounded-2xl ${colors.cardBg} ${colors.border} border p-6 md:p-8 ${colors.backdrop}`}>
          {/* Background Patterns */}
          <div className={`absolute top-0 right-0 w-40 h-40 md:w-64 md:h-64 bg-gradient-to-bl ${
            theme === 'dark' ? 'from-blue-500/5 to-purple-500/5' : 'from-blue-100/30 to-purple-100/30'
          } rounded-full -translate-y-20 md:-translate-y-32 translate-x-20 md:translate-x-32`} />
          <div className={`absolute bottom-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-gradient-to-tr ${
            theme === 'dark' ? 'from-green-500/3 to-teal-500/3' : 'from-green-100/20 to-teal-100/20'
          } rounded-full translate-y-32 md:translate-y-48 -translate-x-32 md:-translate-x-48`} />
          
          <div className="relative z-10">
            <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${colors.text}`}>
              {selectedProvider === 'all' ? 'All Games Collection' : `${getProviderName(selectedProvider)} Games`}
            </h1>
            <p className={colors.secondaryText}>
              Browse through our collection of {totalGames || 0} games
            </p>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className={`${colors.cardBg} ${colors.backdrop} rounded-xl md:rounded-2xl ${colors.border} border p-4 transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${
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
                  <div className={`text-xl md:text-2xl font-bold ${colors.text}`}>{stat.value}</div>
                  <div className={`text-sm ${colors.mutedText}`}>{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Filter Toggle */}
        {isMobile && (
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className={`w-full flex items-center justify-center gap-2 py-3 ${colors.inputBg} ${colors.border} border rounded-xl font-medium ${colors.text}`}
          >
            <FiFilter className="w-5 h-5" />
            {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
            {!showMobileFilters && (searchTerm || selectedProvider !== 'all' || selectedType !== 'all') && (
              <span className={`px-2 py-1 text-xs rounded-full ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                Filtered
              </span>
            )}
          </button>
        )}

        {/* Filters */}
        <div className={`${colors.cardBg} ${colors.backdrop} rounded-xl md:rounded-2xl ${colors.border} border p-4 md:p-6 ${
          isMobile && !showMobileFilters ? 'hidden' : ''
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${colors.secondaryText}`}>
                Search Games
              </label>
              <div className="relative">
                <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${colors.mutedText}`} />
                <input
                  type="text"
                  placeholder="Search by game name..."
                  className={`w-full pl-10 pr-4 py-2.5 ${colors.inputBg} ${colors.border} border rounded-lg ${colors.text} placeholder:${colors.mutedText} focus:outline-none focus:ring-2 ${theme === 'dark' ? 'focus:ring-blue-500/50' : 'focus:ring-blue-400'} transition-all duration-300`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${colors.secondaryText}`}>
                Filter by Provider
              </label>
              <select
                className={`w-full px-4 py-2.5 ${colors.inputBg} ${colors.border} border rounded-lg ${colors.text} focus:outline-none focus:ring-2 ${theme === 'dark' ? 'focus:ring-blue-500/50' : 'focus:ring-blue-400'} transition-all duration-300`}
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
              >
                {providerOptions.map(provider => (
                  <option key={provider} value={provider} className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>
                    {getProviderName(provider)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${colors.secondaryText}`}>
                Filter by Type
              </label>
              <select
                className={`w-full px-4 py-2.5 ${colors.inputBg} ${colors.border} border rounded-lg ${colors.text} focus:outline-none focus:ring-2 ${theme === 'dark' ? 'focus:ring-blue-500/50' : 'focus:ring-blue-400'} transition-all duration-300`}
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                {gameTypeOptions.map(type => (
                  <option key={type} value={type} className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>
                    {type === 'all' ? 'All Types' : type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${colors.secondaryText}`}>
                Sort By
              </label>
              <select
                className={`w-full px-4 py-2.5 ${colors.inputBg} ${colors.border} border rounded-lg ${colors.text} focus:outline-none focus:ring-2 ${theme === 'dark' ? 'focus:ring-blue-500/50' : 'focus:ring-blue-400'} transition-all duration-300`}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name" className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>Name (A-Z)</option>
                <option value="provider" className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>Provider</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${colors.secondaryText}`}>
                Items Per Page
              </label>
              <select
                className={`w-full px-4 py-2.5 ${colors.inputBg} ${colors.border} border rounded-lg ${colors.text} focus:outline-none focus:ring-2 ${theme === 'dark' ? 'focus:ring-blue-500/50' : 'focus:ring-blue-400'} transition-all duration-300`}
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(e.target.value)}
              >
                <option value={12} className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>12</option>
                <option value={24} className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>24</option>
                <option value={48} className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>48</option>
                <option value={96} className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>96</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-6">
            <div className={`text-sm ${colors.mutedText}`}>
              Showing {paginatedGames.length} of {localFilteredGames.length} games 
              {(searchTerm || selectedProvider !== 'all' || selectedType !== 'all') && ' (filtered)'}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className={`text-sm ${colors.mutedText}`}>View:</span>
                <div className={`flex items-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-1`}>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-all duration-300 ${viewMode === 'grid' ? 
                      theme === 'dark' ? 'bg-gray-700' : 'bg-white shadow-sm' : 
                      'hover:opacity-80'
                    }`}
                  >
                    <FiGrid className={`w-4 h-4 ${
                      viewMode === 'grid' ? 
                        colors.text : 
                        colors.mutedText
                    }`} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition-all duration-300 ${viewMode === 'list' ? 
                      theme === 'dark' ? 'bg-gray-700' : 'bg-white shadow-sm' : 
                      'hover:opacity-80'
                    }`}
                  >
                    <FiList className={`w-4 h-4 ${
                      viewMode === 'list' ? 
                        colors.text : 
                        colors.mutedText
                    }`} />
                  </button>
                </div>
              </div>

              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedProvider('all');
                  setSelectedType('all');
                }}
                className={`flex items-center gap-2 px-4 py-2 ${colors.inputBg} ${colors.border} border rounded-lg ${colors.text} ${colors.hoverBg} transition-colors`}
              >
                <FiX className={`w-4 h-4 ${colors.mutedText}`} />
                <span>Clear Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Featured Games (Only when no filters) */}
        {selectedProvider === 'all' && selectedType === 'all' && !searchTerm && games && games.length > 0 && (
          <div className={`${colors.cardBg} ${colors.backdrop} rounded-xl md:rounded-2xl ${colors.border} border p-6`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${
                  theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
                } flex items-center justify-center`}>
                  <FiStar className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <h2 className={`text-xl font-bold ${colors.text}`}>Featured Games</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {games.slice(0, 5).map((game, index) => (
                <div key={game._id || index} className="transform transition-all duration-500 hover:-translate-y-1">
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {paginatedGames.map((game) => (
                  <div key={game._id || game.id} className="transform transition-all duration-500 hover:-translate-y-1">
                    <GameCard game={game} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedGames.map((game) => (
                  <div
                    key={game._id || game.id}
                    className={`group ${colors.cardBg} ${colors.backdrop} ${colors.border} border rounded-xl md:rounded-2xl p-6 hover:shadow-xl ${
                      theme === 'dark' 
                        ? 'hover:shadow-blue-500/10 hover:-translate-y-1' 
                        : 'hover:shadow-gray-300 hover:-translate-y-1'
                    } transition-all duration-500`}
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div className="flex items-start gap-6">
                        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden ${colors.inputBg} ${colors.border} border flex items-center justify-center`}>
                          <img
                            src={game.icon}
                            alt={game.game_name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?q=80&w=400';
                            }}
                          />
                        </div>
                        <div>
                          <h3 className={`font-bold text-lg mb-2 ${colors.text}`}>{game.game_name}</h3>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <div className="flex items-center gap-1">
                              <div className={`w-5 h-5 rounded ${
                                theme === 'dark' 
                                  ? 'bg-gradient-to-br from-gray-800 to-black' 
                                  : 'bg-gradient-to-br from-gray-200 to-gray-300'
                              } flex items-center justify-center ${colors.text} text-xs`}>
                                {game.provider?.charAt(0) || 'P'}
                              </div>
                              <span className={`text-sm ${colors.mutedText}`}>{getProviderName(game.provider)}</span>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'} ${colors.secondaryText}`}>
                              {game.game_type}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'} ${colors.secondaryText}`}>
                              ID: {(game.game_uid || game._id || '').substring(0, 8)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className={`px-6 py-3 ${
                        theme === 'dark'
                          ? 'bg-gradient-to-r from-gray-800 to-black border-gray-700 text-white'
                          : 'bg-gradient-to-r from-gray-100 to-white border-gray-300 text-gray-900'
                      } border-2 rounded-xl font-medium hover:shadow-lg ${
                        theme === 'dark' ? 'hover:border-blue-500/50' : 'hover:border-blue-400'
                      } transition-all duration-300 group-hover:scale-105 active:scale-95`}>
                        Play Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col md:flex-row items-center justify-between py-6 md:py-8 gap-4 md:gap-6">
                <div className={colors.mutedText}>
                  Page <span className={`font-bold ${colors.text}`}>{page}</span> of{' '}
                  <span className={`font-bold ${colors.text}`}>{totalPages}</span>
                </div>
                
                <div className="flex items-center gap-2 md:gap-3">
                  {/* Previous Button */}
                  <button 
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className={`flex items-center gap-2 px-4 py-2.5 md:px-5 md:py-3 rounded-xl border transition-all duration-300 ${
                      page === 1 
                        ? `${colors.inputBg} ${colors.border} ${colors.mutedText} cursor-not-allowed` 
                        : `${colors.inputBg} ${colors.border} ${colors.secondaryText} ${colors.hoverBg} hover:${theme === 'dark' ? 'shadow-black/20' : 'shadow-gray-300'} hover:shadow-lg`
                    }`}
                  >
                    <FiChevronLeft className="w-4 h-4" />
                    {!isMobile && 'Previous'}
                  </button>
                  
                  {/* Page Numbers */}
                  <div className="flex items-center gap-2">
                    {getPageNumbers().map(pageNum => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl border transition-all duration-300 ${
                          page === pageNum
                            ? `bg-gradient-to-br ${colors.gradient} text-white border-transparent shadow-lg ${theme === 'dark' ? 'shadow-blue-500/20' : 'shadow-blue-400/20'}`
                            : `${colors.inputBg} ${colors.border} ${colors.mutedText} ${colors.hoverBg} hover:${colors.text}`
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>
                  
                  {/* Next Button */}
                  <button 
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className={`flex items-center gap-2 px-4 py-2.5 md:px-5 md:py-3 rounded-xl border transition-all duration-300 ${
                      page === totalPages
                        ? `${colors.inputBg} ${colors.border} ${colors.mutedText} cursor-not-allowed` 
                        : `${colors.inputBg} ${colors.border} ${colors.secondaryText} ${colors.hoverBg} hover:${theme === 'dark' ? 'shadow-black/20' : 'shadow-gray-300'} hover:shadow-lg`
                    }`}
                  >
                    {!isMobile && 'Next'}
                    <FiChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-12 md:py-16">
            <div className={`w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 flex items-center justify-center ${
              theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'
            } rounded-full`}>
              <GiGamepad className={`w-8 h-8 md:w-10 md:h-10 ${colors.mutedText}`} />
            </div>
            <h3 className={`text-xl md:text-2xl font-bold mb-3 ${colors.text}`}>No games found</h3>
            <p className={`${colors.mutedText} max-w-md mx-auto mb-8`}>
              {searchTerm || selectedProvider !== 'all' || selectedType !== 'all' 
                ? "Try adjusting your search or filter to find what you're looking for."
                : "Loading games..."}
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedProvider('all');
                  setSelectedType('all');
                }}
                className={`px-6 py-2.5 ${colors.inputBg} ${colors.border} border rounded-xl hover:shadow-lg transition-all duration-300 active:scale-95 ${colors.text}`}
              >
                Clear Filters
              </button>
              <Link
                to="/providers"
                className={`px-6 py-2.5 bg-gradient-to-br ${colors.gradient} text-white rounded-xl hover:shadow-lg ${theme === 'dark' ? 'hover:shadow-blue-600/30' : 'hover:shadow-blue-400/30'} transition-all duration-300 active:scale-95`}
              >
                Browse Providers
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Games;