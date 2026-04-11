import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import KnowledgeGraph from './pages/KnowledgeGraph';
import Chat from './pages/Chat';
import Login from './pages/Login';
import Register from './pages/Register';
import AgentContextPanel from './components/AgentContextPanel';
import { AuthContext } from './context/AuthContext';
import './index.css';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-[#0a0a0a] text-white">Loading...</div>;
    return user ? children : <Navigate to="/login" />;
};

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <div className="flex flex-col md:flex-row h-[100dvh] w-[100vw] theme-bg theme-text overflow-hidden font-sans">
        {/* Left Sidebar / Bottom Nav */}
        {user && <Navigation />}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto w-full theme-bg flex justify-center min-h-0 relative">
          <div className="w-full max-w-[1600px] h-full flex flex-col min-h-0"> 
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/graph" element={<ProtectedRoute><KnowledgeGraph /></ProtectedRoute>} />
              <Route path="/library" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            </Routes>
          </div>
        </div>

        {/* Right Sidebar - System Operations */}
        {user && <AgentContextPanel />}
      </div>
    </Router>
  );
}

export default App;
