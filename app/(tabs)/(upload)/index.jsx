import React, { useState } from "react";
import {
  Alert,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  StatusBar,
  SafeAreaView,
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { openSettings } from "expo-linking";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { storeFiles, deleteFiles } from "@/app/api/fileService";
import { Share } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useImageUploader } from "@/lib/uploadthing"; // Keep original hook

export default function UploadPage() {
  const [selectedItems, setSelectedItems] = useState([]); // Changed to selectedItems to be more generic
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [uploadCode, setUploadCode] = useState("");
  const [localUploading, setLocalUploading] = useState(false);

  const colorScheme = useColorScheme() ?? "light";
  const windowWidth = Dimensions.get("window").width;
  const qrCodeSize = windowWidth - 64;

  // Use the useImageUploader hook
  const { openImagePicker, isUploading } = useImageUploader("videoAndImage", {
    onClientUploadComplete: (res) => {
      if (res && res[0]?.ufsUrl) {
        const fileName = res[0].name || "uploaded-file";
        const fileType = res[0].type || "unknown";

        // Create more detailed file object
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

        setUploadedUrls((prev) => [...prev, newUploadedUrl]);
        setSelectedItems((prev) => [...prev, fileObj]);
        setLocalUploading(false);

        Alert.alert("Success", "File uploaded successfully!");
        console.log("Upload completed", res);

        // Generate code if uploads are successful
        storeFiles([newUploadedUrl])
          .then((codeResponse) => {
            if (codeResponse && codeResponse.code) {
              setUploadCode(codeResponse.code);
            }
          })
          .catch((codeError) => {
            Alert.alert("Code Generation Error", codeError.message);
            console.error(codeError);
          });
      }
    },
    onUploadError: (error) => {
      Alert.alert("Error", error.message);
      console.error("Upload error:", error);
      setLocalUploading(false);
    },
  });

  // Handle image upload via ImagePicker
  const handleImageUpload = async () => {
    try {
      // Request permissions
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

      // Set local uploading state
      setLocalUploading(true);

      // Fixed: Use the picker with the correct parameters
      // Launch image picker using the hook
      await openImagePicker({
        source: "library", // Keep the original parameter name as in your hook
        allowsEditing: true,
        quality: 1,
        // Remove the problematic mediaTypes parameter - let the default handle it
        onInsufficientPermissions: () => {
          Alert.alert("Error", "Insufficient permissions");
          setLocalUploading(false);
        },
      });
    } catch (error) {
      setLocalUploading(false);
      Alert.alert("Error", "Failed to pick or upload images");
      console.error(error);
    }
  };

  // Handle document upload via DocumentPicker
  const handleDocumentUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*", // All file types
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const file = result.assets[0];
        console.log("Selected file:", file);

        // Create a file object
        const fileObj = {
          uri: file.uri,
          name: file.name,
          type: file.mimeType,
          size: file.size,
        };

        // Add to selected items directly for display
        setSelectedItems((prev) => [...prev, fileObj]);

        // Create uploaded URL object
        const newUploadedUrl = {
          url: file.uri,
          name: file.name,
          type: file.mimeType,
        };

        setUploadedUrls((prev) => [...prev, newUploadedUrl]);

        // Generate code
        try {
          const codeResponse = await storeFiles([newUploadedUrl]);
          if (codeResponse && codeResponse.code) {
            setUploadCode(codeResponse.code);
          }
        } catch (codeError) {
          Alert.alert("Code Generation Error", codeError.message);
          console.error(codeError);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick or upload files");
      console.error(error);
    }
  };

  const handleUpload = async () => {
    // Show a dialog to choose between image or document upload
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

  const removeItem = (index) => {
    setSelectedItems((prev) => prev.filter((_, i) => i !== index));
    setUploadedUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const shareFiles = async () => {
    try {
      const result = await Share.share({
        message: `Access your files with code: ${uploadCode}`,
      });

      if (result.action === Share.sharedAction) {
        // Delete the code after sharing
        await deleteFiles(uploadCode);
        // Reset state
        setUploadCode("");
        setSelectedItems([]);
        setUploadedUrls([]);
      }
    } catch (error) {
      console.error("Sharing error:", error);
    }
  };

  const getFileIcon = (fileType) => {
    // Determine icon based on file type
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

  const renderSelectedItems = () => {
    return selectedItems.map((item, index) => {
      // Handle both string URIs (old format) and object format
      const isObject = typeof item === "object";
      const uri = isObject ? item.uri : item;
      const name = isObject ? item.name : "File";
      const type = isObject ? item.type : "";
      const size = isObject ? item.size : null;

      // Determine if this is an image type
      const isImage = type
        ? type.startsWith("image/")
        : uri.match(/\.(jpg|jpeg|png|gif)$/i);

      if (isImage) {
        // Render image preview for image files
        return (
          <View
            key={index}
            className="relative mb-4"
            style={{ width: "100%", height: 200 }}
          >
            <Image
              source={{ uri }}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 8,
              }}
              resizeMode="cover"
            />
            <TouchableOpacity
              onPress={() => removeItem(index)}
              className="absolute top-2 right-2 bg-red-500 rounded-full p-2"
            >
              <MaterialIcons name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>
        );
      } else {
        // Render file item for non-image files
        return (
          <View
            key={index}
            className="relative mb-4 p-4 flex-row items-center"
            style={{
              backgroundColor: Colors[colorScheme].muted,
              borderRadius: 8,
              width: "100%",
              borderWidth: 1,
              borderColor: colorScheme === "light" ? "#e0e0e0" : "#444444",
            }}
          >
            <View
              className="mr-3 rounded-lg justify-center items-center"
              style={{
                width: 48,
                height: 48,
                backgroundColor:
                  colorScheme === "light" ? "#e6e6e6" : "#333333",
              }}
            >
              <MaterialIcons
                name={getFileIcon(type)}
                size={28}
                color={Colors[colorScheme].text}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{ color: Colors[colorScheme].text, fontWeight: "600" }}
                numberOfLines={1}
              >
                {name}
              </Text>
              {size && (
                <Text
                  style={{
                    color: colorScheme === "light" ? "#666666" : "#aaaaaa",
                    fontSize: 12,
                  }}
                >
                  {formatFileSize(size)}
                </Text>
              )}
            </View>

            <TouchableOpacity
              onPress={() => removeItem(index)}
              className="ml-2 p-2"
              style={{
                backgroundColor: "#e53e3e",
                borderRadius: 20,
              }}
            >
              <MaterialIcons name="close" size={18} color="white" />
            </TouchableOpacity>
          </View>
        );
      }
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
      >
        <Text
          className="text-3xl font-bold mb-6"
          style={{
            color: Colors[colorScheme].text,
          }}
        >
          Upload Files
        </Text>

        {/* File Selection */}
        <View
          className="rounded-lg p-4 mb-4"
          style={{
            backgroundColor: Colors[colorScheme].muted,
          }}
        >
          {selectedItems.length > 0 ? (
            renderSelectedItems()
          ) : (
            <View className="items-center py-6">
              <MaterialIcons
                name="cloud-upload"
                size={64}
                color={Colors[colorScheme].icon}
              />
              <Text
                className="text-center mt-4 mb-4"
                style={{ color: Colors[colorScheme].text }}
              >
                No files selected
              </Text>
            </View>
          )}

          <TouchableOpacity
            className="px-4 py-3 rounded-md flex-row items-center justify-center"
            style={{
              backgroundColor: Colors[colorScheme].tint,
            }}
            onPress={handleUpload}
            disabled={isUploading || localUploading}
          >
            <MaterialIcons
              name="add"
              size={20}
              color={Colors[colorScheme].text}
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                color: Colors[colorScheme].text,
                fontWeight: "600",
              }}
            >
              {isUploading || localUploading ? "Uploading..." : "Select Files"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* QR Code Display */}
        {uploadCode && (
          <View
            className="rounded-lg p-4 items-center"
            style={{
              backgroundColor: Colors[colorScheme].muted,
            }}
          >
            <Text
              className="text-lg font-semibold mb-4"
              style={{
                color: Colors[colorScheme].text,
              }}
            >
              Scan or Share Code
            </Text>

            <View
              className="bg-white p-4 rounded-lg mb-4"
              style={{
                width: qrCodeSize,
                height: qrCodeSize,
              }}
            >
              <QRCode
                value={`RemoteUpload://scan/${uploadCode}`}
                size={qrCodeSize - 32}
              />
            </View>

            <Text
              className="text-xl font-bold mb-4"
              style={{
                color: Colors[colorScheme].text,
              }}
            >
              {uploadCode}
            </Text>

            <View className="flex-row space-x-4">
              <TouchableOpacity
                className="px-4 py-3 rounded-md flex-row items-center justify-center flex-1"
                style={{
                  backgroundColor: Colors[colorScheme].tint,
                }}
                onPress={shareFiles}
              >
                <MaterialIcons
                  name="share"
                  size={20}
                  color={Colors[colorScheme].text}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{
                    color: Colors[colorScheme].text,
                    fontWeight: "600",
                  }}
                >
                  Share
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-4 py-3 rounded-md flex-row items-center justify-center flex-1"
                style={{
                  backgroundColor: Colors[colorScheme].muted,
                  borderWidth: 1,
                  borderColor: Colors[colorScheme].border,
                }}
                onPress={() => {
                  deleteFiles(uploadCode);
                  setUploadCode("");
                  setSelectedItems([]);
                  setUploadedUrls([]);
                }}
              >
                <MaterialIcons
                  name="delete"
                  size={20}
                  color={Colors[colorScheme].text}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{
                    color: Colors[colorScheme].text,
                    fontWeight: "600",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
