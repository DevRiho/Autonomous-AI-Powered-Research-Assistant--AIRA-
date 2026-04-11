const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeDocument = async (text, title) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const prompt = `
        You are an elite Document Analyzer AI. 
        Read the following research paper titled "${title}" and extract exactly the requested JSON payload.
        Do not include markdown tags (\`\`\`json) in your response, just the raw JSON object.
        
        {
           "summary": "A comprehensive 2-3 paragraph summary focusing on the core problem, methodology, and findings.",
           "keyPoints": ["point 1", "point 2", "point 3", "point 4"],
           "entities": [
               {"id": "concept_name", "label": "Concept Name", "type": "concept"}
           ]
        }
        
        Extract at least 5-8 core semantic entities (methodologies, algorithms, theoretical frameworks). 
        Include the paper itself as the first entity with type "paper", id equal to the title formatted as lowercase with underscores.
        
        Paper Text (truncated):
        ${text.substring(0, 30000)}
        `;

        const result = await model.generateContent(prompt);
        let textResponse = result.response.text();
        textResponse = textResponse.replace(/^```json/m, '').replace(/^```/m, '').trim();

        const parsedResult = JSON.parse(textResponse);
        return parsedResult;
    } catch (error) {
        console.error('Error in Analyzer Agent:', error);
        throw new Error('Failed to analyze document');
    }
};

module.exports = { analyzeDocument };
