import { Redirect } from "expo-router";
import type { ReactNode } from "react";

import { LoadingState } from "@/components/ui/LoadingState";
import { Screen } from "@/components/ui/Screen";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";

type ProtectedScreenProps = {
  children: ReactNode;
  role?: "manager" | "operator";
};

export function ProtectedScreen({ children }: ProtectedScreenProps) {
  const { isLoading, profile, session } = useAuthSession();

  if (isLoading) {
    return <LoadingState label="Carregando sessão..." />;
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  if (!profile) {
    return <LoadingState label="Carregando perfil..." />;
  }

  return <Screen>{children}</Screen>;
}
