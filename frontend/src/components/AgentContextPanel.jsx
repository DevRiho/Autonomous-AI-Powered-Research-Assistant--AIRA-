import React, { useState, useEffect } from 'react';
import { Activity, Database, Zap, Clock, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';

const AgentContextPanel = () => {
  const [activities, setActivities] = useState([]);
  const [vectorStats, setVectorStats] = useState({ dimensions: 0, totalVectors: 0 });
  const [memoryStats, setMemoryStats] = useState({ used: 0, total: 100 });

  const fetchStatus = async () => {
      try {
          const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const res = await axios.get(`${API_BASE_URL}/api/status`);
          setActivities(res.data.activities);
          setVectorStats(res.data.vector);
          if (res.data.memory) setMemoryStats(res.data.memory);
      } catch (err) {
          console.error("Failed to load status");
      }
  };

  useEffect(() => {
      fetchStatus();
      
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const socket = io(API_BASE_URL);
      
      socket.on('job:progress', () => fetchStatus());
      socket.on('job:complete', () => fetchStatus());
      
      return () => socket.disconnect();
  }, []);

  return (
    <div className="w-72 xl:w-80 border-l theme-border theme-surface flex flex-col h-full z-10 hidden lg:flex shadow-sm">
      <div className="p-5 border-b theme-border">
        <h2 className="text-sm font-bold tracking-wide theme-text uppercase flex items-center space-x-2">
          <Zap size={18} className="theme-text-muted" />
          <span>System Status</span>
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-8">
        
        {/* Memory Usage Mock */}
        <div>
           <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-medium theme-text-muted">Context Memory</span>
              <span className="text-sm font-bold theme-text">{memoryStats.used}MB / {memoryStats.total}MB</span>
           </div>
           <div className="w-full bg-zinc-200 dark:bg-zinc-900 rounded-full h-2 overflow-hidden shadow-inner">
               <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min((memoryStats.used/Math.max(memoryStats.total, 1))*100, 100)}%` }}></div>
           </div>
        </div>

        {/* Vector DB Status Mock */}
        <div className="theme-surface-hover border theme-border rounded-xl p-5 shadow-sm">
           <div className="flex items-center justify-between mb-4">
             <div className="flex items-center space-x-2 text-base font-semibold theme-text">
                <Database size={16} className="theme-text-muted" />
                <span>Vector Index</span>
             </div>
             <span className="flex h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></span>
           </div>
           <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                 <p className="theme-text-muted font-medium">Dimensions</p>
                 <p className="font-bold theme-text mt-1 text-lg">{vectorStats.dimensions}</p>
              </div>
              <div>
                 <p className="theme-text-muted font-medium">Vectors</p>
                 <p className="font-bold theme-text mt-1 text-lg">{vectorStats.totalVectors}</p>
              </div>
           </div>
        </div>

        {/* Live Agent Activity Feed */}
        <div>
           <h3 className="text-sm font-bold theme-text-muted uppercase tracking-widest mb-5 flex items-center space-x-2">
              <Activity size={16} />
              <span>Agent Activity Feed</span>
           </h3>
           <div className="space-y-5">
              {activities.length === 0 && <p className="text-sm theme-text-muted italic">No recent activity.</p>}
              {activities.map((act) => (
                 <div key={act.id} className="flex space-x-3 items-start p-2 rounded-lg transition-colors hover:theme-surface-hover">
                    <div className="mt-1 flex-shrink-0">
                       {act.status === 'done' ? (
                          <CheckCircle2 size={18} className="text-green-500" />
                       ) : (
                          <Activity size={18} className="text-blue-500 animate-pulse" />
                       )}
                    </div>
                    <div className="flex-1">
                       <p className="text-base font-bold theme-text">{act.agent}</p>
                       <p className="text-sm theme-text-muted mt-0.5">{act.task}</p>
                    </div>
                    <div>
                       <span className="text-xs theme-text-muted font-medium flex items-center space-x-1 mt-1">
                          <Clock size={12} />
                          <span>{act.time}</span>
                       </span>
                    </div>
                 </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
};

export default AgentContextPanel;
