import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase"; // Your Supabase client
import { User } from "../types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      setLoading(true);
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (session?.user) {
        const currentUser = session.user;
        const userData: User = {
          id: currentUser.id,
          email: currentUser.email ?? "",
          username: currentUser.email?.split("@")[0] ?? "User",
        };
        setUser(userData);
        await AsyncStorage.setItem("flashify_user", JSON.stringify(userData));
      }

      setLoading(false);
    };

    loadSession();

    // Listen to auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const currentUser = session.user;
          const userData: User = {
            id: currentUser.id,
            email: currentUser.email ?? "",
            username: currentUser.email?.split("@")[0] ?? "User",
          };
          setUser(userData);
          await AsyncStorage.setItem("flashify_user", JSON.stringify(userData));
        } else {
          setUser(null);
          await AsyncStorage.removeItem("flashify_user");
        }
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, username: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    await AsyncStorage.removeItem("flashify_user");
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
