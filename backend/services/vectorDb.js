const { Pinecone } = require('@pinecone-database/pinecone');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

let pc;
let index;

const initializeVectorStore = async () => {
    try {
        pc = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY
        });
        index = pc.index(process.env.PINECONE_INDEX_NAME);
        console.log('Pinecone Vector Store initialized successfully.');
    } catch (error) {
        console.error('Error initializing Pinecone:', error);
    }
};

const chunkText = (text, chunkSize = 1000) => {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
        chunks.push(text.substring(i, i + chunkSize));
    }
    return chunks;
};

const storeEmbeddings = async (text, documentId, userId) => {
    try {
        if (!index) await initializeVectorStore();

        const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
        const chunks = chunkText(text);
        
        const vectors = [];
        
        // Generate embeddings for each chunk
        for (let i = 0; i < chunks.length; i++) {
             const chunk = chunks[i];
             const result = await model.embedContent(chunk);
             const embedding = result.embedding.values;
             
             vectors.push({
                 id: `${documentId}-chunk-${i}`,
                 values: embedding,
                 metadata: {
                     documentId: documentId.toString(),
                     userId: userId.toString(),
                     text: chunk
                 }
             });
        }
        
        // Upsert in batches of 100
        const batchSize = 100;
        for (let i = 0; i < vectors.length; i += batchSize) {
             const batch = vectors.slice(i, i + batchSize);
             await index.upsert(batch);
        }

        console.log(`Successfully stored ${chunks.length} chunks for document: ${documentId}`);
        return true;
    } catch (error) {
        console.error('Error storing embeddings in Pinecone:', error);
        throw error;
    }
};

const queryVectorStore = async (queryText, userId, topK = 5) => {
    try {
        if (!index) await initializeVectorStore();
        
        const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
        const result = await model.embedContent(queryText);
        const queryVector = result.embedding.values;
        
        const queryResponse = await index.query({
            vector: queryVector,
            topK: topK,
            filter: { userId: userId.toString() },
            includeMetadata: true
        });
        
        const retrievedTexts = queryResponse.matches.map(match => match.metadata.text);
        return retrievedTexts;
    } catch (error) {
        console.error('Error querying vector store:', error);
        return [];
    }
};

const getStats = async () => {
    try {
        if (!index) await initializeVectorStore();
        const stats = await index.describeIndexStats();
        return {
            dimensions: stats.dimension || 1536,
            totalVectors: stats.totalRecordCount || 0
        };
    } catch (error) {
        console.error('Error fetching vector stats:', error);
        return { dimensions: 1536, totalVectors: 0 };
    }
};

module.exports = {
   initializeVectorStore,
   storeEmbeddings,
   queryVectorStore,
   getStats
};
