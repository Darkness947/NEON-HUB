const tmdbService = require('./tmdbService');
const { getGamesProvider } = require('./gamesProviderFactory');

// ─── Cache Warmer ─────────────────────────────────────────────────────────────
// Pre-loads the public, non-user data the Home page needs (trending movies,
// series and games) into the in-memory cache. Each getter returns the cached
// value if it is still fresh, so calling this repeatedly is cheap.
//
// Intentionally does NOT touch PostgreSQL — Neon is allowed to scale to zero
// to stay within the free-tier compute allowance.

const gamesProvider = getGamesProvider();

const warmPublicCaches = async () => {
  const tasks = [
    tmdbService.getTrendingMovies(),
    tmdbService.getTrendingSeries(),
    typeof gamesProvider.warmTrendingPool === 'function'
      ? gamesProvider.warmTrendingPool()
      : gamesProvider.getTrendingGames(1),
  ];

  const results = await Promise.allSettled(tasks);
  return {
    movies: results[0].status,
    series: results[1].status,
    games:  results[2].status,
  };
};

module.exports = { warmPublicCaches };
