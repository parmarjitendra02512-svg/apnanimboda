"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function ErrorTracker() {
  const { user } = useAuth();

  useEffect(() => {
    const logErrorToServer = async (
      type: string,
      message: string,
      stack?: string,
    ) => {
      try {
        await fetch("/api/log-error", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            message,
            stack,
            url: window.location.href,
            userId: user?.uid || "Guest",
            userMobile: user?.phoneNumber || "Unknown",
          }),
        });
      } catch (e) {
        // Silently fail to avoid infinite error loops
      }
    };

    const handleWindowError = (event: ErrorEvent) => {
      logErrorToServer("error", event.message, event.error?.stack);
    };

    const handlePromiseRejection = (event: PromiseRejectionEvent) => {
      logErrorToServer("promise_rejection", String(event.reason));
    };

    window.addEventListener("error", handleWindowError);
    window.addEventListener("unhandledrejection", handlePromiseRejection);

    // Track Page View
    if (!sessionStorage.getItem("page_viewed_this_session")) {
      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "pageView" }),
      }).catch(() => {});
      sessionStorage.setItem("page_viewed_this_session", "true");
    }

    return () => {
      window.removeEventListener("error", handleWindowError);
      window.removeEventListener("unhandledrejection", handlePromiseRejection);
    };
  }, [user]);

  return null;
}
