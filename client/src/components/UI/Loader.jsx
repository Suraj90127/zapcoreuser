import React from 'react';

const Loader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-950">
      <div className="relative">
        {/* Background Glow */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-r from-white/5 to-transparent rounded-full animate-pulse-glow" />
        </div>
        
        {/* Main Loader */}
        <div className="relative">
          <div className="w-24 h-24 relative">
            {/* Rings */}
            <div className="absolute inset-0 border-4 border-gray-800 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-white rounded-full animate-spin" />
            <div className="absolute inset-4 border-4 border-transparent border-b-gray-300 rounded-full animate-spin" 
                 style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            
            {/* Center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-800 to-black border border-gray-700 flex items-center justify-center shadow-glow">
                <span className="text-xl">🎮</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Text */}
        <div className="mt-6 text-center">
          <div className="text-sm font-semibold text-gradient-silver animate-pulse">
            Loading Dashboard
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Please wait...
          </div>
          
          {/* Dots */}
          <div className="flex items-center justify-center space-x-1 mt-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader;