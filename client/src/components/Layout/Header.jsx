import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiUser, FiBell, FiShoppingCart,
  FiMenu, FiSun, FiMoon, FiChevronDown,
  FiHome, FiGrid, FiLogOut, FiCreditCard,
  FiTrendingUp, FiStar, FiHeart, FiSettings,
  FiShield, FiHelpCircle, FiX, FiEye,
  FiTrash2, FiPackage, FiCheck,
  FiFileText
} from 'react-icons/fi';
import { GiCricketBat, GiGamepad, GiWallet } from 'react-icons/gi';
import { SiPrdotco } from 'react-icons/si';
import { MdOutlineAccountCircle } from 'react-icons/md';
import { useTheme } from '../../contexts/ThemeContext';
import { useSelector, useDispatch } from 'react-redux';
import { getCartProviders } from '../../reducer/providerSlice';
import { getUserInfo, userLogout } from '../../reducer/authSlice';
import { toast } from 'react-hot-toast';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user, loading, isFetched } = useSelector((state) => state.auth);
  const { cartProviders } = useSelector((state) => state.providers);

  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    if (!isFetched && !loading) dispatch(getUserInfo());
  }, [dispatch, isFetched, loading]);

  useEffect(() => {
    if (user) dispatch(getCartProviders());
  }, [dispatch, user]);

  // ✅ Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ✅ Close popups on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  // ✅ Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) setUserMenuOpen(false);
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) setMobileMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // ✅ Handle escape key
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, []);

  // ✅ Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ✅ Navigation items
  const mainNavItems = [
    { path: '/home', label: 'Home', icon: <FiHome className="w-4 h-4 md:w-4 md:h-4 lg:w-[18px] lg:h-[18px]" /> },
    
    { path: '/providers', label: 'Providers', icon: <SiPrdotco className="w-4 h-4 md:w-4 md:h-4 lg:w-[18px] lg:h-[18px]" /> },
    { path: '/games', label: 'Games', icon: <GiGamepad className="w-4 h-4 md:w-4 md:h-4 lg:w-[18px] lg:h-[18px]" /> },
    { path: '/cricket', label: 'Cricket', icon: <GiCricketBat className="w-4 h-4 md:w-4 md:h-4 lg:w-[18px] lg:h-[18px]" /> },
    { path: '/docs', label: 'Docs', icon: <FiFileText className="w-4 h-4 md:w-4 md:h-4 lg:w-[18px] lg:h-[18px]" /> },
 
  ];

  const userMenu = [
    { label: 'Profile', path: '/profile', icon: <FiUser className="w-4 h-4" /> },
    { label: 'Deposit', path: '/deposit', icon: <GiWallet className="w-4 h-4" /> },
    // { label: 'Settings', path: '/settings', icon: <FiSettings className="w-4 h-4" /> },
    // { label: 'Help', path: '/help', icon: <FiHelpCircle className="w-4 h-4" /> },
  ];

  const isActive = (path) => location.pathname === path;

  // ✅ Theme colors
  const themeColors = {
    dark: {
      bg: '#0d1117',
      text: '#ffffff',
      secondaryText: '#cbd5e1',
      border: '#1e293b',
      hover: '#1e293b',
      primary: '#3b82f6',
      gradient: 'from-blue-600 to-indigo-600'
    },
    light: {
      bg: '#ffffff',
      text: '#1e293b',
      secondaryText: '#64748b',
      border: '#e2e8f0',
      hover: '#f1f5f9',
      primary: '#3b82f6',
      gradient: 'from-blue-600 to-indigo-600'
    }
  };

  const colors = themeColors[theme];

  // ✅ Cart calculations
  const cartItems = cartProviders || [];
  const cartTotalItems = cartItems.length;



  // ✅ Handle logout
  const handleLogout = () => {
    dispatch(userLogout());
    // dispatch(getUserInfo());
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // ✅ Navigate to login
  const handleLoginClick = () => {
    setMobileMenuOpen(false);
    navigate('/login');
  };

  // ✅ Navigate to register
  const handleRegisterClick = () => {
    setMobileMenuOpen(false);
    navigate('/register');
  };

  return (
    <>
      <header
        className={`
          fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${scrolled
            ? theme === 'dark'
              ? 'bg-gray-900/95 backdrop-blur-xl shadow-lg shadow-black/20'
              : 'bg-white/95 backdrop-blur-xl shadow-lg shadow-gray-200/50'
            : theme === 'dark'
              ? 'bg-gray-900/90 backdrop-blur-md'
              : 'bg-white/90 backdrop-blur-md'
          }
        `}
      >
        <div className="container mx-auto px-2 xs:px-3 sm:px-4">
          <div className="flex items-center justify-between h-14 md:h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
              <div
                className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center shadow-lg
                  bg-gradient-to-br ${colors.gradient} transition-transform group-hover:scale-110
                  ${theme === 'dark' ? 'shadow-blue-500/20' : 'shadow-blue-500/30'}`}
              >
                <GiGamepad className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg md:text-xl font-black tracking-tighter leading-tight">
                  GAME<span className="text-blue-600">VERSE</span>
                </h1>
                <span className={`text-[9px] md:text-[10px] font-medium ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                  Premium Gaming
                </span>
              </div>
            </Link>

            {/* Desktop Navigation - Show for all users */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {mainNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-1.5 px-3 py-2.5 md:px-4 md:py-3 rounded-xl transition-all duration-300
                    text-xs md:text-sm font-semibold group relative
                    ${isActive(item.path)
                      ? `bg-gradient-to-br ${colors.gradient} text-white shadow-lg`
                      : theme === 'dark'
                        ? 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                    }
                  `}
                >
                  <span className={`transition-transform ${isActive(item.path) ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {item.icon}
                  </span>
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-1 md:gap-2">
           
              <div className="relative">
                <Link
                   to="/cart"
                  className={`p-2 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 relative
                    ${theme === 'dark' ? 'hover:bg-gray-800/50' : 'hover:bg-gray-100/50'}`}
                  aria-label="Shopping Cart"
                >
                  <FiShoppingCart className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                  {user && cartTotalItems > 0 && (
                    <span className="absolute top-5 -right-5 w-4 h-4 rounded-full flex items-center justify-center
                      text-[10px] font-bold bg-gradient-to-br from-red-500 to-pink-500 text-white">
                      {cartTotalItems > 9 ? '9+' : cartTotalItems}
                    </span>
                  )}
                </Link>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95
                  ${theme === 'dark' ? 'hover:bg-gray-800/50' : 'hover:bg-gray-100/50'}`}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <FiSun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <FiMoon className="w-5 h-5 text-blue-600" />
                )}
              </button>

              {/* User Menu - Show different content based on auth */}
              <div className="relative" ref={userMenuRef}>
                {user ? (
                  // Authenticated User View
                  <button
                    onClick={() => {
                      setUserMenuOpen(!userMenuOpen);
                    }}
                    className={`flex items-center gap-2 p-1.5 md:p-2 rounded-xl transition-all duration-300
                      hover:scale-105 active:scale-95 group
                      ${theme === 'dark' ? 'hover:bg-gray-800/50' : 'hover:bg-gray-100/50'}`}
                  >
                    <div className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center shadow-lg
                      overflow-hidden bg-gradient-to-br ${colors.gradient}`}>
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <FiUser className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      )}
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[100px]">
                        {user?.name || 'User'}
                      </p>
                      <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 truncate max-w-[100px]">
                        {user?.tier || 'Member'}
                      </p>
                    </div>
                    <FiChevronDown className={`hidden lg:block transition-transform duration-300
                      ${userMenuOpen ? 'rotate-180' : ''} text-gray-500`} />
                  </button>
                ) : (
                  // Non-authenticated User View - Login/Register buttons
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleLoginClick}
                      className={`hidden sm:block px-4 py-2 text-sm font-semibold rounded-lg
                        ${theme === 'dark'
                          ? 'bg-gray-800 hover:bg-gray-700 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                        } transition-all hover:scale-105 active:scale-95`}
                    >
                      Login
                    </button>
                  </div>
                )}

                {/* User Dropdown Menu - Only for authenticated users */}
                {user && userMenuOpen && (
                  <div className={`absolute right-0 top-12 w-60 md:w-64 rounded-2xl shadow-2xl py-2 z-50
                    animate-scaleUp border backdrop-blur-xl
                    ${theme === 'dark'
                      ? 'bg-gray-900/95 border-gray-800/50'
                      : 'bg-white/95 border-gray-200/50'
                    }`}
                  >
                    <div className="px-4 py-3 border-b border-gray-200/50 dark:border-gray-800/50">
                      <p className="font-bold text-gray-900 dark:text-white truncate">
                        {user?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {user?.email || 'user@example.com'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-0.5 text-xs rounded-full bg-gradient-to-r ${colors.gradient}
                          text-white font-medium`}>
                          {user?.tier || 'Member'}
                        </span>
                        <span className="text-xs text-gray-500">
                          Balance: ₹{user?.balance?.toLocaleString() || '0'}
                        </span>
                      </div>
                    </div>
                    
                    {userMenu.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 
                          transition-all group
                          ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <span className={`p-1.5 rounded-lg bg-gradient-to-br ${colors.gradient}`}>
                          {React.cloneElement(item.icon, { className: "w-4 h-4 text-white" })}
                        </span>
                        <span className="text-sm font-medium flex-1">{item.label}</span>
                      </Link>
                    ))}
                    
                    <div className="border-t border-gray-200/50 dark:border-gray-800/50 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className={`flex items-center gap-3 w-full px-4 py-3 text-left 
                          hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all group
                          ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}
                      >
                        <span className="p-1.5 rounded-lg bg-gradient-to-br from-red-500 to-red-600">
                          <FiLogOut className="w-4 h-4 text-white" />
                        </span>
                        <span className="text-sm font-medium flex-1">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => {
                  setMobileMenuOpen(!mobileMenuOpen);
                  setUserMenuOpen(false);
                }}
                className="lg:hidden p-2 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
                aria-label="Menu"
              >
                {mobileMenuOpen ? (
                  <FiX className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                ) : (
                  <FiMenu className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className={`lg:hidden fixed inset-y-0 right-0 w-full max-w-sm z-50 transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className={`relative h-full w-full shadow-2xl overflow-y-auto
          ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}
        >
          {/* Mobile Menu Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-800/50
            ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${colors.gradient}`}>
                <GiGamepad className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold">GAMEVERSE</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Menu Content */}
          <div className="p-4">
            {user ? (
              /* Authenticated User View */
              <>
                {/* User Profile Section */}
                <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center
                    bg-gradient-to-br ${colors.gradient}`}>
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <FiUser className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                </div>

                {/* Balance Card */}
                <div className={`p-4 rounded-xl mb-6 bg-gradient-to-br ${colors.gradient}`}>
                  <p className="text-xs text-white/80 mb-1">Available Balance</p>
                  <p className="text-2xl font-bold text-white mb-3">
                  ₹{user?.balance?.toLocaleString() || '1,234.56'}
                  </p>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 px-3 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded-lg transition">
                      Deposit
                    </button>
                 
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2 px-2">Main Menu</h4>
                    <div className="space-y-1">
                      {mainNavItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`flex items-center gap-3 p-3 rounded-lg transition
                            ${isActive(item.path)
                              ? `bg-gradient-to-br ${colors.gradient} text-white`
                              : theme === 'dark'
                                ? 'text-gray-300 hover:bg-gray-800'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <span className="text-lg">{item.icon}</span>
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2 px-2">Account</h4>
                    <div className="space-y-1">
                      {userMenu.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`flex items-center gap-3 p-3 rounded-lg transition
                            ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <span className="text-lg">{item.icon}</span>
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full mt-6 flex items-center justify-center gap-2 p-3 bg-red-500/10 hover:bg-red-500/20 
                    text-red-600 dark:text-red-400 font-semibold rounded-lg transition"
                >
                  <FiLogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </>
            ) : (
              /* Non-authenticated User View */
              <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4
                  bg-gradient-to-br ${colors.gradient}`}>
                  <FiUser className="w-10 h-10 text-white" />
                </div>
                
                <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Welcome to GameVerse
                </h3>
                
                <p className={`text-sm text-center mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Please login or create an account to access all features
                </p>
                
                <div className="w-full space-y-3">
                  <button
                    onClick={handleLoginClick}
                    className="w-full py-3 px-4 bg-gradient-to-br from-blue-600 to-indigo-600 
                      hover:from-blue-700 hover:to-indigo-700 text-white font-semibold 
                      rounded-xl transition-all active:scale-95"
                  >
                    Login
                  </button>
                  
                  <button
                    onClick={handleRegisterClick}
                    className="w-full py-3 px-4 border-2 border-blue-600 text-blue-600 
                      hover:bg-blue-50 dark:hover:bg-blue-950/30 font-semibold 
                      rounded-xl transition-all active:scale-95"
                  >
                    Create Account
                  </button>
                </div>

                <div className="mt-8 text-center">
                  <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Browse as guest
                  </p>
                  {mainNavItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`block py-2 text-sm ${theme === 'dark' 
                        ? 'text-gray-400 hover:text-white' 
                        : 'text-gray-600 hover:text-gray-900'}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-gradient-to-r from-blue-500 to-indigo-500 animate-loading" />
      )}
    </>
  );
};

export default Header;