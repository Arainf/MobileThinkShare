import {Stack} from 'expo-router'
import {Ionicons} from '@expo/vector-icons'
import Header from '@/components/header/header'

export default function FeedLayout() {
	return (
		<Stack
			screenOptions={{
				header: () => <Header />,
				animation: 'slide_from_right' // Use the custom header
			}}>
			<Stack.Screen name="index" />
			<Stack.Screen name="notifications" />
			<Stack.Screen name="profile" />
		</Stack>
	)
}
