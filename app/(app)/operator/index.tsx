import { Link } from "expo-router";
import { Clock3, LogOut, PlusCircle, Settings2 } from "lucide-react-native";
import { Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { InlineNotice } from "@/components/ui/InlineNotice";
import { LoadingState } from "@/components/ui/LoadingState";
import { ProtectedScreen } from "@/features/auth/components/ProtectedScreen";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import { EntryList } from "@/features/actions/components/EntryList";
import { useCurrentMonthEntries } from "@/features/actions/hooks/useCurrentMonthEntries";
import { formatCurrencyCents } from "@/features/actions/utils/money";
import { calculateEntryTotals } from "@/features/actions/utils/totals";
import { colors } from "@/theme/colors";
import { textStyles } from "@/theme/text";

export default function OperatorHomeRoute() {
  const { profile, signOut } = useAuthSession();
  const entriesQuery = useCurrentMonthEntries();
  const totals = entriesQuery.data ? calculateEntryTotals(entriesQuery.data) : null;

  return (
    <ProtectedScreen role="operator">
      <View style={{ gap: 20 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={textStyles.eyebrow}>Operador</Text>
            <Text style={textStyles.title}>{profile?.display_name ?? "Minhas ações"}</Text>
          </View>
          <View style={{ gap: 8 }}>
            <Link asChild href={"/settings" as never}>
              <Button icon={Settings2} kind="ghost" title="Configurações" />
            </Link>
            <Button icon={LogOut} kind="ghost" onPress={() => void signOut()} title="Sair" />
          </View>
        </View>

        <Link asChild href="/operator/new-action">
          <Button icon={PlusCircle} kind="cta" title="Registrar ação" />
        </Link>

        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: 8,
            borderWidth: 1,
            padding: 16,
            gap: 8
          }}
        >
          <View style={{ alignItems: "center", flexDirection: "row", gap: 8 }}>
            <Clock3 color={colors.primary} size={18} />
            <Text style={textStyles.sectionTitle}>Mês atual</Text>
          </View>
          {entriesQuery.isLoading ? (
            <LoadingState compact label="Carregando ações..." />
          ) : entriesQuery.isError ? (
            <InlineNotice tone="error" message="Não foi possível carregar o histórico." />
          ) : totals ? (
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={textStyles.metric}>{totals.count}</Text>
                <Text style={textStyles.caption}>ações confirmadas</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={textStyles.metric}>{formatCurrencyCents(totals.totalCents)}</Text>
                <Text style={textStyles.caption}>total calculado</Text>
              </View>
            </View>
          ) : null}
        </View>

        <View style={{ gap: 10 }}>
          <Text style={textStyles.sectionTitle}>Últimos registros</Text>
          <EntryList entries={entriesQuery.data?.slice(0, 5) ?? []} />
          <Link asChild href="/operator/history">
            <Button kind="secondary" title="Ver histórico do mês" />
          </Link>
        </View>
      </View>
    </ProtectedScreen>
  );
}
