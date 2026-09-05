import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, User, RefreshCw, ChevronRight } from 'lucide-react';
import { aiService } from '../../services/ai.service';
import { AIChatMessage } from '../../types';

interface AIHRAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const INITIAL_PROMPTS = [
  'What is my attendance today?',
  'How many leaves do I have left?',
  'Where can I download my payslip?',
  'Explain the 1-day leave auto-approval policy',
];

export const AIHRAssistantDrawer: React.FC<AIHRAssistantDrawerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: "👋 Hi! I'm your **AI HR Assistant**. Ask me anything about your personal attendance, leave balances, payslips, or company HR policies.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggested_actions: INITIAL_PROMPTS,
      is_demo_mode: true,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || isTyping) return;

    const userMsg: AIChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const response = await aiService.chatWithHRAssistant(messageText);
      const aiMsg: AIChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggested_actions: response.suggested_actions,
        is_demo_mode: response.is_demo_mode,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: AIChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Sorry, I encountered an error connecting to the AI assistant service. Please check your network or try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white dark:bg-navy-900 shadow-2xl border-l border-slate-200/80 dark:border-navy-800 z-50 flex flex-col animate-slide-left transition-all">
      {/* Drawer Header */}
      <div className="px-6 py-5 bg-gradient-to-r from-slate-950 via-brand-950 to-navy-950 text-white flex items-center justify-between border-b border-brand-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-apple border border-brand-400/40">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">AI HR Assistant</h3>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-400/30">
                ✦ Live AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Context & Role-Aware Intelligent Agent</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 dark:hover:bg-navy-800 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/60 dark:bg-navy-950/60">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[88%] rounded-3xl px-4 py-3.5 text-xs leading-relaxed shadow-apple transition-all ${
                m.sender === 'user'
                  ? 'bg-gradient-to-r from-brand-600 to-cyan-600 text-white rounded-br-none'
                  : 'bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans">
                {m.text.split('\n').map((line, idx) => (
                  <p key={idx} className={line.startsWith('- ') ? 'ml-2 my-0.5' : 'my-1'}>
                    {line.replace(/\*\*(.*?)\*\*/g, '$1')}
                  </p>
                ))}
              </div>
              <span
                className={`text-[9px] block mt-1.5 text-right font-medium ${
                  m.sender === 'user' ? 'text-white/75' : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {m.timestamp}
              </span>
            </div>

            {/* Suggested Action Chips */}
            {m.suggested_actions && m.suggested_actions.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {m.suggested_actions.map((act, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(act)}
                    className="text-[11px] bg-white dark:bg-navy-900 hover:bg-brand-50 dark:hover:bg-brand-950/40 text-brand-700 dark:text-cyan-400 font-semibold px-3 py-1.5 rounded-full border border-slate-200 dark:border-navy-700 hover:border-brand-300 dark:hover:border-cyan-600 shadow-xs flex items-center gap-1 transition-all"
                  >
                    <span>{act}</span>
                    <ChevronRight className="w-3 h-3 text-brand-500 dark:text-cyan-400" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 p-3.5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl w-24 text-slate-400 shadow-xs">
            <span className="w-1.5 h-1.5 bg-brand-600 rounded-full animate-bounce"></span>
            <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer Chat Input */}
      <div className="p-4 border-t border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about attendance, leaves, payslips..."
            className="flex-1 text-xs px-4 py-3 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-navy-950 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="p-3 bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-700 hover:to-cyan-700 disabled:opacity-50 text-white rounded-2xl shadow-apple transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
