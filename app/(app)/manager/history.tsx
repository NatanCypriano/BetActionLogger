import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { InlineNotice } from "@/components/ui/InlineNotice";
import { LoadingState } from "@/components/ui/LoadingState";
import { ProtectedScreen } from "@/features/auth/components/ProtectedScreen";
import { EntryList } from "@/features/actions/components/EntryList";
import { useManagerMonthlyEntries } from "@/features/actions/hooks/useManagerMonthlyEntries";
import { getSaoPauloMonthBounds } from "@/features/actions/utils/month";
import { textStyles } from "@/theme/text";

export default function ManagerHistoryRoute() {
  const now = new Date();
  const bounds = getSaoPauloMonthBounds(now.getFullYear(), now.getMonth() + 1);
  const entriesQuery = useManagerMonthlyEntries(bounds.startIso, bounds.endIso);

  return (
    <ProtectedScreen>
      <View style={{ gap: 16 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={textStyles.eyebrow}>Gestor</Text>
            <Text style={textStyles.title}>Histórico do mês</Text>
          </View>
          <Button icon={ArrowLeft} kind="ghost" onPress={() => router.back()} title="Voltar" />
        </View>

        {entriesQuery.isLoading ? (
          <LoadingState label="Carregando histórico..." />
        ) : entriesQuery.isError ? (
          <InlineNotice tone="error" message="Não foi possível carregar o histórico." />
        ) : (
          <EntryList entries={entriesQuery.data ?? []} allowVoid />
        )}
      </View>
    </ProtectedScreen>
  );
}
