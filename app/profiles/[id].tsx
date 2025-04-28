'use client'
import {StatusBar} from 'expo-status-bar'
import {useEffect, useState, useRef} from 'react'
import {
	StyleSheet,
	Text,
	View,
	Image,
	TouchableOpacity,
	ActivityIndicator,
	FlatList,
	Dimensions,
	SafeAreaView,
	Animated
} from 'react-native'
import {useRouter, useLocalSearchParams} from 'expo-router'
import {supabase} from '@/config/supabaseClient'
import {LinearGradient} from 'expo-linear-gradient'
import {Ionicons, MaterialCommunityIcons, FontAwesome5, Feather} from '@expo/vector-icons'
import PostElement from '@/components/NotesElement/postElement'
import {DATA} from '@/assets/sampledata'
import Svg, {Path} from 'react-native-svg'
import MaskedView from '@react-native-masked-view/masked-view'

const {height: windowHeight, width: windowWidth} = Dimensions.get('window')

// --- Configurable Header Heights ---
const INITIAL_HEADER_HEIGHT = windowHeight * 0.3 // Start at 30% of screen height
const MIN_HEADER_HEIGHT = windowHeight * 0.25 // Shrink down to 25%
const HEADER_SCROLL_DISTANCE = INITIAL_HEADER_HEIGHT - MIN_HEADER_HEIGHT

// Use Animated.FlatList
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList)

export default function ProfileDetails() {
	const router = useRouter()
	const {id} = useLocalSearchParams()
	const [profile, setProfile] = useState<any>(null)
	const [loading, setLoading] = useState(true)
	const [activeTab, setActiveTab] = useState('posts')

	// --- Animated Value for Scroll Position ---
	const scrollY = useRef(new Animated.Value(0)).current

	useEffect(() => {
		// Fetch profile data
		const fetchProfile = async () => {
			try {
				const {data, error} = await supabase
					.from('profiles')
					.select('full_name, portrait_banner, profile_image')
					.eq('id', id)
					.single()

				if (error) {
					console.error('Error fetching profile:', error)
					setProfile(null)
				} else {
					// Add mock stats for the UI
					setProfile({
						...data,
						posts: 5,
						followers: 7,
						following: 2
					})
				}
			} catch (err) {
				console.error('Unexpected error:', err)
				setProfile(null)
			} finally {
				setLoading(false)
			}
		}

		if (id) {
			fetchProfile()
		} else {
			setLoading(false)
			setProfile(null)
			console.error('No profile ID provided.')
		}
	}, [id])

	// --- Header Height Animation ---
	const animatedHeaderHeight = scrollY.interpolate({
		inputRange: [0, HEADER_SCROLL_DISTANCE],
		outputRange: [INITIAL_HEADER_HEIGHT, MIN_HEADER_HEIGHT],
		extrapolate: 'clamp'
	})

	// --- Loading State ---
	if (loading) {
		return (
			<SafeAreaView style={styles.safeArea}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color="#3b82f6" />
				</View>
			</SafeAreaView>
		)
	}

	// --- Error/Not Found State ---
	if (!profile) {
		return (
			<SafeAreaView style={styles.safeArea}>
				<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
					<Ionicons name="arrow-back-outline" size={24} color="#3b82f6" />
				</TouchableOpacity>
				<View style={styles.errorContainer}>
					<Text style={styles.errorText}>Profile not found.</Text>
				</View>
			</SafeAreaView>
		)
	}

	// --- Profile Found State ---
	return (
		<View style={styles.mainContainer}>
			<StatusBar translucent={true} />

			{/* Back Button */}
			<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
				<Ionicons name="arrow-back-outline" size={20} color="#fff" />
			</TouchableOpacity>

			{/* Share Button */}
			<TouchableOpacity style={styles.shareButton}>
				<Feather name="share" size={20} color="#fff" />
			</TouchableOpacity>

			{/* Header with Banner Image */}
			<View style={[styles.headerContainer]}>
				<MaskedView
					style={styles.maskedView}
					maskElement={
						<Svg width="100%" height="100%" viewBox="0 0 412 270">
							<Path
								d="M412 0C412 6.22236 412 31.7816 412 31.7816V55.6178V269.5H232.756L232.756 236.794C232.756 230.571 228.619 225.527 223.517 225.527H-1L-1 77.0093V46.45C-1 46.45 -1 6.22236 -1 0H65.1602H333.465H412Z"
								fill="#D9D9D9"
							/>
						</Svg>
					}>
					{profile.portrait_banner ? (
						<Image
							source={{uri: `${profile.portrait_banner}?t=${Date.now()}`}}
							style={styles.backgroundImage}
						/>
					) : (
						<View style={[styles.backgroundImage, {backgroundColor: '#374151'}]} />
					)}

					{/* Gradient overlay for better text visibility */}
					<LinearGradient
						colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.5)']}
						style={styles.gradientOverlay}
					/>

					{/* Bottom container for stats and action buttons */}
					<View style={styles.bottomMaskedContainer}>
						{/* Stats Container - Left aligned, smaller fonts */}
						<View style={styles.statsContainer}>
							<View style={styles.statItem}>
								<Text style={styles.statNumber}>{profile.posts}</Text>
								<Text style={styles.statLabel}>posts</Text>
							</View>
							<View style={styles.statItem}>
								<Text style={styles.statNumber}>
									{profile.followers}
								</Text>
								<Text style={styles.statLabel}>followers</Text>
							</View>
							<View style={styles.statItem}>
								<Text style={styles.statNumber}>
									{profile.following}
								</Text>
								<Text style={styles.statLabel}>following</Text>
							</View>
						</View>

						{/* Action Buttons Container - Right aligned */}
						<View style={styles.actionButtonsContainer}>
							<TouchableOpacity style={styles.editProfileButton}>
								<Text style={styles.editProfileText}>Edit profile</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.iconButton}>
								<Feather name="edit-2" size={16} color="#000" />
							</TouchableOpacity>
							<TouchableOpacity style={styles.iconButton}>
								<Feather name="user-plus" size={16} color="#000" />
							</TouchableOpacity>
						</View>
					</View>
				</MaskedView>
			</View>
			<View style={styles.profileInfoContainer}>
				{/* Profile Info */}
				<View style={styles.profileDetailsContainer}>
					<View style={styles.profileImageAndName}>
						<View style={styles.profileImageContainer}>
							{profile.profile_image ? (
								<Image
									source={{
										uri: `${
											profile.profile_image
										}?t=${Date.now()}`
									}}
									style={styles.profileImage}
								/>
							) : (
								<View style={styles.profileImagePlaceholder}>
									<Text
										style={
											styles.profileImagePlaceholderText
										}>
										{profile.full_name?.charAt(0) || 'U'}
									</Text>
								</View>
							)}
						</View>
						<View style={styles.nameContainer}>
							<Text style={styles.fullName}>{profile.full_name}</Text>
							<Text style={styles.username}>
								@{profile.full_name?.split(' ')[0] || 'user'}
							</Text>
						</View>
					</View>

					{/* Navigation Tabs */}
					<View style={styles.tabsContainer}>
						<TouchableOpacity
							style={[
								styles.tabButton,
								activeTab === 'notes' && styles.activeTabButton
							]}
							onPress={() => setActiveTab('notes')}>
							<MaterialCommunityIcons
								name="note-text-outline"
								size={24}
								color={activeTab === 'notes' ? '#3b82f6' : '#9ca3af'}
							/>
						</TouchableOpacity>
						<TouchableOpacity
							style={[
								styles.tabButton,
								activeTab === 'posts' && styles.activeTabButton
							]}
							onPress={() => setActiveTab('posts')}>
							<FontAwesome5
								name="star"
								size={22}
								color={activeTab === 'posts' ? '#3b82f6' : '#9ca3af'}
							/>
						</TouchableOpacity>
						<TouchableOpacity
							style={[
								styles.tabButton,
								activeTab === 'saved' && styles.activeTabButton
							]}
							onPress={() => setActiveTab('saved')}>
							<Ionicons
								name="trash-outline"
								size={24}
								color={activeTab === 'saved' ? '#3b82f6' : '#9ca3af'}
							/>
						</TouchableOpacity>
					</View>
				</View>
			</View>

			{/* Main Content */}
			<AnimatedFlatList
				data={DATA}
				renderItem={({item}) => (
					<View style={styles.postItemContainer}>
						<PostElement note={item} />
					</View>
				)}
				keyExtractor={(item) => item.id.toString()}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{
					paddingTop: INITIAL_HEADER_HEIGHT + 80, // Add extra space for profile info
					paddingBottom: 30
				}}
				onScroll={Animated.event([{nativeEvent: {contentOffset: {y: scrollY}}}], {
					useNativeDriver: false
				})}
				scrollEventThrottle={16}
			/>
		</View>
	)
}

// --- Styles ---
const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#fff'
	},
	imageOverlay: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		height: '50%'
	},
	mainContainer: {
		marginTop: -10,
		flex: 1,
		backgroundColor: '#f9f9f9'
	},
	headerContainer: {
		height: '30%',
		position: 'relative',
		top: 0,
		left: 0,
		right: 0,
		zIndex: 1,
		overflow: 'hidden'
	},
	maskedView: {
		width: '100%',
		height: '100%',
		overflow: 'hidden',
		position: 'relative'
	},
	backgroundImage: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		resizeMode: 'cover'
	},
	gradientOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0
	},
	// New container for bottom elements inside maskedView
	bottomMaskedContainer: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		flexDirection: 'column',
		width: '100%',
		paddingHorizontal: 5,
		paddingBottom: 15
	},
	// Updated statsContainer
	statsContainer: {
		width: '100%',
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'center',
		paddingHorizontal: 10,
		paddingVertical: 20
	},
	statItem: {
		alignItems: 'flex-start',
		marginRight: 20
	},
	statNumber: {
		fontSize: 14, // Smaller font
		fontWeight: 'bold',
		color: '#fff', // Changed to white for visibility on the background
		textShadowColor: 'rgba(0,0,0,0.5)',
		textShadowOffset: {width: 1, height: 1},
		textShadowRadius: 2
	},
	statLabel: {
		fontSize: 10, // Smaller font
		color: '#f0f0f0', // Changed to light color for visibility
		textShadowColor: 'rgba(0,0,0,0.5)',
		textShadowOffset: {width: 1, height: 1},
		textShadowRadius: 2
	},
	// Updated actionButtonsContainer
	actionButtonsContainer: {
		width: '100%',
		flexDirection: 'row',
		justifyContent: 'flex-end',
		alignItems: 'flex-end',
		gap: 10,
		paddingHorizontal: 2
	},
	editProfileButton: {
		backgroundColor: 'rgba(255, 255, 255, 0.9)',
		borderRadius: 6,
		paddingVertical: 6,
		paddingHorizontal: 12,
		justifyContent: 'center',
		alignItems: 'center'
	},
	editProfileText: {
		fontSize: 12,
		fontWeight: '600',
		color: '#111'
	},
	iconButton: {
		width: 30,
		height: 30,
		borderRadius: 6,
		backgroundColor: 'rgba(255, 255, 255, 0.9)',
		justifyContent: 'center',
		alignItems: 'center'
	},
	backButton: {
		position: 'absolute',
		top: 50,
		left: 15,
		zIndex: 10,
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: 'rgba(0,0,0,0.3)',
		justifyContent: 'center',
		alignItems: 'center'
	},
	shareButton: {
		position: 'absolute',
		top: 50,
		right: 15,
		zIndex: 10,
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: 'rgba(0,0,0,0.3)',
		justifyContent: 'center',
		alignItems: 'center'
	},
	profileInfoContainer: {
		marginTop: -52,
		backgroundColor: '#fff'
	},
	profileDetailsContainer: {
		padding: 15
	},
	profileImageAndName: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 15
	},
	profileImageContainer: {
		width: 38,
		height: 38,
		borderRadius: 25,
		backgroundColor: '#fff',
		justifyContent: 'center',
		alignItems: 'center',
		overflow: 'hidden',
		borderWidth: 2,
		borderColor: '#fff',
		marginRight: 12
	},
	profileImage: {
		width: '100%',
		height: '100%',
		resizeMode: 'cover'
	},
	profileImagePlaceholder: {
		width: '100%',
		height: '100%',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#3b82f6'
	},
	profileImagePlaceholderText: {
		fontSize: 20,
		color: '#fff',
		fontWeight: 'bold'
	},
	nameContainer: {
		flex: 1
	},
	fullName: {
		fontSize: 12,
		fontWeight: 'bold',
		color: '#111'
	},
	username: {
		fontSize: 9,
		color: '#666'
	},
	tabsContainer: {
		flexDirection: 'row',
		justifyContent: 'space-around'
	},
	tabButton: {
		flex: 1,
		alignItems: 'center',
		paddingVertical: 8
	},
	activeTabButton: {
		borderBottomWidth: 2,
		borderBottomColor: '#3b82f6'
	},
	postItemContainer: {
		width: '100%',
		marginBottom: 15
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	},
	errorContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 20
	},
	errorText: {
		color: '#d9534f',
		fontSize: 18,
		textAlign: 'center'
	}
})
