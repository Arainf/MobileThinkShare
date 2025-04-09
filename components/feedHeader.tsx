import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSegments, useNavigation } from "expo-router";

export default function FeedHeader() {
  const segments = useSegments();
  const navigation = useNavigation();

  // Determine the title based on the current route
  const title = (() => {
    if (segments[1] === "notifications") return "Notifications";
    if (segments[1] === "profile") return "Profile";
    return "Home"; // Default title
  })();

  // Check if the current page is not the home page
  const isHomePage = segments.length === 1 || segments[1] === "index";

  return (
    <View style={styles.container}>
      {/* Back Button or Profile Icon */}
      <View style={styles.leftContainer}>
        {!isHomePage ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back-outline" size={24} color="#374151" />
            <Text style={styles.backText}>Home</Text>
          </TouchableOpacity>
        ) : (
            <View style={styles.iconContainer}>
              <TouchableOpacity onPress={() => navigation.navigate("profile")}>
                <View style={styles.profileContainer}>
                  <Text style={styles.profileText}>AF</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity>
                <Ionicons name="notifications" size={24} color="#374151" style={styles.iconSpacing} />
              </TouchableOpacity>
            </View>
          
        )}
      </View>

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Icons */}
      <View style={styles.iconContainer}>
        <TouchableOpacity>
          <Ionicons name="search-outline" size={24} color="#374151" style={styles.iconSpacing} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="grid-outline" size={24} color="#374151" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#374151",
    fontWeight: "bold",
  },
  profileContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
  },
  profileText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#374151",
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  iconSpacing: {
    marginHorizontal: 12,
  },
});