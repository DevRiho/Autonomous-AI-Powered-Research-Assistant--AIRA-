import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Network, MessageSquare, BrainCircuit } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', name: 'Overview', icon: LayoutDashboard },
    { path: '/graph', name: 'Knowledge Graph', icon: Network },
    { path: '/chat', name: 'Research Assistant', icon: MessageSquare },
  ];

  return (
    <div className="w-full md:w-64 border-t md:border-t-0 md:border-r border-zinc-800 bg-[#0a0a0a] flex flex-row md:flex-col h-16 md:h-full z-20 order-last md:order-first shrink-0">
      <div className="hidden md:flex p-6 items-center space-x-3 mb-4 border-b border-zinc-800/50">
        <BrainCircuit size={24} className="text-zinc-100" />
        <h1 className="text-xl font-medium tracking-tight text-zinc-100">
          AIRA
        </h1>
      </div>

      <div className="hidden md:block px-4 pb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
         Menu
      </div>
      <nav className="flex-1 flex flex-row md:flex-col justify-around md:justify-start px-2 md:px-3 md:space-y-1 py-2 md:py-0">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-center md:justify-start flex-col md:flex-row space-y-1 md:space-y-0 md:space-x-3 px-2 md:px-3 py-1.5 md:py-2.5 rounded-md transition-colors text-xs md:text-sm ${
                isActive 
                  ? 'bg-zinc-800/80 text-zinc-100 font-medium' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              <item.icon size={isActive ? 20 : 18} className="md:w-[18px] md:h-[18px]" />
              <span className="hidden md:inline">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="hidden md:block p-4 border-t border-zinc-800 bg-[#0a0a0a]">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-300 border border-zinc-700">
            TA
          </div>
          <div className="text-sm">
            <p className="font-medium text-zinc-200">Researcher</p>
            <p className="text-zinc-500 text-xs text-ellipsis overflow-hidden whitespace-nowrap w-32">
              Workspace
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
