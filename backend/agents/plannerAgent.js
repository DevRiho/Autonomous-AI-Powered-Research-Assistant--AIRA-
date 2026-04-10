const { GoogleGenerativeAI } = require('@google/generative-ai');
const vectorDb = require('../services/vectorDb');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const respondToQuery = async (query) => {
    try {
        // Query Pinecone for relevant chunks
        const retrievedContexts = await vectorDb.queryVectorStore(query, 5);
        const contextString = retrievedContexts.join('\n\n---\n\n');

        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        
        const prompt = `
        You are AIRA (Autonomous AI-Powered Research Assistant).
        A user has asked: "${query}".
        
        Here is relevant context retrieved from the user's vector knowledge base (Pinecone RAG):
        <context>
        ${contextString || "No specific documents found in the vector DB for this query."}
        </context>

        Please act as an Experiment Planner and Research Advisor. Answer the user's query utilizing the context heavily if it's relevant. Provide actionable ideas, next research steps, and a brief conceptual experiment or code snippet if relevant. Format your response cleanly using Markdown.
        `;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error('Error in Planner Agent RAG Retrieval:', error);
        return "I encountered an error while trying to process your request.";
    }
};

module.exports = {
    respondToQuery
};
