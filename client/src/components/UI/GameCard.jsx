import { FiInfo, FiHash, FiZap } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';
import { Link } from 'react-router-dom';

const GameCard = ({ game }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const getDisplayName = () => game.game_name || 'Unknown Game';
  const getGameType = () => game.game_type || 'General';
  const getProvider = () => game.provider || 'Premium';
  const getImageUrl = () => game.icon || game.img || 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?q=80&w=400';
  const getGameId = () => game._id || game.id || 'N/A';

  const cardStyle = isDark 
    ? 'bg-[#161b22] border-white/5 text-white' 
    : 'bg-white border-gray-100 text-slate-900';

  return (
    <Link to='/providers' >
    <div className={`group rounded-xl border overflow-hidden transition-all duration-300 ${cardStyle} shadow-sm hover:border-blue-500/50`}>
      
      {/* 1. Game Image - Fully Responsive Ratio */}
      <div className="relative aspect-square overflow-hidden bg-slate-800">
        <img
          src={getImageUrl()}
          alt={getDisplayName()}
          className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-80"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400?text=No+Image'; }}
        />
        
        {/* Category Overlay Badge (Smaller on Mobile) */}
        <div className="absolute top-2 right-2">
          <span className="px-1.5 py-0.5 text-[8px] md:text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white rounded shadow-lg">
            {getGameType()}
          </span>
        </div>
      </div>

      {/* 2. Game Details */}
      <div className="p-2 md:p-4 space-y-2 md:space-y-3">
        <div>
          <h3 className="font-bold text-xs md:text-base leading-tight truncate">
            {getDisplayName()}
          </h3>
          <p className="text-[8px] md:text-[10px] font-bold opacity-50 flex items-center gap-1 mt-0.5 uppercase tracking-tighter">
            <FiZap className="text-blue-500 shrink-0" /> {getProvider()}
          </p>
        </div>

        {/* Info Grid - Optimized for 2-column mobile view */}
        <div className={`grid grid-cols-2 gap-1 md:gap-2 pt-2 border-t ${isDark ? 'border-white/5' : 'border-black/5'}`}>
          <div className="flex flex-col">
            <span className="text-[7px] md:text-[9px] font-bold opacity-40 flex items-center gap-0.5">
              <FiHash className="shrink-0" /> ID
            </span>
            <span className="text-[9px] md:text-xs font-mono font-bold truncate">
              {getGameId().toString().substring(0, 6)}
            </span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[7px] md:text-[9px] font-bold opacity-40">TYPE</span>
            <span className="text-[9px] md:text-xs font-bold text-blue-500 truncate">
              {getGameType()}
            </span>
          </div>
        </div>

        {/* Responsive Button: Small on mobile, bigger on desktop */}
        {/* <button className={`w-full py-1.5 md:py-2.5 rounded-lg text-[9px] md:text-xs font-black flex items-center justify-center gap-1 md:gap-2 transition-all ${
          isDark 
            ? 'bg-white/5 hover:bg-blue-600 hover:text-white' 
            : 'bg-slate-100 hover:bg-blue-500 hover:text-white'
        }`}>
          <FiInfo className="text-xs" /> <span className="hidden xs:inline">INFO</span>
        </button> */}
      </div>
    </div>
    </Link>
  );
};

export default GameCard;