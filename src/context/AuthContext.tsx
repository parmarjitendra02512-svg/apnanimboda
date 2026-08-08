"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { ref, get, set, onValue, update } from "firebase/database";


interface User {
  uid: string;
  email: string;
  mobile: string;
  name?: string;
  planType?: "free" | "pro" | "business" | "enterprise";
  planExpiry?: number | null;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isApproved: boolean;
  login: (mobile: string, pass: string) => Promise<void>;
  register: (mobile: string, pass: string, data: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Re-hydrate session from localStorage (since we aren't using Firebase Auth)
  useEffect(() => {
    let hasValidUser = false;
    
    // SAFETY TIMEOUT: Never stay loading for more than 5 seconds
    // This prevents blank screen on slow mobile networks
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 5000);
    
    try {
      const savedUser = localStorage.getItem("tanumanu_user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed) {
          hasValidUser = true;
          setUser(parsed);
          checkUserStatus(parsed);

          // Setup realtime listener for this user to keep data synced
          const userId = parsed.uid || parsed.mobile;
          const userRef = ref(db, `approved_users/${userId}`);
          const unsubscribe = onValue(userRef, async (snap) => {
            if (snap.exists()) {
              const data = snap.val();
              // Prevent excessive app-wide re-renders from frequent background updates like GPS
              const { location, lastLogin, ...restData } = data;
              setUser((prev) =>
                prev ? { ...prev, ...restData } : { uid: userId, mobile: userId, ...restData },
              );
            } else {
              // Check if they are just pending in 'users' or 'pending_requests'
              const pendingRef = ref(db, `pending_requests/${userId}`);
              const pendingSnap = await get(pendingRef);
              if (!pendingSnap.exists() && parsed.role !== "admin") {
                // User has been completely deleted by admin
                alert("Your account has been deleted by the administrator.");
                await logout();
                window.location.replace("/");
              }
            }
          });
          return () => {
            clearTimeout(safetyTimer);
            unsubscribe();
          };
        }
      }
    } catch (e) {
      console.warn("localStorage not available for auth");
    }
    
    // Only set loading false if no valid user is found. 
    // If valid user exists, checkUserStatus will handle setLoading(false).
    if (!hasValidUser) {
      clearTimeout(safetyTimer);
      setLoading(false);
    }
    
    return () => clearTimeout(safetyTimer);
  }, []);

  const checkUserStatus = async (currentUser: User) => {
    setLoading(true);
    try {
      if (!currentUser.mobile) {
        throw new Error("Missing mobile number for user.");
      }
      // Check if banned
      const banRefLive = ref(db, `banned_users/${currentUser.mobile}`);
      onValue(banRefLive, (snap) => {
        if (snap.exists()) {
          const banData = snap.val();
          if (!banData.bannedUntil || banData.bannedUntil > Date.now()) {
            alert("You have been banned by the Administrator.");
            logout();
            window.location.replace("/login");
          }
        }
      });

      // We no longer rely purely on local DB checks for admin because the server validates it.
      setIsAdmin(currentUser.role === "admin");
      setIsApproved(true);
    } catch (err) {
      console.error("Error in checkUserStatus:", err);
      // If there is an error (e.g. malformed user), log them out
      try {
        localStorage.removeItem("tanumanu_user");
      } catch (e) {}
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (mobile: string, pass: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, password: pass }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (data.redirect === "/admin") {
        const adminUser = { uid: mobile, mobile, role: "admin" };
        try {
          localStorage.setItem("tanumanu_user", JSON.stringify(adminUser));
          
          // Secure Firebase Auth for Admin
          const { signInWithEmailAndPassword } = require("firebase/auth");
          const { auth } = require("@/lib/firebase");
          await signInWithEmailAndPassword(auth, "admin@apnanimboda.com", pass);
        } catch (e) {
          console.error("Firebase Admin Auth Failed:", e);
        }
        setUser(adminUser as any);
        setIsAdmin(true);
        setIsApproved(true);
        return;
      }

      // Secure login successful
      try {
        localStorage.setItem("tanumanu_user", JSON.stringify(data.user));
      } catch (e) {}
      setUser(data.user);
      await checkUserStatus(data.user);
    } catch (error: any) {
      console.error("Login Error:", error);
      throw error;
    }
  };

  const register = async (mobile: string, pass: string, data: any) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, password: pass, ...data }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Registration failed");
      }

      // Auto login locally as pending
      const fakeEmail = `${mobile.replace("@apnanimboda.com", "")}@apnanimboda.com`;
      const userObj = {
        uid: data.uid || mobile,
        email: fakeEmail,
        mobile,
        status: "pending",
        ...data,
      };
      try {
        localStorage.setItem("tanumanu_user", JSON.stringify(userObj));
      } catch (e) {}
      setUser(userObj as User);
      setIsApproved(false);
      setLoading(false);
    } catch (error: any) {
      console.error("Registration Error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {}
    try {
      localStorage.removeItem("tanumanu_user");
      localStorage.removeItem("nimboda_permissions_allowed");
    } catch (e) {}
    setUser(null);
    setIsAdmin(false);
    setIsApproved(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, isAdmin, isApproved, login, register, logout }}
    >
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/60 text-sm animate-pulse">Loading...</p>
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
