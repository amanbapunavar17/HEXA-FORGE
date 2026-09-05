import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle,
  CornerDownLeft,
  Trash2
} from 'lucide-react';

export default function AICopilotModal({ isOpen, onClose, auditResult }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hello! I am your **AI Network Security Copilot** for **SIH26155 (NTRO)**.\n\nI can analyze your multi-vendor configurations, explain CIS/NIST/DISA STIG violations, generate Ansible playbooks, or answer judge questions about this prototype."
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const quickPrompts = [
    "Why does 'permit any any' violate Zero Trust?",
    "How to harden Cisco IOS management lines (SSH vs Telnet)?",
    "Explain DISA STIG CAT I vs CAT II network findings",
    "What makes this tool vendor-agnostic for NTRO?"
  ];

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const newMsgs = [...messages, { role: 'user', content: query }];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'user',
          content: query,
          audit_context_id: auditResult?.audit_id
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages([...newMsgs, { role: 'assistant', content: data.content }]);
      } else {
        setMessages([...newMsgs, { 
          role: 'assistant', 
          content: "I ran into a temporary issue connecting to the AI engine. Please verify the backend service is running." 
        }]);
      }
    } catch (e) {
      setMessages([...newMsgs, { 
        role: 'assistant', 
        content: "Error reaching local AI Copilot endpoint. Please ensure the backend is active on port 8000." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Chat cleared. Ask any technical or compliance question regarding SIH26155!"
      }
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="glass-card rounded-2xl border border-cyan-500/40 w-full max-w-2xl h-[650px] flex flex-col overflow-hidden shadow-2xl bg-slate-950">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-lg bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center">
              <Bot className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                <span>AI Security Copilot</span>
                <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  SIH26155
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Context-Aware Cybersecurity & Compliance Analyst</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleClear}
              title="Clear Conversation"
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2.5 bg-slate-900/50 border-b border-slate-800/80 flex items-center space-x-2 overflow-x-auto">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider font-mono pl-1 shrink-0">Prompts:</span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 hover:border-cyan-700 text-slate-300 text-[11px] border border-slate-700 whitespace-nowrap transition-all"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-sans">
          {messages.map((m, idx) => {
            const isUser = m.role === 'user';
            return (
              <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-xl p-3.5 leading-relaxed ${
                    isUser
                      ? 'bg-cyan-600 text-white rounded-br-none shadow-md'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-lg'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{m.content}</div>
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-400 flex items-center space-x-2">
                <div className="h-3 w-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[11px]">AI is generating compliance insight...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about CIS benchmarks, NIST guidelines, ACL fixes, or playbook generation..."
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className={`p-2 rounded-xl text-white transition-all ${
                loading || !input.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-600/30'
              }`}
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
