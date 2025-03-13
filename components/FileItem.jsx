import React from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import * as FileSystem from "expo-file-system";
import * as Linking from "expo-linking";
import * as IntentLauncher from "expo-intent-launcher";

// This is a shared component that can be used in both HomeScreen and RecentPage
export const FileItem = ({ file, colorScheme, onShare, onPress }) => {
  // Format the time since the file was added
  const getTimeSince = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  // Get icon based on file type
  const getFileIcon = (fileType) => {
    if (!fileType) return "insert-drive-file";
    if (fileType.startsWith("image/")) return "image";
    if (fileType.startsWith("video/")) return "videocam";
    if (fileType.startsWith("audio/")) return "headset";
    if (fileType.includes("pdf")) return "picture-as-pdf";
    if (fileType.includes("spreadsheet") || fileType.includes("excel"))
      return "grid-view";
    if (fileType.includes("presentation") || fileType.includes("powerpoint"))
      return "slideshow";
    if (fileType.includes("word") || fileType.includes("document"))
      return "description";
    if (fileType.includes("zip") || fileType.includes("compressed"))
      return "folder-zip";
    return "insert-drive-file";
  };

  return (
    <Pressable
      onPress={() => onPress && onPress(file)}
      className="rounded-lg p-4 mb-3"
      style={({ pressed }) => [
        { backgroundColor: Colors[colorScheme].muted },
        pressed && { opacity: 0.8 },
      ]}
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center flex-1">
          <View
            className="w-9 h-9 rounded-md justify-center items-center mr-3"
            style={{ backgroundColor: Colors[colorScheme].background }}
          >
            <MaterialIcons
              name={getFileIcon(file.type)}
              size={20}
              color={Colors[colorScheme].tint}
            />
          </View>
          <View className="flex-1">
            <Text
              className="text-lg font-semibold"
              style={{ color: Colors[colorScheme].text }}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {file.name}
            </Text>
            <Text
              className="text-sm"
              style={{ color: Colors[colorScheme].icon }}
            >
              {file.shared ? "Delivered" : "Added"}{" "}
              {getTimeSince(file.shared ? file.lastShared : file.dateAdded)}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={() => onShare(file.id)}
          className="px-2 py-1 rounded-lg flex-row items-center ml-2"
          style={{
            backgroundColor: file.shared
              ? Colors[colorScheme].tint
              : Colors[colorScheme].background,
          }}
        >
          <MaterialIcons
            name={file.shared ? "email" : "share"}
            size={16}
            color={Colors[colorScheme].text}
            style={{ marginRight: 4 }}
          />
          <Text className="text-xs" style={{ color: Colors[colorScheme].text }}>
            {file.shared ? "Email sent" : "Share"}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
};
