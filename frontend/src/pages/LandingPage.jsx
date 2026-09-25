import React from 'react';
import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import AgentPreviewSection from '../components/landing/AgentPreviewSection';
import { 
  Bot, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Activity, 
  MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuroraBeam } from '../components/ui/aurora-beam';
import ShapeGrid from '../components/ui/ShapeGrid';

function LandingPage() {
  const { isAuthenticated } = useAuth();

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Fixed Sticky Header Navigation */}
      <Navbar />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero Section with Interactive Live Support Agent Demo */}
        <HeroSection />

        {/* Enterprise Feature Suite */}
        <FeaturesSection />

        {/* 6-Step Implementation Flow */}
        <HowItWorksSection />

        {/* Real-time Agent Studio Personality & Guardrails Customizer */}
        <AgentPreviewSection />

        {/* High-Converting Pre-Footer CTA Section */}
        <section className="py-20 relative overflow-hidden bg-gradient-to-b from-slate-950/60 to-[#090d16] border-t border-white/5">
          {/* React Bits Pro - Aurora Beam cosmic layered sheets */}
          <AuroraBeam
            intensity="vibrant"
            beamColor="cosmic"
            showGrid={false}
            className="absolute inset-0 z-0 opacity-80 pointer-events-none"
          />

          {/* React Bits - Interactive ShapeGrid with Mouse Hover Trails */}
          <div className="absolute inset-0 z-0 pointer-events-auto opacity-40 overflow-hidden">
            <ShapeGrid
              direction="diagonal"
              speed={0.35}
              borderColor="rgba(168, 85, 247, 0.18)"
              squareSize={46}
              hoverFillColor="rgba(168, 85, 247, 0.35)"
              shape="hexagon"
              hoverTrailAmount={6}
            />
          </div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="glass-card rounded-3xl p-8 sm:p-12 md:p-16 border border-indigo-500/20 text-center relative overflow-hidden shadow-2xl shadow-indigo-500/10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Launch in Under 10 Minutes</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
                Ready to Automate Your <span className="text-gradient">Customer Support?</span>
              </h2>

              <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
                Connect your business catalog, configure your agent's tone, and deploy your customized AI support assistant anywhere.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Bot className="w-4 h-4" />
                    <span>Open Your AI Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <Link
                    to="/register"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Bot className="w-4 h-4" />
                    <span>Build Your Agent Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
                <button
                  onClick={() => scrollToSection('chat-demo')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-sm border border-white/10 transition-all duration-200 hover:border-white/20"
                >
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  <span>Test Interactive Simulator</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 pt-4 border-t border-white/5">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Zero Hallucinations Guarantee
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Multi-Tenant Data Isolation
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Seamless Human Escalation
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Production-Grade Modern Footer */}
      <footer className="border-t border-white/10 bg-[#070a12] pt-14 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Brand Column */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  AgentCraft <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">AI</span>
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
                Autonomous, multi-tenant AI customer support agent builder. Powered by Retrieval-Augmented Generation (RAG), vector search, and real-time human escalation.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  All Core Services Operational
                </span>
              </div>
            </div>

            {/* Quick Navigation */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-4">
                Platform Navigation
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li>
                  <button onClick={() => scrollToSection('features')} className="hover:text-indigo-400 transition-colors">
                    Feature Suite
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('how-it-works')} className="hover:text-indigo-400 transition-colors">
                    How It Works
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('ai-agent')} className="hover:text-indigo-400 transition-colors">
                    Agent Studio
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('knowledge-base')} className="hover:text-indigo-400 transition-colors">
                    Knowledge Base (RAG)
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('chat-demo')} className="hover:text-indigo-400 transition-colors">
                    Interactive Chat Simulator
                  </button>
                </li>
              </ul>
            </div>

            {/* Architecture & Stack */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-4">
                Architecture
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Strict Tenant Isolation</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Real-Time Socket.IO Handoff</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Multi-Turn Contextual RAG</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-pink-400" />
                  <span>Multilingual Support</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              © {new Date().getFullYear()} AgentCraft AI Builder. Built with React 19 & Tailwind CSS.
            </div>
            <div className="flex items-center gap-6">
              <span className="hover:text-slate-400 transition-colors cursor-pointer">Privacy Policy</span>
              <span className="hover:text-slate-400 transition-colors cursor-pointer">Terms of Service</span>
              <span className="hover:text-slate-400 transition-colors cursor-pointer">Security Whitepaper</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
