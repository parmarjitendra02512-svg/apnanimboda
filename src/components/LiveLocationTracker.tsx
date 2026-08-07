"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function LiveLocationTracker() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || typeof window === "undefined" || !("geolocation" in navigator)) return;

    const setupTracker = async () => {
      try {
        const perm = await navigator.permissions.query({ name: "geolocation" });
        if (perm.state === "granted") {
          getLocationOnce();
        }
      } catch (e) {
        getLocationOnce();
      }
    };

    const getLocationOnce = () => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          try {
            await fetch("/api/users/update", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: user.uid || user.mobile,
                type: "liveLocation",
                data: {
                  lat: latitude,
                  lng: longitude,
                  accuracy,
                  timestamp: Date.now()
                }
              })
            });
          } catch (err) {
            console.error("Failed to update live location", err);
          }
        },
        (error) => {},
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    };

    setupTracker();

  }, [user]);

  return null;
}
