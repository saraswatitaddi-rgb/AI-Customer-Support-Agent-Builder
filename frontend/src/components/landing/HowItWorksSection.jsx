import React from 'react';
import { 
  Building2, 
  Bot, 
  UploadCloud, 
  Sliders, 
  PlayCircle, 
  Code2, 
  ArrowRight 
} from 'lucide-react';

const steps = [
  {
    step: '01',
    icon: Building2,
    title: 'Business Profile',
    desc: 'Enter business name, industry, and support hours to customize tenant parameters.',
  },
  {
    step: '02',
    icon: Bot,
    title: 'Design AI Agent',
    desc: 'Choose agent name, avatar, tone (Friendly, Professional), and custom fallback instructions.',
  },
  {
    step: '03',
    icon: UploadCloud,
    title: 'Upload Knowledge Base',
    desc: 'Import PDF menus, policy documents, CSV product tables, or scrape your existing website.',
  },
  {
    step: '04',
    icon: Sliders,
    title: 'RAG Pipeline & Embeddings',
    desc: 'Text is automatically chunked, vectorized, and indexed for sub-second semantic retrieval.',
  },
  {
    step: '05',
    icon: PlayCircle,
    title: 'Test & Validate in Sandbox',
    desc: 'Test tricky customer questions in real-time, inspect sources, and refine prompt boundaries.',
  },
  {
    step: '06',
    icon: Code2,
    title: 'Deploy Embeddable Widget',
    desc: 'Copy one line of JavaScript embed code to display a sleek floating chat bubble on your website.',
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs uppercase tracking-widest text-indigo-400 font-semibold mb-3">
            Simple 6-Step Implementation
          </h2>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            From Zero to Deployed AI Agent in Under 10 Minutes
          </p>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            No machine learning expertise or coding required. Our automated pipeline handles document chunking, embeddings, vector indexing, and real-time execution.
          </p>
        </div>

        {/* 6 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="glass-card rounded-2xl p-6 relative border border-white/5 hover:border-indigo-500/30 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-extrabold text-slate-800 group-hover:text-indigo-500/30 transition-colors font-mono">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Embed Widget Preview Callout */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-950/80 border border-indigo-500/20 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold">
              <Code2 className="w-4 h-4" />
              <span>One-Line JavaScript Embed Script</span>
            </div>
            <h4 className="text-xl font-bold text-white">Ready for Shopify, WordPress, Next.js, or HTML</h4>
            <p className="text-sm text-slate-400">
              Add a single tag to your website header to immediately start resolving visitor inquiries 24/7.
            </p>
          </div>
          <div className="w-full md:w-auto bg-slate-900/90 border border-white/10 rounded-xl px-4 py-3 font-mono text-xs text-indigo-300 flex items-center gap-3">
            <code>&lt;script src="https://agentcraft.ai/widget.js" data-agent="agent_nisa_89"&gt;&lt;/script&gt;</code>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
