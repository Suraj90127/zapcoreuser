import { useState } from 'react';
import { FiTrendingUp, FiTrendingDown, FiBarChart2, FiCalendar } from 'react-icons/fi';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

const TotalRecharge = () => {
  const [timeRange, setTimeRange] = useState('month');

  const totalStats = {
    totalAmount: 18750,
    todayAmount: 1250,
    avgAmount: 625,
    transactions: 30
  };

  const monthlyData = [
    { month: 'Jan', amount: 12500, users: 45 },
    { month: 'Feb', amount: 14300, users: 52 },
    { month: 'Mar', amount: 18750, users: 67 },
    { month: 'Apr', amount: 16500, users: 58 },
    { month: 'May', amount: 19800, users: 72 },
    { month: 'Jun', amount: 21500, users: 81 },
  ];

  const methodData = [
    { name: 'Credit Card', value: 45, color: '#666' },
    { name: 'Crypto', value: 25, color: '#999' },
    { name: 'Bank Transfer', value: 15, color: '#aaa' },
    { name: 'E-Wallet', value: 10, color: '#bbb' },
    { name: 'Other', value: 5, color: '#ccc' },
  ];

  const topUsers = [
    { id: 1, name: 'Emma Davis', amount: 4500, transactions: 12 },
    { id: 2, name: 'Bob Johnson', amount: 3200, transactions: 8 },
    { id: 3, name: 'Frank Miller', amount: 2800, transactions: 6 },
    { id: 4, name: 'John Doe', amount: 2100, transactions: 5 },
    { id: 5, name: 'Charlie Wilson', amount: 1800, transactions: 4 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gradient-silver">
            Total Recharge Analytics
          </h1>
          <p className="text-gray-400 mt-2">
            Comprehensive overview of all recharge transactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          {['day', 'week', 'month', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-lg text-sm ${
                timeRange === range
                  ? 'bg-gradient-to-br from-gray-800 to-black text-white'
                  : 'bg-gray-800/50 border border-gray-700 text-gray-300 hover:bg-gray-800'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Total Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { value: `$${totalStats.totalAmount.toLocaleString()}`, label: 'Total Recharge', icon: <FiTrendingUp /> },
          { value: `$${totalStats.todayAmount.toLocaleString()}`, label: "Today's Recharge", icon: <FiTrendingUp /> },
          { value: `$${totalStats.avgAmount}`, label: 'Avg per Transaction', icon: <FiTrendingDown /> },
          { value: totalStats.transactions, label: 'Total Transactions', icon: <FiTrendingUp /> },
        ].map((stat, index) => (
          <div key={index} className="glass border border-gray-800 rounded-xl p-6">
            <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
            <div className="flex items-center justify-between mt-2">
              <div className="text-gray-400 text-sm">{stat.label}</div>
              <div className="text-gray-300">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Chart */}
        <div className="glass border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center">
              <FiBarChart2 className="mr-2" />
              Monthly Recharge Trend
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
                <span className="text-gray-300">Amount</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
                <span className="text-gray-300">Users</span>
              </div>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }}
                  labelStyle={{ color: '#d1d5db' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#9ca3af"
                  strokeWidth={2}
                  name="Amount ($)"
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#6b7280"
                  strokeWidth={2}
                  name="Active Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods Chart */}
        <div className="glass border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Payment Methods Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={methodData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {methodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Users */}
      <div className="glass border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-6">Top Recharging Users</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Transactions</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Avg per Tx</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {topUsers.map((user, index) => (
                <tr key={user.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index === 0 ? 'bg-gray-600 text-white' :
                      index === 1 ? 'bg-gray-700 text-gray-300' :
                      index === 2 ? 'bg-gray-800 text-gray-400' :
                      'bg-gray-900/50 text-gray-500'
                    }`}>
                      #{index + 1}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-white">{user.name}</div>
                    <div className="text-sm text-gray-400">ID: U00{user.id}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-bold text-white">${user.amount.toLocaleString()}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-gray-300">{user.transactions}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-300">${Math.round(user.amount / user.transactions)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TotalRecharge;