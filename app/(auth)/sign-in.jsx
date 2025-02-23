import React from "react";
import * as WebBrowser from "expo-web-browser";
import { Text, View, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { useSSO } from "@clerk/clerk-expo";
import * as AuthSession from "expo-auth-session";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";

export const useWarmUpBrowser = () => {
  React.useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

export default function SignInPage() {
  useWarmUpBrowser();
  const { startSSOFlow } = useSSO();

  const onPress = React.useCallback(async () => {
    try {
      const { createdSessionId, signIn, signUp, setActive } =
        await startSSOFlow({
          strategy: "oauth_google",
          redirectUrl: AuthSession.makeRedirectUri(),
        });

      if (createdSessionId) {
        setActive({ session: createdSessionId });
      } else {
        // Use signIn or signUp for next steps such as MFA
      }
    } catch (err) {
      console.error("OAuth error", err);
    }
  }, []);

  return (
    <View className="flex-1 bg-white dark:bg-gray-900 px-6">
      {/* Header Section */}
      <View className="flex-1 justify-end pb-10">
        <ThemedText type="title" className="text-4xl font-bold mb-3">
          Welcome Back
        </ThemedText>
        <ThemedText type="body" className="text-gray-500 dark:text-gray-400">
          Sign in to continue to your account
        </ThemedText>
      </View>

      {/* Buttons Section */}
      <View className="flex-1 justify-start pt-10 gap-4">
        {/* Google Sign In Button */}
        <TouchableOpacity
          onPress={onPress}
          className="flex-row items-center justify-center bg-white dark:bg-gray-800 px-6 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm"
          style={{
            elevation: 2,
          }}
        >
          <Ionicons
            name="logo-google"
            size={24}
            color="#4285F4"
            style={{ marginRight: 12 }}
          />
          <Text className="text-gray-800 dark:text-white font-semibold text-base">
            Continue with Google
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View className="flex-row items-center my-4">
          <View className="flex-1 h-[1px] bg-gray-200 dark:bg-gray-700" />
          <Text className="mx-4 text-gray-500 dark:text-gray-400">or</Text>
          <View className="flex-1 h-[1px] bg-gray-200 dark:bg-gray-700" />
        </View>

        {/* Home Link */}
        <Link href="/" asChild>
          <TouchableOpacity className="flex-row justify-center py-4">
            <Text className="text-gray-500 dark:text-gray-400">
              Return to Home
            </Text>
          </TouchableOpacity>
        </Link>
      </View>

      {/* Terms Section */}
      <View className="mb-10">
        <Text className="text-center text-gray-500 dark:text-gray-400 text-sm">
          By continuing, you agree to our{" "}
          <Text className="text-blue-500">Terms of Service</Text> and{" "}
          <Text className="text-blue-500">Privacy Policy</Text>
        </Text>
      </View>
    </View>
  );
}
