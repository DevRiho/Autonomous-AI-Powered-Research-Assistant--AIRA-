const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aira_db');
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const PaperSchema = new mongoose.Schema({
    title: { type: String, required: true },
    authors: [String],
    abstract: String,
    content: String, // Extracted full text
    summary: String, // AI Generated summary
    keyPoints: [String], // AI Generated bullet points
    knowledgeGraphExtracted: { type: Boolean, default: false },
    uploadDate: { type: Date, default: Date.now },
});

const GraphNodeSchema = new mongoose.Schema({
    id: String, // Represents concept or paper
    label: String,
    type: String, // 'paper', 'concept', 'author'
    paperId: { type: mongoose.Schema.Types.ObjectId, ref: 'Paper' }
});

const GraphEdgeSchema = new mongoose.Schema({
    source: String, // node id
    target: String, // node id
    label: String, // relationship type
    paperId: { type: mongoose.Schema.Types.ObjectId, ref: 'Paper' }
});

const Paper = mongoose.model('Paper', PaperSchema);
const GraphNode = mongoose.model('GraphNode', GraphNodeSchema);
const GraphEdge = mongoose.model('GraphEdge', GraphEdgeSchema);

module.exports = { connectDB, Paper, GraphNode, GraphEdge };
