interface CardProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, subtitle, action, children, className = "" }: CardProps) {
  return (
    <div className={`rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-sm font-semibold text-[#0b0b0b]">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-[#898781]">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
