import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { openSettings } from "expo-linking";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { storeFiles, deleteFiles } from "@/app/api/fileService";
import { Share } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useImageUploader } from "@/lib/uploadthing";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";

// Animated TouchableOpacity component
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function UploadPage() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [uploadCode, setUploadCode] = useState("");
  const [localUploading, setLocalUploading] = useState(false);

  // Animated values - keeping only subtle animations
  const uploadButtonScale = useSharedValue(1);
  const fileListOpacity = useSharedValue(1);

  const colorScheme = useColorScheme() ?? "light";
  const windowWidth = Dimensions.get("window").width;
  const qrCodeSize = windowWidth * 0.6;

  // Use the useImageUploader hook
  const { openImagePicker, isUploading } = useImageUploader("videoAndImage", {
    onClientUploadComplete: (res) => {
      if (res && res[0]?.ufsUrl) {
        const fileName = res[0].name || "uploaded-file";
        const fileType = res[0].type || "unknown";

        const fileObj = {
          uri: res[0].ufsUrl,
          name: fileName,
          type: fileType,
          size: res[0].size,
        };

        const newUploadedUrl = {
          url: res[0].ufsUrl,
          name: fileName,
          type: fileType,
        };

        // Subtle fade animation when adding a new file
        fileListOpacity.value = withTiming(0.7, { duration: 100 }, () => {
          fileListOpacity.value = withTiming(1, { duration: 200 });
        });

        setUploadedUrls((prev) => [...prev, newUploadedUrl]);
        setSelectedItems((prev) => [...prev, fileObj]);
        setLocalUploading(false);

        storeFiles([newUploadedUrl])
          .then((codeResponse) => {
            if (codeResponse && codeResponse.code) {
              setUploadCode(codeResponse.code);
            }
          })
          .catch((codeError) => {
            Alert.alert("Code Generation Error", codeError.message);
          });
      }
    },
    onUploadError: (error) => {
      Alert.alert("Error", error.message);
      setLocalUploading(false);
    },
  });

  // Handle image upload via ImagePicker
  const handleImageUpload = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library to upload images.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Settings", onPress: openSettings },
          ]
        );
        return;
      }

      setLocalUploading(true);

      // Subtle button press animation
      uploadButtonScale.value = withSpring(0.97, { damping: 15 }, () => {
        uploadButtonScale.value = withSpring(1, { damping: 15 });
      });

      await openImagePicker({
        source: "library",
        allowsEditing: true,
        quality: 1,
        onInsufficientPermissions: () => {
          Alert.alert("Error", "Insufficient permissions");
          setLocalUploading(false);
        },
      });
    } catch (error) {
      setLocalUploading(false);
      Alert.alert("Error", "Failed to pick or upload images");
    }
  };

  // Handle document upload via DocumentPicker
  const handleDocumentUpload = async () => {
    try {
      // Subtle button press animation
      uploadButtonScale.value = withSpring(0.97, { damping: 15 }, () => {
        uploadButtonScale.value = withSpring(1, { damping: 15 });
      });

      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const file = result.assets[0];

        const fileObj = {
          uri: file.uri,
          name: file.name,
          type: file.mimeType,
          size: file.size,
        };

        // Subtle fade animation
        fileListOpacity.value = withTiming(0.7, { duration: 100 }, () => {
          fileListOpacity.value = withTiming(1, { duration: 200 });
        });

        setSelectedItems((prev) => [...prev, fileObj]);

        const newUploadedUrl = {
          url: file.uri,
          name: file.name,
          type: file.mimeType,
        };

        setUploadedUrls((prev) => [...prev, newUploadedUrl]);

        try {
          const codeResponse = await storeFiles([newUploadedUrl]);
          if (codeResponse && codeResponse.code) {
            setUploadCode(codeResponse.code);
          }
        } catch (codeError) {
          Alert.alert("Code Generation Error", codeError.message);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick or upload files");
    }
  };

  const handleUpload = async () => {
    Alert.alert(
      "Select File Type",
      "What type of file would you like to upload?",
      [
        {
          text: "Image/Video",
          onPress: handleImageUpload,
        },
        {
          text: "Document/Other",
          onPress: handleDocumentUpload,
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  // Delete a specific file
  const removeItem = (index) => {
    setSelectedItems((prev) => prev.filter((_, i) => i !== index));
    setUploadedUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Cancel the entire session
  const cancelSession = async () => {
    try {
      await deleteFiles(uploadCode);
      setUploadCode("");
      setSelectedItems([]);
      setUploadedUrls([]);
    } catch (error) {
      Alert.alert("Error", "Failed to cancel session");
    }
  };

  const shareFiles = async () => {
    try {
      const result = await Share.share({
        message: `Access your files with code: ${uploadCode}`,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share files");
    }
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return "document";
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

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Byte";
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
  };

  // Animated styles
  const uploadButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: uploadButtonScale.value }],
    };
  });

  const fileListStyle = useAnimatedStyle(() => {
    return {
      opacity: fileListOpacity.value,
    };
  });

  const renderSelectedItems = () => {
    return selectedItems.map((item, index) => {
      const isObject = typeof item === "object";
      const name = isObject ? item.name : "File";
      const type = isObject ? item.type : "";
      const size = isObject ? item.size : null;

      return (
        <Animated.View
          key={index}
          className="relative mb-2 p-2 flex-row items-center"
          style={{
            backgroundColor: Colors[colorScheme].muted,
            borderRadius: 6,
            width: "100%",
            borderWidth: 0.5,
            borderColor: colorScheme === "light" ? "#e0e0e0" : "#444444",
          }}
        >
          <View
            className="mr-2 rounded-md justify-center items-center"
            style={{
              width: 32,
              height: 32,
              backgroundColor: colorScheme === "light" ? "#eeeeee" : "#333333",
            }}
          >
            <MaterialIcons
              name={getFileIcon(type)}
              size={18}
              color={Colors[colorScheme].tint}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: Colors[colorScheme].text,
                fontWeight: "500",
                fontSize: 13,
              }}
              numberOfLines={1}
            >
              {name}
            </Text>
            {size && (
              <Text
                style={{
                  color: colorScheme === "light" ? "#666666" : "#aaaaaa",
                  fontSize: 11,
                }}
              >
                {formatFileSize(size)}
              </Text>
            )}
          </View>

          <TouchableOpacity
            onPress={() => removeItem(index)}
            className="ml-1 p-1"
            style={{
              backgroundColor: "#e53e3e",
              borderRadius: 12,
            }}
          >
            <MaterialIcons name="delete" size={14} color="white" />
          </TouchableOpacity>
        </Animated.View>
      );
    });
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
        className="flex-1"
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          className="text-xl font-medium mb-4"
          style={{
            color: Colors[colorScheme].text,
          }}
        >
          Upload Files
        </Text>

        {/* File Selection */}
        <Animated.View
          className="rounded-md p-3 mb-4"
          style={[
            {
              backgroundColor: Colors[colorScheme].muted,
              borderWidth: 0.5,
              borderColor: colorScheme === "light" ? "#e0e0e0" : "#333333",
            },
            fileListStyle,
          ]}
        >
          {selectedItems.length > 0 ? (
            renderSelectedItems()
          ) : (
            <View className="items-center py-4">
              <MaterialIcons
                name="cloud-upload"
                size={38}
                color={Colors[colorScheme].tint}
              />
              <Text
                className="text-center mt-2 mb-2"
                style={{
                  color: Colors[colorScheme].text,
                  fontSize: 13,
                }}
              >
                No files selected
              </Text>
            </View>
          )}

          <AnimatedTouchable
            className="px-3 py-2 rounded-md flex-row items-center justify-center mt-2"
            style={[
              {
                backgroundColor: Colors[colorScheme].tint,
                borderWidth: 0.5,
                borderColor: Colors[colorScheme].tint,
              },
              uploadButtonStyle,
            ]}
            onPress={handleUpload}
            disabled={isUploading || localUploading}
          >
            <MaterialIcons
              name="add"
              size={16}
              color={Colors[colorScheme].text}
              style={{ marginRight: 6 }}
            />
            <Text
              style={{
                color: Colors[colorScheme].text,
                fontWeight: "500",
                fontSize: 13,
              }}
            >
              {isUploading || localUploading ? "Uploading..." : "Select Files"}
            </Text>
          </AnimatedTouchable>
        </Animated.View>

        {/* QR Code Display */}
        {uploadCode && (
          <Animated.View
            className="rounded-md p-3 items-center mb-4"
            style={{
              backgroundColor: Colors[colorScheme].muted,
              borderWidth: 0.5,
              borderColor: colorScheme === "light" ? "#e0e0e0" : "#333333",
            }}
          >
            <Text
              className="text-sm font-medium mb-3"
              style={{
                color: Colors[colorScheme].text,
              }}
            >
              Scan or Share Code
            </Text>

            <View
              className="bg-white p-2 rounded-md mb-3"
              style={{
                width: qrCodeSize,
                height: qrCodeSize,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <QRCode
                value={`RemoteUpload://scan/${uploadCode}`}
                size={qrCodeSize - 20}
                backgroundColor="white"
                color="#000"
              />
            </View>

            <View
              className="mb-3 px-3 py-1 rounded-md"
              style={{
                backgroundColor:
                  colorScheme === "light" ? "#f0f0f0" : "#333333",
              }}
            >
              <Text
                className="text-sm font-medium"
                style={{
                  color: Colors[colorScheme].text,
                  letterSpacing: 0.5,
                }}
              >
                {uploadCode}
              </Text>
            </View>

            {/* Fixed iOS styling issues for buttons */}
            <View
              style={{
                flexDirection: "row",
                width: "100%",
                gap: Platform.OS === "ios" ? 8 : 8, // Ensures proper spacing on iOS
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: Colors[colorScheme].tint,
                  borderRadius: 6,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  borderWidth: 0.5,
                  borderColor: Colors[colorScheme].tint,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.2,
                  shadowRadius: 1.5,
                  elevation: 1,
                }}
                onPress={shareFiles}
              >
                <MaterialIcons
                  name="share"
                  size={16}
                  color={Colors[colorScheme].text}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={{
                    color: Colors[colorScheme].text,
                    fontWeight: "500",
                    fontSize: 13,
                  }}
                >
                  Share
                </Text>
              </TouchableOpacity>

              {/* Only session can be cancelled, not individual files */}
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: "transparent",
                  borderRadius: 6,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  borderWidth: 0.5,
                  borderColor: colorScheme === "light" ? "#d0d0d0" : "#555555",
                }}
                onPress={cancelSession}
              >
                <MaterialIcons
                  name="close"
                  size={16}
                  color={Colors[colorScheme].text}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={{
                    color: Colors[colorScheme].text,
                    fontWeight: "500",
                    fontSize: 13,
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
