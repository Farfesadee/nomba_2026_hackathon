"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Auto-logout when tab is closed (not on refresh)
  useEffect(() => {
    if (!user) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Tab hidden (switch, minimize, or close) — wait 30s then logout
        if (closeTimer.current) clearTimeout(closeTimer.current);
        closeTimer.current = setTimeout(() => {
          logout();
        }, 30000);
      } else {
        // Tab visible again — cancel timer
        if (closeTimer.current) {
          clearTimeout(closeTimer.current);
          closeTimer.current = undefined;
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, [user, logout]);

  return <>{children}</>;
}
