import React, { useState, useEffect } from "react";
import { 
  FiSearch, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle, 
  FiArrowLeft, 
  FiChevronLeft, 
  FiChevronRight, 
  FiX,
  FiFilter,
  FiRefreshCw,
  FiCopy,
  FiEye,
  FiCalendar,
  FiActivity,
  FiPrinter,
  FiDownload
} from "react-icons/fi";
import { FaEthereum } from "react-icons/fa";
import { GiWallet } from "react-icons/gi";
import { TbCurrencyRupee } from "react-icons/tb";
import { MdHistory, MdAccountBalanceWallet, MdOutlineFileDownload } from "react-icons/md";
import { BiRupee } from "react-icons/bi";
import { useTheme } from '../../contexts/ThemeContext';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { fetchRechargeHistory } from '../../reducer/walletSlice';
import { useNavigate } from "react-router-dom";

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

const RechargeHistory = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Redux state
  const { history, loading } = useSelector((state) => state.wallet);
  const { user } = useSelector((state) => state.auth);

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [activeStats, setActiveStats] = useState('today');

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
  const tableHeaderBg = theme === 'dark' ? 'bg-gray-800/60' : 'bg-gray-100/80';
  const tableRowHover = theme === 'dark' ? 'hover:bg-gray-800/30' : 'hover:bg-gray-50';

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      await dispatch(fetchRechargeHistory()).unwrap();
    } catch (err) {
      toast.error("Failed to fetch deposit history");
    }
  };

  const handleRefresh = async () => {
    try {
      await dispatch(fetchRechargeHistory()).unwrap();
      toast.success("History refreshed!");
    } catch (err) {
      toast.error("Failed to refresh history");
    }
  };

  const getMethodIcon = (method) => {
    const normalized = method?.toUpperCase();
  
    const methodIcons = {
      'UPI': TbCurrencyRupee,
      'USDT': FaEthereum,
      'ZILPAY': GiWallet
    };
  
    return methodIcons[normalized] || TbCurrencyRupee; // ✅ default icon
  };
  

  const getMethodColor = (method) => {
    const methodColors = {
      'UPI': 'purple',
      'USDT': 'blue',
      'ZilPay': 'orange'
    };
    return methodColors[method] || 'gray';
  };

  // Filtered history
  const filteredHistory = history?.filter(dep => {
    const matchesSearch = searchTerm === '' || 
      dep.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dep.id?.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || dep.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || dep.method === methodFilter;
    
    // Date range filter
    let matchesDate = true;
    if (dateRange.start && dateRange.end) {
      const depDate = new Date(dep.createdAt);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      matchesDate = depDate >= startDate && depDate <= endDate;
    }
    
    return matchesSearch && matchesStatus && matchesMethod && matchesDate;
  }) || [];

  // Calculate statistics
  const calculateStats = () => {
    const stats = {
      totalDeposits: filteredHistory.length,
      totalAmount: filteredHistory.reduce((sum, dep) => sum + (dep.amount || 0), 0),
      totalBonus: filteredHistory.reduce((sum, dep) => sum + (dep.bonus || 0), 0),
      completed: filteredHistory.filter(dep => dep.status === 'completed').length,
      pending: filteredHistory.filter(dep => dep.status === 'pending').length,
      failed: filteredHistory.filter(dep => dep.status === 'failed').length,
    };
    
    stats.successRate = filteredHistory.length > 0 
      ? ((stats.completed / filteredHistory.length) * 100).toFixed(1)
      : '0.0';
    
    stats.averageDeposit = stats.totalDeposits > 0 
      ? Math.round(stats.totalAmount / stats.totalDeposits) 
      : 0;
    
    return stats;
  };

  const stats = calculateStats();

  // Stats by period
  const getStatsFromHistory = (period) => {
    const now = new Date();
    let filtered = [];
    
    if (history && history.length > 0) {
      filtered = history.filter(item => {
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
    
    return {
      total,
      deposits: completed.length,
      bonus,
      success: completed.length > 0 ? '100%' : '0%'
    };
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredHistory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setMethodFilter('all');
    setTimeFilter('all');
    setDateRange({ start: '', end: '' });
    setCurrentPage(1);
  };

  const handleExport = () => {
    setExportLoading(true);
    setTimeout(() => {
      toast.success('Export started. Your file will download shortly.');
      setExportLoading(false);
    }, 1500);
  };

  const copyTransactionId = (txId) => {
    navigator.clipboard.writeText(txId);
    toast.success('Transaction ID copied!');
  };

  const getStatusBadge = (status) => {
    // 🔥 Normalize status safely
    let normalizedStatus = 'pending'; // default fallback
  
    if (status === 1 || status === 'completed') {
      normalizedStatus = 'completed';
    } else if (status === 0 || status === 'pending') {
      normalizedStatus = 'pending';
    } else if (status === -1 || status === 'failed') {
      normalizedStatus = 'failed';
    }
  
    const configMap = {
      completed: { 
        text: 'COMPLETED', 
        color: theme === 'dark' ? 'text-green-400' : 'text-green-600', 
        bg: theme === 'dark' ? 'bg-green-500/10' : 'bg-green-100', 
        border: theme === 'dark' ? 'border-green-500/30' : 'border-green-200', 
        icon: FiCheckCircle 
      },
      pending: { 
        text: 'PENDING', 
        color: theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600', 
        bg: theme === 'dark' ? 'bg-yellow-500/10' : 'bg-yellow-100', 
        border: theme === 'dark' ? 'border-yellow-500/30' : 'border-yellow-200', 
        icon: FiClock 
      },
      failed: { 
        text: 'FAILED', 
        color: theme === 'dark' ? 'text-red-400' : 'text-red-600', 
        bg: theme === 'dark' ? 'bg-red-500/10' : 'bg-red-100', 
        border: theme === 'dark' ? 'border-red-500/30' : 'border-red-200', 
        icon: FiXCircle 
      },
    };
  
    const config = configMap[normalizedStatus]; // always exists
    const Icon = config.icon;
  
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.border} ${config.bg}`}>
        <Icon className={`w-3.5 h-3.5 ${config.color}`} />
        <span className={`text-xs font-medium ${config.color}`}>
          {config.text}
        </span>
      </div>
    );
  };
  

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  // Transaction Details Modal
  const TransactionDetailsModal = () => {
    if (!selectedTransaction) return null;
  
    const Icon = getMethodIcon(selectedTransaction.method?.toUpperCase());
    const color = getMethodColor(selectedTransaction.method?.toUpperCase());
  
    const amount = selectedTransaction.money || 0;
    const bonus = 0; // You don't have bonus in API
    const total = amount + bonus;
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl">
        <div className={`w-full max-w-2xl rounded-3xl ${cardBg} border ${borderColor} shadow-2xl animate-scaleIn`}>
  
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${
                theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
              }`}>
                <FiEye className={`text-xl ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${textPrimary}`}>
                  Transaction Details
                </h3>
                <p className={`text-sm ${textMuted}`}>
                  {selectedTransaction.id_order}
                </p>
              </div>
            </div>
  
            <button
              onClick={() => setShowDetailsModal(false)}
              className={`p-2 rounded-xl ${
                theme === 'dark'
                  ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              } transition`}
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
  
          <div className="p-6">
  
            {/* Summary */}
            <div className={`p-5 rounded-2xl mb-6 ${
              theme === 'dark'
                ? 'bg-blue-600/10 border border-blue-500/20'
                : 'bg-blue-50 border border-blue-200'
            }`}>
  
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className={`text-3xl font-bold mb-1 ${textPrimary}`}>
                    ₹{amount.toLocaleString()}
                  </div>
                  <div className={`text-sm ${textMuted}`}>
                    Deposit Amount
                  </div>
                </div>
  
                {getStatusBadge(selectedTransaction.status)}
              </div>
  
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className={`text-sm ${textMuted} mb-1`}>
                    Bonus Earned
                  </div>
                  <div className={`text-xl font-bold ${
                    theme === 'dark' ? 'text-green-400' : 'text-green-600'
                  }`}>
                    ₹0
                  </div>
                </div>
  
                <div>
                  <div className={`text-sm ${textMuted} mb-1`}>
                    Total Credit
                  </div>
                  <div className={`text-xl font-bold ${textPrimary}`}>
                    ₹{total.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
  
            {/* Details */}
            <div className="space-y-4">
              <h4 className={`font-semibold ${textPrimary} flex items-center gap-2`}>
                <FiActivity className="w-4 h-4" />
                Transaction Information
              </h4>
  
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  
                <div>
                  <div className={`text-sm ${textMuted} mb-1`}>
                    Payment Method
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 text-blue-500`} />
                    <span className={`font-medium ${textPrimary}`}>
                      {selectedTransaction.method?.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div>
                  <div className={`text-sm ${textMuted} mb-1`}>
                    Payment Type
                  </div>
                  <div className="flex items-center gap-2">
                    {/* <Icon className={`w-4 h-4 text-blue-500`} /> */}
                    <span className={`font-medium ${textPrimary}`}>
                      {selectedTransaction.type}
                    </span>
                  </div>
                </div>
  
                <div>
                  <div className={`text-sm ${textMuted} mb-1`}>
                    Date & Time
                  </div>
                  <div className={`font-medium ${textPrimary} flex items-center gap-2`}>
                    <FiCalendar className="w-4 h-4" />
                    {new Date(selectedTransaction.createdAt).toLocaleString('en-IN')}
                  </div>
                </div>
  
                <div>
                  <div className={`text-sm ${textMuted} mb-1`}>
                    Order ID
                  </div>
                  <div className={`font-mono font-medium ${textPrimary}`}>
                    {selectedTransaction.id_order}
                  </div>
                </div>
  
                <div>
                  <div className={`text-sm ${textMuted} mb-1`}>
                    UTR
                  </div>
                  <div className={`font-mono font-medium ${textPrimary}`}>
                    {selectedTransaction.utr || "N/A"}
                  </div>
                </div>
  
                <div>
                  <div className={`text-sm ${textMuted} mb-1`}>
                    Phone
                  </div>
                  <div className={`font-medium ${textPrimary}`}>
                    {selectedTransaction.phone}
                  </div>
                </div>
  
                <div>
                  <div className={`text-sm ${textMuted} mb-1`}>
                    Email
                  </div>
                  <div className={`font-medium ${textPrimary}`}>
                    {selectedTransaction.email}
                  </div>
                </div>
  
              </div>
            </div>
  
            {/* Actions */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => copyTransactionId(selectedTransaction.id_order)}
                className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  theme === 'dark'
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <FiCopy className="w-4 h-4" />
                Copy Order ID
              </button>
  
              <button
                onClick={() => window.print()}
                className={`px-4 py-3 rounded-xl font-medium border ${
                  theme === 'dark'
                    ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                } transition flex-1 flex items-center justify-center gap-2`}
              >
                <FiPrinter className="w-4 h-4" />
                Print Receipt
              </button>
            </div>
  
          </div>
        </div>
      </div>
    );
  };
  

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-4 animate-pulse">
      <div className={`h-12 ${cardBg} rounded-2xl`}></div>
      <div className={`h-64 ${cardBg} rounded-2xl`}></div>
    </div>
  );

  return (
    <div className={`min-h-screen ${containerBg} py-4 sm:py-6 px-3 sm:px-4 lg:px-6`}>
      <div className=" mx-auto space-y-4 sm:space-y-6">
        {/* Header with Back Button */}
        <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${cardBg} p-4 sm:p-6 rounded-2xl border ${borderColor}`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/wallet/recharge')}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
            >
              <FiArrowLeft className={`w-5 h-5 ${textPrimary}`} />
            </button>
            <div>
              <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${
                theme === 'dark' 
                  ? 'bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent'
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent'
              }`}>
                Deposit History
              </h1>
              <p className={`text-xs sm:text-sm ${textMuted} mt-1`}>
                View all your deposit transactions and track your earnings
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl ${cardBg} border ${borderColor}`}>
              <span className={`text-xs ${textMuted}`}>Balance: </span>
              <span className={`text-base sm:text-lg font-bold ${
                theme === 'dark' ? 'text-green-400' : 'text-green-600'
              }`}>
                <BiRupee className="inline mr-1" />
                {(user?.balance || 0).toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => navigate('/wallet/recharge')}
              className={`px-3 sm:px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
              }`}
            >
              ₹
              {!isMobile && 'New Deposit'}
            </button>
          </div>
        </div>

      

       

        {/* Filters Section */}
        <div className={`${cardBg} rounded-2xl border ${borderColor} p-4 sm:p-6`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <h3 className={`text-sm sm:text-base font-semibold ${textPrimary} flex items-center gap-2`}>
              <FiFilter className={`${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              Filter Transactions
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                title="Refresh"
              >
                <FiRefreshCw className={`w-4 h-4 ${textMuted}`} />
              </button>
              <button
                onClick={handleExport}
                disabled={exportLoading}
                className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                  theme === 'dark'
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {exportLoading ? (
                  <FiRefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <MdOutlineFileDownload className="w-3 h-3" />
                )}
                {!isMobile && 'Export'}
              </button>
              <button
                onClick={handleResetFilters}
                className={`px-3 py-2 rounded-lg text-xs font-medium ${
                  theme === 'dark'
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                Reset
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search by TXID or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2.5 text-sm ${inputBg} border ${borderColor} rounded-xl ${textPrimary} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all`}
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`w-full px-4 py-2.5 text-sm ${inputBg} border ${borderColor} rounded-xl ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all`}
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            
            {/* Method Filter */}
            <div>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className={`w-full px-4 py-2.5 text-sm ${inputBg} border ${borderColor} rounded-xl ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all`}
              >
                <option value="all">All Methods</option>
                <option value="UPI">UPI</option>
                <option value="USDT">USDT</option>
                <option value="ZilPay">ZilPay</option>
              </select>
            </div>
          </div>

          {/* Custom Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <div>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className={`w-full px-4 py-2.5 text-sm ${inputBg} border ${borderColor} rounded-xl ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all`}
                placeholder="Start Date"
              />
            </div>
            <div>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className={`w-full px-4 py-2.5 text-sm ${inputBg} border ${borderColor} rounded-xl ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all`}
                placeholder="End Date"
              />
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className={`rounded-2xl border ${borderColor} overflow-hidden shadow-xl`}>
          <div className={`px-4 sm:px-6 py-4 ${tableHeaderBg} border-b ${borderColor}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <h3 className={`text-sm sm:text-base font-semibold ${textPrimary}`}>
                Deposit Transactions
                <span className={`text-xs font-normal ml-2 ${textMuted}`}>
                  ({filteredHistory.length} records)
                </span>
              </h3>
              <div className={`text-xs ${textMuted}`}>
                Showing {filteredHistory.length > 0 ? indexOfFirstItem + 1 : 0}-{Math.min(indexOfLastItem, filteredHistory.length)} of {filteredHistory.length}
              </div>
            </div>
          </div>
          
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className={tableHeaderBg}>
                    <tr>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium uppercase tracking-wider">
                        <span className={textMuted}>Transaction ID</span>
                      </th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium uppercase tracking-wider">
                        <span className={textMuted}>Amount</span>
                      </th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium uppercase tracking-wider">
                        <span className={textMuted}>Bonus</span>
                      </th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium uppercase tracking-wider">
                        <span className={textMuted}>Status</span>
                      </th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium uppercase tracking-wider">
                        <span className={textMuted}>Method</span>
                      </th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium uppercase tracking-wider">
                        <span className={textMuted}>Buy Type</span>
                      </th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium uppercase tracking-wider">
                        <span className={textMuted}>Date</span>
                      </th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium uppercase tracking-wider">
                        <span className={textMuted}>Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y divide-gray-200 dark:divide-gray-700`}>
                    {currentItems.length === 0 && (
                      <tr>
                        <td colSpan={7} className={`text-center py-10 ${textMuted}`}>
                          <MdHistory className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p className="text-sm">No deposits found</p>
                          <p className="text-xs mt-2">Try adjusting your filters</p>
                        </td>
                      </tr>
                    )}
                    {currentItems.map((dep) => {
                      const Icon = getMethodIcon(dep.method);
                      const color = getMethodColor(dep.method);
                      
                      return (
                        <tr 
                        key={dep._id} 
                        className={`${tableRowHover} transition-colors duration-200 cursor-pointer`}
                        onClick={() => handleViewDetails(dep)}
                      >
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div className={`font-mono text-xs sm:text-sm ${textPrimary}`}>
                            {dep.id_order?.slice(0, 8)}...{dep.id_order?.slice(-8)}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div className={`font-bold ${textPrimary}`}>
                            {dep.method?.toUpperCase() === 'USDT' ? '$' : '₹'}{dep.money?.toLocaleString() || 0}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div className={`font-medium ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                            +{0} {/* No bonus in your data */}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          {getStatusBadge(dep.status)}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${theme === 'dark' ? `text-${color}-400` : `text-${color}-600`}`} />
                            <span className={`text-sm ${textPrimary}`}>{dep.method || 'UPI'}</span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center gap-2">
                            {/* <Icon className={`w-4 h-4 ${theme === 'dark' ? `text-${color}-400` : `text-${color}-600`}`} /> */}
                            <span className={`text-sm ${textPrimary}`}>{dep.type}</span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div className={`text-sm ${textPrimary}`}>
                            {new Date(dep.createdAt).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (dep.id_order) copyTransactionId(dep.id_order);
                              }}
                              className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                              title="Copy TXID"
                            >
                              <FiCopy className={`w-4 h-4 ${textMuted}`} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(dep);
                              }}
                              className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                              title="View Details"
                            >
                              <FiEye className={`w-4 h-4 ${textMuted}`} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredHistory.length > itemsPerPage && (
                <div className={`px-4 sm:px-6 py-4 ${tableHeaderBg} border-t ${borderColor}`}>
                  <div className="flex items-center justify-between">
                    <div className={`text-xs ${textMuted}`}>
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-lg ${
                          currentPage === 1
                            ? 'opacity-50 cursor-not-allowed'
                            : theme === 'dark'
                              ? 'hover:bg-gray-700'
                              : 'hover:bg-gray-200'
                        }`}
                      >
                        <FiChevronLeft className="w-4 h-4" />
                      </button>
                      
                      {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage <= 2) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 1) {
                          pageNum = totalPages - 2 + i;
                        } else {
                          pageNum = currentPage - 1 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-8 h-8 rounded-lg text-xs font-medium ${
                              currentPage === pageNum
                                ? theme === 'dark'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-blue-500 text-white'
                                : theme === 'dark'
                                  ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                            } transition`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-lg ${
                          currentPage === totalPages
                            ? 'opacity-50 cursor-not-allowed'
                            : theme === 'dark'
                              ? 'hover:bg-gray-700'
                              : 'hover:bg-gray-200'
                        }`}
                      >
                        <FiChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Transaction Details Modal */}
      {showDetailsModal && <TransactionDetailsModal />}

      {/* Custom animations */}
      <style jsx>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default RechargeHistory;