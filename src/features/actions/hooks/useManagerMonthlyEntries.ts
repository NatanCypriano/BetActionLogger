import { useQuery } from "@tanstack/react-query";

import { fetchManagerEntriesByRange } from "@/features/actions/api/actionEntriesApi";
import { actionQueryKeys } from "@/features/actions/api/queryKeys";
import type { ActionEntryWithType } from "@/features/actions/types";

export function useManagerMonthlyEntries(startIso: string, endIso: string) {
  return useQuery<ActionEntryWithType[]>({
    queryFn: () => fetchManagerEntriesByRange(startIso, endIso),
    queryKey: actionQueryKeys.managerEntries(startIso, endIso)
  });
}
