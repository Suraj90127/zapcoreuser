import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

import { getActiveProviders } from "../../reducer/providerSlice";
import { getGames } from "../../reducer/gameSlice";
import GameCard from "./GameCard";

const ProviderGameSliders = () => {
  const dispatch = useDispatch();

  const { activeProviders } = useSelector((state) => state.providers);
  const { games, loading } = useSelector((state) => state.games);

  useEffect(() => {
    dispatch(getActiveProviders());
    dispatch(getGames({ page: 1, size: 50 }));
  }, [dispatch]);

  // 🔥 Provider name se match
  const getGamesByProvider = (providerName) => {
    return games?.filter(
      (game) =>
        game.provider?.toLowerCase() === providerName?.toLowerCase()
    );
  };

  if (loading && !games?.length) {
    return (
      <div className="py-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="py-5 bg-gray-50 dark:bg-black">
      {activeProviders?.map((provider) => {
        const providerGames = getGamesByProvider(provider.name);

        if (!providerGames || providerGames.length === 0) return null;

        return (
          <div key={provider._id} className="mb-5">

            <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {provider.name}
            </h2>

            <Swiper
              modules={[Autoplay]}
              autoplay={{ delay: 2500, disableOnInteraction: false }}
              loop
              spaceBetween={12}
              breakpoints={{
                320: { slidesPerView: 2 },
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 6 },
                1400: { slidesPerView: 6 },
              }}
            >
              {providerGames.map((game) => (
                <SwiperSlide key={game._id || game.id}>
                  <GameCard game={game} />
                </SwiperSlide>
              ))}
            </Swiper>

          </div>
        );
      })}
    </div>
  );
};

export default ProviderGameSliders;
