import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import { FiStar, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { getGames } from "../../reducer/gameSlice";
import GameCard from "./GameCard";
import { useTheme } from "../../contexts/ThemeContext";

const GameSlider = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();

  const { games, loading } = useSelector((state) => state.games);

  useEffect(() => {
    if (!games || games.length === 0) {
      dispatch(getGames({ page: 1, size: 20 }));
    }
  }, [dispatch]);

  // Theme styles
  const containerBg =
    theme === "dark"
      ? "bg-gradient-to-b from-gray-900 to-black"
      : "bg-gradient-to-b from-gray-50 to-white";

  const cardBg =
    theme === "dark"
      ? "bg-gradient-to-r from-gray-800/60 to-black/60"
      : "bg-gradient-to-r from-white to-gray-50";

  const borderColor =
    theme === "dark" ? "border-gray-700" : "border-gray-200";

  const textPrimary =
    theme === "dark" ? "text-white" : "text-gray-900";

  const textSecondary =
    theme === "dark" ? "text-gray-300" : "text-gray-600";

  if (loading && games.length === 0) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${containerBg}`}>
        <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={` ${containerBg} py-10 px-4 sm:px-6 lg:px-8`}>
      <div className="mx-auto space-y-8">

        

        {/* Slider */}
        <div
          className={`${cardBg} border ${borderColor} rounded-2xl p-6 relative`}
        >
          <Swiper
            modules={[Navigation, Autoplay]}
            navigation={{
              prevEl: ".game-prev",
              nextEl: ".game-next",
            }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            loop
            spaceBetween={16}
            breakpoints={{
              320: { slidesPerView: 2 },
              640: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
              1280: { slidesPerView: 5 },
            }}
          >
            {(games || []).slice(0, 20).map((game) => (
              <SwiperSlide key={game._id || game.id}>
                <div className="transition-all duration-500 hover:-translate-y-2">
                  <GameCard game={game} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Arrows */}
          <button
            className={`game-prev absolute left-2 top-1/2 -translate-y-1/2 z-10 p-3 rounded-xl border ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700 text-white hover:border-blue-500/50"
                : "bg-white border-gray-300 text-gray-800 hover:border-blue-400"
            } transition-all`}
          >
            <FiChevronLeft />
          </button>

          <button
            className={`game-next absolute right-2 top-1/2 -translate-y-1/2 z-10 p-3 rounded-xl border ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700 text-white hover:border-blue-500/50"
                : "bg-white border-gray-300 text-gray-800 hover:border-blue-400"
            } transition-all`}
          >
            <FiChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameSlider;
