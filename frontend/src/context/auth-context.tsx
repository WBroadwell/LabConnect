"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { User } from "@/types";

interface AuthUser extends User {
  can_create_opportunities: boolean;
  is_admin: boolean;
  saved_opportunity_ids: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  canCreateOpportunities: boolean;
  savedOpportunityIds: string[];
  // Authentication methods
  login: () => void;
  logout: () => Promise<void>;
  exchangeCodeForToken: (code: string) => Promise<{ registered: boolean }>;
  // For testing: manually set user ID (simulates SSO login)
  setTestUserId: (userId: number | null) => void;
  testUserId: number | null;
  // Methods to update saved opportunities locally
  addSavedOpportunity: (id: string) => void;
  removeSavedOpportunity: (id: string) => void;
  // Method to refresh user data
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [testUserId, setTestUserIdState] = useState<number | null>(null);

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const headers: Record<string, string> = {};

      // In dev mode, also send X-User-Id header if set
      if (testUserId !== null) {
        headers["X-User-Id"] = testUserId.toString();
      }

      const response = await fetch(`/api/auth/me`, {
        credentials: "include",
        headers,
      });
      const data = await response.json();

      if (data.authenticated) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.log("Auth fetch failed:", err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [testUserId]);

  // Check for existing session on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem("testUserId");
    if (storedUserId) {
      setTestUserIdState(parseInt(storedUserId, 10));
    }
    fetchUser();
  }, [fetchUser]);

  // Refetch user when testUserId changes
  useEffect(() => {
    if (testUserId !== null) {
      fetchUser();
    }
  }, [testUserId, fetchUser]);

  const login = () => {
    // Redirect to backend login endpoint
    window.location.href = `/api/login`;
  };

  const logout = async () => {
    try {
      await fetch(`/api/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.log("Logout request failed:", err);
    }

    // Clear local state
    setUser(null);
    localStorage.removeItem("testUserId");
    setTestUserIdState(null);
  };

  const exchangeCodeForToken = async (code: string): Promise<{ registered: boolean }> => {
    const response = await fetch(`/api/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to exchange code for token");
    }

    const data = await response.json();

    // If user is registered, fetch their data
    if (data.registered && data.user) {
      setUser(data.user);
    }

    return { registered: data.registered };
  };

  const handleSetTestUserId = (userId: number | null) => {
    setTestUserIdState(userId);
    if (userId !== null) {
      localStorage.setItem("testUserId", userId.toString());
    } else {
      localStorage.removeItem("testUserId");
      setUser(null);
    }
  };

  const addSavedOpportunity = (id: string) => {
    if (user) {
      setUser({
        ...user,
        saved_opportunity_ids: [...user.saved_opportunity_ids, id],
      });
    }
  };

  const removeSavedOpportunity = (id: string) => {
    if (user) {
      setUser({
        ...user,
        saved_opportunity_ids: user.saved_opportunity_ids.filter((savedId) => savedId !== id),
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        canCreateOpportunities: user?.can_create_opportunities ?? false,
        savedOpportunityIds: user?.saved_opportunity_ids ?? [],
        login,
        logout,
        exchangeCodeForToken,
        setTestUserId: handleSetTestUserId,
        testUserId,
        addSavedOpportunity,
        removeSavedOpportunity,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
