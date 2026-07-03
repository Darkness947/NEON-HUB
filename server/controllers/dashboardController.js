const asyncHandler = require('../utils/asyncHandler');
const dashboardModel = require('../models/dashboardModel');
const activityModel = require('../models/activityModel');
const hydrateItem = require('../utils/hydrateItem');
const AppError = require('../utils/AppError');

const getStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const stats = await dashboardModel.getStats(userId);
  
  res.status(200).json({
    success: true,
    data: {
      totalMovies: parseInt(stats.total_movies) || 0,
      moviesCompleted: parseInt(stats.movies_completed) || 0,
      totalSeries: parseInt(stats.total_series) || 0,
      seriesCompleted: parseInt(stats.series_completed) || 0,
      totalGames: parseInt(stats.total_games) || 0,
      gamesCompleted: parseInt(stats.games_completed) || 0,
      totalHoursPlayed: parseFloat(stats.total_hours_played) || 0,
      avgRating: parseFloat(stats.avg_rating) || 0,
    }
  });
});

const getActivity = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const activity = await activityModel.getRecentActivity(userId, 10);
  
  const hydratedActivity = await Promise.all(
    activity.map(async (log) => {
      // Create a mock item to pass to hydrateItem
      const mockItem = {
        id: log.id,
        media_id: log.media_id,
        media_type: log.media_type
      };
      
      const hydrated = await hydrateItem(mockItem, log.media_type);
      return {
        ...log,
        media_title: hydrated.title || hydrated.name || 'Unknown',
        media_poster: hydrated.poster_url || hydrated.poster_path || null
      };
    })
  );

  res.status(200).json({
    success: true,
    data: hydratedActivity
  });
});

const getGenres = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  // Fetch up to 50 recent items from library across all media types
  const recentItems = await dashboardModel.getRecentTrackedItems(userId, 50);
  
  // Hydrate them all in parallel
  const hydratedItems = await Promise.all(
    recentItems.map(item => hydrateItem(item, item.media_type))
  );
  
  // Tally the genres
  const genreCounts = {};
  
  hydratedItems.forEach(item => {
    // TMDB (movies/series) returns genre_ids or genres array if full details fetched
    // RAWG (games) returns genres array
    
    // Some endpoints return full genre objects, some just return IDs.
    // TMDB basic info generally returns genre_ids. Let's look for genres first, then genre_ids.
    // If we only have IDs, we'd need a lookup map, but TMDB's getMovieBasic / getSeriesBasic might only return IDs.
    // Wait, the API returns objects from RAWG, but maybe only IDs from TMDB.
    // We should safely try to extract the genre names or fall back.
    
    // In our TMDB cleanMovie/cleanSeries, we only return genre_ids.
    // We need genre mapping or we could just count the IDs for now and return them.
    // For RAWG we probably have genres. Let's handle whatever is available.
    if (item.genres && Array.isArray(item.genres)) {
      item.genres.forEach(g => {
        const name = g.name || g; // might be an object or string
        genreCounts[name] = (genreCounts[name] || 0) + 1;
      });
    } else if (item.genre_ids && Array.isArray(item.genre_ids)) {
      // Just store them by ID for now, we will add a mapping below for TMDB genres
      item.genre_ids.forEach(id => {
        const name = getTmdbGenreName(id);
        genreCounts[name] = (genreCounts[name] || 0) + 1;
      });
    }
  });
  
  // Sort and pick top 5
  const topGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  res.status(200).json({
    success: true,
    data: topGenres
  });
});

// Basic TMDB genre map for movies and TV series
const getTmdbGenreName = (id) => {
  const map = {
    28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
    80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
    14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
    9648: "Mystery", 10749: "Romance", 878: "Science Fiction",
    10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
    10759: "Action & Adventure", 10762: "Kids", 10763: "News",
    10764: "Reality", 10765: "Sci-Fi & Fantasy", 10766: "Soap",
    10767: "Talk", 10768: "War & Politics"
  };
  return map[id] || `Genre ${id}`;
}

module.exports = {
  getStats,
  getActivity,
  getGenres
};
