const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const { Paper, GraphNode, GraphEdge, ChatSession, connectDB } = require('../services/database');
const fetcherAgent = require('../agents/fetcherAgent');
const advisorAgent = require('../agents/advisorAgent');
const vectorDb = require('../services/vectorDb');
const taskQueue = require('../services/taskQueue');
const { protect } = require('../middleware/authMiddleware');

// Initialize DB Connection
connectDB();

// Upload Paper or URL Route
router.post('/upload', protect, upload.single('document'), async (req, res) => {
    try {
        let title = req.body.title || 'Untitled Document';
        
        if (req.file) {
            title = req.body.title || req.file.originalname;
        } else if (req.body.url) {
            // URL logic is handled in queue
        } else {
            return res.status(400).json({ error: 'No file or URL provided' });
        }
        
        const authors = req.body.authors ? req.body.authors.split(',') : ['AIRA System'];

        // Save skeleton to MongoDB instantly
        const newPaper = new Paper({
            userId: req.user._id,
            title,
            authors,
            status: 'Queued',
            knowledgeGraphExtracted: false
        });
        
        const savedPaper = await newPaper.save();

        // Dispatch background job
        taskQueue.addJob({
            userId: req.user._id,
            documentId: savedPaper._id,
            filePath: req.file ? req.file.path : null,
            url: req.body.url ? req.body.url : null,
            title,
            authors
        });

        res.status(202).json({ message: 'Document added to processing queue', paper: savedPaper });
    } catch (error) {
        console.error('Error in /upload route:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// Get Papers
router.get('/papers', protect, async (req, res) => {
    try {
        const papers = await Paper.find({ userId: req.user._id }).sort({ uploadDate: -1 });
        res.json(papers);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get Graph Data
router.get('/graph', protect, async (req, res) => {
    try {
        const nodes = await GraphNode.find({ userId: req.user._id });
        const edges = await GraphEdge.find({ userId: req.user._id });
        res.json({ nodes, links: edges });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get All Chats
router.get('/chats', protect, async (req, res) => {
    try {
        const chats = await ChatSession.find({ userId: req.user._id }, 'title updatedAt').sort({ updatedAt: -1 });
        res.json(chats);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get Specific Chat
router.get('/chats/:id', protect, async (req, res) => {
    try {
        const chat = await ChatSession.findOne({ _id: req.params.id, userId: req.user._id });
        if (!chat) return res.status(404).json({ error: 'Chat not found' });
        res.json(chat);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Chat / Advisor Route
router.post('/chat', protect, async (req, res) => {
    try {
        const { query, chatId } = req.body;
        
        let chat;
        let history = [];

        if (chatId) {
            chat = await ChatSession.findOne({ _id: chatId, userId: req.user._id });
            if (chat) {
                history = chat.messages.map(m => ({ role: m.role, text: m.text }));
                chat.messages.push({ role: 'user', text: query });
            }
        } 
        
        if (!chat) {
            chat = new ChatSession({ 
                title: query.substring(0, 30) + (query.length > 30 ? '...' : ''),
                userId: req.user._id 
            });
            chat.messages.push({ role: 'user', text: query });
        }

        const response = await advisorAgent.respondToQuery(query, history, req.user._id);
        
        chat.messages.push({ role: 'ai', text: response.reply, type: 'standard' });
        chat.updatedAt = Date.now();
        await chat.save();
        
        res.json({ ...response, chatId: chat._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// System Status Route
router.get('/status', protect, async (req, res) => {
    try {
        const stats = await vectorDb.getStats();
        const history = taskQueue.getActivityHistory();
        
        const memoryUsage = process.memoryUsage();
        const memoryUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
        const memoryTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
        
        res.json({
            memory: { used: memoryUsedMB, total: memoryTotalMB },
            vector: stats,
            activities: history
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
