import React, { useEffect, useState } from "react";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  SafeAreaView,
  Platform,
  StatusBar,
  Alert,
  RefreshControl,
} from "react-native";
import { Link, useRouter, useLocalSearchParams } from "expo-router";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { FileStorage } from "@/lib/fileStorage";
import * as DocumentPicker from "expo-document-picker";
import { useFocusEffect } from "@react-navigation/native";
import { FileItem } from "@/components/FileItem"; // Use our shared component
import { openFile } from "@/lib/fileOpener"; // Import our file opener utility

export default function HomeScreen() {
  const { user } = useUser();
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = user?.emailAddresses[0]?.emailAddress || "johndoe@gmail.com";
  const colorScheme = useColorScheme() ?? "light";
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load files when component mounts or params change
  useEffect(() => {
    loadFiles();
  }, [params.refresh]);

  // Refresh files when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadFiles();
      return () => {};
    }, [])
  );

  // Set up file system listener
  useEffect(() => {
    // Create a timer to periodically check for file changes
    const fileCheckInterval = setInterval(() => {
      checkForFileChanges();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(fileCheckInterval);
  }, [files]);

  // Check if files have changed
  const checkForFileChanges = async () => {
    try {
      const storedFiles = await FileStorage.getFiles();

      // Compare file count
      if (storedFiles.length !== files.length) {
        setFiles(storedFiles);
        return;
      }

      // Compare last modified timestamps
      const currentNewestFile =
        files.length > 0
          ? Math.max(...files.map((f) => new Date(f.dateAdded).getTime()))
          : 0;

      const storedNewestFile =
        storedFiles.length > 0
          ? Math.max(...storedFiles.map((f) => new Date(f.dateAdded).getTime()))
          : 0;

      if (storedNewestFile > currentNewestFile) {
        setFiles(storedFiles);
      }
    } catch (error) {
      console.error("Error checking for file changes:", error);
    }
  };

  const loadFiles = async () => {
    try {
      setIsLoading(true);
      const storedFiles = await FileStorage.getFiles();
      setFiles(storedFiles);
    } catch (error) {
      console.error("Error loading files:", error);
      Alert.alert("Error", "Failed to load your files.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: "*/*",
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      await FileStorage.saveFile(file.uri, file.name, file.mimeType);
      loadFiles(); // Reload the files list

      Alert.alert("File Added", `${file.name} has been added to your files.`);
    } catch (error) {
      console.error("Error adding file:", error);
      Alert.alert("Error", "Failed to add file.");
    }
  };

  const handleShareFile = async (fileId) => {
    try {
      await FileStorage.shareFile(fileId);
      loadFiles(); // Refresh the list to update the shared status
    } catch (error) {
      console.error("Error sharing file:", error);
      Alert.alert("Error", "Failed to share file.");
    }
  };

  // Handle file opening
  const handleOpenFile = async (file) => {
    try {
      await openFile(file.uri, file.type, file.name);
    } catch (error) {
      console.error("Error opening file:", error);
      Alert.alert("Error", "Failed to open file: " + error.message);
    }
  };

  // Get time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Morning";
    if (hour < 18) return "Afternoon";
    return "Evening";
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{
        backgroundColor: Colors[colorScheme].background,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      <StatusBar
        barStyle={colorScheme === "light" ? "dark-content" : "light-content"}
      />
      <ScrollView
        className="flex-1 p-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadFiles}
            colors={[Colors[colorScheme].tint]}
            tintColor={Colors[colorScheme].tint}
          />
        }
      >
        {/* Header */}
        <Text
          className="text-4xl font-bold mb-6"
          style={{ color: Colors[colorScheme].text }}
        >
          {getGreeting()},{" "}
          <Text
            className="font-bold"
            style={{ color: Colors[colorScheme].tint }}
          >
            {user?.fullName || "John Doe"}
          </Text>
        </Text>

        {/* What's New Card */}
        <View
          className="rounded-lg p-4 mb-4"
          style={{ backgroundColor: Colors[colorScheme].muted }}
        >
          <View className="flex-row items-center">
            <View
              className="w-1 h-1 rounded-full mr-2"
              style={{ backgroundColor: Colors[colorScheme].tint }}
            />
            <Text
              className="text-lg font-semibold"
              style={{ color: Colors[colorScheme].text }}
            >
              What's New
            </Text>
          </View>
          <Text
            className="text-sm mt-2"
            style={{ color: Colors[colorScheme].icon }}
          >
            Store files locally and share them easily
          </Text>
        </View>

        {/* Stats Card */}
        <View
          className="rounded-lg p-4 mb-4"
          style={{ backgroundColor: Colors[colorScheme].tint }}
        >
          <Text
            className="text-lg mb-2"
            style={{ color: Colors[colorScheme].text }}
          >
            No. of files shared
          </Text>
          <Text
            className="text-5xl font-bold"
            style={{ color: Colors[colorScheme].text }}
          >
            {files.filter((file) => file.shared).length}
          </Text>
        </View>

        {/* Account Type */}
        <View className="rounded-lg mb-6">
          <View
            className="flex-row justify-between rounded-md p-4 items-center"
            style={{ backgroundColor: Colors[colorScheme].muted }}
          >
            <View className="flex-row items-center">
              <MaterialCommunityIcons
                name="crown"
                size={24}
                color={Colors[colorScheme].icon}
                style={{ marginRight: 8 }}
              />
              <Text
                className="text-lg"
                style={{ color: Colors[colorScheme].icon }}
              >
                Free Tier
              </Text>
            </View>
            <View>
              <Text
                className="text-sm mb-1"
                style={{ color: Colors[colorScheme].text }}
              >
                Selected Email
              </Text>
              <Text
                className="text-sm"
                style={{ color: Colors[colorScheme].icon }}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {email}
              </Text>
            </View>
          </View>
        </View>

        {/* Recent Files with Add Button */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text
              className="text-2xl font-bold"
              style={{ color: Colors[colorScheme].text }}
            >
              Recent Files
            </Text>
            <View className="flex-row">
              <Pressable
                onPress={handleAddFile}
                className="px-3 py-1.5 rounded-lg mr-2 flex-row items-center"
                style={{ backgroundColor: Colors[colorScheme].tint }}
              >
                <MaterialIcons
                  name="add"
                  size={16}
                  color={Colors[colorScheme].text}
                  style={{ marginRight: 4 }}
                />
                <Text
                  className="text-sm"
                  style={{ color: Colors[colorScheme].text }}
                >
                  Add File
                </Text>
              </Pressable>
              <Link href="/recent" asChild>
                <Pressable>
                  <Text
                    className="text-sm py-1.5"
                    style={{ color: Colors[colorScheme].icon }}
                  >
                    view all
                  </Text>
                </Pressable>
              </Link>
            </View>
          </View>

          {files.length > 0 ? (
            files
              .slice(0, 3)
              .map((file) => (
                <FileItem
                  key={file.id}
                  file={file}
                  colorScheme={colorScheme}
                  onShare={handleShareFile}
                  onPress={handleOpenFile}
                />
              ))
          ) : (
            <View
              className="rounded-lg p-4 mb-3 items-center"
              style={{ backgroundColor: Colors[colorScheme].muted }}
            >
              <MaterialIcons
                name="file-upload"
                size={36}
                color={Colors[colorScheme].icon}
                className="mb-2"
              />
              <Text
                className="text-base text-center"
                style={{ color: Colors[colorScheme].text }}
              >
                No files yet
              </Text>
              <Text
                className="text-sm text-center mt-1"
                style={{ color: Colors[colorScheme].icon }}
              >
                Tap "Add File" to get started
              </Text>
            </View>
          )}

          {files.length > 3 && (
            <Link href="/recent" asChild>
              <Pressable
                className="mt-2 rounded-lg p-3 items-center"
                style={{ backgroundColor: Colors[colorScheme].muted }}
              >
                <Text
                  className="text-sm font-medium"
                  style={{ color: Colors[colorScheme].tint }}
                >
                  View all {files.length} files
                </Text>
              </Pressable>
            </Link>
          )}
        </View>

        {/* Last updated timestamp */}
        <Text
          className="text-xs text-center mb-4"
          style={{ color: Colors[colorScheme].icon }}
        >
          Last updated: {new Date().toLocaleTimeString()}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
