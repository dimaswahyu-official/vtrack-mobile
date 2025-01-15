import {
	Alert,
	Dimensions,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ActivityStackParamList } from '../../navigation/ActivityNavigator';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useEffect, useState, useCallback } from 'react';
import useConstantStore from '../../store/useConstantStore';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../utils/Colors';
import ActivityStyles from '../../utils/ActivityStyles';
import { ActivitySogModel } from '../../model/ActivitySogRepository';

const { width, height } = Dimensions.get('window');
type NavigationProp = StackNavigationProp<
	ActivityStackParamList,
	'FormDetailSog'
>;
type FormActivityRouteProp = RouteProp<ActivityStackParamList, 'FormDetailSog'>;
type FormActivityProps = {
	route: FormActivityRouteProp;
};
const activityStyles = ActivityStyles();

// Define the Brand type with proper validation
type Brand = {
	brand: string;
	created_at: string;
	created_by: string | null;
	deleted_at: string | null;
	deleted_by: string | null;
	id: number;
	sog: string[];
	updated_at: string;
};

// Define ActivitySog type for better type safety
type ActivitySog = {
	id?: number;
	call_plan_schedule_id: number;
	name: string;
	description: string;
	value: number;
	notes: string;
};

export default function FormDetailSog({ route }: FormActivityProps) {
	const db = useSQLiteContext();
	const { item, activity } = route.params || {};
	const [brand, setBrand] = useState<Brand | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const navigation = useNavigation<NavigationProp>();

	const [activitySog, setActivitySog] = useState<ActivitySog[]>([]);
	const { brands } = useConstantStore();

	// Enhanced initialization with proper error handling
	useEffect(() => {
		const initializeBrands = async () => {
			try {
				setIsLoading(true);
				const brandSource =
					item.callPlanOutlet?.brand || item.callPlanSurvey?.brand;
				
				if (!brandSource) {
					throw new Error('Brand source not found');
				}

				const existingSog = await ActivitySogModel.findByCallPlanScheduleId(
					db,
					activity.call_plan_schedule_id
				);

				if (brands.length === 0) {
					throw new Error('No brands available');
				}

				const filteredBrand = brands.find((b) => b.brand === brandSource);
				if (!filteredBrand) {
					throw new Error('Matching brand not found');
				}

				setBrand(filteredBrand);

				if (existingSog.length > 0) {
					setActivitySog(existingSog);
					return;
				}

				if (filteredBrand.sog?.length) {
					const newActivitySog = filteredBrand.sog.map(
						(sogName: string) => ({
							call_plan_schedule_id: activity.call_plan_schedule_id,
							name: sogName,
							value: 0,
							description: '',
							notes: '',
						})
					);
					setActivitySog(newActivitySog);
				}
			} catch (error) {
				console.error('Error initializing brands:', error);
				Alert.alert('Error', error instanceof Error ? error.message : 'Failed to initialize brands');
			} finally {
				setIsLoading(false);
			}
		};

		initializeBrands();
	}, [item.id, brands, activity.call_plan_schedule_id, db]);

	// Enhanced SQLite operations with proper validation
	const insertSogToSqlite = async (data: ActivitySog[]) => {
		try {
			setIsLoading(true);
			await Promise.all(
				data.map(async (sog) => {
					if (!sog.name || sog.value < 0) {
						throw new Error('Invalid SOG data');
					}
					
					if (sog.id) {
						await ActivitySogModel.update(db, sog);
					} else {
						await ActivitySogModel.create(db, {
							...sog,
							is_sync: 0
						});
					}
				})
			);
		} catch (error) {
			console.error('Error inserting SOG:', error);
			Alert.alert('Error', 'Failed to save SOG data. Please try again.');
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const goToOutlet = async () => {
		try {
			if (isLoading) return;
			
			await insertSogToSqlite(activitySog);
			
			// Validate all required data is present
			const isValid = activitySog.every(sog => sog.value >= 0);
			if (!isValid) {
				Alert.alert('Validation Error', 'Please ensure all values are valid');
				return;
			}

			navigation.navigate('FormDetailOutlet', { item, activity });
		} catch (error) {
			console.error('Error navigating to outlet:', error);
			Alert.alert('Error', 'Failed to proceed. Please try again.');
		}
	};

	const [collapsedStates, setCollapsedStates] = useState<boolean[]>(
		Array(brands.length).fill(false)
	);

	const toggleCollapse = useCallback((index: number) => {
		setCollapsedStates((prevStates) => {
			const newStates = [...prevStates];
			newStates[index] = !newStates[index];
			return newStates;
		});
	}, []);

	if (!Array.isArray(activitySog)) {
		console.warn('activitySog is not an array:', activitySog);
		return null;
	}

	const footer = useCallback(() => {
		return (
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
								backgroundColor: index < 3 ? Colors.buttonBackground : 'white',
							}}
						/>
						{index < 3 && (
							<View
								style={{
									width: 50,
									height: 2,
									backgroundColor: index < 2 ? Colors.buttonBackground : 'grey',
									marginHorizontal: 8,
								}}
							/>
						)}
					</React.Fragment>
				))}
			</View>
		);
	}, []);

	return (
		<ScrollView contentContainerStyle={activityStyles.container}>
			<Text style={activityStyles.title}>Source Of Goods (SOG)</Text>
			{activitySog?.map((sog, index) => (
				<View
					key={index}
					style={activityStyles.cardContainer}>
					<View style={activityStyles.card}>
						<Text style={activityStyles.toggleText}>{sog.name}</Text>
						<TouchableOpacity
							onPress={() => toggleCollapse(index)}
							style={[
								activityStyles.iconButton,
								{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
							]}>
							<MaterialIcons
								name={collapsedStates[index] ? 'keyboard-arrow-down' : 'keyboard-arrow-up'}
								size={24}
								color="#333"
							/>
						</TouchableOpacity>
						{!collapsedStates[index] && (
							<View style={activityStyles.cardContent}>
								<View>
									<Text
										style={[
											activityStyles.label,
											{ alignItems: 'flex-end', marginBottom: 8 },
										]}>
										Total (/Bungkus) :
									</Text>
									<TextInput
										style={[activityStyles.input, { flex: 1 }]}
										placeholder="Stock (/Bungkus)"
										value={sog.value.toString()}
										keyboardType="numeric"
										onChangeText={(text) => {
											const value = Number(text);
											if (isNaN(value) || value < 0) return;
											
											setActivitySog(prev => {
												const newSog = [...prev];
												newSog[index] = { ...newSog[index], value };
												return newSog;
											});
										}}
									/>
								</View>
							</View>
						)}
					</View>
				</View>
			))}
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
					disabled={isLoading}
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
						opacity: isLoading ? 0.7 : 1,
					}}
					disabled={isLoading}
					onPress={goToOutlet}>
					<Text
						style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
						{isLoading ? 'Loading...' : 'Next'}
					</Text>
				</TouchableOpacity>
			</View>
			{footer()}
		</ScrollView>
	);
}
