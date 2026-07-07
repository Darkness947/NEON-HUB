const axios = require('axios');
const cache = require('../config/cache');

const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_IMAGE_BASE_URL = process.env.TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p';

const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 8000,
  params: {
    api_key: TMDB_API_KEY,
  },
});

const buildImageUrl = (path, size = 'w500') => {
  return path ? `${TMDB_IMAGE_BASE_URL}/${size}${path}` : null;
};

// Cleaners
const cleanMovie = (m) => ({
  id: m.id,
  tmdb_id: m.id,
  title: m.title,
  poster_path: m.poster_path,
  poster_url: buildImageUrl(m.poster_path),
  backdrop_url: buildImageUrl(m.backdrop_path, 'w1280'),
  release_date: m.release_date,
  vote_average: m.vote_average,
  overview: m.overview,
  genre_ids: m.genre_ids,
  media_type: 'movie',
});

const cleanSeries = (s) => ({
  id: s.id,
  tmdb_id: s.id,
  title: s.name,
  poster_path: s.poster_path,
  poster_url: buildImageUrl(s.poster_path),
  backdrop_url: buildImageUrl(s.backdrop_path, 'w1280'),
  release_date: s.first_air_date,
  vote_average: s.vote_average,
  overview: s.overview,
  genre_ids: s.genre_ids,
  media_type: 'series',
});

// ─── Movies ──────────────────────────────────────────────────────────────────

const getTrendingMovies = async () => {
  const cacheKey = 'trending_movies';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const { data } = await tmdbApi.get('/trending/movie/week');
  const cleaned = data.results.map(cleanMovie);
  
  cache.set(cacheKey, cleaned, 600);
  return cleaned;
};

const getPopularMovies = async (page = 1) => {
  const { data } = await tmdbApi.get('/movie/popular', { params: { page } });
  return {
    results: data.results.map(cleanMovie),
    page: data.page,
    total_pages: data.total_pages,
  };
};

const getUpcomingMovies = async (page = 1) => {
  const { data } = await tmdbApi.get('/movie/upcoming', { params: { page } });
  return {
    results: data.results.map(cleanMovie),
    page: data.page,
    total_pages: data.total_pages,
  };
};

const searchMovies = async (query, page = 1) => {
  const { data } = await tmdbApi.get('/search/movie', { params: { query, page } });
  return {
    results: data.results.map(cleanMovie),
    page: data.page,
    total_pages: data.total_pages,
    total_results: data.total_results,
  };
};

const getMovieById = async (id) => {
  const { data } = await tmdbApi.get(`/movie/${id}`, {
    params: { append_to_response: 'credits,similar' },
  });

  return {
    ...cleanMovie(data),
    tagline: data.tagline,
    runtime: data.runtime,
    genres: data.genres,
    cast: data.credits?.cast?.slice(0, 15).map(c => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profile_url: buildImageUrl(c.profile_path, 'w185'),
    })) || [],
    similar: data.similar?.results?.slice(0, 6).map(cleanMovie) || [],
  };
};

const getMovieBasic = async (id) => {
  const { data } = await tmdbApi.get(`/movie/${id}`);
  return cleanMovie(data);
};

// ─── Series ──────────────────────────────────────────────────────────────────

const getTrendingSeries = async () => {
  const cacheKey = 'trending_series';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const { data } = await tmdbApi.get('/trending/tv/week');
  const cleaned = data.results.map(cleanSeries);
  
  cache.set(cacheKey, cleaned, 600);
  return cleaned;
};

const searchSeries = async (query, page = 1) => {
  const { data } = await tmdbApi.get('/search/tv', { params: { query, page } });
  return {
    results: data.results.map(cleanSeries),
    page: data.page,
    total_pages: data.total_pages,
    total_results: data.total_results,
  };
};

const getSeriesById = async (id) => {
  const { data } = await tmdbApi.get(`/tv/${id}`, {
    params: { append_to_response: 'credits,similar' },
  });

  return {
    ...cleanSeries(data),
    tagline: data.tagline,
    status: data.status,
    genres: data.genres,
    number_of_episodes: data.number_of_episodes,
    number_of_seasons: data.number_of_seasons,
    seasons: data.seasons?.map(s => ({
      id: s.id,
      season_number: s.season_number,
      name: s.name,
      episode_count: s.episode_count,
      air_date: s.air_date,
      poster_url: buildImageUrl(s.poster_path),
    })) || [],
    cast: data.credits?.cast?.slice(0, 15).map(c => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profile_url: buildImageUrl(c.profile_path, 'w185'),
    })) || [],
    similar: data.similar?.results?.slice(0, 6).map(cleanSeries) || [],
  };
};

const getSeriesSeason = async (id, seasonNumber) => {
  const { data } = await tmdbApi.get(`/tv/${id}/season/${seasonNumber}`);
  return {
    id: data.id,
    season_number: data.season_number,
    name: data.name,
    overview: data.overview,
    poster_url: buildImageUrl(data.poster_path),
    episodes: data.episodes?.map(e => ({
      id: e.id,
      season_number: data.season_number,
      episode_number: e.episode_number,
      name: e.name,
      overview: e.overview,
      air_date: e.air_date,
      runtime: e.runtime,
      still_url: buildImageUrl(e.still_path),
      vote_average: e.vote_average,
    })) || [],
  };
};

const getEpisodeBasic = async (seriesId, seasonNumber, episodeNumber) => {
  // First get the series to get the series title and poster fallback
  const seriesData = await getSeriesBasic(seriesId);
  const { data } = await tmdbApi.get(`/tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}`);
  return {
    id: data.id,
    series_title: seriesData.title,
    title: `${seriesData.title} - S${seasonNumber}E${episodeNumber}: ${data.name}`,
    poster_url: buildImageUrl(data.still_path) || seriesData.poster_url,
    backdrop_url: seriesData.backdrop_url,
    season_number: data.season_number,
    episode_number: data.episode_number,
    air_date: data.air_date,
    vote_average: data.vote_average,
    overview: data.overview,
    media_type: 'episode',
  };
};

const getSeriesBasic = async (id) => {
  const { data } = await tmdbApi.get(`/tv/${id}`);
  return cleanSeries(data);
};

const getPopularSeries = async (page = 1) => {
  const { data } = await tmdbApi.get('/tv/popular', { params: { page } });
  return {
    results: data.results.map(cleanSeries),
    page: data.page,
    total_pages: data.total_pages,
  };
};

const getUpcomingSeries = async (page = 1) => {
  const { data } = await tmdbApi.get('/tv/on_the_air', { params: { page } });
  return {
    results: data.results.map(cleanSeries),
    page: data.page,
    total_pages: data.total_pages,
  };
};

module.exports = {
  getTrendingMovies,
  getPopularMovies,
  getUpcomingMovies,
  searchMovies,
  getMovieById,
  getMovieBasic,
  
  getTrendingSeries,
  getPopularSeries,
  getUpcomingSeries,
  searchSeries,
  getSeriesById,
  getSeriesBasic,
  getSeriesSeason,
  getEpisodeBasic,
};
