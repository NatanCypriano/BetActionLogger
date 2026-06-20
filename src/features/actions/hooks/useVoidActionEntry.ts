import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  deleteVoidedActionEntry,
  restoreActionEntry,
  voidActionEntry
} from "@/features/actions/api/actionEntriesApi";

export function useVoidActionEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => voidActionEntry(id, reason),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["action-entries"] });
    }
  });
}

export function useRestoreActionEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restoreActionEntry,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["action-entries"] });
    }
  });
}

export function useDeleteVoidedActionEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVoidedActionEntry,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["action-entries"] });
    }
  });
}
