import { Stack, useSegments } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Modal, View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";
import Header from "@/components/header";
import AuthHeader from "@/components/authHeader";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loading, setLoading] = useState(false);
  const segment = useSegments() || [];
  const [loaded, error] = useFonts({
    nunitoExtraBold: require("../assets/fonts/Nunito/static/Nunito-ExtraBold.ttf"),
    nunitoBold: require("../assets/fonts/Nunito/static/Nunito-Bold.ttf"),
    nunitoRegular: require("../assets/fonts/Nunito/static/Nunito-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  useEffect(() => {
    // Disable loading for the "feed" section
    if (segment[0] === "feed") {
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timeout);
  }, [segment]);

  if (!loaded) {
    return null;
  }

  if (error) {
    console.error("Font loading error:", error);
    return null;
  }

  return (
    <>
      {/* Modal for Loading Screen */}
      {loading && (
        <Modal visible={loading} animationType="fade" transparent>
          <View style={styles.modalContainer}>
            <LottieView
              source={require("../assets/animation/Animation - 1744164613483.json")} // Replace with your animation file
              autoPlay
              loop
              style={{ width: 100, height: 100 }}
            />
          </View>
        </Modal>
      )}

      {/* Main Stack Navigator */}
      <Stack
        screenOptions={{
          header: () => {
            // Exclude headers for the "feed" section
            if (segment[0] === "feed") {
              return null;
            }
            // Show AuthHeader for authentication routes
            if (segment[0] === "authentication") {
              return <AuthHeader />;
            }
            // Show default Header for other routes
            return <Header />;
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="authentication/login/index" />
        <Stack.Screen name="authentication/register/index" />
        <Stack.Screen name="feed/index" />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
    justifyContent: "center",
    alignItems: "center",
  },
});