// MobileFooter.jsx - Responsive mobile footer matching the theme
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { FiHome } from 'react-icons/fi';
import { 
  FiGrid, 
  FiCompass, 
  FiStar,
  FiUser,
  FiShoppingBag,
  FiPlusCircle,
  FiBell,
  FiSettings
} from 'react-icons/fi';
import { GiGamepad, GiWallet, GiCricketBat } from 'react-icons/gi';
import { SiPrdotco } from 'react-icons/si';
import { useTheme } from '../../contexts/ThemeContext';

const MobileFooter = () => {
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('cricket');
  const [showQuickActions, setShowQuickActions] = useState(false);

  useEffect(() => {
    // Set active tab based on current route
    const path = location.pathname;
    if (path === '/' || path.startsWith('/cricket')) setActiveTab('cricket');
    else if (path.includes('/games')) setActiveTab('games');
    else if (path.includes('/providers')) setActiveTab('providers');
    else if (path.includes('/trending')) setActiveTab('trending');
    else if (path.includes('/deposit')) setActiveTab('wallet');
    else setActiveTab('');
  }, [location]);

  const navItems = [
    {
      id: 'cricket',
      label: 'Cricket',
      icon: <GiCricketBat className="w-5 h-5" />,
      path: '/cricket',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'games',
      label: 'Games',
      icon: <GiGamepad className="w-5 h-5" />,
      path: '/games',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'home',
      label: 'Home',
      icon: <FiHome className="w-6 h-6" />,
      color: 'from-blue-500 to-indigo-600',
      path: '/',
      center: true // New flag for special center home button
    },
    {
      id: 'providers',
      label: 'Providers',
      icon: <SiPrdotco className="w-5 h-5" />,
      path: '/providers',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'wallet',
      label: 'Wallet',
      icon: <GiWallet className="w-5 h-5" />,
      path: '/deposit',
      color: 'from-yellow-500 to-yellow-600'
    }
  ];

  // quickActions array stays the same as before
  const quickActions = [
    {
      id: 'trending',
      label: 'Trending',
      icon: <FiCompass className="w-4 h-4" />,
      path: '/trending',
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: <FiStar className="w-4 h-4" />,
      path: '/favorites',
      color: 'from-pink-500 to-pink-600'
    },
    {
      id: 'notifications',
      label: 'Alerts',
      icon: <FiBell className="w-4 h-4" />,
      path: '/notifications',
      color: 'from-red-500 to-red-600'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <FiSettings className="w-4 h-4" />,
      path: '/settings',
      color: 'from-gray-500 to-gray-600'
    }
  ];

  const handleNavClick = (item) => {
    // If current item is center "home", do nothing special
    if (item.action) {
      item.action();
    } else if (item.path) {
      setActiveTab(item.id);
      navigate(item.path);
    }
  };

  return (
    <>
      {/* Quick Actions Menu */}
      {showQuickActions && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setShowQuickActions(false)}>
          <div className="absolute bottom-20 right-4 mb-2">
            <div className={`relative ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} 
                            rounded-2xl shadow-xl border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}
                            p-3 animate-scale-up`}>
              {/* Arrow */}
              <div className={`absolute -bottom-2 right-6 w-4 h-4 rotate-45 
                              ${theme === 'dark' ? 'bg-gray-900 border-r border-b border-gray-800' : 'bg-white border-r border-b border-gray-200'}`} />
              
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action) => (
                  <Link
                    key={action.id}
                    to={action.path}
                    onClick={() => setShowQuickActions(false)}
                    className={`flex flex-col items-center p-3  rounded-xl transition-all duration-300
                              ${theme === 'dark' 
                                ? 'hover:bg-gray-800/50 text-gray-300' 
                                : 'hover:bg-gray-100 text-gray-700'
                              }`}
                  >
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${action.color} 
                                  flex items-center justify-center mb-2`}>
                      <span className="text-white">{action.icon}</span>
                    </div>
                    <span className="text-xs font-semibold">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Mobile Footer */}
      <footer className={`
        lg:hidden fixed bottom-0 left-0 right-0 z-30 
        transition-all duration-300 border-t
        ${theme === 'dark' 
          ? 'bg-[#0d1117]/95 backdrop-blur-xl border-gray-800/50 shadow-[0_-10px_30px_rgba(0,0,0,0.3)]' 
          : 'bg-white/95 backdrop-blur-xl border-gray-200/50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]'
        }
      `}>
        
        {/* Active Indicator Glow */}
        {navItems
          .filter(item => !item.center)
          .map(item => (
            activeTab === item.id && (
              <div key={item.id} className="absolute top-0 left-[188px] transform -translate-x-1/2 w-20">
                <div className={`h-1 w-full bg-gradient-to-r ${item.color} rounded-b-full opacity-80`} />
                <div className={`h-0.5 w-full bg-gradient-to-r ${item.color} rounded-b-full blur-sm mt-0.5`} />
              </div>
            )
        ))}
        
        <div className="flex justify-around items-center px-2 py-3">
          {navItems.map((item, idx) => {
            const isActive = activeTab === item.id;
            const isCenter = !!item.center;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (isCenter) {
                    setActiveTab(item.id);
                    navigate(item.path);
                  } else {
                    handleNavClick(item);
                  }
                }}
                className={`flex flex-col items-center justify-center relative group transition-all duration-300
                          ${isCenter ? '-mt-6' : ''}`}
              >
                {/* Center Home Button */}
                {isCenter ? (
                  <div className={`
                    w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg
                    bg-gradient-to-br from-blue-600 to-indigo-600
                    ${isActive ? 'scale-110' : ''}
                    transition-all duration-300
                    hover:shadow-blue-600/30
                    active:scale-95
                  `}>
                    {/* Using Home Icon centered, white */}
                    {item.icon}
                  </div>
                ) : (
                  <>
                    {/* Regular Nav Item */}
                    <div className={`
                      p-2 rounded-xl mb-1 transition-all duration-300
                      ${isActive 
                        ? `bg-gradient-to-br ${item.color} text-white shadow-lg` 
                        : theme === 'dark'
                          ? 'text-gray-400 group-hover:text-gray-300'
                          : 'text-gray-500 group-hover:text-gray-700'
                      }
                      ${isActive ? 'scale-110' : ''}
                    `}>
                      {item.icon}
                    </div>
                    
                    {/* Label */}
                    <span className={`
                      text-[10px] font-semibold transition-all duration-300
                      ${isActive 
                        ? `font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent` 
                        : theme === 'dark'
                          ? 'text-gray-500'
                          : 'text-gray-600'
                      }
                    `}>
                      {item.label}
                    </span>
                    
                    {/* Active Indicator Dot */}
                    {isActive && (
                      <div className="absolute -top-1 right-1/2 transform translate-x-1/2">
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${item.color} animate-pulse`} />
                      </div>
                    )}
                    
                    {/* Hover Tooltip */}
                    <div className={`
                      absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 rounded-lg
                      text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100
                      transition-opacity duration-200 pointer-events-none
                      ${theme === 'dark'
                        ? 'bg-gray-800 text-gray-300 border border-gray-700'
                        : 'bg-gray-900 text-gray-100 border border-gray-800'
                      }
                    `}>
                      {item.label}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-800" />
                    </div>
                  </>
                )}
              </button>
            );
          })}
        </div>

      </footer>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes scale-up {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-scale-up {
          animation: scale-up 0.2s ease-out;
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 1;
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
          }
          50% {
            opacity: 0.8;
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.7);
          }
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};



export default MobileFooter;