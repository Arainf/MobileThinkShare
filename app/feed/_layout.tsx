import { Stack } from "expo-router";
import FeedHeader from "@/components/feedHeader";
import { Ionicons } from "@expo/vector-icons";


export default function FeedLayout() {
  return (
    <Stack
      screenOptions={{
        header: () => <FeedHeader />,
        animation: "slide_from_right" // Use the custom header 
      }}
    >
      <Stack.Screen
        name="index"
      />
      <Stack.Screen
        name="notifications"
      />
      <Stack.Screen
        name="profile"
      />
    </Stack>
  );
}