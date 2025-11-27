# Brand OS Architecture

This website is structured to serve both as a landing page for humans and as a well-organized resource for AI agent interpretation. Think of it as our brand brain that will continue to grow and extend use cases over time.

## Directory Structure

```
├── .claude/                    # Claude AI configuration
│   ├── commands/               # Custom slash commands
│   ├── knowledge/              # Brand knowledge base
│   │   ├── core/               # Brand identity, messaging, art direction
│   │   └── writing-styles/     # Content voice guidelines
│   ├── data/                   # News sources and data
│   └── skills/                 # Claude skills
├── public/
│   ├── claude-data/            # AI-readable content
│   │   ├── knowledge/          # Brand documentation
│   │   └── system/             # System configuration
│   ├── data/                   # Generated content
│   │   ├── news/               # Weekly updates, monthly outlook
│   │   └── weekly-ideas/       # Content ideas by format
│   └── assets/                 # Brand assets
│       ├── fonts/              # Neue Haas Grotesk, OffBit
│       ├── logos/              # Logo variations
│       ├── icons/              # Icon library
│       ├── images/             # Brand imagery
│       ├── illustrations/      # Custom illustrations
│       └── textures/           # Background textures
├── app/                        # Next.js app directory
│   ├── brain/                  # Brand brain dashboard
│   ├── brand-hub/              # Brand assets hub
│   ├── discover/               # Content discovery
│   └── spaces/                 # Collaboration spaces
├── components/                 # React components
│   ├── brain/                  # Brain page components
│   ├── brand-hub/              # Brand hub components
│   ├── discover/               # Discovery components
│   └── ui/                     # Shared UI components
├── hooks/                      # Custom React hooks
├── lib/                        # Utility functions
├── scripts/                    # AI generation tools
│   ├── generate-weekly-ideas   # Content idea generation
│   └── generate-news-updates   # News curation
├── types/                      # TypeScript definitions
└── package.json                # Project dependencies
```

## Key Directories Explained

### `.claude/` - AI Configuration
Contains all Claude AI-specific configuration including custom commands, knowledge base files, and skills. This enables Claude to understand and work with your brand context.

### `public/claude-data/` - AI-Readable Content
Structured content specifically formatted for AI interpretation:
- **knowledge/core/** - Brand identity, messaging, and art direction guidelines
- **knowledge/writing-styles/** - Voice and tone guides for different content types
- **system/** - System configuration and architecture documentation

### `public/assets/` - Brand Assets
All visual brand assets organized by type:
- **fonts/** - Typography files (Neue Haas Grotesk, OffBit)
- **logos/** - Logo variations in multiple formats
- **icons/** - Icon library
- **textures/** - Background textures for visual design

### `app/` - Application Routes
Next.js 14 app directory with route groups:
- **brain/** - Brand brain dashboard for AI configuration
- **brand-hub/** - Brand assets and guidelines
- **discover/** - Content discovery and inspiration
- **spaces/** - Collaboration workspaces

### `components/` - UI Components
Modular React components organized by feature area, following atomic design principles.

### `scripts/` - Automation
AI-powered generation scripts for:
- Weekly content ideas across formats (short-form, long-form, blog)
- News curation and summarization

## Design Philosophy

1. **Dual-Purpose Architecture** - Every piece of content serves both human users and AI agents
2. **Semantic Structure** - Clear naming conventions and folder organization
3. **Extensible Design** - Easy to add new knowledge, skills, and capabilities
4. **Token Efficiency** - Optimized for AI context windows while remaining human-readable
5. **Living Documentation** - Content evolves with the brand

## Integration Points

- **Claude AI** - Primary AI assistant with custom knowledge base
- **Figma** - Design system source of truth
- **GitHub** - Version control and collaboration
- **Next.js** - Web application framework
