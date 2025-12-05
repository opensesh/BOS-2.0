/**
 * Content Generator Module
 * 
 * Exports for the daily content generation system:
 * - RSS sources with design/creative-focused feeds
 * - News topic classifier
 * - Rich ideas generator
 */

// RSS Sources
export {
  ALL_RSS_SOURCES,
  getSourcesByCategory,
  getHighPrioritySources,
  getSourcesForDailyFetch,
  CATEGORY_KEYWORDS,
  type RSSSource,
} from './rss-sources';

// News Classifier
export {
  classifyByKeywords,
  classifyByAI,
  classifyNews,
  classifyNewsBatch,
  isRelevantToOpenSession,
  filterRelevantNews,
  estimateClassificationCost,
} from './news-classifier';

// Ideas Generator
export {
  PLATFORMS_BY_CATEGORY,
  FORMATS_BY_CATEGORY,
  generateRichIdea,
  generateIdeasBatch,
  transformTopicToIdeas,
  estimateIdeaCost,
} from './ideas-generator';

// Source Enricher
export {
  enrichWithPerplexity,
  batchEnrichTopics,
} from './source-enricher';
