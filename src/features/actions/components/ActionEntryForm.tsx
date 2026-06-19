import { zodResolver } from "@hookform/resolvers/zod";
import { Banknote, CalendarClock, CheckCircle2, X } from "lucide-react-native";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { InlineNotice } from "@/components/ui/InlineNotice";
import { LoadingState } from "@/components/ui/LoadingState";
import { TextField } from "@/components/ui/TextField";
import {
  actionEntrySchema,
  type ActionEntryFormValues
} from "@/features/actions/schemas/actionEntrySchema";
import { useActiveActionTypes } from "@/features/actions/hooks/useActionTypes";
import { useCreateActionEntry } from "@/features/actions/hooks/useCreateActionEntry";
import type { ActionType } from "@/features/actions/types";
import { formatCurrencyCents } from "@/features/actions/utils/money";
import { formatSaoPauloDateTime } from "@/features/actions/utils/month";
import { colors } from "@/theme/colors";
import { textStyles } from "@/theme/text";

type ActionOption = ActionType & {
  displayName: string;
  isOther: boolean;
};

type ActionSlot = {
  aliases: string[];
  displayName: string;
  isOther: boolean;
};

const predefinedActionSlots: ActionSlot[] = [
  {
    aliases: ["verificacao"],
    displayName: "Verificação",
    isOther: false
  },
  {
    aliases: ["deposito"],
    displayName: "Depósito",
    isOther: false
  },
  {
    aliases: ["saque"],
    displayName: "Saque",
    isOther: false
  },
  {
    aliases: ["outro", "outra", "outras", "outra acao"],
    displayName: "Outras",
    isOther: true
  }
];

type ActionEntryFormProps = {
  onCancel: () => void;
  onSuccess: () => void;
};

export function ActionEntryForm({ onCancel, onSuccess }: ActionEntryFormProps) {
  const actionTypesQuery = useActiveActionTypes();
  const createMutation = useCreateActionEntry();
  const {
    control,
    formState: { errors },
    handleSubmit,
    setValue,
    watch
  } = useForm<ActionEntryFormValues>({
    resolver: zodResolver(actionEntrySchema),
    defaultValues: {
      actionTypeId: "",
      note: "",
      occurredAt: new Date()
    }
  });
  const selectedActionTypeId = watch("actionTypeId");
  const actionTypes = getPredefinedActionTypes(actionTypesQuery.data ?? []);
  const selectedActionType = actionTypes.find((item) => item.id === selectedActionTypeId);
  const isOtherSelected = selectedActionType?.isOther === true;
  const occurredAt = watch("occurredAt");

  const submit = handleSubmit(async (values) => {
    await createMutation.mutateAsync({
      ...values,
      note: isOtherSelected ? values.note : undefined
    });
    onSuccess();
  });

  return (
    <View style={{ gap: 18 }}>
      <View style={{ gap: 4 }}>
        <Text style={textStyles.eyebrow}>Operador</Text>
        <Text style={textStyles.title}>Registrar ação</Text>
      </View>

      {actionTypesQuery.isLoading ? (
        <LoadingState label="Carregando ações..." />
      ) : actionTypesQuery.isError ? (
        <InlineNotice tone="error" message="Não foi possível carregar as ações." />
      ) : actionTypes.length === 0 ? (
        <InlineNotice
          tone="empty"
          message="Nenhuma ação pré-definida está ativa. Rode a migration de ações padrão."
        />
      ) : (
        <View style={{ gap: 14 }}>
          <View style={{ gap: 8 }}>
            <Text style={textStyles.sectionTitle}>Ação</Text>
            {actionTypes.map((actionType) => {
              const isSelected = selectedActionTypeId === actionType.id;

              return (
                <Button
                  key={actionType.id}
                  icon={isSelected ? CheckCircle2 : Banknote}
                  kind={isSelected ? "primary" : "secondary"}
                  onPress={() => {
                    setValue("actionTypeId", actionType.id, { shouldValidate: true });

                    if (!actionType.isOther) {
                      setValue("note", "");
                    }
                  }}
                  title={`${actionType.displayName} | ${formatCurrencyCents(
                    actionType.unit_price_cents
                  )}`}
                />
              );
            })}
            {errors.actionTypeId?.message ? (
              <Text style={{ color: colors.danger }}>{errors.actionTypeId.message}</Text>
            ) : null}
          </View>

          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: 8,
              borderWidth: 1,
              gap: 8,
              padding: 14
            }}
          >
            <View style={{ alignItems: "center", flexDirection: "row", gap: 8 }}>
              <CalendarClock color={colors.primary} size={18} />
              <Text style={textStyles.bodyStrong}>
                {formatSaoPauloDateTime(occurredAt.toISOString())}
              </Text>
            </View>
            <Button
              kind="secondary"
              onPress={() => setValue("occurredAt", new Date(), { shouldValidate: true })}
              title="Usar horário atual"
            />
          </View>

          {isOtherSelected ? (
            <Controller
              control={control}
              name="note"
              render={({ field: { onBlur, onChange, value } }) => (
                <TextField
                  error={errors.note?.message}
                  label="Observação"
                  multiline
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Opcional"
                  value={value}
                />
              )}
            />
          ) : null}

          {selectedActionType ? (
            <InlineNotice
              tone="success"
              message={`Valor unitário: ${formatCurrencyCents(selectedActionType.unit_price_cents)}`}
            />
          ) : null}

          {createMutation.isError ? (
            <InlineNotice tone="error" message="Não foi possível registrar a ação." />
          ) : null}

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            <View style={{ flexGrow: 1 }}>
              <Button
                disabled={createMutation.isPending}
                icon={X}
                kind="secondary"
                onPress={onCancel}
                title="Cancelar"
              />
            </View>
            <View style={{ flexGrow: 1 }}>
              <Button
                disabled={createMutation.isPending}
                icon={CheckCircle2}
                loading={createMutation.isPending}
                onPress={submit}
                title="Confirmar"
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

function getPredefinedActionTypes(actionTypes: ActionType[]): ActionOption[] {
  return predefinedActionSlots
    .map<ActionOption | null>((slot) => {
      const actionType = actionTypes.find((item) =>
        slot.aliases.includes(normalizeActionName(item.name))
      );

      if (!actionType) {
        return null;
      }

      return {
        ...actionType,
        displayName: slot.displayName,
        isOther: slot.isOther
      };
    })
    .filter((actionType): actionType is ActionOption => Boolean(actionType));
}

function normalizeActionName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
