

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProviderStatus } from '../../reducer/providerSlice';
import { FiLock } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const ProviderCard = ({ provider, gameCount }) => {
  const [status, setStatus] = useState(provider.status ?? 1);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isHoveringStatus, setIsHoveringStatus] = useState(false);
  const [isHoveringCard, setIsHoveringCard] = useState(false);

  const dispatch = useDispatch();
  const games = useSelector((state) => state.games.games || []);
  const actualGameCount = gameCount ?? games.filter((g) => g.provider === provider?.provider).length || 0;
  const isInactive = status === 0;
  const hasBackgroundImage = provider?.img;

  useEffect(() => {
    if (provider.status !== undefined) {
      setStatus(provider.status);
    }
  }, [provider.status]);

  const handleStatusToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUpdating) return;

    setIsUpdating(true);
    const newStatus = status === 0 ? 1 : 0;

    try {
      await dispatch(
        updateProviderStatus({
          id: provider.id,
          status: newStatus,
        })
      ).unwrap();

      setStatus(newStatus);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Link to={`/provider/${provider.provider}`}>
      <div
        className={`relative group h-52 w-full overflow-hidden rounded-2xl border transition-all duration-500 ${
          isInactive
            ? 'cursor-not-allowed border-gray-700'
            : 'cursor-pointer border-gray-800 hover:shadow-2xl'
        }`}
        onMouseEnter={() => setIsHoveringCard(true)}
        onMouseLeave={() => setIsHoveringCard(false)}
      >
        {/* ================= BACKGROUND IMAGE (INITIAL STATE) ================= */}
        {hasBackgroundImage ? (
          <div
            className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ${
              isInactive ? 'grayscale opacity-40' : 'opacity-100'
            } ${isHoveringCard ? 'blur-sm scale-105' : ''}`}
            style={{ backgroundImage: `url(${provider.img})` }}
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center transition-all duration-700 ${
            isHoveringCard ? 'opacity-90' : ''
          }`}>
            {/* Provider Name - Shows initially when no background image */}
            {!isHoveringCard && (
              <h3 className={`font-black text-3xl text-center leading-tight uppercase tracking-tighter px-4 ${
                isInactive ? 'text-gray-400' : 'text-white'
              }`}>
                {provider.provider}
              </h3>
            )}
          </div>
        )}

        {/* ================= OVERLAY ================= */}
        <div className={`absolute inset-0 transition-all duration-500 ${
          isInactive 
            ? 'bg-black/60' 
            : (isHoveringCard ? 'bg-black/80' : 'bg-black/0')
        }`} />

        {/* ================= DETAILS (SHOW ON HOVER) ================= */}
        <div className={`
          relative z-20 h-full p-5 flex flex-col justify-between
          transition-all duration-500
          ${isInactive 
            ? 'opacity-100' 
            : (isHoveringCard ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3')
          }
          pointer-events-none group-hover:pointer-events-auto
        `}>
          {/* HEADER */}
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white/20 bg-gray-800">
              {provider.img ? (
                <img
                  src={provider.img}
                  alt=""
                  className={`w-full h-full object-cover ${
                    isInactive ? 'opacity-50' : ''
                  }`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold">
                  {provider.provider?.charAt(0)}
                </div>
              )}
            </div>

            <span
              className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-wider ${
                isInactive
                  ? 'bg-gray-700 text-gray-300'
                  : 'bg-white text-black'
              }`}
            >
              {actualGameCount} Games
            </span>
          </div>

          {/* INFO */}
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.15em] font-bold">
              <span
                className={isInactive ? 'text-gray-400' : 'text-yellow-500'}
              >
                {provider.game_type || 'Premium Provider'}
              </span>
            </p>

            <h3
              className={`font-black text-2xl uppercase tracking-tighter truncate ${
                isInactive ? 'text-gray-300' : 'text-white'
              }`}
            >
              {provider.provider}
            </h3>

            {isInactive && (
              <div className="pt-2 flex items-center gap-2">
                <FiLock className="text-gray-400 text-sm" />
                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                  Currently Inactive
                </span>
              </div>
            )}

            <div
              className={`pt-3 flex items-center gap-2 text-[11px] font-bold transition-all ${
                isInactive
                  ? 'text-gray-400'
                  : 'text-white/70 group-hover:text-white'
              }`}
            >
              <span className="uppercase tracking-widest border-b border-current">
                View Games
              </span>
              <svg
                className="w-3 h-3 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* ================= STATUS BUTTON ================= */}
        <button
          onClick={handleStatusToggle}
          onMouseEnter={() => setIsHoveringStatus(true)}
          onMouseLeave={() => setIsHoveringStatus(false)}
          disabled={isUpdating}
          className={`
            absolute bottom-3 right-3 z-30 px-4 py-2 rounded-full 
            text-xs font-bold uppercase tracking-wider 
            transition-all duration-300 backdrop-blur-sm shadow-lg
            hover:scale-105
            ${status === 1
              ? 'bg-gradient-to-r from-emerald-500/90 to-emerald-600/90 border border-emerald-400/30'
              : 'bg-gradient-to-r from-rose-500/90 to-rose-600/90 border border-rose-400/30'
            }
            ${isUpdating ? 'opacity-70 cursor-not-allowed' : ''}
            ${isInactive 
              ? 'opacity-100' 
              : (isHoveringCard ? 'opacity-100' : 'opacity-0')
            }
          `}
        >
          {status === 1 ? (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className={isHoveringStatus ? 'block' : 'hidden group-hover:block'}>
                Active
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <FiLock className="text-xs" />
              <span className={isHoveringStatus ? 'block' : 'hidden group-hover:block'}>
                Inactive
              </span>
            </div>
          )}
        </button>
        
        {/* ================= LOCK OVERLAY FOR INACTIVE ================= */}
        {isInactive && !hasBackgroundImage && !isHoveringCard && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gray-800/90 backdrop-blur-sm border-2 border-gray-700 flex items-center justify-center mb-4">
              <FiLock className="text-gray-300 text-2xl" />
            </div>
            <div className="text-center">
              <p className="text-gray-300 text-sm font-bold uppercase tracking-wider">
                Provider is Locked
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Hover to see details
              </p>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProviderCard;