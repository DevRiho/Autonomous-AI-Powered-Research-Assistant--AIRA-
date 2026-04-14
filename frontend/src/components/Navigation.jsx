import React, { useEffect, useState, useContext, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Network, MessageSquare, BrainCircuit, Sun, Moon, MessageCircle } from 'lucide-react';
import axios from 'axios';

const Navigation = () => {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const [isDark, setIsDark] = useState(true);
  const [chatHistory, setChatHistory] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
     const handleClickOutside = (event) => {
         if (menuRef.current && !menuRef.current.contains(event.target)) {
             setShowUserMenu(false);
         }
     };
     document.addEventListener("mousedown", handleClickOutside);
     return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const initials = user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || 'U');

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
      <div className="hidden md:block relative pb-4 px-3" ref={menuRef}>
        {showUserMenu && (
          <div className="absolute bottom-full left-0 mb-2 w-[calc(100%-24px)] mx-3 theme-surface theme-border border rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="px-4 py-2 border-b theme-border">
               <p className="text-sm theme-text font-semibold truncate">{user?.fullName || 'User'}</p>
               <p className="text-xs theme-text-muted truncate mt-0.5">{user?.email}</p>
            </div>
            <div className="py-1">
               <button className="w-full text-left px-4 py-2 text-sm theme-text-muted theme-surface-hover transition-colors">Profile</button>
               <button className="w-full text-left px-4 py-2 text-sm theme-text-muted theme-surface-hover transition-colors">Settings</button>
            </div>
            <div className="py-1 border-t theme-border">
               <button 
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 theme-surface-hover transition-colors"
               >
                  Log out
               </button>
            </div>
          </div>
        )}
        
        <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center space-x-3 p-3 rounded-xl theme-surface-hover transition-all duration-200 text-left group"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-md group-hover:scale-105 transition-transform">
            {initials}
          </div>
          <div className="flex-1 overflow-hidden shrink-0">
            <p className="font-semibold theme-text text-sm truncate">{user?.fullName || 'User'}</p>
            <p className="theme-text-muted text-xs truncate transition-colors">Research Workspace</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Navigation;
