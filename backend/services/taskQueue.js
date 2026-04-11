const fetcherAgent = require('../agents/fetcherAgent');
const analyzerAgent = require('../agents/analyzerAgent');
const relationshipAgent = require('../agents/relationshipAgent');
const insightAgent = require('../agents/insightAgent');
const vectorDb = require('./vectorDb');
const { Paper, GraphNode, GraphEdge } = require('./database');

const jobQueue = [];
let isProcessing = false;
let ioInstance = null;
const activityHistory = [];

const setSocketIo = (io) => {
    ioInstance = io;
};

const broadcast = (event, data) => {
    if (ioInstance) {
        ioInstance.emit(event, data);
    }
    
    // Log history
    if (event === 'job:progress' || event === 'job:complete') {
         activityHistory.unshift({
             id: Date.now(),
             agent: data.stage || 'System',
             task: data.message,
             status: event === 'job:complete' ? 'done' : 'processing',
             time: new Date().toLocaleTimeString()
         });
         if (activityHistory.length > 5) activityHistory.pop();
    }
};

const getActivityHistory = () => activityHistory;

const processQueue = async () => {
    if (isProcessing || jobQueue.length === 0) return;
    
    isProcessing = true;
    const job = jobQueue.shift();
    const { documentId, filePath, url, title, authors, userId } = job;
    
    try {
        broadcast('job:started', { documentId, message: 'Starting processing pipeline.' });
        
        // 1. Fetcher
        broadcast('job:progress', { documentId, stage: 'Fetching', message: 'Extracting text data...' });
        let textContent = '';
        let finalTitle = title;
        if (filePath) {
            textContent = await fetcherAgent.extractTextFromPDF(filePath);
        } else if (url) {
            const result = await fetcherAgent.fetchFromURL(url);
            finalTitle = result.title;
            textContent = result.text;
        }

        // 2. Analyzer Agent
        broadcast('job:progress', { documentId, stage: 'Analyzing', message: 'Agent 1: Extracting concepts & summaries...' });
        const { summary, keyPoints, entities } = await analyzerAgent.analyzeDocument(textContent, finalTitle);
        
        // Save initial DB State
        const newPaper = await Paper.findByIdAndUpdate(documentId, {
            title: finalTitle,
            authors,
            content: textContent.substring(0, 100000), 
            abstract: summary, 
            summary,
            keyPoints,
            status: 'Processing Vectors'
        });

        // 3. Vector Embeddings
        broadcast('job:progress', { documentId, stage: 'Vectorizing', message: 'Generating Dense Vector Embeddings...' });
        try {
            await vectorDb.storeEmbeddings(textContent, documentId.toString(), userId);
        } catch (dbErr) {
             console.error("Vector DB error:", dbErr);
        }

        // 4. Save Nodes
        for (const entity of entities) {
             await new GraphNode({ ...entity, paperId: documentId, userId }).save();
        }

        // 5. Relationship Agent
        broadcast('job:progress', { documentId, stage: 'Relationships', message: 'Agent 2: Mapping global cross-document links...' });
        const newEdges = await relationshipAgent.buildRelationships(entities, documentId.toString(), userId);
        for (const edge of newEdges) {
             await new GraphEdge({ ...edge, paperId: documentId, userId }).save();
        }

        // 6. Insight Agent
        broadcast('job:progress', { documentId, stage: 'Insights', message: 'Agent 3: Finding emerging trends...' });
        const newInsight = await insightAgent.generateInsights(userId);
        
        await Paper.findByIdAndUpdate(documentId, {
             knowledgeGraphExtracted: true,
             status: 'Complete'
        });

        broadcast('job:complete', { 
            documentId, 
            message: 'Processing Finished!', 
            insight: newInsight 
        });

    } catch (error) {
        console.error('Job Error:', error);
        broadcast('job:error', { documentId, error: error.message });
        await Paper.findByIdAndUpdate(documentId, { status: 'Failed' });
    }

    isProcessing = false;
    processQueue(); // Process next
};

const addJob = (jobData) => {
    jobQueue.push(jobData);
    processQueue();
};

module.exports = {
    setSocketIo,
    addJob,
    getActivityHistory
};
