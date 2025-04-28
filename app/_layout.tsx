import {Stack, useSegments} from 'expo-router'
import {useFonts} from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import {useEffect, useState} from 'react'
import {Modal, View, StyleSheet, InteractionManager} from 'react-native'
import LottieView from 'lottie-react-native'
import Header from '@/components/header/header'
import DefaultHeader from '@/components/header'
import {SafeAreaView, SafeAreaProvider, SafeAreaInsetsContext, useSafeAreaInsets} from 'react-native-safe-area-context'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
	const [loading, setLoading] = useState(false)
	const segments = useSegments() || []

	const [fontsLoaded, fontError] = useFonts({
		nunitoExtraBold: require('../assets/fonts/Nunito/static/Nunito-ExtraBold.ttf'),
		nunitoBold: require('../assets/fonts/Nunito/static/Nunito-Bold.ttf'),
		nunitoRegular: require('../assets/fonts/Nunito/static/Nunito-Regular.ttf')
	})

	useEffect(() => {
		if (fontsLoaded) {
			SplashScreen.hideAsync()
		}
	}, [fontsLoaded])

	useEffect(() => {
		if (segments[0] === '(feed)') {
			setLoading(false)
			return
		}

		setLoading(true)
		const interaction = InteractionManager.runAfterInteractions(() => {
			setLoading(false)
		})

		return () => interaction.cancel()
	}, [segments])

	if (!fontsLoaded) return null
	if (fontError) {
		console.error('Font loading error:', fontError)
		return null
	}

	return (
		<SafeAreaProvider>
			{/* Loading Modal */}
			{loading && (
				<Modal visible={loading} animationType="fade" transparent>
					<View style={styles.modalContainer}>
						<LottieView
							source={require('../assets/animation/Animation - 1744164613483.json')}
							autoPlay
							loop
							style={{width: '100%', height: '100%'}}
						/>
					</View>
				</Modal>
			)}

			{/* Main Stack */}
			{segments[0] === 'profiles' ? (
				// ❌ No SafeAreaView for profiles
				<View style={{flex: 1}}>
					<Stack
						screenOptions={{
							animation: 'fade',
							header: () => null // no header for profile
						}}
					/>
				</View>
			) : (
				// ✅ Use SafeAreaView normally
				<SafeAreaView style={{flex: 1}}>
					<Stack
						screenOptions={{
							animation: 'fade',
							header: () => {
								if (segments[0] === '(feed)') return null
								if (segments[0] === '(auth)') {
									return <Header isAuthHeader />
								}
								return <DefaultHeader />
							}
						}}
					/>
				</SafeAreaView>
			)}
		</SafeAreaProvider>
	)
}

const styles = StyleSheet.create({
	modalContainer: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center'
	}
})
