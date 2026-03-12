
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, FiGrid, FiTrendingUp, FiStar, FiUser, 
  FiShoppingCart, FiCreditCard, FiHeart, FiSettings, 
  FiLogOut, FiShield, FiHelpCircle, FiPackage,
  FiDollarSign, FiBarChart2, FiUsers
} from 'react-icons/fi';
import { GiGamepad, GiWallet } from 'react-icons/gi';
import { SiPrdotco } from 'react-icons/si';
import { MdOutlineAccountCircle } from 'react-icons/md';
import { useTheme } from '../../contexts/ThemeContext';
import { useSelector } from 'react-redux';

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const { theme, colors } = useTheme();

  const menuSections = [
    {
      title: 'Main Menu',
      items: [
        { icon: <FiHome />, label: 'Home', path: '/home' },
        { icon: <SiPrdotco />, label: 'Providers', path: '/providers' },
        { icon: <FiGrid />, label: 'All Games', path: '/games' },
        { icon: <FiUsers />, label: 'Profile', path: '/profile' },
        { icon: <FiUsers />, label: 'Deposit', path: '/deposit' },
        { icon: <FiUsers />, label: 'Deposit History', path: '/deposit-history ' },
        { icon: <FiUsers />, label: 'Bet History', path: '/bet-history' },

      ]
    },

    {
      title: 'Provider Details',
      items: [
        { icon: <MdOutlineAccountCircle />, label: 'Provider Acc', path: '/accessproviders' },

        { icon: <FiCreditCard />, label: 'Cart', path: '/cart' },

        {
          icon: <FiShoppingCart />,
          label: "Checkout",
          path: "/checkout"
        }
      ]
    }
  ];

  const quickStats = [
    { label: 'Games', value: '2,458', change: '+124', icon: <GiGamepad />, color: 'text-blue-500' },
    { label: 'Providers', value: '87', change: '+3', icon: <SiPrdotco />, color: 'text-purple-500' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`
      fixed left-0 top-0 bottom-0 w-64 hidden lg:flex flex-col z-30
      transition-all duration-300
      ${theme === 'dark' 
        ? 'bg-[#0d1117]/95 border-r border-gray-800/50' 
        : 'bg-white/95 border-r border-gray-200/50'
      }
      backdrop-blur-xl
    `}>

      {/* Sidebar Header/Logo Area */}
      <div className="p-6 flex flex-col h-full">
        <Link to="/" className="flex items-center gap-3 mb-8 group flex-shrink-0">
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center shadow-lg
            bg-gradient-to-br from-blue-600 to-indigo-600
            transition-transform duration-300 group-hover:scale-105
            ${theme === 'dark' ? 'shadow-blue-500/20' : 'shadow-blue-500/30'}
          `}>
            <GiGamepad className="text-white text-2xl" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tighter leading-tight">
              GAME<span className="text-blue-600">VERSE</span>
            </h1>
            <span className={`text-xs font-medium ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
              Premium Gaming
            </span>
          </div>
        </Link>

        {/* Quick Stats */}
        <div className="mb-6 space-y-3 flex-shrink-0">
          {quickStats.map((stat, idx) => (
            <div key={idx} className={`
              flex items-center justify-between p-3 rounded-xl
              ${theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-50/50'}
              hover:bg-gray-100/30 dark:hover:bg-gray-800/50 transition-colors
            `}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                  <span className={`text-lg ${stat.color}`}>
                    {stat.icon}
                  </span>
                </div>
                <div>
                  <p className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {stat.label}
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full
                ${stat.change.startsWith('+') 
                  ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                  : 'bg-red-500/10 text-red-600 dark:text-red-400'
                }`}>
                {stat.change}
              </span>
            </div>
          ))}
        </div>

        {/* Navigation with scroll */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-6 space-y-8 scroll-hide">
          {menuSections.map((section, idx) => (
            <div key={idx}>
              <h4 className="px-4 text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-3">
                {section.title}
              </h4>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`
                        flex items-center px-4 py-3 rounded-xl transition-all duration-300 group relative
                        ${active 
                          ? `bg-gradient-to-br from-blue-600 to-indigo-600 text-white 
                             shadow-lg shadow-blue-600/20` 
                          : theme === 'dark' 
                            ? 'text-gray-400 hover:bg-gray-800/50 hover:text-white' 
                            : 'text-gray-600 hover:bg-gray-100/50 hover:text-gray-900'
                        }
                        hover:scale-[1.02] active:scale-95
                      `}
                    >
                      <span className={`
                        text-lg mr-3 transition-transform duration-300 group-hover:scale-110
                        ${active ? 'text-white' : 'text-blue-500'}
                      `}>
                        {item.icon}
                      </span>
                      <span className="font-semibold text-sm">{item.label}</span>
                      
                      {/* Active indicator */}
                      {active && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <div className="w-2 h-2 rounded-full bg-white/80 animate-pulse" />
                        </div>
                      )}
                      
                      {/* Hover arrow */}
                      <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className={`w-5 h-5 transform rotate-45 
                          ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {/* Wallet Widget - Show Only If User Logged In */}
        {user && (
          <div
            className={`
              p-4 rounded-2xl mt-4 relative overflow-hidden flex-shrink-0
              ${theme === "dark"
                ? "bg-gradient-to-br from-gray-800/50 to-gray-900/50"
                : "bg-gradient-to-br from-blue-50 to-indigo-50"
              }
              border ${theme === "dark" ? "border-gray-800/50" : "border-blue-100"}
            `}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full -translate-y-8 translate-x-8" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase font-bold text-gray-500">
                  Available Balance
                </span>
                <GiWallet className="text-blue-500 dark:text-blue-400 text-lg" />
              </div>

              <div className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
                ₹{user?.balance || "0.00"}
              </div>

              <Link
                to="/deposit"
                className="block w-full text-center py-2.5 text-sm font-semibold
                bg-gradient-to-r from-blue-600 to-indigo-600
                hover:from-blue-700 hover:to-indigo-700
                text-white rounded-lg transition-all duration-300
                hover:shadow-lg hover:shadow-blue-600/30 active:scale-95"
              >
                Top Up
              </Link>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;