import React, {useState} from 'react'
import {StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Alert} from 'react-native'
import {LinearGradient} from 'expo-linear-gradient'
import * as ImagePicker from 'expo-image-picker'
import {supabase} from '@/config/supabaseClient'
import {BlurView} from 'expo-blur'

export default function ProfileCard() {
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
			// Save profileText, backgroundImage, and profileImage to the database
			const {data, error} = await supabase
				.from('profiles') // Replace with your table name
				.update({
					profile_text: profileText,
					background_image: backgroundImage,
					profile_image: profileImage
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

	return (
		<View style={styles.container}>
			<View style={styles.textContainer}>
				<Text style={styles.header}>Let's make some beautiful "profile-cards"</Text>
			</View>
			{/* Profile Card */}
			<TouchableOpacity onPress={handleUploadBackground} style={styles.profileCard}>
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
			</TouchableOpacity>

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
		backgroundColor: '#374151'
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
		textAlign: 'center',
		zIndex: 1 // Ensure it is above the background
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
