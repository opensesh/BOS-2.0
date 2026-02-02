# BOS-2.0

> **Note:** BOS-2.0 is the evolution of [BOS-1.0](https://github.com/opensesh/BOS-1.0), which explored Figma MCP + Claude Code + Cursor as a design-to-code pipeline. BOS-2.0 takes that learning and builds a standalone systems UI application where the code itself is the design system — no Figma dependency required.

**A code-first brand operating system — where design tokens, components, and brand logic live in the application itself, powered by AI.**

---

## 🎯 Philosophy

BOS-1.0 proved that AI could bridge the gap between design tools and code. BOS-2.0 asks: what if we remove the bridge entirely?

- **Code as source of truth** — Design tokens, typography scales, color systems, and component patterns are defined in code, not pulled from external tools
- **AI is native, not bolted on** — Anthropic and Perplexity integrations are woven into the core experience, from content generation to brand knowledge retrieval
- **Systems thinking over pixel pushing** — Every surface in the app is a living expression of the design system it manages

---

## 🏗️ Built on Solid Foundations

- **Code-First Design System** — Tokens, components, and brand rules live in `lib/brand-knowledge/`, not in a Figma file
- **AI-Native** — Anthropic SDK for chat and content generation, Perplexity for discovery and research
- **Full-Stack** — Next.js 15 with App Router, Supabase for persistence, Prisma for data modeling
- **Component-Driven** — React 19, TypeScript, Tailwind CSS with semantic design tokens
- **3D & Motion** — Three.js for spatial interfaces, GSAP and Framer Motion for interaction design

---

## ✨ Key Features

### 🎨 Brand Hub
Identity management center — colors, typography, logos, design tokens, guidelines, and art direction all in one place. The system that manages itself.

### 🧠 Brain
AI-powered knowledge base for brand identity, writing styles, component documentation, and system architecture. Ask questions, get answers grounded in your brand.

### 🔍 Discover
Curated articles, inspiration, trending companies, and resource exploration with an interactive 3D visualization layer.

### 💰 Finance
Financial tracking and market data with per-symbol detail views.

### 🌐 Spaces
Workspace management with threaded chat — collaborative environments for projects and teams.

---

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/opensesh/BOS-2.0.git
cd BOS-2.0

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## 🤖 Automated Content Generation (Archived)

This repository previously included GitHub Actions workflows for automated content generation using AI APIs. These have been removed to keep this demo environment cost-free.

**The data in `public/data/` is now static.**

To restore automated content generation:

1. Checkout commit `5e86e49a` to retrieve the workflow files:
   ```bash
   git checkout 5e86e49a -- .github/workflows/daily-content.yml .github/workflows/generate-ideas.yml scripts/daily-content-generation.ts scripts/generate-ideas.ts
   ```

2. Add these GitHub repository secrets:
   - `ANTHROPIC_API_KEY` - For Claude AI content generation
   - `PERPLEXITY_API_KEY` - For research and source discovery
   - `PEXELS_API_KEY` - For brand-aligned imagery

3. Enable the workflows in GitHub Actions settings

**Estimated cost:** ~$6-16/month depending on usage.

---

## 📁 Project Structure

```
BOS-2.0/
├── app/                        # Next.js 15 App Router
│   ├── page.tsx               # Homepage
│   ├── brand-hub/             # Brand identity management
│   │   ├── colors/            # Color system
│   │   ├── fonts/             # Typography
│   │   ├── logo/              # Logo variations
│   │   ├── design-tokens/     # Token documentation
│   │   ├── guidelines/        # Brand guidelines
│   │   └── art-direction/     # Art direction
│   ├── brain/                 # AI knowledge base
│   │   ├── brand-identity/    # Brand info
│   │   ├── writing-styles/    # Writing guides
│   │   ├── components/        # Component library
│   │   └── architecture/      # System architecture
│   ├── discover/              # Content discovery
│   │   ├── inspo/             # Inspiration explorer
│   │   └── resources/         # 3D resource browser
│   ├── spaces/                # Workspace management
│   │   └── [slug]/chat/       # Threaded conversations
│   ├── finance/               # Financial tracking
│   └── api/                   # API routes
│       ├── chat/              # AI chat endpoint
│       ├── discover/          # Discovery data
│       ├── suggestions/       # AI suggestions
│       └── finance/           # Market data
├── components/                 # React components
│   ├── chat/                  # Chat interface system
│   ├── discover/              # Discovery UI
│   ├── spaces/                # Workspace components
│   ├── finance/               # Finance displays
│   ├── brain/                 # Knowledge base UI
│   ├── brand-hub/             # Brand management UI
│   └── ui/                    # Shared primitives
├── lib/                        # Core utilities
│   ├── ai/                    # LLM provider config
│   ├── brand-knowledge/       # Brand data & token index
│   ├── content-generator/     # Automated content tools
│   ├── stores/                # Zustand state management
│   ├── supabase/              # Database client
│   └── utils/                 # Helper functions
├── hooks/                      # Custom React hooks
├── types/                      # TypeScript definitions
├── supabase/                   # Migrations & DB config
├── scripts/                    # Build & generation scripts
└── assets/                     # Static assets
```

---

## 🔧 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 15, React 19 |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS, CSS Variables |
| **AI** | Anthropic AI SDK, Perplexity |
| **Database** | Supabase, Prisma |
| **3D** | Three.js, React Three Fiber, Drei |
| **Animation** | GSAP, Framer Motion |
| **State** | Zustand |
| **Auth** | NextAuth.js, Supabase SSR |
| **Validation** | Zod |
| **Analytics** | Vercel Analytics |
| **Deployment** | Vercel |

---

## 📖 Why Open Source?

The same reason we open-sourced BOS-1.0: we believe design infrastructure should be transparent, adaptable, and community-driven.

- **Learn** — See how a systems UI application is architected from tokens to production
- **Adapt** — Fork it, retheme it, make it yours
- **Contribute** — Improve patterns, fix bugs, suggest features

We're not building a SaaS product. We're building a reference implementation for what brand management software can look like when AI is a first-class citizen.

---

## 🔮 What's Next

- Deeper AI integration for real-time brand enforcement and content review
- Component library extraction as a standalone package
- Multi-brand support — manage multiple identities from one system
- Enhanced 3D spatial interfaces for brand exploration
- Plugin architecture for custom brand modules

---

Built by [OPEN SESSION](https://opensession.studio) — Powered by Claude AI

## 📄 License

[GNU General Public License v3.0](LICENSE)
