import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native'
import {useRouter} from 'expo-router'
import {supabase} from '@/config/supabaseClient'

export default function Profile() {
	const router = useRouter()

	const handleLogout = async () => {
		try {
			const {error} = await supabase.auth.signOut()
			if (error) {
				Alert.alert('Error', 'Failed to log out. Please try again.')
			} else {
				// Redirect to the login screen after successful logout
				router.push('/')
			}
		} catch (err) {
			console.error('Logout error:', err)
			Alert.alert('Error', 'An unexpected error occurred.')
		}
	}

	const handleProfile = async () => {
		try {
			router.push('/authentication/profile-card')
		} catch (err) {
			console.error('Logout error:', err)
			Alert.alert('Error', 'An unexpected error occurred.')
		}
	}

	return (
		<View style={styles.container}>
			<Text style={styles.text}>This is your profile!</Text>
			<TouchableOpacity style={styles.logoutButton} onPress={handleProfile}>
				<Text style={styles.logoutButtonText}>Profile</Text>
			</TouchableOpacity>
			<TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
				<Text style={styles.logoutButtonText}>Log Out</Text>
			</TouchableOpacity>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#f9f9f9'
	},
	text: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#374151',
		marginBottom: 20
	},
	logoutButton: {
		backgroundColor: '#ef4444',
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 5
	},
	logoutButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold'
	}
})
