# Internal Communications Skill

This skill helps Claude write professional, consistent internal communications for your company using company-specific formats and guidelines.

## 📁 Structure

```
internal-comms/
├── SKILL.md                          # Main skill configuration
├── README.md                         # This file
└── examples/
    ├── weekly-sprint-reports.md     # Weekly sprint kickoffs & recaps
    ├── finance-reports.md           # Weekly/monthly financial summaries
    ├── design-news.md               # Design & AI industry trends
    └── project-updates.md           # General and client task updates
```

## 🚀 How It Works

When you ask Claude to write internal communications, it will:

1. **Identify the type** of communication you need
2. **Load the appropriate guideline file** from `examples/`
3. **Pull data from Notion** via MCP (tasks, finances, project statuses)
4. **Search the web** for design/AI news when needed
5. **Follow the format and tone** specified in that file

## 💬 Example Prompts

**Weekly Sprint Reports:**
- "Write the Monday kickoff for this week"
- "Create the Friday recap for this week"
- "What did we accomplish this sprint?"

**Finance Reports:**
- "Give me this week's financial summary"
- "Create the monthly finance report for October"
- "How's our spending vs revenue this month?"

**Design News:**
- "What's new in design and AI this week?"
- "Find some design inspiration and tool updates"
- "Pull together a design news roundup"

**Project Updates:**
- "Update me on all tasks and client work"
- "What needs attention in our projects?"
- "Status check on client projects"

## 🎨 What You'll Get

All reports are:
- ✅ **Casual tone** - Written for founders, not formal docs
- ✅ **Quick reads** - Max 2 pages, scannable format
- ✅ **Data-driven** - Pulls from Notion automatically
- ✅ **Actionable** - Flags what needs attention
- ✅ **Consistent** - Same format every time

## 🔧 Customization

This skill is already customized with:
- ✅ Communication types (sprint reports, finance, design news, projects)
- ✅ Company context (founders, stage, tools used)
- ✅ Tone guidelines (casual, concise, honest)
- ✅ Notion integration (automated data pulling)

### To Further Customize:

1. **Update company-specific details** in `SKILL.md`:
   - Change company name
   - Update founder names
   - Add or remove communication channels
   - Adjust tone guidelines

2. **Edit example files** in `examples/` to:
   - Match your exact reporting needs
   - Add or remove sections
   - Update formatting preferences
   - Change data sources

3. **Add new communication types**:
   - Create new files in `examples/`
   - Update `SKILL.md` to reference them
   - Follow the same structure as existing files

## 📊 What Each File Covers

| File | Purpose | Frequency | Data Source |
|------|---------|-----------|-------------|
| `weekly-sprint-reports.md` | Sprint kickoffs & recaps | Weekly (Mon + Fri) | Notion tasks, web search |
| `finance-reports.md` | Income vs expenses | Weekly + Monthly | Notion finances |
| `design-news.md` | Design & AI trends | Weekly, ad-hoc | Web search, Claude knowledge |
| `project-updates.md` | Task & client status | Weekly or bi-weekly | Notion tasks |

## 🔌 Notion Integration

This skill uses the **Composio/Rube MCP** to access your Notion workspace.

**What Claude can access:**
- Task databases (assigned to Karim or Morgan)
- Financial data (revenue, expenses, categories)
- Project statuses
- Client information
- Any other Notion data you've configured

**No permission needed** - Claude accesses Notion directly when writing reports.

## 💡 Pro Tips

- **Be specific** in your prompts about what you want
- **Let Claude pull data** - It will automatically fetch from Notion
- **Review and edit** - Use Claude's drafts as a starting point
- **Update examples** - Replace placeholders with real data over time
- **Keep it current** - Update formats as your needs evolve

## 🎯 Year 1 Focus

Since you're in **Year 1** focused on:
- Free services and audience growth
- Building portfolio and reputation
- Minimal revenue tracking
- Small team (2 founders)

The reports are designed to be:
- **Simple** - Not overengineered for a small team
- **Flexible** - Formats will evolve as you grow
- **Honest** - Track what matters now, not what might matter later
- **Quick** - Fast to generate and read

## 📞 Questions?

For questions about:
- **Using this skill**: Just ask Claude!
- **Customizing formats**: Edit the `.md` files in `examples/`
- **Notion setup**: Check Composio/Rube MCP documentation
- **Adding new types**: Follow the pattern in existing files

## 🔄 Updates

As your company grows, update these formats to match your needs:
- Add more team members to sprint reports
- Track more detailed financials as revenue grows
- Add new communication types (investor updates, team updates, etc.)
- Adjust tone as the company matures

---

**Current Version:** 2.0 (Customized for Karim & Morgan)  
**Last Updated:** October 2025  
**For:** Early-stage design company (Year 1)
