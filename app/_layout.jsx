import { ClerkProvider, ClerkLoaded, useUser } from "@clerk/clerk-expo";
import { tokenCache } from "@/cache";
import "./../global.css";
import { StatusBar } from "expo-status-bar";
import { Slot, Stack, useRouter, useSegments } from "expo-router";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { View, ActivityIndicator } from "react-native";
import { useEffect } from "react";

// Create an auth middleware component
function AuthMiddleware() {
  const { isLoaded, isSignedIn } = useUser();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const isAuthGroup = segments[0] === "(auth)";

    if (!isSignedIn && !isAuthGroup) {
      // Redirect to sign-in if not signed in and not in auth group
      router.replace("/(auth)/sign-in");
    } else if (isSignedIn && isAuthGroup) {
      // Redirect to home if signed in and in auth group
      router.replace("/(tabs)");
    }
  }, [isSignedIn, segments, isLoaded]);

  if (!isLoaded) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) {
    throw new Error("Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file");
  }

  const colorScheme = useColorScheme();

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <AuthMiddleware />

          <StatusBar style="auto" />
        </ThemeProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
