import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import KnowledgeGraph from './pages/KnowledgeGraph';
import Chat from './pages/Chat';
import AgentContextPanel from './components/AgentContextPanel';
import './index.css';

function App() {
  return (
    <Router>
      <div className="flex flex-col md:flex-row h-screen w-full bg-black text-zinc-100 overflow-hidden font-sans">
        {/* Left Sidebar / Bottom Nav */}
        <Navigation />

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto w-full bg-black flex justify-center">
          <div className="w-full max-w-[1600px] h-full"> 
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/graph" element={<KnowledgeGraph />} />
              <Route path="/chat" element={<Chat />} />
            </Routes>
          </div>
        </div>

        {/* Right Sidebar - System Operations */}
        <AgentContextPanel />
      </div>
    </Router>
  );
}

export default App;
