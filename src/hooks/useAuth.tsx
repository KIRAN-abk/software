import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { mockBackend } from "@/integrations/mock/mockBackend";

interface AuthContextType {
  user: { id: string; email?: string } | null;
  session: { user: { id: string; email?: string } } | null;
  loading: boolean;
  role: string | null;
  signUp: (email: string, password: string, fullName: string, role: "rider" | "driver", vehicleDetails?: any) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [session, setSession] = useState<{ user: { id: string; email?: string } } | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        const { data: authSession } = await mockBackend.authGetSession();
        if (cancelled) return;

        setSession(authSession);
        setUser(authSession?.user ?? null);
        setRole(authSession?.user ? await mockBackend.getRole(authSession.user.id).then((r) => r.data.role) : null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, []);

  async function fetchRole(userId: string) {
    const { data } = await mockBackend.getRole(userId);
    setRole(data.role ?? null);
  }

  async function signUp(email: string, password: string, fullName: string, userRole: "rider" | "driver", vehicleDetails?: any) {
    setLoading(true);
    try {
      const result = await mockBackend.authSignUp({
        email,
        password,
        fullName,
        role: userRole,
        vehicleDetails,
      });

      const newSession = { user: { id: result.data.user.id, email: result.data.user.email } };
      setSession(newSession);
      setUser(newSession.user);
      await fetchRole(newSession.user.id);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    setLoading(true);
    try {
      const result = await mockBackend.authSignInWithPassword({ email, password });
      const newSession = { user: { id: result.data.user.id, email: result.data.user.email } };
      setSession(newSession);
      setUser(newSession.user);
      await fetchRole(newSession.user.id);
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    setLoading(true);
    try {
      await mockBackend.authSignOut();
      setSession(null);
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  }

  const value = useMemo(
    () => ({ user, session, loading, role, signUp, signIn, signOut }),
    [user, session, loading, role]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
