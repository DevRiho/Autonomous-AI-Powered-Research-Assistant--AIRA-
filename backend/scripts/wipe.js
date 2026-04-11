require('dotenv').config();
const mongoose = require('mongoose');
const { Paper, GraphNode, GraphEdge } = require('../services/database');
const { Pinecone } = require('@pinecone-database/pinecone');

async function wipeAll() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI);
        
        console.log("Clearing Document and Graph Data...");
        await Paper.deleteMany({});
        await GraphNode.deleteMany({});
        await GraphEdge.deleteMany({});
        console.log("MongoDB Collections Cleared.");

        console.log("Connecting to Pinecone...");
        const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
        const index = pc.index(process.env.PINECONE_INDEX_NAME);
        
        console.log("Clearing Vector Embeddings...");
        await index.deleteAll();
        console.log("Pinecone Vector Index Cleared.");

        console.log("Wipe sequence complete.");
        process.exit(0);
    } catch (err) {
        console.error("Error during wipe:", err);
        process.exit(1);
    }
}

wipeAll();
