import { useState } from 'react';
import { 
  FiSearch, FiFilter, FiDownload, FiTrendingUp, 
  FiTrendingDown, FiDollarSign, FiActivity, FiUsers, FiBarChart2
} from 'react-icons/fi';
import { GiPokerHand } from 'react-icons/gi';
import { useTheme } from '../../contexts/ThemeContext';

const BetHistory = () => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [gameFilter, setGameFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');

  const betHistory = [
    { id: 5001, userId: 'U001', userName: 'John Doe', game: 'Limbo', betAmount: 100, winAmount: 200, result: 'win', date: '2024-03-15 14:35', odds: '2.0x', profit: 100 },
    { id: 5002, userId: 'U001', userName: 'John Doe', game: 'Crash', betAmount: 50, winAmount: 0, result: 'loss', date: '2024-03-15 14:20', odds: '1.5x', profit: -50 },
    { id: 5003, userId: 'U003', userName: 'Bob Johnson', game: 'Blackjack', betAmount: 200, winAmount: 350, result: 'win', date: '2024-03-14 11:05', odds: '1.75x', profit: 150 },
    { id: 5004, userId: 'U003', userName: 'Bob Johnson', game: 'Roulette', betAmount: 75, winAmount: 150, result: 'win', date: '2024-03-14 10:30', odds: '2.0x', profit: 75 },
    { id: 5005, userId: 'U002', userName: 'Jane Smith', game: 'Slots', betAmount: 30, winAmount: 120, result: 'win', date: '2024-03-13 16:45', odds: '4.0x', profit: 90 },
    { id: 5006, userId: 'U004', userName: 'Mike Wilson', game: 'Dice', betAmount: 150, winAmount: 0, result: 'loss', date: '2024-03-13 09:15', odds: '1.8x', profit: -150 },
  ];

  const filteredBets = betHistory.filter(bet => {
    const matchesSearch = 
      bet.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bet.game.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGame = gameFilter === 'all' || bet.game === gameFilter;
    const matchesResult = resultFilter === 'all' || bet.result === resultFilter;
    return matchesSearch && matchesGame && matchesResult;
  });

  const totalStats = {
    totalBets: betHistory.length,
    totalWagered: betHistory.reduce((sum, bet) => sum + bet.betAmount, 0),
    totalWon: betHistory.reduce((sum, bet) => sum + bet.winAmount, 0),
    netProfit: betHistory.reduce((sum, bet) => sum + (bet.winAmount - bet.betAmount), 0),
    winRate: (betHistory.filter(bet => bet.result === 'win').length / betHistory.length * 100).toFixed(1),
  };

  const games = ['all', ...new Set(betHistory.map(bet => bet.game))];
  const timeOptions = ['all', 'today', 'this week', 'this month'];

  // Theme-based styles
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
  const tableHeaderBg = theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100';
  const tableRowHover = theme === 'dark' ? 'hover:bg-gray-800/30' : 'hover:bg-gray-50';

  // Stats data with icons
  const stats = [
    { 
      value: totalStats.totalBets, 
      label: 'Total Bets',
      icon: <FiActivity className="w-6 h-6" />,
      color: 'blue',
      change: '+12'
    },
    { 
      value: `${totalStats.totalWagered.toLocaleString()}`, 
      label: 'Total Wagered',
      icon: <FiDollarSign className="w-6 h-6" />,
      color: 'purple',
      change: '+450'
    },
    { 
      value: `${totalStats.totalWon.toLocaleString()}`, 
      label: 'Total Won',
      icon: <GiPokerHand className="w-6 h-6" />,
      color: 'green',
      change: '+230'
    },
    { 
      value: `${totalStats.winRate}%`, 
      label: 'Win Rate',
      icon: <FiBarChart2 className="w-6 h-6" />,
      color: 'orange',
      change: '+2.5%'
    },
  ];

  return (
    <div className={`min-h-screen ${containerBg} py-8 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${
              theme === 'dark' 
                ? 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent'
                : 'bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'
            }`}>
              Bet History
            </h1>
            <p className={textSecondary}>
              Track all betting activities and outcomes
            </p>
          </div>
          <button className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-xl hover:shadow-blue-600/30'
              : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-xl hover:shadow-blue-400/30'
          } hover:scale-105`}>
            <FiDownload className="w-4 h-4" />
            Export Data
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className={`${cardBg} backdrop-blur-sm rounded-2xl border ${borderColor} p-6 transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${
                  theme === 'dark' 
                    ? (stat.color === 'blue' ? 'bg-blue-500/20' :
                       stat.color === 'purple' ? 'bg-purple-500/20' :
                       stat.color === 'green' ? 'bg-green-500/20' :
                       'bg-orange-500/20')
                    : (stat.color === 'blue' ? 'bg-blue-100' :
                       stat.color === 'purple' ? 'bg-purple-100' :
                       stat.color === 'green' ? 'bg-green-100' :
                       'bg-orange-100')
                }`}>
                  <span className={`${
                    theme === 'dark'
                      ? (stat.color === 'blue' ? 'text-blue-400' :
                         stat.color === 'purple' ? 'text-purple-400' :
                         stat.color === 'green' ? 'text-green-400' :
                         'text-orange-400')
                      : (stat.color === 'blue' ? 'text-blue-600' :
                         stat.color === 'purple' ? 'text-purple-600' :
                         stat.color === 'green' ? 'text-green-600' :
                         'text-orange-600')
                  }`}>
                    {stat.icon}
                  </span>
                </div>
                <span className={`text-sm font-bold px-2 py-1 rounded-full ${
                  stat.change.startsWith('+') 
                    ? theme === 'dark' ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-600'
                    : theme === 'dark' ? 'bg-red-500/10 text-red-400' : 'bg-red-100 text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <div>
                <p className={`text-2xl font-bold ${textPrimary}`}>
                  {stat.value}
                </p>
                <p className={`text-sm ${textMuted} mt-1`}>
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className={`${cardBg} backdrop-blur-sm rounded-2xl border ${borderColor} p-6`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                Search
              </label>
              <div className="relative">
                <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search by user or game..."
                  className={`w-full pl-10 pr-4 py-2.5 ${inputBg} border ${borderColor} rounded-lg ${textPrimary} placeholder-gray-500 focus:outline-none focus:ring-2 ${
                    theme === 'dark' ? 'focus:ring-blue-500/50 focus:border-blue-500/30' : 'focus:ring-blue-400 focus:border-blue-300'
                  } transition-all backdrop-blur-sm`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                Game
              </label>
              <div className="relative">
                <FiFilter className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <select
                  className={`w-full pl-10 pr-4 py-2.5 ${inputBg} border ${borderColor} rounded-lg ${textPrimary} focus:outline-none focus:ring-2 ${
                    theme === 'dark' ? 'focus:ring-blue-500/50 focus:border-blue-500/30' : 'focus:ring-blue-400 focus:border-blue-300'
                  } transition-all backdrop-blur-sm`}
                  value={gameFilter}
                  onChange={(e) => setGameFilter(e.target.value)}
                >
                  {games.map(game => (
                    <option key={game} value={game} className={selectBg}>
                      {game === 'all' ? 'All Games' : game}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                Result
              </label>
              <select
                className={`w-full px-4 py-2.5 ${inputBg} border ${borderColor} rounded-lg ${textPrimary} focus:outline-none focus:ring-2 ${
                  theme === 'dark' ? 'focus:ring-blue-500/50 focus:border-blue-500/30' : 'focus:ring-blue-400 focus:border-blue-300'
                } transition-all backdrop-blur-sm`}
                value={resultFilter}
                onChange={(e) => setResultFilter(e.target.value)}
              >
                <option value="all" className={selectBg}>All Results</option>
                <option value="win" className={selectBg}>Win</option>
                <option value="loss" className={selectBg}>Loss</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                Time Period
              </label>
              <select
                className={`w-full px-4 py-2.5 ${inputBg} border ${borderColor} rounded-lg ${textPrimary} focus:outline-none focus:ring-2 ${
                  theme === 'dark' ? 'focus:ring-blue-500/50 focus:border-blue-500/30' : 'focus:ring-blue-400 focus:border-blue-300'
                } transition-all backdrop-blur-sm`}
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
              >
                {timeOptions.map(time => (
                  <option key={time} value={time} className={selectBg}>
                    {time === 'all' ? 'All Time' : time.charAt(0).toUpperCase() + time.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className={`${cardBg} backdrop-blur-sm rounded-2xl border ${borderColor} p-6`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className={`text-lg font-bold mb-2 ${textPrimary}`}>
                Net Profit Summary
              </h3>
              <div className={`text-3xl font-bold ${
                totalStats.netProfit >= 0 
                  ? theme === 'dark' ? 'text-green-400' : 'text-green-600'
                  : theme === 'dark' ? 'text-red-400' : 'text-red-600'
              }`}>
                {totalStats.netProfit >= 0 ? '+' : ''}{totalStats.netProfit.toLocaleString()}
              </div>
              <p className={`text-sm ${textMuted} mt-1`}>
                Overall profit from {totalStats.totalBets} bets
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className={`text-2xl font-bold ${textPrimary}`}>
                  {totalStats.totalWagered.toLocaleString()}
                </div>
                <div className={`text-sm ${textMuted}`}>Total Wagered</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${textPrimary}`}>
                  {totalStats.totalWon.toLocaleString()}
                </div>
                <div className={`text-sm ${textMuted}`}>Total Won</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bet History Table */}
        <div className={`rounded-2xl border ${borderColor} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className={tableHeaderBg}>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                    <span className={textMuted}>ID</span>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                    <span className={textMuted}>User</span>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                    <span className={textMuted}>Game</span>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                    <span className={textMuted}>Bet Amount</span>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                    <span className={textMuted}>Win Amount</span>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                    <span className={textMuted}>Profit</span>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                    <span className={textMuted}>Result</span>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                    <span className={textMuted}>Odds</span>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                    <span className={textMuted}>Date & Time</span>
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-gray-800`}>
                {filteredBets.map((bet) => (
                  <tr 
                    key={bet.id} 
                    className={`${tableRowHover} transition-colors duration-200`}
                  >
                    <td className="px-6 py-4">
                      <div className={`text-sm font-medium ${textPrimary} font-mono`}>
                        #{bet.id}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className={`font-medium ${textPrimary}`}>{bet.userName}</div>
                        <div className={`text-sm ${textMuted}`}>{bet.userId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`font-medium ${textPrimary}`}>{bet.game}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`font-bold ${textMuted}`}>{bet.betAmount}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`font-bold ${
                        bet.winAmount > 0 
                          ? theme === 'dark' ? 'text-green-400' : 'text-green-600'
                          : textMuted
                      }`}>
                        {bet.winAmount}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`font-bold ${
                        bet.profit >= 0 
                          ? theme === 'dark' ? 'text-green-400' : 'text-green-600'
                          : theme === 'dark' ? 'text-red-400' : 'text-red-600'
                      }`}>
                        {bet.profit >= 0 ? '+' : ''}{Math.abs(bet.profit)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {bet.result === 'win' ? (
                          <>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                              theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'
                            }`}>
                              <FiTrendingUp className={`w-4 h-4 ${
                                theme === 'dark' ? 'text-green-400' : 'text-green-600'
                              }`} />
                            </div>
                            <span className={`font-medium ${
                              theme === 'dark' ? 'text-green-400' : 'text-green-600'
                            }`}>
                              WIN
                            </span>
                          </>
                        ) : (
                          <>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                              theme === 'dark' ? 'bg-red-500/20' : 'bg-red-100'
                            }`}>
                              <FiTrendingDown className={`w-4 h-4 ${
                                theme === 'dark' ? 'text-red-400' : 'text-red-600'
                              }`} />
                            </div>
                            <span className={`font-medium ${
                              theme === 'dark' ? 'text-red-400' : 'text-red-600'
                            }`}>
                              LOSS
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 text-xs rounded-full ${
                        theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700'
                      } font-medium`}>
                        {bet.odds}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm ${textMuted}`}>{bet.date}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredBets.length === 0 && (
          <div className="text-center py-16">
            <div className="relative inline-block mb-8">
              <div className={`w-24 h-24 mx-auto mb-4 flex items-center justify-center ${
                theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'
              } rounded-full`}>
                <GiPokerHand className={`w-12 h-12 ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                }`} />
              </div>
            </div>
            <h3 className={`text-2xl font-bold mb-3 ${textPrimary}`}>
              No bet history found
            </h3>
            <p className={`${textMuted} max-w-md mx-auto mb-8`}>
              Try adjusting your search or filter to find what you're looking for.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setGameFilter('all');
                setResultFilter('all');
                setTimeFilter('all');
              }}
              className={`px-6 py-3 rounded-xl border ${borderColor} ${textPrimary} hover:bg-gray-800/20 transition-all duration-300`}
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BetHistory;