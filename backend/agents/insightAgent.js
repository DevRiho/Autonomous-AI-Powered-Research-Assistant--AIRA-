const { GraphNode, GraphEdge } = require('../services/database');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateInsights = async (userId) => {
    try {
        console.log(`[InsightAgent] Analyzing global graph density for trends...`);
        const allNodes = await GraphNode.find({ userId });
        const allEdges = await GraphEdge.find({ userId });
        
        if (allNodes.length < 5) return "Not enough data to detect emerging trends.";

        const nodeNames = allNodes.map(n => ({ id: n.id, label: n.label }));
        const edgeList = allEdges.map(e => ({ source: e.source, target: e.target, label: e.label }));

        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const prompt = `
        You are the Insight Generator Agent.
        Analyze this graph topology of research document concepts. 
        Nodes: ${JSON.stringify(nodeNames.slice(0, 50))}
        Edges: ${JSON.stringify(edgeList.slice(0, 100))}
        
        Provide a 2-3 sentence "Emerging Trend" insight based on highly connected clusters in this specific data. Format as text.
        Make a bold prediction if justified.
        `;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error('Error in Insight Agent:', error);
        return "Unable to generate insights at this time.";
    }
};

module.exports = { generateInsights };
