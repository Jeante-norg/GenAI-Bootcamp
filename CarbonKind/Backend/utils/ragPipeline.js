"use strict";

const vectorStore = require("./vectorStore");

/**
 * Retrieve contextually relevant carbon knowledge for the given text.
 *
 * Uses keyword-based retrieval (no embeddings, no external API calls).
 * Returns an empty string if the store is not ready or the query yields
 * no useful results, allowing the AI controller to degrade gracefully.
 *
 * @param {string} queryText  Extracted document text or description
 * @returns {string}          Formatted context block for prompt injection
 */
const getRelevantContext = (queryText) => {
  if (!vectorStore.isReady()) {
    console.log("⚠️  RAG store not ready — skipping context injection");
    return "";
  }

  if (
    !queryText ||
    typeof queryText !== "string" ||
    queryText.trim().length === 0
  ) {
    return "";
  }

  const results = vectorStore.retrieve(queryText, 3);

  if (!results || results.length === 0) {
    return "";
  }

  const contextChunks = results.map((r, i) => {
    const tag =
      r.metadata && r.metadata.category
        ? `[${r.metadata.category.toUpperCase()}]`
        : "[GENERAL]";
    return `${i + 1}. ${tag} ${r.text}`;
  });

  console.log(
    `🔍 RAG: retrieved ${results.length} chunks (scores: ${results
      .map((r) => r.score.toFixed(3))
      .join(", ")})`,
  );

  return contextChunks.join("\n");
};

module.exports = { getRelevantContext };
