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
import { openSettings } from "expo-linking";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { storeFiles, deleteFiles } from "@/app/api/fileService";
import { Share } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useImageUploader } from "@/lib/uploadthing"; // Import the hook

export default function UploadPage() {
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [uploadCode, setUploadCode] = useState("");
  //const [isUploading, setIsUploading] = useState(false); // No longer needed

  const colorScheme = useColorScheme() ?? "light";
  const windowWidth = Dimensions.get("window").width;
  const qrCodeSize = windowWidth - 64;

  // Use the useImageUploader hook
  const { openImagePicker, isUploading } = useImageUploader("videoAndImage", {
    onClientUploadComplete: (res) => {
      if (res && res[0]?.ufsUrl) {
        // Image uploaded successfully
        const newUploadedUrl = { url: res[0].ufsUrl, name: "uploaded-image" }; // You might want to generate a better name
        setUploadedUrls((prev) => [...prev, newUploadedUrl]);
        setSelectedImages((prev) => [...prev, res[0].ufsUrl]); // Also update selected images for display

        Alert.alert("Success", "File uploaded successfully!");
        console.log("Upload completed", res);

        // Generate code if uploads are successful
        storeFiles([newUploadedUrl])
          .then((codeResponse) => {
            // Pass array
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
    },
  });

  const handleUpload = async () => {
    try {
      // Request permissions - Moved inside handleUpload for better control
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

      // Launch image picker using the hook
      await openImagePicker({
        source: "library",
        allowsEditing: true,
        quality: 1,
        onInsufficientPermissions: () => {
          Alert.alert("Error", "Insufficient permissions");
        },
      });
    } catch (error) {
      Alert.alert("Error", "Failed to pick or upload images");
      console.error(error);
    }
  };

  const removeImage = (uriToRemove) => {
    setSelectedImages((prev) => prev.filter((uri) => uri !== uriToRemove));
    setUploadedUrls((prev) =>
      prev.filter((upload) => upload.url !== uriToRemove)
    );
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
        setSelectedImages([]);
        setUploadedUrls([]);
      }
    } catch (error) {
      console.error("Sharing error:", error);
    }
  };

  const renderSelectedImages = () => {
    return selectedImages.map((uri, index) => (
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
          onPress={() => removeImage(uri)}
          className="absolute top-2 right-2 bg-red-500 rounded-full p-2"
        >
          <MaterialIcons name="close" size={20} color="white" />
        </TouchableOpacity>
      </View>
    ));
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

        {/* Image Selection */}
        <View
          className="rounded-lg p-4 mb-4"
          style={{
            backgroundColor: Colors[colorScheme].muted,
          }}
        >
          {selectedImages.length > 0 ? (
            renderSelectedImages()
          ) : (
            <View className="items-center">
              <MaterialIcons
                name="image"
                size={64}
                color={Colors[colorScheme].icon}
              />
              <Text
                className="text-center mt-4 mb-4"
                style={{ color: Colors[colorScheme].text }}
              >
                No images selected
              </Text>
            </View>
          )}

          <TouchableOpacity
            className="px-4 py-3 rounded-md flex-row items-center justify-center"
            style={{
              backgroundColor: Colors[colorScheme].tint,
            }}
            onPress={handleUpload}
            disabled={isUploading}
          >
            <MaterialIcons
              name="add-photo-alternate"
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
              {isUploading ? "Uploading..." : "Select Images"}
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
                  setSelectedImages([]);
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
