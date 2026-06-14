'use client';

import React, { useState } from 'react';

interface SalesChartData {
  day: string;
  amount: number;
}

interface SalesChartProps {
  data?: SalesChartData[];
}

const DEFAULT_DATA: SalesChartData[] = [
  { day: 'Mon', amount: 120 },
  { day: 'Tue', amount: 340 },
  { day: 'Wed', amount: 210 },
  { day: 'Thu', amount: 480 },
  { day: 'Fri', amount: 390 },
  { day: 'Sat', amount: 620 },
  { day: 'Sun', amount: 510 },
];

export default function SalesChart({ data = DEFAULT_DATA }: SalesChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; val: number; day: string } | null>(null);

  // SVG dimensions
  const width = 600;
  const height = 250;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxAmount = Math.max(...data.map((d) => d.amount), 100) * 1.1; // Add 10% padding on top

  // Generate coordinates for points
  const points = data.map((d, index) => {
    const x = paddingLeft + (index / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (d.amount / maxAmount) * chartHeight;
    return { x, y, val: d.amount, day: d.day };
  });

  // Create SVG path for line (smooth cubic bezier curve)
  let linePath = '';
  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const controlX1 = curr.x + (next.x - curr.x) / 2;
      const controlY1 = curr.y;
      const controlX2 = curr.x + (next.x - curr.x) / 2;
      const controlY2 = next.y;
      linePath += ` C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${next.x} ${next.y}`;
    }
  }

  // Create SVG path for closed area (for the gradient fill)
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
    : '';

  // Y-axis ticks
  const yTicks = 4;
  const yAxisTicksValues = Array.from({ length: yTicks + 1 }, (_, i) => (maxAmount / yTicks) * i);

  return (
    <div className="relative w-full h-full font-sans select-none">
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-full overflow-visible"
        onMouseLeave={() => setHoveredPoint(null)}
      >
        <defs>
          {/* Main Area Purple-Indigo Gradient */}
          <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
          </linearGradient>

          {/* Stroke Glow Filter */}
          <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#8b5cf6" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Grid Lines (Horizontal) */}
        {yAxisTicksValues.map((val, idx) => {
          const y = paddingTop + chartHeight - (val / maxAmount) * chartHeight;
          return (
            <g key={idx} className="opacity-40">
              <line 
                x1={paddingLeft} 
                y1={y} 
                x2={width - paddingRight} 
                y2={y} 
                stroke="#334155" 
                strokeDasharray="4 4" 
                strokeWidth="1"
              />
              <text 
                x={paddingLeft - 8} 
                y={y + 4} 
                className="text-[10px] font-semibold fill-slate-500 font-mono"
                textAnchor="end"
              >
                ${Math.round(val)}
              </text>
            </g>
          );
        })}

        {/* X-axis labels */}
        {points.map((pt, idx) => (
          <text 
            key={idx} 
            x={pt.x} 
            y={height - 8} 
            className="text-[10px] font-semibold fill-slate-500"
            textAnchor="middle"
          >
            {pt.day}
          </text>
        ))}

        {/* Area Gradient Fill */}
        {areaPath && (
          <path d={areaPath} fill="url(#chart-area-grad)" />
        )}

        {/* Smooth Trend Line */}
        {linePath && (
          <path 
            d={linePath} 
            fill="none" 
            stroke="#8b5cf6" 
            strokeWidth="3.5" 
            strokeLinecap="round"
            filter="url(#glow)"
            className="transition-all duration-300"
          />
        )}

        {/* Points & Interactive Hover Circles */}
        {points.map((pt, idx) => (
          <g key={idx}>
            {/* Transparent larger circle for easier hover selection */}
            <circle 
              cx={pt.x} 
              cy={pt.y} 
              r="12" 
              fill="transparent" 
              className="cursor-pointer"
              onMouseEnter={() => setHoveredPoint(pt)}
            />
            {/* Small glowing dot */}
            <circle 
              cx={pt.x} 
              cy={pt.y} 
              r="4.5" 
              fill="#c084fc" 
              stroke="#0f172a" 
              strokeWidth="2"
              className="pointer-events-none transition-transform duration-200 group-hover:scale-125"
            />
          </g>
        ))}
      </svg>

      {/* Tooltip Overlay */}
      {hoveredPoint && (
        <div 
          className="absolute z-20 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-2.5 rounded-xl text-slate-100 shadow-2xl pointer-events-none transition-all duration-150 ease-out"
          style={{
            left: `${(hoveredPoint.x / width) * 100}%`,
            top: `${(hoveredPoint.y / height) * 100 - 20}%`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{hoveredPoint.day} Sales</p>
          <p className="text-xs font-bold text-violet-400 font-mono">${hoveredPoint.val.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}
