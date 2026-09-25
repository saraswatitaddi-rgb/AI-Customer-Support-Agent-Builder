const axios = require('axios');
const config = require('../config/env');
const logger = require('../utils/logger');

const VECTOR_DIMENSION = 128;

/**
 * Deterministic hash-based feature extraction for offline / fallback semantic embeddings.
 * Produces normalized 128-dimensional unit vectors.
 */
function createSemanticFallbackEmbedding(text) {
  const vec = new Array(VECTOR_DIMENSION).fill(0);
  if (!text || typeof text !== 'string') return vec;

  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const words = normalized.split(/\s+/).filter(Boolean);

  // Unigram & bigram feature hashing
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 5381;
    for (let c = 0; c < word.length; c++) {
      hash = ((hash << 5) + hash) + word.charCodeAt(c);
      hash = hash & hash;
    }
    const idx = Math.abs(hash) % VECTOR_DIMENSION;
    vec[idx] += 1.0;

    // Bigram
    if (i > 0) {
      const bigram = `${words[i - 1]}_${word}`;
      let bHash = 5381;
      for (let c = 0; c < bigram.length; c++) {
        bHash = ((bHash << 5) + bHash) + bigram.charCodeAt(c);
        bHash = bHash & bHash;
      }
      const bIdx = Math.abs(bHash) % VECTOR_DIMENSION;
      vec[bIdx] += 1.5;
    }
  }

  // L2 normalize
  let norm = 0;
  for (let i = 0; i < VECTOR_DIMENSION; i++) {
    norm += vec[i] * vec[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < VECTOR_DIMENSION; i++) {
      vec[i] = parseFloat((vec[i] / norm).toFixed(6));
    }
  }

  return vec;
}

/**
 * Generates embeddings using Gemini API, OpenAI API, or deterministic semantic vectorizer.
 * @param {string} text
 * @returns {Promise<number[]>}
 */
async function generateEmbedding(text) {
  if (!text || text.trim() === '') {
    return new Array(VECTOR_DIMENSION).fill(0);
  }

  // 1. Try Gemini API if key is present
  if (config.geminiApiKey) {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${config.geminiApiKey}`,
        {
          model: 'models/text-embedding-004',
          content: {
            parts: [{ text: text.slice(0, 2048) }],
          },
        },
        { timeout: 8000 }
      );
      if (response.data?.embedding?.values) {
        return response.data.embedding.values;
      }
    } catch (err) {
      logger.warn('Gemini embedding API call failed, falling back to semantic vectorizer:', err.message);
    }
  }

  // 2. Try OpenAI API if key is present
  if (config.openaiApiKey) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/embeddings',
        {
          input: text.slice(0, 2048),
          model: 'text-embedding-3-small',
        },
        {
          headers: { Authorization: `Bearer ${config.openaiApiKey}` },
          timeout: 8000,
        }
      );
      if (response.data?.data?.[0]?.embedding) {
        return response.data.data[0].embedding;
      }
    } catch (err) {
      logger.warn('OpenAI embedding API call failed, falling back to semantic vectorizer:', err.message);
    }
  }

  // 3. Fallback high-fidelity local semantic vectorizer
  return createSemanticFallbackEmbedding(text);
}

/**
 * Calculate cosine similarity between two numeric vectors
 * @param {number[]} vecA
 * @param {number[]} vecB
 * @returns {number} similarity between -1 and 1
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  const len = Math.min(vecA.length, vecB.length);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < len; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (normA * normB);
}

module.exports = {
  generateEmbedding,
  cosineSimilarity,
  createSemanticFallbackEmbedding,
};
