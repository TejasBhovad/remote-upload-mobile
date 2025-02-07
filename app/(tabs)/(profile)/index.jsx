import { Link } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
export default function ProfilePage() {
  return (
    <View style={styles.container}>
      <ThemedText type="title">Profile</ThemedText>
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
