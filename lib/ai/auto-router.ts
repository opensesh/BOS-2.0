import { ModelId } from './providers';

// Message format from AI SDK 5.x
interface UIMessage {
  role: string;
  content?: string;
  parts?: Array<{ type: string; text?: string }>;
}

// Helper to extract text content from a message (handles both formats)
function getMessageText(message: UIMessage): string {
  // Direct content string
  if (typeof message.content === 'string') {
    return message.content;
  }
  // Parts array format (AI SDK 5.x)
  if (Array.isArray(message.parts)) {
    return message.parts
      .filter((part): part is { type: string; text: string } => 
        part && typeof part === 'object' && part.type === 'text' && typeof part.text === 'string'
      )
      .map((part) => part.text)
      .join('');
  }
  return '';
}

// Keywords that suggest different model needs
const RESEARCH_KEYWORDS = [
  'research',
  'analyze',
  'compare',
  'explain in depth',
  'comprehensive',
  'detailed analysis',
  'investigate',
  'evaluate',
  'assess',
  'examine',
  'deep dive',
  'thorough',
  'extensive',
];

const CURRENT_EVENTS_KEYWORDS = [
  'latest',
  'current',
  'news',
  'today',
  'recent',
  'now',
  'this week',
  'this month',
  '2024',
  '2025',
  'happening',
  'update',
  'trending',
  'breaking',
];

const SIMPLE_QUERY_PATTERNS = [
  /^(what|who|when|where|how|why) is/i,
  /^define /i,
  /^translate /i,
  /^convert /i,
  /^what does .* mean/i,
  /^how do (you|i) /i,
];

export function autoSelectModel(messages: UIMessage[]): ModelId {
  // Get the last user message for analysis
  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');

  if (!lastUserMessage) {
    return 'claude-sonnet'; // Default
  }

  const messageText = getMessageText(lastUserMessage);
  
  if (!messageText) {
    return 'claude-sonnet'; // Default if no text found
  }

  const query = messageText.toLowerCase();
  const queryLength = messageText.length;

  // Check for current events/web search needs
  if (CURRENT_EVENTS_KEYWORDS.some((keyword) => query.includes(keyword))) {
    return 'sonar';
  }

  // Check for research/complex analysis needs
  if (RESEARCH_KEYWORDS.some((keyword) => query.includes(keyword))) {
    return 'claude-sonnet';
  }

  // Check for simple queries
  const isSimpleQuery = SIMPLE_QUERY_PATTERNS.some((pattern) => pattern.test(query));

  if (isSimpleQuery || queryLength < 50) {
    return 'claude-haiku';
  }

  // Medium complexity - use balanced model
  if (queryLength < 200) {
    return 'claude-sonnet';
  }

  // Long/complex queries - use capable model
  return 'claude-sonnet';
}

export function getAutoRouterExplanation(query: string): string {
  const q = query.toLowerCase();

  if (CURRENT_EVENTS_KEYWORDS.some((k) => q.includes(k))) {
    return 'Using web search for current information';
  }
  if (RESEARCH_KEYWORDS.some((k) => q.includes(k))) {
    return 'Using advanced model for in-depth analysis';
  }
  if (query.length < 50 || SIMPLE_QUERY_PATTERNS.some((p) => p.test(q))) {
    return 'Using fast model for quick response';
  }
  return 'Using balanced model for this query';
}
