export const settlementQueryKeys = {
  cycle: (periodStart: string, periodEnd: string) =>
    ["settlement-cycle", periodStart, periodEnd] as const
};
