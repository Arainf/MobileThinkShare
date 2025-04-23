import {StyleSheet, Text, TouchableOpacity, View, Image} from 'react-native'
import {LinearGradient} from 'expo-linear-gradient'
import React from 'react'
import {useRouter, Link} from 'expo-router'

interface ProfileCards {
	id: string
	full_name: string
	portrait_banner?: string
	profile_image?: string
}

export default function ProfileCardsElement({ProfileCards, id}: {ProfileCards: ProfileCards; id: string}) {
	const router = useRouter()

	return (
		<Link
			style={{padding: 0, margin: 0}}
			href={{
				pathname: '/profiles/[id]',
				params: {id: id}
			}}>
			<View style={styles.profileCard}>
				{/* Background Image */}
				{ProfileCards.portrait_banner ? (
					<Image
						source={{
							uri: `${ProfileCards.portrait_banner}?t=${Date.now()}`
						}}
						style={styles.backgroundImage}
					/>
				) : (
					<View style={[styles.backgroundImage, {backgroundColor: '#374151'}]} />
				)}
				<LinearGradient
					colors={['rgba(0, 0, 0, 0.66)', 'rgba(0, 0, 0, 0)']}
					start={{x: 0, y: 0}}
					end={{x: 0, y: 1}}
					style={styles.gradientOverlay}
				/>
				<Text style={styles.profileCardText}>{ProfileCards.full_name}</Text>
				<View style={styles.bottomContainer}>
					<View style={styles.profileImagePlaceholder}>
						{/* Profile Image */}
						{ProfileCards.profile_image ? (
							<Image
								source={{
									uri: `${
										ProfileCards.profile_image
									}?t=${Date.now()}`
								}}
								style={styles.profileImage}
							/>
						) : (
							<Text style={styles.profileImagePlaceholderText}></Text>
						)}
					</View>
					<TouchableOpacity style={styles.buttonAdd}>
						<Text style={styles.buttonText}>+ Add Friend</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Link>
	)
}

const styles = StyleSheet.create({
	profileCard: {
		width: 180,
		height: 230,
		borderRadius: 18,
		overflow: 'hidden',
		alignItems: 'center',
		backgroundColor: '#374151',
		elevation: 10,
		shadowColor: '#000',
		shadowOffset: {width: 0, height: 5},
		shadowOpacity: 0.3,
		shadowRadius: 10,
		justifyContent: 'space-between',
		padding: 0,
		margin: 0
	},
	profileImage: {
		width: 40,
		height: 40,
		borderRadius: 18,
		borderWidth: 2,
		borderColor: '#fff'
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
		top: 0
	},
	profileImagePlaceholder: {
		width: 40,
		height: 40,
		borderRadius: 18,
		backgroundColor: 'rgba(204, 204, 204, 0.7)',
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 2,
		borderColor: '#fff'
	},
	profileImagePlaceholderText: {
		fontSize: 24,
		color: '#fff',
		fontWeight: 'bold'
	},
	profileCardText: {
		fontFamily: 'nunitoBold',
		color: '#fff',
		textAlign: 'center',
		padding: 10
	},
	bottomContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%',
		padding: 10
	},
	buttonAdd: {
		backgroundColor: '#fff',
		borderRadius: 15,
		justifyContent: 'center',
		height: 'auto',
		width: 'auto',
		paddingHorizontal: 10,
		paddingVertical: 5
	},
	buttonText: {
		fontFamily: 'nunitoBold',
		fontSize: 10
	}
})
