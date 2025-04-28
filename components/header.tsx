import {View, Image, StyleSheet, useColorScheme, Text, Pressable} from 'react-native'

export default function DefaultHeader() {
	const colorScheme = useColorScheme()

	const themeProvider = colorScheme === 'light' ? stylesLightMode : stylesDarkMode
	const thinksharelogoIcon =
		colorScheme === 'light'
			? require('../assets/icons/white-mode-3x.png')
			: require('../assets/icons/dark-mode-3x.png')

	return (
		<View style={[themeProvider.container]}>
			{/* Logo */}
			<Image style={[themeProvider.imageLogo]} source={thinksharelogoIcon} />
		</View>
	)
}

const stylesLightMode = StyleSheet.create({
	container: {
		height: 80,
		width: '100%',
		backgroundColor: '#fff',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center', // Align cancel button and logo
		paddingHorizontal: 15
	},
	imageLogo: {
		height: 60,
		width: 60,
		resizeMode: 'contain'
	},
	cancelButton: {
		paddingVertical: 10
	},
	cancelText: {
		fontSize: 16,
		color: '#000'
	}
})

const stylesDarkMode = StyleSheet.create({
	...stylesLightMode,
	container: {
		...stylesLightMode.container,
		backgroundColor: '#111827'
	},
	cancelText: {
		fontSize: 16,
		color: '#F9FAFB'
	}
})
