import { Link } from "expo-router";
import { View, Text, StyleSheet } from "react-native";

export default function ScanPage() {
  return (
    <View style={styles.container}>
      <Text>Scan</Text>
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
