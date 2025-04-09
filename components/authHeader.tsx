import { View, Image, StyleSheet, useColorScheme, Text, Pressable } from "react-native";
import { useRouter, useSegments } from "expo-router";

export default function AuthHeader() {
    const router = useRouter();
    const colorScheme = useColorScheme();



    const themeProvider = colorScheme === 'light' ? stylesLightMode : stylesDarkMode;
    const thinksharelogoIcon = colorScheme === 'light' 
        ? require('../assets/icons/white-mode-3x.png') 
        : require('../assets/icons/dark-mode-3x.png');

    return (
        <View style={[themeProvider.container]}>
            <Pressable onPress={() => router.push("/")} style={themeProvider.cancelButton}>
                <Text style={themeProvider.cancelText}>Cancel</Text>
            </Pressable>
            {/* Logo */}
            <Image style={[themeProvider.imageLogo]} source={thinksharelogoIcon} />
        </View>
    );
}

const stylesLightMode = StyleSheet.create({
    container: {
        height: 90,
        width: '100%',
        backgroundColor: '#fff',
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 15,
    },
    imageLogo: {
        height: 50,
        width: 50,
        resizeMode: 'contain',
    },
    cancelButton: {
        position: 'absolute',
        left: 15,
        top: 20,
        paddingVertical: 10,
        alignSelf: 'flex-start', // Align cancel button to the left
        justifyContent: 'flex-start',
    },
    cancelText: {
        fontSize: 16,
        fontFamily: 'nunitoBold',
        color: '#000',
    }
});

const stylesDarkMode = StyleSheet.create({
    ...stylesLightMode,
    container: {
        ...stylesLightMode.container,
        backgroundColor: '#111827',
    },
    cancelText: {
        fontSize: 16,
        color: '#F9FAFB',
    }
});
