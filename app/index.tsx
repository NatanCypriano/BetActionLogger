import { Redirect } from "expo-router";

import { LoadingState } from "@/components/ui/LoadingState";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";

export default function IndexRoute() {
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

  if (profile?.role === "manager") {
    return <Redirect href="/manager" />;
  }

  return <Redirect href="/operator" />;
}
