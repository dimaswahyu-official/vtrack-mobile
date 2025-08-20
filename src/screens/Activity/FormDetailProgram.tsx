import { StackNavigationProp } from '@react-navigation/stack';
import { ActivityStackParamList } from '../../navigation/ActivityNavigator';
import { RouteProp, useNavigation } from '@react-navigation/native';
import ActivityStyles from '../../utils/ActivityStyles';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useEffect, useState } from 'react';
import {
	Alert,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import Colors from '../../utils/Colors';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { ActivityProgramModel } from '../../model/ActivityProgramRepository';
import { ActivityRepository } from '../../model/ActivityRepository';
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import {useLoadingDialogStore} from "../../store/useLoadingStore";

type NavigationProp = StackNavigationProp<
	ActivityStackParamList,
	'FormDetailProgram'
>;
type FormActivityRouteProp = RouteProp<
	ActivityStackParamList,
	'FormDetailProgram'
>;
type FormActivityProps = {
	route: FormActivityRouteProp;
};

// Define the SioType type

export default function FormDetailProgram({ route }: FormActivityProps) {
	const db = useSQLiteContext();
	const { item, activity } = route.params || {};
	const navigation = useNavigation<NavigationProp>();
	const activityStyles = ActivityStyles();
	const {showLoadingDialog, hideLoadingDialog} = useLoadingDialogStore();
	const defaultImage = 'https://via.placeholder.com/100';
	type ActivityProgram = {
		photo_program?: string;
	};

	const [activityProgram, setActivityProgram] = useState<ActivityProgram>({});

	const [activityProgramCompetitor, setActivityProgramCompetitor] = useState<
		{
			name: string;
			photo: string;
			description: string;
			id?: number;
			call_plan_schedule_id: number;
		}[]
	>([]);

	const footer = () => {
		return (
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'center',
					marginVertical: 8,
					alignItems: 'center',
					padding: 8,
				}}>
				<View
					style={{
						width: 10,
						height: 10,
						borderWidth: 0.5,
						borderRadius: 5,
						backgroundColor: Colors.buttonBackground,
					}}
				/>
				<View
					style={{
						width: 50,
						height: 2,
						backgroundColor: 'grey',
						marginHorizontal: 8,
					}}
				/>
				<View
					style={{
						width: 10,
						height: 10,
						borderWidth: 0.5,
						borderRadius: 5,
						backgroundColor: 'white',
					}}
				/>
				<View
					style={{
						width: 50,
						height: 2,
						backgroundColor: 'grey',
						marginHorizontal: 8,
					}}
				/>
				<View
					style={{
						width: 10,
						height: 10,
						borderWidth: 0.5,
						borderRadius: 5,
						backgroundColor: 'white',
					}}
				/>
				<View
					style={{
						width: 50,
						height: 2,
						backgroundColor: 'grey',
						marginHorizontal: 8,
					}}
				/>
				<View
					style={{
						width: 10,
						height: 10,
						borderWidth: 0.5,
						borderRadius: 5,
						backgroundColor: 'white',
					}}
				/>
			</View>
		);
	};

	const validatePhotos = (program: any) => {
		if (!program[0]?.photo) {
			return {
				name: 'Main Program',
				description: 'Foto Bukti Menjalankan Program',
			};
		}
		return null;
	};

	const updateActivityProgram = async (data: any) => {
		const activities = await ActivityRepository.findByCallPlanScheduleId(
			db,
			activity.call_plan_schedule_id
		);
		const findActivity = activities[0];
		if (findActivity) {
			findActivity.photo_program = data.photo_program;
			await ActivityRepository.update(db, findActivity);
		}
		setActivityProgram(data);
	};

	const handleTakePhoto = async () => {
		try{
			showLoadingDialog('Processing...');
			// Request camera permissions
			const permissionResult =
				await ImagePicker.requestCameraPermissionsAsync();
			if (!permissionResult.granted) {
				Alert.alert(
					'Permission required',
					'Please grant permission to access the camera.'
				);
				return;
			}

			// Launch the camera
			const result = await ImagePicker.launchCameraAsync({
				allowsEditing: false,
				quality: 1,
			});

			// if (!result.canceled) {
			// 	const newActivityProgram = { ...activityProgram };
			// 	newActivityProgram.photo_program = result.assets[0].uri;
			// 	updateActivityProgram(newActivityProgram);
			// }

			if (!result.canceled) {
				// Get the file size of the original image
				const fileInfo = await FileSystem.getInfoAsync(result.assets[0].uri, { size: true });
				if (!fileInfo.exists) {
					Alert.alert('Error', 'File does not exist.');
					return;
				}

				let fileSizeInMB = fileInfo.size / (1024 * 1024); // Convert bytes to MB

				// Dynamically adjust compression quality to ensure the file size is below 1 MB
				let compressQuality = 0.9; // Start with 90% quality
				let compressedImage = result.assets[0].uri;

				while (fileSizeInMB >= 1 && compressQuality > 0.1) {
					// Use the correct manipulateAsync method
					const manipResult = await ImageManipulator.manipulateAsync(
						result.assets[0].uri,
						[{ resize: { width: 800 } }], // Resize the image to a width of 800px
						{ compress: compressQuality, format: ImageManipulator.SaveFormat.JPEG }
					);

					// Check the new file size
					const newFileInfo = await FileSystem.getInfoAsync(manipResult.uri, { size: true });
					if (!newFileInfo.exists) {
						Alert.alert('Error', 'Compressed file does not exist.');
						return;
					}

					fileSizeInMB = newFileInfo.size / (1024 * 1024);

					// Reduce quality for the next iteration
					compressQuality -= 0.1;

					// Update the compressed image URI
					compressedImage = manipResult.uri;
				}

				if (fileSizeInMB >= 1) {
					Alert.alert('Warning', 'Unable to compress the image below 2 MB.');
				} else {
					const newActivityProgram = { ...activityProgram };
					newActivityProgram.photo_program = compressedImage;
					updateActivityProgram(newActivityProgram);
				}
			}
		}catch(error){
			console.error('Error handling activity:', error);
			Alert.alert('Error', error instanceof Error ? error.message : 'An unknown error occurred');
		}finally {
			hideLoadingDialog()
		}


	};

	const handleClearPhoto = () => {
		const newActivityProgram = { ...activityProgram };
		newActivityProgram.photo_program = '';
		setActivityProgram(newActivityProgram);
	};

	const handleDeleteProgramCompetitor = async (index: number) => {
		const findDataByIndex = activityProgramCompetitor[index];
		if (findDataByIndex.id) {
			await ActivityProgramModel.delete(db, findDataByIndex.id);
		}
		setActivityProgramCompetitor((prev) =>
			prev.filter((_, i) => i !== index)
		);
	};

	const handleAddProgramCompetitor = () => {
		const newCompetitor = {
			name: '',
			photo: '',
			description: '',
			call_plan_schedule_id: activity.call_plan_schedule_id,
		};
		setActivityProgramCompetitor((prev) => [...prev, newCompetitor]);
	};

	const handleTakePhotoCompetitor = async (index: number) => {
		try{
			showLoadingDialog('Processing...');
			// Request camera permissions
			const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
			if (!permissionResult.granted) {
				Alert.alert(
					'Permission required',
					'Please grant permission to access the camera.'
				);
				return;
			}

			// Launch the camera
			const result = await ImagePicker.launchCameraAsync({
				allowsEditing: false,
				quality: 1,
			});

			// if (!result.canceled) {
			// 	const photoUri = result.assets[0].uri;
			// 	setActivityProgramCompetitor((prev) =>
			// 		prev.map((program, i) =>
			// 			i === index ? { ...program, photo: photoUri } : program
			// 		)
			// 	);
			// }

			if (!result.canceled) {
				// Get the file size of the original image
				const fileInfo = await FileSystem.getInfoAsync(result.assets[0].uri, { size: true });
				if (!fileInfo.exists) {
					Alert.alert('Error', 'File does not exist.');
					return;
				}

				let fileSizeInMB = fileInfo.size / (1024 * 1024); // Convert bytes to MB

				// Dynamically adjust compression quality to ensure the file size is below 1 MB
				let compressQuality = 0.9; // Start with 90% quality
				let compressedImage = result.assets[0].uri;

				while (fileSizeInMB >= 1 && compressQuality > 0.1) {
					// Use the correct manipulateAsync method
					const manipResult = await ImageManipulator.manipulateAsync(
						result.assets[0].uri,
						[{ resize: { width: 800 } }], // Resize the image to a width of 800px
						{ compress: compressQuality, format: ImageManipulator.SaveFormat.JPEG }
					);

					// Check the new file size
					const newFileInfo = await FileSystem.getInfoAsync(manipResult.uri, { size: true });
					if (!newFileInfo.exists) {
						Alert.alert('Error', 'Compressed file does not exist.');
						return;
					}

					fileSizeInMB = newFileInfo.size / (1024 * 1024);

					// Reduce quality for the next iteration
					compressQuality -= 0.1;

					// Update the compressed image URI
					compressedImage = manipResult.uri;
				}

				if (fileSizeInMB >= 1) {
					Alert.alert('Warning', 'Unable to compress the image below 2 MB.');
				} else {
					setActivityProgramCompetitor((prev) =>
						prev.map((program, i) =>
							i === index ? { ...program, photo: compressedImage } : program
						)
					);
				}
			}
		}catch(error){
			console.error('Error handling activity:', error);
			Alert.alert('Error', error instanceof Error ? error.message : 'An unknown error occurred');
		}finally {
			hideLoadingDialog()
		}

	};

	const handleClearPhotoCompetitor = (index: number) => {
		setActivityProgramCompetitor((prev) =>
			prev.map((program, i) =>
				i === index ? { ...program, photo: '' } : program
			)
		);
	};

	const insertProgramCompetitor = async (
		data: {
			name: string;
			photo: string;
			description: string;
			id?: number;
			call_plan_schedule_id: number;
		}[]
	) => {
		try {
			if (data.length > 0) {
				await Promise.all(
					data.map(async (program) => {
						if (program.id) {
							await ActivityProgramModel.update(db, program);
						} else {
							await ActivityProgramModel.create(db, {
								...program,
								is_sync: 0,
							});
						}
					})
				);
			}
		} catch (error) {
			console.error('Error processing Program Competitors:', error);
			Alert.alert(
				'Error',
				'Failed to save Program Competitors. Please try again.'
			);
			throw error;
		}
	};

	useEffect(() => {
		ActivityProgramModel.findByCallPlanScheduleId(
			db,
			activity.call_plan_schedule_id
		).then((response) => {
			if (!response || response.length === 0) {
				console.log('No data found for the given schedule ID.');
			} else {
				setActivityProgramCompetitor(response);
			}
		});

		ActivityRepository.findByCallPlanScheduleId(
			db,
			activity.call_plan_schedule_id
		).then((response) => {
			if (!response || response.length === 0) {
				console.log('No data found for the given schedule ID.');
			} else {
				setActivityProgram(response[0]);

			}
		});
	}, [activity.call_plan_schedule_id]);

	return (
		<ScrollView contentContainerStyle={activityStyles.container}>
			{/* Program Section */}
			{activity?.program_id ? (
				<>
					<Text style={activityStyles.title}>Program</Text>
					<View style={activityStyles.cardContainer}>
						<View style={activityStyles.card}>
							<View style={activityStyles.cardContent}>
								{/* Program Details */}
								<Text
									style={[
										activityStyles.label,
										{ alignItems: 'flex-end' },
									]}>
									{item.callPlanProgram.name ?? 'JUDUL PROGRAM'}
								</Text>
								<Text
									style={[
										activityStyles.buttonText,
										{ alignItems: 'flex-end' },
									]}>
									{item.callPlanProgram.description ?? 'Deskripsi PROGRAM'}
								</Text>
								<Text
									style={[
										activityStyles.label,
										{ alignItems: 'flex-end' },
									]}>
									Foto Bukti Menjalankan Program
								</Text>
								{/* Image Section */}
								<View style={activityStyles.imageContainer}>
									<Image
										source={{
											uri:
												activityProgram?.photo_program ||
												defaultImage,
										}}
										style={styles.image}
									/>
									{!activityProgram?.photo_program ? (
										<TouchableOpacity
											style={activityStyles.photoButton}
											onPress={handleTakePhoto}>
											<MaterialIcons
												name="camera-alt"
												size={24}
												color="#fff"
											/>
											<Text
												style={[
													activityStyles.label,
													{ color: 'white' },
												]}>
												New Photo
											</Text>
										</TouchableOpacity>
									) : (
										<TouchableOpacity
											style={activityStyles.clearButton}
											onPress={handleClearPhoto}>
											<MaterialIcons
												name="delete"
												size={15}
												color="#fff"
											/>
										</TouchableOpacity>
									)}
								</View>
							</View>
						</View>
					</View>
				</>
			) : null}

			{/* Competitor Program Section */}
			<Text style={activityStyles.title}>Program Competitor</Text>
			{activityProgramCompetitor?.map((program, index) => (
				<View style={activityStyles.cardContainer} key={index}>
					<View style={activityStyles.card}>
						<TouchableOpacity
							style={activityStyles.deleteButton}
							onPress={() => handleDeleteProgramCompetitor(index)}>
							<MaterialIcons name="delete" size={24} color="red" />
						</TouchableOpacity>
						<View style={activityStyles.cardContent}>
							{/* Competitor Details */}
							<Text
								style={[
									activityStyles.label,
									{ alignItems: 'flex-end' },
								]}>
								Nama Program:
							</Text>
							<TextInput
								style={[activityStyles.input, { flex: 1 }]}
								placeholder="Nama Program"
								placeholderTextColor={'#333'}
								value={program?.name || ''}
								onChangeText={(text) => {
									const newActivityCompetitor = [
										...activityProgramCompetitor,
									];
									newActivityCompetitor[index].name = text;
									setActivityProgramCompetitor(newActivityCompetitor);
								}}
							/>
							<Text
								style={[
									activityStyles.label,
									{ alignItems: 'flex-end' },
								]}>
								Deskripsi Program:
							</Text>
							<TextInput
								style={[activityStyles.input, { flex: 1 }]}
								placeholder="Deskripsi Program"
								placeholderTextColor={'#333'}
								value={program?.description || ''}
								onChangeText={(text) => {
									const newActivityCompetitor = [
										...activityProgramCompetitor,
									];
									newActivityCompetitor[index].description = text;
									setActivityProgramCompetitor(newActivityCompetitor);
								}}
							/>
							<Text
								style={[
									activityStyles.label,
									{ alignItems: 'flex-end' },
								]}>
								Foto Program Kompetitor (Jika Ada):
							</Text>
							{/* Image Section */}
							<View style={activityStyles.imageContainer}>
								<Image
									source={{ uri: program?.photo || defaultImage }}
									style={styles.image}
								/>
								{!program?.photo ? (
									<TouchableOpacity
										style={activityStyles.photoButton}
										onPress={() => handleTakePhotoCompetitor(index)}>
										<MaterialIcons
											name="camera-alt"
											size={24}
											color="#fff"
										/>
										<Text
											style={[
												activityStyles.label,
												{ color: 'white' },
											]}>
											New Photo
										</Text>
									</TouchableOpacity>
								) : (
									<TouchableOpacity
										style={activityStyles.clearButton}
										onPress={() => handleClearPhotoCompetitor(index)}>
										<MaterialIcons
											name="delete"
											size={15}
											color="#fff"
										/>
									</TouchableOpacity>
								)}
							</View>
						</View>
					</View>
				</View>
			))}
			{/*//add new card*/}
			<TouchableOpacity
				style={[styles.buttonAddProgram, { marginTop: 16 }]}
				onPress={handleAddProgramCompetitor}>
				<MaterialIcons name="add" size={24} color="#fff" />
				<Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8 }}>
					Add New Program Competitor
				</Text>
			</TouchableOpacity>

			{/* Navigation Buttons */}
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'space-between',
					padding: 16,
				}}>
				<TouchableOpacity
					style={{
						flex: 1,
						padding: 12,
						borderRadius: 8,
						alignItems: 'center',
						marginHorizontal: 8,
						backgroundColor: Colors.secondaryColor,
					}}
					onPress={() => navigation.goBack()}>
					<Text
						style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
						Back
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={{
						flex: 1,
						padding: 12,
						borderRadius: 8,
						alignItems: 'center',
						marginHorizontal: 8,
						backgroundColor: Colors.buttonBackground,
					}}
					onPress={() => {
						const missingPhoto = validatePhotos(activityProgram);
						if (missingPhoto && activity?.program_id.length>0) {
							Alert.alert(
								'Missing Photo',
								`Missing photo for:\nProgram: ${missingPhoto.name}\nDescription: ${missingPhoto.description}`
							);
							return;
						}
						if (activityProgramCompetitor?.length > 0) {
							insertProgramCompetitor(activityProgramCompetitor);
						}
						navigation.navigate('FormDetailBrand', { item, activity });
					}}>
					<Text
						style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
						Next
					</Text>
				</TouchableOpacity>
			</View>

			{/* Footer */}
			{footer()}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: '#fff',
		padding: 10,
		borderRadius: 8,
		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowRadius: 5,
		elevation: 3,
		margin: 10,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	column: {
		flex: 1,
		alignItems: 'center',
	},
	image: {
		width: 100,
		height: 100,
		borderRadius: 8,
		marginVertical: 10,
	},
	text: {
		fontSize: 14,
		color: '#333',
	},
	divider: {
		width: 1,
		backgroundColor: '#ccc',
		height: '100%',
		marginHorizontal: 10,
	},
	buttonAddProgram: {
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: Colors.buttonBackground,
		borderRadius: 10,
		flexDirection: 'row',
		padding: 6,
		marginHorizontal: 15,
		marginVertical: 10,
	},
});
