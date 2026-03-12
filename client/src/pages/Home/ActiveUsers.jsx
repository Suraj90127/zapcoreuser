import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiFilter, FiEye } from 'react-icons/fi';

const ActiveUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const activeUsers = [
    { id: 1, name: 'John Doe', email: 'john@gaming.com', lastActive: '2 mins ago', sessionTime: '45m', gamesPlayed: 42 },
    { id: 3, name: 'Bob Johnson', email: 'bob@gaming.com', lastActive: '30 mins ago', sessionTime: '2h', gamesPlayed: 156 },
    { id: 5, name: 'Charlie Wilson', email: 'charlie@gaming.com', lastActive: '1 hour ago', sessionTime: '1h', gamesPlayed: 67 },
    { id: 7, name: 'Emma Davis', email: 'emma@gaming.com', lastActive: '5 mins ago', sessionTime: '3h', gamesPlayed: 201 },
    { id: 8, name: 'Frank Miller', email: 'frank@gaming.com', lastActive: '15 mins ago', sessionTime: '30m', gamesPlayed: 98 },
  ];

  const filteredUsers = activeUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gradient-silver">
            Active Users
          </h1>
          <p className="text-gray-400 mt-2">
            Currently {activeUsers.length} active users
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { value: activeUsers.length, label: 'Active Users' },
          { value: '5.2h', label: 'Avg Session Time' },
          { value: '112', label: 'Games Being Played' },
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
                placeholder="Search active users..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-600 focus:border-gray-600 transition-all backdrop-blur-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors">
            <FiFilter className="w-4 h-4 text-gray-300" />
            <span className="text-gray-300">Filter</span>
          </button>
        </div>
      </div>

      {/* Active Users Table */}
      <div className="glass border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Last Active</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Session Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Games Played</th>
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
                    <div className="font-bold text-white">{user.sessionTime}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-gray-300">{user.gamesPlayed}</div>
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      to={`/user/${user.id}`}
                      className="inline-flex items-center px-3 py-2 text-sm bg-gradient-to-br from-gray-800 to-black border border-gray-700 text-white rounded-lg hover:shadow-glow transition-all duration-300"
                    >
                      <FiEye className="mr-2" />
                      View
                    </Link>
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

export default ActiveUsers;