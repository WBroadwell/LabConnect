"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";

interface AuthUser extends User {
  can_create_opportunities: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  canCreateOpportunities: boolean;
  // For testing: manually set user ID (simulates SSO login)
  setTestUserId: (userId: number | null) => void;
  testUserId: number | null;
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

  useEffect(() => {
    async function fetchUser() {
      if (testUserId === null) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/auth/me", {
          headers: {
            "X-User-Id": testUserId.toString(),
          },
        });
        const data = await response.json();
        if (data.authenticated) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, [testUserId]);

  const handleSetTestUserId = (userId: number | null) => {
    setTestUserId(userId);
    if (userId !== null) {
      localStorage.setItem("testUserId", userId.toString());
    } else {
      localStorage.removeItem("testUserId");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        canCreateOpportunities: user?.can_create_opportunities ?? false,
        setTestUserId: handleSetTestUserId,
        testUserId,
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
