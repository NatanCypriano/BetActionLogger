import { useQuery } from "@tanstack/react-query";

import { fetchOwnCurrentMonthEntries } from "@/features/actions/api/actionEntriesApi";
import { actionQueryKeys } from "@/features/actions/api/queryKeys";
import type { ActionEntryWithType } from "@/features/actions/types";

export function useCurrentMonthEntries() {
  return useQuery<ActionEntryWithType[]>({
    queryFn: fetchOwnCurrentMonthEntries,
    queryKey: actionQueryKeys.ownCurrentMonthEntries
  });
}
