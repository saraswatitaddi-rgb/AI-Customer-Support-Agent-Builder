# AI-Customer-Support-Agent-Builder

A modern, production-grade Full-Stack SaaS platform to build, customize, and deploy autonomous AI Customer Support Agents with RAG (Retrieval-Augmented Generation), multi-lingual support, and real-time human escalation.

---

## 🚀 Key Features

- **No-Code AI Agent Studio**: Configure agent personality, tone (Friendly, Professional, Casual, Formal), system instructions, and zero-hallucination fallback messages.
- **RAG Grounding & Knowledge Base**: Answers customer questions grounded strictly in store catalogs, PDFs, menus, and CSV sheets.
- **Multilingual Support**: Comprehends and responds in English, Telugu, Hindi, and regional dialects.
- **Live Interactive Simulator**: Real-time chat widget embedded on the landing page connected to backend AI pipelines.
- **Human Agent Escalation**: Automatically generates escalation tickets and seamless handoff for complex customer inquiries.
- **Multi-Tenant Architecture**: Strict tenant data isolation between businesses and accounts.
- **Modern Dark UI**: Designed with Tailwind CSS, Lucide icons, glassmorphism, and responsive layouts across mobile, tablet, and desktop.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19 + Vite 6
- **Styling**: Tailwind CSS + Custom Glassmorphism System
- **Icons**: Lucide React
- **HTTP Client**: Native Fetch API with Vite `/api` proxy

### Backend
- **Runtime**: Node.js + Express.js
- **Real-Time Communication**: Socket.IO
- **Database**: MongoDB (via Mongoose) & SQLite (via Prisma)
- **AI / RAG Pipeline**: Intent classification, semantic vector extraction, and LLM synthesis

---

## 📦 Project Structure

```text
├── frontend/                # React Vite client
│   ├── src/
│   │   ├── components/landing/  # Navbar, Hero, Features, HowItWorks, AgentPreview
│   │   ├── App.jsx              # Landing page assembly
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Tailwind & glassmorphism theme
│   ├── vite.config.js       # Vite configuration with /api proxy
│   └── package.json
│
├── backend/                 # Express backend server
│   ├── src/
│   │   ├── ai/              # Intent classification & LLM provider
│   │   ├── config/          # Environment variables & DB config
│   │   └── middleware/      # Error handler & Auth
│   ├── server.js            # Express & Socket.IO server with /api/chat
│   └── package.json
│
├── package.json             # Root monorepo orchestration
└── README.md
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Configure Environment Variables
Copy and set up environment files in `backend/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/ai_support_builder
JWT_SECRET=super-secret-jwt-key
```

### 3. Run Locally in Development
To run both backend and frontend concurrently:
```bash
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

---

## 🌐 Production Build & Deployment

To build both the backend and frontend for production:
```bash
npm run build
```

The compiled frontend will be located in `frontend/dist/`.

---

## 📜 License
MIT License. Built for enterprise AI customer support automation.
