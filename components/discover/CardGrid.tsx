'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { NewsCard } from './NewsCard';
import { IdeaPromptCard } from './IdeaPromptCard';
import { NewsCardData, IdeaCardData } from '@/types';
import { SourceInfo } from '@/components/chat/AnswerView';
import { staggerContainerFast, fadeInUp } from '@/lib/motion';

interface CardGridProps {
  cards: (NewsCardData | IdeaCardData)[];
  type: 'news' | 'inspiration';
  onOpenSources?: (sources: SourceInfo[]) => void;
  onSaveArticle?: (item: NewsCardData, isSaved: boolean) => void;
  savedArticleIds?: Set<string>;
  onAddToSpace?: (item: NewsCardData) => void;
}

export function CardGrid({ 
  cards, 
  type, 
  onOpenSources,
  onSaveArticle,
  savedArticleIds = new Set(),
  onAddToSpace,
}: CardGridProps) {
  if (cards.length === 0) {
    return (
      <div className="text-center py-20 text-os-text-secondary-dark">
        No items found.
      </div>
    );
  }

  // Group cards into layout pattern: 1 featured + 3 compact per group
  const groups: Array<{ featured: NewsCardData | IdeaCardData; compact: (NewsCardData | IdeaCardData)[] }> = [];
  
  for (let i = 0; i < cards.length; i += 4) {
    const featured = cards[i];
    const compact = cards.slice(i + 1, i + 4);
    
    if (featured) {
      groups.push({ featured, compact });
    }
  }

  return (
    <motion.div 
      className="flex flex-col gap-6"
      variants={staggerContainerFast}
      initial="hidden"
      animate="visible"
    >
      {groups.map((group, groupIndex) => (
        <motion.div 
          key={groupIndex} 
          className="flex flex-col gap-4"
          variants={fadeInUp}
        >
          {/* Featured card - horizontal layout */}
          <motion.div 
            className="w-full"
            variants={fadeInUp}
          >
            {type === 'news' ? (
              <NewsCard 
                item={group.featured as NewsCardData} 
                variant="featured" 
                onOpenSources={onOpenSources}
                onSave={onSaveArticle}
                isSaved={savedArticleIds.has((group.featured as NewsCardData).id)}
                onAddToSpace={onAddToSpace}
              />
            ) : (
              <IdeaPromptCard 
                item={group.featured as IdeaCardData} 
                variant="featured" 
              />
            )}
          </motion.div>
          
          {/* Compact cards - horizontal scroll on mobile/tablet, 3-col grid on desktop */}
          {group.compact.length > 0 && (
            <>
              {/* Mobile/Tablet: Horizontal scrollable carousel */}
              <div className="lg:hidden -mx-4 px-4">
                <motion.div 
                  className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
                  variants={staggerContainerFast}
                >
                  {group.compact.map((card, cardIndex) => (
                    <motion.div
                      key={cardIndex}
                      className="flex-shrink-0 w-[calc(33.333%-8px)] min-w-[140px] snap-start"
                      variants={fadeInUp}
                    >
                      {type === 'news' ? (
                        <NewsCard
                          item={card as NewsCardData}
                          variant="compact"
                          onOpenSources={onOpenSources}
                          onSave={onSaveArticle}
                          isSaved={savedArticleIds.has((card as NewsCardData).id)}
                          onAddToSpace={onAddToSpace}
                        />
                      ) : (
                        <IdeaPromptCard
                          item={card as IdeaCardData}
                          variant="compact"
                        />
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Desktop: 3-column grid */}
              <motion.div 
                className="hidden lg:grid lg:grid-cols-3 gap-4"
                variants={staggerContainerFast}
              >
                {group.compact.map((card, cardIndex) => (
                  <motion.div key={cardIndex} variants={fadeInUp}>
                    {type === 'news' ? (
                      <NewsCard
                        item={card as NewsCardData}
                        variant="compact"
                        onOpenSources={onOpenSources}
                        onSave={onSaveArticle}
                        isSaved={savedArticleIds.has((card as NewsCardData).id)}
                        onAddToSpace={onAddToSpace}
                      />
                    ) : (
                      <IdeaPromptCard
                        item={card as IdeaCardData}
                        variant="compact"
                      />
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}

          {/* Divider between groups */}
          {groupIndex < groups.length - 1 && (
            <motion.div 
              className="border-t border-os-border-dark/30 my-4"
              variants={fadeInUp}
            />
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}
