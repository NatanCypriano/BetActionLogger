import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react-native";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import type { GestureResponderEvent, PressableProps } from "react-native";

import { colors } from "@/theme/colors";

type ButtonKind = "primary" | "secondary" | "ghost" | "danger" | "cta";

type ButtonProps = Omit<PressableProps, "children"> & {
  icon?: LucideIcon | undefined;
  kind?: ButtonKind;
  loading?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  title: string;
};

const kindStyles: Record<
  ButtonKind,
  { backgroundColor: string; borderColor: string; color: string }
> = {
  cta: {
    backgroundColor: colors.cta,
    borderColor: colors.cta,
    color: colors.white
  },
  danger: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
    color: colors.white
  },
  ghost: {
    backgroundColor: "transparent",
    borderColor: colors.border,
    color: colors.text
  },
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    color: colors.white
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    color: colors.text
  }
};

export function Button({
  disabled,
  icon: Icon,
  kind = "primary",
  loading = false,
  onPress,
  title,
  ...props
}: ButtonProps) {
  const base = kindStyles[kind];
  const isDisabled = disabled || loading;
  const isCta = kind === "cta";

  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isCta ? styles.ctaButton : null,
        {
          backgroundColor: base.backgroundColor,
          borderColor: base.borderColor,
          opacity: isDisabled ? 0.55 : pressed ? 0.86 : 1
        }
      ]}
    >
      {loading ? (
        <ActivityIndicator color={base.color} size="small" />
      ) : (
        renderIcon(Icon, base.color, isCta)
      )}
      <Text
        style={[styles.title, isCta ? styles.ctaTitle : null, { color: base.color }]}
        numberOfLines={2}
      >
        {title}
      </Text>
    </Pressable>
  );
}

function renderIcon(Icon: LucideIcon | undefined, color: string, isCta: boolean): ReactNode {
  if (!Icon) {
    return null;
  }

  return <Icon color={color} size={isCta ? 22 : 18} strokeWidth={2.4} />;
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  ctaButton: {
    minHeight: 58,
    paddingVertical: 14
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
    textAlign: "center"
  },
  ctaTitle: {
    fontSize: 17,
    lineHeight: 22
  }
});
