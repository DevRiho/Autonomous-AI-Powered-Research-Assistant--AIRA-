const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI('AIzaSyBWBIGpNyNQGvCSLDNQ4yd5gT8PlaUdJ20');

async function listModels() {
    try {
        console.log("Attempting to generate tiny text via gemini-1.5-flash...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("hello");
        console.log("Success:", result.response.text());
    } catch (e) {
        console.error("Test failed:", e.message);
    }
}

listModels();
