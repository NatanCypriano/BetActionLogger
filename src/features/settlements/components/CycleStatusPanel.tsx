import { CheckCircle2, LockKeyhole, RotateCcw, WalletCards } from "lucide-react-native";
import { useState } from "react";
import { Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { InlineNotice } from "@/components/ui/InlineNotice";
import { LoadingState } from "@/components/ui/LoadingState";
import { TextField } from "@/components/ui/TextField";
import {
  useCloseCycle,
  useMarkCyclePaid,
  useReopenCycle,
  useSettlementCycle
} from "@/features/settlements/hooks/useSettlementCycle";
import { formatCurrencyCents } from "@/features/actions/utils/money";
import { colors } from "@/theme/colors";
import { textStyles } from "@/theme/text";

type CycleStatusPanelProps = {
  periodEnd: string;
  periodStart: string;
  totalActions: number;
  totalCents: number;
};

export function CycleStatusPanel({
  periodEnd,
  periodStart,
  totalActions,
  totalCents
}: CycleStatusPanelProps) {
  const [paymentNote, setPaymentNote] = useState("");
  const [showReopenConfirmation, setShowReopenConfirmation] = useState(false);
  const cycleQuery = useSettlementCycle(periodStart, periodEnd);
  const closeMutation = useCloseCycle(periodStart, periodEnd);
  const paidMutation = useMarkCyclePaid(periodStart, periodEnd);
  const reopenMutation = useReopenCycle(periodStart, periodEnd);
  const cycle = cycleQuery.data;
  const isMutating = closeMutation.isPending || paidMutation.isPending || reopenMutation.isPending;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderRadius: 8,
        borderWidth: 1,
        gap: 12,
        padding: 16
      }}
    >
      <View style={{ alignItems: "center", flexDirection: "row", gap: 8 }}>
        <LockKeyhole color={colors.primary} size={18} />
        <Text style={textStyles.sectionTitle}>Ciclo</Text>
      </View>

      {cycleQuery.isLoading ? (
        <LoadingState compact label="Carregando ciclo..." />
      ) : cycleQuery.isError ? (
        <InlineNotice tone="error" message="Não foi possível carregar o ciclo." />
      ) : (
        <View style={{ gap: 10 }}>
          <Text style={textStyles.body}>
            Status: {cycle ? translateStatus(cycle.status) : "Aberto sem fechamento registrado"}
          </Text>
          <Text style={textStyles.caption}>
            Prévia atual: {totalActions} ações | {formatCurrencyCents(totalCents)}
          </Text>

          {cycle?.status === "closed" || cycle?.status === "paid" ? (
            <InlineNotice
              tone={cycle.status === "paid" ? "success" : "warning"}
              message={`Total fechado pelo banco: ${cycle.total_actions ?? 0} ações | ${formatCurrencyCents(
                cycle.total_cents ?? 0
              )}`}
            />
          ) : null}

          {cycle?.status !== "paid" ? (
            <View style={{ gap: 10 }}>
              {cycle?.status === "closed" ? (
                <TextField
                  label="Nota de pagamento"
                  onChangeText={setPaymentNote}
                  placeholder="Opcional"
                  value={paymentNote}
                />
              ) : null}

              <Button
                disabled={isMutating}
                icon={cycle?.status === "closed" ? WalletCards : CheckCircle2}
                kind={cycle?.status === "closed" ? "primary" : "secondary"}
                loading={closeMutation.isPending || paidMutation.isPending}
                onPress={() => {
                  if (cycle?.status === "closed") {
                    const trimmedNote = paymentNote.trim();
                    const paymentPayload = trimmedNote
                      ? { id: cycle.id, paymentNote: trimmedNote }
                      : { id: cycle.id };

                    void paidMutation.mutateAsync(paymentPayload);
                    return;
                  }

                  void closeMutation.mutateAsync();
                }}
                title={cycle?.status === "closed" ? "Marcar como pago" : "Fechar ciclo"}
              />

              {cycle?.status === "closed" ? (
                showReopenConfirmation ? (
                  <View style={{ gap: 8 }}>
                    <InlineNotice
                      tone="warning"
                      message="Ao reabrir, o total fechado será descartado e as ações deste período poderão ser alteradas novamente."
                    />
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                      <View style={{ flexGrow: 1 }}>
                        <Button
                          disabled={isMutating}
                          kind="secondary"
                          onPress={() => setShowReopenConfirmation(false)}
                          title="Cancelar reabertura"
                        />
                      </View>
                      <View style={{ flexGrow: 1 }}>
                        <Button
                          disabled={isMutating}
                          icon={RotateCcw}
                          kind="danger"
                          loading={reopenMutation.isPending}
                          onPress={() => {
                            reopenMutation.mutate(cycle.id, {
                              onSuccess: () => setShowReopenConfirmation(false)
                            });
                          }}
                          title="Confirmar reabertura"
                        />
                      </View>
                    </View>
                  </View>
                ) : (
                  <Button
                    disabled={isMutating}
                    icon={RotateCcw}
                    kind="secondary"
                    onPress={() => setShowReopenConfirmation(true)}
                    title="Reabrir ciclo"
                  />
                )
              ) : null}
            </View>
          ) : null}

          {closeMutation.isError || paidMutation.isError || reopenMutation.isError ? (
            <InlineNotice tone="error" message="Não foi possível alterar o ciclo." />
          ) : null}
        </View>
      )}
    </View>
  );
}

function translateStatus(status: "closed" | "open" | "paid"): string {
  const labels = {
    closed: "Fechado",
    open: "Aberto",
    paid: "Pago"
  };

  return labels[status];
}
