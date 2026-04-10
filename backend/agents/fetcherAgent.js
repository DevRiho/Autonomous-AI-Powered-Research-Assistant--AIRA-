const fs = require('fs');
const pdfParse = require('pdf-parse');
const axios = require('axios');
const cheerio = require('cheerio');

const extractTextFromPDF = async (filePath) => {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text;
    } catch (error) {
        console.error('Error parsing local PDF:', error);
        throw new Error('Failed to extract text from PDF');
    }
};

const extractTextFromBuffer = async (buffer) => {
    try {
        const data = await pdfParse(buffer);
        return data.text;
    } catch (error) {
        console.error('Error parsing PDF buffer:', error);
        throw new Error('Failed to extract text from remote PDF');
    }
};

const fetchFromURL = async (url) => {
    try {
        // Fetch headers to determine content type
        const headResponse = await axios.head(url).catch(() => null);
        
        let contentType = '';
        if (headResponse && headResponse.headers['content-type']) {
            contentType = headResponse.headers['content-type'].toLowerCase();
        }

        // If it's a PDF
        if (contentType.includes('application/pdf')) {
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            const text = await extractTextFromBuffer(response.data);
             return { title: `Remote PDF: ${url}`, text };
        }

        // Default to attempting HTML extraction
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
        
        // Remove scripts and styles
        $('script, style, nav, footer, iframe, noscript').remove();
        
        const title = $('title').text() || url;
        const extractedText = $('body').text().replace(/\s+/g, ' ').trim();
        
        return { title, text: extractedText };

    } catch (error) {
         console.error('Error fetching from URL:', error);
         throw new Error(`Failed to crawl URL: ${url}`);
    }
};

module.exports = {
    extractTextFromPDF,
    fetchFromURL
};
