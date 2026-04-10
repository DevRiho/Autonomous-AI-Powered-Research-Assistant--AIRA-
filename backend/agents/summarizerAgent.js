const { GoogleGenerativeAI } = require('@google/generative-ai');

// Use the key from the environment
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyze = async (text, title) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        
        const prompt = `
        You are an elite AI research assistant. I will provide you with the text of a research paper titled "${title}".
        Please read it and provide the following in STRICT JSON format:
        {
           "summary": "A comprehensive paragraph summarizing the paper.",
           "keyPoints": ["bullet point 1", "bullet point 2", "bullet point 3"],
           "graphNodes": [
               {"id": "concept1", "label": "Concept Name", "type": "concept"}
           ],
           "graphEdges": [
               {"source": "concept1", "target": "concept2", "label": "relates to"}
           ]
        }
        
        Extract at least 5 key concepts for the knowledge graph. Include the paper itself as a node with type "paper" and link concepts to it. Make the JSON valid without markdown wrapping (or if wrapped, I will parse it).
        
        Paper Text (truncated to 30000 chars):
        ${text.substring(0, 30000)}
        `;

        const result = await model.generateContent(prompt);
        let textResponse = result.response.text();
        
        // Clean up markdown block if present
        textResponse = textResponse.replace(/^```json/m, '').replace(/^```/m, '').trim();

        const parsedResult = JSON.parse(textResponse);
        return parsedResult;
    } catch (error) {
        console.error('Error in Summarizer Agent:', error);
        throw new Error('Failed to summarize paper');
    }
};

module.exports = {
    analyze
};
