import { useMutation, useQueryClient } from "@tanstack/react-query";

import { voidActionEntry } from "@/features/actions/api/actionEntriesApi";

export function useVoidActionEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => voidActionEntry(id, reason),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["action-entries"] });
    }
  });
}
