import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { ProtectedScreen } from "@/features/auth/components/ProtectedScreen";
import { ActionTypeManager } from "@/features/actions/components/ActionTypeManager";
import { textStyles } from "@/theme/text";

export default function SettingsRoute() {
  return (
    <ProtectedScreen>
      <View style={{ gap: 16 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={textStyles.eyebrow}>Configurações</Text>
            <Text style={textStyles.title}>Configurações do sistema</Text>
          </View>
          <Button icon={ArrowLeft} kind="ghost" onPress={() => router.back()} title="Voltar" />
        </View>

        <View style={{ gap: 8 }}>
          <Text style={textStyles.sectionTitle}>Tipos de ações</Text>
          <ActionTypeManager />
        </View>
      </View>
    </ProtectedScreen>
  );
}
