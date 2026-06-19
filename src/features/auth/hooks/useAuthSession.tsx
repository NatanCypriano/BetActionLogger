import type { Session } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { fetchOwnProfile } from "@/features/auth/api/profileApi";
import type { AuthProfile } from "@/features/auth/types";
import { queryClient } from "@/lib/queryClient";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

type AuthResult = {
  message: string;
  ok: boolean;
};

type AuthContextValue = {
  isLoading: boolean;
  profile: AuthProfile | null;
  refreshProfile: () => Promise<void>;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfileForSession = useCallback(async (nextSession: Session | null) => {
    if (!nextSession || !isSupabaseConfigured) {
      setProfile(null);
      return;
    }

    const nextProfile = await fetchOwnProfile(nextSession.user.id, nextSession.user.email);
    setProfile(nextProfile);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setProfile(null);
      return;
    }

    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw new Error("Não foi possível carregar a sessão.");
    }

    await loadProfileForSession(data.session);
  }, [loadProfileForSession]);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      if (!isSupabaseConfigured) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (error) {
        setSession(null);
        setProfile(null);
        setIsLoading(false);
        return;
      }

      setSession(data.session);

      if (data.session) {
        try {
          await loadProfileForSession(data.session);
        } catch {
          if (isMounted) {
            setSession(null);
            setProfile(null);
          }
          await supabase.auth.signOut();
        }
      }

      if (isMounted) {
        setIsLoading(false);
      }
    }

    void bootstrap();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);

      if (!nextSession) {
        setProfile(null);
        queryClient.clear();
        return;
      }

      void loadProfileForSession(nextSession).catch(() => {
        void supabase.auth.signOut();
        setSession(null);
        setProfile(null);
      });
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, [loadProfileForSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading,
      profile,
      refreshProfile,
      session,
      signIn: async (email, password) => {
        if (!isSupabaseConfigured) {
          return {
            message: "Configure as variáveis públicas do Supabase antes de entrar.",
            ok: false
          };
        }

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error || !data.session) {
          return {
            message: "E-mail ou senha inválidos.",
            ok: false
          };
        }

        try {
          await loadProfileForSession(data.session);
        } catch {
          await supabase.auth.signOut();
          setSession(null);
          setProfile(null);

          return {
            message:
              "Login realizado, mas o perfil não pôde ser carregado. Aplique a migration de permissões e tente novamente.",
            ok: false
          };
        }

        setSession(data.session);

        return {
          message: "Sessão iniciada.",
          ok: true
        };
      },
      signOut: async () => {
        await supabase.auth.signOut();
        setSession(null);
        setProfile(null);
        queryClient.clear();
      }
    }),
    [isLoading, loadProfileForSession, profile, refreshProfile, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthSession() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthSession must be used inside AuthProvider.");
  }

  return context;
}
