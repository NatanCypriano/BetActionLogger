import { supabase } from "@/lib/supabase";
import type { AuthProfile } from "@/features/auth/types";

export async function fetchOwnProfile(userId: string, email?: string): Promise<AuthProfile> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível carregar o perfil.");
  }

  if (data) {
    return data;
  }

  return createOwnProfile(userId, email);
}

async function createOwnProfile(userId: string, email?: string): Promise<AuthProfile> {
  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        display_name: email ?? "Usuário",
        id: userId,
        role: "operator"
      },
      {
        onConflict: "id"
      }
    )
    .select("id, display_name, role")
    .single();

  if (error) {
    throw new Error("Não foi possível criar o perfil.");
  }

  return data;
}
