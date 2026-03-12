import React, { useState, useEffect } from "react";
import { 
  FiBell,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiDollarSign,
  FiClock,
  FiFilter,
  FiSearch,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiCheckSquare,
  FiSquare,
  FiChevronLeft,
  FiRefreshCw,
  FiDownload,
  FiSettings,
  FiUser,
  FiCreditCard,
  FiSmartphone,
  FiXCircle
} from "react-icons/fi";
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from "react-router-dom";
import { GiWallet } from "react-icons/gi";
import { MdNotificationImportant, MdNotificationsOff } from "react-icons/md";
import toast from 'react-hot-toast';

const Notifications = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  // State
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Mock notifications data
  const mockNotifications = [
    { 
      id: 'NOT001', 
      title: 'Deposit Successful', 
      message: 'Your deposit of ₹1,000 has been processed successfully. ₹100 bonus added to your account.',
      type: 'success',
      status: 'unread',
      timestamp: '2024-03-15 14:35',
      icon: FiCheckCircle,
      category: 'deposit',
      priority: 'high'
    },
   
    { 
      id: 'NOT003', 
      title: 'Transaction Failed', 
      message: 'Your deposit of ₹2,000 via Net Banking failed due to insufficient funds.',
      type: 'error',
      status: 'read',
      timestamp: '2024-03-14 11:05',
      icon: FiXCircle,
      category: 'deposit',
      priority: 'high'
    },
    { 
      id: 'NOT004', 
      title: 'Account Verification', 
      message: 'Your account verification is complete. All features are now unlocked.',
      type: 'success',
      status: 'read',
      timestamp: '2024-03-13 16:45',
      icon: FiUser,
      category: 'account',
      priority: 'medium'
    },
    { 
      id: 'NOT005', 
      title: 'Bonus Added', 
      message: '₹75 bonus has been credited to your account for your recent deposit.',
      type: 'success',
      status: 'unread',
      timestamp: '2024-03-12 09:15',
      icon: FiDollarSign,
      category: 'bonus',
      priority: 'low'
    },
    { 
      id: 'NOT006', 
      title: 'Security Alert', 
      message: 'New device login detected from Mumbai, India. If this was not you, please secure your account.',
      type: 'warning',
      status: 'unread',
      timestamp: '2024-03-11 18:30',
      icon: FiAlertCircle,
      category: 'security',
      priority: 'high'
    },
    { 
      id: 'NOT007', 
      title: 'Payment Method Updated', 
      message: 'Your UPI payment method has been successfully added to your account.',
      type: 'info',
      status: 'read',
      timestamp: '2024-03-10 12:45',
      icon: FiSmartphone,
      category: 'payment',
      priority: 'low'
    },
    { 
      id: 'NOT008', 
      title: 'Scheduled Maintenance', 
      message: 'System maintenance scheduled for March 12, 02:00 - 04:00 AM. Services may be temporarily unavailable.',
      type: 'info',
      status: 'read',
      timestamp: '2024-03-09 14:20',
      icon: FiClock,
      category: 'system',
      priority: 'medium'
    },
    { 
      id: 'NOT009', 
      title: 'Welcome Bonus', 
      message: 'Welcome to the platform! ₹100 bonus has been credited to your account.',
      type: 'success',
      status: 'read',
      timestamp: '2024-03-08 16:10',
      icon: GiWallet,
      category: 'bonus',
      priority: 'medium'
    },
    { 
      id: 'NOT010', 
      title: 'Transaction Limit Increased', 
      message: 'Your daily transaction limit has been increased to ₹50,000.',
      type: 'success',
      status: 'unread',
      timestamp: '2024-03-07 11:30',
      icon: FiCreditCard,
      category: 'account',
      priority: 'low'
    }
  ];

  // Load data
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 800);
  }, []);

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
  const shadowColor = theme === 'dark' ? 'shadow-gray-900/50' : 'shadow-gray-200/50';
  const tableHeaderBg = theme === 'dark' ? 'bg-gray-800/60' : 'bg-gray-100/80';
  const tableRowHover = theme === 'dark' ? 'hover:bg-gray-800/30' : 'hover:bg-gray-50';

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || notification.status === statusFilter;
    const matchesUnread = !showUnreadOnly || notification.status === 'unread';
    
    // Date filter
    let matchesDate = true;
    if (dateFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      matchesDate = notification.timestamp.startsWith(today);
    } else if (dateFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const notifDate = new Date(notification.timestamp);
      matchesDate = notifDate >= weekAgo;
    }
    
    return matchesSearch && matchesType && matchesStatus && matchesUnread && matchesDate;
  });

  // Calculate statistics
  const calculateStats = () => {
    const stats = {
      total: notifications.length,
      unread: notifications.filter(n => n.status === 'unread').length,
      read: notifications.filter(n => n.status === 'read').length,
      success: notifications.filter(n => n.type === 'success').length,
      warning: notifications.filter(n => n.type === 'warning').length,
      error: notifications.filter(n => n.type === 'error').length,
      info: notifications.filter(n => n.type === 'info').length,
      today: notifications.filter(n => {
        const today = new Date().toISOString().split('T')[0];
        return n.timestamp.startsWith(today);
      }).length
    };
    
    return stats;
  };

  const stats = calculateStats();

  // Handle notification selection
  const handleSelectNotification = (id) => {
    if (selectedNotifications.includes(id)) {
      setSelectedNotifications(selectedNotifications.filter(nId => nId !== id));
    } else {
      setSelectedNotifications([...selectedNotifications, id]);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  // Mark as read
  const handleMarkAsRead = (id = null) => {
    setNotifications(prev => prev.map(notification => {
      if (id) {
        if (notification.id === id) {
          return { ...notification, status: 'read' };
        }
      } else if (selectedNotifications.length > 0) {
        if (selectedNotifications.includes(notification.id)) {
          return { ...notification, status: 'read' };
        }
      }
      return notification;
    }));
    
    if (id) {
      toast.success('Notification marked as read');
    } else if (selectedNotifications.length > 0) {
      toast.success(`${selectedNotifications.length} notifications marked as read`);
      setSelectedNotifications([]);
    }
  };

  // Mark as unread
  const handleMarkAsUnread = () => {
    if (selectedNotifications.length > 0) {
      setNotifications(prev => prev.map(notification => {
        if (selectedNotifications.includes(notification.id)) {
          return { ...notification, status: 'unread' };
        }
        return notification;
      }));
      toast.success(`${selectedNotifications.length} notifications marked as unread`);
      setSelectedNotifications([]);
    }
  };

  // Delete notifications
  const handleDelete = (id = null) => {
    if (id) {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      toast.success('Notification deleted');
    } else if (selectedNotifications.length > 0) {
      setNotifications(prev => prev.filter(notification => !selectedNotifications.includes(notification.id)));
      toast.success(`${selectedNotifications.length} notifications deleted`);
      setSelectedNotifications([]);
    }
  };

  // Clear all notifications
  const handleClearAll = () => {
    setNotifications([]);
    setSelectedNotifications([]);
    toast.success('All notifications cleared');
  };

  // Mark all as read
  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, status: 'read' })));
    toast.success('All notifications marked as read');
  };

  // Get notification icon
  const getNotificationIcon = (type) => {
    const icons = {
      success: FiCheckCircle,
      warning: FiAlertCircle,
      error: FiXCircle,
      info: FiInfo
    };
    return icons[type] || FiBell;
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      high: theme === 'dark' ? 'text-red-400' : 'text-red-600',
      medium: theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600',
      low: theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
    };
    return colors[priority] || (theme === 'dark' ? 'text-gray-400' : 'text-gray-600');
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    const config = {
      high: {
        text: 'HIGH',
        color: theme === 'dark' ? 'text-red-400' : 'text-red-600',
        bg: theme === 'dark' ? 'bg-red-500/10' : 'bg-red-100',
        border: theme === 'dark' ? 'border-red-500/30' : 'border-red-200'
      },
      medium: {
        text: 'MEDIUM',
        color: theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600',
        bg: theme === 'dark' ? 'bg-yellow-500/10' : 'bg-yellow-100',
        border: theme === 'dark' ? 'border-yellow-500/30' : 'border-yellow-200'
      },
      low: {
        text: 'LOW',
        color: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
        bg: theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-100',
        border: theme === 'dark' ? 'border-blue-500/30' : 'border-blue-200'
      }
    };
    
    const conf = config[priority] || config.low;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${conf.border} ${conf.bg} ${conf.color}`}>
        {conf.text}
      </span>
    );
  };

  // Get type badge
  const getTypeBadge = (type) => {
    const config = {
      success: {
        text: 'SUCCESS',
        color: theme === 'dark' ? 'text-green-400' : 'text-green-600',
        bg: theme === 'dark' ? 'bg-green-500/10' : 'bg-green-100',
        border: theme === 'dark' ? 'border-green-500/30' : 'border-green-200'
      },
      warning: {
        text: 'WARNING',
        color: theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600',
        bg: theme === 'dark' ? 'bg-yellow-500/10' : 'bg-yellow-100',
        border: theme === 'dark' ? 'border-yellow-500/30' : 'border-yellow-200'
      },
      error: {
        text: 'ERROR',
        color: theme === 'dark' ? 'text-red-400' : 'text-red-600',
        bg: theme === 'dark' ? 'bg-red-500/10' : 'bg-red-100',
        border: theme === 'dark' ? 'border-red-500/30' : 'border-red-200'
      },
      info: {
        text: 'INFO',
        color: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
        bg: theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-100',
        border: theme === 'dark' ? 'border-blue-500/30' : 'border-blue-200'
      }
    };
    
    const conf = config[type] || config.info;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${conf.border} ${conf.bg} ${conf.color}`}>
        {conf.text}
      </span>
    );
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      <div className={`h-12 ${cardBg} rounded-2xl`}></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-32 ${cardBg} rounded-2xl`}></div>
        ))}
      </div>
      <div className={`h-96 ${cardBg} rounded-2xl`}></div>
    </div>
  );

  return (
    <div className={`min-h-screen ${containerBg} py-6 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => navigate(-1)}
                className={`p-2 rounded-xl ${
                  theme === 'dark' 
                    ? 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700' 
                    : 'bg-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-300'
                } transition`}
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
              <h1 className={`text-3xl lg:text-4xl font-bold ${
                theme === 'dark' 
                  ? 'bg-gradient-to-r from-blue-400 to-blue-800 bg-clip-text text-transparent'
                  : 'bg-gradient-to-r from-blue-600  to-blue-800 bg-clip-text text-transparent'
              }`}>
                Notifications
              </h1>
            </div>
            <p className={`text-lg ${textSecondary} ml-12`}>
              Stay updated with all your account activities and alerts
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleMarkAllAsRead}
              disabled={stats.unread === 0}
              className={`px-5 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30'
                  : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 border border-blue-200 hover:shadow-md'
              } disabled:opacity-50`}
            >
              <FiCheckSquare className="w-4 h-4" />
              Mark All Read
            </button>
            <button
              onClick={handleClearAll}
              disabled={notifications.length === 0}
              className={`px-5 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-red-600/20 to-blue-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30'
                  : 'bg-gradient-to-r from-red-50 to-blue-50 text-red-600 border border-red-200 hover:shadow-md'
              } disabled:opacity-50`}
            >
              <FiTrash2 className="w-4 h-4" />
              Clear All
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className={`${cardBg} rounded-3xl border ${borderColor} p-6 shadow-xl ${shadowColor}`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${
                  theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
                }`}>
                  <FiBell className={`text-xl ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                </div>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  theme === 'dark' 
                    ? 'bg-green-500/10 text-green-400' 
                    : 'bg-green-100 text-green-600'
                }`}>
                  {stats.today} today
                </span>
              </div>
              <div>
                <p className={`text-2xl font-bold ${textPrimary}`}>
                  {stats.total}
                </p>
                <p className={`text-sm ${textMuted} mt-1`}>
                  Total Notifications
                </p>
              </div>
            </div>

            <div className={`${cardBg} rounded-3xl border ${borderColor} p-6 shadow-xl ${shadowColor}`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${
                  theme === 'dark' ? 'bg-red-500/20' : 'bg-red-100'
                }`}>
                  <MdNotificationImportant className={`text-xl ${
                    theme === 'dark' ? 'text-red-400' : 'text-red-600'
                  }`} />
                </div>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  theme === 'dark' 
                    ? 'bg-red-500/10 text-red-400' 
                    : 'bg-red-100 text-red-600'
                }`}>
                  Urgent
                </span>
              </div>
              <div>
                <p className={`text-2xl font-bold ${textPrimary}`}>
                  {stats.unread}
                </p>
                <p className={`text-sm ${textMuted} mt-1`}>
                  Unread Notifications
                </p>
              </div>
            </div>

            <div className={`${cardBg} rounded-3xl border ${borderColor} p-6 shadow-xl ${shadowColor}`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${
                  theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'
                }`}>
                  <FiCheckCircle className={`text-xl ${
                    theme === 'dark' ? 'text-green-400' : 'text-green-600'
                  }`} />
                </div>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  theme === 'dark' 
                    ? 'bg-blue-500/10 text-blue-400' 
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {stats.success}
                </span>
              </div>
              <div>
                <p className={`text-2xl font-bold ${textPrimary}`}>
                  {stats.success}
                </p>
                <p className={`text-sm ${textMuted} mt-1`}>
                  Success Alerts
                </p>
              </div>
            </div>

            <div className={`${cardBg} rounded-3xl border ${borderColor} p-6 shadow-xl ${shadowColor}`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${
                  theme === 'dark' ? 'bg-yellow-500/20' : 'bg-yellow-100'
                }`}>
                  <FiAlertCircle className={`text-xl ${
                    theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                  }`} />
                </div>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  theme === 'dark' 
                    ? 'bg-yellow-500/10 text-yellow-400' 
                    : 'bg-yellow-100 text-yellow-600'
                }`}>
                  {stats.warning + stats.error}
                </span>
              </div>
              <div>
                <p className={`text-2xl font-bold ${textPrimary}`}>
                  {stats.warning + stats.error}
                </p>
                <p className={`text-sm ${textMuted} mt-1`}>
                  Warnings & Errors
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Actions */}
        <div className={`${cardBg} rounded-3xl border ${borderColor} p-6 shadow-xl ${shadowColor}`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Bulk Actions */}
            <div className="lg:col-span-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleSelectAll}
                  className={`p-2 rounded-lg ${
                    theme === 'dark' 
                      ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                      : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                  } transition`}
                >
                  {selectedNotifications.length === filteredNotifications.length ? 
                    <FiCheckSquare className="w-5 h-5" /> : 
                    <FiSquare className="w-5 h-5" />
                  }
                </button>
                <div className="flex-1">
                  <h3 className={`text-sm font-medium ${textSecondary} mb-1`}>
                    Bulk Actions
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMarkAsRead()}
                      disabled={selectedNotifications.length === 0}
                      className={`px-3 py-1.5 text-sm rounded-lg font-medium ${
                        theme === 'dark'
                          ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 disabled:opacity-50'
                          : 'bg-blue-100 text-blue-600 hover:bg-blue-200 disabled:opacity-50'
                      } transition`}
                    >
                      Mark Read
                    </button>
                    <button
                      onClick={handleMarkAsUnread}
                      disabled={selectedNotifications.length === 0}
                      className={`px-3 py-1.5 text-sm rounded-lg font-medium ${
                        theme === 'dark'
                          ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 disabled:opacity-50'
                          : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200 disabled:opacity-50'
                      } transition`}
                    >
                      Mark Unread
                    </button>
                    <button
                      onClick={() => handleDelete()}
                      disabled={selectedNotifications.length === 0}
                      className={`px-3 py-1.5 text-sm rounded-lg font-medium ${
                        theme === 'dark'
                          ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-50'
                          : 'bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50'
                      } transition`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="lg:col-span-3">
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                Search
              </label>
              <div className="relative">
                <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  className={`w-full pl-10 pr-4 py-2.5 ${inputBg} border ${borderColor} rounded-xl ${textPrimary} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                Type
              </label>
              <select
                className={`w-full px-4 py-2.5 ${inputBg} border ${borderColor} rounded-xl ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all`}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="info">Info</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                Status
              </label>
              <select
                className={`w-full px-4 py-2.5 ${inputBg} border ${borderColor} rounded-xl ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all`}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="read">Read</option>
                <option value="unread">Unread</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                Date
              </label>
              <select
                className={`w-full px-4 py-2.5 ${inputBg} border ${borderColor} rounded-xl ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all`}
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">This Month</option>
              </select>
            </div>

            {/* Unread Only Toggle */}
            <div className="flex items-end">
              <button
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${
                  showUnreadOnly
                    ? theme === 'dark'
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'bg-blue-100 text-blue-600 border border-blue-200'
                    : theme === 'dark'
                      ? 'bg-gray-800/50 text-gray-400 border border-gray-700'
                      : 'bg-gray-100 text-gray-600 border border-gray-300'
                } transition`}
              >
                {showUnreadOnly ? (
                  <>
                    <FiEyeOff className="w-4 h-4" />
                    <span className="text-sm font-medium">Unread Only</span>
                  </>
                ) : (
                  <>
                    <FiEye className="w-4 h-4" />
                    <span className="text-sm font-medium">Show All</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className={`rounded-3xl border ${borderColor} overflow-hidden shadow-2xl ${shadowColor}`}>
          <div className={`px-6 py-4 ${tableHeaderBg} border-b ${borderColor}`}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <h3 className={`text-lg font-semibold ${textPrimary}`}>
                Your Notifications
                <span className={`text-sm font-normal ml-2 ${textMuted}`}>
                  ({filteredNotifications.length} found)
                </span>
              </h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleMarkAllAsRead}
                  className={`text-sm font-medium ${
                    theme === 'dark' 
                      ? 'text-blue-400 hover:text-blue-300' 
                      : 'text-blue-600 hover:text-blue-700'
                  } transition`}
                >
                  Mark all as read
                </button>
                <button
                  onClick={handleClearAll}
                  className={`text-sm font-medium ${
                    theme === 'dark' 
                      ? 'text-red-400 hover:text-red-300' 
                      : 'text-red-600 hover:text-red-700'
                  } transition`}
                >
                  Clear all
                </button>
              </div>
            </div>
          </div>
          
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  const NotificationIcon = notification.icon || Icon;
                  const isSelected = selectedNotifications.includes(notification.id);
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-6 transition-colors duration-200 ${tableRowHover} ${
                        notification.status === 'unread' ? 
                          theme === 'dark' ? 'bg-blue-900/10' : 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Selection Checkbox */}
                        <button
                          onClick={() => handleSelectNotification(notification.id)}
                          className="mt-1 flex-shrink-0"
                        >
                          {isSelected ? (
                            <FiCheckSquare className={`w-5 h-5 ${
                              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                            }`} />
                          ) : (
                            <FiSquare className={`w-5 h-5 ${
                              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                            }`} />
                          )}
                        </button>
                        
                        {/* Notification Icon */}
                        <div className={`p-3 rounded-xl flex-shrink-0 ${
                          notification.type === 'success' 
                            ? theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'
                            : notification.type === 'warning'
                            ? theme === 'dark' ? 'bg-yellow-500/20' : 'bg-yellow-100'
                            : notification.type === 'error'
                            ? theme === 'dark' ? 'bg-red-500/20' : 'bg-red-100'
                            : theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
                        }`}>
                          <NotificationIcon className={`text-xl ${
                            notification.type === 'success' 
                              ? theme === 'dark' ? 'text-green-400' : 'text-green-600'
                              : notification.type === 'warning'
                              ? theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                              : notification.type === 'error'
                              ? theme === 'dark' ? 'text-red-400' : 'text-red-600'
                              : theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                          }`} />
                        </div>
                        
                        {/* Notification Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <h4 className={`text-lg font-semibold ${textPrimary} mb-1`}>
                                {notification.title}
                              </h4>
                              <div className="flex items-center gap-3 mb-2">
                                {getTypeBadge(notification.type)}
                                {getPriorityBadge(notification.priority)}
                                <span className={`text-xs ${textMuted}`}>
                                  {notification.category}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className={`text-sm ${textMuted}`}>
                                {notification.timestamp}
                              </span>
                              {notification.status === 'unread' && (
                                <span className={`w-2 h-2 rounded-full ${
                                  theme === 'dark' ? 'bg-blue-500' : 'bg-blue-600'
                                }`}></span>
                              )}
                            </div>
                          </div>
                          
                          <p className={`mb-4 ${textSecondary}`}>
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center gap-3">
                            {notification.status === 'unread' ? (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                                  theme === 'dark'
                                    ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                } transition`}
                              >
                                <FiEye className="w-3.5 h-3.5 mr-1 inline" />
                                Mark as Read
                              </button>
                            ) : (
                              <button
                                onClick={() => handleMarkAsUnread()}
                                className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                                  theme === 'dark'
                                    ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                } transition`}
                              >
                                <FiEyeOff className="w-3.5 h-3.5 mr-1 inline" />
                                Mark as Unread
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleDelete(notification.id)}
                              className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                                theme === 'dark'
                                  ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                  : 'bg-red-100 text-red-600 hover:bg-red-200'
                              } transition`}
                            >
                              <FiTrash2 className="w-3.5 h-3.5 mr-1 inline" />
                              Delete
                            </button>
                            
                            <span className={`text-xs ${textMuted} ml-auto`}>
                              Priority: <span className={getPriorityColor(notification.priority)}>
                                {notification.priority.toUpperCase()}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="px-6 py-16 text-center">
                  <div className="relative inline-block mb-8">
                    <div className={`w-24 h-24 mx-auto mb-4 flex items-center justify-center ${
                      theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'
                    } rounded-full`}>
                      <MdNotificationsOff className={`w-12 h-12 ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                    </div>
                  </div>
                  <h3 className={`text-2xl font-bold mb-3 ${textPrimary}`}>
                    No notifications found
                  </h3>
                  <p className={`${textMuted} max-w-md mx-auto mb-8`}>
                    {showUnreadOnly 
                      ? "You've read all your notifications. Great job staying updated!"
                      : "You're all caught up! No notifications at the moment."
                    }
                  </p>
                  {showUnreadOnly && (
                    <button
                      onClick={() => setShowUnreadOnly(false)}
                      className={`px-6 py-3 rounded-xl font-medium ${
                        theme === 'dark'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-600 text-white hover:shadow-xl hover:shadow-blue-600/30'
                          : 'bg-gradient-to-r from-blue-500 to-blue-500 text-white hover:shadow-xl hover:shadow-blue-400/30'
                      }`}
                    >
                      Show All Notifications
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;