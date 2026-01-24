'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChartRange, formatPrice, formatTimestamp, formatDate, formatVolume } from '@/hooks/useFinanceData';
import { Loader2 } from 'lucide-react';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: Math.min(rect.height, 320) });
      }
    };

    updateDimensions();
    
    const observer = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
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
    const volumes = validIndices.map((idx) => data.volume[idx] || 0);

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;
    const padding = priceRange * 0.1;

    const maxVolume = Math.max(...volumes.filter(v => v > 0)) || 1;

    return {
      prices,
      timestamps,
      volumes,
      minPrice: minPrice - padding,
      maxPrice: maxPrice + padding,
      maxVolume,
      previousClose: data.previousClose,
      currency: data.currency || 'USD',
      isPositive: prices[prices.length - 1] >= (data.previousClose || prices[0]),
      lastPrice: prices[prices.length - 1],
      firstPrice: prices[0],
    };
  }, [data]);

  // Chart configuration
  const config = useMemo(() => {
    const chartHeight = Math.max(dimensions.height - 100, 200);
    const volumeHeight = 40;
    const chartWidth = dimensions.width - 80;
    const offsetX = 60;
    const offsetY = 30;
    
    return { chartHeight, volumeHeight, chartWidth, offsetX, offsetY };
  }, [dimensions]);

  // Generate SVG path
  const pathData = useMemo(() => {
    if (!chartData || dimensions.width === 0 || dimensions.height === 0) return null;

    const { prices, minPrice, maxPrice } = chartData;
    const { chartHeight, chartWidth, offsetX, offsetY } = config;

    const points = prices.map((price, index) => {
      const x = offsetX + (index / Math.max(prices.length - 1, 1)) * chartWidth;
      const y = offsetY + chartHeight - ((price - minPrice) / (maxPrice - minPrice)) * chartHeight;
      return { x, y, price };
    });

    // Create smooth curve path using quadratic bezier
    let linePath = '';
    for (let i = 0; i < points.length; i++) {
      if (i === 0) {
        linePath = `M ${points[i].x} ${points[i].y}`;
      } else {
        // Simple line for now - could be upgraded to bezier
        linePath += ` L ${points[i].x} ${points[i].y}`;
      }
    }

    // Create area path for gradient fill
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${offsetY + chartHeight} L ${offsetX} ${offsetY + chartHeight} Z`;

    return { linePath, areaPath, points };
  }, [chartData, dimensions, config]);

  // Previous close line position
  const previousCloseLine = useMemo(() => {
    if (!chartData || dimensions.height === 0) return null;

    const { minPrice, maxPrice, previousClose } = chartData;
    const { chartHeight, offsetY } = config;

    if (!previousClose || previousClose < minPrice || previousClose > maxPrice) return null;

    const y = offsetY + chartHeight - ((previousClose - minPrice) / (maxPrice - minPrice)) * chartHeight;
    return { y, price: previousClose };
  }, [chartData, dimensions, config]);

  // Handle mouse move for tooltip
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!chartData || !pathData) return;

    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const { chartWidth, offsetX } = config;

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
  const chartColorLight = chartData?.isPositive ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)';

  if (loading) {
    return (
      <div className="w-full h-[320px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 text-os-text-secondary-dark animate-spin" />
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
      <div ref={containerRef} className="relative w-full h-[320px] rounded-xl overflow-hidden">
        {!chartData ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm text-os-text-secondary-dark">No chart data available</span>
          </div>
        ) : (
          <>
            <svg
              ref={svgRef}
              className="w-full h-full"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ cursor: 'crosshair' }}
            >
              {/* Gradient Definition */}
              <defs>
                <linearGradient id={`chartGradient-${symbol}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={chartColor} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={chartColor} stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Y-Axis Labels */}
              {yAxisLabels.map((label, index) => {
                const y = config.offsetY + config.chartHeight - (index / 4) * config.chartHeight;
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
                const y = config.offsetY + config.chartHeight - (index / 4) * config.chartHeight;
                return (
                  <line
                    key={index}
                    x1={config.offsetX}
                    y1={y}
                    x2={config.offsetX + config.chartWidth}
                    y2={y}
                    stroke="rgba(255,255,255,0.04)"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Previous Close Line */}
              {previousCloseLine && (
                <g>
                  <line
                    x1={config.offsetX}
                    y1={previousCloseLine.y}
                    x2={config.offsetX + config.chartWidth}
                    y2={previousCloseLine.y}
                    stroke="rgba(255,255,255,0.25)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <rect
                    x={dimensions.width - 85}
                    y={previousCloseLine.y - 10}
                    width="70"
                    height="20"
                    rx="4"
                    fill="rgba(255,255,255,0.08)"
                  />
                  <text
                    x={dimensions.width - 50}
                    y={previousCloseLine.y + 4}
                    textAnchor="middle"
                    className="text-[9px] fill-os-text-secondary-dark"
                  >
                    Prev: {previousCloseLine.price.toFixed(2)}
                  </text>
                </g>
              )}

              {/* Area Fill */}
              {pathData && (
                <motion.path
                  d={pathData.areaPath}
                  fill={`url(#chartGradient-${symbol})`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
              )}

              {/* Line Path */}
              {pathData && (
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

              {/* Volume Bars */}
              {chartData.volumes.some(v => v > 0) && pathData && (
                <g>
                  {chartData.volumes.map((volume, index) => {
                    if (volume <= 0) return null;
                    const x = pathData.points[index]?.x;
                    if (!x) return null;
                    
                    const barHeight = (volume / chartData.maxVolume) * config.volumeHeight;
                    const y = dimensions.height - 20 - barHeight;
                    const barWidth = Math.max(1, config.chartWidth / chartData.volumes.length - 1);
                    
                    // Color based on price change from previous
                    const isUp = index > 0 ? chartData.prices[index] >= chartData.prices[index - 1] : true;
                    
                    return (
                      <rect
                        key={index}
                        x={x - barWidth / 2}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        fill={isUp ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}
                        rx="1"
                      />
                    );
                  })}
                </g>
              )}

              {/* Hover Point */}
              {hoveredIndex !== null && pathData && (
                <g>
                  {/* Vertical Line */}
                  <line
                    x1={tooltipPosition.x}
                    y1={config.offsetY}
                    x2={tooltipPosition.x}
                    y2={config.offsetY + config.chartHeight}
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="1"
                  />
                  {/* Point */}
                  <circle
                    cx={tooltipPosition.x}
                    cy={tooltipPosition.y}
                    r="5"
                    fill={chartColor}
                    stroke="white"
                    strokeWidth="2"
                  />
                </g>
              )}
            </svg>

            {/* Tooltip */}
            <AnimatePresence>
              {hoveredIndex !== null && chartData && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute top-4 left-16 bg-os-surface-dark border border-os-border-dark rounded-lg px-3 py-2 shadow-lg pointer-events-none"
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
                      Vol: {formatVolume(chartData.volumes[hoveredIndex])}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}
