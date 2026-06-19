import type { LucideIcon } from "lucide-react-native";
import { StyleSheet, Text, TextInput, View } from "react-native";
import type { TextInputProps } from "react-native";

import { colors } from "@/theme/colors";
import { textStyles } from "@/theme/text";

type TextFieldProps = TextInputProps & {
  error?: string | undefined;
  icon?: LucideIcon | undefined;
  label: string;
};

export function TextField({ error, icon: Icon, label, style, ...props }: TextFieldProps) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={textStyles.bodyStrong}>{label}</Text>
      <View style={[styles.inputShell, error ? styles.inputShellError : null]}>
        {Icon ? <Icon color={colors.textMuted} size={18} strokeWidth={2.2} /> : null}
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[styles.input, style]}
          {...props}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  inputShell: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 12
  },
  inputShellError: {
    borderColor: colors.danger
  },
  input: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    minHeight: 44,
    paddingVertical: 8
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 18
  }
});
