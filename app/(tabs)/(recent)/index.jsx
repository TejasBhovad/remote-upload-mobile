import { Link } from "expo-router";
import { View, Text, StyleSheet } from "react-native";

export default function RecentPage() {
  return (
    <View style={styles.container}>
      <Text>Recent</Text>
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
