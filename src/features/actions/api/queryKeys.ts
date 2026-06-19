export const actionQueryKeys = {
  actionTypes: ["action-types"] as const,
  allActionTypes: ["action-types", "all"] as const,
  managerEntries: (startIso: string, endIso: string) =>
    ["action-entries", "manager", startIso, endIso] as const,
  ownCurrentMonthEntries: ["action-entries", "own", "current-month"] as const
};
