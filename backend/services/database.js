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

const UserSchema = new mongoose.Schema({
   fullName: { type: String, default: '' },
   email: { type: String, required: true, unique: true },
   password: { type: String, required: true },
   isVerified: { type: Boolean, default: false },
   verificationCode: { type: String },
   interests: { type: String, default: '' },
   onboarded: { type: Boolean, default: false },
   createdAt: { type: Date, default: Date.now }
});

const PaperSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    authors: [String],
    abstract: String,
    content: String, // Extracted full text
    summary: String, // AI Generated summary
    keyPoints: [String], // AI Generated bullet points
    knowledgeGraphExtracted: { type: Boolean, default: false },
    status: { type: String, default: 'Queued' },
    uploadDate: { type: Date, default: Date.now },
});

const GraphNodeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    id: String, // Represents concept or paper
    label: String,
    type: String, // 'paper', 'concept', 'author'
    paperId: { type: mongoose.Schema.Types.ObjectId, ref: 'Paper' }
});

const GraphEdgeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    source: String, // node id
    target: String, // node id
    label: String, // relationship type
    paperId: { type: mongoose.Schema.Types.ObjectId, ref: 'Paper' }
});

const Paper = mongoose.model('Paper', PaperSchema);
const GraphNode = mongoose.model('GraphNode', GraphNodeSchema);
const GraphEdge = mongoose.model('GraphEdge', GraphEdgeSchema);

const ChatSessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: 'New Conversation' },
    messages: [{
        id: String,
        role: String,
        text: String,
        type: { type: String, default: 'standard' }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const ChatSession = mongoose.model('ChatSession', ChatSessionSchema);
const User = mongoose.model('User', UserSchema);

module.exports = { connectDB, Paper, GraphNode, GraphEdge, ChatSession, User };
