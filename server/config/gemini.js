// ============================================================
// config/gemini.js – Gemini AI Integration with Model Fallback
// ============================================================
'use strict';

require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Ordered list of models to attempt – rotates on quota (429) errors
const MODELS = [
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-2.5-flash-lite',
  'gemini-pro-latest',
  'gemini-2.0-flash'
];

const MAX_RETRIES = 3;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Send a prompt to the Gemini API with automatic model fallback
 * and exponential backoff retry logic.
 * @param {string} prompt - The full text prompt for Gemini.
 * @returns {Promise<string>} - The AI-generated text response.
 */
async function askGemini(prompt) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured in the environment.');
  }

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096
    }
  };

  let lastError;

  for (const model of MODELS) {
    console.log(`[Gemini] Attempting with model: ${model}...`);

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          const waitTime = Math.pow(2, attempt) * 1000;
          console.log(`[Gemini] Retrying ${model} (attempt ${attempt}/${MAX_RETRIES}) after ${waitTime}ms...`);
          await delay(waitTime);
        }

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }
        );

        if (!response.ok) {
          const status = response.status;
          const errText = await response.text();

          if (status === 429) {
            console.warn(`[Gemini] Model ${model} quota exhausted (429). Rotating to next model...`);
            lastError = new Error(`Gemini API 429: ${errText}`);
            break; // Move to next model immediately on 429
          }

          if (status === 503) {
            console.warn(`[Gemini] Model ${model} overloaded (503). ${attempt < MAX_RETRIES ? 'Retrying...' : 'Falling back...'}`);
            lastError = new Error(`Gemini API 503: ${errText}`);
            continue; // Retry same model for 503
          }

          throw new Error(`Gemini API Error (${status}): ${errText}`);
        }

        const data = await response.json();

        // Check if response was truncated due to token limit
        const finishReason = data?.candidates?.[0]?.finishReason;
        if (finishReason === 'MAX_TOKENS') {
          console.warn(`[Gemini] Response from ${model} was truncated (MAX_TOKENS). Retrying with next model...`);
          lastError = new Error('Gemini response truncated due to token limit.');
          break; // Try next model for a complete response
        }

        // Extract text from the response
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          throw new Error('Empty response from Gemini API.');
        }

        console.log(`[Gemini] Success with model: ${model} (finishReason: ${finishReason})`);
        return text;

      } catch (err) {
        lastError = err;
        // If not a retriable error type, break to next model
        if (!err.message.includes('503') && !err.message.includes('ECONNRESET')) {
          break;
        }
      }
    }
  }

  // All models exhausted
  console.error('[Gemini] All models failed:', lastError?.message);
  throw lastError || new Error('All Gemini models failed.');
}

module.exports = { askGemini };
