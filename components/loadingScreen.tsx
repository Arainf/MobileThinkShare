import LottieView from "lottie-react-native";
import { View } from "react-native";

export default function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <LottieView
        source={require("../assets/animation/Animation - 1744164613483.json")} // Replace with your animation file
        autoPlay
        loop
        style={{ width: 100, height: 100 }}
      />
    </View>
  );
}
