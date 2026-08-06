"use client";

import { useMemo, useState } from "react";
import { formatCurrency, formatCurrencyCompact } from "@/lib/utils";
import { Expense } from "@/types/expense";
import { EmptyState } from "@/components/ui/EmptyState";

interface MonthlyTrendChartProps {
  expenses: Expense[];
  monthsToShow?: number;
}

interface MonthBucket {
  key: string; // yyyy-mm
  label: string;
  total: number;
}

/** Rounds up to a friendly axis max: 1/2/5 × a power of ten. */
function niceMax(rawMax: number): number {
  if (rawMax <= 0) return 100;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawMax)));
  const normalized = rawMax / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

export function MonthlyTrendChart({ expenses, monthsToShow = 6 }: MonthlyTrendChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const buckets: MonthBucket[] = useMemo(() => {
    const now = new Date();
    const result: MonthBucket[] = [];
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { month: "short" });
      result.push({ key, label, total: 0 });
    }
    const byKey = new Map(result.map((b) => [b.key, b]));
    for (const e of expenses) {
      const key = e.date.slice(0, 7);
      const bucket = byKey.get(key);
      if (bucket) bucket.total += e.amount;
    }
    return result;
  }, [expenses, monthsToShow]);

  const hasData = buckets.some((b) => b.total > 0);
  const rawMax = Math.max(...buckets.map((b) => b.total));
  const axisMax = niceMax(rawMax);
  const gridSteps = [0, 0.25, 0.5, 0.75, 1];
  const maxIndex = buckets.reduce(
    (best, b, i) => (b.total > buckets[best].total ? i : best),
    0
  );

  if (!hasData) {
    return (
      <EmptyState
        title="No trend yet"
        description="Once you log expenses across a few months, your spending trend will show up here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div role="img" aria-label={`Column chart of total spending per month for the last ${monthsToShow} months`} className="relative h-48 pl-12">
        {gridSteps.map((step) => (
          <div key={step} className="absolute left-12 right-0 border-t border-[#e1e0d9]" style={{ bottom: `${step * 100}%` }}>
            <span className="absolute -left-12 -translate-y-1/2 pr-2 text-xs tabular-nums text-[#898781]">
              {formatCurrencyCompact(axisMax * step)}
            </span>
          </div>
        ))}

        <div className="absolute inset-0 left-12 flex items-end justify-between gap-2 sm:gap-4">
          {buckets.map((bucket, i) => {
            const heightPercent = axisMax > 0 ? (bucket.total / axisMax) * 100 : 0;
            const isActive = activeIndex === i;
            const isMax = i === maxIndex && bucket.total > 0;

            return (
              <div
                key={bucket.key}
                className="relative flex h-full flex-1 flex-col items-center justify-end"
                tabIndex={0}
                role="group"
                aria-label={`${bucket.label}: ${formatCurrency(bucket.total)}`}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
                onFocus={() => setActiveIndex(i)}
                onBlur={() => setActiveIndex(null)}
              >
                {(isActive || isMax) && bucket.total > 0 && (
                  <div
                    role="tooltip"
                    className={`absolute z-10 -translate-y-1 whitespace-nowrap rounded-md px-2 py-1 text-xs font-semibold shadow-lg ${
                      isActive ? "bg-[#0b0b0b] text-white" : "bg-transparent text-[#0b0b0b] shadow-none"
                    }`}
                    style={{ bottom: `${heightPercent}%` }}
                  >
                    {formatCurrency(bucket.total)}
                  </div>
                )}
                <div
                  className="w-full max-w-[28px] rounded-t-[4px] transition-[filter] duration-150"
                  style={{
                    height: `${Math.max(heightPercent, bucket.total > 0 ? 2 : 0)}%`,
                    backgroundColor: "#2a78d6",
                    filter: isActive ? "brightness(1.12)" : undefined,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between gap-2 pl-12 sm:gap-4">
        {buckets.map((bucket) => (
          <span key={bucket.key} className="flex-1 text-center text-xs text-[#898781]">
            {bucket.label}
          </span>
        ))}
      </div>
    </div>
  );
}
