import type { AppRole, ProfileRow } from "@/types/database";

export type AuthProfile = Pick<ProfileRow, "display_name" | "id" | "role">;

export type RequiredRole = AppRole;
