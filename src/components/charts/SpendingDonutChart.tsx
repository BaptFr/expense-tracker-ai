"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

export interface DonutSegment {
  key: string;
  label: string;
  value: number;
  color: string;
}

interface SpendingDonutChartProps {
  segments: DonutSegment[];
  centerLabel: string;
  size?: number;
}

const GAP_DEGREES = 3;

/** Polar → cartesian, with 0° at 12 o'clock (matches how a clock/pie reads). */
function pointOnCircle(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** SVG path for one donut slice (an annulus sector) between two angles. */
function donutSlicePath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number
): string {
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  const outerStart = pointOnCircle(cx, cy, outerR, startAngle);
  const outerEnd = pointOnCircle(cx, cy, outerR, endAngle);
  const innerEnd = pointOnCircle(cx, cy, innerR, endAngle);
  const innerStart = pointOnCircle(cx, cy, innerR, startAngle);

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

/**
 * Compact donut chart for a categorical part-to-whole breakdown. Segments carry
 * a visible surface-color gap (never a stroke) and are individually
 * hoverable/focusable, matching the tooltip pattern used by the other charts
 * in this app (see CategoryBreakdownChart).
 */
export function SpendingDonutChart({ segments, centerLabel, size = 200 }: SpendingDonutChartProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2;
  const innerR = outerR * 0.62;

  let cursor = 0;
  const slices = segments.map((segment) => {
    const sweep = total > 0 ? (segment.value / total) * 360 : 0;
    const start = cursor + GAP_DEGREES / 2;
    const end = cursor + sweep - GAP_DEGREES / 2;
    cursor += sweep;
    return { ...segment, start: Math.min(start, end), end: Math.max(start, end), sweep };
  });

  const active = slices.find((s) => s.key === activeKey) ?? null;

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`Donut chart of spending by category, totaling ${formatCurrency(total)}`}
      >
        <g>
          {slices.map((slice) => {
            const isActive = activeKey === slice.key;
            if (slice.sweep <= 0) return null;
            return (
              <path
                key={slice.key}
                d={donutSlicePath(cx, cy, outerR, innerR, slice.start, slice.end)}
                fill={slice.color}
                tabIndex={0}
                role="group"
                aria-label={`${slice.label}: ${formatCurrency(slice.value)}, ${
                  total > 0 ? Math.round((slice.value / total) * 100) : 0
                } percent`}
                style={{
                  filter: isActive ? "brightness(1.08)" : undefined,
                  transformOrigin: `${cx}px ${cy}px`,
                  transform: isActive ? "scale(1.03)" : undefined,
                  transition: "transform 120ms ease, filter 120ms ease",
                  outline: "none",
                  cursor: "pointer",
                }}
                onMouseEnter={() => setActiveKey(slice.key)}
                onMouseLeave={() => setActiveKey(null)}
                onFocus={() => setActiveKey(slice.key)}
                onBlur={() => setActiveKey(null)}
              />
            );
          })}
        </g>
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        {active ? (
          <>
            <span className="text-xs font-medium text-[#898781]">{active.label}</span>
            <span className="mt-0.5 text-lg font-semibold text-[#0b0b0b]">
              {formatCurrency(active.value)}
            </span>
          </>
        ) : (
          <>
            <span className="text-xs font-medium text-[#898781]">{centerLabel}</span>
            <span className="mt-0.5 text-lg font-semibold text-[#0b0b0b]">
              {formatCurrency(total)}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
