import React from 'react';
import { 
  Bot, 
  FileText, 
  Cpu, 
  Users, 
  Headphones, 
  Languages, 
  Mic, 
  BarChart3, 
  ShieldCheck 
} from 'lucide-react';

const features = [
  {
    icon: Bot,
    title: 'No-Code AI Agent Studio',
    description: 'Customize agent name, tone (Friendly, Professional, Casual, Formal), persona, and custom welcome/fallback instructions in seconds.',
    badge: 'Customizable',
    gradient: 'from-blue-500/20 to-indigo-500/20',
    iconColor: 'text-indigo-400',
  },
  {
    icon: FileText,
    id: 'knowledge-base',
    title: 'Multi-Format Knowledge Base',
    description: 'Upload PDF catalogs, DOCX policies, TXT guides, CSV pricing sheets, or scrape website URLs. Automatically parsed and chunked.',
    badge: 'Smart Ingestion',
    gradient: 'from-purple-500/20 to-pink-500/20',
    iconColor: 'text-purple-400',
  },
  {
    icon: Cpu,
    title: 'Zero-Hallucination RAG',
    description: 'Vector embeddings and cosine similarity search strictly ground every answer in your business facts. If unknown, it gracefully escalates.',
    badge: 'Factual Accuracy',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    iconColor: 'text-emerald-400',
  },
  {
    icon: Headphones,
    title: 'Real-Time Human Handoff',
    description: 'Instant escalation to human support agents when queries require human intervention. Real-time ticket management powered by Socket.IO.',
    badge: 'Live Handoff',
    gradient: 'from-amber-500/20 to-orange-500/20',
    iconColor: 'text-amber-400',
  },
  {
    icon: Languages,
    title: 'Native Multilingual Support',
    description: 'Understands customer inquiries in English, Telugu ("Bengaluru ki delivery undha?"), and Hindi with regional dialect comprehension.',
    badge: 'Multi-Language',
    gradient: 'from-cyan-500/20 to-blue-500/20',
    iconColor: 'text-cyan-400',
  },
  {
    icon: Mic,
    title: 'Voice Interface (STT / TTS)',
    description: 'Browser speech recognition and speech synthesis enable customers to talk directly with your support agent on mobile and desktop.',
    badge: 'Voice Ready',
    gradient: 'from-pink-500/20 to-rose-500/20',
    iconColor: 'text-pink-400',
  },
  {
    icon: ShieldCheck,
    title: 'Multi-Tenant Data Isolation',
    description: 'Strict database and API tenant separation. Business A can never view or query Business B’s documents, customers, or conversations.',
    badge: 'Enterprise RBAC',
    gradient: 'from-violet-500/20 to-purple-500/20',
    iconColor: 'text-violet-400',
  },
  {
    icon: BarChart3,
    id: 'analytics',
    title: 'Deep Operational Analytics',
    description: 'Track resolution rate, intent distribution, average response latency, customer satisfaction ratings, and unresolved questions.',
    badge: 'Actionable Insights',
    gradient: 'from-indigo-500/20 to-sky-500/20',
    iconColor: 'text-sky-400',
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 relative bg-slate-950/40 border-t border-white/5 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs uppercase tracking-widest text-indigo-400 font-semibold mb-3">
            Enterprise Feature Suite
          </h2>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            Everything You Need to Automate Customer Support
          </p>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            Eliminate repetitive inquiries, reduce ticket wait times to seconds, and keep human agents focused on high-priority escalations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                id={feature.id}
                className="glass-card glass-card-hover rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group scroll-mt-28"
              >
                {/* Background ambient corner flare */}
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${feature.gradient} rounded-bl-full pointer-events-none transition-all group-hover:scale-110`} />

                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center shadow-md">
                      <Icon className={`w-6 h-6 ${feature.iconColor}`} />
                    </div>
                    <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
