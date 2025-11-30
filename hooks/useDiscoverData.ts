import { useState, useEffect } from 'react';
import { NewsCardData, IdeaCardData } from '@/types';
import { loadNewsData, loadIdeaData } from '@/lib/discover-utils';

export function useDiscoverData() {
  const [newsData, setNewsData] = useState<{
    weeklyUpdate: NewsCardData[];
    monthlyOutlook: NewsCardData[];
  }>({
    weeklyUpdate: [],
    monthlyOutlook: [],
  });
  
  const [ideaData, setIdeaData] = useState<{
    shortForm: IdeaCardData[];
    longForm: IdeaCardData[];
    blog: IdeaCardData[];
  }>({
    shortForm: [],
    longForm: [],
    blog: [],
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function loadAllData() {
      try {
        setLoading(true);
        setError(null);
        
        // Load all news data
        const [weeklyUpdate, monthlyOutlook] = await Promise.all([
          loadNewsData('weekly-update'),
          loadNewsData('monthly-outlook'),
        ]);
        
        // Load all idea data
        const [shortForm, longForm, blog] = await Promise.all([
          loadIdeaData('short-form'),
          loadIdeaData('long-form'),
          loadIdeaData('blog'),
        ]);
        
        setNewsData({ weeklyUpdate, monthlyOutlook });
        setIdeaData({ shortForm, longForm, blog });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error loading discover data:', err);
      } finally {
        setLoading(false);
      }
    }
    
    loadAllData();
  }, []);
  
  return {
    newsData,
    ideaData,
    loading,
    error,
  };
}

