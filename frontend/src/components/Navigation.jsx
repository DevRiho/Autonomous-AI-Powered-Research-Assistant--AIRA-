import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Network, MessageSquare, BrainCircuit, Sun, Moon, MessageCircle } from 'lucide-react';
import axios from 'axios';

const Navigation = () => {
  const location = useLocation();
  const [isDark, setIsDark] = useState(true);
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'light' || (!savedTheme && !prefersDark)) {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }

    const loadChatHistory = async () => {
        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${API_BASE_URL}/api/chats`);
            setChatHistory(res.data);
        } catch (err) {
            console.error(err);
        }
    };
    loadChatHistory();
  }, [location.search]);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const navItems = [
    { path: '/', name: 'Research Assistant', icon: MessageSquare },
    { path: '/graph', name: 'Knowledge Graph', icon: Network },
    { path: '/library', name: 'Library', icon: LayoutDashboard },
  ];

  return (
    <div className="w-full md:w-64 border-t md:border-t-0 md:border-r theme-border theme-surface flex flex-row md:flex-col h-16 md:h-full z-20 order-last md:order-first shrink-0 shadow-lg md:shadow-none">
      
      {/* Brand Header */}
      <div className="hidden md:flex p-6 items-center justify-between mb-4 border-b theme-border">
        <div className="flex items-center space-x-3">
          <BrainCircuit size={28} className="theme-text" />
          <h1 className="text-xl font-bold tracking-tight theme-text">AIRA</h1>
        </div>
        <button onClick={toggleTheme} className="p-2 rounded-full theme-surface-hover theme-text-muted hover:theme-text transition-colors">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div className="hidden md:block px-6 pb-2 text-xs font-semibold theme-text-muted uppercase tracking-widest">
         Menu
      </div>

      {/* Nav Actions */}
      <nav className="flex-1 flex flex-row md:flex-col justify-around md:justify-start px-2 md:px-4 md:space-y-2 py-2 md:py-0 w-full">
        {/* Mobile quick theme toggle */}
        <button onClick={toggleTheme} className="md:hidden flex items-center justify-center p-2 rounded-lg theme-text-muted">
           {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-center md:justify-start flex-col md:flex-row space-y-1 md:space-y-0 md:space-x-3 px-3 py-2 md:px-4 md:py-3 rounded-lg transition-all duration-200 text-[10px] md:text-sm font-medium
                ${isActive 
                  ? 'theme-button shadow-md' 
                  : 'theme-text-muted theme-surface-hover'
              }`}
            >
              <item.icon size={isActive ? 22 : 20} className="mb-0.5 md:mb-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}

        {/* History Area */}
        <div className="hidden md:block pt-6 pb-2 text-xs font-semibold theme-text-muted uppercase tracking-widest mt-6 border-t theme-border">
          Recent Chats
        </div>
        <div className="hidden md:flex flex-col space-y-1 overflow-y-auto w-full max-h-[40vh] custom-scrollbar">
           {chatHistory.length === 0 && <span className="text-xs theme-text-muted px-4 italic">No history yet.</span>}
           {chatHistory.map((chat) => (
             <Link
                key={chat._id}
                to={`/?chat=${chat._id}`}
                className="flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors hover:theme-surface-hover text-sm font-medium theme-text-muted hover:theme-text truncate"
             >
                <MessageCircle size={16} className="shrink-0" />
                <span className="truncate">{chat.title}</span>
             </Link>
           ))}
        </div>
      </nav>

      {/* User Profile */}
      <div className="hidden md:flex p-5 border-t theme-border theme-surface items-center space-x-3">
        <div className="w-10 h-10 rounded-full theme-button flex items-center justify-center text-sm font-bold shadow-inner">
          TA
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="font-semibold theme-text text-sm truncate">Timothy Abejoye</p>
          <p className="theme-text-muted text-xs truncate">Research Workspace</p>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
