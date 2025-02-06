import React from "react";
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { DefaultTheme, DarkTheme } from "@react-navigation/native";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const theme = colorScheme === "dark" ? DarkTheme : DefaultTheme;

  return (
    <Stack screenOptions={{ headerShown: false }} theme={theme}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
