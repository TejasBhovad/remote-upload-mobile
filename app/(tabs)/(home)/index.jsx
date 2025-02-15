import { View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { LinkText } from "@/components/LinkText";

export default function HomeScreen() {
  return (
    <View className="flex-1 h-full w-full bg-red-400 justify-center items-center">
      <ThemedText type="title">Home</ThemedText>
      <LinkText to="/details/1">View first user details</LinkText>
      <LinkText to="/details/2">View second user details</LinkText>
    </View>
  );
}
