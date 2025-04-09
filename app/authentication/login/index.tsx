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
    Alert,
  } from "react-native";
  import { useRouter } from "expo-router";
  import { useState } from "react";
import { supabase } from "../../../config/supabaseClient";
  
  export default function Login() {
    const colorScheme = useColorScheme();
    const router = useRouter();
  
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
  
    // Handle email/password login
    const handleLogin = async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
  
      if (error) {
        Alert.alert("Login Failed", error.message);
      } else {
        router.push("/feed");
      }
    };
  
    const theme = colorScheme === "light" ? styles.light : styles.dark;
  
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
              <Text style={theme.subheader}>Log in to your account</Text>
            </View>
  
            <View style={theme.credentialsContainer}>
              <View style={theme.textInputContainer}>
                <TextInput
                  style={theme.textInput}
                  placeholder="Email"
                  placeholderTextColor="#8E8E8E"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
                <TextInput
                  style={theme.textInput}
                  placeholder="Password"
                  placeholderTextColor="#8E8E8E"
                  secureTextEntry={true}
                  autoCapitalize="none"
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
  
              <TouchableOpacity onPress={handleLogin} style={theme.button}>
                <Text style={theme.buttonText}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
  
  // Add your styles here (same as before)
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