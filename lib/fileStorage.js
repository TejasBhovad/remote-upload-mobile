import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

// Define the directory for storing files
const FILE_DIRECTORY = `${FileSystem.documentDirectory}files/`;

// Create our files directory if it doesn't exist
const setupFileDirectory = async () => {
  const dirInfo = await FileSystem.getInfoAsync(FILE_DIRECTORY);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(FILE_DIRECTORY, {
      intermediates: true,
    });
  }
};

// Initialize the directory when the module is imported
setupFileDirectory();

export const FileStorage = {
  // Save a file locally with metadata
  saveFile: async (fileUri, fileName, fileType) => {
    try {
      // Ensure directory exists
      await setupFileDirectory();

      // Generate a unique ID for the file
      const fileId = Date.now().toString();

      // Determine the local destination path
      const localUri = `${FILE_DIRECTORY}${fileId}_${fileName}`;

      // Copy the file to our app's documents directory
      await FileSystem.copyAsync({
        from: fileUri,
        to: localUri,
      });

      // Create metadata for the file
      const metadata = {
        id: fileId,
        name: fileName,
        type: fileType,
        uri: localUri,
        dateAdded: new Date().toISOString(),
        shared: false,
      };

      // Add to our local file registry
      await addFileToRegistry(metadata);

      return metadata;
    } catch (error) {
      console.error("Error saving file:", error);
      throw error;
    }
  },

  // Get all stored files
  getFiles: async () => {
    try {
      // Ensure directory exists
      await setupFileDirectory();

      // Get file registry or initialize it
      return await getFileRegistry();
    } catch (error) {
      console.error("Error getting files:", error);
      return [];
    }
  },

  // Delete a file by ID
  deleteFile: async (fileId) => {
    try {
      const files = await getFileRegistry();
      const fileToDelete = files.find((file) => file.id === fileId);

      if (!fileToDelete) {
        throw new Error("File not found");
      }

      // Delete the actual file
      await FileSystem.deleteAsync(fileToDelete.uri);

      // Update the registry
      const updatedFiles = files.filter((file) => file.id !== fileId);
      await saveFileRegistry(updatedFiles);

      return updatedFiles;
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  },

  // Mark a file as shared/emailed
  markFileAsShared: async (fileId) => {
    try {
      const files = await getFileRegistry();
      const updatedFiles = files.map((file) => {
        if (file.id === fileId) {
          return {
            ...file,
            shared: true,
            lastShared: new Date().toISOString(),
          };
        }
        return file;
      });

      await saveFileRegistry(updatedFiles);
      return updatedFiles;
    } catch (error) {
      console.error("Error marking file as shared:", error);
      throw error;
    }
  },

  // Share a file using the native sharing dialog
  shareFile: async (fileId) => {
    try {
      const files = await getFileRegistry();
      const fileToShare = files.find((file) => file.id === fileId);

      if (!fileToShare) {
        throw new Error("File not found");
      }

      // Check if sharing is available
      if (!(await Sharing.isAvailableAsync())) {
        throw new Error("Sharing is not available on this device");
      }

      // Share the file
      await Sharing.shareAsync(fileToShare.uri, {
        mimeType: fileToShare.type,
        dialogTitle: `Share ${fileToShare.name}`,
      });

      // Mark as shared
      await FileStorage.markFileAsShared(fileId);

      return true;
    } catch (error) {
      console.error("Error sharing file:", error);
      throw error;
    }
  },
};

// Helper functions for file registry
const FILE_REGISTRY_KEY = "file_registry.json";
const FILE_REGISTRY_PATH = `${FileSystem.documentDirectory}${FILE_REGISTRY_KEY}`;

const getFileRegistry = async () => {
  try {
    const registryExists = await FileSystem.getInfoAsync(FILE_REGISTRY_PATH);

    if (!registryExists.exists) {
      await saveFileRegistry([]);
      return [];
    }

    const content = await FileSystem.readAsStringAsync(FILE_REGISTRY_PATH);
    return JSON.parse(content);
  } catch (error) {
    console.error("Error reading file registry:", error);
    return [];
  }
};

const saveFileRegistry = async (files) => {
  try {
    await FileSystem.writeAsStringAsync(
      FILE_REGISTRY_PATH,
      JSON.stringify(files)
    );
    return true;
  } catch (error) {
    console.error("Error saving file registry:", error);
    return false;
  }
};

const addFileToRegistry = async (fileMetadata) => {
  const files = await getFileRegistry();
  files.unshift(fileMetadata); // Add new file to the beginning of the array
  await saveFileRegistry(files);
  return files;
};
