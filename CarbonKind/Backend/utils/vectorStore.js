"use strict";

const { computeSimilarity } = require("./embeddingService");

/**
 * Keyword-based in-memory store.
 * Replaces the vector/embedding approach entirely.
 * Each chunk is stored as plain text; retrieval uses string similarity.
 *
 * @type {Array<{id: string, text: string, metadata: object}>}
 */
let store = [];
let ready = false;

/**
 * Build the store from an array of knowledge chunks.
 * No async operations, no API calls — pure in-memory population.
 *
 * @param {Array<{id: string, text: string, metadata?: object}>} chunks
 * @returns {{ successCount: number, failCount: number }}
 */
const buildStore = (chunks) => {
  if (!Array.isArray(chunks) || chunks.length === 0) {
    console.error("vectorStore.buildStore: chunks must be a non-empty array");
    return { successCount: 0, failCount: 0 };
  }

  console.log(
    `🔧 Building keyword store with ${chunks.length} knowledge chunks…`,
  );
  store = [];
  ready = false;

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    try {
      if (!chunk.text || typeof chunk.text !== "string") {
        throw new Error("chunk.text must be a non-empty string");
      }
      store.push({
        id: chunk.id || `chunk-${i}`,
        text: chunk.text.trim(),
        metadata: chunk.metadata || {},
      });
      successCount++;
    } catch (err) {
      console.error(`❌ Skipped chunk "${chunk.id || i}": ${err.message}`);
      failCount++;
    }
  }

  if (successCount > 0) {
    ready = true;
    console.log(
      `✅ Keyword store ready — ${successCount} chunks loaded, ${failCount} skipped`,
    );
  } else {
    console.error("❌ Keyword store build failed — 0 chunks loaded");
  }

  return { successCount, failCount };
};

/**
 * Retrieve the top-K most relevant chunks for a query string.
 * Uses keyword-based similarity (no vectors, no embeddings).
 *
 * @param {string} query
 * @param {number} topK
 * @returns {Array<{id: string, text: string, metadata: object, score: number}>}
 */
const retrieve = (query, topK = 3) => {
  if (!ready || store.length === 0) return [];
  if (!query || typeof query !== "string" || query.trim().length === 0)
    return [];

  const results = store
    .map((item) => ({
      id: item.id,
      text: item.text,
      metadata: item.metadata,
      score: computeSimilarity(query, item.text),
    }))
    .filter((item) => item.score > 0.05)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return results;
};

/** @returns {boolean} */
const isReady = () => ready;

/** @returns {number} */
const getStoreSize = () => store.length;

module.exports = { buildStore, retrieve, isReady, getStoreSize };
