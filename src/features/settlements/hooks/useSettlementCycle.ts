import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  closeCycle,
  fetchCycleByPeriod,
  markCycleAsPaid
} from "@/features/settlements/api/settlementsApi";
import { settlementQueryKeys } from "@/features/settlements/api/queryKeys";
import type { SettlementCycle } from "@/features/settlements/types";

export function useSettlementCycle(periodStart: string, periodEnd: string) {
  return useQuery<SettlementCycle | null>({
    queryFn: () => fetchCycleByPeriod(periodStart, periodEnd),
    queryKey: settlementQueryKeys.cycle(periodStart, periodEnd)
  });
}

export function useCloseCycle(periodStart: string, periodEnd: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => closeCycle(periodStart, periodEnd),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: settlementQueryKeys.cycle(periodStart, periodEnd)
      });
    }
  });
}

export function useMarkCyclePaid(periodStart: string, periodEnd: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, paymentNote }: { id: string; paymentNote?: string }) =>
      markCycleAsPaid(id, paymentNote),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: settlementQueryKeys.cycle(periodStart, periodEnd)
      });
    }
  });
}
