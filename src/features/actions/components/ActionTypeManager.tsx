import { zodResolver } from "@hookform/resolvers/zod";
import { Check, CheckCircle2, PlusCircle, RotateCcw, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { InlineNotice } from "@/components/ui/InlineNotice";
import { LoadingState } from "@/components/ui/LoadingState";
import { TextField } from "@/components/ui/TextField";
import {
  actionTypeSchema,
  type ActionTypeFormValues
} from "@/features/actions/schemas/actionTypeSchema";
import {
  useAllActionTypes,
  useCreateActionType,
  useDeleteActionType,
  useSetActionTypeActive,
  useUpdateActionType
} from "@/features/actions/hooks/useActionTypes";
import type { ActionType } from "@/features/actions/types";
import { formatCurrencyCents } from "@/features/actions/utils/money";
import { colors } from "@/theme/colors";
import { textStyles } from "@/theme/text";

export function ActionTypeManager() {
  const [editing, setEditing] = useState<ActionType | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<ActionType | null>(null);
  const actionTypesQuery = useAllActionTypes();
  const createMutation = useCreateActionType();
  const updateMutation = useUpdateActionType();
  const activeMutation = useSetActionTypeActive();
  const deleteMutation = useDeleteActionType();
  const actionTypes: ActionType[] = actionTypesQuery.data ?? [];
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset
  } = useForm<ActionTypeFormValues>({
    resolver: zodResolver(actionTypeSchema),
    defaultValues: {
      description: "",
      hasNoteField: true,
      name: "",
      unitPriceCents: 0
    }
  });

  const submit = handleSubmit(async (values) => {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, values });
    } else {
      await createMutation.mutateAsync(values);
    }

    setEditing(null);
    reset({ description: "", hasNoteField: true, name: "", unitPriceCents: 0 });
  });

  const startEditing = (actionType: ActionType) => {
    setDeleteCandidate(null);
    setEditing(actionType);
    reset({
      description: actionType.description ?? "",
      hasNoteField: actionType.has_note_field,
      name: actionType.name,
      unitPriceCents: actionType.unit_price_cents
    });
  };

  const clearForm = () => {
    setEditing(null);
    reset({ description: "", hasNoteField: true, name: "", unitPriceCents: 0 });
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isMutating = isSaving || activeMutation.isPending || deleteMutation.isPending;

  return (
    <View style={{ gap: 18 }}>
      <View
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: 8,
          borderWidth: 1,
          gap: 12,
          padding: 14
        }}
      >
        <Controller
          control={control}
          name="name"
          render={({ field: { onBlur, onChange, value } }) => (
            <TextField
              error={errors.name?.message}
              label="Nome"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="Depósito"
              value={value}
            />
          )}
        />
        <Controller
          control={control}
          name="unitPriceCents"
          render={({ field: { onBlur, onChange, value } }) => (
            <TextField
              error={errors.unitPriceCents?.message}
              inputMode="numeric"
              label="Valor em centavos"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="500"
              value={String(value)}
            />
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field: { onBlur, onChange, value } }) => (
            <TextField
              error={errors.description?.message}
              label="Descrição"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="Opcional"
              value={value}
            />
          )}
        />

        <Controller
          control={control}
          name="hasNoteField"
          render={({ field: { onChange, value } }) => {
            const isChecked = Boolean(value);

            return (
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isChecked }}
                onPress={() => onChange(!isChecked)}
                style={({ pressed }) => ({
                  alignItems: "center",
                  borderColor: colors.border,
                  borderRadius: 8,
                  borderWidth: 1,
                  flexDirection: "row",
                  gap: 10,
                  minHeight: 48,
                  opacity: pressed ? 0.82 : 1,
                  padding: 12
                })}
              >
                <View
                  style={{
                    alignItems: "center",
                    backgroundColor: isChecked ? colors.primary : colors.surface,
                    borderColor: isChecked ? colors.primary : colors.borderStrong,
                    borderRadius: 4,
                    borderWidth: 1,
                    height: 22,
                    justifyContent: "center",
                    width: 22
                  }}
                >
                  {isChecked ? <Check color={colors.white} size={16} strokeWidth={3} /> : null}
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={textStyles.bodyStrong}>Exibir campo de observação</Text>
                  <Text style={textStyles.caption}>A observação continua opcional.</Text>
                </View>
              </Pressable>
            );
          }}
        />

        {createMutation.isError || updateMutation.isError ? (
          <InlineNotice tone="error" message="Não foi possível salvar o tipo de ação." />
        ) : null}

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {editing ? (
            <View style={{ flexGrow: 1 }}>
              <Button icon={RotateCcw} kind="secondary" onPress={clearForm} title="Limpar" />
            </View>
          ) : null}
          <View style={{ flexGrow: 1 }}>
            <Button
              disabled={isSaving}
              icon={editing ? CheckCircle2 : PlusCircle}
              loading={isSaving}
              onPress={submit}
              title={editing ? "Atualizar" : "Criar tipo"}
            />
          </View>
        </View>
      </View>

      {deleteMutation.isError ? (
        <InlineNotice
          tone="error"
          message="Não foi possível excluir. Tipos usados em ações registradas devem ser desativados."
        />
      ) : null}

      {actionTypesQuery.isLoading ? (
        <LoadingState label="Carregando tipos..." />
      ) : actionTypesQuery.isError ? (
        <InlineNotice tone="error" message="Não foi possível carregar os tipos." />
      ) : actionTypes.length === 0 ? (
        <InlineNotice tone="empty" message="Nenhum tipo cadastrado." />
      ) : (
        <View style={{ gap: 10 }}>
          {actionTypes.map((actionType) => {
            const isDeleteCandidate = deleteCandidate?.id === actionType.id;

            return (
              <View
                key={actionType.id}
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: 8,
                  borderWidth: 1,
                  gap: 10,
                  padding: 14
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={textStyles.bodyStrong}>{actionType.name}</Text>
                    <Text style={textStyles.caption}>
                      {formatCurrencyCents(actionType.unit_price_cents)}
                    </Text>
                  </View>
                  <Text
                    style={
                      actionType.active ? { color: colors.success } : { color: colors.textMuted }
                    }
                  >
                    {actionType.active ? "Ativo" : "Inativo"}
                  </Text>
                </View>
                {actionType.description ? (
                  <Text style={textStyles.body}>{actionType.description}</Text>
                ) : null}

                <Text style={textStyles.caption}>
                  Observação: {actionType.has_note_field ? "exibida" : "não exibida"}
                </Text>

                {isDeleteCandidate ? (
                  <InlineNotice
                    tone="warning"
                    message="Confirme a exclusão. Se este tipo já foi usado, o banco irá bloquear para preservar o histórico."
                  />
                ) : null}

                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  <View style={{ flexGrow: 1 }}>
                    <Button
                      disabled={isMutating}
                      kind="secondary"
                      onPress={() => startEditing(actionType)}
                      title="Editar"
                    />
                  </View>
                  <View style={{ flexGrow: 1 }}>
                    <Button
                      disabled={isMutating}
                      kind={actionType.active ? "danger" : "secondary"}
                      onPress={() =>
                        void activeMutation.mutateAsync({
                          active: !actionType.active,
                          id: actionType.id
                        })
                      }
                      title={actionType.active ? "Desativar" : "Reativar"}
                    />
                  </View>
                  <View style={{ flexGrow: 1 }}>
                    <Button
                      disabled={isMutating}
                      icon={Trash2}
                      kind="danger"
                      loading={deleteMutation.isPending && isDeleteCandidate}
                      onPress={() => {
                        if (!isDeleteCandidate) {
                          setDeleteCandidate(actionType);
                          return;
                        }

                        void deleteMutation.mutateAsync(actionType.id).then(() => {
                          if (deleteCandidate?.id === actionType.id) {
                            setDeleteCandidate(null);
                          }
                        });
                      }}
                      title={isDeleteCandidate ? "Confirmar exclusão" : "Excluir"}
                    />
                  </View>
                  {isDeleteCandidate ? (
                    <View style={{ flexGrow: 1 }}>
                      <Button
                        disabled={isMutating}
                        kind="secondary"
                        onPress={() => setDeleteCandidate(null)}
                        title="Cancelar exclusão"
                      />
                    </View>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
