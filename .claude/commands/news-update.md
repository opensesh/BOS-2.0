# OPEN SESSION - Commands

> **Purpose:** Custom command definitions and workflows  
> **Last Updated:** October 2025

---

## Available Commands

### `/news-update`

**Purpose:** Comprehensive AI industry intelligence recap to keep OPEN SESSION informed and competitive.

**What it does:**
1. Scans priority sources from `.claude/data/news-sources.md`
2. Searches for major developments in the past 7 days (or specified timeframe)
3. Summarizes significant AI model releases, design tool updates, and industry shifts
4. Highlights anything specifically relevant to OPEN SESSION's business (content creation, design tools, client opportunities)
5. Provides actionable insights and recommendations
6. Generates JSON data files for the News section on the website (Weekly Update & Monthly Outlook)

**When to use:**
- **Monday mornings** - Start the week informed
- **Before content planning** - Find timely topics to cover
- **Before client meetings** - Reference latest trends and tools
- **When planning services** - Spot opportunities for new offerings
- **After major industry events** - Get post-event summaries (dev days, keynotes, conferences)

---

## Output Format

```
🤖 AI INDUSTRY UPDATE
[Date Range: Past 7 days / Custom range]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📰 EXECUTIVE SUMMARY
[3-4 sentences: Most important developments this week]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔥 KEY UPDATES

Foundation Models (OpenAI, Anthropic, Google, Meta)
• [Update 1]: Brief description with why it matters
• [Update 2]: Brief description with why it matters

Design Tools (Figma, Webflow, Framer, MCP)
• [Tool/Feature]: What changed and implications
• [Tool/Feature]: What changed and implications

Creative AI (Runway, Midjourney, Higgsfield, etc.)
• [Tool name]: Capability and release details
• [Tool name]: Capability and release details

Industry & Market (a16z, YC, Major Players)
• [Trend/Funding/Movement]: Context and significance
• [Trend/Funding/Movement]: Context and significance

Platform & Creator Tools (Instagram, YouTube, TikTok)
• [Algorithm/Feature Change]: How it affects creators
• [Algorithm/Feature Change]: How it affects creators

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 WHAT THIS MEANS FOR OPEN SESSION

[2-3 specific observations about how these updates impact your business]

**Opportunities:**
• [Way to capitalize on a trend - content idea, service offering, tool adoption]
• [Another opportunity with brief rationale]

**Threats/Considerations:**
• [What to watch out for - competition, market shifts]
• [What might affect your positioning or strategy]

**Content Angles:**
• [Specific content idea based on news]
• [Another content idea that leverages trends]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ RECOMMENDED ACTIONS

**This Week:**
1. [Immediate actionable item]
2. [Quick win or exploration]

**This Month:**
3. [Longer-term strategic move]
4. [Something to research or test]

**Watch For:**
• [Upcoming event or announcement to monitor]
• [Trend to keep tracking]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 KEY SOURCES REFERENCED:
• [List of specific URLs/articles that informed this update]
```

---

## Usage Variations

### Standard Usage
```
/news-update
```
Returns standard 7-day recap with all categories

### Focused Update
```
/news-update design tools
```
Focuses specifically on design tool updates (Figma, Webflow, Framer, MCP)

```
/news-update creative ai
```
Focuses on creative AI tools (Runway, Midjourney, video/image generation)

```
/news-update foundation models
```
Focuses on OpenAI, Anthropic, Google, Meta model releases

### Time-Based Variations
```
/news-update last 2 weeks
```
Extends timeframe beyond standard 7 days

```
/news-update today
```
Quick check of what dropped in the last 24 hours

### Event-Specific
```
/news-update dev day summary
```
Summarizes recent developer conference or keynote

```
/news-update [company] keynote
```
Focused recap of specific company announcement

---

## What Gets Prioritized

### Tier 1 (Always Include)
- New foundation model releases or major updates
- MCP tool updates (Figma, Webflow, Framer, Cursor)
- Creative AI breakthroughs (especially video/image)
- Major industry funding or acquisitions
- Platform algorithm changes affecting creators

### Tier 2 (Include if Relevant)
- New AI tool launches with OPEN SESSION use cases
- Design system or template marketplace updates
- Content strategy trends and creator economy shifts
- Technical updates that affect workflows

### Tier 3 (Mention if Notable)
- Academic research with practical implications
- Industry analysis and think pieces
- Minor tool updates or bug fixes
- Community discussions and debates

### Exclude
- Pure speculation or rumors (unless from Tier 1 sources)
- Overly technical papers without practical applications
- Political/regulatory news (unless directly impacts available tools)
- Crypto/web3 (unless clear AI intersection)

---

## How Claude Executes This Command

### Step 1: Scan Priority Sources
- Check official blogs: OpenAI, Anthropic, Google AI, Meta AI
- Review design tools: Figma, Webflow, Framer blogs
- Scan creative AI: Runway, Midjourney, Pika updates
- Check aggregators: Product Hunt, Future Tools, The Rundown AI
- Review industry sources: a16z, Y Combinator, Wired

### Step 2: Filter for Relevance
- **Is this development significant?** (Major release vs. minor patch)
- **Does it affect OPEN SESSION?** (Relevant to design, content, or client work)
- **Is this actionable?** (Can Karim/Morgan do something with this info)

### Step 3: Synthesize with Context
- Reference `.claude/knowledge/core/` to understand brand implications
- Consider current business phase (pre-launch content focus)
- Think about content opportunities and client positioning
- Identify competitive threats or market shifts

### Step 4: Format Output
- Use the structured format above
- Keep tone conversational but informative
- Be specific, not generic
- Include actual links to sources

### Step 5: Provide Recommendations
- Suggest 2-3 immediate actions Karim can take
- Offer content ideas that leverage trends
- Flag anything that needs deeper exploration
- Be realistic about their DIY constraints

---

## Examples of Good vs. Bad Updates

### ❌ Bad Update (Too Generic)
```
Foundation Models
• OpenAI released something new
• Google updated Gemini

What This Means
• Things are changing fast in AI
• You should stay informed
```
**Problems:** Vague, no specifics, no actionable insight, sounds like filler

### ✅ Good Update (Specific & Actionable)
```
Foundation Models
• OpenAI released GPT-4.5 with improved multimodal capabilities - 
  now handles simultaneous image+text analysis with 2x speed improvement
• Google Gemini 2.0 launched with native video understanding - 
  can analyze 2-hour videos in under 30 seconds

What This Means for OPEN SESSION
These multimodal improvements make it easier to batch-process 
client project images and create design system documentation 
automatically. The Gemini video feature could help you analyze 
competitor content or create video summaries faster.

Recommended Actions
1. Test GPT-4.5 image analysis with your next design system delivery
2. Create a YouTube content idea: "I tested Gemini 2.0 on 100 hours 
   of design videos - here's what I learned"
```
**Why it's better:** Specific features, clear implications, actionable ideas

---

## Calibration & Learning

### After Each `/news-update`:
- **Karim provides feedback** on what was useful vs. what wasn't
- **Claude learns** which sources, topics, and formats work best
- **Adjust priorities** over time based on what Karim actually acts on

### Questions to Ask:
- "Was this update helpful? What would make it better?"
- "Did I miss anything important you saw elsewhere?"
- "Were the recommendations actionable or too generic?"
- "Should I include more/less detail on [category]?"

### Iteration Goals:
- Increasingly relevant updates (less noise, more signal)
- Better content idea suggestions (aligned with OPEN SESSION pillars)
- More accurate assessment of opportunities vs. hype
- Stronger understanding of Karim's taste and priorities

---

## Future Command Ideas

As workflows mature, consider adding:

### `/content-batch`
Generate a week's worth of content ideas aligned with brand pillars

### `/script-draft [topic]`
Create loose script for short-form or long-form video

### `/case-study-outline [client/project]`
Structure a client success story

### `/competitor-analysis [brand/creator]`
Analyze competitor's content strategy and positioning

### `/tool-review [AI tool name]`
Research and summarize new tool's capabilities and OPEN SESSION fit

---

## 📝 Maintenance

**Weekly:**
- Execute `/news-update` at least once
- Gather feedback on quality and relevance
- Adjust sourcing based on what's useful

**Monthly:**
- Review which sources provided best insights
- Update `.claude/data/news-sources.md` with new discoveries
- Refine output format based on Karim's preferences

**Quarterly:**
- Assess if command is delivering value
- Consider new command variations
- Update documentation with lessons learned

---

## 🤖 Automated News Generation

The `/news-update` command now generates JSON data files that populate the News section on your website.

### How to Generate News Data

Run the automated script:
```bash
node scripts/generate-news-updates.js
```

Or using the npm script (if configured):
```bash
npm run generate:news
```

This will:
1. Fetch latest articles from RSS feeds
2. Use Claude AI to analyze and summarize news
3. Generate JSON files for:
   - **Weekly Update** (`public/data/news/weekly-update/latest.json`)
   - **Monthly Outlook** (`public/data/news/monthly-outlook/latest.json`)
4. Create timestamped backups

### News Data Structure

```json
{
  "type": "weekly-update",
  "date": "2025-10-21T00:00:00.000Z",
  "updates": [
    {
      "title": "1-2 sentence summary of the news",
      "timestamp": "MM/DD/YYYY, H:MM AM/PM",
      "sources": [
        { "name": "Source Name", "url": "https://..." }
      ]
    }
  ]
}
```

### Categories

**Weekly Update:**
- Focus on THIS WEEK's announcements and releases
- Immediate developments designers need to know
- Breaking news and product launches

**Monthly Outlook:**
- Upcoming events and conferences
- Analyst predictions and forecasts
- Future trends to watch
- Strategic insights for planning

---

**Last Updated:** October 21, 2025
**Command Status:** Active
**Next Review:** November 2025