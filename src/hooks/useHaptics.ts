"use client";

import { useCallback } from "react";

export function useHaptics() {
  const triggerHaptic = useCallback(
    (type: "light" | "medium" | "heavy" | "success" | "error" = "light") => {
      if (
        typeof window === "undefined" ||
        !window.navigator ||
        !window.navigator.vibrate
      ) {
        return;
      }

      try {
        switch (type) {
          case "light":
            window.navigator.vibrate(10);
            break;
          case "medium":
            window.navigator.vibrate(30);
            break;
          case "heavy":
            window.navigator.vibrate(50);
            break;
          case "success":
            window.navigator.vibrate([10, 30, 20]);
            break;
          case "error":
            window.navigator.vibrate([50, 50, 50, 50]);
            break;
          default:
            window.navigator.vibrate(15);
        }
      } catch (err) {
        // Ignore vibration errors on unsupported devices
      }
    },
    [],
  );

  return triggerHaptic;
}
