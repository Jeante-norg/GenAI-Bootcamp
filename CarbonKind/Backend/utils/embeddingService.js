"use strict";

/**
 * Keyword-based similarity — replaces vector embeddings entirely.
 *
 * Computes a relevance score between a query string and a candidate text
 * using:
 *   1. Exact keyword overlap (TF-style term frequency)
 *   2. Bigram overlap for short phrase matching
 *   3. Category keyword boosting for carbon-domain terms
 *
 * Returns a float in [0, 1]. No external API calls, no network required.
 */

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "this",
  "that",
  "these",
  "those",
  "it",
  "its",
  "as",
  "if",
  "then",
  "than",
  "so",
  "all",
  "any",
  "each",
  "per",
  "can",
  "not",
  "no",
  "also",
  "about",
  "into",
  "more",
  "up",
  "out",
  "when",
  "which",
  "how",
  "what",
  "where",
  "who",
  "your",
  "our",
  "their",
  "use",
  "used",
  "using",
  "very",
  "just",
  "such",
  "both",
  "between",
  "after",
  "over",
  "under",
  "through",
  "during",
  "before",
  "because",
  "however",
  "therefore",
  "thus",
]);

const CARBON_DOMAIN_BOOST = {
  electricity: 2.0,
  kwh: 2.5,
  kilowatt: 2.0,
  power: 1.5,
  utility: 1.5,
  grid: 1.5,
  solar: 1.5,
  wind: 1.5,
  coal: 1.5,
  transportation: 2.0,
  gasoline: 2.5,
  gallon: 2.5,
  fuel: 2.0,
  vehicle: 1.8,
  miles: 1.8,
  driving: 1.8,
  flight: 1.8,
  diesel: 2.0,
  petrol: 2.0,
  food: 2.0,
  beef: 2.5,
  chicken: 2.0,
  grocery: 2.0,
  meat: 2.0,
  dairy: 1.8,
  home: 2.0,
  therms: 2.5,
  "natural gas": 2.0,
  heating: 1.8,
  propane: 2.0,
  waste: 2.0,
  landfill: 2.5,
  recycl: 2.0,
  compost: 2.0,
  trash: 2.0,
  carbon: 2.0,
  emission: 2.0,
  co2: 2.5,
  footprint: 2.0,
  kg: 1.5,
};

/**
 * Tokenize text into lowercase words, removing stop words.
 * @param {string} text
 * @returns {string[]}
 */
const tokenize = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
};

/**
 * Extract bigrams from a token array.
 * @param {string[]} tokens
 * @returns {string[]}
 */
const bigrams = (tokens) => {
  const out = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    out.push(`${tokens[i]}_${tokens[i + 1]}`);
  }
  return out;
};

/**
 * Compute domain boost multiplier for a token.
 * Handles prefix matches (e.g. "recycl" matches "recycling", "recycled").
 * @param {string} token
 * @returns {number}
 */
const getDomainBoost = (token) => {
  if (CARBON_DOMAIN_BOOST[token]) return CARBON_DOMAIN_BOOST[token];
  for (const [key, boost] of Object.entries(CARBON_DOMAIN_BOOST)) {
    if (token.startsWith(key) || key.startsWith(token)) return boost;
  }
  return 1.0;
};

/**
 * Compute keyword-based similarity score between query and candidate text.
 *
 * @param {string} query
 * @param {string} candidate
 * @returns {number} score in [0, 1]
 */
const computeSimilarity = (query, candidate) => {
  if (!query || !candidate) return 0;

  const qTokens = tokenize(query);
  const cTokens = tokenize(candidate);

  if (qTokens.length === 0 || cTokens.length === 0) return 0;

  const cSet = new Set(cTokens);
  const qSet = new Set(qTokens);

  // Weighted token overlap
  let matchScore = 0;
  let maxPossible = 0;

  for (const token of qTokens) {
    const boost = getDomainBoost(token);
    maxPossible += boost;
    if (cSet.has(token)) {
      matchScore += boost;
    } else {
      // Partial stem match — check if candidate has token that starts with query token
      for (const ct of cSet) {
        if (ct.startsWith(token) || token.startsWith(ct)) {
          matchScore += boost * 0.6;
          break;
        }
      }
    }
  }

  const tokenScore = maxPossible > 0 ? matchScore / maxPossible : 0;

  // Bigram overlap bonus
  const qBigrams = new Set(bigrams(qTokens));
  const cBigrams = new Set(bigrams(cTokens));
  let bigramMatches = 0;
  for (const bg of qBigrams) {
    if (cBigrams.has(bg)) bigramMatches++;
  }
  const bigramScore = qBigrams.size > 0 ? bigramMatches / qBigrams.size : 0;

  // Category metadata boost — if candidate text contains category keywords
  // that also appear in query, boost score
  const lowerCandidate = candidate.toLowerCase();
  const lowerQuery = query.toLowerCase();
  let categoryBonus = 0;
  const categories = ["electricity", "transportation", "food", "home", "waste"];
  for (const cat of categories) {
    if (lowerQuery.includes(cat) && lowerCandidate.includes(cat)) {
      categoryBonus = 0.15;
      break;
    }
  }

  // Weighted combination
  const raw = tokenScore * 0.65 + bigramScore * 0.25 + categoryBonus;

  // Normalize to [0, 1]
  return Math.min(1, raw);
};

module.exports = { computeSimilarity, tokenize };
