import { View, Text } from "react-native";
import { Link } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { LinkText } from "@/components/LinkText";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
export default function HomeScreen() {
  const { user } = useUser();
  return (
    <View className="flex-1 h-full w-full bg-red-400 justify-center items-center">
      <ThemedText type="title">Home</ThemedText>
      <LinkText to="/details/1">View first user details</LinkText>
      <LinkText to="/details/2">View second user details</LinkText>
      <SignedIn>
        <Text>Hello {user?.emailAddresses[0].emailAddress}</Text>
        {/* <Text>{JSON.stringify(user)}</Text> */}
      </SignedIn>
      <SignedOut>
        <Link href="/(auth)/sign-in">
          <Text>Sign in</Text>
        </Link>
      </SignedOut>
    </View>
  );
}
