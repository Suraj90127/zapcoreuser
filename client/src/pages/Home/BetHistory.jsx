import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FiSearch, FiFilter, FiDownload, FiTrendingUp, 
  FiTrendingDown, FiDollarSign, FiActivity, FiUsers, 
  FiBarChart2, FiCalendar, FiRefreshCw, FiClock,
  FiChevronLeft, FiChevronRight, FiChevronsLeft,
  FiChevronsRight, FiAward, FiPieChart, FiUser,
  FiEye, FiEyeOff, FiX, FiCheck, FiInfo
} from 'react-icons/fi';
import { GiPokerHand, GiTakeMyMoney, GiMoneyStack, GiProfit } from 'react-icons/gi';
import { MdGames, MdOutlineSportsCricket } from 'react-icons/md';
import { FaDice, FaBlackTie, FaSlidersH } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';
import { getBetHistory } from '../../reducer/gameSlice';
import { toast } from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const BetHistory = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  
  // Redux State
  const { 
    betHistory, 
    betHistoryPagination, 
    userBalance, 
    loading 
  } = useSelector((state) => state.games);
  
  // Local State
  const [searchTerm, setSearchTerm] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [gameFilter, setGameFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    from_date: null,
    to_date: null
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState('table'); // table, cards, stats
  const [selectedBet, setSelectedBet] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch bet history on component mount and page change
  useEffect(() => {
    fetchBetHistory();
  }, [currentPage]);

  const fetchBetHistory = () => {
    dispatch(getBetHistory({
      playerid: playerId || undefined,
      page: currentPage,
      limit: itemsPerPage,
      from_date: dateRange.from_date ? dateRange.from_date.toISOString().split('T')[0] : undefined,
      to_date: dateRange.to_date ? dateRange.to_date.toISOString().split('T')[0] : undefined
    }));
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchBetHistory();
    setShowFilters(false);
    toast.success('Filters applied successfully');
  };

  const handleResetFilters = () => {
    setPlayerId('');
    setGameFilter('all');
    setResultFilter('all');
    setDateRange({ from_date: null, to_date: null });
    setCurrentPage(1);
    setTimeout(() => {
      fetchBetHistory();
    }, 100);
    toast.success('Filters reset');
  };

  const handleExport = () => {
    const csvContent = [
      ['Date', 'Player ID', 'Game', 'Bet Amount', 'Win Amount', 'Profit', 'Result', 'Game Round', 'Status'],
      ...filteredBets.map(bet => [
        new Date(bet.created_at).toLocaleString(),
        bet.player,
        bet.game_name || 'Unknown',
        bet.bet_amount,
        bet.win_amount,
        (bet.win_amount - bet.bet_amount),
        bet.status === 1 ? 'Win' : 'Loss',
        bet.game_round,
        // bet.status === 1 ? 'Completed' : 'Pending'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bet-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Data exported successfully');
  };

  // Get unique games for filter
  const games = useMemo(() => {
    const gameSet = new Set(betHistory.map(bet => bet.game_name).filter(Boolean));
    return ['all', ...Array.from(gameSet)];
  }, [betHistory]);

  // Filter bets based on search and filters
  const filteredBets = useMemo(() => {
    return betHistory.filter(bet => {
      const matchesSearch = searchTerm === '' || 
        bet.player?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bet.game_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bet.game_round?.toString().includes(searchTerm);
      
      const matchesGame = gameFilter === 'all' || bet.game_name === gameFilter;
      
      const matchesResult = resultFilter === 'all' || 
        (resultFilter === 'win' && bet.win_amount > 0) ||
        (resultFilter === 'loss' && bet.win_amount === 0) ||
        (resultFilter === 'push' && bet.win_amount === bet.bet_amount);
      
      return matchesSearch && matchesGame && matchesResult;
    });
  }, [betHistory, searchTerm, gameFilter, resultFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!filteredBets.length) return null;

    const totalBets = filteredBets.length;
    const totalWagered = filteredBets.reduce((sum, bet) => sum + bet.bet_amount, 0);
    const totalWon = filteredBets.reduce((sum, bet) => sum + bet.win_amount, 0);
    const lossAmount = filteredBets.reduce(
      (sum, bet) => (bet.status === 0 || bet.status === 2 ? sum + bet.bet_amount : sum),
      0
    );
    const lossGgr = lossAmount*0.12
// 🧠 Aur Cle
    // console.log("lossAmount",lossAmount);
    
    const netProfit = totalWon - totalWagered;
    const wins = filteredBets.filter(bet => bet.win_amount > bet.bet_amount).length;
    const losses = filteredBets.filter(bet => bet.win_amount < bet.bet_amount).length;
    const pushes = filteredBets.filter(bet => bet.win_amount === bet.bet_amount).length;
    const winRate = totalBets > 0 ? ((wins / totalBets) * 100).toFixed(2) : 0;
    
    const biggestWin = filteredBets.reduce((max, bet) => 
      (bet.win_amount - bet.bet_amount) > max ? (bet.win_amount - bet.bet_amount) : max, 0
    );
    
    const biggestLoss = filteredBets.reduce((min, bet) => 
      (bet.win_amount - bet.bet_amount) < min ? (bet.win_amount - bet.bet_amount) : min, 0
    );

    return {
      totalBets,
      totalWagered,
      totalWon,
      netProfit,
      lossAmount,
      lossGgr,
      wins,
      losses,
      pushes,
      winRate,
      biggestWin,
      biggestLoss,
      averageBet: totalWagered / totalBets,
      roi: ((netProfit / totalWagered) * 100).toFixed(2)
    };
  }, [filteredBets]);

  // Get status badge color
  const getStatusBadge = (status) => {
    switch(status) {
      case 1: // Win/Completed
        return theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600';
      case 0: // Loss
        return theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600';
      case 2: // No-bet/Pending
        return theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600';
      default:
        return theme === 'dark' ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-600';
    }
  };

  // Get game icon
  const getGameIcon = (gameType) => {
    switch(gameType?.toLowerCase()) {
      case 'slots':
        return <GiPokerHand className="w-5 h-5" />;
      case 'blackjack':
        return <FaBlackTie className="w-5 h-5" />;
      case 'roulette':
        return <FaSlidersH className="w-5 h-5" />;
      case 'dice':
        return <FaDice className="w-5 h-5" />;
      case 'cricket':
        return <MdOutlineSportsCricket className="w-5 h-5" />;
      default:
        return <MdGames className="w-5 h-5" />;
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Theme classes
  const themeClasses = {
    dark: {
      bg: 'bg-gradient-to-b from-gray-900 via-gray-900 to-black',
      cardBg: 'bg-gray-800/40 backdrop-blur-xl',
      border: 'border-gray-700/30',
      text: 'text-gray-100',
      textSecondary: 'text-gray-400',
      textMuted: 'text-gray-500',
      input: 'bg-gray-800/50 border-gray-700 text-gray-100',
      select: 'bg-gray-800 text-gray-100',
      tableHeader: 'bg-gray-800/60',
      tableRow: 'border-gray-700/30 hover:bg-gray-800/30',
      hover: 'hover:bg-gray-700/50',
      modalBg: 'bg-gray-900',
    },
    light: {
      bg: 'bg-gradient-to-b from-gray-50 to-white',
      cardBg: 'bg-white/70 backdrop-blur-xl',
      border: 'border-gray-200/50',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      textMuted: 'text-gray-500',
      input: 'bg-white border-gray-300 text-gray-900',
      select: 'bg-white text-gray-900',
      tableHeader: 'bg-gray-100/80',
      tableRow: 'border-gray-200/50 hover:bg-gray-50/50',
      hover: 'hover:bg-gray-100/50',
      modalBg: 'bg-white',
    }
  };

  const tc = themeClasses[theme];

  return (
    <div className={`min-h-screen ${tc.bg} py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent`}>
              Bet History
            </h1>
            <p className={tc.textSecondary}>
              Track and analyze all betting activities
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className={`flex rounded-lg p-1 ${tc.cardBg} border ${tc.border}`}>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'table'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : tc.textSecondary
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'cards'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : tc.textSecondary
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('stats')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'stats'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : tc.textSecondary
                }`}
              >
                Stats
              </button>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg ${tc.cardBg} border ${tc.border} ${tc.textSecondary} hover:scale-105 transition-all`}
              title="Toggle Filters"
            >
              <FiFilter className="w-5 h-5" />
            </button>

            <button
              onClick={handleExport}
              className={`p-2 rounded-lg ${tc.cardBg} border ${tc.border} ${tc.textSecondary} hover:scale-105 transition-all`}
              title="Export Data"
            >
              <FiDownload className="w-5 h-5" />
            </button>

            <button
              onClick={fetchBetHistory}
              className={`p-2 rounded-lg ${tc.cardBg} border ${tc.border} ${tc.textSecondary} hover:scale-105 transition-all`}
              title="Refresh"
            >
              <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* User Balance Card */}
        <div className={`${tc.cardBg} border ${tc.border} rounded-2xl p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <GiMoneyStack className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className={`text-sm ${tc.textSecondary}`}>Available Balance</p>
                <p className={`text-2xl font-bold ${tc.text}`}>
                  {formatCurrency(userBalance)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
              }`}>
                Live
              </span>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className={`${tc.cardBg} border ${tc.border} rounded-2xl p-6 animate-slideDown`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`font-semibold ${tc.text}`}>Filter Bets</h3>
              <button onClick={() => setShowFilters(false)} className={tc.textSecondary}>
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${tc.textSecondary}`}>
                  Search
                </label>
                <div className="relative">
                  <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${tc.textMuted}`} />
                  <input
                    type="text"
                    placeholder="Search by player or game..."
                    className={`w-full pl-10 pr-4 py-2.5 ${tc.input} border rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none transition`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${tc.textSecondary}`}>
                  Player ID
                </label>
                <input
                  type="text"
                  placeholder="Enter player ID..."
                  className={`w-full px-4 py-2.5 ${tc.input} border rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none transition`}
                  value={playerId}
                  onChange={(e) => setPlayerId(e.target.value)}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${tc.textSecondary}`}>
                  Game
                </label>
                <select
                  className={`w-full px-4 py-2.5 ${tc.input} border rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none transition`}
                  value={gameFilter}
                  onChange={(e) => setGameFilter(e.target.value)}
                >
                  {games.map(game => (
                    <option key={game} value={game}>
                      {game === 'all' ? 'All Games' : game}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${tc.textSecondary}`}>
                  Result
                </label>
                <select
                  className={`w-full px-4 py-2.5 ${tc.input} border rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none transition`}
                  value={resultFilter}
                  onChange={(e) => setResultFilter(e.target.value)}
                >
                  <option value="all">All Results</option>
                  <option value="win">Win</option>
                  <option value="loss">Loss</option>
                  <option value="push">Push</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${tc.textSecondary}`}>
                  From Date
                </label>
                <DatePicker
                  selected={dateRange.from_date}
                  onChange={(date) => setDateRange({ ...dateRange, from_date: date })}
                  className={`w-full px-4 py-2.5 ${tc.input} border rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none transition`}
                  placeholderText="Select start date"
                  dateFormat="yyyy-MM-dd"
                  maxDate={dateRange.to_date || new Date()}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${tc.textSecondary}`}>
                  To Date
                </label>
                <DatePicker
                  selected={dateRange.to_date}
                  onChange={(date) => setDateRange({ ...dateRange, to_date: date })}
                  className={`w-full px-4 py-2.5 z-[99999] ${tc.input} border rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none transition`}
                  placeholderText="Select end date"
                  dateFormat="yyyy-MM-dd"
                  minDate={dateRange.from_date}
                  maxDate={new Date()}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleResetFilters}
                className={`px-4 py-2 rounded-lg border ${tc.border} ${tc.textSecondary} hover:scale-105 transition-all`}
              >
                Reset
              </button>
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:scale-105 transition-all"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {stats && viewMode === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`${tc.cardBg} border ${tc.border} rounded-xl p-6 hover:scale-105 transition-all`}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-blue-500/20">
                  <FiActivity className="w-6 h-6 text-blue-500" />
                </div>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  stats.winRate >= 50 ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                }`}>
                  {stats.winRate}%
                </span>
              </div>
              <p className={`text-2xl font-bold ${tc.text}`}>{stats.totalBets}</p>
              <p className={`text-sm ${tc.textSecondary}`}>Total Bets</p>
            </div>

            <div className={`${tc.cardBg} border ${tc.border} rounded-xl p-6 hover:scale-105 transition-all`}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-green-500/20">
                  <GiMoneyStack className="w-6 h-6 text-green-500" />
                </div>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  stats.netProfit >= 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                }`}>
                  {stats.roi}% ROI
                </span>
              </div>
              <p className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(stats?.lossAmount)}
              </p>
              <p className={`text-sm ${tc.textSecondary}`}>Total Loss bet amount</p>
            </div>

            <div className={`${tc.cardBg} border ${tc.border} rounded-xl p-6 hover:scale-105 transition-all`}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-purple-500/20">
                  <GiProfit className="w-6 h-6 text-purple-500" />
                </div>
              </div>
              <p className={`text-2xl font-bold ${tc.text}`}>{formatCurrency(stats.lossGgr)}</p>
              <p className={`text-sm ${tc.textSecondary}`}>Loass GGR of 12 %</p>
            </div>

            <div className={`${tc.cardBg} border ${tc.border} rounded-xl p-6 hover:scale-105 transition-all`}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-orange-500/20">
                  <FiTrendingDown className="w-6 h-6 text-orange-500" />
                </div>
              </div>
              <p className={`text-2xl font-bold text-green-500`}>{formatCurrency(stats.totalWon)}</p>
              <p className={`text-sm ${tc.textSecondary}`}>Total win amount</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className={`${tc.cardBg} border ${tc.border} rounded-2xl overflow-hidden`}>
          {viewMode === 'table' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={tc.tableHeader}>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={tc.textSecondary}>Date & Time</span>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={tc.textSecondary}>Player</span>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={tc.textSecondary}>Game</span>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={tc.textSecondary}>Provider</span>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={tc.textSecondary}>Bet Amount</span>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={tc.textSecondary}>Win / Loss Amount</span>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={tc.textSecondary}>Profit</span>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={tc.textSecondary}>Result</span>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={tc.textSecondary}>Round ID</span>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={tc.textSecondary}>Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/30">
                  {loading ? (
                    <tr>
                      <td colSpan="10" className="px-6 py-8 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <FiRefreshCw className="w-5 h-5 animate-spin text-blue-500" />
                          <span className={tc.textSecondary}>Loading bet history...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredBets.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="px-6 py-8 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <GiPokerHand className={`w-12 h-12 ${tc.textMuted}`} />
                          <p className={tc.textSecondary}>No bet history found</p>
                          <button
                            onClick={handleResetFilters}
                            className={`px-4 py-2 rounded-lg border ${tc.border} ${tc.text} hover:scale-105 transition-all`}
                          >
                            Clear Filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredBets.map((bet, index) => {
                      const profit = bet.win_amount - bet.bet_amount;
                      return (
                        <tr key={bet.id || index} className={`${tc.tableRow} transition-colors`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <FiClock className={`w-4 h-4 ${tc.textMuted}`} />
                              <span className={`text-sm ${tc.text}`}>
                                {new Date(bet.created_at).toLocaleString()}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <FiUser className={`w-4 h-4 ${tc.textMuted}`} />
                              <span className={`text-sm font-medium ${tc.text}`}>
                                {bet.player || 'Unknown'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {bet.icon ? (
                                <img src={bet.icon} alt={bet.game_name} className="w-6 h-6 rounded" />
                              ) : (
                                getGameIcon(bet.game_type)
                              )}
                              <div>
                                <span className={`text-sm font-medium ${tc.text}`}>
                                  {bet.game_name || 'Unknown Game'}
                                </span>
                                <span className={`text-xs ${tc.textMuted} block`}>
                                  {bet.game_type || 'Casino'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-sm ${tc.text}`}>
                              {bet.provider || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-sm font-medium ${tc.text}`}>
                              {formatCurrency(bet.bet_amount)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-sm font-medium ${
                              bet.win_amount > 0 ? 'text-green-500' : "text-red-500"
                            }`}>
                            <span
                            className={`text-sm font-bold ${
                              bet?.win_amount > 0 ? "text-green-500" : "text-red-500"
                            }`}
                          >
                            {bet?.win_amount > 0
                              ? "+"+formatCurrency(bet.win_amount)
                              : "-"+ formatCurrency(bet.bet_amount)}
                          </span>
                            </span>
                          </td>
                          <td className="px-6 py-4">
                          <span
                            className={`text-sm font-bold ${
                              bet?.win_amount > 0 ? "text-green-500" : "text-red-500"
                            }`}
                          >
                            {bet?.win_amount > 0
                              ? "+"+formatCurrency(bet.win_amount)
                              : "-"+ formatCurrency(bet.bet_amount)}
                          </span>
                        </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(bet.status)}`}>
                              {bet.win_amount > 0 ? 'WIN' : 
                               bet.status === 1 ? 'WIN' : 'LOSS'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-sm font-mono ${tc.textMuted}`}>
                              #{bet.game_round?.slice(-8) || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => {
                                setSelectedBet(bet);
                                setShowDetails(true);
                              }}
                              className={`p-2 rounded-lg ${tc.hover} ${tc.textSecondary} hover:scale-105 transition-all`}
                              title="View Details"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {viewMode === 'cards' && (
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <FiRefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : filteredBets.length === 0 ? (
                <div className="text-center py-12">
                  <GiPokerHand className={`w-16 h-16 mx-auto mb-4 ${tc.textMuted}`} />
                  <p className={tc.textSecondary}>No bet history found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredBets.map((bet, index) => {
                    const profit = bet.win_amount - bet.bet_amount;
                    return (
                      <div
                        key={bet.id || index}
                        className={`${tc.cardBg} border ${tc.border} rounded-xl p-4 hover:scale-105 transition-all cursor-pointer`}
                        onClick={() => {
                          setSelectedBet(bet);
                          setShowDetails(true);
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {bet.icon ? (
                              <img src={bet.icon} alt={bet.game_name} className="w-10 h-10 rounded-lg" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                {getGameIcon(bet.game_type)}
                              </div>
                            )}
                            <div>
                              <h3 className={`font-semibold ${tc.text}`}>{bet.game_name || 'Unknown'}</h3>
                              <p className={`text-xs ${tc.textMuted}`}>{bet.provider || 'N/A'}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(bet.status)}`}>
                            {bet.win_amount > bet.bet_amount ? 'WIN' : 'LOSS'}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className={tc.textMuted}>Player:</span>
                            <span className={`font-medium ${tc.text}`}>{bet.player || 'Unknown'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className={tc.textMuted}>Bet Amount:</span>
                            <span className={`font-medium ${tc.text}`}>{formatCurrency(bet.bet_amount)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className={tc.textMuted}>Win / Loss Amount:</span>
                            <span className={`font-medium ${bet.win_amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                              
                              {bet?.win_amount > 0
                              ? "+"+formatCurrency(bet.win_amount)
                              : "-"+ formatCurrency(bet.bet_amount)}
                            </span>
                          </div>
                         
                          <div className="flex justify-between text-sm">
                            <span className={tc.textMuted}>Time:</span>
                            <span className={tc.textMuted}>
                              {new Date(bet.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-700/30 flex justify-between items-center">
                          <span className={`text-xs font-mono ${tc.textMuted}`}>
                            #{bet.game_round?.slice(-8)}
                          </span>
                          <span className="text-blue-500 text-sm">View Details →</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {betHistoryPagination.last_page > 1 && (
            <div className={`flex items-center justify-between px-6 py-4 border-t ${tc.border}`}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition-all ${
                    currentPage === 1
                      ? 'opacity-50 cursor-not-allowed'
                      : `${tc.hover} hover:scale-105`
                  }`}
                >
                  <FiChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition-all ${
                    currentPage === 1
                      ? 'opacity-50 cursor-not-allowed'
                      : `${tc.hover} hover:scale-105`
                  }`}
                >
                  <FiChevronLeft className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-sm ${tc.textSecondary}`}>
                  Page {currentPage} of {betHistoryPagination.last_page}
                </span>
                <div className="flex gap-1 ml-2">
                  {[...Array(Math.min(5, betHistoryPagination.last_page))].map((_, i) => {
                    let pageNum;
                    if (betHistoryPagination.last_page <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= betHistoryPagination.last_page - 2) {
                      pageNum = betHistoryPagination.last_page - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                          currentPage === pageNum
                            ? 'bg-blue-500 text-white shadow-lg'
                            : `${tc.textSecondary} ${tc.hover} hover:scale-105`
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.min(betHistoryPagination.last_page, prev + 1))}
                  disabled={currentPage === betHistoryPagination.last_page}
                  className={`p-2 rounded-lg transition-all ${
                    currentPage === betHistoryPagination.last_page
                      ? 'opacity-50 cursor-not-allowed'
                      : `${tc.hover} hover:scale-105`
                  }`}
                >
                  <FiChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(betHistoryPagination.last_page)}
                  disabled={currentPage === betHistoryPagination.last_page}
                  className={`p-2 rounded-lg transition-all ${
                    currentPage === betHistoryPagination.last_page
                      ? 'opacity-50 cursor-not-allowed'
                      : `${tc.hover} hover:scale-105`
                  }`}
                >
                  <FiChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary Info */}
        {filteredBets.length > 0 && (
          <div className={`flex items-center justify-between ${tc.textMuted} text-sm px-2`}>
            <div className="flex items-center gap-4">
              <span>Showing {filteredBets.length} of {betHistoryPagination.total} bets</span>
              <span>•</span>
              <span>Total Wagered: {formatCurrency(stats?.totalWagered || 0)}</span>
              <span>•</span>
              <span>Total Won: {formatCurrency(stats?.totalWon || 0)}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiInfo className="w-4 h-4" />
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Bet Details Modal */}
      {showDetails && selectedBet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowDetails(false)}>
          <div className={`${tc.modalBg} rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border ${tc.border}`} onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-inherit p-6 border-b border-gray-700/30 flex justify-between items-center">
              <h2 className={`text-xl font-bold ${tc.text}`}>Bet Details</h2>
              <button onClick={() => setShowDetails(false)} className={`p-2 rounded-lg ${tc.hover} transition-all`}>
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Game Info */}
              <div className="flex items-center gap-4">
                {selectedBet.icon ? (
                  <img src={selectedBet.icon} alt={selectedBet.game_name} className="w-16 h-16 rounded-xl" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    {getGameIcon(selectedBet.game_type)}
                  </div>
                )}
                <div>
                  <h3 className={`text-lg font-bold ${tc.text}`}>{selectedBet.game_name || 'Unknown Game'}</h3>
                  <p className={tc.textSecondary}>{selectedBet.provider || 'N/A'} • {selectedBet.game_type || 'Casino'}</p>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl ${tc.cardBg} border ${tc.border}`}>
                  <p className={`text-sm ${tc.textMuted} mb-1`}>Bet Amount</p>
                  <p className={`text-xl font-bold ${tc.text}`}>{formatCurrency(selectedBet.bet_amount)}</p>
                </div>
                <div className={`p-4 rounded-xl ${tc.cardBg} border ${tc.border}`}>
                  <p className={`text-sm ${tc.textMuted} mb-1`}>Win Amount</p>
                  <p className={`text-xl font-bold ${selectedBet.win_amount > selectedBet.bet_amount ? 'text-green-500' : tc.text}`}>
                    {formatCurrency(selectedBet.win_amount)}
                  </p>
                </div>
                <div className={`p-4 rounded-xl ${tc.cardBg} border ${tc.border}`}>
                  <p className={`text-sm ${tc.textMuted} mb-1`}>Profit/Loss</p>

                 <span className={`text-sm font-medium ${
                       selectedBet.win_amount > 0 ? 'text-green-500' : "text-red-500"
                       }`}>
                       <span
                      className={`text-sm font-bold ${
                     selectedBet?.win_amount > 0 ? "text-green-500" : "text-red-500"
                      }`}
                          >
                      {selectedBet?.win_amount > 0
                      ? "+"+formatCurrency(selectedBet.win_amount)
                      : "-"+ formatCurrency(selectedBet.bet_amount)}
                      </span>
                    </span>

                  {/* <p className={`text-xl font-bold ${
                    (selectedBet.win_amount - selectedBet.bet_amount) > 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {(selectedBet.win_amount - selectedBet.bet_amount) > 0 ? '+' : ''}
                    {formatCurrency(selectedBet.win_amount - selectedBet.bet_amount)}
                  </p> */}
                </div>
                <div className={`p-4 rounded-xl ${tc.cardBg} border ${tc.border}`}>
                  <p className={`text-sm ${tc.textMuted} mb-1`}>Status</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(selectedBet.status)}`}>
                    {selectedBet.win_amount > 0 ? 'WIN' : 
                     selectedBet.status === 1 ? 'WIN' : 'LOSS'}
                  </span>
                </div>
              </div>

              {/* Additional Info */}
              <div className={`p-4 rounded-xl ${tc.cardBg} border ${tc.border}`}>
                <h4 className={`font-semibold ${tc.text} mb-3`}>Additional Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className={tc.textMuted}>Player ID</span>
                    <span className={`font-medium ${tc.text}`}>{selectedBet.player || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={tc.textMuted}>Game Round</span>
                    <span className={`font-medium font-mono ${tc.text}`}>#{selectedBet.game_round || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={tc.textMuted}>Transaction ID</span>
                    <span className={`font-medium font-mono ${tc.text}`}>{selectedBet.id || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={tc.textMuted}>Currency</span>
                    <span className={`font-medium ${tc.text}`}>{selectedBet.currency_code || 'INR'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={tc.textMuted}>Created At</span>
                    <span className={`font-medium ${tc.text}`}>
                      {new Date(selectedBet.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={tc.textMuted}>Updated At</span>
                    <span className={`font-medium ${tc.text}`}>
                      {new Date(selectedBet.updated_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-inherit p-6 border-t border-gray-700/30 flex justify-end">
              <button
                onClick={() => setShowDetails(false)}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:scale-105 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BetHistory;