import React, { useState, useEffect, useRef } from "react";
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
  Dimensions,
  StyleSheet,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useUser } from "@clerk/clerk-expo";
import { MaterialIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import {
  storeFiles,
  getFiles,
  checkCode,
  deleteFiles,
} from "@/app/api/fileService";

export default function ScanPage() {
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const { user } = useUser();
  const colorScheme = useColorScheme() ?? "light";
  const windowWidth = Dimensions.get("window").width;
  const scannerSize = windowWidth - 32;

  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [codeExists, setCodeExists] = useState(null);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState("2025-03-01 13:35:28");
  const [scanning, setScanning] = useState(true);
  const [scanResult, setScanResult] = useState(null);
  const [scanned, setScanned] = useState(false);
  const cameraRef = useRef(null);

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  const handleOpenFile = (url) => {
    Linking.openURL(url).catch((err) => {
      console.error("Error opening URL:", err);
      Alert.alert("Error", "Could not open the file");
    });
  };

  const renderFileItem = (file, index) => {
    return (
      <TouchableOpacity
        key={index}
        onPress={() => handleOpenFile(file.url)}
        className="mb-3"
      >
        <View
          className="bg-muted rounded-lg p-4"
          style={{
            backgroundColor: Colors[colorScheme].muted,
          }}
        >
          <View className="flex-row justify-between items-center">
            <View>
              <Text
                className="text-lg font-semibold"
                style={{
                  color: Colors[colorScheme].text,
                }}
              >
                {file.name || `File ${index + 1}`}
              </Text>
              <Text
                className="text-sm"
                style={{
                  color: Colors[colorScheme].icon,
                }}
              >
                Tap to open
              </Text>
            </View>
            <View
              className="px-2 py-1 rounded-lg flex-row items-center"
              style={{
                backgroundColor: Colors[colorScheme].tint,
              }}
            >
              <MaterialIcons
                name="file-download"
                size={16}
                color={Colors[colorScheme].text}
                style={{ marginRight: 8 }}
              />
              <Text
                className="text-xs"
                style={{
                  color: Colors[colorScheme].text,
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

  const toggleScanMode = () => {
    setScanning(!scanning);
    setScanned(false);
  };

  const handleRescan = () => {
    setScanned(false);
  };
  useEffect(() => {
    console.log("Code state changed:", code);
  }, [code]);
  const handleBarCodeScanned = ({ type, data }) => {
    if (scanned) return;

    setScanned(true);

    console.log("Scanned data:", data);

    let extractedCode = data;

    if (data && data.includes("/")) {
      const afterSlash = data.split("/").pop();
      console.log("After slash:", afterSlash);

      if (/^\d{4}$/.test(afterSlash)) {
        extractedCode = afterSlash;
        console.log("Using afterSlash as code:", extractedCode);
      } else {
        const lastFour = data.slice(-4);
        console.log("Last four characters:", lastFour);
        if (/^\d{4}$/.test(lastFour)) {
          extractedCode = lastFour;
          console.log("Using last four digits as code:", extractedCode);
        }
      }
    }

    setScanResult({ type, data, extractedCode });
    console.log("Extracted code:", extractedCode);
    if (
      extractedCode &&
      extractedCode.length === 4 &&
      /^\d{4}$/.test(extractedCode)
    ) {
      console.log("Valid 4-digit code found:", extractedCode);

      setCode(extractedCode);
      setScanning(false);
      setTimeout(() => {
        console.log("Calling handleGetFiles with code:", extractedCode);
        handleGetFilesWithCode(extractedCode);
      }, 500);
    } else {
      console.log("Invalid code format:", extractedCode);
      Alert.alert(
        "Invalid QR Code",
        `Could not find a valid 4-digit code in this QR code (got ${extractedCode}). Please try again or enter the code manually.`,
        [{ text: "OK" }]
      );
    }
  };

  const handleGetFilesWithCode = async (codeToUse) => {
    console.log("handleGetFilesWithCode called with code:", codeToUse);

    if (!codeToUse) {
      console.log("Code is empty");
      setError("Please enter a code");
      return;
    }

    if (codeToUse.length !== 4) {
      console.log("Code length is not 4:", codeToUse.length);
      setError("Please enter a 4-digit code");
      return;
    }

    if (!/^\d{4}$/.test(codeToUse)) {
      console.log("Code is not numeric:", codeToUse);
      setError("Please enter a valid 4-digit code");
      return;
    }

    setIsLoading(true);
    setError("");
    setCodeExists(null);
    try {
      console.log("Calling getFiles API with code:", codeToUse);
      const result = await getFiles(codeToUse);
      console.log("API response:", result);

      if (result && result.files && result.files.length > 0) {
        console.log("Files found:", result.files.length);
        setFiles(result.files);
        setCodeExists(true);
      } else {
        console.log("No files found for code:", codeToUse);
        setError("No files found for this code");
        setCodeExists(false);
        setFiles([]);
      }
    } catch (error) {
      console.error("API error:", error);
      setError(error.message || "Failed to get files");
      setCodeExists(false);
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetFiles = async () => {
    handleGetFilesWithCode(code);
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
          Scan Code
        </Text>

        {scanning ? (
          <View className="items-center mb-6">
            <View
              className="overflow-hidden mb-4 rounded-lg"
              style={{
                width: scannerSize,
                height: scannerSize,
                position: "relative",
              }}
            >
              {permission?.granted ? (
                <View
                  style={{
                    width: scannerSize,
                    height: scannerSize,
                    position: "relative",
                  }}
                >
                  <CameraView
                    style={StyleSheet.absoluteFill}
                    facing={facing}
                    ref={cameraRef}
                    onBarcodeScanned={
                      scanned ? undefined : handleBarCodeScanned
                    }
                    barcodeScannerSettings={{
                      barcodeTypes: ["qr"],
                    }}
                  />

                  <View style={StyleSheet.absoluteFill}>
                    <View className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-white" />
                    <View className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-white" />
                    <View className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-white" />
                    <View className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-white" />

                    <View
                      className="absolute left-0 right-0 h-0.5"
                      style={{
                        top: scannerSize / 2,
                        backgroundColor: Colors[colorScheme].tint,
                        opacity: 0.8,
                      }}
                    />
                  </View>
                </View>
              ) : (
                <View
                  className="items-center justify-center"
                  style={{
                    width: scannerSize,
                    height: scannerSize,
                    backgroundColor: Colors[colorScheme].muted,
                    borderRadius: 8,
                  }}
                >
                  <MaterialIcons
                    name="camera-alt"
                    size={64}
                    style={{
                      color: Colors[colorScheme].text,
                      marginBottom: 16,
                    }}
                  />
                  <Text
                    className="text-lg font-medium text-center px-4 mb-2"
                    style={{ color: Colors[colorScheme].text }}
                  >
                    Camera access needed
                  </Text>
                  <Text
                    className="text-sm text-center px-8 mb-6"
                    style={{ color: Colors[colorScheme].icon }}
                  >
                    We need permission to use your camera to scan QR codes
                  </Text>
                  <TouchableOpacity
                    className="px-6 py-3 rounded-full flex-row items-center"
                    style={{ backgroundColor: Colors[colorScheme].tint }}
                    onPress={requestPermission}
                  >
                    <MaterialIcons
                      name="lock-open"
                      size={20}
                      color={Colors[colorScheme].text}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      className="text-base font-medium"
                      style={{ color: Colors[colorScheme].text }}
                    >
                      Grant Permission
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View className="flex-row justify-center space-x-4 mt-2">
              {permission?.granted && (
                <>
                  <TouchableOpacity
                    className="px-4 py-3 rounded-md flex-row items-center justify-center"
                    style={{
                      backgroundColor: Colors[colorScheme].muted,
                    }}
                    onPress={toggleCameraFacing}
                  >
                    <MaterialIcons
                      name="flip-camera-ios"
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
                      Flip Camera
                    </Text>
                  </TouchableOpacity>

                  {scanned && (
                    <TouchableOpacity
                      className="px-4 py-3 rounded-md flex-row items-center justify-center"
                      style={{
                        backgroundColor: Colors[colorScheme].tint,
                      }}
                      onPress={handleRescan}
                    >
                      <MaterialIcons
                        name="refresh"
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
                        Scan Again
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              )}

              <TouchableOpacity
                className="px-4 py-3 rounded-md flex-row items-center justify-center"
                style={{
                  backgroundColor: Colors[colorScheme].tint,
                }}
                onPress={toggleScanMode}
              >
                <MaterialIcons
                  name="keyboard"
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
                  Enter Code
                </Text>
              </TouchableOpacity>
            </View>

            <View className="mt-4">
              <Text
                className="text-center text-sm"
                style={{ color: Colors[colorScheme].icon }}
              >
                {scanned
                  ? "QR code detected! Tap 'Scan Again' to scan another code"
                  : "Position QR code within the frame to scan"}
              </Text>
            </View>
          </View>
        ) : (
          <View
            className="rounded-lg p-4 mb-4"
            style={{
              backgroundColor: Colors[colorScheme].muted,
            }}
          >
            <View className="flex-row justify-between mb-4">
              <Text
                className="text-lg font-semibold"
                style={{
                  color: Colors[colorScheme].text,
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
                onPress={handleGetFiles}
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

            <TouchableOpacity
              className="mt-4 p-3 rounded-md items-center flex-row justify-center"
              style={{
                backgroundColor: Colors[colorScheme].muted,
                borderWidth: 1,
                borderColor: Colors[colorScheme].border,
              }}
              onPress={toggleScanMode}
            >
              <MaterialIcons
                name="qr-code-scanner"
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
                Scan QR Code
              </Text>
            </TouchableOpacity>

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
        )}

        {codeExists && files.length > 0 && (
          <View
            className="rounded-lg p-4 mb-6"
            style={{
              backgroundColor: Colors[colorScheme].muted,
            }}
          >
            <View className="flex-row justify-between mb-4">
              <View className="flex-row items-center">
                <View
                  className="w-1 h-4 rounded mr-2"
                  style={{
                    backgroundColor: Colors[colorScheme].tint,
                  }}
                />
                <Text
                  className="text-lg font-semibold"
                  style={{
                    color: Colors[colorScheme].text,
                  }}
                >
                  Files Found
                </Text>
              </View>
            </View>

            {files.map((file, index) => renderFileItem(file, index))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
