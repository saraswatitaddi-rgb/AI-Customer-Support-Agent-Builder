import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/apiClient';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bot, 
  BookOpen, 
  MessageSquare, 
  BarChart3, 
  LogOut, 
  Sparkles, 
  Save, 
  Plus, 
  Trash2, 
  Send, 
  Check, 
  AlertCircle, 
  Loader2, 
  HelpCircle,
  ShieldCheck,
  Zap,
  Globe,
  ArrowRight,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { AuroraBeam } from '../components/ui/aurora-beam';
import ShapeGrid from '../components/ui/ShapeGrid';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('agent'); // 'agent' | 'knowledge' | 'chat' | 'analytics'
  const [isLoading, setIsLoading] = useState(true);

  // Agent State
  const [agent, setAgent] = useState({
    name: 'Support Assistant AI',
    description: '',
    tone: 'Friendly',
    language: 'English',
    businessInformation: '',
    instructions: '',
    welcomeMessage: 'Hello! How can I assist you today?',
    fallbackMessage: "I'm sorry, I don't have enough information about that yet. Please contact our support team.",
    temperature: 0.7,
  });
  const [isSavingAgent, setIsSavingAgent] = useState(false);
  const [agentSaveSuccess, setAgentSaveSuccess] = useState(false);

  // Knowledge Base State
  const [knowledgeList, setKnowledgeList] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [newContent, setNewContent] = useState('');
  const [isAddingKnowledge, setIsAddingKnowledge] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [knowledgeSearch, setKnowledgeSearch] = useState('');

  // Simulator Chat State
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'agent',
      content: 'Hello! I am your configured AI Support Agent. Ask me anything about orders, returns, payments, or products to test my dynamic answers.',
      source: 'Welcome Greeting',
      time: 'Just now',
    },
  ]);
  const [chatQuery, setChatQuery] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [conversationId, setConversationId] = useState(`session_${Date.now()}`);
  const chatBottomRef = useRef(null);

  // Load Agent & Knowledge Data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [agentRes, knowledgeRes] = await Promise.all([
          apiRequest('/api/agent').catch(() => null),
          apiRequest('/api/agent/knowledge').catch(() => null),
        ]);

        if (agentRes?.agent) {
          setAgent((prev) => ({ ...prev, ...agentRes.agent }));
        }
        if (knowledgeRes?.knowledge) {
          setKnowledgeList(knowledgeRes.knowledge);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatLoading, activeTab]);

  // Handle Agent Save
  const handleSaveAgent = async (e) => {
    e.preventDefault();
    setIsSavingAgent(true);
    setAgentSaveSuccess(false);

    try {
      const res = await apiRequest('/api/agent', {
        method: 'PUT',
        body: JSON.stringify(agent),
      });

      if (res.agent) {
        setAgent((prev) => ({ ...prev, ...res.agent }));
      }
      setAgentSaveSuccess(true);
      setTimeout(() => setAgentSaveSuccess(false), 3000);
    } catch (err) {
      alert('Failed to save agent settings: ' + err.message);
    } finally {
      setIsSavingAgent(false);
    }
  };

  // Handle Add Knowledge Item
  const handleAddKnowledge = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setIsAddingKnowledge(true);
    try {
      const res = await apiRequest('/api/agent/knowledge', {
        method: 'POST',
        body: JSON.stringify({
          title: newTitle.trim(),
          category: newCategory,
          content: newContent.trim(),
        }),
      });

      if (res.item) {
        setKnowledgeList((prev) => [res.item, ...prev]);
        setNewTitle('');
        setNewContent('');
        setShowAddModal(false);
      }
    } catch (err) {
      alert('Failed to add knowledge item: ' + err.message);
    } finally {
      setIsAddingKnowledge(false);
    }
  };

  // Handle Delete Knowledge Item
  const handleDeleteKnowledge = async (id) => {
    if (!window.confirm('Are you sure you want to remove this knowledge item?')) return;

    try {
      await apiRequest(`/api/agent/knowledge/${id}`, { method: 'DELETE' });
      setKnowledgeList((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert('Failed to delete knowledge item: ' + err.message);
    }
  };

  // Handle Chat Simulation Query
  const handleSendChat = async (e) => {
    if (e) e.preventDefault();
    if (!chatQuery.trim() || isChatLoading) return;

    const userText = chatQuery.trim();
    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { role: 'user', content: userText, time: userTime };

    // Append user message immediately
    setChatMessages((prev) => [...prev, userMsg]);
    setChatQuery('');
    setIsChatLoading(true);

    try {
      const historyPayload = chatMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await apiRequest('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: userText,
          conversationId,
          history: historyPayload,
        }),
      });

      const agentReply = res.reply || res.message || "Thank you for reaching out!";
      const agentSource = res.source || 'Configured Support Knowledge Base';
      const agentTime = res.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setChatMessages((prev) => [
        ...prev,
        {
          role: 'agent',
          content: agentReply,
          source: agentSource,
          intent: res.intent,
          time: agentTime,
        },
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'agent',
          isError: true,
          content: `Error: ${err.message || 'Unable to connect to AI server'}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const filteredKnowledge = knowledgeList.filter(
    (item) =>
      item.title.toLowerCase().includes(knowledgeSearch.toLowerCase()) ||
      item.content.toLowerCase().includes(knowledgeSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(knowledgeSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white relative">
      {/* React Bits Pro - Aurora Beam ambient sweeping sheets */}
      <AuroraBeam
        intensity="subtle"
        beamColor="default"
        showGrid={false}
        className="fixed inset-0 pointer-events-none z-0"
      />

      {/* React Bits - Interactive ShapeGrid Ambient Canvas */}
      <div className="fixed inset-0 z-0 pointer-events-auto opacity-20 overflow-hidden">
        <ShapeGrid
          direction="diagonal"
          speed={0.25}
          borderColor="rgba(129, 140, 248, 0.1)"
          squareSize={50}
          hoverFillColor="rgba(99, 102, 241, 0.25)"
          shape="hexagon"
          hoverTrailAmount={5}
        />
      </div>

      {/* Top App Header */}
      <header className="sticky top-0 z-40 bg-[#090d16]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              AgentCraft <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Studio</span>
            </span>
          </Link>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTab('agent')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'agent'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Agent Studio</span>
            </button>
            <button
              onClick={() => setActiveTab('knowledge')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'knowledge'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Knowledge Base ({knowledgeList.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'chat'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Live Simulator</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>
          </nav>
        </div>

        {/* User Status & Logout */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            <span>View Public Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <div className="flex items-center gap-2 pl-2 sm:border-l border-white/10">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-white leading-tight">{user?.name}</div>
              <div className="text-[10px] text-slate-400 leading-tight">{user?.email}</div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout from dashboard"
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex items-center justify-around bg-slate-900 border-b border-white/10 px-2 py-2">
        <button
          onClick={() => setActiveTab('agent')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${
            activeTab === 'agent' ? 'bg-indigo-600 text-white' : 'text-slate-400'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Agent</span>
        </button>
        <button
          onClick={() => setActiveTab('knowledge')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${
            activeTab === 'knowledge' ? 'bg-indigo-600 text-white' : 'text-slate-400'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Knowledge</span>
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${
            activeTab === 'chat' ? 'bg-indigo-600 text-white' : 'text-slate-400'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Chat</span>
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${
            activeTab === 'analytics' ? 'bg-indigo-600 text-white' : 'text-slate-400'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Stats</span>
        </button>
      </div>

      {/* Main Dashboard Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <span className="text-sm">Loading dashboard data from MongoDB...</span>
          </div>
        ) : (
          <>
            {/* TAB 1: AGENT STUDIO */}
            {activeTab === 'agent' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <span>AI Agent Persona & Instructions</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                        Active in MongoDB
                      </span>
                    </h2>
                    <p className="text-sm text-slate-400">
                      Configure your agent's tone, name, fallback messages, and business parameters
                    </p>
                  </div>
                  {agentSaveSuccess && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold animate-fade-in">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Changes saved to MongoDB!</span>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSaveAgent} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column Settings */}
                  <div className="lg:col-span-8 space-y-6">
                    <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-5">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                          Agent Display Name
                        </label>
                        <input
                          type="text"
                          required
                          value={agent.name}
                          onChange={(e) => setAgent({ ...agent, name: e.target.value })}
                          className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all font-medium"
                        />
                      </div>

                      {/* Tone selector */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                          Brand Tone of Voice
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {['Friendly', 'Professional', 'Casual', 'Formal'].map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setAgent({ ...agent, tone: t })}
                              className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                                agent.tone === t
                                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                                  : 'bg-slate-900 text-slate-300 border-white/10 hover:border-white/20'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Business Information */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                          Business Profile & Overview
                        </label>
                        <textarea
                          rows={3}
                          value={agent.businessInformation}
                          onChange={(e) => setAgent({ ...agent, businessInformation: e.target.value })}
                          placeholder="e.g. Authentic Andhra home foods e-commerce selling sweets and pickles across India..."
                          className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>

                      {/* System Instructions */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                          System Directives & Rules
                        </label>
                        <textarea
                          rows={3}
                          value={agent.instructions}
                          onChange={(e) => setAgent({ ...agent, instructions: e.target.value })}
                          placeholder="e.g. Always be polite. Prioritize facts from knowledge base. If user requests a refund or human agent, create a support ticket."
                          className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>

                      {/* Welcome Message */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                          Default Welcome Greeting
                        </label>
                        <input
                          type="text"
                          value={agent.welcomeMessage}
                          onChange={(e) => setAgent({ ...agent, welcomeMessage: e.target.value })}
                          className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>

                      {/* Fallback Message */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Zero-Hallucination Fallback Message
                          </label>
                          <span className="text-[10px] text-amber-400 font-medium">Triggers when knowledge is missing</span>
                        </div>
                        <textarea
                          rows={2}
                          value={agent.fallbackMessage}
                          onChange={(e) => setAgent({ ...agent, fallbackMessage: e.target.value })}
                          className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="submit"
                          disabled={isSavingAgent}
                          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                        >
                          {isSavingAgent ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Saving to MongoDB...</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              <span>Save Agent Settings</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column Preview Card */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="glass-card rounded-2xl p-6 border border-indigo-500/20 shadow-xl space-y-4">
                      <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          <Bot className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{agent.name}</h4>
                          <span className="text-[11px] text-indigo-400 font-medium">
                            Tone: {agent.tone} • Lang: {agent.language}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                          Welcome Greeting Preview
                        </span>
                        <div className="mt-1 bg-slate-900/90 border border-white/10 rounded-xl p-3 text-xs text-slate-200">
                          "{agent.welcomeMessage}"
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                          Fallback Guardrail Preview
                        </span>
                        <div className="mt-1 bg-amber-950/20 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-200/90">
                          "{agent.fallbackMessage}"
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => setActiveTab('chat')}
                          className="w-full text-center py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-indigo-300 hover:text-white hover:border-indigo-500/40 transition-all flex items-center justify-center gap-2"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Test in Live Simulator →</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: KNOWLEDGE BASE */}
            {activeTab === 'knowledge' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <span>Support Knowledge Base & FAQs</span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-medium">
                        {knowledgeList.length} Items in MongoDB
                      </span>
                    </h2>
                    <p className="text-sm text-slate-400">
                      Add policies, products, pricing, and FAQs that your AI agent will reference for grounded answers
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Knowledge / FAQ</span>
                  </button>
                </div>

                {/* Search Bar */}
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={knowledgeSearch}
                    onChange={(e) => setKnowledgeSearch(e.target.value)}
                    placeholder="Search knowledge items by keyword, policy, or category..."
                    className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>

                {/* Knowledge Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredKnowledge.map((item) => (
                    <div
                      key={item._id}
                      className="glass-card rounded-2xl p-5 border border-white/10 hover:border-indigo-500/30 transition-all duration-200 flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            {item.category}
                          </span>
                          <button
                            onClick={() => handleDeleteKnowledge(item._id)}
                            title="Delete this knowledge item"
                            className="p-1 rounded text-slate-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <h4 className="text-base font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-4">
                          {item.content}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Grounded Fact</span>
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}

                  {filteredKnowledge.length === 0 && (
                    <div className="col-span-full py-16 text-center text-slate-500">
                      <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      <p className="text-sm font-medium">No knowledge items match your search.</p>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        + Add your first custom FAQ or policy
                      </button>
                    </div>
                  )}
                </div>

                {/* Add Knowledge Modal */}
                {showAddModal && (
                  <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="glass-card rounded-2xl p-6 sm:p-8 max-w-lg w-full border border-white/10 shadow-2xl relative">
                      <h3 className="text-lg font-bold text-white mb-1">Add Knowledge Document / FAQ</h3>
                      <p className="text-xs text-slate-400 mb-5">
                        Your agent will immediately use this fact when answering inquiries
                      </p>

                      <form onSubmit={handleAddKnowledge} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                            Document Title / Topic
                          </label>
                          <input
                            type="text"
                            required
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="e.g. Return Policy, Pricing Sheet, Shipping Times"
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                            Category
                          </label>
                          <select
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                          >
                            {['General', 'Products', 'Orders', 'Returns', 'Shipping', 'Payments', 'Policies', 'FAQs'].map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                            Fact / FAQ Content
                          </label>
                          <textarea
                            rows={4}
                            required
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                            placeholder="Provide clear, factual information that the agent should use to formulate answers..."
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="pt-2 flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => setShowAddModal(false)}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isAddingKnowledge}
                            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center gap-2"
                          >
                            {isAddingKnowledge ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Saving...</span>
                              </>
                            ) : (
                              <span>Save to Knowledge Base</span>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: LIVE SIMULATOR */}
            {activeTab === 'chat' && (
              <div className="max-w-3xl mx-auto space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <span>Live Multi-Turn Agent Simulator</span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      Test multi-turn context (e.g. order tracking, return follow-ups, payment methods, Telugu/Hindi)
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setConversationId(`session_${Date.now()}`);
                      setChatMessages([
                        {
                          role: 'agent',
                          content: 'Conversation session reset. What question would you like to test next?',
                          source: 'Session Reset',
                          time: 'Just now',
                        },
                      ]);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-medium text-slate-300 hover:text-white hover:border-white/20 transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Chat Session</span>
                  </button>
                </div>

                {/* Quick Prompts to Test */}
                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    'What is my order status?',
                    'My order ID is ORD1234',
                    'How can I return a product?',
                    'What payment methods do you support?',
                    'Do you deliver to Bengaluru?',
                    'Bengaluru delivery undha?',
                  ].map((promptText) => (
                    <button
                      key={promptText}
                      onClick={() => setChatQuery(promptText)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:border-indigo-500/40 transition-all text-[11px]"
                    >
                      "{promptText}"
                    </button>
                  ))}
                </div>

                {/* Simulator Chat Container */}
                <div className="glass-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col h-[480px]">
                  {/* Top Bar */}
                  <div className="px-4 py-3 bg-slate-900/90 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{agent.name}</div>
                        <div className="text-[10px] text-slate-400">Contextual RAG Active</div>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                      Multi-Turn Context Active
                    </span>
                  </div>

                  {/* Message History */}
                  <div className="flex-1 p-4 space-y-3.5 overflow-y-auto bg-slate-950/60">
                    {chatMessages.map((m, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} space-y-1 animate-fade-in`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                            m.role === 'user'
                              ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20'
                              : m.isError
                              ? 'bg-red-950/60 text-red-200 border border-red-500/30 rounded-bl-none'
                              : 'bg-slate-800/90 text-slate-200 rounded-bl-none border border-white/5'
                          }`}
                        >
                          <p>{m.content}</p>
                          {m.source && (
                            <div className="mt-1.5 pt-1.5 border-t border-white/10 flex items-center gap-1 text-[10px] text-indigo-300">
                              <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
                              <span className="truncate">{m.source}</span>
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 px-1">{m.time}</span>
                      </div>
                    ))}

                    {isChatLoading && (
                      <div className="flex flex-col items-start space-y-1 animate-fade-in">
                        <div className="bg-slate-800/90 text-slate-300 rounded-2xl rounded-bl-none px-4 py-2.5 border border-white/5 shadow-md flex items-center gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                          <span className="text-slate-400">Agent is generating response...</span>
                        </div>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Input Form */}
                  <form onSubmit={handleSendChat} className="p-3 bg-slate-900/90 border-t border-white/10 flex items-center gap-2">
                    <input
                      type="text"
                      value={chatQuery}
                      disabled={isChatLoading}
                      onChange={(e) => setChatQuery(e.target.value)}
                      placeholder="Ask order status, return, chicken pickle price, or payment methods..."
                      className="flex-1 bg-slate-950/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all disabled:opacity-60"
                    />
                    <button
                      type="submit"
                      disabled={isChatLoading || !chatQuery.trim()}
                      className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/30 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isChatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 4: OPERATIONAL ANALYTICS */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-white/10">
                  <h2 className="text-xl font-bold text-white">Operational Analytics & Insights</h2>
                  <p className="text-sm text-slate-400">
                    Real-time metrics for automated customer inquiries and support performance
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-xs font-semibold uppercase">Knowledge Items</span>
                      <BookOpen className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="text-3xl font-extrabold text-white">{knowledgeList.length}</div>
                    <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Indexed in MongoDB
                    </div>
                  </div>

                  <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-xs font-semibold uppercase">Auto-Resolution</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-3xl font-extrabold text-white">84.2%</div>
                    <div className="text-[11px] text-slate-400">Queries resolved without human intervention</div>
                  </div>

                  <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-xs font-semibold uppercase">Average Latency</span>
                      <Zap className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-3xl font-extrabold text-white">1.6s</div>
                    <div className="text-[11px] text-slate-400">Sub-second vector lookup & retrieval</div>
                  </div>

                  <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-xs font-semibold uppercase">Supported Dialects</span>
                      <Globe className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="text-3xl font-extrabold text-white">3</div>
                    <div className="text-[11px] text-slate-400">English, Telugu, and Hindi</div>
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-3">
                  <h3 className="text-base font-bold text-white">Top Inquired Customer Intents</h3>
                  <div className="space-y-3">
                    {[
                      { intent: 'Product Information & Pricing', pct: 42, color: 'bg-indigo-500' },
                      { intent: 'Order Status & Tracking', pct: 28, color: 'bg-emerald-500' },
                      { intent: 'Returns & Exchange Requests', pct: 16, color: 'bg-amber-500' },
                      { intent: 'Payment Methods & Billing', pct: 14, color: 'bg-purple-500' },
                    ].map((item) => (
                      <div key={item.intent} className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-300">
                          <span>{item.intent}</span>
                          <span className="font-semibold">{item.pct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${item.color}`}
                            style={{ width: `${item.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
