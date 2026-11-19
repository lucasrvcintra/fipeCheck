import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import type { ComponentRef, ReactNode, Ref } from "react";
import { space } from "@/constants/theme";

export function Screen({
  title,
  subtitle,
  children,
  scroll = true,
  tabs = false,
  scrollRef,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  scroll?: boolean;
  tabs?: boolean;
  scrollRef?: Ref<ComponentRef<typeof ScrollView>>;
}) {
  const content = (
    <>
      {title && (
        <View style={styles.heading}>
          <ThemedText variant="h1">{title}</ThemedText>
          {subtitle && <ThemedText tone="muted">{subtitle}</ThemedText>}
        </View>
      )}
      {children}
    </>
  );
  return (
    <ThemedView style={styles.root}>
      <SafeAreaView
        edges={tabs ? ["left", "right"] : ["left", "right", "bottom"]}
        style={styles.root}
      >
        {scroll ? (
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            automaticallyAdjustKeyboardInsets
          >
            {content}
          </ScrollView>
        ) : (
          <View style={[styles.content, styles.root]}>{content}</View>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1 },
  heading: { gap: space.xs },
  content: {
    padding: space.xl,
    paddingBottom: space.xxxl,
    gap: space.xl,
    width: "100%",
    maxWidth: 820,
    alignSelf: "center",
  },
});
