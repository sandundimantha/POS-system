'use client';

import React, { useState } from 'react';

interface DonutSegment {
  name: string;
  value: number;
  color: string;
  hoverColor: string;
}

interface PaymentDonutChartProps {
  data: {
    CASH: number;
    CARD: number;
    MOBILE_PAY: number;
  };
}

export default function PaymentDonutChart({ data }: PaymentDonutChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const rawSegments: { name: string; value: number; color: string; hoverColor: string }[] = [
    { name: 'Cash', value: data.CASH || 0, color: '#10b981', hoverColor: '#34d399' },
    { name: 'Card', value: data.CARD || 0, color: '#8b5cf6', hoverColor: '#a78bfa' },
    { name: 'Mobile Pay', value: data.MOBILE_PAY || 0, color: '#06b6d4', hoverColor: '#22d3ee' },
  ];

  const total = rawSegments.reduce((sum, seg) => sum + seg.value, 0);

  // Filter out zero-value segments to avoid rendering issues
  const segments = rawSegments.filter((seg) => seg.value > 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val);
  };

  // SVG parameters
  const size = 200;
  const radius = 70;
  const strokeWidth = 18;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col items-center justify-center sm:flex-row gap-6 p-4">
      {/* Donut Chart SVG */}
      <div className="relative w-[200px] h-[200px]">
        {total === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs text-center border-4 border-dashed border-slate-800 rounded-full">
            No volume data
          </div>
        ) : (
          <>
            <svg width={size} height={size} className="transform -rotate-90">
              {/* Background circle */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke="#1e293b"
                strokeWidth={strokeWidth}
              />

              {/* Data segments */}
              {segments.map((seg, idx) => {
                const percent = seg.value / total;
                const strokeLength = percent * circumference;
                const strokeOffset = circumference - (accumulatedPercent * circumference);
                accumulatedPercent += percent;

                const isHovered = hoveredIdx === idx;

                return (
                  <circle
                    key={seg.name}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="transparent"
                    stroke={isHovered ? seg.hoverColor : seg.color}
                    strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                    strokeDasharray={`${strokeLength} ${circumference}`}
                    strokeDashoffset={strokeOffset}
                    strokeLinecap="round"
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    style={{
                      transformOrigin: 'center',
                    }}
                  />
                );
              })}
            </svg>

            {/* Centered Total / Hover Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
              {hoveredIdx !== null ? (
                <>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    {segments[hoveredIdx].name}
                  </span>
                  <span className="text-sm font-bold text-slate-100 font-mono mt-0.5">
                    {formatCurrency(segments[hoveredIdx].value)}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {((segments[hoveredIdx].value / total) * 100).toFixed(1)}%
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Total Revenue
                  </span>
                  <span className="text-base font-bold text-slate-100 font-mono mt-0.5">
                    {formatCurrency(total)}
                  </span>
                  <span className="text-[9px] text-slate-500">
                    {segments.length} Channels
                  </span>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Legend Column */}
      <div className="flex flex-col gap-3 justify-center text-xs">
        {rawSegments.map((seg, idx) => {
          const pct = total > 0 ? (seg.value / total) * 100 : 0;
          return (
            <div
              key={seg.name}
              className={`flex items-center gap-3.5 px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                hoveredIdx === idx ? 'bg-slate-800/40 text-slate-100' : 'text-slate-400 hover:text-slate-200'
              }`}
              onMouseEnter={() => total > 0 && setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: seg.color }}
              ></div>
              <div className="flex flex-col min-w-[100px]">
                <span className="font-semibold text-slate-350">{seg.name}</span>
                <span className="text-[10px] text-slate-500 font-mono">{formatCurrency(seg.value)} ({pct.toFixed(0)}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
