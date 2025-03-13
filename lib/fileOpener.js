import * as FileSystem from "expo-file-system";
import * as Linking from "expo-linking";
import * as IntentLauncher from "expo-intent-launcher";
import * as WebBrowser from "expo-web-browser";
import * as Sharing from "expo-sharing";
import { Alert, Platform } from "react-native";
import * as MediaLibrary from "expo-media-library";

export const openFile = async (fileUri, fileType, fileName) => {
  try {
    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      Alert.alert("Error", "File doesn't exist or has been moved");
      return;
    }

    if (Platform.OS === "ios") {
      // On iOS, use Sharing API to preview the file
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          UTI: getIosUTI(fileType, fileName),
          dialogTitle: `Open ${fileName}`,
        });
      } else {
        // Fallback to WebBrowser for common web viewable types
        const fileExtension = fileName.split(".").pop().toLowerCase();
        const webViewable = ["pdf", "jpg", "jpeg", "png", "gif"].includes(
          fileExtension
        );

        if (webViewable) {
          await WebBrowser.openBrowserAsync(fileUri);
        } else {
          Alert.alert("Error", "Cannot open this file type");
        }
      }
    } else if (Platform.OS === "android") {
      // On Android, we need to handle the FileUriExposedException

      // First try the Sharing API which handles permissions correctly
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: fileType || "application/octet-stream",
          dialogTitle: `Open ${fileName}`,
        });
        return;
      }

      // If we need direct file opening (not sharing)
      // First save to MediaLibrary for images and videos
      if (
        fileType &&
        (fileType.startsWith("image/") || fileType.startsWith("video/"))
      ) {
        try {
          // Get permission
          const { status } = await MediaLibrary.requestPermissionsAsync();
          if (status === "granted") {
            // Save file to media library
            const asset = await MediaLibrary.createAssetAsync(fileUri);
            // Open the asset
            if (asset) {
              await MediaLibrary.openAssetAsync(asset);
              return;
            }
          }
        } catch (mediaError) {
          console.log("Media library error, trying fallback:", mediaError);
        }
      }

      // For other file types, try a more general approach
      try {
        // For managed workflow apps, copy file to cache directory first
        const fileExt = fileName.split(".").pop().toLowerCase();
        const destFile = `${
          FileSystem.cacheDirectory
        }temp_${Date.now()}.${fileExt}`;

        await FileSystem.copyAsync({
          from: fileUri,
          to: destFile,
        });

        const contentUri = FileSystem.getContentUriAsync(destFile);

        // Open with appropriate app
        await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
          data: await contentUri,
          flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
          type: fileType || "application/octet-stream",
        });
      } catch (intentError) {
        // Final fallback
        Alert.alert(
          "Cannot Open File",
          "Would you like to share this file instead?",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Share File",
              onPress: async () => {
                try {
                  await Sharing.shareAsync(fileUri);
                } catch (shareError) {
                  Alert.alert("Error", "Failed to share file");
                }
              },
            },
          ]
        );
      }
    } else {
      Alert.alert("Error", "Opening files is not supported on this platform");
    }
  } catch (error) {
    console.error("Error opening file:", error);
    Alert.alert("Error", "Failed to open file. Try sharing instead.");

    // Try to share as fallback
    try {
      await Sharing.shareAsync(fileUri);
    } catch (shareError) {
      console.error("Share fallback error:", shareError);
    }
  }
};

// Helper function to determine iOS UTI based on file type
function getIosUTI(mimeType, fileName) {
  const ext = fileName.split(".").pop().toLowerCase();

  // Common UTI mappings
  const utiMap = {
    pdf: "com.adobe.pdf",
    jpg: "public.jpeg",
    jpeg: "public.jpeg",
    png: "public.png",
    gif: "com.compuserve.gif",
    doc: "com.microsoft.word.doc",
    docx: "org.openxmlformats.wordprocessingml.document",
    xls: "com.microsoft.excel.xls",
    xlsx: "org.openxmlformats.spreadsheetml.sheet",
    ppt: "com.microsoft.powerpoint.ppt",
    pptx: "org.openxmlformats.presentationml.presentation",
    txt: "public.plain-text",
    html: "public.html",
    mp3: "public.mp3",
    mp4: "public.mpeg-4",
    mov: "com.apple.quicktime-movie",
    zip: "com.pkware.zip-archive",
  };

  // Return specific UTI based on extension if available
  if (ext in utiMap) {
    return utiMap[ext];
  }

  // Return general UTI based on mime type category
  if (mimeType) {
    if (mimeType.startsWith("image/")) return "public.image";
    if (mimeType.startsWith("video/")) return "public.movie";
    if (mimeType.startsWith("audio/")) return "public.audio";
    if (mimeType.startsWith("text/")) return "public.text";
  }

  // Default
  return "public.data";
}
