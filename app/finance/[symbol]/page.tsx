'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import {
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
import { TrendingUp, TrendingDown, Clock, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface PageProps {
  params: Promise<{ symbol: string }>;
}

export default function StockDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  // Decode URL-encoded symbols like %5EGSPC to ^GSPC
  const symbol = decodeURIComponent(resolvedParams.symbol).toUpperCase();
  
  const [activeTab, setActiveTab] = useState<FinanceTab>('overview');
  const [chartRange, setChartRange] = useState<ChartRange>('ytd');

  // Fetch data
  const { data: quote, loading: quoteLoading } = useQuote(symbol);
  const { data: chartData, loading: chartLoading } = useChart(symbol, chartRange);
  const { data: profile, loading: profileLoading } = useCompanyProfile(symbol);
  const { data: news, loading: newsLoading } = useNews(symbol);

  const isPositive = quote ? quote.regularMarketChange >= 0 : true;

  return (
    <div className="flex h-screen bg-os-bg-dark dark:bg-os-bg-dark text-os-text-primary-dark font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden pt-14 lg:pt-0">
        {/* Header */}
        <header className="shrink-0 z-30 h-12 bg-os-bg-dark border-b border-os-border-dark/50">
          <div className="flex items-center justify-between h-full px-6 md:px-12 max-w-4xl mx-auto">
            {/* Left: Back to Finance */}
            <Link
              href="/finance"
              className="group flex items-center gap-2 text-os-text-secondary-dark hover:text-brand-vanilla transition-colors"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm font-medium hidden sm:inline">Finance</span>
            </Link>

            {/* Right: empty for now */}
            <div className="w-20" />
          </div>
        </header>

        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main content - scrollable */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="w-full max-w-4xl mx-auto px-6 py-8 md:px-12 md:py-12">
              {/* Stock Header */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6"
              >
                {/* Symbol & Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-os-surface-dark border border-os-border-dark flex items-center justify-center">
                    <span className="text-lg font-bold text-brand-vanilla">
                      {symbol.replace('^', '').slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-display font-bold text-brand-vanilla">
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
                <div className="flex items-baseline gap-4 mb-2">
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
                          {chartRange.toUpperCase()}
                        </span>
                      </div>
                    </>
                  ) : (
                    <span className="text-os-text-secondary-dark">Price unavailable</span>
                  )}
                </div>

                {/* Last Update */}
                <div className="flex items-center gap-2 text-xs text-os-text-secondary-dark">
                  <Clock className="w-3 h-3" />
                  <span>
                    Last update: {new Date().toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })} EST
                  </span>
                </div>
              </motion.div>

              {/* Tab Navigation */}
              <div className="mb-6">
                <FinanceTabNav
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  showAllTabs={!!profile}
                />
              </div>

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

                  {/* Latest News & Company Profile - Side by Side */}
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr,340px] xl:grid-cols-[1fr,380px] gap-6">
                    {/* Latest News */}
                    <div className="bg-os-surface-dark/30 rounded-xl p-4 border border-os-border-dark/50">
                      <LatestNews news={news} loading={newsLoading} maxItems={6} />
                    </div>

                    {/* Company Profile */}
                    <div className="bg-os-surface-dark/30 rounded-xl p-4 border border-os-border-dark/50">
                      <h3 className="text-sm font-medium text-brand-vanilla mb-4">About</h3>
                      <CompanyProfile profile={profile} loading={profileLoading} />
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

          {/* Sidebar - fixed width */}
          <aside className="hidden xl:block w-[320px] border-l border-os-border-dark bg-os-surface-dark/30 p-4 overflow-y-auto custom-scrollbar">
            <WatchlistSidebar />
          </aside>
        </div>
      </div>
    </div>
  );
}
