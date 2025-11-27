import { useState, useEffect } from 'react';
import { NewsCardData, InspirationCardData } from '@/types';
import { loadNewsData, loadInspirationData } from '@/lib/discover-utils';

export function useDiscoverData() {
  const [newsData, setNewsData] = useState<{
    weeklyUpdate: NewsCardData[];
    monthlyOutlook: NewsCardData[];
  }>({
    weeklyUpdate: [],
    monthlyOutlook: [],
  });
  
  const [inspirationData, setInspirationData] = useState<{
    shortForm: InspirationCardData[];
    longForm: InspirationCardData[];
    blog: InspirationCardData[];
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
        
        // Load all inspiration data
        const [shortForm, longForm, blog] = await Promise.all([
          loadInspirationData('short-form'),
          loadInspirationData('long-form'),
          loadInspirationData('blog'),
        ]);
        
        setNewsData({ weeklyUpdate, monthlyOutlook });
        setInspirationData({ shortForm, longForm, blog });
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
    inspirationData,
    loading,
    error,
  };
}

