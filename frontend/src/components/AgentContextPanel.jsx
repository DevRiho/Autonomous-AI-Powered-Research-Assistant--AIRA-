import React from 'react';
import { Activity, Database, Zap, Clock, CheckCircle2 } from 'lucide-react';

const AgentContextPanel = () => {
  const activities = [
    { id: 1, agent: 'Summarizer', task: 'Abstract Generation', status: 'done', time: '2m ago' },
    { id: 2, agent: 'Knowledge Graph', task: 'Entity Linking', status: 'done', time: '5m ago' },
    { id: 3, agent: 'Vector Store', task: 'Indexing Embeddings', status: 'processing', time: 'Now' },
  ];

  return (
    <div className="w-80 border-l border-zinc-800 bg-[#0a0a0a] flex flex-col h-full z-10 hidden xl:flex">
      <div className="p-5 border-b border-zinc-800/50">
        <h2 className="text-sm font-semibold tracking-wide text-zinc-100 uppercase flex items-center space-x-2">
          <Zap size={16} className="text-zinc-400" />
          <span>System Status</span>
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* Memory Usage Mock */}
        <div>
           <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-medium text-zinc-400">Context Memory</span>
              <span className="text-xs font-semibold text-zinc-200">24K / 128K</span>
           </div>
           <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
               <div className="bg-zinc-300 h-1.5 rounded-full" style={{ width: '18%' }}></div>
           </div>
        </div>

        {/* Vector DB Status Mock */}
        <div className="bg-[#111111] border border-zinc-800 rounded-lg p-4">
           <div className="flex items-center justify-between mb-3">
             <div className="flex items-center space-x-2 text-sm font-medium text-zinc-200">
                <Database size={14} className="text-zinc-400" />
                <span>Vector Index</span>
             </div>
             <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
           </div>
           <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                 <p className="text-zinc-500">Dimensions</p>
                 <p className="font-semibold text-zinc-300 mt-0.5">1536</p>
              </div>
              <div>
                 <p className="text-zinc-500">Vectors</p>
                 <p className="font-semibold text-zinc-300 mt-0.5">12,492</p>
              </div>
           </div>
        </div>

        {/* Live Agent Activity Feed */}
        <div>
           <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4 flex items-center space-x-2">
              <Activity size={14} />
              <span>Agent Activity Feed</span>
           </h3>
           <div className="space-y-4">
              {activities.map((act) => (
                 <div key={act.id} className="flex space-x-3 items-start">
                    <div className="mt-0.5">
                       {act.status === 'done' ? (
                          <CheckCircle2 size={16} className="text-zinc-500" />
                       ) : (
                          <Activity size={16} className="text-zinc-300 animate-pulse" />
                       )}
                    </div>
                    <div className="flex-1">
                       <p className="text-sm font-medium text-zinc-200">{act.agent}</p>
                       <p className="text-xs text-zinc-400 mt-0.5">{act.task}</p>
                    </div>
                    <div>
                       <span className="text-[10px] text-zinc-500 flex items-center space-x-1">
                          <Clock size={10} />
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
