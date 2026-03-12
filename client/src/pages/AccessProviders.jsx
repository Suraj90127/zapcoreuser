import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiKey, FiCopy, FiEye, FiEyeOff, FiExternalLink,
  FiDownload, FiRefreshCw, FiLock, FiUnlock,
  FiCalendar, FiClock, FiServer, FiDatabase,
  FiSettings, FiActivity, FiShield, FiUser,
  FiFilter, FiSearch, FiGrid, FiList,
  FiChevronRight, FiChevronDown, FiPlus,
  FiMinus, FiCheck, FiX, FiAlertCircle,
  FiMessageSquare, FiHelpCircle, FiBarChart,
  FiWifi, FiWifiOff, FiCpu, FiHardDrive,
  FiTerminal, FiCode, FiBox
} from 'react-icons/fi';
import { GiGamepad, GiServerRack, GiProcessor } from 'react-icons/gi';
import { MdDashboard, MdApi, MdSecurity } from 'react-icons/md';
import { SiJsonwebtokens } from 'react-icons/si';
import { useTheme } from '../contexts/ThemeContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  getActiveProviders,
  toggleProviderStatus,
  clearProviderState
} from '../reducer/providerSlice';
import ProviderGameSliders from '../components/UI/ProviderGameSliders';

const AccessProviders = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const { activeProviders, loading, error } = useSelector((state) => state.providers);
  const { user } = useSelector((state) => state.auth);
  
  // Local state
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedProvider, setExpandedProvider] = useState(null);
  const [showPassword, setShowPassword] = useState({});
  const [copiedField, setCopiedField] = useState(null);
  
  // Mock access data - In real app, this would come from API
  const [accessData, setAccessData] = useState([]);

  // Initialize
  useEffect(() => {
    if (!user) {
      toast.error('Please login to access your providers!', {
        position: "top-right",
        autoClose: 3000,
        theme,
      });
      navigate('/login');
      return;
    }

    dispatch(getActiveProviders());

    
    // Cleanup
    return () => {
      dispatch(clearProviderState());
    };
  }, [dispatch, user, navigate, theme]);

  

  // Helper functions
  const generatePassword = (length) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const generateApiKey = (length) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      if (i > 0 && i % 8 === 0) result += '-';
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  };

  useEffect(() => {
    if (activeProviders && activeProviders.length > 0) {
      const providers = activeProviders.map(provider => ({
        ...provider,
        access: {
          username: `admin_${provider.provider?.toLowerCase().replace(/\s+/g, '_') || 'provider'}`,
          password: generatePassword(12),
          apiKey: generateApiKey(32),
          apiSecret: generateApiKey(64),
          endpoint: `https://api.${provider.provider?.toLowerCase().replace(/\s+/g, '-') || 'provider'}.com/v1`,
          dashboardUrl: `https://dashboard.${provider.provider?.toLowerCase().replace(/\s+/g, '-') || 'provider'}.com`,
          port: 8000,
          status: provider.status || 'active',
          lastAccess: new Date().toISOString(),
          apiUsage: provider.apiUsage || 0,
          bandwidth: provider.bandwidth || '0GB',
          uptime: provider.uptime || '99%'
        }
      }));
  
      setAccessData(providers);
    } else {
      setAccessData([]);
    }
  }, [activeProviders]);
  

  // Handle copy to clipboard
  const handleCopy = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field} copied to clipboard!`, {
        position: "top-right",
        autoClose: 2000,
        theme,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard', { theme });
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = (providerId) => {
    setShowPassword(prev => ({
      ...prev,
      [providerId]: !prev[providerId]
    }));
  };

  // Handle provider status toggle
  const handleToggleStatus = async (providerName) => {
    try {
      await dispatch(toggleProviderStatus(providerName)).unwrap();
      toast.success('Provider status updated!', { theme });
      
      // Update local state
      setAccessData(prev => prev.map(provider => 
        provider.name === providerName || provider.provider === providerName
          ? {
              ...provider,
              access: {
                ...provider.access,
                status: provider.access.status === 'active' ? 'inactive' : 'active'
              }
            }
          : provider
      ));
    } catch (error) {
      toast.error('Failed to update provider status', { theme });
    }
  };

  // Generate connection string
  const generateConnectionString = (provider) => {
    const { username, password, endpoint, port } = provider.access;
    return `${username}:${password}@${endpoint.replace('https://', '')}:${port}`;
  };

  // Filter providers
  const filteredProviders = accessData.filter(provider => {
    const name = provider.name || provider.provider || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || provider.access.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Stats calculation
  const stats = {
    total: accessData.length,
    active: accessData.filter(p => p.access.status === 'active').length,
    totalGames: accessData.reduce((sum, p) => sum + (p.games || 0), 0),
    totalApiCalls: accessData.reduce((sum, p) => sum + (p.access.apiUsage || 0), 0),
    avgUptime: accessData.length > 0 
      ? (accessData.reduce((sum, p) => sum + parseFloat(p.access.uptime), 0) / accessData.length).toFixed(1) + '%'
      : '0%'
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
      primary: 'from-blue-600 to-indigo-600',
      success: 'from-green-600 to-emerald-600',
      warning: 'from-yellow-600 to-orange-600',
      danger: 'from-red-600 to-pink-600'
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
      primary: 'from-blue-500 to-indigo-500',
      success: 'from-green-500 to-emerald-500',
      warning: 'from-yellow-500 to-orange-500',
      danger: 'from-red-500 to-pink-500'
    }
  };

  const colors = themeColors[theme];

  // Loading state
  if (loading && accessData.length === 0) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${colors.bg}`}>
        <div className={`animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 ${
          theme === 'dark' ? 'border-blue-500' : 'border-blue-600'
        }`}></div>
        <p className={`mt-4 ${colors.textMuted}`}>Loading your providers...</p>
      </div>
    );
  }

  // Empty state
  if (accessData.length === 0 && !loading) {
    return (
      <div className={`min-h-screen ${colors.bg}  px-4`}>
        <div className=" mx-auto">
          <div className={`p-8 rounded-2xl text-center ${colors.card} border ${colors.border}`}>
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center">
              <GiServerRack className={`w-12 h-12 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
            </div>
            <h2 className={`text-2xl font-bold mb-3 ${colors.text}`}>No Providers Accessible</h2>
            <p className={`mb-6 ${colors.textMuted}`}>
              You don't have access to any game providers yet. Purchase providers to get started.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/providers"
                className={`px-6 py-3 rounded-xl font-bold bg-gradient-to-r ${colors.primary} text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
              >
                Browse Providers
              </Link>
              <Link
                to="/dashboard"
                className={`px-6 py-3 rounded-xl border ${colors.border} ${colors.text} hover:bg-gray-800/20 transition-all duration-300`}
              >
                Go to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${colors.bg} py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6`}>
      <ToastContainer />
      
      <div className=" mx-auto space-y-6">
        {/* Header */}
        <div className={`rounded-2xl ${colors.card} border ${colors.border} p-4 sm:p-6`}>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex-1 min-w-0">
              <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-2 ${colors.text}`}>
                Provider Access Management
              </h1>
              <p className={`text-sm sm:text-base ${colors.textMuted}`}>
                Manage your purchased game providers, API keys, and access credentials
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <Link
                to="/providers"
                className={`px-4 sm:px-6 py-2.5 rounded-xl border ${colors.border} ${colors.text} hover:bg-gray-800/20 transition-all duration-300 flex items-center gap-2 text-sm flex-1 sm:flex-none justify-center`}
              >
                <FiPlus className="w-4 h-4" />
                <span className="truncate">Add More</span>
              </Link>
              <button
                onClick={() => dispatch(getActiveProviders())}
                className={`px-4 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r ${colors.primary} text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 text-sm flex-1 sm:flex-none justify-center`}
              >
                <FiRefreshCw className="w-4 h-4" />
                <span className="truncate">Refresh</span>
              </button>
            </div>
          </div>
          
          {/* Stats - Fixed responsive grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
            <div className={`p-3 sm:p-4 rounded-xl border ${colors.border} ${theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                  <GiServerRack className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  {stats.active}/{stats.total}
                </span>
              </div>
              <p className={`text-xl sm:text-2xl font-bold ${colors.text}`}>{stats.total}</p>
              <p className={`text-xs sm:text-sm ${colors.textMuted} truncate`}>Total Providers</p>
            </div>
            
            <div className={`p-3 sm:p-4 rounded-xl border ${colors.border} ${theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'}`}>
                  <FiActivity className={`w-5 h-5 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'}`}>
                  {stats.active} active
                </span>
              </div>
              <p className={`text-xl sm:text-2xl font-bold ${colors.text}`}>{stats.active}</p>
              <p className={`text-xs sm:text-sm ${colors.textMuted} truncate`}>Active Providers</p>
            </div>
            
            <div className={`p-3 sm:p-4 rounded-xl border ${colors.border} ${theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                  <GiGamepad className={`w-5 h-5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  {stats.totalGames.toLocaleString()}
                </span>
              </div>
              <p className={`text-xl sm:text-2xl font-bold ${colors.text}`}>{stats.totalGames.toLocaleString()}</p>
              <p className={`text-xs sm:text-sm ${colors.textMuted} truncate`}>Total Games</p>
            </div>
            
            <div className={`p-3 sm:p-4 rounded-xl border ${colors.border} ${theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-yellow-500/20' : 'bg-yellow-100'}`}>
                  <FiBarChart className={`w-5 h-5 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`} />
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  {stats.avgUptime}
                </span>
              </div>
              <p className={`text-xl sm:text-2xl font-bold ${colors.text}`}>{stats.avgUptime}</p>
              <p className={`text-xs sm:text-sm ${colors.textMuted} truncate`}>Average Uptime</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={`p-4 sm:p-6 rounded-2xl ${colors.card} border ${colors.border}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1 w-full">
              <div className="relative">
                <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  placeholder="Search providers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg focus:outline-none text-sm ${
                    theme === 'dark'
                      ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-500'
                      : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className={`flex items-center rounded-lg p-1 ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 
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
                  className={`p-2 rounded ${viewMode === 'list' ? 
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
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2.5 rounded-lg border ${colors.border} flex items-center gap-2 text-sm flex-1 sm:flex-none justify-center ${
                  theme === 'dark'
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiFilter className="w-4 h-4" />
                <span className="truncate">Filters</span>
                <FiChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
          
          {/* Expanded Filters */}
          {showFilters && (
            <div className={`mt-4 p-4 rounded-xl border ${colors.border} ${
              theme === 'dark' ? 'bg-gray-900/50' : 'bg-white/50'
            }`}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={`text-sm font-medium mb-2 block ${colors.text}`}>
                    Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['all', 'active', 'inactive'].map(status => (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-3 py-1.5 rounded-lg text-xs capitalize whitespace-nowrap ${
                          filterStatus === status
                            ? theme === 'dark'
                              ? `bg-${status === 'active' ? 'green' : status === 'inactive' ? 'red' : 'blue'}-600 text-white`
                              : `bg-${status === 'active' ? 'green' : status === 'inactive' ? 'red' : 'blue'}-600 text-white`
                            : theme === 'dark'
                              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className={`text-sm font-medium mb-2 block ${colors.text}`}>
                    Sort By
                  </label>
                  <select
                    className={`w-full px-3 py-1.5 rounded-lg text-sm ${
                      theme === 'dark'
                        ? 'bg-gray-800 border border-gray-700 text-white'
                        : 'bg-white border border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    onChange={(e) => {
                      // Implement sorting logic
                    }}
                  >
                    <option value="name">Name A-Z</option>
                    <option value="status">Status</option>
                    <option value="lastAccess">Last Access</option>
                    <option value="uptime">Uptime</option>
                  </select>
                </div>
                
                <div>
                  <label className={`text-sm font-medium mb-2 block ${colors.text}`}>
                    Quick Actions
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => {
                        setAccessData(prev => prev.map(p => ({
                          ...p,
                          access: { ...p.access, status: 'active' }
                        })));
                        toast.success('All providers activated!', { theme });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs ${
                        theme === 'dark'
                          ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      }`}
                    >
                      Activate All
                    </button>
                    <button
                      onClick={() => {
                        setAccessData(prev => prev.map(p => ({
                          ...p,
                          access: { ...p.access, status: 'inactive' }
                        })));
                        toast.info('All providers deactivated!', { theme });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs ${
                        theme === 'dark'
                          ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                    >
                      Deactivate All
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <p className={`text-sm ${colors.textMuted}`}>
            Showing {filteredProviders.length} of {accessData.length} providers
          </p>
          <div className="flex items-center gap-2">
            <FiKey className={`w-4 h-4 ${colors.textMuted}`} />
            <span className={`text-xs ${colors.textMuted} whitespace-nowrap`}>
              Click on any provider to view access credentials
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`p-4 rounded-xl border ${
            theme === 'dark' ? 'border-red-500/20 bg-red-500/10' : 'border-red-200 bg-red-50'
          }`}>
            <div className="flex items-center gap-2">
              <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className={theme === 'dark' ? 'text-red-400' : 'text-red-600'}>{error}</p>
            </div>
          </div>
        )}

        {/* Providers Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredProviders.map((provider) => {
              const providerName = provider.name || provider.provider;
              const providerId = provider.id || provider._id;
              const isExpanded = expandedProvider === providerId;
              
              return (
                <div
                  key={providerId}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    theme === 'dark'
                      ? 'bg-gray-900/30 border-gray-800 hover:border-blue-500/50'
                      : 'bg-white border-gray-200 hover:border-blue-400 shadow-sm hover:shadow-md'
                  } ${isExpanded ? 'ring-2 ring-blue-500/30' : ''}`}
                >
                  {/* Provider Header */}
                  <div
                    className={`p-4 cursor-pointer ${colors.hover}`}
                    onClick={() => setExpandedProvider(isExpanded ? null : providerId)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={provider.img || 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?q=80&w=500'}
                            alt={providerName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className={`font-bold ${colors.text} truncate`}>{providerName}</h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              provider.access.status === 'active'
                                ? theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
                                : theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'
                            }`}>
                              {provider.access.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700'
                            }`}>
                              {provider.games || 50}+ Games
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedProvider(isExpanded ? null : providerId);
                        }}
                        className={`p-2 rounded-lg transition-transform ${isExpanded ? 'rotate-180' : ''} ${
                          theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                        } flex-shrink-0`}
                      >
                        <FiChevronDown className={`w-5 h-5 ${colors.textMuted}`} />
                      </button>
                    </div>
                    
                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className={`text-xs ${colors.textMuted}`}>Uptime</p>
                        <p className={`font-bold text-sm ${provider.access.uptime > '95' ? 'text-green-500' : 'text-yellow-500'}`}>
                          {provider.access.uptime}
                        </p>
                      </div>
                      <div>
                        <p className={`text-xs ${colors.textMuted}`}>API Calls</p>
                        <p className={`font-bold text-sm ${colors.text}`}>{provider.access.apiUsage}</p>
                      </div>
                      <div>
                        <p className={`text-xs ${colors.textMuted}`}>Bandwidth</p>
                        <p className={`font-bold text-sm ${colors.text}`}>{provider.access.bandwidth}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className={`border-t ${colors.border} p-4 animate-slideDown`}>
                      {/* Quick Actions */}
                      <div className="grid grid-cols-1 gap-2">
                        <button
                          onClick={() => handleToggleStatus(providerName)}
                          className={`py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1 ${
                            provider.access.status === 'active'
                              ? theme === 'dark'
                                ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                                : 'bg-red-100 text-red-600 hover:bg-red-200'
                              : theme === 'dark'
                                ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                                : 'bg-green-100 text-green-600 hover:bg-green-200'
                          }`}
                        >
                          {provider.access.status === 'active' ? <FiLock className="w-3 h-3" /> : <FiUnlock className="w-3 h-3" />}
                          {provider.access.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          // List View
          <div className="space-y-3">
            {filteredProviders.map((provider) => {
              const providerName = provider.name || provider.provider;
              const providerId = provider.id || provider._id;
              const isExpanded = expandedProvider === providerId;
              
              return (
                <div
                  key={providerId}
                  className={`rounded-2xl border transition-all duration-300 ${
                    theme === 'dark'
                      ? 'bg-gray-900/30 border-gray-800 hover:border-blue-500/50'
                      : 'bg-white border-gray-200 hover:border-blue-400 shadow-sm'
                  } ${isExpanded ? 'ring-2 ring-blue-500/30' : ''}`}
                >
                  <div
                    className={`p-4 cursor-pointer ${colors.hover}`}
                    onClick={() => setExpandedProvider(isExpanded ? null : providerId)}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4 w-full">
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                          <img
                            src={provider.image || 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?q=80&w=500'}
                            alt={providerName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h3 className={`font-bold text-lg ${colors.text} truncate`}>{providerName}</h3>
                            <div className="flex flex-wrap gap-1.5">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                provider.access.status === 'active'
                                  ? theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
                                  : theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'
                              }`}>
                                {provider.access.status === 'active' ? 'Active' : 'Inactive'}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                              }`}>
                                {provider.games || 50}+ Games
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                theme === 'dark' ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
                              }`}>
                                API: {provider.access.apiUsage}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                            <div className="flex items-center gap-1">
                              <FiServer className={`w-3 h-3 ${colors.textMuted}`} />
                              <span className={`text-xs ${colors.textMuted} truncate max-w-[150px] sm:max-w-none`}>
                                {provider.access.endpoint}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FiClock className={`w-3 h-3 ${colors.textMuted}`} />
                              <span className={`text-xs ${colors.textMuted} whitespace-nowrap`}>
                                {new Date(provider.access.lastAccess).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FiActivity className={`w-3 h-3 ${
                                provider.access.uptime > '95' ? 'text-green-500' : 'text-yellow-500'
                              }`} />
                              <span className={`text-xs ${
                                provider.access.uptime > '95' ? 'text-green-500' : 'text-yellow-500'
                              } whitespace-nowrap`}>
                                Uptime: {provider.access.uptime}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(provider.access.dashboardUrl, '_blank');
                          }}
                          className={`p-2 rounded-lg ${
                            theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                          }`}
                        >
                          <FiExternalLink className={`w-4 h-4 ${colors.textMuted}`} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedProvider(isExpanded ? null : providerId);
                          }}
                          className={`p-2 rounded-lg transition-transform ${isExpanded ? 'rotate-180' : ''} ${
                            theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                          }`}
                        >
                          <FiChevronDown className={`w-5 h-5 ${colors.textMuted}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Content - List View */}
                  {isExpanded && (
                    <div className={`border-t ${colors.border} p-4 sm:p-6 animate-slideDown`}>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column - Credentials */}
                        <div className="space-y-4">
                          <h4 className={`text-lg font-bold ${colors.text}`}>Access Credentials</h4>
                          {/* API Key */}
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${colors.text}`}>
                              API Key
                            </label>
                            <div className="flex items-center gap-2">
                              <code className={`flex-1 px-3 py-2 rounded-lg text-sm overflow-x-auto ${
                                theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                              }`}>
                                {provider.access.apiKey}
                              </code>
                              <button
                                onClick={() => handleCopy(provider.access.apiKey, 'API Key')}
                                className={`p-2 rounded-lg hover:bg-gray-700 ${
                                  copiedField === 'API Key' ? 'text-green-500' : colors.textMuted
                                } flex-shrink-0`}
                              >
                                <FiCopy className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          {/* API Secret */}
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${colors.text}`}>
                              API Secret
                            </label>
                            <div className="flex items-center gap-2">
                              <code className={`flex-1 px-3 py-2 rounded-lg text-sm overflow-x-auto ${
                                theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                              }`}>
                                {showPassword[providerId] 
                                  ? provider.access.apiSecret 
                                  : '••••••••••••••••••••••••••••••••'
                                }
                              </code>
                              <div className="flex gap-1 flex-shrink-0">
                                <button
                                  onClick={() => togglePasswordVisibility(providerId)}
                                  className={`p-2 rounded-lg hover:bg-gray-700 ${colors.textMuted}`}
                                >
                                  {showPassword[providerId] ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={() => handleCopy(provider.access.apiSecret, 'API Secret')}
                                  className={`p-2 rounded-lg hover:bg-gray-700 ${
                                    copiedField === 'API Secret' ? 'text-green-500' : colors.textMuted
                                  }`}
                                >
                                  <FiCopy className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Endpoint */}
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${colors.text}`}>
                              API Endpoint
                            </label>
                            <div className="flex items-center gap-2">
                              <code className={`flex-1 px-3 py-2 rounded-lg text-sm overflow-x-auto ${
                                theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                              }`}>
                                {provider.access.endpoint}
                              </code>
                              <button
                                onClick={() => handleCopy(provider.access.endpoint, 'Endpoint')}
                                className={`p-2 rounded-lg hover:bg-gray-700 ${
                                  copiedField === 'Endpoint' ? 'text-green-500' : colors.textMuted
                                } flex-shrink-0`}
                              >
                                <FiCopy className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Right Column - Actions & Info */}
                        <div className="space-y-6">
                          <div>
                            <h4 className={`text-lg font-bold mb-4 ${colors.text}`}>Quick Actions</h4>
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                onClick={() => window.open(provider.access.dashboardUrl, '_blank')}
                                className={`p-3 rounded-xl border ${
                                  theme === 'dark'
                                    ? 'border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20'
                                    : 'border-blue-200 bg-blue-50 hover:bg-blue-100'
                                } flex flex-col items-center justify-center gap-2`}
                              >
                                <FiExternalLink className="w-5 h-5 text-blue-400" />
                                <span className="text-sm font-medium text-center">Open Dashboard</span>
                              </button>
                              
                              <button
                                onClick={() => handleCopy(generateConnectionString(provider), 'Connection String')}
                                className={`p-3 rounded-xl border ${
                                  theme === 'dark'
                                    ? 'border-green-500/30 bg-green-500/10 hover:bg-green-500/20'
                                    : 'border-green-200 bg-green-50 hover:bg-green-100'
                                } flex flex-col items-center justify-center gap-2`}
                              >
                                <FiTerminal className="w-5 h-5 text-green-400" />
                                <span className="text-sm font-medium text-center">Copy Connection</span>
                              </button>
                              
                              <button
                                onClick={() => {
                                  // Generate and download config file
                                  const config = {
                                    provider: providerName,
                                    credentials: {
                                      apiKey: provider.access.apiKey,
                                      endpoint: provider.access.endpoint
                                    }
                                  };
                                  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `${providerName.toLowerCase().replace(/\s+/g, '-')}-config.json`;
                                  a.click();
                                  toast.success('Config file downloaded!', { theme });
                                }}
                                className={`p-3 rounded-xl border ${
                                  theme === 'dark'
                                    ? 'border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20'
                                    : 'border-purple-200 bg-purple-50 hover:bg-purple-100'
                                } flex flex-col items-center justify-center gap-2`}
                              >
                                <FiDownload className="w-5 h-5 text-purple-400" />
                                <span className="text-sm font-medium text-center">Download Config</span>
                              </button>
                              
                              <button
                                onClick={() => handleToggleStatus(providerName)}
                                className={`p-3 rounded-xl border ${
                                  provider.access.status === 'active'
                                    ? theme === 'dark'
                                      ? 'border-red-500/30 bg-red-500/10 hover:bg-red-500/20'
                                      : 'border-red-200 bg-red-50 hover:bg-red-100'
                                    : theme === 'dark'
                                      ? 'border-green-500/30 bg-green-500/10 hover:bg-green-500/20'
                                      : 'border-green-200 bg-green-50 hover:bg-green-100'
                                } flex flex-col items-center justify-center gap-2`}
                              >
                                {provider.access.status === 'active' ? (
                                  <FiLock className="w-5 h-5 text-red-400" />
                                ) : (
                                  <FiUnlock className="w-5 h-5 text-green-400" />
                                )}
                                <span className="text-sm font-medium text-center">
                                  {provider.access.status === 'active' ? 'Deactivate' : 'Activate'}
                                </span>
                              </button>
                            </div>
                          </div>
                          
                          {/* Provider Stats */}
                          <div className={`px-4 rounded-xl ${
                            theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'
                          }`}>
                            <h5 className={`text-sm font-medium mb-3 ${colors.text}`}>Provider Statistics</h5>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <p className={`text-xs ${colors.textMuted}`}>Uptime</p>
                                <p className={`font-bold text-lg ${provider.access.uptime > '95' ? 'text-green-500' : 'text-yellow-500'}`}>
                                  {provider.access.uptime}
                                </p>
                              </div>
                              <div>
                                <p className={`text-xs ${colors.textMuted}`}>API Usage</p>
                                <p className={`font-bold text-lg ${colors.text}`}>{provider.access.apiUsage} calls</p>
                              </div>
                              <div>
                                <p className={`text-xs ${colors.textMuted}`}>Bandwidth</p>
                                <p className={`font-bold text-lg ${colors.text}`}>{provider.access.bandwidth}</p>
                              </div>
                              <div>
                                <p className={`text-xs ${colors.textMuted}`}>Last Access</p>
                                <p className={`font-bold text-lg ${colors.text}`}>
                                  {new Date(provider.access.lastAccess).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Empty Filter Results */}
        {filteredProviders.length === 0 && accessData.length > 0 && (
          <div className={`p-8 text-center rounded-2xl ${colors.card} border ${colors.border}`}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center">
              <FiSearch className={`w-8 h-8 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${colors.text}`}>No providers found</h3>
            <p className={`mb-4 ${colors.textMuted}`}>
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}
              className={`px-6 py-2.5 rounded-xl border ${colors.border} ${colors.text} hover:bg-gray-800/20 transition-all duration-300`}
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Documentation & Help */}
        <div className={`rounded-2xl ${colors.card} border ${colors.border} p-4`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className={`p-4 rounded-xl ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-800/30'
                : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <FiCode className="w-5 h-5 text-blue-400" />
                <h3 className={`font-bold ${colors.text} text-sm sm:text-base`}>API Documentation</h3>
              </div>
              <p className={`text-sm mb-4 ${colors.textMuted}`}>
                Complete API reference and integration guides
              </p>
              <button className="text-sm text-blue-500 hover:text-blue-400 font-medium">
                View Docs →
              </button>
            </div>
            
            <div className={`p-4 rounded-xl ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-800/30'
                : 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <FiMessageSquare className="w-5 h-5 text-green-400" />
                <h3 className={`font-bold ${colors.text} text-sm sm:text-base`}>Support Center</h3>
              </div>
              <p className={`text-sm mb-4 ${colors.textMuted}`}>
                24/7 technical support and troubleshooting
              </p>
              <button className="text-sm text-green-500 hover:text-green-400 font-medium">
                Get Help →
              </button>
            </div>
            
            <div className={`p-4 rounded-xl ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-800/30'
                : 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <FiBarChart className="w-5 h-5 text-purple-400" />
                <h3 className={`font-bold ${colors.text} text-sm sm:text-base`}>Analytics Dashboard</h3>
              </div>
              <p className={`text-sm mb-4 ${colors.textMuted}`}>
                Monitor API usage and provider performance
              </p>
              <Link
                to="/dashboard/analytics"
                className="text-sm text-purple-500 hover:text-purple-400 font-medium"
              >
                View Analytics →
              </Link>
            </div>



           
          </div>
          <ProviderGameSliders />
        </div>
      </div>
    </div>
  );
};

export default AccessProviders;