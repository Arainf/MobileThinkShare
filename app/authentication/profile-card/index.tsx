import React, {useState, useEffect} from 'react'
import {
	StyleSheet,
	Text,
	View,
	TextInput,
	TouchableOpacity,
	Image,
	Alert,
	ActivityIndicator,
	Platform // Import Platform
} from 'react-native'
import {LinearGradient} from 'expo-linear-gradient'
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system' // Import FileSystem
import {supabase} from '@/config/supabaseClient'
// Removed BlurView as it wasn't used in the provided logic snippet
import {useRouter} from 'expo-router'
import {decode} from 'base64-arraybuffer'

// --- Helper to get MimeType ---
// Basic helper, might need more robust mapping for different types
const getMimeType = (uri: string): string => {
	const extension = uri?.split('.').pop()?.toLowerCase()
	switch (extension) {
		case 'jpg':
		case 'jpeg':
			return 'image/jpeg'
		case 'png':
			return 'image/png'
		case 'gif':
			return 'image/gif'
		// Add other types as needed
		default:
			return 'application/octet-stream' // Default binary type
	}
}

export default function ProfileCard() {
	const router = useRouter()
	const [profileText, setProfileText] = useState('ThinkShare')
	const defaultImage = require('../../../assets/images/defaultPicture.png')
	const [resolvedDefaultImageUri, setResolvedDefaultImageUri] = useState<string | null>(null) // Store resolved URI
	const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
	const [profileImage, setProfileImage] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const [user, setUser] = useState<string | null>(null)

	// Resolve default image URI once on mount
	useEffect(() => {
		const uri = Image.resolveAssetSource(defaultImage).uri
		setResolvedDefaultImageUri(uri)
		setBackgroundImage(uri) // Set initial background to default
	}, [])

	const handleUploadBackground = async () => {
		// Request permissions if needed (recommended)
		const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
		if (permissionResult.granted === false) {
			Alert.alert('Permission required', 'You need to allow access to your photos to upload images.')
			return
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ['images'], // Correct enum usage
			allowsEditing: true,
			quality: 0.8 // Slightly reduce quality for faster uploads/less storage
			// aspect: [16, 9] // Optional: Enforce aspect ratio for banners
		})

		console.log('portrait-banner:', result)

		if (!result.canceled && result.assets && result.assets.length > 0) {
			setBackgroundImage(result.assets[0].uri)
		}
	}

	const handleUploadProfileImage = async () => {
		// Request permissions if needed (recommended)
		const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
		if (permissionResult.granted === false) {
			Alert.alert('Permission required', 'You need to allow access to your photos to upload images.')
			return
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ['images'], // Correct enum usage
			allowsEditing: true,
			quality: 0.8,
			aspect: [1, 1] // Enforce square aspect ratio for profile pics
		})

		console.log('profile:', result)

		if (!result.canceled && result.assets && result.assets.length > 0) {
			setProfileImage(result.assets[0].uri)
		}
	}

	// Fetch profile details
	useEffect(() => {
		let isApiSubscribed = true
		const getProfileDetails = async () => {
			const {data: sessionData, error: sessionError} = await supabase.auth.getSession()

			if (sessionError || !sessionData?.session) {
				console.error('Session Error:', sessionError)
				router.replace('/') // Use replace to prevent going back
				return
			}

			const userId = sessionData.session.user.id
			setUser(userId) // Set user ID early

			try {
				const {data, error} = await supabase
					.from('profiles')
					.select('full_name, portrait_banner, profile_image')
					.eq('id', userId)
					.single()

				if (error && error.code !== 'PGRST116') {
					// Ignore 'No rows found' error initially
					console.error('Error fetching user data:', error)
					Alert.alert('Error', 'Could not fetch profile details.')
				} else if (data && isApiSubscribed) {
					setProfileText(data.full_name || 'ThinkShare') // Fallback name
					// Set images only if they exist, otherwise keep default/null
					if (data.portrait_banner) {
						setBackgroundImage(data.portrait_banner)
					} else if (resolvedDefaultImageUri) {
						// If DB banner is null, ensure background is set to default
						setBackgroundImage(resolvedDefaultImageUri)
					}
					if (data.profile_image) {
						setProfileImage(data.profile_image)
					}
				} else if (isApiSubscribed && resolvedDefaultImageUri) {
					// If no data found (new user) and component still mounted, ensure default is set
					setBackgroundImage(resolvedDefaultImageUri)
				}
			} catch (err) {
				console.error('Fetch profile error:', err)
				if (isApiSubscribed) {
					Alert.alert(
						'Error',
						'An unexpected error occurred while fetching your profile.'
					)
				}
			}
		}

		getProfileDetails()

		return () => {
			isApiSubscribed = false
		}
	}, [resolvedDefaultImageUri]) // Add dependency

	const handleSave = async () => {
		if (!user) {
			Alert.alert('Error', 'User session not found. Cannot save.')
			return
		}

		try {
			setLoading(true)
			let backgroundImageUrl: string | null = null // URL to save in DB
			let profileImageUrl: string | null = null // URL to save in DB

			// --- Determine current DB URLs (needed if only one image changes) ---
			// Fetch existing URLs *before* potentially overwriting them
			const {data: currentProfile, error: fetchError} = await supabase
				.from('profiles')
				.select('portrait_banner, profile_image')
				.eq('id', user)
				.single()

			if (fetchError && fetchError.code !== 'PGRST116') {
				throw new Error('Could not verify current profile images.')
			}

			// Initialize with existing URLs or null
			backgroundImageUrl = currentProfile?.portrait_banner || null
			profileImageUrl = currentProfile?.profile_image || null

			// --- Background Image Upload ---
			const isNewBackground =
				backgroundImage &&
				(backgroundImage.startsWith('file://') || backgroundImage.startsWith('content://'))

			if (isNewBackground) {
				const fileInfo = await FileSystem.getInfoAsync(backgroundImage)
				if (!fileInfo.exists) {
					throw new Error('Selected background image file not found.')
				}

				const base64 = await FileSystem.readAsStringAsync(backgroundImage, {
					encoding: FileSystem.EncodingType.Base64
				})
				const filePath = `backgrounds/${user}/background.${backgroundImage.split('.').pop()}` // Use user ID and extension
				const contentType = getMimeType(backgroundImage)

				console.log(`Uploading background to: ${filePath} with type: ${contentType}`)

				const {data: uploadData, error: uploadError} = await supabase.storage
					.from('profiles-images') // Your bucket name
					.upload(filePath, decode(base64), {
						// Pass only base64 data
						contentType,
						upsert: true
					})

				if (uploadError) {
					console.error('Supabase background upload error:', uploadError)
					throw new Error(`Failed to upload background image: ${uploadError.message}`)
				}

				// Get public URL
				const {data: urlData} = supabase.storage
					.from('profiles-images')
					.getPublicUrl(uploadData.path)
				backgroundImageUrl = urlData.publicUrl // Get the new URL
				console.log('Background upload successful:', backgroundImageUrl)
			} else if (backgroundImage === resolvedDefaultImageUri) {
				// If user explicitly set background back to the default *display* image
				// We should remove the existing one from storage (optional) and set DB to null
				if (backgroundImageUrl) {
					// If there was a banner before
					// Optional: Delete previous banner from storage
					const oldFilePath = backgroundImageUrl.split('/').slice(-3).join('/') // Attempt to parse path from URL
					if (oldFilePath.startsWith(`backgrounds/${user}/`)) {
						await supabase.storage.from('profiles-images').remove([oldFilePath])
					}
				}
				backgroundImageUrl = null // Set DB field to null
			}
			// If backgroundImage is an existing http URL, backgroundImageUrl retains its initial value from DB fetch

			// --- Profile Image Upload (Similar logic) ---
			const isNewProfile =
				profileImage &&
				(profileImage.startsWith('file://') || profileImage.startsWith('content://'))

			if (isNewProfile) {
				const fileInfo = await FileSystem.getInfoAsync(profileImage)
				if (!fileInfo.exists) {
					throw new Error('Selected profile image file not found.')
				}
				const base64 = await FileSystem.readAsStringAsync(profileImage, {
					encoding: FileSystem.EncodingType.Base64
				})
				const filePath = `profiles/${user}/profile.${profileImage.split('.').pop()}` // Use user ID and extension
				const contentType = getMimeType(profileImage)

				console.log(`Uploading profile to: ${filePath} with type: ${contentType}`)

				const {data: uploadData, error: uploadError} = await supabase.storage
					.from('profiles-images') // Your bucket name
					.upload(filePath, decode(base64), {
						// Pass only base64 data
						contentType,
						upsert: true
					})

				if (uploadError) {
					console.error('Supabase profile upload error:', uploadError)
					throw new Error(`Failed to upload profile image: ${uploadError.message}`)
				}

				// Get public URL
				const {data: urlData} = supabase.storage
					.from('profiles-images')
					.getPublicUrl(uploadData.path)
				profileImageUrl = urlData.publicUrl // Get the new URL
				console.log('Profile upload successful:', profileImageUrl)
			} else if (profileImage === null && profileImageUrl !== null) {
				// If user removed the profile image (set state to null) and there was one before
				// Optional: Delete previous profile image from storage
				const oldFilePath = profileImageUrl.split('/').slice(-3).join('/')
				if (oldFilePath.startsWith(`profiles/${user}/`)) {
					await supabase.storage.from('profiles-images').remove([oldFilePath])
				}
				profileImageUrl = null // Set DB field to null
			}
			// If profileImage is an existing http URL, profileImageUrl retains its initial value from DB fetch

			// --- Save profile text and final image URLs to the database ---
			console.log('Updating profile DB with:', {
				full_name: profileText,
				portrait_banner: backgroundImageUrl, // Will be null if set to default
				profile_image: profileImageUrl // Will be null if removed
			})

			const {data, error} = await supabase
				.from('profiles')
				.update({
					full_name: profileText,
					portrait_banner: backgroundImageUrl,
					profile_image: profileImageUrl
				})
				.eq('id', user) // Use state variable 'user'

			if (error) {
				console.error('Supabase DB update error:', error)
				Alert.alert('Error', `Failed to save profile details: ${error.message}`)
			} else {
				Alert.alert('Success', 'Profile saved successfully!')
				// Optionally update state with the final URLs from DB save if needed,
				// but usually a re-fetch on navigation or next mount handles this.
				// Example:
				// setBackgroundImage(backgroundImageUrl || resolvedDefaultImageUri); // Update state to reflect saved state
				// setProfileImage(profileImageUrl);
			}
		} catch (err: any) {
			// Catch specific type if possible
			console.error('Save error:', err)
			Alert.alert('Error', `An unexpected error occurred: ${err.message || 'Unknown error'}`)
		} finally {
			setLoading(false)
		}
	}

	// --- Render ---
	// Use resolvedDefaultImageUri for the fallback source
	const displayBackgroundImage = backgroundImage || resolvedDefaultImageUri

	return (
		<View style={styles.container}>
			<View style={styles.textContainer}>
				<Text style={styles.header}>Let's make some beautiful "profile-cards"</Text>
			</View>

			{/* Profile Card */}
			<View style={styles.profileCard}>
				{/* Background Image */}
				{displayBackgroundImage ? (
					<Image
						source={{uri: `${displayBackgroundImage}?t=${Date.now()}`}}
						style={styles.backgroundImage}
					/>
				) : (
					<View style={[styles.backgroundImage, {backgroundColor: '#374151'}]} /> // Placeholder color if default fails
				)}

				{/* Gradient Overlay */}
				<LinearGradient
					colors={['rgba(217, 217, 217, 0)', 'rgba(255, 255, 255, 0.31)']} // Use rgba for clarity
					start={{x: 0, y: 0}}
					end={{x: 0, y: 1}}
					style={styles.gradientOverlay}
				/>
				<TextInput
					style={styles.profileTextInput}
					value={profileText}
					onChangeText={setProfileText}
					placeholder="Enter your name" // More specific placeholder
					placeholderTextColor="#ccc"
					multiline={true} // Avoid multiline for a name? Adjust height if needed.
					textAlign="center"
				/>
				{/* Profile Image */}
				<TouchableOpacity
					onPress={handleUploadProfileImage}
					style={styles.profileImageTouchable}>
					{profileImage ? (
						<Image
							source={{uri: `${profileImage}?t=${Date.now()}`}}
							style={styles.profileImage}
						/>
					) : (
						<View style={styles.profileImagePlaceholder}>
							<Text style={styles.profileImagePlaceholderText}>+</Text>
						</View>
					)}
				</TouchableOpacity>
			</View>

			<View style={styles.buttonContainer}>
				{/* Upload Background Button */}
				<TouchableOpacity style={styles.uploadButton} onPress={handleUploadBackground}>
					<Text style={styles.uploadButtonText}>Upload Banner</Text>
				</TouchableOpacity>

				{/* Save Button */}
				<TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
					{loading ? (
						<ActivityIndicator size="small" color="#fff" />
					) : (
						<Text style={styles.saveButtonText}>Save</Text>
					)}
				</TouchableOpacity>
			</View>
		</View>
	)
}

// --- Styles --- (Added some styles used in the refactored render)
const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		width: '100%',
		justifyContent: 'flex-start', // Changed from center to flex-start
		backgroundColor: '#fff',
		paddingTop: Platform.OS === 'android' ? 25 : 50, // Adjust padding for status bar
		gap: 20 // Reduced gap slightly
	},
	textContainer: {
		width: '90%', // Use percentage width
		alignItems: 'center', // Center the header text
		marginBottom: 10 // Add margin bottom
	},
	header: {
		fontFamily: 'nunitoExtraBold', // Ensure this font is loaded
		fontSize: 25,
		textAlign: 'center'
	},
	profileCard: {
		width: 303,
		height: 430,
		borderRadius: 44,
		overflow: 'hidden',
		justifyContent: 'space-between', // Let content position itself
		alignItems: 'center',
		position: 'relative',
		backgroundColor: '#374151', // Fallback background
		// boxShadow: '0px 9.774px 19.06px 0px rgba(0, 0, 0, 0.25)' // boxShadow is web-only
		elevation: 10, // Android shadow
		shadowColor: '#000', // iOS shadow
		shadowOffset: {width: 0, height: 5},
		shadowOpacity: 0.3,
		shadowRadius: 10
	},
	backgroundImage: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		resizeMode: 'cover'
	},
	gradientOverlay: {
		height: 193,
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0
	},
	profileImageTouchable: {
		// Added touchable area style
		position: 'absolute', // Position it absolutely
		bottom: 15, // At the bottom
		zIndex: 2 // Above gradient
	},
	profileTextInput: {
		// Position text input above the profile image area
		position: 'absolute',
		bottom: 80, // Adjust as needed based on profile image size + margin
		width: '80%', // Take percentage width
		fontFamily: 'nunitoExtraBold',
		color: '#fff',
		fontSize: 25,
		textAlign: 'center', // Center text
		zIndex: 2, // Above gradient
		paddingHorizontal: 10, // Add padding
		// Remove fixed height, let it grow if multiline needed, but maybe limit lines
		// height: 100, // Removed fixed height
		textShadowColor: 'rgba(0, 0, 0, 0.75)', // Optional text shadow for readability
		textShadowOffset: {width: -1, height: 1},
		textShadowRadius: 5
	},
	profileImage: {
		width: 56,
		height: 56,
		borderRadius: 18, // Make border radius proportional
		borderWidth: 2,
		borderColor: '#fff'
		// Removed zIndex and margin here, handled by TouchableOpacity positioning
	},
	profileImagePlaceholder: {
		width: 56,
		height: 56,
		borderRadius: 18,
		backgroundColor: 'rgba(204, 204, 204, 0.7)', // Slightly transparent placeholder
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 2,
		borderColor: '#fff'
		// Removed zIndex and margin here
	},
	profileImagePlaceholderText: {
		fontSize: 24,
		color: '#fff',
		fontWeight: 'bold'
	},
	buttonContainer: {
		// Style for button row
		flexDirection: 'row',
		width: '90%',
		justifyContent: 'space-around',
		marginTop: 20 // Add margin top
	},
	uploadButton: {
		// Removed marginTop
		backgroundColor: '#3b82f6',
		paddingVertical: 12, // Adjust padding
		paddingHorizontal: 20,
		borderRadius: 18,
		alignItems: 'center',
		justifyContent: 'center',
		minWidth: 120 // Ensure minimum width
	},
	uploadButtonText: {
		color: '#fff',
		fontSize: 14, // Slightly smaller text
		fontWeight: 'bold'
	},
	saveButton: {
		// Removed marginTop
		backgroundColor: '#10b981',
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 18,
		alignItems: 'center',
		justifyContent: 'center',
		minWidth: 120
	},
	saveButtonText: {
		color: '#fff',
		fontSize: 14,
		fontWeight: 'bold'
	}
})
