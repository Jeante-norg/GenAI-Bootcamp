const documentation = [

    {

        text: "The primary button uses the 'blue-500' token for its background color. For accessibility, always include an 'aria-label'. This is critical for all interactive elements.",

        vector: [0.85, 0.10, 0.40] // Simulates an 'Interaction/Color' embedding

    },

    {

        text: "To implement dark mode, check the user's system preference using 'window.matchMedia'. Toggle the 'data-theme=dark' attribute on the body tag.",

        vector: [-0.90, 0.05, -0.30] // Simulates a 'Theme/Mode' embedding

    },

    {

        text: "All new components must be written using functional React hooks. Class components are deprecated and should not be used in the new codebase.",

        vector: [0.70, -0.80, -0.15] // Simulates a 'Code Standard/Architecture' embedding

    },

    {

        text: "The component library utilizes a 4-point scale for all internal padding and margin spacing. The largest padding available is 'p-10'.",

        vector: [0.10, 0.95, 0.60] // Simulates a 'Spacing/Design System' embedding

    },

    {

        text: "For fetching asynchronous data, always use the 'useSWR' or 'useQuery' library with built-in caching mechanisms to prevent re-renders.",

        vector: [0.65, -0.75, 0.20] // Simulates a 'Data Fetching/Hooks' embedding

    },

    {

        text: "Project deadlines are set for the end of the third quarter. Contact the project manager for a detailed Gantt chart.",

        vector: [-0.15, -0.10, 0.90] // Simulates a completely unrelated (non-technical) embedding

    }

];
function calculateDotProduct(vecA, vecB) {
  let result = 0;
  for (let i = 0; i < vecA.length; i++) {
    result += vecA[i] * vecB[i];
  }
  return result;
}
function findMostRelevantDocument(queryVector) {
  let bestScore = -Infinity;
  let bestDoc = null;

  for (const doc of documentation) {
    const score = calculateDotProduct(queryVector, doc.vector);
    if (score > bestScore) {
      bestScore = score;
      bestDoc = doc;
    }
  }

  return { bestDoc, bestScore };
}
// Simulated queries
const queries = [
  { text: "How do I make the UI dark?", vector: [-1.0, 0.0, -0.2] },
  { text: "What is the standard for code structure?", vector: [0.75, -0.75, 0.0] }
];

for (const q of queries) {
  const { bestDoc, bestScore } = findMostRelevantDocument(q.vector);
  console.log(`Query: "${q.text}"`);
  console.log(`Best Match: "${bestDoc.text}"`);
  console.log(`Score: ${bestScore.toFixed(3)}\n`);
}
