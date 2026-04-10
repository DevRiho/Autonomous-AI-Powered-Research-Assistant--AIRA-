import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Activity, Database, ArrowRight, Link as LinkIcon } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [papers, setPapers] = useState([]);
  const [uploadMode, setUploadMode] = useState('none'); // 'none', 'file', 'url'
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef(null);

  // Fetch papers on load
  const loadPapers = async () => {
      try {
          const res = await axios.get('http://localhost:5000/api/papers');
          setPapers(res.data);
      } catch (err) {
          console.error("Failed to load papers:", err);
      }
  };

  useEffect(() => {
      loadPapers();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadMode('none');
    const formData = new FormData();
    formData.append('document', file);

    try {
        await axios.post('http://localhost:5000/api/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        await loadPapers();
    } catch (err) {
        console.error("Upload failed", err);
    } finally {
        setIsUploading(false);
    }
  };

  const handleUrlUpload = async (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsUploading(true);
    setUploadMode('none');

    try {
        await axios.post('http://localhost:5000/api/upload', { url: urlInput });
        setUrlInput('');
        await loadPapers();
    } catch (err) {
        console.error("URL Ingestion failed", err);
    } finally {
        setIsUploading(false);
    }
  };

  return (
    <div className="p-4 md:p-10 w-full mx-auto space-y-6 md:space-y-10 fade-in">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-end border-b border-zinc-800 pb-4 md:pb-6 relative space-y-4 md:space-y-0">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-zinc-100 mb-1">Research Overview</h1>
          <p className="text-xs md:text-sm text-zinc-400">Library, insights, and extracted literature data.</p>
        </div>
        
        <div className="relative flex space-x-2">
           {isUploading && (
              <div className="flex items-center space-x-2 text-zinc-400 mr-4">
                 <Activity className="animate-spin" size={16} />
                 <span className="text-sm">Processing & Embedding...</span>
              </div>
           )}

           <button 
             onClick={() => setUploadMode(uploadMode === 'url' ? 'none' : 'url')}
             disabled={isUploading}
             className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-4 py-2.5 rounded text-sm font-medium flex items-center space-x-2 transition-colors disabled:opacity-50"
           >
             <LinkIcon size={16} />
             <span>Crawl URL</span>
           </button>
           
           <button 
             onClick={() => {
                 setUploadMode('file');
                 fileInputRef.current?.click();
             }}
             disabled={isUploading}
             className="bg-zinc-100 hover:bg-white text-black px-4 py-2.5 rounded text-sm font-medium flex items-center space-x-2 transition-colors disabled:opacity-50"
           >
             <Upload size={16} />
             <span>Upload File</span>
           </button>
           <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="application/pdf"
              onChange={handleFileUpload}
           />
        </div>

        {uploadMode === 'url' && (
           <div className="absolute top-full right-0 mt-2 bg-[#111111] border border-zinc-700 p-4 rounded-lg shadow-xl z-20 w-80">
              <form onSubmit={handleUrlUpload} className="flex flex-col space-y-3">
                 <label className="text-xs text-zinc-400 font-medium">Enter Article or PDF URL</label>
                 <input 
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    required
                    placeholder="https://..."
                    className="w-full bg-[#0a0a0a] text-zinc-200 text-sm px-3 py-2 border border-zinc-700 rounded focus:border-zinc-500 focus:outline-none"
                 />
                 <button type="submit" className="bg-zinc-100 text-black px-4 py-2 rounded text-sm font-medium">
                    Ingest URL
                 </button>
              </form>
           </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-lg p-5 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <h3 className="text-zinc-400 text-sm font-medium">Total Documents</h3>
            <FileText size={18} className="text-zinc-500" />
          </div>
          <span className="text-3xl font-semibold tracking-tight">{papers.length}</span>
        </div>
        
        <div className="glass-card rounded-lg p-5 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <h3 className="text-zinc-400 text-sm font-medium">Extracted Concepts</h3>
            <Database size={18} className="text-zinc-500" />
          </div>
          <span className="text-3xl font-semibold tracking-tight">{papers.reduce((acc, p) => acc + (p.keyPoints?.length || 0), 0) || '0'}</span>
        </div>

        <div className="glass-card rounded-lg p-5 flex flex-col justify-between h-32 border-l-2 border-l-zinc-300">
          <div className="flex justify-between items-start">
            <h3 className="text-zinc-200 text-sm font-medium">Indexed Memory</h3>
          </div>
          <div>
            <span className="text-3xl font-semibold tracking-tight">Active</span>
            <p className="text-zinc-500 text-xs mt-1">Pinecone Vector DB RAG</p>
          </div>
        </div>
      </div>

      {/* Recent Papers Area */}
      <div>
        <div className="flex items-center justify-between mb-4">
           <h2 className="text-base font-medium text-zinc-200">Recent Documents</h2>
           <button className="text-xs text-zinc-400 hover:text-zinc-100 flex items-center space-x-1">
             <span>View All</span>
             <ArrowRight size={14} />
           </button>
        </div>
        
        <div className="glass-card rounded-lg overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300 min-w-[600px]">
            <thead className="bg-[#0a0a0a] text-xs font-medium text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="px-5 py-3 font-medium">Document Title</th>
                <th className="px-5 py-3 font-medium">Authors</th>
                <th className="px-5 py-3 font-medium text-right">Date Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {papers.length === 0 && (
                  <tr><td colSpan="3" className="px-5 py-8 text-center text-zinc-600 font-medium">No documents uploaded yet.</td></tr>
              )}
              {papers.map((paper) => (
                <tr key={paper._id} className="hover:bg-[#111111] transition-colors cursor-pointer text-zinc-200">
                  <td className="px-5 py-4 font-medium">{paper.title}</td>
                  <td className="px-5 py-4 text-zinc-500">{paper.authors.join(', ')}</td>
                  <td className="px-5 py-4 text-zinc-500 text-right">{new Date(paper.uploadDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
