import { Ban, CheckCircle2, RotateCcw, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { InlineNotice } from "@/components/ui/InlineNotice";
import { TextField } from "@/components/ui/TextField";
import type { ActionEntryWithType } from "@/features/actions/types";
import {
  useDeleteVoidedActionEntry,
  useRestoreActionEntry,
  useVoidActionEntry
} from "@/features/actions/hooks/useVoidActionEntry";
import { formatCurrencyCents } from "@/features/actions/utils/money";
import { formatSaoPauloDateTime } from "@/features/actions/utils/month";
import { colors } from "@/theme/colors";
import { textStyles } from "@/theme/text";

type EntryListProps = {
  allowVoid?: boolean;
  entries: ActionEntryWithType[];
};

export function EntryList({ allowVoid = false, entries }: EntryListProps) {
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);
  const [voidReasons, setVoidReasons] = useState<Record<string, string>>({});
  const [voidErrors, setVoidErrors] = useState<Record<string, string>>({});
  const deleteMutation = useDeleteVoidedActionEntry();
  const restoreMutation = useRestoreActionEntry();
  const voidMutation = useVoidActionEntry();
  const isMutating =
    voidMutation.isPending || restoreMutation.isPending || deleteMutation.isPending;

  if (entries.length === 0) {
    return <InlineNotice tone="empty" message="Nenhuma ação encontrada." />;
  }

  return (
    <View style={{ gap: 10 }}>
      {entries.map((entry) => {
        const isVoided = entry.status === "voided";
        const isDeleteCandidate = deleteCandidateId === entry.id;
        const reason = voidReasons[entry.id] ?? "";
        const validationError = voidErrors[entry.id];

        return (
          <View
            key={entry.id}
            style={{
              backgroundColor: colors.surface,
              borderColor: isVoided ? colors.danger : colors.border,
              borderRadius: 8,
              borderWidth: 1,
              gap: 10,
              padding: 14
            }}
          >
            <View style={{ flexDirection: "row", gap: 10, justifyContent: "space-between" }}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={textStyles.bodyStrong}>{entry.action_type_name}</Text>
                <Text style={textStyles.caption}>{formatSaoPauloDateTime(entry.occurred_at)}</Text>
              </View>
              <Text style={textStyles.bodyStrong}>
                {formatCurrencyCents(entry.unit_price_cents_snapshot)}
              </Text>
            </View>

            {entry.note ? <Text style={textStyles.body}>{entry.note}</Text> : null}

            <View style={{ alignItems: "center", flexDirection: "row", gap: 8 }}>
              {isVoided ? (
                <Ban color={colors.danger} size={16} />
              ) : (
                <CheckCircle2 color={colors.success} size={16} />
              )}
              <Text style={isVoided ? { color: colors.danger } : { color: colors.success }}>
                {isVoided ? "Anulada" : "Confirmada"}
              </Text>
            </View>

            {entry.void_reason ? (
              <InlineNotice tone="warning" message={`Motivo: ${entry.void_reason}`} />
            ) : null}

            {allowVoid && !isVoided ? (
              <View style={{ gap: 8 }}>
                <TextField
                  label="Motivo da anulação"
                  onChangeText={(text) => {
                    setVoidReasons((current) => ({
                      ...current,
                      [entry.id]: text
                    }));
                    setVoidErrors((current) => ({
                      ...current,
                      [entry.id]: ""
                    }));
                  }}
                  placeholder="Obrigatório para anular"
                  value={reason}
                />
                {validationError ? <InlineNotice tone="error" message={validationError} /> : null}
                {voidMutation.isError ? (
                  <InlineNotice
                    tone="error"
                    message="Não foi possível anular. A ação pode estar em um ciclo fechado."
                  />
                ) : null}
                <Button
                  disabled={isMutating}
                  kind="danger"
                  loading={voidMutation.isPending}
                  onPress={() => {
                    const trimmedReason = reason.trim();

                    if (trimmedReason.length < 3) {
                      setVoidErrors((current) => ({
                        ...current,
                        [entry.id]: "Informe um motivo com pelo menos 3 caracteres."
                      }));
                      return;
                    }

                    voidMutation.mutate(
                      {
                        id: entry.id,
                        reason: trimmedReason
                      },
                      {
                        onSuccess: () => {
                          setVoidReasons((current) => ({
                            ...current,
                            [entry.id]: ""
                          }));
                          setVoidErrors((current) => ({
                            ...current,
                            [entry.id]: ""
                          }));
                        }
                      }
                    );
                  }}
                  title="Anular ação"
                />
              </View>
            ) : null}

            {allowVoid && isVoided ? (
              <View style={{ gap: 8 }}>
                {restoreMutation.isError ? (
                  <InlineNotice
                    tone="error"
                    message="Não foi possível desanular. A ação pode estar em um ciclo fechado."
                  />
                ) : null}
                {deleteMutation.isError ? (
                  <InlineNotice
                    tone="error"
                    message="Não foi possível excluir. A ação pode estar em um ciclo fechado."
                  />
                ) : null}

                {isDeleteCandidate ? (
                  <View style={{ gap: 8 }}>
                    <InlineNotice
                      tone="warning"
                      message="A exclusão é permanente e não pode ser desfeita. Confirme somente se esta ação anulada não deve permanecer no histórico."
                    />
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                      <View style={{ flexGrow: 1 }}>
                        <Button
                          disabled={isMutating}
                          kind="secondary"
                          onPress={() => setDeleteCandidateId(null)}
                          title="Cancelar exclusão"
                        />
                      </View>
                      <View style={{ flexGrow: 1 }}>
                        <Button
                          disabled={isMutating}
                          icon={Trash2}
                          kind="danger"
                          loading={deleteMutation.isPending}
                          onPress={() => {
                            deleteMutation.mutate(entry.id, {
                              onSuccess: () => setDeleteCandidateId(null)
                            });
                          }}
                          title="Confirmar exclusão permanente"
                        />
                      </View>
                    </View>
                  </View>
                ) : (
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    <View style={{ flexGrow: 1 }}>
                      <Button
                        disabled={isMutating}
                        icon={RotateCcw}
                        kind="secondary"
                        loading={restoreMutation.isPending}
                        onPress={() => restoreMutation.mutate(entry.id)}
                        title="Desanular ação"
                      />
                    </View>
                    <View style={{ flexGrow: 1 }}>
                      <Button
                        disabled={isMutating}
                        icon={Trash2}
                        kind="danger"
                        onPress={() => setDeleteCandidateId(entry.id)}
                        title="Excluir definitivamente"
                      />
                    </View>
                  </View>
                )}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
