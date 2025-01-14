import {
	Alert,
	Dimensions,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ActivityStackParamList } from '../../navigation/ActivityNavigator';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useEffect, useState } from 'react';
import useConstantStore from '../../store/useConstantStore';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../utils/Colors';
import ActivityStyles from '../../utils/ActivityStyles';
import { ActivitySogModel } from '../../model/ActivitySogRepository';

type NavigationProp = StackNavigationProp<
	ActivityStackParamList,
	'FormDetailSog'
>;
type FormActivityRouteProp = RouteProp<ActivityStackParamList, 'FormDetailSog'>;
type FormActivityProps = {
	route: FormActivityRouteProp;
};
const activityStyles = ActivityStyles();
// Define the Brand type
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

export default function FormDetailSog({ route }: FormActivityProps) {
	const db = useSQLiteContext();
	const { item, activity } = route.params || {};
	const [brand, setBrand] = useState<Brand | null>(null);
	const navigation = useNavigation<NavigationProp>();

	const [activitySog, setActivitySog] = useState<
		{
			id?: number;
			call_plan_schedule_id: number;
			name: string;
			description: string;
			value: number;
			notes: string;
		}[]
	>([]);

	const { brands } = useConstantStore();
	useEffect(() => {
		const initializeBrands = async () => {
			try {
				// Get initial data
				const brandSource =
					item.callPlanOutlet?.brand || item.callPlanSurvey?.brand;
				const existingSog = await ActivitySogModel.findByCallPlanScheduleId(
					db,
					activity.call_plan_schedule_id
				);
				if (brands.length === 0) {
					setBrand(null);
					return;
				}

				// Find matching brand from constants
				const filteredBrand = brands.find((b) => b.brand === brandSource);
				if (!filteredBrand) {
					setBrand(null);
					return;
				}

				setBrand(filteredBrand);

				// If existing brands found in SQLite, use those
				if (existingSog.length > 0) {
					setActivitySog(existingSog);
					return;
				}

				const sogCount = filteredBrand.sog?.length;
				if (sogCount) {
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
			}
		};

		initializeBrands();
	}, [item.id, brands, activity.call_plan_schedule_id]);

	const insertSogToSqlite = async (data: any) => {
		try {
			console.log(JSON.stringify(data) + ' Data Sog');
			data.forEach(async (sog: any) => {
				if (sog.id) {
					await ActivitySogModel.update(db, sog);
				} else {
					await ActivitySogModel.create(db, sog);
				}
			});
		} catch (error) {
			console.error('Error inserting sio:', error);
			Alert.alert('Error', 'Failed to save sio. Please try again.');
		}
	};

	const goToOutlet = async () => {
		await insertSogToSqlite(activitySog);
		navigation.navigate('FormDetailOutlet', { item, activity });
		// setIsFullActivity(true); // Set state to true when button is clicked
	};
	const [collapsedStates, setCollapsedStates] = useState<boolean[]>(
		Array(brands.length).fill(false) // Initialize all items as collapsed
	);
	const toggleCollapse = (index: number) => {
		setCollapsedStates((prevStates) => {
			const newStates = [...prevStates];
			newStates[index] = !newStates[index]; // Toggle the specific index
			return newStates;
		});
	};
	if (!Array.isArray(activitySog)) {
		console.warn('activitySog is not an array:', activitySog);
		return null; // or return a fallback UI
	}
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
						backgroundColor: Colors.buttonBackground,
						marginHorizontal: 8,
					}}
				/>
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
						backgroundColor: Colors.buttonBackground,
						marginHorizontal: 8,
					}}
				/>
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
			</View>
		);
	};

	return (
		<ScrollView contentContainerStyle={activityStyles.container}>
			<Text style={activityStyles.title}>Source Of Goods (SOG)</Text>
			{activitySog?.map((sog, index) => (
				<View
					key={index}
					style={activityStyles.cardContainer}>
					<View style={activityStyles.card}>
						{/* Toggle Button as Icon */}
						<Text style={activityStyles.toggleText}>{sog.name}</Text>
						<TouchableOpacity
							onPress={() => toggleCollapse(index)}
							style={[
								activityStyles.iconButton,
								{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
							]}>
							<MaterialIcons
								name={
									collapsedStates[index]
										? 'keyboard-arrow-down'
										: 'keyboard-arrow-up'
								}
								size={24}
								color="#333"
							/>
						</TouchableOpacity>
						{!collapsedStates[index] && (
							<View style={activityStyles.cardContent}>
								{/* Text Fields */}
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
											const newActivitySog = [...activitySog];
											newActivitySog[index].value = Number(text);
											setActivitySog(newActivitySog);
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
					onPress={goToOutlet}>
					<Text
						style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
						Next
					</Text>
				</TouchableOpacity>
			</View>
			{footer()}
		</ScrollView>
	);
}
