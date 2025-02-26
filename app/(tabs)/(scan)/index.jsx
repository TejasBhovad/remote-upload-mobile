import React, { useState, useEffect } from "react";
import { Link } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
  SafeAreaView,
  Platform,
  StatusBar,
  Pressable,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useUser } from "@clerk/clerk-expo";
import { MaterialIcons } from "@expo/vector-icons";

import {
  storeFiles,
  getFiles,
  checkCode,
  deleteFiles,
} from "@/app/api/fileService";

export default function ScanPage() {
  const { user } = useUser();
  const colorScheme = useColorScheme() ?? "light";

  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [codeExists, setCodeExists] = useState(null);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState("");

  useEffect(() => {
    const now = new Date();
    const formattedDate = formatDateTime(now);
    setCurrentDateTime(formattedDate);
  }, []);

  const formatDateTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // Check if the code exists
  const handleCheckCode = async () => {
    if (!code || code.length !== 4) {
      setError("Please enter a valid 4-digit code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Instead of using checkCode, we'll directly try to get files
      // as our API seems to return 404 if code doesn't exist
      await handleGetFiles();
    } catch (error) {
      console.error("Error checking code:", error);
      setError(error.message || "Failed to check code");
      setCodeExists(false);
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Get files associated with a code
  const handleGetFiles = async () => {
    if (!code || code.length !== 4) {
      setError("Please enter a valid 4-digit code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await getFiles(code);

      if (result && result.files) {
        setFiles(result.files);
        setCodeExists(true);
      } else {
        setError("No files found for this code");
        setCodeExists(false);
      }
    } catch (error) {
      console.error("Error getting files:", error);
      setError(error.message || "Failed to get files");
      setCodeExists(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete files associated with the code
  const handleDeleteFiles = async () => {
    if (!code || !codeExists) {
      setError("No valid code to delete");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await deleteFiles(code);

      Alert.alert("Success", "Files deleted successfully", [
        {
          text: "OK",
          onPress: () => {
            setCode("");
            setCodeExists(null);
            setFiles([]);
          },
        },
      ]);
    } catch (error) {
      console.error("Error deleting files:", error);
      setError(error.message || "Failed to delete files");
    } finally {
      setIsLoading(false);
    }
  };

  // Open file URL
  const handleOpenFile = (url) => {
    Linking.openURL(url).catch((err) => {
      console.error("Error opening URL:", err);
      Alert.alert("Error", "Could not open the file");
    });
  };

  // Render file item
  const renderFileItem = (file, index) => {
    return (
      <TouchableOpacity
        key={index}
        onPress={() => handleOpenFile(file.url)}
        className="mb-3"
      >
        <View
          style={{
            backgroundColor: Colors[colorScheme].muted,
            borderRadius: 8,
            padding: 16,
          }}
        >
          <View className="flex-row justify-between items-center">
            <View>
              <Text
                style={{
                  color: Colors[colorScheme].text,
                  fontSize: 18,
                  fontWeight: "600",
                }}
              >
                {file.name || `File ${index + 1}`}
              </Text>
              <Text
                style={{
                  color: Colors[colorScheme].icon,
                  fontSize: 14,
                }}
              >
                Tap to open
              </Text>
            </View>
            <View
              style={{
                backgroundColor: Colors[colorScheme].tint,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <MaterialIcons
                name="file-download"
                size={16}
                color={Colors[colorScheme].text}
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  color: Colors[colorScheme].text,
                  fontSize: 12,
                }}
              >
                Download
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
        {/* Header */}
        <Text
          style={{
            color: Colors[colorScheme].text,
            fontSize: 36,
            fontWeight: "bold",
            marginBottom: 24,
          }}
        >
          Scan Code
        </Text>

        {/* Code Input Card */}
        <View
          style={{
            backgroundColor: Colors[colorScheme].muted,
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <View className="flex-row justify-between mb-4">
            <Text
              style={{
                color: Colors[colorScheme].text,
                fontSize: 18,
                fontWeight: "600",
              }}
            >
              Enter 4-digit code
            </Text>
          </View>

          <View className="flex-row justify-between">
            <TextInput
              className="flex-1 mr-2 px-4 py-3 rounded-md"
              style={{
                backgroundColor: Colors[colorScheme].background,
                color: Colors[colorScheme].text,
                borderWidth: 1,
                borderColor: Colors[colorScheme].border,
              }}
              placeholder="Enter 4-digit code"
              value={code}
              onChangeText={setCode}
              maxLength={4}
              keyboardType="numeric"
              placeholderTextColor={Colors[colorScheme].icon}
            />

            <TouchableOpacity
              className="px-4 py-3 rounded-md flex-row items-center justify-center"
              style={{
                backgroundColor: Colors[colorScheme].tint,
              }}
              onPress={handleCheckCode}
              disabled={isLoading}
            >
              <Text
                style={{
                  color: Colors[colorScheme].text,
                  fontWeight: "600",
                }}
              >
                Check
              </Text>
            </TouchableOpacity>
          </View>

          {isLoading && (
            <View className="mt-4 items-center">
              <ActivityIndicator
                size="large"
                color={Colors[colorScheme].tint}
              />
            </View>
          )}

          {error ? (
            <Text
              className="mt-4"
              style={{
                color: "red",
                fontSize: 14,
              }}
            >
              {error}
            </Text>
          ) : null}
        </View>

        {/* Results Card */}
        {codeExists && files.length > 0 && (
          <View
            style={{
              backgroundColor: Colors[colorScheme].muted,
              borderRadius: 8,
              padding: 16,
              marginBottom: 24,
            }}
          >
            <View className="flex-row justify-between mb-4">
              <View className="flex-row items-center">
                <View
                  style={{
                    width: 4,
                    height: 16,
                    borderRadius: 2,
                    backgroundColor: Colors[colorScheme].tint,
                    marginRight: 8,
                  }}
                />
                <Text
                  style={{
                    color: Colors[colorScheme].text,
                    fontSize: 18,
                    fontWeight: "600",
                  }}
                >
                  Files Found
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: Colors[colorScheme].tint,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    color: Colors[colorScheme].text,
                    fontSize: 12,
                  }}
                >
                  Code: {code}
                </Text>
              </View>
            </View>

            {files.map((file, index) => renderFileItem(file, index))}

            <TouchableOpacity
              className="mt-4 p-3 rounded-md items-center"
              style={{
                backgroundColor: "#ff3b30",
              }}
              onPress={handleDeleteFiles}
              disabled={isLoading}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                Delete Files
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
