"use client";

import { useRouter } from "next/navigation";

export function GoBack({ fallback = "/" }: { fallback?: string }) {
  const router = useRouter();

  return (
    <button
      onClick={() => (window.history.length > 1 ? router.back() : router.push(fallback))}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
      Back
    </button>
  );
}
