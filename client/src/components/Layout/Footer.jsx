import { Link } from 'react-router-dom';
import { 
  FiFacebook, FiTwitter, FiInstagram, FiYoutube, 
  FiMessageCircle, FiShield, FiAward, FiHeart,
  FiHelpCircle, FiMail, FiMapPin, FiPhone, FiGithub,
  FiLinkedin, FiGlobe, FiLock, FiCheckCircle
} from 'react-icons/fi';
import { GiGamepad } from 'react-icons/gi';
import { useTheme } from '../../contexts/ThemeContext';

const Footer = () => {
  const { theme } = useTheme();

  const footerLinks = {
    'Gaming': [
      { label: 'Live Casino', path: '/live-casino' },
      { label: 'Slots', path: '/slots' },
      { label: 'Table Games', path: '/table-games' },
      { label: 'Tournaments', path: '/tournaments' },
      { label: 'Jackpots', path: '/jackpots' },
    ],
    'Providers': [
      { label: 'NetEnt', path: '/providers/netent' },
      { label: 'Microgaming', path: '/providers/microgaming' },
      { label: 'Play\'n GO', path: '/providers/playngo' },
      { label: 'Evolution', path: '/providers/evolution' },
      { label: 'Pragmatic Play', path: '/providers/pragmatic' },
    ],
  };

  const paymentMethods = [
    { name: 'ZillPay', logo: 'ZP', color: 'text-green-600' },
    { name: 'UPI', logo: 'UPI', color: 'text-orange-500' },
    { name: 'USDT', logo: 'USDT', color: 'text-yellow-500' },
  ];

  const certifications = [
    { icon: <FiShield />, text: 'SSL Secured', desc: '256-bit Encryption' },
    { icon: <FiLock />, text: 'Licensed', desc: 'MGA, UKGC, Curacao' },
    { icon: <FiCheckCircle />, text: 'Certified', desc: 'RNG Tested & Verified' },
    { icon: <FiAward />, text: 'Awarded', desc: 'Best Gaming Platform 2024' },
  ];

  return (
    <footer className={`
      transition-colors duration-300 border-t relative
      ${theme === 'dark' 
        ? 'bg-gradient-to-b from-[#0d1117] to-[#0a0e14] border-gray-800/50' 
        : 'bg-gradient-to-b from-white to-gray-50 border-gray-200/50'
      }
      mt-auto
    `}>
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 z-50">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand & About Column */}
          <div className="lg:col-span-2 flex flex-col space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 
                            flex items-center justify-center shadow-lg shadow-blue-500/20
                            transition-transform group-hover:scale-105">
                <GiGamepad className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tighter">
                  GAME<span className="text-blue-600">VERSE</span>
                </h2>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Premium Gaming Experience
                </p>
              </div>
            </Link>
            <p className={`leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Experience thousands of premium casino games from top providers. 
              Join our community of players for exciting tournaments, massive jackpots, 
              and a secure gaming environment.
            </p>
            {/* Certifications */}
            <div className="grid grid-cols-2 xs:grid-cols-2 gap-3">
              {certifications.map((cert, idx) => (
                <div key={idx} className={`
                  flex items-center gap-3 p-3 rounded-xl
                  ${theme === 'dark' 
                    ? 'bg-gray-800/30 hover:bg-gray-800/50' 
                    : 'bg-gray-100/50 hover:bg-gray-200/50'
                  }
                  transition-colors
                `}>
                  <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                    <span className={`text-lg ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                      {cert.icon}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {cert.text}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {cert.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Links Columns: stack vertically on small, horizontally from md+ */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-4">
              <h3 className={`
                text-sm font-bold uppercase tracking-wider mb-4 
                ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}
              `}>
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className={`
                        flex items-center gap-2 text-sm transition-all duration-300 group
                        ${theme === 'dark'
                          ? 'text-gray-400 hover:text-blue-400'
                          : 'text-gray-600 hover:text-blue-600'
                        }
                        hover:translate-x-1
                      `}
                    >
                      <div className={`w-1 h-1 rounded-full opacity-0 group-hover:opacity-100
                                   ${theme === 'dark' ? 'bg-blue-400' : 'bg-blue-600'} 
                                   transition-opacity`} />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Live Support & Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
          {/* Live Support */}
          <div className={`
            p-6 rounded-2xl border transition-colors duration-300
            ${theme === 'dark'
              ? 'bg-gray-800/30 border-gray-800/50'
              : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100'
            }
          `}>
            <div className="flex flex-col xs:flex-row items-start gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg
                            bg-gradient-to-br from-blue-600 to-indigo-600 flex-shrink-0`}>
                <FiMessageCircle className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h4 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  24/7 Live Support
                </h4>
                <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Get instant help from our expert support team anytime, anywhere.
                </p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                  <button className={`px-5 py-2.5 font-bold rounded-lg transition-all duration-300
                                   bg-gradient-to-br from-blue-600 to-indigo-600 
                                   hover:from-blue-700 hover:to-indigo-700 
                                   text-white shadow-lg hover:shadow-blue-600/20
                                   active:scale-95`}>
                    Start Live Chat
                  </button>
                  <button className={`px-5 py-2.5 font-bold rounded-lg transition-all duration-300
                                   ${theme === 'dark'
                                     ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                     : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                                   }
                                   active:scale-95`}>
                    Call Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className={`
        border-t py-6 ${theme === 'dark' ? 'border-gray-800/50' : 'border-gray-200/50'}
        ${theme === 'dark' ? 'bg-[#0a0e14]' : 'bg-gray-50'}
      `}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            {/* Payment Methods */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full md:w-auto">
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Accepted Payments:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {paymentMethods.map((method) => (
                  <span key={method.name} className={`
                    flex items-center justify-center w-10 h-6 rounded text-xs font-bold
                    ${method.color}
                    ${theme === 'dark' 
                      ? 'bg-gray-800/50 border border-gray-700' 
                      : 'bg-white border border-gray-200'
                    }
                    shadow-sm
                  `}>
                    {method.logo}
                  </span>
                ))}
              </div>
            </div>
            {/* Copyright & Legal */}
            <div className="text-center md:text-right flex-1 space-y-1">
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                © {new Date().getFullYear()} GameVerse. All rights reserved.
              </p>
              <div className="flex flex-wrap justify-center md:justify-end gap-3 sm:gap-4 text-xs">
                <Link 
                  to="/terms" 
                  className={`${theme === 'dark' ? 'text-gray-500 hover:text-gray-400' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Terms of Service
                </Link>
                <Link 
                  to="/privacy" 
                  className={`${theme === 'dark' ? 'text-gray-500 hover:text-gray-400' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Privacy Policy
                </Link>
                <Link 
                  to="/cookies" 
                  className={`${theme === 'dark' ? 'text-gray-500 hover:text-gray-400' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Cookie Policy
                </Link>
                <Link 
                  to="/responsible" 
                  className={`${theme === 'dark' ? 'text-gray-500 hover:text-gray-400' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Responsible Gaming
                </Link>
              </div>
              <p className="text-xs mt-2 opacity-75 text-gray-500 dark:text-gray-400">
                18+ only. Gambling can be addictive. Please play responsibly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;