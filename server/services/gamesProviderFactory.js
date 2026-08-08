const rawgService = require('./rawgService');
const igdbService = require('./igdbService');

const getGamesProvider = () => {
  const provider = process.env.GAMES_PROVIDER || 'igdb';
  if (provider === 'rawg') {
    console.log('Games provider: RAWG');
    return rawgService;
  }
  console.log('Games provider: IGDB');
  return igdbService;
};

module.exports = { getGamesProvider };
