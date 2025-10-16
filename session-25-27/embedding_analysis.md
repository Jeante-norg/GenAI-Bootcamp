Embeddings are numerical representations of text that capture semantic meaning. Similar texts have similar vector values. 
In a RAG pipeline, embeddings are used to retrieve relevant documents based on a query. 
This ensures the model generates accurate, context-aware responses.
### Embedding Visualization Insights

After uploading the 3D vectors into TensorFlow Projector:

- The **Interaction/Color** and **Spacing/Design System** vectors are close to each other, suggesting both are related to design and UI.
- The **Theme/Mode** vector (dark mode logic) is far from those, showing it represents a different technical topic.
- The **Code Standard/Architecture** and **Data Fetching/Hooks** vectors are somewhat near each other — both relate to code practices.
- The **Non-technical/Deadline** vector is isolated, confirming it’s not semantically related to any technical topic.

Overall, the 3D visualization helps confirm that vectors with similar semantic meaning cluster together, which is what we expect from embeddings.
