"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
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
  const [testUserId, setTestUserId] = useState<number | null>(null);

  useEffect(() => {
    // Check localStorage for persisted test user ID
    const storedUserId = localStorage.getItem("testUserId");
    if (storedUserId) {
      setTestUserId(parseInt(storedUserId, 10));
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    if (testUserId === null) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/me", {
        headers: {
          "X-User-Id": testUserId.toString(),
        },
      });
      const data = await response.json();
      console.log("Auth response:", data);
      if (data.authenticated) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      // Backend might not be running - fail silently
      console.log("Auth fetch failed:", err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testUserId]);

  const handleSetTestUserId = (userId: number | null) => {
    setTestUserId(userId);
    if (userId !== null) {
      localStorage.setItem("testUserId", userId.toString());
    } else {
      localStorage.removeItem("testUserId");
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
