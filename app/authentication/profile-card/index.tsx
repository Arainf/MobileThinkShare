import React, {useState} from 'react'
import {StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Alert} from 'react-native'
import {LinearGradient} from 'expo-linear-gradient'
import * as ImagePicker from 'expo-image-picker'
import {supabase} from '@/config/supabaseClient'
import {BlurView} from 'expo-blur'
import {useRouter} from 'expo-router'
import {decode} from 'base64-arraybuffer'

export default function ProfileCard() {
	const router = useRouter()
	const [profileText, setProfileText] = useState('ThinkShare')
	const defaultImage = require('../../../assets/images/defaultPicture.png')
	const [backgroundImage, setBackgroundImage] = useState<string | null>(
		Image.resolveAssetSource(defaultImage).uri // Resolve the local image URI
	)
	const [profileImage, setProfileImage] = useState<string | null>(null)

	const handleUploadBackground = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images, // ✅ Correct enum
			allowsEditing: true,
			quality: 1
		})

		if (!result.canceled) {
			setBackgroundImage(result.assets[0].uri)
		}
	}

	const handleUploadProfileImage = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images, // ✅ Correct enum
			allowsEditing: true,
			quality: 1
		})

		if (!result.canceled) {
			setProfileImage(result.assets[0].uri)
		}
	}

	const handleSave = async () => {
		try {
			// Upload background image to Supabase bucket
			let backgroundImageUrl = null
			if (backgroundImage && backgroundImage !== Image.resolveAssetSource(defaultImage).uri) {
				const response = await fetch(backgroundImage) // Fetch the image
				if (!response.ok) {
					throw new Error('Failed to fetch the background image')
				}
				const blob = await response.blob() // Convert to blob
				const base64Data = await blobToBase64(blob) // Convert blob to Base64

				const backgroundResponse = await supabase.storage
					.from('profiles-images') // Replace with your bucket name
					.upload(`backgrounds/${Date.now()}_background.jpeg`, decode(base64Data), {
						contentType: 'image/jpeg' // Specify the content type
					})

				if (backgroundResponse.error) {
					throw new Error('Failed to upload background image')
				}

				// Get the public URL of the uploaded background image
				backgroundImageUrl = supabase.storage
					.from('profiles-images')
					.getPublicUrl(backgroundResponse.data.path).data.publicUrl
			}

			// Upload profile image to Supabase bucket
			let profileImageUrl = null
			if (profileImage) {
				const response = await fetch(profileImage) // Fetch the image
				if (!response.ok) {
					throw new Error('Failed to fetch the profile image')
				}
				const blob = await response.blob() // Convert to blob
				const base64Data = await blobToBase64(blob) // Convert blob to Base64

				const profileResponse = await supabase.storage
					.from('profiles-images') // Replace with your bucket name
					.upload(`profiles/${Date.now()}_profile.jpeg`, decode(base64Data), {
						contentType: 'image/jpeg' // Specify the content type
					})

				if (profileResponse.error) {
					throw new Error('Failed to upload profile image')
				}

				// Get the public URL of the uploaded profile image
				profileImageUrl = supabase.storage
					.from('profiles-images')
					.getPublicUrl(profileResponse.data.path).data.publicUrl
			}

			// Save profileText, backgroundImageUrl, and profileImageUrl to the database
			const {data, error} = await supabase
				.from('profiles') // Replace with your table name
				.update({
					profile_text: profileText,
					portait_banner: backgroundImageUrl,
					profile_image: profileImageUrl
				})
				.eq('id', (await supabase.auth.getUser()).data?.user?.id) // Match the logged-in user's ID

			if (error) {
				Alert.alert('Error', 'Failed to save profile. Please try again.')
			} else {
				Alert.alert('Success', 'Profile saved successfully!')
			}
		} catch (err) {
			console.error('Save error:', err)
			Alert.alert('Error', 'An unexpected error occurred.')
		}
	}

	// Helper function to convert Blob to Base64
	const blobToBase64 = (blob: Blob): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader()
			reader.onloadend = () => resolve(reader.result as string)
			reader.onerror = reject
			reader.readAsDataURL(blob)
		})
	}
	return (
		<View style={styles.container}>
			<View style={styles.textContainer}>
				<Text style={styles.header}>Let's make some beautiful "profile-cards"</Text>
			</View>
			{/* Profile Card */}
			<View style={styles.profileCard}>
				{/* Background Image */}
				<Image source={{uri: backgroundImage || defaultImage}} style={styles.backgroundImage} />
				{/* Gradient Overlay */}
				<LinearGradient
					colors={['#D9D9D900', '#FFFFFF50']}
					start={{x: 0, y: 0}}
					end={{x: 0, y: 1}}
					style={styles.gradientOverlay}
				/>
				<TextInput
					style={styles.profileTextInput}
					value={profileText}
					onChangeText={setProfileText}
					placeholder="Enter your profile text"
					placeholderTextColor="#ccc"
					multiline={true}
					textAlign="center"
				/>
				{/* Profile Image */}
				<TouchableOpacity onPress={handleUploadProfileImage}>
					{profileImage ? (
						<Image source={{uri: profileImage}} style={styles.profileImage} />
					) : (
						<View style={styles.profileImagePlaceholder}>
							<Text style={styles.profileImagePlaceholderText}>+</Text>
						</View>
					)}
				</TouchableOpacity>
			</View>

			<View
				style={{
					flexDirection: 'row',
					width: '100%',
					justifyContent: 'space-around'
				}}>
				{/* Upload Background Button */}
				<TouchableOpacity style={styles.uploadButton} onPress={handleUploadBackground}>
					<Text style={styles.uploadButtonText}>Upload Portrait Banner</Text>
				</TouchableOpacity>

				{/* Save Button */}
				<TouchableOpacity style={styles.saveButton} onPress={handleSave}>
					<Text style={styles.saveButtonText}>Save</Text>
				</TouchableOpacity>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		width: '100%',
		justifyContent: 'flex-start',
		backgroundColor: '#fff',
		gap: 40
	},
	textContainer: {
		marginHorizontal: '8%',
		marginTop: 10,
		alignItems: 'flex-start',
		justifyContent: 'flex-start'
	},
	header: {
		fontFamily: 'nunitoExtraBold',
		fontSize: 25
	},
	profileCard: {
		width: 303,
		height: 430,
		borderRadius: 44,
		overflow: 'hidden',
		justifyContent: 'space-between',
		alignItems: 'center',
		position: 'relative',
		backgroundColor: '#374151',
		boxShadow: '0px 9.774px 19.06px 0px rgba(0, 0, 0, 0.25)'
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
	profileTextInput: {
		fontFamily: 'nunitoExtraBold',
		color: '#fff',
		fontSize: 25,
		margin: 20,
		overflow: 'visible',
		zIndex: 1,
		width: 200,
		height: 100
	},
	profileImage: {
		width: 56,
		height: 56,
		borderRadius: 18,
		margin: 15,
		borderWidth: 2,
		borderColor: '#fff',
		zIndex: 1 // Ensure it is above the background
	},
	profileImagePlaceholder: {
		width: 56,
		height: 56,
		borderRadius: 16,
		backgroundColor: '#ccc',
		justifyContent: 'center',
		alignItems: 'center',
		margin: 15,
		zIndex: 1,
		borderWidth: 2,
		borderColor: '#fff' // Ensure it is above the background
	},
	profileImagePlaceholderText: {
		fontSize: 24,
		color: '#fff'
	},
	uploadButton: {
		marginTop: 20,
		backgroundColor: '#3b82f6',
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 18
	},
	uploadButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold'
	},
	saveButton: {
		marginTop: 20,
		backgroundColor: '#10b981',
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 18
	},
	saveButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold'
	}
})
