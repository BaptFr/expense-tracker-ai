interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}

export function FormField({ label, htmlFor, error, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-[#0b0b0b]">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-sm text-[#d03b3b]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export const inputClasses =
  "w-full rounded-lg border border-[#c3c2b7] bg-white px-3 py-2 text-sm text-[#0b0b0b] outline-none transition-colors placeholder:text-[#898781] focus:border-[#2a78d6] focus:ring-2 focus:ring-[#2a78d6]/20 aria-[invalid=true]:border-[#d03b3b] aria-[invalid=true]:focus:ring-[#d03b3b]/20";
