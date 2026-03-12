import { useState, useEffect, useRef, useCallback } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { OriginalsGames, TableGames } from '../../utils/gameData';

const SearchBar = ({ placeholder = "Search games, providers, users..." }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const debounceTimeout = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchGames = useCallback((term) => {
    if (term.length > 1) {
      setLoading(true);
      const allGames = [...OriginalsGames, ...TableGames];
      const filtered = allGames
        .filter(game => 
          game.game_name?.toLowerCase().includes(term.toLowerCase()) ||
          game.provider?.toLowerCase().includes(term.toLowerCase())
        )
        .slice(0, 5);
      
      setTimeout(() => {
        setResults(filtered);
        setLoading(false);
      }, 150);
    } else {
      setResults([]);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (searchTerm.length > 1) {
      debounceTimeout.current = setTimeout(() => {
        searchGames(searchTerm);
      }, 200);
    } else {
      setResults([]);
    }

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchTerm, searchGames]);

  const clearSearch = () => {
    setSearchTerm('');
    setResults([]);
  };

  const SearchResults = () => {
    if (results.length === 0 && !loading) {
      return (
        <div className="absolute top-full mt-2 w-full bg-gray-900/95 backdrop-blur-lg rounded-xl border border-gray-800 p-4 z-50">
          <div className="text-center">
            <div className="text-gray-400 text-2xl mb-2">🔍</div>
            <div className="font-medium text-white">No results found</div>
            <div className="text-sm text-gray-400 mt-1">
              Try different keywords
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="absolute top-full mt-2 w-full bg-gray-900/95 backdrop-blur-lg rounded-xl shadow-glow-xl border border-gray-800 overflow-hidden z-50">
        <div className="py-2">
          <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-800">
            Games ({results.length})
          </div>
          {results.map((game) => (
            <div
              key={game.id}
              className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-800 cursor-pointer transition-colors"
            >
              <img
                src={game.icon || game.img}
                alt={game.game_name}
                className="w-10 h-10 rounded-lg object-cover"
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white truncate">
                  {game.game_name}
                </div>
                <div className="text-sm text-gray-400 flex items-center space-x-2">
                  <span>{game.provider}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-gray-800">
                    {game.game_type}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-800 px-4 py-2">
          <button className="w-full text-center text-sm text-gray-300 hover:text-white">
            View all results →
          </button>
        </div>
      </div>
    );
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className={`relative transition-all duration-300 ${
        isFocused ? 'ring-1 ring-gray-600' : ''
      }`}>
        <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors ${
          isFocused ? 'text-white' : 'text-gray-400'
        }`} />
        
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 border border-gray-700 rounded bg-gray-800/50  focus:outline-none focus:border-gray-600 transition-all text-white placeholder-gray-500"
        />
        
        {loading && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
          </div>
        )}
        
        {searchTerm && !loading && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            <FiX />
          </button>
        )}
      </div>

      {/* Search Results */}
      {isFocused && searchTerm.length > 1 && (
        <SearchResults />
      )}
    </div>
  );
};

export default SearchBar;