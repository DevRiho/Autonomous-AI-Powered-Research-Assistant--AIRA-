import React, { useState, useEffect, useContext } from 'react';
import { FileText, Database, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const [papers, setPapers] = useState([]);
  const [vectorCount, setVectorCount] = useState(0);
  const { user } = useContext(AuthContext);
  const firstName = user?.fullName ? user.fullName.split(' ')[0] : 'Researcher';

  // Fetch papers on load
  const loadPapers = async () => {
      try {
          const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const [papersRes, statusRes] = await Promise.all([
              axios.get(`${API_BASE_URL}/api/papers`),
              axios.get(`${API_BASE_URL}/api/status`)
          ]);
          setPapers(papersRes.data);
          setVectorCount(statusRes.data.vector.totalVectors);
      } catch (err) {
          console.error("Failed to load dashboard data:", err);
      }
  };

  useEffect(() => {
      loadPapers();
  }, []);

  return (
    <div className="p-4 md:p-10 w-full mx-auto space-y-6 md:space-y-10 fade-in">
      
      {/* Header section */}
      <div className="flex flex-col border-b theme-border pb-6 relative space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight theme-text">Welcome back, {firstName} 👋</h1>
        <p className="text-sm md:text-base theme-text-muted">Here's your research activity and library overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between h-40 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start">
            <h3 className="theme-text-muted text-base font-bold">Total Documents</h3>
            <FileText size={22} className="text-blue-500" />
          </div>
          <span className="text-4xl font-extrabold tracking-tight theme-text">{papers.length}</span>
        </div>
        
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between h-40 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start">
            <h3 className="theme-text-muted text-base font-bold">Extracted Concepts</h3>
            <Database size={22} className="text-purple-500" />
          </div>
          <span className="text-4xl font-extrabold tracking-tight theme-text">{papers.reduce((acc, p) => acc + (p.keyPoints?.length || 0), 0) || '0'}</span>
        </div>

        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between h-40 border-l-4 border-l-blue-500 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start">
            <h3 className="theme-text text-base font-bold">Indexed Memory</h3>
          </div>
          <div>
            <span className="text-4xl font-extrabold tracking-tight theme-text text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">{vectorCount.toLocaleString()}</span>
            <p className="theme-text-muted text-sm mt-1 font-medium">Synced Context Vectors</p>
          </div>
        </div>
      </div>

      {/* Recent Papers Area */}
      <div>
        <div className="flex items-center justify-between mb-6 border-b theme-border pb-2">
           <h2 className="text-lg font-bold theme-text">Recent Documents</h2>
           <button className="text-sm theme-text-muted hover:theme-text flex items-center space-x-1 font-semibold transition-colors">
             <span>View All</span>
             <ArrowRight size={18} />
           </button>
        </div>
        
        <div className="glass-card rounded-xl overflow-x-auto shadow-sm">
          <table className="w-full text-left text-base theme-text min-w-[700px]">
            <thead className="theme-surface text-sm font-bold theme-text-muted border-b theme-border uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Document Title</th>
                <th className="px-6 py-4">Authors</th>
                <th className="px-6 py-4 text-right">Date Added</th>
              </tr>
            </thead>
            <tbody className="divide-y theme-border">
              {papers.length === 0 && (
                  <tr><td colSpan="3" className="px-6 py-10 text-center theme-text-muted font-medium text-lg">No documents uploaded yet.</td></tr>
              )}
              {papers.map((paper) => (
                <tr key={paper._id} className="hover:theme-surface-hover transition-colors cursor-pointer">
                  <td className="px-6 py-5 font-bold flex items-center space-x-3">
                      <span>{paper.title}</span>
                      {paper.status !== 'Complete' && paper.status !== 'Failed' && (
                         <span className="bg-blue-500/10 text-blue-500 border border-blue-500/20 text-xs px-2.5 py-1 rounded-full uppercase tracking-wider font-bold">{paper.status || 'Processing'}</span>
                      )}
                  </td>
                  <td className="px-6 py-5 theme-text-muted font-medium">{paper.authors.join(', ')}</td>
                  <td className="px-6 py-5 theme-text-muted text-right font-medium">{new Date(paper.uploadDate).toLocaleDateString()}</td>
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
