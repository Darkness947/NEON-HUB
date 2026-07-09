const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const aiModel = require('../models/aiModel');
const libraryModel = require('../models/libraryModel');
const { askGemini } = require('../config/gemini');
const hydrateItem = require('../utils/hydrateItem');
const crypto = require('crypto');

const hashString = (str) => crypto.createHash('sha256').update(str).digest('hex');

// Get all items in user's library of a specific type (max 100 for token limits)
const fetchLibraryForAI = async (userId, mediaType) => {
  let result;
  if (mediaType === 'movie') result = await libraryModel.getUserMovies(userId, null, 1, 100);
  else if (mediaType === 'series') result = await libraryModel.getUserSeries(userId, null, 1, 100);
  else if (mediaType === 'game') result = await libraryModel.getUserGames(userId, null, 1, 100);
  else throw new AppError('Invalid media type', 400);

  if (result.items.length < 5) {
    throw new AppError(`You need at least 5 ${mediaType}s in your library to get recommendations.`, 400);
  }

  // Hydrate to get titles, genres, etc.
  const hydratedItems = await Promise.all(result.items.map(item => hydrateItem(item, mediaType)));
  return hydratedItems;
};

const getRecommendations = asyncHandler(async (req, res) => {
  const { mediaType } = req.params;
  const userId = req.user.id;

  const libraryItems = await fetchLibraryForAI(userId, mediaType);

  // Compute a hash based on user ID, mediaType, and the latest updated_at across their library items
  // This ensures the cache is invalidated if they add/remove/update an item.
  const latestUpdate = libraryItems.reduce((latest, item) => {
    const itemDate = new Date(item.created_at); // created_at in the query response maps to updated_at
    return itemDate > latest ? itemDate : latest;
  }, new Date(0));

  const requestHash = hashString(`rec_${userId}_${mediaType}_${latestUpdate.getTime()}`);

  const cached = await aiModel.getCachedResponse(requestHash);
  if (cached) {
    return res.status(200).json({ success: true, data: cached });
  }

  // Build Prompt
  const mediaListStr = libraryItems.map(item => {
    const title = item.title || item.name;
    const ratingStr = item.rating ? ` (${item.rating}/10)` : '';
    return `- ${title}${ratingStr}`;
  }).join('\n');

  const prompt = `
The user has the following ${mediaType}s in their library with their respective ratings:
${mediaListStr}

Based on these, recommend exactly 5 new ${mediaType}s. 
DO NOT recommend titles already in the list above.
Provide a reason for the recommendation based on their tastes, and list 1 or 2 titles from their library that it is similar to.

Return strictly as JSON with this structure:
{
  "recommendations": [
    {
      "title": "Title Here",
      "reason": "Why they will like it...",
      "similar_to": ["Similar Title 1"]
    }
  ],
  "taste_analysis": "A short 1-2 sentence summary of what the user likes based on their library."
}
`;

  const aiText = await askGemini(prompt);
  
  // Parse JSON from Gemini response (strip markdown blocks if any)
  let parsedData;
  try {
    const cleanJson = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
    parsedData = JSON.parse(cleanJson);
  } catch (err) {
    throw new AppError('AI returned invalid format. Please try again.', 500);
  }

  // Attempt to hydrate the recommendations with TMDB/RAWG posters
  // Note: Since we only have titles, we might need a search endpoint or just return as is.
  // For this feature, returning the title is fine, and frontend can use a fallback poster or we can try to search.
  // Given TMDB/RAWG requires search queries, let's keep it simple and just return the JSON for now. 
  // (We'll add a search step to get IDs if needed later, or rely on frontend search).

  await aiModel.cacheResponse(userId, 'recommendation', mediaType, requestHash, parsedData);

  res.status(200).json({ success: true, data: parsedData });
});

const getComparison = asyncHandler(async (req, res) => {
  const { mediaType, mediaId1, mediaId2 } = req.params;
  const userId = req.user.id;

  if (mediaId1 === mediaId2) {
    throw new AppError('Cannot compare an item with itself', 400);
  }

  // Sort IDs so comparison A vs B is the same as B vs A for caching
  const ids = [mediaId1, mediaId2].sort();
  const requestHash = hashString(`comp_${mediaType}_${ids[0]}_${ids[1]}`);

  const cached = await aiModel.getCachedResponse(requestHash);
  if (cached) {
    return res.status(200).json({ success: true, data: cached });
  }

  // Hydrate items to get their details
  const item1 = await hydrateItem({ media_id: mediaId1 }, mediaType);
  const item2 = await hydrateItem({ media_id: mediaId2 }, mediaType);

  if (!item1.title && !item1.name) throw new AppError('Media 1 not found', 404);
  if (!item2.title && !item2.name) throw new AppError('Media 2 not found', 404);

  const title1 = item1.title || item1.name;
  const title2 = item2.title || item2.name;

  const prompt = `
Compare the following two ${mediaType}s: "${title1}" and "${title2}".

Provide a structured comparison discussing Story, Characters, Pacing, Visuals, Soundtrack, and Themes. 
Identify the Strengths and Weaknesses of both.
Conclude with an "AI Final Verdict" that balances the two (e.g., "Choose X if..., choose Y if...").

Return strictly as JSON with this structure:
{
  "media1": {
    "title": "${title1}",
    "strengths": ["...", "..."],
    "weaknesses": ["...", "..."]
  },
  "media2": {
    "title": "${title2}",
    "strengths": ["...", "..."],
    "weaknesses": ["...", "..."]
  },
  "categories": [
    {
      "name": "Story",
      "media1_text": "...",
      "media2_text": "..."
    },
    {
      "name": "Visuals",
      "media1_text": "...",
      "media2_text": "..."
    }
    // include Characters, Pacing, Soundtrack, Themes
  ],
  "who_should_watch": "...",
  "verdict": "..."
}
`;

  const aiText = await askGemini(prompt);
  
  let parsedData;
  try {
    const cleanJson = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
    parsedData = JSON.parse(cleanJson);
  } catch (err) {
    throw new AppError('AI returned invalid format. Please try again.', 500);
  }

  // Attach hydrated basic info (posters) for the frontend
  parsedData.media1.poster_url = item1.poster_url || item1.poster_path;
  parsedData.media2.poster_url = item2.poster_url || item2.poster_path;
  parsedData.media1.id = mediaId1;
  parsedData.media2.id = mediaId2;

  await aiModel.cacheResponse(userId, 'comparison', mediaType, requestHash, parsedData);

  res.status(200).json({ success: true, data: parsedData });
});

module.exports = {
  getRecommendations,
  getComparison
};
