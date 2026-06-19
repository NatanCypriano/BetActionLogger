import { Link } from "expo-router";
import { CalendarDays, History, LogOut, Settings2 } from "lucide-react-native";
import { useState } from "react";
import { Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { InlineNotice } from "@/components/ui/InlineNotice";
import { LoadingState } from "@/components/ui/LoadingState";
import { ProtectedScreen } from "@/features/auth/components/ProtectedScreen";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import { EntryList } from "@/features/actions/components/EntryList";
import { useManagerMonthlyEntries } from "@/features/actions/hooks/useManagerMonthlyEntries";
import { formatCurrencyCents } from "@/features/actions/utils/money";
import {
  addMonths,
  formatMonthLabel,
  getSaoPauloMonthBounds
} from "@/features/actions/utils/month";
import { calculateEntryTotals, groupEntriesByType } from "@/features/actions/utils/totals";
import { CycleStatusPanel } from "@/features/settlements/components/CycleStatusPanel";
import { colors } from "@/theme/colors";
import { textStyles } from "@/theme/text";

export default function ManagerDashboardRoute() {
  const { signOut } = useAuthSession();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });
  const bounds = getSaoPauloMonthBounds(selectedMonth.year, selectedMonth.month);
  const entriesQuery = useManagerMonthlyEntries(bounds.startIso, bounds.endIso);
  const entries = entriesQuery.data ?? [];
  const totals = calculateEntryTotals(entries);
  const groups = groupEntriesByType(entries);

  return (
    <ProtectedScreen role="manager">
      <View style={{ gap: 18 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={textStyles.eyebrow}>Gestor</Text>
            <Text style={textStyles.title}>Dashboard mensal</Text>
          </View>
          <View style={{ gap: 8 }}>
            <Link asChild href={"/settings" as never}>
              <Button icon={Settings2} kind="ghost" title="Configurações" />
            </Link>
            <Button icon={LogOut} kind="ghost" onPress={() => void signOut()} title="Sair" />
          </View>
        </View>

        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            justifyContent: "space-between"
          }}
        >
          <Button
            kind="secondary"
            onPress={() => setSelectedMonth((value) => addMonths(value, -1))}
            title="Anterior"
          />
          <View style={{ alignItems: "center", flexDirection: "row", gap: 8 }}>
            <CalendarDays color={colors.primary} size={18} />
            <Text style={textStyles.sectionTitle}>{formatMonthLabel(selectedMonth)}</Text>
          </View>
          <Button
            kind="secondary"
            onPress={() => setSelectedMonth((value) => addMonths(value, 1))}
            title="Próximo"
          />
        </View>

        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: 8,
            borderWidth: 1,
            flexDirection: "row",
            gap: 12,
            padding: 16
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={textStyles.metric}>{totals.count}</Text>
            <Text style={textStyles.caption}>ações confirmadas</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={textStyles.metric}>{formatCurrencyCents(totals.totalCents)}</Text>
            <Text style={textStyles.caption}>total calculado</Text>
          </View>
        </View>

        <CycleStatusPanel
          periodEnd={bounds.periodEndDate}
          periodStart={bounds.periodStartDate}
          totalActions={totals.count}
          totalCents={totals.totalCents}
        />

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          <View style={{ flexGrow: 1 }}>
            <Link asChild href={"/manager/history" as never}>
              <Button icon={History} kind="secondary" title="Ver histórico do mês" />
            </Link>
          </View>
          <View style={{ flexGrow: 1 }}>
            <Link asChild href={"/settings" as never}>
              <Button icon={Settings2} kind="secondary" title="Configurações do sistema" />
            </Link>
          </View>
        </View>

        {entriesQuery.isLoading ? (
          <LoadingState label="Carregando ações..." />
        ) : entriesQuery.isError ? (
          <InlineNotice tone="error" message="Não foi possível carregar as ações." />
        ) : (
          <View style={{ gap: 16 }}>
            <View style={{ gap: 8 }}>
              <Text style={textStyles.sectionTitle}>Quantidade por tipo</Text>
              {groups.length === 0 ? (
                <InlineNotice tone="empty" message="Nenhuma ação confirmada neste mês." />
              ) : (
                groups.map((group) => (
                  <View
                    key={group.actionTypeId}
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderRadius: 8,
                      borderWidth: 1,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      padding: 12
                    }}
                  >
                    <Text style={textStyles.bodyStrong}>{group.actionTypeName}</Text>
                    <Text style={textStyles.body}>
                      {group.count} | {formatCurrencyCents(group.totalCents)}
                    </Text>
                  </View>
                ))
              )}
            </View>

            <View style={{ gap: 8 }}>
              <Text style={textStyles.sectionTitle}>Lista cronológica</Text>
              <EntryList entries={entries} />
            </View>
          </View>
        )}
      </View>
    </ProtectedScreen>
  );
}
