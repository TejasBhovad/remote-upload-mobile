import React from "react";
import * as WebBrowser from "expo-web-browser";
import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { useSSO } from "@clerk/clerk-expo";
import * as AuthSession from "expo-auth-session";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

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
  const colorScheme = useColorScheme() ?? "light";

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
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors[colorScheme].background,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      <StatusBar
        barStyle={colorScheme === "light" ? "dark-content" : "light-content"}
      />

      <View style={{ flex: 1, padding: 24 }}>
        {/* Header Section */}
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            alignItems: "center",
            paddingBottom: 40,
          }}
        >
          <Text
            style={{
              color: Colors[colorScheme].text,
              fontSize: 38,
              fontWeight: "bold",
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            Welcome Back
          </Text>
          <Text
            style={{
              color: Colors[colorScheme].icon,
              fontSize: 16,
              textAlign: "center",
            }}
          >
            Sign in to continue to your account
          </Text>
        </View>

        {/* Buttons Section */}
        <View
          style={{
            flex: 1,
            justifyContent: "flex-start",
            alignItems: "center",
            paddingTop: 40,
          }}
        >
          {/* Google Sign In Button */}
          <TouchableOpacity
            onPress={onPress}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: Colors[colorScheme].muted,
              paddingVertical: 16,
              paddingHorizontal: 24,
              borderRadius: 12,
              width: "100%",
              elevation: 2,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.2,
              shadowRadius: 2,
            }}
          >
            <Ionicons
              name="logo-google"
              size={24}
              color="#4285F4"
              style={{ marginRight: 12 }}
            />
            <Text
              style={{
                color: Colors[colorScheme].text,
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              Continue with Google
            </Text>
          </TouchableOpacity>
        </View>

        {/* Terms Section */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              textAlign: "center",
              color: Colors[colorScheme].icon,
              fontSize: 14,
            }}
          >
            By continuing, you agree to our{" "}
            <Text
              style={{
                color: Colors[colorScheme].tint,
              }}
            >
              Terms of Service
            </Text>{" "}
            and{" "}
            <Text
              style={{
                color: Colors[colorScheme].tint,
              }}
            >
              Privacy Policy
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
