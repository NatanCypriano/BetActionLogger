import { Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { textStyles } from "@/theme/text";

type NoticeTone = "empty" | "error" | "success" | "warning";

type InlineNoticeProps = {
  message: string;
  tone: NoticeTone;
};

const toneStyles: Record<
  NoticeTone,
  { backgroundColor: string; borderColor: string; color: string }
> = {
  empty: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    color: colors.textMuted
  },
  error: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.danger,
    color: colors.danger
  },
  success: {
    backgroundColor: colors.successSoft,
    borderColor: colors.success,
    color: colors.success
  },
  warning: {
    backgroundColor: colors.warningSoft,
    borderColor: colors.warning,
    color: colors.warning
  }
};

export function InlineNotice({ message, tone }: InlineNoticeProps) {
  const style = toneStyles[tone];

  return (
    <View
      style={{
        backgroundColor: style.backgroundColor,
        borderColor: style.borderColor,
        borderRadius: 8,
        borderWidth: 1,
        padding: 12
      }}
    >
      <Text style={[textStyles.body, { color: style.color }]}>{message}</Text>
    </View>
  );
}
