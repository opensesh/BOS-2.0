import React from 'react';
import { NewsCard } from './NewsCard';
import { InspirationCard } from './InspirationCard';
import { NewsCardData, InspirationCardData } from '@/types';
import { SourceInfo } from '@/components/chat/AnswerView';

interface CardGridProps {
  cards: (NewsCardData | InspirationCardData)[];
  type: 'news' | 'inspiration';
  onOpenSources?: (sources: SourceInfo[]) => void;
  onSaveArticle?: (item: NewsCardData, isSaved: boolean) => void;
  savedArticleIds?: Set<string>;
}

export function CardGrid({ 
  cards, 
  type, 
  onOpenSources,
  onSaveArticle,
  savedArticleIds = new Set(),
}: CardGridProps) {
  if (cards.length === 0) {
    return (
      <div className="text-center py-20 text-os-text-secondary-dark">
        No items found.
      </div>
    );
  }

  // Group cards into layout pattern: 1 featured + 3 compact per group
  const groups: Array<{ featured: NewsCardData | InspirationCardData; compact: (NewsCardData | InspirationCardData)[] }> = [];
  
  for (let i = 0; i < cards.length; i += 4) {
    const featured = cards[i];
    const compact = cards.slice(i + 1, i + 4);
    
    if (featured) {
      groups.push({ featured, compact });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group, groupIndex) => (
        <div key={groupIndex} className="flex flex-col gap-4">
          {/* Featured card - horizontal layout */}
          <div className="w-full">
            {type === 'news' ? (
              <NewsCard 
                item={group.featured as NewsCardData} 
                variant="featured" 
                onOpenSources={onOpenSources}
                onSave={onSaveArticle}
                isSaved={savedArticleIds.has((group.featured as NewsCardData).id)}
              />
            ) : (
              <InspirationCard 
                item={group.featured as InspirationCardData} 
                variant="featured" 
                // InspirationCard doesn't support sources drawer yet, but could in future
              />
            )}
          </div>
          
          {/* Compact cards - 3 in a row */}
          {group.compact.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.compact.map((card, cardIndex) => (
                <div key={cardIndex}>
                  {type === 'news' ? (
                    <NewsCard 
                      item={card as NewsCardData} 
                      variant="compact" 
                      onOpenSources={onOpenSources}
                      onSave={onSaveArticle}
                      isSaved={savedArticleIds.has((card as NewsCardData).id)}
                    />
                  ) : (
                    <InspirationCard 
                      item={card as InspirationCardData} 
                      variant="compact" 
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Divider between groups */}
          {groupIndex < groups.length - 1 && (
            <div className="border-t border-os-border-dark/30 my-4" />
          )}
        </div>
      ))}
    </div>
  );
}
