const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const { Paper, GraphNode, GraphEdge, connectDB } = require('../services/database');
const fetcherAgent = require('../agents/fetcherAgent');
const summarizerAgent = require('../agents/summarizerAgent');
const plannerAgent = require('../agents/plannerAgent');
const vectorDb = require('../services/vectorDb');

// Initialize DB Connection
connectDB();

// Upload Paper or URL Route
router.post('/upload', upload.single('document'), async (req, res) => {
    try {
        let textContent = '';
        let title = req.body.title || 'Untitled Document';
        
        // 1. Fetcher Agent extracts text
        if (req.file) {
            // It's a local file upload (PDF)
            title = req.body.title || req.file.originalname;
            textContent = await fetcherAgent.extractTextFromPDF(req.file.path);
        } else if (req.body.url) {
            // It's a URL crawl request
            const result = await fetcherAgent.fetchFromURL(req.body.url);
            title = result.title;
            textContent = result.text;
        } else {
            return res.status(400).json({ error: 'No file or URL provided' });
        }
        
        const authors = req.body.authors ? req.body.authors.split(',') : ['AIRA System'];

        // 2. Summarizer Agent
        const { summary, keyPoints, graphNodes, graphEdges } = await summarizerAgent.analyze(textContent, title);
        
        // 3. Save to MongoDB
        const newPaper = new Paper({
            title,
            authors,
            content: textContent.substring(0, 100000), 
            abstract: summary, 
            summary,
            keyPoints,
            knowledgeGraphExtracted: true
        });
        
        const savedPaper = await newPaper.save();

        // 4. Save to Pinecone Vector DB
        try {
            await vectorDb.storeEmbeddings(textContent, savedPaper._id.toString());
        } catch (dbErr) {
             console.error("Vector DB error, continuing without vectors:", dbErr);
        }

        // 5. Save Knowledge Graph Nodes & Edges
        if (graphNodes && graphNodes.length > 0) {
            for (const node of graphNodes) {
                await new GraphNode({ ...node, paperId: savedPaper._id }).save();
            }
        }
        if (graphEdges && graphEdges.length > 0) {
             for (const edge of graphEdges) {
                 await new GraphEdge({ ...edge, paperId: savedPaper._id }).save();
             }
        }

        res.status(201).json({ message: 'Document processed successfully', paper: savedPaper });
    } catch (error) {
        console.error('Error in /upload route:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// Get Papers
router.get('/papers', async (req, res) => {
    try {
        const papers = await Paper.find().sort({ uploadDate: -1 });
        res.json(papers);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get Graph Data
router.get('/graph', async (req, res) => {
    try {
        const nodes = await GraphNode.find();
        const edges = await GraphEdge.find();
        res.json({ nodes, links: edges });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Chat / Planner Route
router.post('/chat', async (req, res) => {
    try {
        const { query } = req.body;
        const response = await plannerAgent.respondToQuery(query);
        res.json({ reply: response });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
