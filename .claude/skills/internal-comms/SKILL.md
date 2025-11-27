---
name: internal-comms
description: A set of resources to help me write all kinds of internal communications, using the formats that my company likes to use. Claude should use this skill whenever asked to write some sort of internal communications (weekly sprint reports, finance reports, project updates, design news, etc.).
---

# Internal Communications

## When to use this skill

Use this skill for writing:
- Weekly Sprint Reports
- Company Finance Reports
- Project updates
- Design News

## How to use this skill

To write any internal communication:

1. **Identify the communication type** from the request
2. **Load the appropriate guideline file** from the `examples/` directory:
    - `examples/weekly-sprint-reports.md` - For weekly sprint recaps (Monday kickoff + Friday recap)
    - `examples/finance-reports.md` - For weekly/monthly financial summaries
    - `examples/design-news.md` - For design and AI industry trends
    - `examples/project-updates.md` - For general and client task updates
3. **Follow the specific instructions** in that file for formatting, tone, and content gathering

## Company Context

- **Company Name:** [Your Company Name]
- **Founders:** Karim and Morgan
- **Stage:** Early stage (Year 1), focused on audience growth and free services
- **Communication Channels:** Notion (primary), Email
- **Data Sources:** Notion (tasks, finances), Claude knowledge, web search
- **Tone:** Casual, quick, concise
- **Update Frequency:** Weekly sprints (Monday kickoff + Friday recap)

## Notion Access

Claude has access to your Notion workspace via MCP. When writing communications:
- Pull task data from Notion databases
- Access financial data from Notion
- Reference project statuses and client information
- No need to ask for permission - just access directly

## Keywords

weekly sprint, sprint report, finance report, revenue, expenses, design news, AI trends, project updates, client tasks, notion, figma, framer, webflow
