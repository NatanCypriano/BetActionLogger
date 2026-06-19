import { ActivityIndicator, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { textStyles } from "@/theme/text";

type LoadingStateProps = {
  compact?: boolean;
  label: string;
};

export function LoadingState({ compact = false, label }: LoadingStateProps) {
  return (
    <View
      style={{
        alignItems: "center",
        gap: 10,
        justifyContent: "center",
        minHeight: compact ? 64 : 180
      }}
    >
      <ActivityIndicator color={colors.primary} />
      <Text style={textStyles.caption}>{label}</Text>
    </View>
  );
}
