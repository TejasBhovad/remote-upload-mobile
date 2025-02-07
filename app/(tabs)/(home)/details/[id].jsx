import { useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
export default function DetailsScreen() {
  const { id } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <ThemedText type="title">Details</ThemedText>
      <ThemedText type="body">ID: {id}</ThemedText>
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
