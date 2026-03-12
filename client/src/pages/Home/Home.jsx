import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiPackage, FiTrendingUp, FiPlay, FiClock,
  FiChevronLeft, FiChevronRight, FiCheck, FiShield, FiUsers,
  FiStar, FiAward, FiGlobe, FiZap, FiDollarSign,
  FiBriefcase, FiHeart, FiThumbsUp
} from 'react-icons/fi';
import { 
  GiGamepad, GiTrophy, GiCrown, GiCash,
  GiLaurels, GiRocket,  GiSwordsPower,
  GiHealthIncrease, GiChart, GiBattleGear,
  GiDiamondHard
} from 'react-icons/gi';
import { SiPrdotco, SiTrustpilot, SiGoogle } from 'react-icons/si';
import { useTheme } from '../../contexts/ThemeContext';
import { useSelector, useDispatch } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Providers from './Providers';
import { 
  getAllProviders, 
} from '../../reducer/providerSlice';
import GameSlider from '../../components/UI/Gameslider';

const Home = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user } = useSelector((state) => state.auth);
  
  const [activeBanner, setActiveBanner] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    dispatch(getAllProviders());
  }, [dispatch]);

  const themeColors = {
    dark: {
      bg: 'bg-[#0d1117]',
      text: 'text-white',
      secondaryText: 'text-gray-300',
      mutedText: 'text-gray-400',
      border: 'border-gray-800',
      cardBg: 'bg-gray-900/50',
      cardHover: 'bg-gray-800/70',
      backdrop: 'backdrop-blur-xl',
      gradient: 'from-blue-900/30 to-purple-900/30',
      gradientLight: 'from-blue-500/10 to-purple-500/10',
      iconBg: 'bg-gray-800',
      shadow: 'shadow-[0_8px_30px_rgb(0,0,0,0.12)]'
    },
    light: {
      bg: 'bg-white',
      text: 'text-gray-900',
      secondaryText: 'text-gray-700',
      mutedText: 'text-gray-600',
      border: 'border-gray-200',
      cardBg: 'bg-gray-50/50',
      cardHover: 'bg-white',
      backdrop: 'backdrop-blur-xl',
      gradient: 'from-blue-50 to-purple-50',
      gradientLight: 'from-blue-100/50 to-purple-100/50',
      iconBg: 'bg-gray-100',
      shadow: 'shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
    }
  };

  const colors = themeColors[theme];
  const containerBg = theme === 'dark'
    ? 'bg-gradient-to-b from-gray-900 via-gray-900 to-black'
    : 'bg-gradient-to-b from-gray-50 via-white to-white';

  const banners = [
    {
      id: 1,
      title: "PREMIUM PROVIDER MARKETPLACE",
      subtitle: "Buy & License Top Game Providers",
      description: "Access 50+ premium game providers with complete licensing rights. Expand your platform instantly.",
      // image: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?q=80&w=2000",
      gradient: theme === 'dark' ? 'from-blue-600/30 to-purple-600/30' : 'from-blue-600/70 to-purple-600/70',
      cta: "Explore Providers",
      badge: "HOT DEAL",
      badgeColor: "bg-gradient-to-r from-red-500 to-pink-500"
    },
    {
      id: 2,
      title: "LIMITED TIME OFFER",
      subtitle: "Get 3 Providers for Price of 2",
      description: "Special bundle deal on top gaming providers. Offer ends soon!",
      // image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2000",
      gradient: theme === 'dark' ? 'from-purple-600/30 to-pink-600/30' : 'from-purple-600/70 to-pink-600/70',
      cta: "View Bundle",
      badge: "40% OFF",
      badgeColor: "bg-gradient-to-r from-green-500 to-emerald-500"
    },
    {
      id: 3,
      title: "NEW PROVIDERS ADDED",
      subtitle: "Latest Game Developers",
      description: "Fresh content from emerging providers. Be the first to license.",
      // image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?q=80&w=2000",
      gradient: theme === 'dark' ? 'from-orange-600/30 to-yellow-600/30' : 'from-orange-600/70 to-yellow-600/70',
      cta: "Discover New",
      badge: "NEW",
      badgeColor: "bg-gradient-to-r from-blue-500 to-indigo-500"
    }
  ];

  

  const features = [
    {
      icon: <FiShield className="w-6 h-6 md:w-8 md:h-8" />,
      title: "Secure Licensing",
      description: "100% legal licensing with proper documentation",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: <FiClock className="w-6 h-6 md:w-8 md:h-8" />,
      title: "Instant Access",
      description: "Get provider access immediately after purchase",
      color: "text-green-400",
      bgColor: "bg-green-500/10"
    },
    {
      icon: <FiCheck className="w-6 h-6 md:w-8 md:h-8" />,
      title: "Quality Guaranteed",
      description: "All providers thoroughly vetted and tested",
      color: "text-purple-400",
      bgColor: "bg-purple-500/10"
    },
    {
      icon: <FiUsers className="w-6 h-6 md:w-8 md:h-8" />,
      title: "24/7 Support",
      description: "Dedicated support team for all clients",
      color: "text-orange-400",
      bgColor: "bg-orange-500/10"
    }
  ];

  const premiumFeatures = [
    {
      icon: <GiCrown className="w-8 h-8 md:w-10 md:h-10" />,
      title: "VIP Provider Access",
      description: "Exclusive access to top-tier gaming providers",
      gradient: "from-yellow-400 to-amber-600"
    },
    {
      icon: <GiRocket className="w-8 h-8 md:w-10 md:h-10" />,
      title: "Fast Integration",
      description: "Quick and seamless API integration process",
      gradient: "from-blue-400 to-indigo-600"
    },
    {
      icon: <GiDiamondHard className="w-8 h-8 md:w-10 md:h-10" />,
      title: "Premium Support",
      description: "Dedicated account manager & priority support",
      gradient: "from-purple-400 to-pink-600"
    },
    {
      icon: <GiChart className="w-8 h-8 md:w-10 md:h-10" />,
      title: "Analytics Dashboard",
      description: "Real-time performance tracking & insights",
      gradient: "from-green-400 to-teal-600"
    }
  ];

  const testimonials = [
    {
      name: "John Anderson",
      role: "CEO, GameHub",
      content: "This marketplace transformed our platform. We added 20+ providers in just one week!",
      rating: 5,
      avatar: "https://i.pravatar.cc/150?img=1",
      company: "GameHub"
    },
    {
      name: "Sarah Chen",
      role: "Product Manager, PlayTech",
      content: "Excellent quality providers and outstanding support. Highly recommended!",
      rating: 5,
      avatar: "https://i.pravatar.cc/150?img=2",
      company: "PlayTech"
    },
    {
      name: "Michael Roberts",
      role: "Founder, CasinoPro",
      content: "The licensing process was smooth and the providers are top-notch. 10/10 experience.",
      rating: 5,
      avatar: "https://i.pravatar.cc/150?img=3",
      company: "CasinoPro"
    },
    {
      name: "Emma Watson",
      role: "CTO, Gaming Solutions",
      content: "Best investment we made this year. The variety of providers is incredible.",
      rating: 5,
      avatar: "https://i.pravatar.cc/150?img=4",
      company: "Gaming Solutions"
    }
  ];
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

 



  return (
    <div className={`space-y-6 md:space-y-10 animate-fade-in px-4 sm:px-6 lg:px-8 min-h-screen ${containerBg} pt-5 relative`}>
      <ToastContainer />
      
      {/* Loading State */}
      {/* {loading && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <GiGamepad className="w-6 h-6 text-blue-500 animate-pulse" />
            </div>
          </div>
        </div>
      )} */}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className={`fixed bottom-6 right-6 z-50 p-3 rounded-full ${colors.cardBg} border ${colors.border} ${colors.backdrop} shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95`}
        >
          <FiChevronLeft className={`w-5 h-5 rotate-90 ${colors.text}`} />
        </button>
      )}

      {/* Hero Banner with Enhanced Design */}
      <div className="relative rounded-2xl overflow-hidden group">
        <div className="relative h-[350px] sm:h-[400px] md:h-[450px] lg:h-[500px]">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-all duration-1000 ${
                index === activeBanner ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
            >
              {banner.image && (
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-10000"
                  style={{ backgroundImage: `url(${banner.image})` }}
                />
              )}
              <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient}`} />
              
              <div className="relative h-full flex items-center">
                <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
                  <div className="max-w-2xl animate-slide-up">
                    {/* Badge */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`px-4 py-1.5 text-xs font-bold rounded-full ${banner.badgeColor} text-white shadow-lg animate-pulse`}>
                        {banner.badge}
                      </span>
                      <span className="text-white/90 text-sm font-medium backdrop-blur-sm px-3 py-1 rounded-full bg-white/10">
                        Limited Time Offer
                      </span>
                    </div>
                    
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 leading-tight drop-shadow-lg">
                      {banner.title}
                    </h1>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white/95 mb-3 drop-shadow">
                      {banner.subtitle}
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-white/90 mb-6 max-w-lg drop-shadow">
                      {banner.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-3">
                      <button 
                        onClick={() => navigate('/providers')}
                        className="px-6 py-2.5 sm:px-8 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:shadow-2xl hover:shadow-blue-600/40 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 group"
                      >
                        {banner.cta}
                        <FiChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                      <button 
                        onClick={() => navigate('/contact')}
                        className="px-6 py-2.5 sm:px-8 sm:py-3 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-bold rounded-lg hover:bg-white/20 transition-all duration-300"
                      >
                        Contact Sales
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Enhanced Navigation */}
          <button
            onClick={() => setActiveBanner(prev => (prev - 1 + banners.length) % banners.length)}
            className={`absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-black/40 transition-all duration-300 hover:scale-110 active:scale-95 ${
              isMobile ? 'hidden' : ''
            }`}
          >
            <FiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={() => setActiveBanner(prev => (prev + 1) % banners.length)}
            className={`absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-black/40 transition-all duration-300 hover:scale-110 active:scale-95 ${
              isMobile ? 'hidden' : ''
            }`}
          >
            <FiChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          
          {/* Enhanced Dots */}
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveBanner(index)}
                className={`transition-all duration-300 ${
                  index === activeBanner 
                    ? 'w-6 sm:w-8 h-2 sm:h-2.5 bg-white shadow-lg' 
                    : 'w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white/50 hover:bg-white/80'
                } rounded-full`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Providers Section */}
      <Providers />

      {/* Game Sliders Section */}
      <div className="space-y-8 sm:space-y-10">
        <GameSlider />
        {/* <ProviderGameSliders /> */}
      </div>

      

      {/* Premium Features Section */}
      <div className={`p-6 sm:p-8 md:p-10 rounded-xl sm:rounded-2xl ${colors.cardBg} border ${colors.border} relative overflow-hidden group`}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative">
          <div className="text-center mb-8 sm:mb-10">
            <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500/20 to-purple-500/20 ${colors.text} mb-3`}>
              PREMIUM FEATURES
            </span>
            <h2 className={`text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 ${colors.text}`}>
              Enterprise-Grade Solutions
            </h2>
            <p className={`text-base sm:text-lg ${colors.secondaryText} max-w-2xl mx-auto`}>
              Everything you need to scale your gaming platform to the next level
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {premiumFeatures.map((feature, idx) => (
              <div
                key={idx}
                className={`group/feature relative p-6 sm:p-8 rounded-xl border ${colors.border} ${colors.cardBg} hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover/feature:opacity-10 transition-opacity duration-500`} />
                
                <div className="relative">
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} p-3 mb-4 transform group-hover/feature:scale-110 transition-transform duration-300`}>
                    <div className="w-full h-full text-white">
                      {feature.icon}
                    </div>
                  </div>
                  
                  <h3 className={`text-base sm:text-lg font-bold mb-2 ${colors.text}`}>
                    {feature.title}
                  </h3>
                  <p className={`text-xs sm:text-sm ${colors.mutedText}`}>
                    {feature.description}
                  </p>
                  
                  <div className="mt-4 flex items-center text-xs font-medium text-blue-500 opacity-0 group-hover/feature:opacity-100 transition-opacity duration-300">
                    Learn more
                    <FiChevronRight className="w-3 h-3 ml-1 group-hover/feature:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      


      {/* Enhanced Features Section */}
      <div className={`p-6 sm:p-8 md:p-10 rounded-xl sm:rounded-2xl ${colors.cardBg} ${colors.border} border ${colors.backdrop}`}>
        <div className="text-center mb-8 sm:mb-10">
          <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500/20 to-purple-500/20 ${colors.text} mb-3`}>
            WHY CHOOSE US
          </span>
          <h2 className={`text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 ${colors.text}`}>
            Trusted by Industry Leaders
          </h2>
          <p className={`text-base sm:text-lg ${colors.secondaryText}`}>
            Everything you need to build and grow your gaming platform
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={`group p-6 sm:p-8 rounded-xl border transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${colors.border} ${colors.cardBg} hover:shadow-xl relative overflow-hidden`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color.replace('text', 'from')}/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <span className={`${feature.color} text-lg sm:text-xl md:text-2xl`}>
                    {feature.icon}
                  </span>
                </div>
                
                <h3 className={`text-base sm:text-lg font-bold mb-2 ${colors.text}`}>
                  {feature.title}
                </h3>
                <p className={`text-xs sm:text-sm ${colors.mutedText}`}>
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      

      {/* Enhanced CTA Section */}
      <div className={`relative overflow-hidden rounded-xl sm:rounded-2xl p-8 sm:p-10 md:p-16 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-blue-900/30 via-indigo-900/30 to-purple-900/30 border border-blue-800/30'
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-100'
      }`}>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000')] bg-cover bg-center opacity-5" />
        
        <div className="relative z-10 text-center">
          <div className="inline-block p-3 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 mb-6 animate-bounce">
            <GiCrown className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          
          <h2 className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4 ${colors.text}`}>
            Ready to Scale Your Gaming Platform?
          </h2>
          
          <p className={`text-base sm:text-lg md:text-xl mb-8 max-w-2xl mx-auto ${colors.secondaryText}`}>
            Join the elite group of platform owners who trust our premium providers.
            Get started today and transform your business.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/providers')}
              className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:shadow-2xl hover:shadow-blue-600/40 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group"
            >
              Start Now
              <FiZap className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            </button>
            
            <button 
              onClick={() => navigate('/contact')}
              className={`px-8 py-3.5 ${colors.cardBg} border ${colors.border} ${colors.text} font-bold rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95`}
            >
              show All Games
            </button>
          </div>
          
          
        </div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-green-500/20 to-teal-500/20 rounded-full blur-3xl animate-pulse" />
      </div>
    </div>
  );
};

export default Home;


