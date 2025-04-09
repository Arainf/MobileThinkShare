import {
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    useColorScheme,
    TextInput,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
  } from "react-native";
  import { useNavigation, Link, useRouter } from "expo-router";
  import { useEffect, useMemo } from "react";
  
  export default function Login() {
    const colorScheme = useColorScheme();
    const router = useRouter();
    const navigation = useNavigation();
  
    useEffect(() => {
      navigation.setOptions({ headerShown: true });
    }, [navigation]);
  
    // Select theme dynamically
    const theme = useMemo(() => (colorScheme === "light" ? styles.light : styles.dark), [colorScheme]);
  
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={theme.container}>
            <View style={theme.textContainer}>
              <Text style={theme.header}>Welcome Back!</Text>
              <Text style={theme.subheader}>There's a lot to catch up to.</Text>
            </View>
  
            <View style={theme.credentialsContainer}>
              <View style={theme.textInputContainer}>
                <TextInput
                  style={theme.textInput}
                  placeholder="Phone, email, or username"
                  placeholderTextColor="#8E8E8E"
                  autoCapitalize="none"
                />
                <TextInput
                  style={theme.textInput}
                  placeholder="Password"
                  placeholderTextColor="#8E8E8E"
                  secureTextEntry={true}
                  autoCapitalize="none"
                />
              </View>
  
              <Text style={theme.text}>
                No Account?{" "}
                <Link href="/authentication/register" style={theme.link}>
                  Create one here
                </Link>
              </Text>
            </View>
  
            <View style={theme.footer}>
              <Text style={theme.text}>Forgot your password?</Text>
              <TouchableOpacity
  onPress={() => router.push("/feed")}
  style={theme.button}
>
  <Text style={theme.buttonText}>Login</Text>
</TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
  
  // ======== Styles ======== //
  const baseStyles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "flex-start",
      width: "100%",
      justifyContent: "center",
      gap: 40,
    },
    textContainer: {
      flex: 0.2,
      marginHorizontal: "8%",
      marginTop: 20,
      alignItems: "flex-start",
      justifyContent: "flex-start",
    },
    header: {
      fontFamily: "nunitoExtraBold",
      fontSize: 35,
    },
    subheader: {
      fontFamily: "nunitoBold",
      fontSize: 18,
    },
    credentialsContainer: {
      flex: 1,
      alignItems: "flex-start",
      justifyContent: "flex-start",
      width: "100%",
      paddingHorizontal: "8%",
      gap: 15,
    },
    textInputContainer: {
      width: "100%",
      gap: 20,
    },
    textInput: {
      fontSize: 16,
      marginBottom: 10,
      paddingBottom: 10,
      borderBottomColor: "#8E8E8E",
      borderBottomWidth: 2,
      width: "100%",
    },
    buttonContainer: {
      flex: 1,
      alignItems: "center",
      width: "100%",
      gap: 10,
      marginBottom: -20,
    },
    button: {
      flexDirection: "row",
      gap: 10,
      width: "30%",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 50,
      paddingVertical: 10,
      elevation: 8,
    },
    buttonText: {
      fontSize: 14,
      fontFamily: "nunitoBold",
    },
    buttonLogo: {
      width: 20,
      height: 20,
    },
    separatorContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 35,
    },
    separatorLine: {
      width: 120,
      height: 2,
    },
    separatorText: {
      marginHorizontal: 10,
    },
    text: {
      width: "80%",
      fontFamily: "nunitoRegular",
      fontSize: 13,
    },
    link: {
      fontFamily: "nunitoBold",
    },
    agreement: {
      fontSize: 10,
      width: "80%",
      fontFamily: "nunitoRegular",
    },
    footer: {
      flex: 0.5,
      flexDirection: "row",
      alignContent: "center",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      paddingHorizontal: "9%",
    },
  });
  
  // ======= Light & Dark Theme ======= //
  const styles = {
    light: StyleSheet.create({
      ...baseStyles,
      container: { ...baseStyles.container, backgroundColor: "#fff" },
      header: { ...baseStyles.header, color: "#374151" },
      subheader: { ...baseStyles.subheader, color: "#374151" },
      button: { ...baseStyles.button, backgroundColor: "#3b82f6" },
      buttonText: { ...baseStyles.buttonText, color: "#000" },
      separatorLine: { ...baseStyles.separatorLine, backgroundColor: "#8E8E8E" },
      separatorText: { ...baseStyles.separatorText, color: "#8E8E8E" },
      text: { ...baseStyles.text, color: "#2A3547" },
      link: { ...baseStyles.link, color: "#009DFF" },
    }),
    dark: StyleSheet.create({
      ...baseStyles,
      container: { ...baseStyles.container, backgroundColor: "#111827" },
      header: { ...baseStyles.header, color: "#F9FAFB" },
      subheader: { ...baseStyles.subheader, color: "#F9FAFB" },
      button: { ...baseStyles.button, backgroundColor: "#8B5CF6" },
      buttonText: { ...baseStyles.buttonText, color: "#F9FAFB" },
      separatorLine: { ...baseStyles.separatorLine, backgroundColor: "#2A3547" },
      separatorText: { ...baseStyles.separatorText, color: "#2A3547" },
      text: { ...baseStyles.text, color: "#b4b4b4" },
      link: { ...baseStyles.link, color: "#8B5CF6" },
    }),
  };