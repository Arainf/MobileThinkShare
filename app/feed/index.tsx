import React, {useEffect, useState} from 'react'
import {FlatList, StyleSheet, View, Text, ActivityIndicator, ScrollView, AppState} from 'react-native'
import {useRouter} from 'expo-router'
import {supabase} from '@/config/supabaseClient'
import PostElement from '@/components/NotesElement/postElement'
import {DATA} from '@/assets/sampledata'

export default function Feed() {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(true)
	const [displayName, setDisplayName] = useState('')

	function getInitials(fullName: string): string {
		if (!fullName) return ''

		const names = fullName.trim().split(/\s+/) // Split by whitespace
		const initials = names.slice(0, 2).map((name) => name[0].toUpperCase())
		return initials.join('')
	}

	const fetchUserData = async () => {
		const {data: session} = await supabase.auth.getSession()

		if (!session?.session) {
			// Redirect to login if no session exists
			router.push('/authentication/login')
			return
		}

		try {
			const userId = session.session.user.id // Get the logged-in user's ID

			// Fetch the user's full name from the profiles table
			const {data, error} = await supabase
				.from('profiles') // Replace 'profiles' with your table name
				.select('full_name')
				.eq('id', userId) // Match the user_id with the logged-in user's ID
				.single() // Fetch a single record

			if (error) {
				console.error('Error fetching user data:', error)
			} else {
				setDisplayName(getInitials(data.full_name))
			}
		} catch (err) {
			console.error('Unexpected error:', err)
		} finally {
			setIsLoading(false) // Stop loading
		}
	}

	useEffect(() => {
		fetchUserData() // Fetch user data on component mount

		// Listen for app state changes
		const subscription = AppState.addEventListener('change', (nextAppState) => {
			if (nextAppState === 'active') {
				// App has come back to the foreground, check session again
				fetchUserData()
			}
		})

		return () => {
			subscription.remove() // Clean up the event listener
		}
	}, [])

	if (isLoading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#3b82f6" />
			</View>
		)
	}

	return (
		<FlatList
			ListHeaderComponent={
				<View style={styles.header}>
					<View style={styles.profileContainer}>
						<Text style={styles.profileText}>{displayName}</Text>
					</View>
					<View>
						<Text>Add Notes</Text>
					</View>
				</View>
			}
			data={DATA}
			renderItem={({item}) => <PostElement note={item} />}
			keyExtractor={(item) => item.id}
			contentContainerStyle={styles.container}
			showsVerticalScrollIndicator={true}
		/>
	)
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#f9f9f9',
		gap: 8
	},
	header: {
		flexDirection: 'row',
		top: -1,
		padding: 20,
		backgroundColor: '#fff'
	},
	profileContainer: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: '#3b82f6',
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 12
	},
	profileText: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 16
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	}
})
