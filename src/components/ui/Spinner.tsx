export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`h-5 w-5 animate-spin rounded-full border-2 border-[#c3c2b7] border-t-[#2a78d6] ${className}`}
    />
  );
}

export function PageSpinner() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}
