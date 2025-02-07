import { Link } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { LinkText } from "@/components/LinkText";
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <ThemedText type="title">Home</ThemedText>
      <LinkText to="/details/1">View first user details</LinkText>
      <LinkText to="/details/2">View second user details</LinkText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
