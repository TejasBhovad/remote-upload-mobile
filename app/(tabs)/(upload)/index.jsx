import { Alert, Pressable, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { openSettings } from "expo-linking";
import { useImageUploader } from "@/lib/uploadthing";
import { useState } from "react";

export default function UploadScreen() {
  const [uploadedUrl, setUploadedUrl] = useState(null);

  const { openImagePicker, isUploading } = useImageUploader("videoAndImage", {
    onClientUploadComplete: (res) => {
      if (res && res[0]?.ufsUrl) {
        setUploadedUrl(res[0].ufsUrl);
        Alert.alert("Success", "File uploaded successfully!");
        console.log("Upload completed", res);
      }
    },
    onUploadError: (error) => {
      setUploadedUrl(null);
      Alert.alert("Error", error.message);
      console.error("Upload error:", error);
    },
  });

  const handleUpload = async () => {
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

      await openImagePicker({
        source: "library",
        allowsEditing: true,
        quality: 1,
        onInsufficientPermissions: () => {
          Alert.alert("Error", "Insufficient permissions");
        },
      });
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
      console.error(error);
    }
  };

  return (
    <View className="flex-1 items-center justify-center p-4">
      <Pressable
        className="bg-blue-500 px-6 py-3 rounded-lg w-full max-w-sm active:opacity-70 mb-4"
        onPress={handleUpload}
        disabled={isUploading}
      >
        <Text className="text-white text-center font-semibold">
          {isUploading ? "Uploading..." : "Select Image"}
        </Text>
      </Pressable>

      {uploadedUrl && (
        <View className="w-full max-w-sm">
          <Text className="text-gray-700 font-medium mb-2">Uploaded URL:</Text>
          <Text className="text-blue-500 break-all" selectable>
            {uploadedUrl}
          </Text>
        </View>
      )}
    </View>
  );
}
