import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, BrainCircuit, Paperclip, Link as LinkIcon, Activity, Plus } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { io } from 'socket.io-client';
import { useSearchParams, useNavigate } from 'react-router-dom';

const Chat = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const chatId = searchParams.get('chat');
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const socket = io(API_BASE_URL);
      
      socket.on('job:progress', (data) => {
          setProcessingStatus(`${data.stage}: ${data.message}`);
      });

      socket.on('job:complete', (data) => {
          setProcessingStatus(`Success: ${data.message}`);
          setTimeout(() => setProcessingStatus(null), 5000);
      });
      
      return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (chatId) {
        const fetchChatHist = async () => {
            try {
                const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const res = await axios.get(`${API_BASE_URL}/api/chats/${chatId}`);
                if (res.data.messages) setMessages(res.data.messages);
            } catch (err) {
                console.error("Failed to fetch chat history", err);
            }
        };
        fetchChatHist();
    } else {
        setMessages([]); // Empty array represents "New Chat" landing view
    }
  }, [chatId]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setProcessingStatus(`Uploading ${file.name}...`);
    
    // Add a system message so user sees it in chat
    const sysMessage = { id: Date.now(), role: 'ai', type: 'system', text: `Initiated ingestion of **${file.name}**. You will see live background updates here as I extract entities and build graph edges.` };
    setMessages((prev) => [...prev, sysMessage]);

    const formData = new FormData();
    formData.append('document', file);

    try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        await axios.post(`${API_BASE_URL}/api/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    } catch (err) {
        console.error("Upload failed", err);
        setProcessingStatus('Upload Failed');
    } finally {
        setIsUploading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        // Note: history tracking is managed natively in the DB now via chatId
        const response = await axios.post(`${API_BASE_URL}/api/chat`, { query: input, chatId });

        const aiResponse = { 
            id: Date.now() + 1, 
            role: 'ai', 
            text: response.data.reply,
            type: 'standard'
        };
        setMessages((prev) => [...prev, aiResponse]);

        // If this was a new chat, auto-update the URL parameter
        if (!chatId && response.data.chatId) {
            navigate(`/?chat=${response.data.chatId}`);
        }
    } catch (error) {
        setMessages((prev) => [...prev, { 
            id: Date.now() + 1, 
            role: 'ai', 
            text: 'I encountered an error trying to connect to the backend planner agent.', 
            type: 'error'
        }]);
    } finally {
        setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full theme-bg fade-in w-full overflow-hidden">
      
      {/* Search & Chat Panel */}
      <div className="w-full flex flex-col p-4 md:p-8 flex-1 min-h-0 relative">
        
        {/* Top Header if messages exist */}
        {messages.length > 0 && (
          <div className="mb-2 md:mb-4 pb-2 max-w-4xl mx-auto w-full shrink-0 flex justify-between items-center bg-transparent border-b theme-border border-zinc-200/5 dark:border-zinc-800/20">
            <h1 className="text-xl md:text-2xl font-bold theme-text flex items-center space-x-2">
              <BrainCircuit size={26} className="text-blue-500" />
              <span>AIRA</span>
            </h1>
            <button
               onClick={() => navigate('/')}
               className="theme-button-secondary text-sm font-semibold px-4 py-2 rounded-full flex items-center space-x-2 shadow-sm uppercase tracking-wide hover:-translate-y-0.5 transition-all"
            >
               <Plus size={16} />
               <span>New Chat</span>
            </button>
          </div>
        )}

        {/* Empty State Greeting */}
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center -mt-20 fade-in">
             <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-xl mb-8">
                <BrainCircuit size={36} />
             </div>
             <h1 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-zinc-300 to-zinc-500 dark:from-zinc-100 dark:to-zinc-500 mb-4 text-center">
               What would you like to research?
             </h1>
             <p className="theme-text-muted text-center max-w-lg mb-10 text-base md:text-lg">
               Upload a PDF to instantly extract entities, or ask a question across your entire Pinecone vector store.
             </p>
          </div>
        )}

        <div className={`flex-1 flex flex-col relative overflow-hidden min-h-0 ${messages.length === 0 ? 'hidden' : 'flex'}`}>
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-2 md:px-4 py-6 space-y-8 max-w-4xl mx-auto w-full">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-start md:space-x-4 space-x-3`}>
              {msg.role === 'ai' && (
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full shrink-0 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md">
                  <BrainCircuit size={20} />
                </div>
              )}
              
              <div className={`
                text-base leading-relaxed overflow-x-auto
                ${msg.role === 'user' 
                  ? 'theme-surface theme-border border shadow-sm theme-text ml-auto rounded-3xl px-6 py-3 whitespace-pre-wrap inline-block max-w-[85%]' 
                  : 'theme-text bg-transparent py-1 w-full max-w-full overflow-hidden'}
                ${msg.type === 'error' ? 'text-red-500 border border-red-500/30 bg-red-500/10 px-6 py-3 rounded-2xl' : ''}
              `}>
                {msg.role === 'ai' ? (
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-6 mb-4" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-5 mb-3" {...props} />,
                      p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-outside ml-6 mb-5 space-y-2" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-6 mb-5 space-y-2" {...props} />,
                      li: ({node, ...props}) => <li className="" {...props} />,
                      code: ({node, inline, className, ...props}) => 
                        inline ? (
                          <code className="theme-surface px-2 py-0.5 rounded text-[14.5px] font-mono border theme-border" {...props} />
                        ) : (
                          <div className="theme-surface rounded-xl border theme-border mb-5 overflow-hidden shadow-sm">
                            <div className="flex items-center px-4 py-2 bg-black/5 dark:bg-white/5 border-b theme-border text-xs theme-text-muted font-mono font-bold uppercase tracking-wider">Code</div>
                            <pre className="p-5 overflow-x-auto">
                              <code className="text-[14.5px] font-mono leading-relaxed" {...props} />
                            </pre>
                          </div>
                        ),
                      strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                      a: ({node, ...props}) => <a className="text-blue-500 hover:text-blue-400 underline underline-offset-4" {...props} />,
                      table: ({node, ...props}) => <div className="overflow-x-auto mb-5 border theme-border rounded-xl"><table className="w-full text-left border-collapse" {...props} /></div>,
                      th: ({node, ...props}) => <th className="border-b theme-border p-4 font-bold bg-black/5 dark:bg-white/5" {...props} />,
                      td: ({node, ...props}) => <td className="border-b theme-border p-4" {...props} />
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>

              {/* User Avatar Removed as per Gemini style */}
              {/* System Note (from upload) */}
              {msg.type === 'system' && (
                 <div className="w-full text-center flex flex-col items-center justify-center my-4 opacity-70">
                    <span className="bg-zinc-200 dark:bg-zinc-800 theme-text px-4 py-2 rounded-full text-sm flex items-center space-x-2 border theme-border">
                       <Activity size={16} className="animate-pulse text-blue-500" />
                       <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </span>
                 </div>
              )}
            </div>
          ))}
          
          {isTyping && (
             <div className="flex w-full justify-start items-start md:space-x-4 space-x-3 max-w-4xl mx-auto">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full shrink-0 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md animate-pulse">
                  <BrainCircuit size={20} />
                </div>
                <div className="py-2 flex space-x-2 items-center h-[40px]">
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 font-medium animate-pulse">Thinking...</span>
                </div>
             </div>
          )}
        </div>
        </div>

        {/* Input Area */}
        <div className="pt-2 md:pt-4 pb-4 md:pb-6 px-4 md:px-8 shrink-0 w-full relative z-10">
          <div className="max-w-4xl mx-auto">
            {processingStatus && (
               <div className="absolute -top-10 left-12 right-12 text-center text-sm theme-text-muted animate-pulse font-medium">
                  {processingStatus}
               </div>
            )}
            <form onSubmit={handleSend} className="relative flex items-center shadow-2xl rounded-full theme-surface border theme-border p-1 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl">
              
              <button 
                 type="button"
                 onClick={() => fileInputRef.current?.click()}
                 className={`p-3 md:p-3.5 rounded-full theme-text-muted hover:theme-text transition-colors flex items-center justify-center shrink-0 ml-1 ${isUploading ? 'animate-pulse opacity-50' : ''}`}
                 title="Upload PDF"
              >
                 <Paperclip size={22} />
              </button>
              <input 
                 type="file" 
                 ref={fileInputRef} 
                 style={{ display: 'none' }} 
                 accept="application/pdf"
                 onChange={handleFileUpload}
              />

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isUploading ? "Uploading document..." : "Ask AIRA anything..."}
                disabled={isUploading}
                className="w-full bg-transparent theme-text text-base md:text-lg placeholder:theme-text-muted px-4 py-3 md:py-3.5 pr-16 focus:outline-none"
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isUploading}
                className="absolute right-2 p-3 rounded-full bg-blue-600 text-white disabled:opacity-30 transition-all hover:bg-blue-700 disabled:hover:bg-blue-600 flex items-center justify-center shadow-md scale-95"
              >
                <Send size={20} />
              </button>
            </form>
            <div className="text-center text-xs theme-text-muted mt-4 opacity-50">
              AIRA securely processes embedded knowledge locally before vectorizing contexts.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
