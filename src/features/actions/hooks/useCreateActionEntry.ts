import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createActionEntry } from "@/features/actions/api/actionEntriesApi";
import { actionQueryKeys } from "@/features/actions/api/queryKeys";

export function useCreateActionEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createActionEntry,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: actionQueryKeys.ownCurrentMonthEntries });
    }
  });
}
