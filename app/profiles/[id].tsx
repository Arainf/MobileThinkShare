import React, {useEffect, useState, useRef} from 'react' // Import useRef
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
	Animated // Import Animated
} from 'react-native'
import {useRouter, useLocalSearchParams} from 'expo-router'
import {supabase} from '@/config/supabaseClient'
import {LinearGradient} from 'expo-linear-gradient'
import {Ionicons} from '@expo/vector-icons'
import PostElement from '@/components/NotesElement/postElement'
import {DATA} from '@/assets/sampledata'

const {height: windowHeight, width: windowWidth} = Dimensions.get('window')

// --- Configurable Header Heights ---
const INITIAL_HEADER_HEIGHT = windowHeight * 0.7 // Start at 60% of screen height
const MIN_HEADER_HEIGHT = windowHeight * 0.25 // Shrink down to 15% (adjust as needed)
const HEADER_SCROLL_DISTANCE = INITIAL_HEADER_HEIGHT - MIN_HEADER_HEIGHT

// Use Animated.FlatList
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList)

export default function ProfileDetails() {
	const router = useRouter()
	const {id} = useLocalSearchParams()
	const [profile, setProfile] = useState<any>(null)
	const [loading, setLoading] = useState(true)

	// --- Animated Value for Scroll Position ---
	const scrollY = useRef(new Animated.Value(0)).current

	useEffect(() => {
		// ... (fetchProfile logic remains the same) ...
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
					setProfile(data)
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
		extrapolate: 'clamp' // Important: Prevents shrinking/growing beyond limits
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
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.mainContainer}>
				{/* Animated Header - Positioned Absolutely */}
				<Animated.View style={[styles.animatedHeaderContainer, {height: animatedHeaderHeight}]}>
					{/* Background Image */}
					{profile.portrait_banner ? (
						<Image
							source={{uri: `${profile.portrait_banner}?t=${Date.now()}`}}
							style={styles.backgroundImage} // Stays filling the animated container
						/>
					) : (
						<View style={[styles.backgroundImage, {backgroundColor: '#374151'}]} />
					)}

					{/* Gradient Overlays */}
					<LinearGradient
						colors={['rgba(0, 0, 0, 0.5)', 'rgba(0, 0, 0, 0)']}
						style={styles.gradientOverlayTop}
					/>
					<LinearGradient
						colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.6)']}
						style={styles.gradientOverlayBottom}
					/>

					{/* Profile Name (Animated Opacity) */}
					<Text style={styles.profileName}>{profile.full_name}</Text>

					{/* Profile Image & Add Button (Animated Opacity) */}
					{/* Wrap bottom container in Animated.View to fade it */}
					<View style={styles.bottomContainer}>
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
										+
									</Text>
								</View>
							)}
						</View>
						<TouchableOpacity style={styles.buttonAdd}>
							<Text style={styles.buttonText}>+ Add Friend</Text>
						</TouchableOpacity>
					</View>
				</Animated.View>

				{/* Back Button - Positioned Absolutely, above header */}
				<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
					<Ionicons name="arrow-back-outline" size={24} color="#3b82f6" />
				</TouchableOpacity>

				{/* FlatList - Needs top padding matching INITIAL header height */}
				<AnimatedFlatList // Use the animated version
					data={DATA}
					renderItem={({item}) => (
						<View style={styles.postItemContainer}>
							<PostElement note={item} />
						</View>
					)}
					keyExtractor={(item) => item.id.toString()}
					showsVerticalScrollIndicator={true}
					// *** CRUCIAL FOR LAYOUT ***
					contentContainerStyle={{paddingTop: INITIAL_HEADER_HEIGHT, paddingBottom: 30}}
					// *** CRUCIAL FOR ANIMATION ***
					onScroll={Animated.event(
						[{nativeEvent: {contentOffset: {y: scrollY}}}],
						{useNativeDriver: false} // Height animation requires useNativeDriver: false
					)}
					scrollEventThrottle={16} // Adjust for performance vs smoothness
				/>
			</View>
		</SafeAreaView>
	)
}

// --- Styles ---
const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#fff' // Or your app's main background
	},
	mainContainer: {
		flex: 1,
		backgroundColor: '#f9f9f9' // Background for the list area below header
	},
	animatedHeaderContainer: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		zIndex: 1, // Header below back button, above list initially
		overflow: 'hidden', // Clip content that overflows during shrink
		backgroundColor: '#374151', // Fallback background
		// We animate height directly
		alignItems: 'center', // Center content like name horizontally
		justifyContent: 'flex-end' // Align content towards bottom
	},
	backButton: {
		position: 'absolute',
		top: 15, // Adjust based on SafeAreaView/Notch
		left: 15,
		zIndex: 10, // Highest: Above everything
		backgroundColor: '#fff',
		width: 44,
		height: 44,
		borderRadius: 22,
		justifyContent: 'center',
		alignItems: 'center',
		elevation: 5,
		shadowColor: '#000',
		shadowOffset: {width: 0, height: 2},
		shadowOpacity: 0.2,
		shadowRadius: 3
	},
	backgroundImage: {
		position: 'absolute', // Takes full size of its parent (Animated Header)
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		resizeMode: 'cover'
	},
	gradientOverlayTop: {
		// Covers top part
		position: 'absolute',
		left: 0,
		right: 0,
		top: 0,
		height: '50%',
		zIndex: 1
	},
	gradientOverlayBottom: {
		// Covers bottom part
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		height: '60%',
		zIndex: 1
	},
	profileName: {
		// Animated.Text uses this style
		color: '#fff',
		fontSize: 36,
		textAlign: 'center',
		fontFamily: 'nunitoExtraBold',
		zIndex: 2, // Above gradients
		paddingHorizontal: 20
		// Removed marginBottom, rely on bottomContainer positioning
	},
	bottomContainer: {
		// Animated.View uses this style
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		width: '100%',
		paddingHorizontal: 20,
		paddingBottom: 20, // Padding at the very bottom inside the header
		zIndex: 2, // Above gradients
		bottom: 0 // Stick to bottom of header
	},
	profileImageContainer: {
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: '#fff',
		justifyContent: 'center',
		alignItems: 'center',
		overflow: 'hidden',
		borderWidth: 2,
		borderColor: '#fff'
	},
	profileImage: {width: '100%', height: '100%', resizeMode: 'cover'},
	profileImagePlaceholder: {
		width: '100%',
		height: '100%',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#ccc'
	},
	profileImagePlaceholderText: {fontSize: 30, color: '#fff', fontWeight: 'bold'},
	buttonAdd: {
		backgroundColor: 'rgba(255, 255, 255, 0.9)',
		borderRadius: 18,
		justifyContent: 'center',
		alignItems: 'center',
		height: 36,
		paddingHorizontal: 15,
		shadowColor: '#000',
		shadowOffset: {width: 0, height: 1},
		shadowOpacity: 0.15,
		shadowRadius: 2,
		elevation: 2
	},
	buttonText: {fontFamily: 'nunitoBold', fontSize: 13, color: '#333'},

	loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
	errorContainer: {flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20},
	errorText: {color: '#d9534f', fontSize: 18, textAlign: 'center'},

	postItemContainer: {
		// Styles for the list items area
		width: '100%',
		alignItems: 'center',
		paddingHorizontal: 0, // Let PostElement handle its internal padding
		paddingVertical: 0
		// backgroundColor is set on mainContainer
	}
})
