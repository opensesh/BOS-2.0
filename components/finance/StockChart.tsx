'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChartRange, formatPrice, formatTimestamp, formatDate } from '@/hooks/useFinanceData';

interface ChartData {
  timestamp: number[];
  close: number[];
  high: number[];
  low: number[];
  open: number[];
  volume: number[];
  previousClose: number;
  currency: string;
}

interface StockChartProps {
  data: ChartData | null;
  range: ChartRange;
  onRangeChange: (range: ChartRange) => void;
  loading?: boolean;
  symbol?: string;
}

const RANGE_OPTIONS: { value: ChartRange; label: string }[] = [
  { value: '1d', label: '1D' },
  { value: '5d', label: '5D' },
  { value: '1mo', label: '1M' },
  { value: '6mo', label: '6M' },
  { value: 'ytd', label: 'YTD' },
  { value: '1y', label: '1Y' },
  { value: '5y', label: '5Y' },
  { value: 'max', label: 'MAX' },
];

export function StockChart({ data, range, onRangeChange, loading, symbol }: StockChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Calculate chart data
  const chartData = useMemo(() => {
    if (!data || !data.close || data.close.length === 0) return null;

    // Filter out null values
    const validIndices = data.close
      .map((val, idx) => (val !== null && !isNaN(val) ? idx : -1))
      .filter((idx) => idx !== -1);

    if (validIndices.length === 0) return null;

    const prices = validIndices.map((idx) => data.close[idx]);
    const timestamps = validIndices.map((idx) => data.timestamp[idx]);
    const volumes = validIndices.map((idx) => data.volume[idx]);

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;
    const padding = priceRange * 0.1;

    return {
      prices,
      timestamps,
      volumes,
      minPrice: minPrice - padding,
      maxPrice: maxPrice + padding,
      previousClose: data.previousClose,
      currency: data.currency || 'USD',
      isPositive: prices[prices.length - 1] >= (data.previousClose || prices[0]),
    };
  }, [data]);

  // Generate SVG path
  const pathData = useMemo(() => {
    if (!chartData || dimensions.width === 0 || dimensions.height === 0) return '';

    const { prices, minPrice, maxPrice } = chartData;
    const chartHeight = dimensions.height - 60; // Leave room for labels
    const chartWidth = dimensions.width - 80;
    const offsetX = 60;
    const offsetY = 20;

    const points = prices.map((price, index) => {
      const x = offsetX + (index / (prices.length - 1)) * chartWidth;
      const y = offsetY + chartHeight - ((price - minPrice) / (maxPrice - minPrice)) * chartHeight;
      return { x, y };
    });

    // Create smooth curve path
    const linePath = points.reduce((path, point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`;
      return `${path} L ${point.x} ${point.y}`;
    }, '');

    // Create area path for gradient fill
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${offsetY + chartHeight} L ${offsetX} ${offsetY + chartHeight} Z`;

    return { linePath, areaPath, points };
  }, [chartData, dimensions]);

  // Previous close line position
  const previousCloseLine = useMemo(() => {
    if (!chartData || dimensions.height === 0) return null;

    const { minPrice, maxPrice, previousClose } = chartData;
    const chartHeight = dimensions.height - 60;
    const offsetY = 20;

    if (previousClose < minPrice || previousClose > maxPrice) return null;

    const y = offsetY + chartHeight - ((previousClose - minPrice) / (maxPrice - minPrice)) * chartHeight;
    return { y, price: previousClose };
  }, [chartData, dimensions]);

  // Handle mouse move for tooltip
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!chartData || !pathData || typeof pathData === 'string') return;

    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const chartWidth = dimensions.width - 80;
    const offsetX = 60;

    // Find closest point
    const normalizedX = (x - offsetX) / chartWidth;
    const index = Math.round(normalizedX * (chartData.prices.length - 1));
    const clampedIndex = Math.max(0, Math.min(chartData.prices.length - 1, index));

    setHoveredIndex(clampedIndex);
    setTooltipPosition({
      x: pathData.points[clampedIndex].x,
      y: pathData.points[clampedIndex].y,
    });
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  // Y-axis labels
  const yAxisLabels = useMemo(() => {
    if (!chartData) return [];
    const { minPrice, maxPrice } = chartData;
    const step = (maxPrice - minPrice) / 4;
    return [0, 1, 2, 3, 4].map((i) => minPrice + step * i);
  }, [chartData]);

  const chartColor = chartData?.isPositive ? '#22c55e' : '#ef4444';
  const chartColorFaded = chartData?.isPositive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)';

  if (loading) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-os-text-secondary-dark border-t-brand-aperol rounded-full animate-spin" />
          <span className="text-sm text-os-text-secondary-dark">Loading chart...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Range Selector */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onRangeChange(option.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                range === option.value
                  ? 'bg-os-surface-dark text-brand-vanilla'
                  : 'text-os-text-secondary-dark hover:text-brand-vanilla hover:bg-os-surface-dark/50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="relative w-full h-[300px] bg-os-surface-dark/30 rounded-xl">
        {!chartData ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm text-os-text-secondary-dark">No data available</span>
          </div>
        ) : (
          <svg
            ref={svgRef}
            className="w-full h-full"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Gradient Definition */}
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={chartColor} stopOpacity="0.3" />
                <stop offset="100%" stopColor={chartColor} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Y-Axis Labels */}
            {yAxisLabels.map((label, index) => {
              const chartHeight = dimensions.height - 60;
              const offsetY = 20;
              const y = offsetY + chartHeight - (index / 4) * chartHeight;
              return (
                <text
                  key={index}
                  x="50"
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] fill-os-text-secondary-dark"
                >
                  {label.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </text>
              );
            })}

            {/* Grid Lines */}
            {yAxisLabels.map((_, index) => {
              const chartHeight = dimensions.height - 60;
              const chartWidth = dimensions.width - 80;
              const offsetX = 60;
              const offsetY = 20;
              const y = offsetY + chartHeight - (index / 4) * chartHeight;
              return (
                <line
                  key={index}
                  x1={offsetX}
                  y1={y}
                  x2={offsetX + chartWidth}
                  y2={y}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="1"
                />
              );
            })}

            {/* Previous Close Line */}
            {previousCloseLine && (
              <g>
                <line
                  x1="60"
                  y1={previousCloseLine.y}
                  x2={dimensions.width - 20}
                  y2={previousCloseLine.y}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <rect
                  x={dimensions.width - 85}
                  y={previousCloseLine.y - 10}
                  width="65"
                  height="20"
                  rx="4"
                  fill="rgba(255,255,255,0.1)"
                />
                <text
                  x={dimensions.width - 52}
                  y={previousCloseLine.y + 4}
                  textAnchor="middle"
                  className="text-[10px] fill-os-text-secondary-dark"
                >
                  Prev: {previousCloseLine.price.toFixed(2)}
                </text>
              </g>
            )}

            {/* Area Fill */}
            {pathData && typeof pathData !== 'string' && (
              <motion.path
                d={pathData.areaPath}
                fill="url(#chartGradient)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            )}

            {/* Line Path */}
            {pathData && typeof pathData !== 'string' && (
              <motion.path
                d={pathData.linePath}
                fill="none"
                stroke={chartColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            )}

            {/* Hover Point */}
            {hoveredIndex !== null && pathData && typeof pathData !== 'string' && (
              <g>
                {/* Vertical Line */}
                <line
                  x1={tooltipPosition.x}
                  y1={20}
                  x2={tooltipPosition.x}
                  y2={dimensions.height - 40}
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1"
                />
                {/* Point */}
                <circle
                  cx={tooltipPosition.x}
                  cy={tooltipPosition.y}
                  r="6"
                  fill={chartColor}
                  stroke="white"
                  strokeWidth="2"
                />
              </g>
            )}
          </svg>
        )}

        {/* Tooltip */}
        <AnimatePresence>
          {hoveredIndex !== null && chartData && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute top-4 left-16 bg-os-surface-dark border border-os-border-dark rounded-lg px-3 py-2 shadow-lg"
            >
              <div className="text-xs text-os-text-secondary-dark">
                {range === '1d' || range === '5d'
                  ? formatTimestamp(chartData.timestamps[hoveredIndex])
                  : formatDate(chartData.timestamps[hoveredIndex])}
              </div>
              <div className="font-mono font-bold text-brand-vanilla">
                {formatPrice(chartData.prices[hoveredIndex], chartData.currency)}
              </div>
              {chartData.volumes[hoveredIndex] > 0 && (
                <div className="text-xs text-os-text-secondary-dark">
                  Vol: {(chartData.volumes[hoveredIndex] / 1e6).toFixed(2)}M
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

