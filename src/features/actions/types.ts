import type { ActionEntryRow, ActionStatus, ActionTypeRow } from "@/types/database";

export type ActionType = ActionTypeRow;

export type ActionEntryWithType = Pick<
  ActionEntryRow,
  | "action_type_id"
  | "actor_id"
  | "id"
  | "note"
  | "occurred_at"
  | "status"
  | "unit_price_cents_snapshot"
  | "void_reason"
  | "voided_at"
> & {
  action_type_name: string;
};

export type ActionEntryStatus = ActionStatus;

export type EntryGroup = {
  actionTypeId: string;
  actionTypeName: string;
  count: number;
  totalCents: number;
};
