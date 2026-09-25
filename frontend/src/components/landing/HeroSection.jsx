import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Bot, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Globe2, 
  Send,
  ThumbsUp,
  ThumbsDown,
  UserCheck,
  Loader2,
  AlertCircle
} from 'lucide-react';

const HeroSection = () => {
  const [demoQuery, setDemoQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'user',
      text: 'Do you deliver Chicken Pickle to Bengaluru?',
      time: '11:42 AM',
    },
    {
      sender: 'agent',
      text: 'Yes! We deliver Chicken Pickle to Bengaluru via express courier. Delivery typically takes 2-3 business days. 250g is ₹250 and 500g is ₹500.',
      source: 'Knowledge Source: Nisa Delivery Policy & Menu.pdf',
      time: '11:42 AM',
      intent: 'DELIVERY_QUERY',
    },
  ]);

  const messagesEndRef = useRef(null);

  // Automatically scroll to the newest message whenever messages or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!demoQuery || !demoQuery.trim() || isLoading) return;

    const userText = demoQuery.trim();
    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = { sender: 'user', text: userText, time: userTime };

    // Add the user message to the chat immediately
    setMessages((prev) => [...prev, newMsg]);
    setDemoQuery('');
    setIsLoading(true);

    try {
      // Call the existing backend chat API (try relative /api/chat via proxy, fallback to port 5000)
      let response;
      try {
        response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userText }),
        });
      } catch (err) {
        response = await fetch('http://localhost:5000/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userText }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      const reply = data.reply || data.response || data.message || "Thank you for reaching out!";
      const source = data.source || "Knowledge Source: Nisa Home Foods Knowledge Base";
      const time = data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Display the AI response in the chat
      setMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: reply,
          source,
          time,
          intent: data.intent || 'GENERAL_QUERY',
        },
      ]);
    } catch (err) {
      console.error('Chat API Error:', err);
      // Show an error message if the API request fails
      setMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          isError: true,
          text: `Error connecting to AI backend: ${err.message || 'Server unavailable'}. Please verify the server is running on port 5000 and try again.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background Radial Glow Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-8 animate-fade-in shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Next-Gen Enterprise RAG Customer Support Platform</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15] mb-6">
            Build Your Own <span className="text-gradient">AI Customer Support Agent</span> Without Code
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-300 mb-10 leading-relaxed font-normal">
            Empower your business with an autonomous AI support assistant trained on your own documents, FAQs, and product catalog. Answers accurately with zero hallucinations and seamlessly hands off to human agents when needed.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <button
              onClick={() => {
                const el = document.getElementById('ai-agent');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-base shadow-xl shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Build Your AI Agent Free</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('chat-demo');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-base border border-white/10 transition-all duration-200 hover:border-white/20"
            >
              <span>Try Interactive Simulator</span>
            </button>
          </div>

          {/* Metrics & Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/10 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-sm font-medium">78% Auto-Resolution</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="text-sm font-medium">RAG Grounded Facts</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-slate-300">
              <Globe2 className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="text-sm font-medium">Multilingual (Telugu/Hindi)</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-slate-300">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-sm font-medium">&lt; 3.5s Avg Response</span>
            </div>
          </div>
        </div>

        {/* Live Interactive Hero Demo Card */}
        <div id="chat-demo" className="mt-14 max-w-3xl mx-auto scroll-mt-28">
          <div className="relative rounded-2xl glass-card border border-white/10 p-1 shadow-2xl shadow-indigo-500/10">
            {/* Top Bar */}
            <div className="px-4 py-3 bg-slate-900/90 rounded-t-xl border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                    NA
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                    Nisa Support AI
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-medium">Online</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Trained on Nisa Home Foods Knowledge Base</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md border border-white/5">
                  RAG Pipeline Active
                </span>
              </div>
            </div>

            {/* Chat Body */}
            <div className="p-4 sm:p-6 space-y-4 max-h-[340px] overflow-y-auto bg-slate-950/60">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'} space-y-1 animate-fade-in`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20'
                        : m.isError
                        ? 'bg-red-950/60 text-red-200 border border-red-500/30 rounded-bl-none shadow-md'
                        : 'bg-slate-800/90 text-slate-200 rounded-bl-none border border-white/5 shadow-md'
                    }`}
                  >
                    {m.isError && (
                      <div className="flex items-center gap-1.5 text-xs text-red-400 font-semibold mb-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Connection Alert</span>
                      </div>
                    )}
                    <p>{m.text}</p>
                    {m.source && (
                      <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-1 text-[11px] text-indigo-300">
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                        <span>{m.source}</span>
                      </div>
                    )}
                  </div>
                  {m.sender === 'agent' && !m.isError && (
                    <div className="flex items-center gap-2 text-xs text-slate-400 pl-1 pt-0.5">
                      <button className="hover:text-emerald-400 flex items-center gap-1 transition-colors">
                        <ThumbsUp className="w-3 h-3" /> Helpful
                      </button>
                      <span>•</span>
                      <button className="hover:text-red-400 flex items-center gap-1 transition-colors">
                        <ThumbsDown className="w-3 h-3" />
                      </button>
                      <span>•</span>
                      <button 
                        onClick={() => {
                          setMessages((prev) => [
                            ...prev,
                            {
                              sender: 'agent',
                              text: 'Ticket #1043 created. Connecting you with our on-duty support specialist right now!',
                              source: 'Human Handoff Request Initiated',
                              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            }
                          ]);
                        }}
                        className="hover:text-amber-300 text-amber-400 flex items-center gap-1 transition-colors"
                      >
                        <UserCheck className="w-3 h-3" /> Talk to support
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* Typing / Loading Indicator */}
              {isLoading && (
                <div className="flex flex-col items-start space-y-1 animate-fade-in">
                  <div className="bg-slate-800/90 text-slate-300 rounded-2xl rounded-bl-none px-4 py-3 border border-white/5 shadow-md flex items-center gap-2.5 text-sm">
                    <div className="flex items-center gap-1.5 py-0.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-slate-400">Nisa Support AI is thinking...</span>
                  </div>
                </div>
              )}

              {/* Anchor for Auto-Scrolling to Newest Message */}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-3 bg-slate-900/90 border-t border-white/10 rounded-b-xl flex items-center gap-2">
              <input
                type="text"
                value={demoQuery}
                disabled={isLoading}
                onChange={(e) => setDemoQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                placeholder={isLoading ? "Generating response..." : "Ask about products, delivery, chicken pickle price, or request human..."}
                className="flex-1 bg-slate-950/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isLoading || !demoQuery.trim()}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/30 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-indigo-600 disabled:active:scale-100 flex items-center justify-center"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
