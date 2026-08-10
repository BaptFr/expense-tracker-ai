type IconProps = { className?: string };

const base = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.75 };

export function ReceiptIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path
        d="M6 2h12v20l-2.5-1.5L13 22l-2.5-1.5L8 22l-2-1.5V2Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 7h6M9 11h6M9 15h4" strokeLinecap="round" />
    </svg>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" strokeLinecap="round" />
    </svg>
  );
}

export function ChartIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 20V10M12 20V4M20 20v-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArchiveIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="4" width="18" height="4" rx="1" />
      <path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8M10 13h4" strokeLinecap="round" />
    </svg>
  );
}

export function CloudIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path
        d="M7 18a4 4 0 1 1 .7-7.94A5 5 0 0 1 17 12h.5a3.5 3.5 0 0 1 0 7H7Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MailIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 6 8 7 8-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LinkIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path
        d="M9 15 15 9M10 6l1.4-1.4a4 4 0 1 1 5.7 5.7L15.7 11.7M14 18l-1.4 1.4a4 4 0 1 1-5.7-5.7L8.3 12.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const TEMPLATE_ICONS = {
  receipt: ReceiptIcon,
  calendar: CalendarIcon,
  chart: ChartIcon,
  archive: ArchiveIcon,
};

export function TemplateIcon({ icon, className }: { icon: keyof typeof TEMPLATE_ICONS; className?: string }) {
  const Icon = TEMPLATE_ICONS[icon];
  return <Icon className={className} />;
}
