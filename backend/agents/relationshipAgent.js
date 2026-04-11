const { GraphNode } = require('../services/database');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const buildRelationships = async (newEntities, paperId, userId) => {
    try {
        console.log(`[RelationshipAgent] Finding cross-document relationships for paper ${paperId}`);
        // Fetch existing nodes from MongoDB to find overlaps
        const existingNodes = await GraphNode.find({ userId }).limit(100); 
        const existingNodeLabels = existingNodes.map(n => n.label);
        
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const prompt = `
        You are the Relationship Mapping Agent.
        Here are the primary entities extracted from a new document:
        [${newEntities.map(e => e.label).join(', ')}]
        
        Here exist prior concepts in our knowledge base:
        [${existingNodeLabels.join(', ')}]
        
        Generate a list of relationships (edges) between the NEW entities and prior concepts (if there is semantic overlap).
        Also map relationships strictly within the new entities.
        
        Respond ONLY in STRICT JSON format:
        {
           "edges": [
               {"source": "new_concept_id", "target": "existing_concept_id", "label": "relates to / extends / contradicts"}
           ]
        }
        `;

        const result = await model.generateContent(prompt);
        let textResponse = result.response.text();
        textResponse = textResponse.replace(/^```json/m, '').replace(/^```/m, '').trim();

        const parsedResult = JSON.parse(textResponse);
        return parsedResult.edges || [];
    } catch (error) {
        console.error('Error in Relationship Agent:', error);
        return [];
    }
};

module.exports = { buildRelationships };
