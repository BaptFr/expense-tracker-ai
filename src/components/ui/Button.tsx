import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-[#2a78d6] text-white hover:bg-[#256abf] focus-visible:outline-[#2a78d6] disabled:bg-[#9ec5f4]",
  secondary:
    "bg-white text-[#0b0b0b] ring-1 ring-inset ring-[#c3c2b7] hover:bg-[#f9f9f7] focus-visible:outline-[#2a78d6]",
  danger:
    "bg-white text-[#d03b3b] ring-1 ring-inset ring-[#e34948]/40 hover:bg-[#fbeceb] focus-visible:outline-[#d03b3b]",
  ghost:
    "bg-transparent text-[#52514e] hover:bg-[#f9f9f7] focus-visible:outline-[#2a78d6]",
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}
