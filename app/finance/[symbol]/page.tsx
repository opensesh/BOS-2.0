'use client';

import React, { useState, use } from 'react';
import { Sidebar } from '@/components/Sidebar';
import {
  FinanceLayout,
  FinanceHeader,
  FinanceTabNav,
  FinanceTab,
  StockChart,
  StockStats,
  CompanyProfile,
  LatestNews,
  WatchlistSidebar,
} from '@/components/finance';
import {
  useQuote,
  useChart,
  useCompanyProfile,
  useNews,
  ChartRange,
  formatPrice,
  formatChange,
  formatPercent,
} from '@/hooks/useFinanceData';
import { TrendingUp, TrendingDown, Clock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface PageProps {
  params: Promise<{ symbol: string }>;
}

export default function StockDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const symbol = resolvedParams.symbol.toUpperCase();
  
  const [activeTab, setActiveTab] = useState<FinanceTab>('overview');
  const [chartRange, setChartRange] = useState<ChartRange>('1d');

  // Fetch data
  const { data: quote, loading: quoteLoading } = useQuote(symbol);
  const { data: chartData, loading: chartLoading } = useChart(symbol, chartRange);
  const { data: profile, loading: profileLoading } = useCompanyProfile(symbol);
  const { data: news, loading: newsLoading } = useNews(symbol);

  const isPositive = quote ? quote.regularMarketChange >= 0 : true;

  return (
    <div className="flex h-screen bg-os-bg-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <FinanceHeader symbol={symbol} name={quote?.shortName} />
        
        <FinanceLayout
          sidebar={<WatchlistSidebar />}
        >
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
              {/* Stock Header */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                {/* Symbol & Name */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-os-surface-dark border border-os-border-dark flex items-center justify-center">
                    <span className="text-lg font-bold text-brand-vanilla">
                      {symbol.slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-brand-vanilla">
                      {quote?.longName || quote?.shortName || symbol}
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-os-text-secondary-dark">
                      <span>{symbol}</span>
                      {quote?.exchange && (
                        <>
                          <span>·</span>
                          <span>{quote.exchange}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price & Change */}
                <div className="flex items-baseline gap-4">
                  {quoteLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 text-os-text-secondary-dark animate-spin" />
                      <span className="text-os-text-secondary-dark">Loading...</span>
                    </div>
                  ) : quote ? (
                    <>
                      <span className="text-4xl font-mono font-bold text-brand-vanilla">
                        {formatPrice(quote.regularMarketPrice, quote.currency)}
                      </span>
                      <div className={`flex items-center gap-2 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {isPositive ? (
                          <TrendingUp className="w-5 h-5" />
                        ) : (
                          <TrendingDown className="w-5 h-5" />
                        )}
                        <span className="text-lg font-medium">
                          {formatChange(quote.regularMarketChange)}
                        </span>
                        <span className="text-lg font-medium">
                          ({formatPercent(quote.regularMarketChangePercent)})
                        </span>
                        <span className="text-sm text-os-text-secondary-dark ml-2">
                          1D
                        </span>
                      </div>
                    </>
                  ) : (
                    <span className="text-os-text-secondary-dark">Price unavailable</span>
                  )}
                </div>

                {/* Market Status */}
                <div className="flex items-center gap-2 text-xs text-os-text-secondary-dark">
                  <Clock className="w-3 h-3" />
                  <span>
                    At close: {new Date().toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })} EST
                  </span>
                </div>
              </motion.div>

              {/* Tab Navigation */}
              <FinanceTabNav
                activeTab={activeTab}
                onTabChange={setActiveTab}
                showAllTabs={!!profile}
              />

              {/* Content based on active tab */}
              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Chart */}
                  <div className="bg-os-surface-dark/30 rounded-xl p-4 border border-os-border-dark/50">
                    <StockChart
                      data={chartData}
                      range={chartRange}
                      onRangeChange={setChartRange}
                      loading={chartLoading}
                      symbol={symbol}
                    />
                  </div>

                  {/* Stats */}
                  <div className="bg-os-surface-dark/30 rounded-xl p-4 border border-os-border-dark/50">
                    <StockStats quote={quote} loading={quoteLoading} />
                  </div>

                  {/* Company Profile & News Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Company Profile */}
                    {(profile || profileLoading) && (
                      <div className="bg-os-surface-dark/30 rounded-xl p-4 border border-os-border-dark/50">
                        <h3 className="text-sm font-medium text-brand-vanilla mb-4">About</h3>
                        <CompanyProfile profile={profile} loading={profileLoading} />
                      </div>
                    )}

                    {/* Latest News */}
                    <div className="bg-os-surface-dark/30 rounded-xl p-4 border border-os-border-dark/50">
                      <LatestNews news={news} loading={newsLoading} />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'historical' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="bg-os-surface-dark/30 rounded-xl p-4 border border-os-border-dark/50">
                    <h3 className="text-sm font-medium text-brand-vanilla mb-4">Historical Data</h3>
                    <StockChart
                      data={chartData}
                      range={chartRange}
                      onRangeChange={setChartRange}
                      loading={chartLoading}
                      symbol={symbol}
                    />
                  </div>
                </motion.div>
              )}

              {/* Placeholder for other tabs */}
              {['financials', 'earnings', 'holders', 'research'].includes(activeTab) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center py-16"
                >
                  <div className="text-center">
                    <p className="text-os-text-secondary-dark">
                      {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} data coming soon
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </FinanceLayout>
      </div>
    </div>
  );
}

