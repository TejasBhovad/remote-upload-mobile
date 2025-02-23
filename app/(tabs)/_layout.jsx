import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

const TabIcon = ({ name, color, focused }) => {
  if (Platform.OS === "ios") {
    const iosIconMap = {
      house: focused ? "house.fill" : "house",
      clock: focused ? "clock.fill" : "clock",
      qrcode: focused ? "qrcode.viewfinder" : "qrcode", // Updated iOS SF Symbol name
      "arrow.up.circle": focused ? "arrow.up.circle.fill" : "arrow.up.circle",
      "person.circle": focused ? "person.circle.fill" : "person.circle",
    };

    return (
      <IconSymbol size={28} name={iosIconMap[name] || name} color={color} />
    );
  }
  const iconMap = {
    house: "home",
    clock: "time",
    qrcode: "qr-code",
    "arrow.up.circle": "cloud-upload",
    "person.circle": "person-circle",
  };

  return (
    <Ionicons
      size={28}
      name={`${iconMap[name]}${focused ? "" : "-outline"}`}
      color={color}
    />
  );
};

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? "light";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors[colorScheme].tint,
        tabBarInactiveTintColor: Colors[colorScheme].tabIconDefault,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
            backgroundColor: Colors[colorScheme].background,
            borderTopColor: Colors[colorScheme].border,
          },
          default: {
            position: "absolute",
            backgroundColor: Colors[colorScheme].background,
            borderTopColor: Colors[colorScheme].border,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: "Home",
          tabBarIcon: (props) => <TabIcon name="house" {...props} />,
        }}
      />
      <Tabs.Screen
        name="(recent)"
        options={{
          title: "Recent",
          tabBarIcon: (props) => <TabIcon name="clock" {...props} />,
        }}
      />
      <Tabs.Screen
        name="(scan)"
        options={{
          title: "Scan",
          tabBarIcon: (props) => <TabIcon name="qrcode" {...props} />,
        }}
      />
      <Tabs.Screen
        name="(upload)"
        options={{
          title: "Upload",
          tabBarIcon: (props) => <TabIcon name="arrow.up.circle" {...props} />,
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: "Profile",
          tabBarIcon: (props) => <TabIcon name="person.circle" {...props} />,
        }}
      />
    </Tabs>
  );
}
