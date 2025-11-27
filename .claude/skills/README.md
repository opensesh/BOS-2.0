# All Claude Skills - Complete Package

This package contains ALL Claude skills available in your environment, organized for easy access and customization.

## 📁 Package Structure

```
all-claude-skills/
├── README.md (this file)
├── public/                      # Core document creation skills
│   ├── docx/                   # Word document creation & editing
│   ├── pdf/                    # PDF creation & manipulation
│   ├── pptx/                   # PowerPoint creation & editing
│   └── xlsx/                   # Excel spreadsheet creation & editing
├── examples/                    # Example & specialty skills
│   ├── algorithmic-art/        # Create algorithmic art with p5.js
│   ├── artifacts-builder/      # Build complex multi-component artifacts
│   ├── brand-guidelines/       # Anthropic's brand guidelines (example)
│   ├── canvas-design/          # Create visual art and designs
│   ├── internal-comms/         # Anthropic's internal comms (example)
│   ├── mcp-builder/            # Build MCP servers
│   ├── single-cell-rna-qc/     # Bioinformatics quality control
│   ├── skill-creator/          # Create new skills
│   ├── slack-gif-creator/      # Create GIFs for Slack
│   └── theme-factory/          # Apply themes to artifacts
└── customizable-templates/      # YOUR customizable versions
    ├── README.md               # Setup instructions
    ├── brand-guidelines/       # Template for YOUR brand
    └── internal-comms/         # Template for YOUR company comms
```

## 🎯 Skills Overview

### Public Skills (Core Document Tools)

These are production-ready skills for creating and editing documents:

1. **docx** - Word document creation, editing, tracked changes, comments
2. **pdf** - PDF creation, text extraction, form filling, merging/splitting
3. **pptx** - PowerPoint creation, editing, layouts, speaker notes
4. **xlsx** - Excel spreadsheet creation, formulas, formatting, data analysis

### Example Skills (Specialty Tools)

These are example skills demonstrating various capabilities:

1. **algorithmic-art** - Create generative art using p5.js with seeded randomness
2. **artifacts-builder** - Build complex HTML artifacts with React, Tailwind, shadcn/ui
3. **brand-guidelines** - Apply Anthropic's brand (example for customization)
4. **canvas-design** - Create beautiful visual designs and posters
5. **internal-comms** - Write internal communications (example for customization)
6. **mcp-builder** - Guide for creating MCP servers (Python/TypeScript)
7. **single-cell-rna-qc** - Bioinformatics quality control workflows
8. **skill-creator** - Guide for creating new custom skills
9. **slack-gif-creator** - Create animated GIFs for Slack reactions
10. **theme-factory** - Apply pre-set or custom themes to artifacts

### Customizable Templates (For You!)

Located in `customizable-templates/` - these are ready-to-customize templates:

1. **brand-guidelines** - Template for YOUR brand colors, fonts, visual identity
2. **internal-comms** - Template for YOUR company's communication formats

**These need your customization** - see the README in that folder for instructions.

## 🚀 Quick Start

### Using Existing Skills

All skills in `public/` and `examples/` work out of the box. Claude will automatically use them when relevant.

### Customizing Skills for Your Business

1. Go to `customizable-templates/`
2. Read the README.md in that folder
3. Edit the SKILL.md files with your brand/company info
4. Install to your Claude environment (see installation instructions below)

## 📥 Installation Options

### Option 1: Use as Reference

Keep this folder as a reference for how skills work. You can:
- Read through skill files to understand their structure
- Copy examples when creating your own skills
- Reference guidelines when working with Claude

### Option 2: Install Custom Skills

To install your customized skills to Claude:

```bash
# Install brand-guidelines
cp -r customizable-templates/brand-guidelines /mnt/skills/user/

# Install internal-comms
cp -r customizable-templates/internal-comms /mnt/skills/user/
```

Then restart Claude or reload skills (if applicable).

### Option 3: Keep in Version Control

Recommended approach:
1. Add `customizable-templates/` to your git repository
2. Customize the skills over time
3. Share with your team
4. Keep skills updated as your processes evolve

## 🔍 Exploring Skills

Each skill folder contains:
- **SKILL.md** - Main skill file with instructions and guidelines
- **LICENSE.txt** - License information (if applicable)
- **examples/** - Example files and templates (for complex skills)

To understand how a skill works, read its SKILL.md file.

## ✏️ Which Skills Should You Customize?

**Definitely customize:**
- ✅ `brand-guidelines` - Add your brand colors, fonts, logo
- ✅ `internal-comms` - Add your company's communication formats

**Consider customizing:**
- `theme-factory` - Add your own custom themes
- `canvas-design` - Add company-specific design guidelines

**Use as-is:**
- All `public/` skills (docx, pdf, pptx, xlsx)
- Most `examples/` skills

## 📚 Learning Resources

- **skill-creator** - Read this to learn how to create new skills
- **mcp-builder** - If you want to build MCP servers
- Claude Documentation: https://docs.claude.com

## 🤝 Next Steps

1. **Download this entire package** and add to your codebase
2. **Explore the existing skills** to see what's available
3. **Customize the templates** in `customizable-templates/`
4. **Install your custom skills** to Claude when ready
5. **Create new skills** as needed using skill-creator as a guide

## 💡 Pro Tips

- Keep skill files in markdown for easy editing
- Use clear examples in your custom skills
- Test skills with Claude after customizing
- Share custom skills with your team
- Update skills as your processes evolve
- Use version control for your custom skills

## 📊 Skills Summary

- **Total Skills**: 14
- **Core Document Tools**: 4 (docx, pdf, pptx, xlsx)
- **Specialty Skills**: 8
- **Ready to Customize**: 2

---

**Package Created**: October 19, 2025  
**For**: Personal/Business use  
**Claude Version**: Sonnet 4.5
