import { StyleSheet } from "react-native";

import { colors } from "./colors";

export const textStyles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "700",
    lineHeight: 36
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24
  },
  body: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22
  },
  bodyStrong: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 22
  },
  caption: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 18,
    textTransform: "uppercase"
  },
  metric: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 34
  }
});
