export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type TableDefinition<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: never[];
};

export type AppRole = "operator" | "manager";
export type ActionStatus = "confirmed" | "voided";
export type SettlementStatus = "open" | "closed" | "paid";

export type ProfileRow = {
  created_at: string;
  display_name: string | null;
  id: string;
  role: AppRole;
  updated_at: string;
};

export type ActionTypeRow = {
  active: boolean;
  created_at: string;
  description: string | null;
  has_note_field: boolean;
  id: string;
  name: string;
  unit_price_cents: number;
  updated_at: string;
};

export type ActionEntryRow = {
  action_type_id: string;
  actor_id: string;
  created_at: string;
  id: string;
  note: string | null;
  occurred_at: string;
  status: ActionStatus;
  unit_price_cents_snapshot: number;
  updated_at: string;
  void_reason: string | null;
  voided_at: string | null;
  voided_by: string | null;
};

export type SettlementCycleRow = {
  closed_at: string | null;
  closed_by: string | null;
  created_at: string;
  id: string;
  paid_at: string | null;
  payment_note: string | null;
  period_end: string;
  period_start: string;
  status: SettlementStatus;
  total_actions: number | null;
  total_cents: number | null;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: TableDefinition<
        ProfileRow,
        {
          display_name?: string | null;
          id: string;
          role?: AppRole;
        },
        {
          display_name?: string | null;
          role?: AppRole;
        }
      >;
      action_types: TableDefinition<
        ActionTypeRow,
        {
          active?: boolean;
          description?: string | null;
          has_note_field?: boolean;
          id?: string;
          name: string;
          unit_price_cents: number;
        },
        {
          active?: boolean;
          description?: string | null;
          has_note_field?: boolean;
          name?: string;
          unit_price_cents?: number;
        }
      >;
      action_entries: TableDefinition<
        ActionEntryRow,
        {
          action_type_id: string;
          actor_id?: string;
          id?: string;
          note?: string | null;
          occurred_at: string;
          status?: ActionStatus;
          unit_price_cents_snapshot?: number;
          void_reason?: string | null;
        },
        {
          status?: ActionStatus;
          void_reason?: string | null;
        }
      >;
      settlement_cycles: TableDefinition<
        SettlementCycleRow,
        {
          id?: string;
          payment_note?: string | null;
          period_end: string;
          period_start: string;
          status?: SettlementStatus;
        },
        {
          payment_note?: string | null;
          status?: SettlementStatus;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      action_status: ActionStatus;
      app_role: AppRole;
      settlement_status: SettlementStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
