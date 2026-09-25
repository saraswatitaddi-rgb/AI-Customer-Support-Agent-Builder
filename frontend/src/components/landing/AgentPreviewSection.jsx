import React, { useState } from 'react';
import { Bot, Sliders, Globe, MessageSquare, ShieldAlert, Sparkles, Check } from 'lucide-react';

const AgentPreviewSection = () => {
  const [tone, setTone] = useState('Friendly');
  const [language, setLanguage] = useState('English');
  const [agentName, setAgentName] = useState('Nisa Support AI');

  const toneExamples = {
    Friendly: "Hi there! 😊 I'm Nisa Support AI. I'm excited to help you find your favorite home-style sweets, savories, and pickles today!",
    Professional: "Welcome to Nisa Home Foods Customer Support. My name is Nisa Support AI. How may I assist with your order or product inquiries?",
    Casual: "Hey! What's up? I'm your Nisa support pal. Looking for fresh chicken pickle or delivery times? Just ask!",
    Formal: "Greetings. I am Nisa Support AI, your dedicated support representative for Nisa Home Foods. Please state your inquiry.",
  };

  const fallbackExamples = {
    English: "I don't have enough verified information in our store knowledge base to answer that accurately. Would you like me to connect you with a human support agent?",
    Telugu: "క్షమించండి, మా నాలెడ్జ్ బేస్‌లో ఈ ప్రశ్నకు ఖచ్చితమైన సమాచారం లేదు. మా సపోర్ట్ ఎగ్జిక్యూటివ్‌తో మాట్లాడించమంటారా?",
    Hindi: "माफ़ कीजिये, हमारे स्टोर के नॉलेज बेस में इस बारे में पर्याप्त जानकारी नहीं है। क्या आप किसी कस्टमर सपोर्ट एजेंट से बात करना चाहेंगे?",
    'Multi-language': "I couldn't locate that in our records. Would you like me to connect you with our human team? / మా టీమ్‌తో మాట్లాడించమంటారా?",
  };

  return (
    <section id="ai-agent" className="py-24 relative bg-slate-950/60 border-t border-white/5 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs uppercase tracking-widest text-indigo-400 font-semibold mb-3">
            Intuitive Agent Studio
          </h2>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            Configure Personality, Tone & Guardrails in Real-Time
          </p>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            Tailor how your AI interacts with customers. Switch personas, set response temperatures, and configure strict fallback messages when answers are not in the knowledge base.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Controls Panel (Left) */}
          <div className="lg:col-span-6 glass-card rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Agent Display Name
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>
            </div>

            {/* Tone Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Brand Tone of Voice
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Friendly', 'Professional', 'Casual', 'Formal'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      tone === t
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                        : 'bg-slate-900 text-slate-300 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Primary Regional Language
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['English', 'Telugu', 'Hindi', 'Multi-language'].map((l) => (
                  <button
                    key={l}
                    onClick={() => setLanguage(l)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      language === l
                        ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
                        : 'bg-slate-900 text-slate-300 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Business Purpose */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Agent Purpose & Domain
              </label>
              <p className="text-xs text-slate-300 bg-slate-900/90 border border-white/10 rounded-xl p-3">
                Customer support, pricing inquiries, order tracking, and product information for authentic homemade Andhra snacks & non-veg pickles.
              </p>
            </div>
          </div>

          {/* Interactive Agent Card Preview (Right) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-2xl glass-card border border-indigo-500/20 p-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">{agentName}</h4>
                    <span className="text-xs text-indigo-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Tone: {tone} • Lang: {language}
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                  Ready to Deploy
                </span>
              </div>

              {/* Dynamic Welcome Message */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Dynamic Welcome Message
                  </span>
                  <div className="bg-slate-900/90 border border-white/10 rounded-xl p-3.5 text-sm text-slate-200">
                    "{toneExamples[tone]}"
                  </div>
                </div>

                {/* Dynamic Fallback Guardrail */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                      Zero-Hallucination Fallback Message
                    </span>
                    <span className="text-[10px] text-amber-400 font-mono">Triggers when facts missing</span>
                  </div>
                  <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-3.5 text-sm text-amber-200/90">
                    "{fallbackExamples[language]}"
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AgentPreviewSection;
