'use client'

import {StyleSheet, Text, TouchableOpacity, View, Image, Animated} from 'react-native'
import {LinearGradient} from 'expo-linear-gradient'
import {useRouter} from 'expo-router'
import MaskedView from '@react-native-masked-view/masked-view'
import Svg, {Path, Defs, Filter, FeDropShadow} from 'react-native-svg'
import {useState, useRef, useEffect} from 'react'

interface ProfileCards {
	id: string
	full_name: string
	portrait_banner?: string
	profile_image?: string
}

function toSentenceCase(text: string): string {
	if (!text) return ''
	return text
		.toLowerCase()
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ')
}

export default function ProfileCardsElement({ProfileCards: profileData, id}: {ProfileCards: ProfileCards; id: string}) {
	const router = useRouter()

	const handlePress = () => {
		router.push({
			pathname: '/profiles/[id]',
			params: {id: id}
		})
	}

	return (
		<View style={[styles.cardWrapper]}>
			<TouchableOpacity activeOpacity={0.95} onPress={handlePress} style={styles.cardContainer}>
				<MaskedView
					style={styles.profileCard}
					maskElement={
						<Svg width="100%" height="100%" viewBox="0 0 124 170">
							<Path
								d="M0 15.8584C0 7.57413 6.71573 0.858398 15 0.858398H109C117.284 0.858398 124 7.57413 124 15.8584V154.858C124 163.143 117.284 169.858 109 169.858H62H56.5C48.2157 169.858 41.5 163.143 41.5 154.858V145.5C41.5 137.216 34.7843 130.5 26.5 130.5H15C6.71573 130.5 0 123.784 0 115.5V85.3584V15.8584Z"
								fill="#C4C4C4"
							/>
						</Svg>
					}>
					{/* Background Image with subtle zoom effect */}
					{profileData.portrait_banner ? (
						<Image
							source={{
								uri: `${profileData.portrait_banner}?t=${Date.now()}`
							}}
							style={styles.backgroundImage}
						/>
					) : (
						<View style={styles.backgroundImageFallback}>
							<LinearGradient
								colors={['#2c3e50', '#1a2530']}
								start={{x: 0, y: 0}}
								end={{x: 1, y: 1}}
								style={StyleSheet.absoluteFill}
							/>
						</View>
					)}

					{/* Enhanced Gradient Overlay for better depth */}
					<LinearGradient
						colors={[
							'rgba(0, 0, 0, 0.65)',
							'rgba(0, 0, 0, 0.3)',
							'rgba(0, 0, 0, 0.4)',
							'rgba(0, 0, 0, 0.7)'
						]}
						locations={[0, 0.3, 0.7, 1]}
						style={styles.gradientOverlay}
					/>

					{/* Content Container */}
					<View style={styles.contentContainer}>
						{/* Name at the top with enhanced styling */}
						<Text style={styles.nameText}>
							{toSentenceCase(profileData.full_name)}
						</Text>

						{/* Bottom Container for Add Button */}
						<View style={styles.bottomContainer}>
							{/* Add Friend Button with enhanced styling */}
							<TouchableOpacity
								style={styles.buttonAdd}
								onPress={(e) => {
									e.stopPropagation()
									console.log('Add Friend clicked for ID:', id)
								}}>
								<Text style={styles.buttonText}>+ Add Friend</Text>
							</TouchableOpacity>
						</View>
					</View>
				</MaskedView>

				{/* Profile Image with enhanced shadow */}
				<View style={styles.profileImageOuterContainer}>
					<View style={styles.profileImageContainer}>
						{profileData.profile_image ? (
							<Image
								source={{
									uri: `${
										profileData.profile_image
									}?t=${Date.now()}`
								}}
								style={styles.profileImage}
							/>
						) : (
							<View style={styles.profileImageFallback} />
						)}
					</View>
				</View>

				{/* Card border for extra definition */}
				<View style={styles.cardBorder} />
			</TouchableOpacity>
		</View>
	)
}

const styles = StyleSheet.create({
	cardWrapper: {
		// This allows the animation to work properly
		marginVertical: 10
	},
	cardContainer: {
		position: 'relative',
		// Enhanced shadows for depth
		shadowColor: '#000',
		shadowOffset: {width: 0, height: 5},
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 10
	},
	cardBorder: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		borderRadius: 15,
		borderWidth: 0.5,
		borderColor: 'rgba(255, 255, 255, 0.2)',
		overflow: 'hidden'
		// This subtle border adds definition to the card edges
	},
	profileCard: {
		width: 180,
		height: 250,
		overflow: 'hidden',
		borderRadius: 15
	},
	backgroundImage: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		width: '100%',
		height: '100%',
		resizeMode: 'cover'
	},
	backgroundImageFallback: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0
	},
	gradientOverlay: {
		position: 'absolute',
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		zIndex: 1
		// Enhanced gradient for better depth perception
	},
	contentContainer: {
		flex: 1,
		padding: 12,
		justifyContent: 'space-between',
		zIndex: 2,
		alignItems: 'center'
	},

	nameText: {
		fontFamily: 'nunitoBold',
		fontSize: 18,
		color: '#fff',

		textAlign: 'center'

		// Enhanced text shadow for better readability
	},
	bottomContainer: {
		flexDirection: 'row',
		alignSelf: 'flex-end',
		alignItems: 'center',
		marginTop: 'auto',
		marginBottom: 10
	},
	profileImageOuterContainer: {
		position: 'absolute',
		bottom: 3,
		left: 3,
		padding: 2,
		borderRadius: 27,
		backgroundColor: 'rgba(0, 0, 0, 0.3)',
		shadowColor: '#000',
		shadowOffset: {width: 0, height: 3},
		shadowOpacity: 0.5,
		shadowRadius: 5,
		elevation: 10
		// This outer container adds an extra shadow effect
	},
	profileImageContainer: {
		width: 47,
		height: 47,
		borderRadius: 25,
		borderWidth: 2,
		borderColor: '#fff',
		overflow: 'hidden',
		backgroundColor: 'rgba(204, 204, 204, 0.3)'
	},
	profileImage: {
		width: '100%',
		height: '100%',
		resizeMode: 'cover'
	},
	profileImageFallback: {
		width: '100%',
		height: '100%',
		backgroundColor: 'rgba(204, 204, 204, 0.5)'
	},
	buttonAdd: {
		backgroundColor: 'rgba(255, 255, 255, 0.95)',
		borderRadius: 20,
		paddingHorizontal: 12,
		paddingVertical: 6,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: '#000',
		shadowOffset: {width: 0, height: 2},
		shadowOpacity: 0.3,
		shadowRadius: 2,
		elevation: 3
		// Added shadow to the button for depth
	},
	buttonText: {
		fontFamily: 'nunitoBold',
		fontSize: 12,
		color: '#333',
		fontWeight: 'bold'
	}
})
