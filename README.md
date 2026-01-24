# Brand Operating System (BOS) 2.0

A modern, responsive interface built with Next.js 14+, TypeScript, and Tailwind CSS, featuring BRAND-OS color system integration.

## 🚀 Features

- **Modern Tech Stack**: Next.js 14+ with App Router, TypeScript, Tailwind CSS
- **Dark/Light Mode**: Persistent theme switching with next-themes
- **Responsive Design**: Mobile-first design that works across all devices
- **BRAND-OS Integration**: Custom color system from opensesh/BRAND-OS
- **Interactive UI**: Comprehensive hover, focus, active, and disabled states
- **Keyboard Shortcuts**: 
  - `Cmd/Ctrl + K` - Focus search input
  - `Escape` - Blur search input
  - `Enter` - Submit query
  - `Shift + Enter` - New line in textarea
- **Accessibility**: ARIA labels, keyboard navigation, focus management

## 🎨 Design System

### Colors (BRAND-OS)
- **Charcoal** (#191919): Dark backgrounds
- **Vanilla** (#FFFAEE): Light/cream accents
- **Aperol** (#FE5102): Primary brand color

### Key Features
- Collapsible sidebar with smooth transitions
- Multi-page routing (Home, Discover, Spaces, Finance)
- Chat interface with toolbar and quick actions
- Theme persistence across sessions
- Mobile-responsive navigation

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🏗️ Project Structure

```
BOS/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with theme provider
│   ├── page.tsx           # Homepage
│   ├── discover/          # Discover page
│   ├── spaces/            # Spaces page
│   ├── finance/           # Finance page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Sidebar.tsx        # Navigation sidebar
│   ├── ChatInterface.tsx  # Main chat/search interface
│   └── ThemeToggle.tsx    # Dark/light mode toggle
├── hooks/                 # Custom React hooks
│   └── useKeyboardShortcuts.ts
├── lib/                   # Utilities
│   └── theme-provider.tsx
├── types/                 # TypeScript definitions
│   └── index.ts
└── tailwind.config.ts     # Tailwind configuration
```

## 🎯 Usage

### Development
1. Start the development server: `npm run dev`
2. Open [http://localhost:3000](http://localhost:3000)
3. Edit components in `components/` or pages in `app/`
4. Changes will hot-reload automatically

### Navigation
- **Home**: Main search/chat interface
- **Discover**: Placeholder for discovery features
- **Spaces**: Placeholder for workspace features
- **Finance**: Placeholder for finance-related features

### Chat Interface
- Type in the search box to compose queries
- Use toolbar icons for additional functionality (placeholder for now)
- Click "New Chat" to start a fresh conversation
- Quick action buttons provide shortcuts to common tasks

## 🔧 Configuration

### Tailwind Colors
Customize colors in `tailwind.config.ts`:
```typescript
colors: {
  brand: {
    charcoal: '#191919',
    vanilla: '#FFFAEE',
    aperol: '#FE5102',
  },
  // ... more colors
}
```

### Theme
Adjust theme settings in `app/layout.tsx`:
```typescript
<ThemeProvider
  attribute="class"
  defaultTheme="dark"  // or "light" or "system"
  enableSystem
  disableTransitionOnChange
>
```

## 🚧 Future Enhancements

- [ ] Backend API integration for AI responses
- [ ] Real-time message streaming
- [ ] File upload functionality
- [ ] Voice input support
- [ ] Search history
- [ ] User authentication
- [ ] Workspace/spaces management
- [ ] Analytics and insights
- [ ] Mobile app (React Native)

## 📝 License

GNU General Public License v3.0

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!

---

Built with ❤️ using BRAND-OS design system
