import {
	FlatList,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
	Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ActivityStackParamList } from '../../navigation/ActivityNavigator';
import {RouteProp, StackActions, useNavigation} from '@react-navigation/native';
import ActivityStyles from '../../utils/ActivityStyles';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useEffect, useState, useCallback } from 'react';
import Colors from '../../utils/Colors';
import { ActivityOutletModel } from '../../model/ActivityOutletRepository';
import { ActivityRepository } from '../../model/ActivityRepository';
import * as Location from 'expo-location';
import { sendOfflineData } from '../../services/sendOfflineData';
import {useOffline} from "../../context/OfflineProvider";
import {useLoadingStore} from "../../store/useLoadingStore";

type NavigationProp = StackNavigationProp<
	ActivityStackParamList,
	'FormDetailOutlet'
>;
type FormActivityRouteProp = RouteProp<
	ActivityStackParamList,
	'FormDetailOutlet'
>;
type FormActivityProps = {
	route: FormActivityRouteProp;
};

type Outlet = {
	id?: number;
	label: string;
	value: number;
};

const activityStyles = ActivityStyles();

export default function FormDetailOutlet({ route }: FormActivityProps) {
	const db = useSQLiteContext();
	const { item, activity } = route.params || {};
	const { setLoading } = useLoadingStore();
	const navigation = useNavigation<NavigationProp>();
	const [outletFacilities, setOutletFacilities] = useState<Outlet[]>([]);
	const [isDropdownVisible, setIsDropdownVisible] = useState(false);
	const [selectedValues, setSelectedValues] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const { isOnline, isWifi } = useOffline();
	const outlet = [
		{
			title: 'JARAK LEBIH DARI FASILITAS KESEHATAN (RS, PUSKESMAS, KLINIK)',
			label: 'range_health_facilities',
		},
		{
			title: 'JARAK LEBIH DARI 200m SARANA PENDIDIKAN (SEKOLAH KAMPUS PAUD DLL)',
			label: 'range_educational_facilities',
		},
		{
			title: 'JARAK LEBIH DARI 200m TEMPAT BERMAIN ANAK (TAMAN ,PLAYGROUND)',
			label: 'range_playground_facilities',
		},
		{
			title: 'JARAK LEBIH DARI 500m TEMPAT IBADAH (MESJID, MUSHOLA, PURA, VIHARA, GEREJA,PESANTREN)',
			label: 'range_worship_facilities',
		},
		{
			title: 'JARAK LEBIH DARI 500m ANGKUTAN UMUM (HALTE, TERMINAL, AIRPORT, STASIUN)',
			label: 'range_public_transportation_facilities',
		},
		{
			title: 'JARAK LEBIH DARI 500m TEMPAT KERJA (KANTOR PEMERINTAHAN)',
			label: 'range_work_place',
		},
	];

	// Initialize outlet facilities from existing data
	useEffect(() => {
		const initializeOutletFacilities = async () => {
			try {
				const existingFacilities =
					await ActivityOutletModel.findByCallPlanScheduleId(
						db,
						activity.call_plan_schedule_id
					);

				if (existingFacilities.length > 0) {
					setOutletFacilities(existingFacilities);
					setSelectedValues(
						existingFacilities
							.filter((facility) => facility.value === 1)
							.map((facility) => facility.label)
					);
				} else {
					// Set default facilities if none exist
					const defaultFacilities = [
						'range_health_facilities',
						'range_educational_facilities',
						'range_playground_facilities',
						'range_worship_facilities',
						'range_public_transportation_facilities',
						'range_work_place',
					].map((label) => ({
						label,
						value:
							item?.callPlanOutlet?.[label] ||
							item?.callPlanSurvey?.[label] ||
							0,
					}));
					setOutletFacilities(defaultFacilities);
				}
			} catch (error) {
				console.error('Error initializing facilities:', error);
				Alert.alert('Error', 'Failed to load facility data');
			}
		};

		initializeOutletFacilities();
	}, [activity.call_plan_schedule_id, db, item]);

	const toggleSelection = useCallback((value: string) => {
		setSelectedValues((prev) =>
			prev.includes(value)
				? prev.filter((item) => item !== value)
				: [...prev, value]
		);
	}, []);

	const toggleSelectAll = useCallback(() => {
		setSelectedValues((prev) => {
			if (prev.length === outlet.length) {
				// If all items are already selected, clear the selection
				return [];
			} else {
				// Otherwise, select all items
				return outlet.map((item) => item.label);
			}
		});
	}, [outlet]);

	const submitOutlet = async () => {
		if (isLoading) return;
		setLoading(true)
		setIsLoading(true);
		try {
			const updatedFacilities = outletFacilities.map((facility) => ({
				...facility,
				value: selectedValues.includes(facility.label) ? 1 : 0,
				call_plan_schedule_id: activity.call_plan_schedule_id,
				is_sync: 0,
			}));

			// Add error handling for facility updates
			try {
				await Promise.all(
					updatedFacilities.map(async (facility) => {
						try {
							if (facility.id) {
								await ActivityOutletModel.update(db, facility);
							} else {
								await ActivityOutletModel.create(db, facility);
							}
						} catch (err) {
							console.error('Error updating/creating facility:', err);
							throw new Error(`Failed to save facility: ${err}`);
						}
					})
				);
			} catch (err) {
				throw new Error(`Database operation failed: ${err}`);
			}

			// Add error handling for location
			let coords;
			try {
				const location = await Location.getCurrentPositionAsync({
					accuracy: Location.Accuracy.High,
				});
				coords = location.coords;
			} catch (err) {
				console.error('Location error:', err);
				throw new Error('Failed to get current location. Please check location permissions.');
			}

			const { latitude, longitude } = coords;

			// Add error handling for activity update
			try {
				await ActivityRepository.update(db, {
					fulfilled: 1,
					status: 200,
					end_time: new Date().toISOString(),
					call_plan_schedule_id: activity.call_plan_schedule_id,
					latitude: latitude.toString(),
					longitude: longitude.toString(),
				});
			} catch (err) {
				console.error('Activity update error:', err);
				throw new Error('Failed to update activity status');
			}

			if (!isOnline || !isWifi) {
				return;
			} else {
				try {
					const submitToServer = await ActivityRepository.findActivityWithDetail(
						db,
						activity.call_plan_schedule_id
					);
					if (submitToServer[0]) {
						await sendOfflineData(submitToServer[0], db);
					}
				} catch (err) {
					console.error('Server sync error:', err);
					throw new Error('Failed to sync with server');
				}
			}
		} catch (error) {
			// Provide more detailed error messages
			console.error('Detailed error:', error);
			const errorMessage = (error as Error).message || 'An unexpected error occurred';
			Alert.alert(
				'Error Saving Data',
				`${errorMessage}\nPlease try again or contact support if the problem persists.`,
				[{ text: 'OK' }]
			);
		} finally {
			setIsLoading(false);
			setLoading(false);
			navigation.replace('Activity2')
		}
	};



	const CustomCheckbox = ({
		isChecked,
		onPress,
	}: {
		isChecked: boolean;
		onPress: () => void;
	}) => (
		<TouchableOpacity
			style={[
				activityStyles.customCheckbox,
				{ backgroundColor: isChecked ? Colors.buttonBackground : '#fff' },
			]}
			onPress={onPress}>
			{isChecked && (
				<Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 10 }}>
					✔
				</Text>
			)}
		</TouchableOpacity>
	);

	const renderOption = useCallback(
		({ item }: { item: any }) => (
			<TouchableOpacity
				style={activityStyles.optionContainer}
				onPress={() => toggleSelection(item.label)}>
				<CustomCheckbox
					isChecked={selectedValues.includes(item.label)}
					onPress={() => toggleSelection(item.label)}
				/>
				<Text style={[activityStyles.optionLabel, { paddingRight: 6 }]}>
					{item.title}
				</Text>
			</TouchableOpacity>
		),
		[selectedValues, toggleSelection]
	);

	const footer = () => (
		<View
			style={{
				flexDirection: 'row',
				justifyContent: 'center',
				marginVertical: 8,
				alignItems: 'center',
				padding: 8,
			}}>
			{[...Array(4)].map((_, index) => (
				<React.Fragment key={index}>
					<View
						style={{
							width: 10,
							height: 10,
							borderWidth: 0.5,
							borderRadius: 5,
							backgroundColor: Colors.buttonBackground,
						}}
					/>
					{index < 3 && (
						<View
							style={{
								width: 50,
								height: 2,
								backgroundColor: Colors.buttonBackground,
								marginHorizontal: 8,
							}}
						/>
					)}
				</React.Fragment>
			))}
		</View>
	);

	return (
		<ScrollView contentContainerStyle={activityStyles.container}>
			<View style={activityStyles.cardContainer}>
				<View style={activityStyles.card}>
					<View
						style={{
							padding: 6,
							justifyContent: 'flex-start',
							alignItems: 'flex-start',
						}}>
						<Text style={[activityStyles.label, { marginBottom: 6 }]}>
							Pastikan Outlet berada di jarak aman dari jarak berikut:
						</Text>
						<TouchableOpacity
							style={activityStyles.dropdownButton}
							onPress={() => setIsDropdownVisible((prev) => !prev)}>
							<Text style={activityStyles.buttonText}>
								{selectedValues.length > 0
									? `Area yang dipilih: ${selectedValues.length} Area`
									: 'Pilihan Area'}
							</Text>
						</TouchableOpacity>

						{isDropdownVisible && (
							<View style={activityStyles.dropdown}>
								<TouchableOpacity
									style={activityStyles.optionContainer}
									onPress={toggleSelectAll}>
									<CustomCheckbox
										isChecked={selectedValues.length === outlet.length}
										onPress={toggleSelectAll}
									/>
									<Text style={[activityStyles.optionLabel, { paddingRight: 6 }]}>
										PILIH SEMUA AREA
									</Text>
								</TouchableOpacity>
								<FlatList
									scrollEnabled={false}
									data={outlet}
									keyExtractor={(item) => item.label}
									renderItem={renderOption}
								/>
							</View>
						)}
					</View>
				</View>
			</View>
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
					onPress={() => navigation.goBack()}
					disabled={isLoading}>
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
						backgroundColor: isLoading
							? Colors.light.background
							: Colors.buttonBackground,
					}}
					onPress={submitOutlet}
					disabled={isLoading}>
					<Text
						style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
						{isLoading ? 'Submitting...' : 'Submit'}
					</Text>
				</TouchableOpacity>
			</View>
			{footer()}
		</ScrollView>
	);
}
