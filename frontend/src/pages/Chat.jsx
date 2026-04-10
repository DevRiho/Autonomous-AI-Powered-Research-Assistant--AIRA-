import React, { useState } from 'react';
import { Send, Bot, User, BrainCircuit } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Chat = () => {
  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', text: 'Hello. I am AIRA, your research assistant. I will use Pinecone RAG to search across your uploaded documents. How can I assist you?', type: 'initial' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
        const response = await axios.post('http://localhost:5000/api/chat', { query: input });
        const aiResponse = { 
            id: Date.now() + 1, 
            role: 'ai', 
            text: response.data.reply,
            type: 'standard'
        };
        setMessages((prev) => [...prev, aiResponse]);
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
    <div className="flex flex-col h-full bg-black p-4 md:p-8 w-full max-w-5xl mx-auto fade-in">
      
      <div className="mb-4 md:mb-6 border-b border-zinc-800 pb-4">
        <h1 className="text-lg md:text-xl font-semibold text-zinc-100 flex items-center space-x-2">
          <BrainCircuit size={20} className="text-zinc-400" />
          <span>Research Assistant</span>
        </h1>
      </div>

      <div className="flex-1 rounded-lg mb-6 flex flex-col border border-zinc-800 bg-[#050505] relative">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex max-w-[85%] ${msg.role === 'user' ? 'ml-auto' : 'mr-auto'} items-start space-x-3`}>
              {msg.role === 'ai' && (
                <div className="w-8 h-8 rounded shrink-0 flex items-center justify-center border border-zinc-800 bg-zinc-900 mt-0.5">
                  <Bot size={16} className="text-zinc-400" />
                </div>
              )}
              
              <div className={`
                px-4 py-3 text-sm leading-relaxed rounded-md
                ${msg.role === 'user' 
                  ? 'bg-zinc-100 text-black ml-auto whitespace-pre-wrap' 
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-300 overflow-x-auto'}
                ${msg.type === 'error' ? 'text-red-400 border-red-900/30 bg-red-950/20' : ''}
              `}>
                {msg.role === 'ai' ? (
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-4 mb-2 text-zinc-100" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-4 mb-2 text-zinc-100" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-md font-bold mt-3 mb-2 text-zinc-100" {...props} />,
                      p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-outside ml-4 mb-3 space-y-1" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-4 mb-3 space-y-1" {...props} />,
                      li: ({node, ...props}) => <li className="" {...props} />,
                      code: ({node, inline, className, ...props}) => 
                        inline ? (
                          <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-[13px] font-mono text-zinc-200" {...props} />
                        ) : (
                          <div className="bg-[#0a0a0a] rounded-md border border-zinc-800 mb-3 overflow-hidden">
                            <div className="flex items-center px-3 py-1.5 bg-zinc-900/50 border-b border-zinc-800 text-xs text-zinc-500 font-mono">Code</div>
                            <pre className="p-3 overflow-x-auto">
                              <code className="text-[13px] font-mono text-zinc-300" {...props} />
                            </pre>
                          </div>
                        ),
                      strong: ({node, ...props}) => <strong className="font-semibold text-zinc-100" {...props} />,
                      a: ({node, ...props}) => <a className="text-blue-400 hover:text-blue-300 underline underline-offset-2" {...props} />,
                      table: ({node, ...props}) => <div className="overflow-x-auto mb-3"><table className="w-full text-left border-collapse" {...props} /></div>,
                      th: ({node, ...props}) => <th className="border-b border-zinc-700 p-2 font-semibold text-zinc-200 bg-zinc-800/50" {...props} />,
                      td: ({node, ...props}) => <td className="border-b border-zinc-800 p-2" {...props} />
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded shrink-0 flex items-center justify-center bg-zinc-800 mt-0.5">
                  <User size={16} className="text-zinc-400" />
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
             <div className="flex max-w-[85%] mr-auto items-start space-x-3">
                <div className="w-8 h-8 rounded shrink-0 flex items-center justify-center border border-zinc-800 bg-zinc-900 mt-0.5">
                  <Bot size={16} className="text-zinc-400" />
                </div>
                <div className="px-4 py-3 rounded-md bg-zinc-900 border border-zinc-800 flex space-x-1.5 items-center h-[46px]">
                   <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-pulse"></div>
                   <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-pulse" style={{animationDelay: '150ms'}}></div>
                   <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-pulse" style={{animationDelay: '300ms'}}></div>
                </div>
             </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-zinc-800 bg-[#0a0a0a] rounded-b-lg">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Query documents across Pinecone Vector Store..."
              className="w-full bg-[#111111] text-sm text-zinc-100 placeholder-zinc-600 rounded px-4 py-3 pr-12 focus:outline-none border border-zinc-800 focus:border-zinc-600 transition-colors"
            />
            <button 
              type="submit" 
              disabled={!input.trim()}
              className="absolute right-2 p-1.5 text-zinc-400 hover:text-zinc-100 disabled:opacity-30 transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
      <div className="text-center text-xs text-zinc-600 mb-2">
        AI responses leverage genuine Pinecone RAG Embeddings.
      </div>

    </div>
  );
};

export default Chat;
