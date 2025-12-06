/**
 * Source Enricher for OPEN SESSION
 * 
 * Uses Perplexity API to find additional sources covering the same topic.
 * This is used for starred/featured news items to provide richer source diversity.
 * 
 * Cost: ~$0.02 per enrichment call (uses sonar model)
 */

interface EnrichedSource {
  name: string;
  url: string;
}

interface EnrichmentResult {
  additionalSources: EnrichedSource[];
  summary?: string;
}

/**
 * Extract domain name from URL for source naming
 */
function extractDomainName(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    // Remove 'www.' and get the domain name
    const domain = hostname.replace(/^www\./, '');
    // Capitalize first letter of each word
    const parts = domain.split('.');
    if (parts.length >= 2) {
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }
    return domain;
  } catch {
    return 'Unknown Source';
  }
}

/**
 * Parse citations from Perplexity response
 * Perplexity includes citations in format [1], [2], etc. with URLs in the response
 */
function parseCitations(response: string, citations: string[]): EnrichedSource[] {
  const sources: EnrichedSource[] = [];
  
  for (const url of citations) {
    // Skip if not a valid URL
    if (!url.startsWith('http')) continue;
    
    sources.push({
      name: extractDomainName(url),
      url: url,
    });
  }
  
  return sources;
}

/**
 * Enrich a topic with additional sources using Perplexity
 * 
 * @param topic - The topic title or headline to search for
 * @param existingUrls - URLs to exclude (already have these sources)
 * @returns Additional sources found, or empty array on failure
 */
export async function enrichWithPerplexity(
  topic: string,
  existingUrls: string[] = []
): Promise<EnrichmentResult> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    console.warn('  ⚠️ PERPLEXITY_API_KEY not set, skipping enrichment');
    return { additionalSources: [] };
  }
  
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar', // Cost-effective model for search
        messages: [
          {
            role: 'system',
            content: 'You are a news researcher. Find recent articles about the given topic. Be concise.',
          },
          {
            role: 'user',
            content: `Find recent news coverage about: "${topic}". List the main sources covering this story.`,
          },
        ],
        max_tokens: 300,
        return_citations: true,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`  ⚠️ Perplexity API error: ${response.status} - ${errorText.substring(0, 100)}`);
      return { additionalSources: [] };
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const citations: string[] = data.citations || [];
    
    // Parse citations into sources
    let additionalSources = parseCitations(content, citations);
    
    // Filter out existing URLs
    const existingSet = new Set(existingUrls.map(u => u.toLowerCase()));
    additionalSources = additionalSources.filter(source => 
      !existingSet.has(source.url.toLowerCase())
    );
    
    // Deduplicate by domain
    const seenDomains = new Set<string>();
    additionalSources = additionalSources.filter(source => {
      const domain = extractDomainName(source.url).toLowerCase();
      if (seenDomains.has(domain)) return false;
      seenDomains.add(domain);
      return true;
    });
    
    // Limit to 5 additional sources
    additionalSources = additionalSources.slice(0, 5);
    
    return {
      additionalSources,
      summary: content.substring(0, 200),
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`  ⚠️ Perplexity enrichment failed: ${errorMessage.substring(0, 50)}`);
    return { additionalSources: [] };
  }
}

/**
 * Batch enrich multiple topics (with rate limiting)
 * 
 * @param topics - Array of topics with their existing sources
 * @param maxEnrichments - Maximum number of topics to enrich (cost control)
 * @param delayMs - Delay between API calls to avoid rate limiting
 */
export async function batchEnrichTopics(
  topics: Array<{ title: string; existingUrls: string[] }>,
  maxEnrichments: number = 3,
  delayMs: number = 500
): Promise<Map<string, EnrichedSource[]>> {
  const results = new Map<string, EnrichedSource[]>();
  
  // Only enrich up to maxEnrichments topics
  const toEnrich = topics.slice(0, maxEnrichments);
  
  console.log(`  🔍 Enriching ${toEnrich.length} topics with Perplexity...`);
  
  for (let i = 0; i < toEnrich.length; i++) {
    const { title, existingUrls } = toEnrich[i];
    
    const result = await enrichWithPerplexity(title, existingUrls);
    
    if (result.additionalSources.length > 0) {
      results.set(title, result.additionalSources);
      console.log(`    ✓ "${title.substring(0, 40)}..." +${result.additionalSources.length} sources`);
    }
    
    // Rate limiting delay
    if (i < toEnrich.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  const totalNewSources = Array.from(results.values()).reduce((sum, arr) => sum + arr.length, 0);
  console.log(`  📊 Enrichment complete: +${totalNewSources} sources across ${results.size} topics`);
  
  return results;
}







