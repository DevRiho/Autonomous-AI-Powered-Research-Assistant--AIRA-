const { GoogleGenerativeAI } = require('@google/generative-ai');
const vectorDb = require('../services/vectorDb');
const { GraphNode, GraphEdge } = require('../services/database');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const respondToQuery = async (query, history = [], userId) => {
    try {
        // Query Pinecone for relevant chunks
        const retrievedContexts = await vectorDb.queryVectorStore(query, userId, 5);
        const contextString = retrievedContexts.join('\n\n---\n\n');

        // Light query Mongo for basic graph node matches to highlight
        const keywords = query.split(' ').map(w => w.toLowerCase());
        const allNodes = await GraphNode.find({ userId });
        const candidateNodes = allNodes.filter(n => keywords.some(k => n.label.toLowerCase().includes(k) && k.length > 3));

        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        
        const historyText = history.map(m => `${m.role === 'user' ? 'User' : 'AIRA'}: ${m.text}`).join('\n\n');

        const prompt = `
        You are AIRA, the Research Advisor Agent.

        Previous Conversation History:
        ${historyText ? historyText : "No previous conversation."}

        The user just asked: "${query}".
        
        Vector Context:
        ${contextString || "No specific vector context."}
        
        Candidate Graph Nodes (ID and Label):
        ${JSON.stringify(candidateNodes.map(n => ({id: n.id, label: n.label})))}

        Respond in STRICT JSON format (no markdown):
        {
           "reply": "Your detailed Markdown-formatted response answering the user's question, acting as an advisor.",
           "highlightNodes": ["node_id_1", "node_id_2"]
        }
        
        Select 1-4 node IDs from the candidate list that are most relevant to highlight in the UI graph. If none match, return an empty list.
        `;

        const result = await model.generateContent(prompt);
        let textResponse = result.response.text();
        textResponse = textResponse.replace(/^```json/m, '').replace(/^```/m, '').trim();

        const parsedResult = JSON.parse(textResponse);
        return parsedResult;
    } catch (error) {
        console.error('Error in Advisor Agent RAG Retrieval:', error);
        return { reply: "I encountered an error processing your query against the graph.", highlightNodes: [] };
    }
};

module.exports = {
    respondToQuery
};
