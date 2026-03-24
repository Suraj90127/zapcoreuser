import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getGGRHistory } from "../reducer/gameSlice";
import { 
  FiCalendar, 
  FiTrendingUp, 
  FiTrendingDown, 
  FiDollarSign,
  FiRefreshCw,
  FiDownload,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiBarChart2,
  FiPieChart,
  FiActivity,
  FiClock,
  FiAward
} from "react-icons/fi";
import { GiTakeMyMoney, GiMoneyStack, GiProfit } from "react-icons/gi";
import { useTheme } from "../contexts/ThemeContext";
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const GGRHistory = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState('table'); // 'table', 'chart', 'stats'
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('ggr');
 const { user } = useSelector((state) => state.auth);
  const { ggrHistory,totalGgr12PercentSum,totalLossSum, ggrPage, ggrTotalPages, loading } = useSelector(
    (state) => state.games
  );

  console.log("ggrHistory", totalGgr12PercentSum,totalLossSum);

  useEffect(() => {
    fetchData(1);
  }, [dispatch]);

  const fetchData = (page, filters = {}) => {
    dispatch(getGGRHistory({ 
      page, 
      limit: 20,
      ...dateRange,
      ...filters 
    }));
  };

  const changePage = (page) => {
    fetchData(page);
  };

  const handleDateFilter = () => {
    fetchData(1, dateRange);
    setShowFilters(false);
  };

  const resetFilters = () => {
    setDateRange({ startDate: '', endDate: '' });
    fetchData(1);
  };

  const exportData = () => {
    const csvContent = [
      ['Date', 'Total Bets', 'Total Wins', 'Loss', 'GGR', '12%', 'Balance Deducted'],
      ...ggrHistory.map(item => [
        item.ggr_date,
        item.total_bets,
        item.total_wins,
        item.total_loss,
        item.ggr,
        item.ggr_12_percent,
        item.balance_deducted
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ggr-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Calculate summary statistics
  const calculateStats = () => {
    if (!ggrHistory.length) return null;

    const totalBets = ggrHistory.reduce((sum, item) => sum + item.total_bets, 0);
    const totalWins = ggrHistory.reduce((sum, item) => sum + item.total_wins, 0);
    const totalGGR = ggrHistory.reduce((sum, item) => sum + item.ggr, 0);
    const avgGGR = totalGGR / ggrHistory.length;
    const bestDay = ggrHistory.reduce((best, item) => item.ggr > best.ggr ? item : best, ggrHistory[0]);

    return {
      totalBets,
      totalWins,
      totalGGR,
      avgGGR,
      bestDay,
      winRate: totalBets > 0 ? ((totalWins / totalBets) * 100).toFixed(2) : 0
    };
  };

  const stats = calculateStats();

  // Chart data preparation
  const chartData = {
    labels: ggrHistory.map(item => new Date(item.ggr_date).toLocaleDateString()),
    datasets: [
      {
        label: 'GGR',
        data: ggrHistory.map(item => item.ggr),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y',
      },
      {
        label: '12% Commission',
        data: ggrHistory.map(item => item.ggr_12_percent),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y',
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: theme === 'dark' ? '#e5e7eb' : '#374151',
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
        titleColor: theme === 'dark' ? '#e5e7eb' : '#111827',
        bodyColor: theme === 'dark' ? '#9ca3af' : '#4b5563',
        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: theme === 'dark' ? '#374151' : '#e5e7eb',
        },
        ticks: {
          color: theme === 'dark' ? '#9ca3af' : '#6b7280',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: theme === 'dark' ? '#9ca3af' : '#6b7280',
        },
      },
    },
  };

  const barChartData = {
    labels: ggrHistory.map(item => new Date(item.ggr_date).toLocaleDateString()),
    datasets: [
      {
        label: 'Bets',
        data: ggrHistory.map(item => item.total_bets),
        backgroundColor: '#3b82f6',
        borderRadius: 6,
      },
      {
        label: 'Wins',
        data: ggrHistory.map(item => item.total_wins),
        backgroundColor: '#10b981',
        borderRadius: 6,
      },
      {
        label: 'Loss',
        data: ggrHistory.map(item => item.total_loss),
        backgroundColor: '#ef4444',
        borderRadius: 6,
      },
    ],
  };

  // Theme colors
  const themeClasses = {
    dark: {
      bg: 'bg-gray-900',
      cardBg: 'bg-gray-800/50 backdrop-blur-xl',
      border: 'border-gray-700/50',
      text: 'text-gray-100',
      textSecondary: 'text-gray-400',
      hover: 'hover:bg-gray-700/50',
      tableHeader: 'bg-gray-800/80',
      tableRow: 'border-gray-700/50 hover:bg-gray-800/50',
      input: 'bg-gray-800 border-gray-700 text-gray-100',
    },
    light: {
      bg: 'bg-gray-50',
      cardBg: 'bg-white/70 backdrop-blur-xl',
      border: 'border-gray-200/50',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      hover: 'hover:bg-gray-50/50',
      tableHeader: 'bg-gray-100/80',
      tableRow: 'border-gray-200/50 hover:bg-gray-50/50',
      input: 'bg-white border-gray-300 text-gray-900',
    }
  };

  const tc = themeClasses[theme];

  return (
    <div className={`min-h-screen ${tc.bg} p-4 md:p-6 lg:p-8 transition-colors duration-300`}>
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${tc.text} flex items-center gap-2`}>
              <FiBarChart2 className="text-blue-500" />
              GGR History
            </h1>
            <p className={`${tc.textSecondary} mt-1`}>
              Track your gaming revenue and performance metrics
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className={`flex rounded-lg p-1 ${tc.cardBg} border ${tc.border}`}>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'table'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : `${tc.textSecondary} ${tc.hover}`
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('chart')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'chart'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : `${tc.textSecondary} ${tc.hover}`
                }`}
              >
                Charts
              </button>
              <button
                onClick={() => setViewMode('stats')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'stats'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : `${tc.textSecondary} ${tc.hover}`
                }`}
              >
                Stats
              </button>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg ${tc.cardBg} border ${tc.border} ${tc.textSecondary} hover:scale-105 transition-all`}
            >
              <FiFilter className="w-5 h-5" />
            </button>

            <button
              onClick={exportData}
              className={`p-2 rounded-lg ${tc.cardBg} border ${tc.border} ${tc.textSecondary} hover:scale-105 transition-all`}
            >
              <FiDownload className="w-5 h-5" />
            </button>

            <button
              onClick={() => fetchData(ggrPage)}
              className={`p-2 rounded-lg ${tc.cardBg} border ${tc.border} ${tc.textSecondary} hover:scale-105 transition-all`}
            >
              <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className={`mb-6 p-4 rounded-xl ${tc.cardBg} border ${tc.border} animate-slideDown`}>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className={`block text-sm font-medium ${tc.textSecondary} mb-1`}>
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${tc.input} focus:ring-2 focus:ring-blue-500 outline-none transition`}
                />
              </div>
              <div className="flex-1">
                <label className={`block text-sm font-medium ${tc.textSecondary} mb-1`}>
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${tc.input} focus:ring-2 focus:ring-blue-500 outline-none transition`}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleDateFilter}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all hover:scale-105"
                >
                  Apply
                </button>
                <button
                  onClick={resetFilters}
                  className={`px-4 py-2 ${tc.cardBg} border ${tc.border} ${tc.textSecondary} rounded-lg hover:scale-105 transition-all`}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className={`p-4 rounded-xl ${tc.cardBg} border ${tc.border} hover:scale-105 transition-all`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${tc.textSecondary}`}>Total bet Amount</p>
                  <p className={`text-2xl font-bold ${tc.text}`}>₹{totalLossSum}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <GiMoneyStack className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-xl ${tc.cardBg} border ${tc.border} hover:scale-105 transition-all`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${tc.textSecondary}`}>Avg. GGR/Day</p>
                  <p className={`text-2xl font-bold ${tc.text}`}>₹{stats.avgGGR.toFixed(2)}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <FiActivity className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-xl ${tc.cardBg} border ${tc.border} hover:scale-105 transition-all`}>
              <div className="flex items-center justify-between">
                <div>
                  
                  <p className={`text-sm ${tc.textSecondary}`}>Total GGR of {user.ggr_coust} %</p>
                  <p className={`text-2xl font-bold ${tc.text}`}>{totalGgr12PercentSum}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <FiPieChart className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-xl ${tc.cardBg} border ${tc.border} hover:scale-105 transition-all`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${tc.textSecondary}`}>Best Day</p>
                  <p className={`text-sm font-semibold ${tc.text}`}>
                    {new Date(stats.bestDay.ggr_date).toLocaleDateString()}
                  </p>
                  <p className={`text-xs ${tc.textSecondary}`}>₹{stats.bestDay.ggr}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <FiAward className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className={`rounded-xl ${tc.cardBg} border ${tc.border} overflow-hidden`}>
          {viewMode === 'table' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={tc.tableHeader}>
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <FiCalendar className="w-4 h-4" />
                        Date
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <FiTrendingUp className="w-4 h-4" />
                        Total Loss Bets
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <FiTrendingUp className="w-4 h-4 text-green-500" />
                        Total Wins
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <FiTrendingDown className="w-4 h-4 text-red-500" />
                        Loss
                      </div>
                    </th>
                    
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <GiProfit className="w-4 h-4" />
                       Total Loss GGr of 12%
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <FiDollarSign className="w-4 h-4" />
                        Your Before balance
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <FiDollarSign className="w-4 h-4" />
                        Your After balance
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <FiRefreshCw className="w-5 h-5 animate-spin text-blue-500" />
                          <span className={tc.textSecondary}>Loading data...</span>
                        </div>
                      </td>
                    </tr>
                  ) : ggrHistory.length === 0 ? (
                    <tr>
                      <td colSpan="7" className={`px-4 py-8 text-center ${tc.textSecondary}`}>
                        No data available for the selected period
                      </td>
                    </tr>
                  ) : (
                    ggrHistory.map((item, index) => (
                      <tr key={index} className={`border-t ${tc.tableRow} transition-colors`}>
                        <td className="px-4 py-3 text-sm">
                          <span className={tc.text}>
                            {new Date(item.ggr_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="font-medium text-blue-500">
                            {item.total_bets.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="font-medium text-green-500">
                            {item.total_wins.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="font-medium text-red-500">
                            {item.total_loss.toLocaleString()}
                          </span>
                        </td>
                      
                        <td className="px-4 py-3 text-sm">
                          <span className="font-medium text-red-600 dark:text-reg-400">
                            ₹{item.ggr_12_percent }
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={item.user_balance_before > 0 ? 'text-green-500' : 'text-gray-500'}>
                            ₹{item.user_balance_before.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={item.user_balance_after > 0 ? 'text-green-500' : 'text-gray-500'}>
                            ₹{item.user_balance_after.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {viewMode === 'chart' && (
            <div className="p-6">
              <div className="mb-4 flex gap-2">
                <button
                  onClick={() => setSelectedMetric('ggr')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    selectedMetric === 'ggr'
                      ? 'bg-blue-500 text-white'
                      : `${tc.textSecondary} ${tc.hover}`
                  }`}
                >
                  GGR Trend
                </button>
                <button
                  onClick={() => setSelectedMetric('bets')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    selectedMetric === 'bets'
                      ? 'bg-blue-500 text-white'
                      : `${tc.textSecondary} ${tc.hover}`
                  }`}
                >
                  Bets vs Wins
                </button>
              </div>
              <div className="h-[400px]">
                {selectedMetric === 'ggr' ? (
                  <Line data={chartData} options={chartOptions} />
                ) : (
                  <Bar data={barChartData} options={chartOptions} />
                )}
              </div>
            </div>
          )}

          {viewMode === 'stats' && stats && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-4 rounded-lg border ${tc.border}`}>
                  <h3 className={`text-lg font-semibold ${tc.text} mb-4 flex items-center gap-2`}>
                    <FiActivity className="text-blue-500" />
                    Performance Metrics
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className={tc.textSecondary}>Total Bets</span>
                      <span className={`font-semibold ${tc.text}`}>{stats.totalBets.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={tc.textSecondary}>Total Wins</span>
                      <span className="font-semibold text-green-500">{stats.totalWins.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={tc.textSecondary}>Total Loss</span>
                      <span className="font-semibold text-red-500">
                        {(stats.totalBets - stats.totalWins).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className={tc.textSecondary}>Total GGR of 12%</span>
                      <span className="font-bold text-blue-500">{totalGgr12PercentSum}%</span>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg border ${tc.border}`}>
                  <h3 className={`text-lg font-semibold ${tc.text} mb-4 flex items-center gap-2`}>
                    <GiMoneyStack className="text-green-500" />
                    Revenue Analysis
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className={tc.textSecondary}>Total Loss bet amount</span>
                      <span className="font-bold text-blue-500">₹{totalLossSum}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={tc.textSecondary}>Average GGR/Day</span>
                      <span className="font-semibold text-green-500">₹{stats.avgGGR.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={tc.textSecondary}>Best Day GGR</span>
                      <span className="font-semibold text-yellow-500">₹{stats.bestDay.ggr}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className={tc.textSecondary}>Best Day Date</span>
                      <span className="font-medium text-gray-600 dark:text-gray-400">
                        {new Date(stats.bestDay.ggr_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pagination */}
          {ggrTotalPages > 1 && (
            <div className={`flex items-center justify-between px-4 py-3 border-t ${tc.border}`}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => changePage(1)}
                  disabled={ggrPage === 1}
                  className={`p-2 rounded-lg transition-all ${
                    ggrPage === 1
                      ? 'opacity-50 cursor-not-allowed'
                      : `${tc.hover} hover:scale-105`
                  }`}
                >
                  <FiChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => changePage(ggrPage - 1)}
                  disabled={ggrPage === 1}
                  className={`p-2 rounded-lg transition-all ${
                    ggrPage === 1
                      ? 'opacity-50 cursor-not-allowed'
                      : `${tc.hover} hover:scale-105`
                  }`}
                >
                  <FiChevronLeft className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-sm ${tc.textSecondary}`}>
                  Page {ggrPage} of {ggrTotalPages}
                </span>
                <div className="flex gap-1 ml-2">
                  {[...Array(Math.min(5, ggrTotalPages))].map((_, i) => {
                    let pageNum;
                    if (ggrTotalPages <= 5) {
                      pageNum = i + 1;
                    } else if (ggrPage <= 3) {
                      pageNum = i + 1;
                    } else if (ggrPage >= ggrTotalPages - 2) {
                      pageNum = ggrTotalPages - 4 + i;
                    } else {
                      pageNum = ggrPage - 2 + i;
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => changePage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                          ggrPage === pageNum
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
                  onClick={() => changePage(ggrPage + 1)}
                  disabled={ggrPage === ggrTotalPages}
                  className={`p-2 rounded-lg transition-all ${
                    ggrPage === ggrTotalPages
                      ? 'opacity-50 cursor-not-allowed'
                      : `${tc.hover} hover:scale-105`
                  }`}
                >
                  <FiChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => changePage(ggrTotalPages)}
                  disabled={ggrPage === ggrTotalPages}
                  className={`p-2 rounded-lg transition-all ${
                    ggrPage === ggrTotalPages
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

        {/* Last Updated Info */}
        <div className={`mt-4 text-xs ${tc.textSecondary} flex items-center justify-end gap-2`}>
          <FiClock className="w-3 h-3" />
          <span>Last updated: {new Date().toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default GGRHistory;