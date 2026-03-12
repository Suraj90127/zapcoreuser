import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiFilter, FiEye, FiSend } from 'react-icons/fi';

const InactiveUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const inactiveUsers = [
    { id: 2, name: 'Jane Smith', email: 'jane@gaming.com', lastActive: '3 days ago', daysInactive: 3, totalGames: 18 },
    { id: 6, name: 'David Lee', email: 'david@gaming.com', lastActive: '2 weeks ago', daysInactive: 14, totalGames: 23 },
  ];

  const filteredUsers = inactiveUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gradient-silver">
            Inactive Users
          </h1>
          <p className="text-gray-400 mt-2">
            {inactiveUsers.length} users haven't logged in recently
          </p>
        </div>
        <button className="px-4 py-2 bg-gradient-to-br from-gray-800 to-black border border-gray-700 text-white rounded-lg hover:shadow-glow transition-all duration-300 flex items-center">
          <FiSend className="mr-2" />
          Send Reminder
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { value: inactiveUsers.length, label: 'Inactive Users' },
          { value: '8.5', label: 'Avg Days Inactive' },
          { value: '41', label: 'Total Games Played' },
        ].map((stat, index) => (
          <div key={index} className="glass border border-gray-800 rounded-xl p-6">
            <div className="text-3xl font-bold text-white">{stat.value}</div>
            <div className="text-gray-300 text-sm mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass border border-gray-800 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search inactive users..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-600 focus:border-gray-600 transition-all backdrop-blur-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <select className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-gray-600 transition-all backdrop-blur-sm">
            <option className="bg-gray-900">Last 7 days</option>
            <option className="bg-gray-900">Last 30 days</option>
            <option className="bg-gray-900">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Inactive Users Table */}
      <div className="glass border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Last Active</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Days Inactive</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total Games</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-black border border-gray-700 flex items-center justify-center text-white font-bold mr-3">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-white">{user.name}</div>
                        <div className="text-sm text-gray-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-gray-300">{user.lastActive}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-bold text-white">{user.daysInactive} days</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-gray-300">{user.totalGames}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <Link
                        to={`/user/${user.id}`}
                        className="inline-flex items-center px-3 py-2 text-sm bg-gradient-to-br from-gray-800 to-black border border-gray-700 text-white rounded-lg hover:shadow-glow transition-all duration-300"
                      >
                        <FiEye className="mr-2" />
                        View
                      </Link>
                      <button className="inline-flex items-center px-3 py-2 text-sm bg-gray-800/50 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors">
                        <FiSend className="mr-2" />
                        Remind
                      </button>
                    </div>
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

export default InactiveUsers;