import React, { useEffect, useState } from "react";
import { Link, useRouter, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Alert,
  StatusBar,
  Platform,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { MaterialIcons } from "@expo/vector-icons";
import { FileStorage } from "@/lib/fileStorage";
import * as DocumentPicker from "expo-document-picker";
import { FileItem } from "@/components/FileItem"; // Use shared component
import { openFile } from "@/lib/fileOpener"; // Import our file opener utility

export default function RecentPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? "light";
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFiles();
  }, [params.refresh]);

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
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadFiles();
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
      loadFiles();

      Alert.alert("File Added", `${file.name} has been added to your files.`);
    } catch (error) {
      console.error("Error adding file:", error);
      Alert.alert("Error", "Failed to add file.");
    }
  };

  const handleShareFile = async (fileId) => {
    try {
      await FileStorage.shareFile(fileId);
      loadFiles();
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

  const handleDeleteFile = async (fileId, fileName) => {
    Alert.alert(
      "Delete File",
      `Are you sure you want to delete "${fileName}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await FileStorage.deleteFile(fileId);
              loadFiles();
              Alert.alert("Success", "File deleted successfully.");
            } catch (error) {
              console.error("Error deleting file:", error);
              Alert.alert("Error", "Failed to delete file.");
            }
          },
        },
      ]
    );
  };

  // Custom render item to add delete functionality
  const renderFileItem = ({ item }) => {
    return (
      <View>
        <FileItem
          file={item}
          colorScheme={colorScheme}
          onShare={handleShareFile}
          onPress={handleOpenFile}
        />
        <Pressable
          onPress={() => handleDeleteFile(item.id, item.name)}
          className="absolute top-2 right-2 w-8 h-8 rounded-full justify-center items-center"
          style={{ backgroundColor: Colors[colorScheme].background }}
        >
          <MaterialIcons
            name="delete"
            size={16}
            color={Colors[colorScheme].icon}
          />
        </Pressable>
      </View>
    );
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

      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable onPress={() => router.back()} className="p-2">
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={Colors[colorScheme].text}
          />
        </Pressable>
        <ThemedText type="title" className="text-xl font-bold">
          My Files
        </ThemedText>
        <Pressable onPress={handleAddFile} className="p-2">
          <MaterialIcons
            name="add"
            size={24}
            color={Colors[colorScheme].text}
          />
        </Pressable>
      </View>

      <FlatList
        data={files}
        renderItem={renderFileItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingTop: 8, flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading || refreshing}
            onRefresh={handleRefresh}
            colors={[Colors[colorScheme].tint]}
            tintColor={Colors[colorScheme].tint}
          />
        }
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center p-6 mt-24">
            <MaterialIcons
              name="folder-open"
              size={64}
              color={Colors[colorScheme].icon}
              className="mb-4"
            />
            <ThemedText
              type="subtitle"
              className="text-xl font-bold mb-2 text-center"
            >
              No files yet
            </ThemedText>
            <Text
              className="text-center"
              style={{ color: Colors[colorScheme].icon }}
            >
              Add files to access them across your devices
            </Text>
            <Pressable
              onPress={handleAddFile}
              className="mt-6 px-4 py-3 rounded-lg"
              style={{ backgroundColor: Colors[colorScheme].tint }}
            >
              <Text style={{ color: Colors[colorScheme].text }}>
                Add Your First File
              </Text>
            </Pressable>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
