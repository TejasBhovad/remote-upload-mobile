import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  Platform,
  StatusBar,
  Image,
  ScrollView,
  Appearance,
  useColorScheme as useSystemColorScheme,
} from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Colors } from "@/constants/Colors";

const THEME_STORAGE_KEY = "@app_theme";
const EMAIL_PREF_KEY = "@email_pref";
const FILES_PREF_KEY = "@files_pref";
const DATA_PREF_KEY = "@data_pref";

export default function AccountPage() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const systemColorScheme = useSystemColorScheme();
  const [colorScheme, setColorScheme] = useState(systemColorScheme);
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === "dark");

  const [subscribeEmails, setSubscribeEmails] = useState(true);
  const [getFiles, setGetFiles] = useState(true);
  const [collectData, setCollectData] = useState(true);

  useEffect(() => {
    const loadSavedTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme) {
          setColorScheme(savedTheme);
          setIsDarkMode(savedTheme === "dark");
          Appearance.setColorScheme(savedTheme);
        }
      } catch (error) {
        console.error("Error loading theme:", error);
      }
    };

    const loadPreferences = async () => {
      try {
        const savedEmailPref = await AsyncStorage.getItem(EMAIL_PREF_KEY);
        const savedFilesPref = await AsyncStorage.getItem(FILES_PREF_KEY);
        const savedDataPref = await AsyncStorage.getItem(DATA_PREF_KEY);

        if (savedEmailPref !== null) {
          setSubscribeEmails(savedEmailPref === "true");
        }
        if (savedFilesPref !== null) {
          setGetFiles(savedFilesPref === "true");
        }
        if (savedDataPref !== null) {
          setCollectData(savedDataPref === "true");
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
      }
    };

    loadSavedTheme();
    loadPreferences();
  }, []);

  const toggleTheme = async (darkMode) => {
    try {
      const newTheme = darkMode ? "dark" : "light";

      setIsDarkMode(darkMode);
      setColorScheme(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
      Appearance.setColorScheme(newTheme);

      if (Platform.OS === "android") {
        //  await NavigationBar.setBackgroundColorAsync(  // Make sure NavigationBar is imported if you are using it
        //   darkMode ? Colors.dark.background : Colors.light.background
        // );
      }
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  const savePreference = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value.toString());
    } catch (error) {
      console.error("Error saving preference:", error);
    }
  };

  const setEmailPreference = (value) => {
    setSubscribeEmails(value);
    savePreference(EMAIL_PREF_KEY, value);
  };

  const setFilesPreference = (value) => {
    setGetFiles(value);
    savePreference(FILES_PREF_KEY, value);
  };

  const setDataPreference = (value) => {
    setCollectData(value);
    savePreference(DATA_PREF_KEY, value);
  };

  const email = user?.emailAddresses[0]?.emailAddress || "johndoe@gmail.com";
  const name = user?.fullName || "John Doe";
  const imageUrl = user?.imageUrl || null;

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
      <ScrollView
        style={{
          flex: 1,
          padding: 16,
        }}
      >
        <Text
          style={{
            color: Colors[colorScheme].text,
            fontSize: 36,
            fontWeight: "bold",
            marginBottom: 24,
          }}
        >
          Your Profile
        </Text>

        {/* Profile Card */}
        <View
          style={{
            backgroundColor: Colors[colorScheme].muted,
            borderRadius: 8,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <View className="flex-row items-center">
            {/* image */}
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: Colors[colorScheme].tint,
                marginRight: 16,
              }}
            >
              {imageUrl ? (
                <Image
                  className="rounded-lg"
                  source={{ uri: imageUrl }}
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                  resizeMode="cover"
                />
              ) : null}
            </View>

            <View>
              <Text
                style={{
                  color: Colors[colorScheme].text,
                  fontSize: 20,
                  fontWeight: "600",
                }}
              >
                {user?.fullName || "John Doe"}
              </Text>
              <Text
                style={{
                  color: Colors[colorScheme].icon,
                  fontSize: 14,
                }}
              >
                {email}
              </Text>
            </View>
          </View>
        </View>

        {/* Theme Toggle */}
        <View className="flex-row mb-8">
          <TouchableOpacity
            onPress={() => toggleTheme(true)}
            className="w-1/2"
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 24,
              marginRight: 8,
              backgroundColor: isDarkMode
                ? Colors[colorScheme].tint
                : Colors[colorScheme].muted,
            }}
          >
            <Ionicons
              name="moon"
              size={20}
              color={
                isDarkMode ? Colors[colorScheme].text : Colors[colorScheme].icon
              }
              style={{ marginRight: 6 }}
            />
            <Text
              style={{
                color: isDarkMode
                  ? Colors[colorScheme].text
                  : Colors[colorScheme].icon,
              }}
            >
              Dark mode
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="w-1/2"
            onPress={() => toggleTheme(false)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 24,
              backgroundColor: !isDarkMode
                ? Colors[colorScheme].tint
                : Colors[colorScheme].muted,
            }}
          >
            <Ionicons
              name="sunny"
              size={20}
              color={
                !isDarkMode
                  ? Colors[colorScheme].text
                  : Colors[colorScheme].icon
              }
              style={{ marginRight: 6 }}
            />
            <Text
              style={{
                color: !isDarkMode
                  ? Colors[colorScheme].text
                  : Colors[colorScheme].icon,
              }}
            >
              Light mode
            </Text>
          </TouchableOpacity>
        </View>

        {/* Options Section */}
        <Text
          style={{
            color: Colors[colorScheme].text,
            fontSize: 28,
            fontWeight: "bold",
            marginBottom: 16,
          }}
        >
          Options
        </Text>

        <View style={{ marginBottom: 24 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                color: Colors[colorScheme].text,
                fontSize: 16,
              }}
            >
              Subscribe to Update Emails
            </Text>
            <Switch
              value={subscribeEmails}
              onValueChange={setEmailPreference}
              trackColor={{ false: "#767577", true: Colors[colorScheme].tint }}
              thumbColor={subscribeEmails ? "#fff" : "#f4f3f4"}
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                color: Colors[colorScheme].text,
                fontSize: 16,
              }}
            >
              Get files to your inbox
            </Text>
            <Switch
              value={getFiles}
              onValueChange={setFilesPreference}
              trackColor={{ false: "#767577", true: Colors[colorScheme].tint }}
              thumbColor={getFiles ? "#fff" : "#f4f3f4"}
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                color: Colors[colorScheme].text,
                fontSize: 16,
              }}
            >
              Collect anonymised data
            </Text>
            <Switch
              value={collectData}
              onValueChange={setDataPreference}
              trackColor={{ false: "#767577", true: Colors[colorScheme].tint }}
              thumbColor={collectData ? "#fff" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Account Type */}
        <View
          style={{
            backgroundColor: Colors[colorScheme].muted,
            borderRadius: 8,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <MaterialCommunityIcons
                name="crown"
                size={24}
                color={Colors[colorScheme].icon}
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  color: Colors[colorScheme].icon,
                  fontSize: 18,
                }}
              >
                Free Tier
              </Text>
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: Colors[colorScheme].tint,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
              }}
            >
              <Text
                style={{
                  color: Colors[colorScheme].text,
                  fontSize: 12,
                  fontWeight: "500",
                }}
              >
                Upgrade
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          className="bg-red-500/20"
          onPress={() => signOut()}
          style={{
            paddingVertical: 10,
            borderRadius: 8,
            marginTop: 8,
            marginBottom: 40,
          }}
        >
          <Text
            style={{
              color: Colors[colorScheme].text,
              textAlign: "center",
              fontWeight: "600",
              fontSize: 14,
            }}
          >
            Sign Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
