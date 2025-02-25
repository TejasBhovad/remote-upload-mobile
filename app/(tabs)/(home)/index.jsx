import React from "react";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { Link } from "expo-router";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

const FileItem = ({ name, time, colorScheme }) => (
  <View
    style={{
      backgroundColor: Colors[colorScheme].muted,
      borderRadius: 8,
      padding: 16,
      marginBottom: 12,
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
          {name}
        </Text>
        <Text
          style={{
            color: Colors[colorScheme].icon,
            fontSize: 14,
          }}
        >
          Delivered {time}
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
          name="email"
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
          Email sent
        </Text>
      </View>
    </View>
  </View>
);

export default function HomeScreen() {
  const { user } = useUser();
  const email = user?.emailAddresses[0]?.emailAddress || "johndoe@gmail.com";
  const colorScheme = useColorScheme() ?? "light";

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
          Morning,{" "}
          <Text
            style={{ color: Colors[colorScheme].tint }}
            className="font-bold"
          >
            {user?.fullName || "John Doe"}
          </Text>
        </Text>

        {/* What's New Card */}
        <View
          style={{
            backgroundColor: Colors[colorScheme].muted,
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <View className="flex-row items-center">
            <View
              style={{
                width: 4,
                height: 4,
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
              What's New
            </Text>
          </View>
          <Text
            style={{
              color: Colors[colorScheme].icon,
              fontSize: 14,
              marginTop: 8,
            }}
          >
            Updated Email format to include filename
          </Text>
        </View>

        {/* Stats Card */}
        <View
          style={{
            backgroundColor: Colors[colorScheme].tint,
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              color: Colors[colorScheme].text,
              fontSize: 18,
              marginBottom: 8,
            }}
          >
            No. of files shared
          </Text>
          <Text
            style={{
              color: Colors[colorScheme].text,
              fontSize: 48,
              fontWeight: "bold",
            }}
          >
            21
          </Text>
        </View>

        {/* Account Type */}
        <View
          style={{
            backgroundColor: Colors[colorScheme].background,
            borderRadius: 8,
            // padding: 16,
            marginBottom: 24,
          }}
        >
          <View
            className="flex-row justify-between rounded-md p-4 items-center"
            backgroundColor={Colors[colorScheme].muted}
          >
            <View className="flex-row items-center">
              <MaterialCommunityIcons
                name="crown"
                size={24}
                color={Colors[colorScheme].icon}
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  color: Colors[colorScheme].icon,
                  fontSize: 18,
                }}
              >
                Free Tier
              </Text>
            </View>
            <View>
              <Text
                style={{
                  color: Colors[colorScheme].text,
                  fontSize: 14,
                  marginBottom: 4,
                }}
              >
                Selected Email
              </Text>
              <Text
                style={{
                  color: Colors[colorScheme].icon,
                  fontSize: 14,
                }}
              >
                {email}
              </Text>
            </View>
          </View>
        </View>

        {/* Recent Files */}
        <View style={{ marginBottom: 24 }}>
          <View className="flex-row justify-between items-center mb-4">
            <Text
              style={{
                color: Colors[colorScheme].text,
                fontSize: 24,
                fontWeight: "bold",
              }}
            >
              Recent Files
            </Text>
            <Pressable>
              <Text
                style={{
                  color: Colors[colorScheme].icon,
                  fontSize: 14,
                }}
              >
                explore more
              </Text>
            </Pressable>
          </View>

          <FileItem
            name="File Name #1"
            time="10 minutes ago"
            colorScheme={colorScheme}
          />
          <FileItem
            name="File Name #1"
            time="10 minutes ago"
            colorScheme={colorScheme}
          />
        </View>

        {/* Auth States */}
        {/* <SignedIn>
          <Text
            style={{
              color: Colors[colorScheme].text,
              fontSize: 14,
            }}
          >
            Hello {email}
          </Text>
        </SignedIn>
        <SignedOut>
          <Link href="/(auth)/sign-in">
            <Text
              style={{
                color: Colors[colorScheme].text,
                fontSize: 14,
              }}
            >
              Sign in
            </Text>
          </Link>
        </SignedOut> */}
      </ScrollView>
    </SafeAreaView>
  );
}
