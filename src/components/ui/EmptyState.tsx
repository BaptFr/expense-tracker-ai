interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#c3c2b7] bg-[#fcfcfb] px-6 py-14 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#eaf2fc] text-[#2a78d6]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path
            d="M4 7h16M6 7v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-[#0b0b0b]">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-[#52514e]">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
