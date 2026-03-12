// Layout.jsx - Modern responsive layout (FIXED FOOTER ISSUE)

import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import MobileFooter from './MobileFooter';
import { useTheme } from '../../contexts/ThemeContext';

const Layout = () => {
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      // desktop par sidebar hamesha open
      if (!mobile) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div
      className={`
        min-h-screen flex flex-col transition-colors duration-300
        ${
          theme === 'dark'
            ? 'bg-[#0a0e14] text-gray-100'
            : 'bg-gradient-to-b from-gray-50 to-blue-50/30 text-gray-900'
        }
      `}
    >
      {/* Header */}
      <Header onMenuClick={() => setSidebarOpen(true)} />

      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 bottom-0 w-64 z-30 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${
            theme === 'dark'
              ? 'bg-[#0d1117]/95 backdrop-blur-xl border-r border-gray-800/50'
              : 'bg-white/95 backdrop-blur-xl border-r border-gray-200/50'
          }
        `}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main Content */}
      <main
        className={`
          flex-1 relative transition-all duration-300
          ${!isMobile ? 'lg:ml-64' : ''}
          pt-16 md:pt-20
          pb-10 lg:pb-0
        `}
      >
        <div className=" ">
          <Outlet />
        </div>
      </main>

      {/* Desktop Footer (SHIFTED RIGHT, NOT COVERED BY SIDEBAR) */}
      <footer className={`${!isMobile ? 'lg:ml-64' : ''} relative z-10`}>
        <Footer />
      </footer>

      {/* Mobile Fixed Footer */}
      {isMobile && <MobileFooter />}
    </div>
  );
};

export default Layout;
