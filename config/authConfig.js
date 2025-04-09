import { Platform } from "react-native";

export const GOOGLE_CLIENT_ID = Platform.select({
  ios: process.env.GOOGLE_CLIENT_ID_IOS,
  android: process.env.GOOGLE_CLIENT_ID_ANDROID,
  default: process.env.GOOGLE_CLIENT_ID_WEB,
});