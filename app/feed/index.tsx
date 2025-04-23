import React, {useEffect, useState} from 'react'
import {
	FlatList,
	StyleSheet,
	View,
	Text,
	ActivityIndicator,
	ScrollView,
	AppState,
	Image,
	TouchableOpacity
} from 'react-native'
import {useRouter, Link} from 'expo-router'
import {supabase} from '@/config/supabaseClient'
import PostElement from '@/components/NotesElement/postElement'
import {DATA} from '@/assets/sampledata'
import ProfileCardsElement from '@/components/profile-cards/profileCardsElement'

export default function Feed() {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(true)
	const [refreshing, setRefreshing] = useState(false) // State for pull-to-refresh
	const [displayName, setDisplayName] = useState('')
	const [fullName, setFullname] = useState('')
	const [profileImg, setProfileImage] = useState('')
	const [initials, setInitials] = useState('')
	interface Profile {
		id: string
		full_name: string
		portrait_banner?: string
		profile_image?: string
	}

	const [profiles, setProfiles] = useState<Profile[]>([]) // State to store profiles data
	const [refreshKey, setRefreshKey] = useState(0) // State to trigger re-render
	const [userId, setUserId] = useState('')

	function getInitials(fullName: string): string {
		if (!fullName) return ''

		const names = fullName.trim().split(/\s+/) // Split by whitespace
		const initials = names.slice(0, 2).map((name) => name[0].toUpperCase())
		return initials.join('')
	}

	// Fetch all profiles data
	const fetchProfilesData = async () => {
		const {data: session} = await supabase.auth.getSession()

		if (!session?.session) {
			// Redirect to login if no session exists
			router.push('/authentication/login')
			return
		}

		try {
			const userId = session.session.user.id

			const {data, error} = await supabase
				.from('profiles') // Replace 'profiles' with your table name
				.select('id,full_name, portrait_banner, profile_image')
				.neq('id', userId) // Fetch required columns

			if (error) {
				console.error('Error fetching profiles data:', error)
			} else {
				setProfiles(data) // Store profiles data in state
			}
		} catch (err) {
			console.error('Unexpected error:', err)
		} finally {
			setIsLoading(false) // Stop loading
		}
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
				.select('id, display_name, full_name, profile_image')
				.eq('id', userId) // Match the user_id with the logged-in user's ID
				.single() // Fetch a single record

			if (error) {
				console.error('Error fetching user data:', error)
			} else {
				setInitials(getInitials(data.display_name))
				setDisplayName(data.display_name)
				setFullname(data.full_name)
				setProfileImage(data.profile_image)
				setUserId(data.id)
			}
		} catch (err) {
			console.error('Unexpected error:', err)
		} finally {
			setIsLoading(false) // Stop loading
		}
	}

	useEffect(() => {
		fetchProfilesData() // Fetch profiles data on component mount
		fetchUserData() // Fetch user data on component mount
	}, [refreshKey]) // Refetch data when refreshKey changes

	const handleUploadComplete = () => {
		// Trigger refetch by updating refreshKey
		setRefreshKey((prevKey) => prevKey + 1)
	}

	// Handle pull-to-refresh
	const handleRefresh = async () => {
		setRefreshing(true) // Start refreshing
		await fetchProfilesData() // Refetch profiles data
		await fetchUserData() // Refetch user data
		setRefreshing(false) // Stop refreshing
		handleUploadComplete()
	}

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
				<>
					<View style={styles.header}>
						<View style={{flexDirection: 'row'}}>
							<Link
								href={{
									pathname: '/profiles/[id]',
									params: {id: userId}
								}}>
								{profileImg ? (
									<Image
										style={styles.profileContainer}
										source={{
											uri: `${profileImg}?t=${Date.now()}`
										}}
									/>
								) : (
									<View style={styles.profileContainer}>
										<Text style={styles.profileText}>
											{initials}
										</Text>
									</View>
								)}
							</Link>
							<View style={styles.textContainer}>
								<Text style={styles.textHeader}>{fullName}</Text>
								<Text style={styles.textSubheader}>@{displayName}</Text>
							</View>
						</View>

						<TouchableOpacity>
							<Image source={require('@/assets/icons/addNote.png')} />
						</TouchableOpacity>
					</View>

					<Text style={styles.textAuthor}>Authors</Text>

					<FlatList
						data={profiles}
						renderItem={({item}) => (
							<ProfileCardsElement ProfileCards={item} id={item.id} /> // Pass id to ProfileCardsElement
						)}
						keyExtractor={(item, index) => index.toString()}
						contentContainerStyle={styles.authorContainer}
						showsHorizontalScrollIndicator={false}
						horizontal={true}
					/>
				</>
			}
			data={DATA}
			renderItem={({item}) => <PostElement note={item} />}
			keyExtractor={(item) => item.id}
			contentContainerStyle={styles.container}
			showsVerticalScrollIndicator={true}
			refreshing={refreshing} // Add refreshing state
			onRefresh={handleRefresh} // Add onRefresh handler
		/>
	)
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#f9f9f9',
		gap: 2
	},
	authorContainer: {
		flexDirection: 'row',
		gap: 0,
		padding: 10
	},
	header: {
		flexDirection: 'row',
		top: -1,
		padding: 15,
		backgroundColor: '#fff',
		justifyContent: 'space-between',
		alignItems: 'center'
	},
	textAuthor: {
		fontFamily: 'nunitoExtraBold',
		marginVertical: 10,
		marginStart: 15
	},
	profileContainer: {
		width: 55,
		height: 55,
		borderRadius: 22,
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

	// Text Container
	textContainer: {
		flexDirection: 'column',
		justifyContent: 'center'
	},
	textHeader: {
		fontFamily: 'nunitoBold',
		fontSize: 14
	},
	textSubheader: {
		fontFamily: 'nunitoRegular',
		fontStyle: 'italic',
		color: '#585757',
		fontSize: 12
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	},
	button: {
		backgroundColor: 'blue'
	}
})
