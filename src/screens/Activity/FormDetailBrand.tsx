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
import React, { useEffect, useState } from 'react';
import useConstantStore from '../../store/useConstantStore';
import Colors from '../../utils/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import { ActivityRepository } from '../../model/ActivityRepository';
import { ActivityBranchModel } from '../../model/ActivityBranchRepository';

const { width, height } = Dimensions.get('window');
type NavigationProp = StackNavigationProp<
	ActivityStackParamList,
	'FormDetailBrand'
>;
type FormActivityRouteProp = RouteProp<
	ActivityStackParamList,
	'FormDetailBrand'
>;
type FormActivityProps = {
	route: FormActivityRouteProp;
};

export default function FormDetailBrand({ route }: FormActivityProps) {
	const db = useSQLiteContext();
	const { item, activity } = route.params || {};
	const navigation = useNavigation<NavigationProp>();
	const [brand, setBrand] = useState<[] | null>(null);
	const [saleOutletWeekly, setSaleOutletWeekly] = useState(0);

	const [activityBrand, setActivityBrand] = useState<
		{
			id?: number;
			call_plan_schedule_id: number;
			name: string;
			value: number;
			description: string;
			notes: string;
		}[]
	>([]);

	const { brands } = useConstantStore();

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

	const getSaleOutletWeekly = async () => {
		const activities = await ActivityRepository.findByCallPlanScheduleId(
			db,
			activity.call_plan_schedule_id
		);
		const findActivity = activities[0];
		if (findActivity) {
			setSaleOutletWeekly(findActivity.sale_outlet_weekly ?? 0);
		}
	};

	const getBrandSqlite = async () => {
		try {
			const activities = await ActivityBranchModel.findByCallPlanScheduleId(
				db,
				activity.call_plan_schedule_id
			);
			return activities;
		} catch (error) {
			console.error('Error fetching brands from SQLite:', error);
			return [];
		}
	};

	useEffect(() => {
		const initializeBrands = async () => {
			try {
				// Get initial data
				await getSaleOutletWeekly();
				const existingBrands = await getBrandSqlite();
				const brandSource =
					item.callPlanOutlet?.brand || item.callPlanSurvey?.brand;

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
				if (existingBrands.length > 0) {
					setActivityBrand(existingBrands);
					return;
				}

				// Otherwise create new activity brands if branches exist
				const branchCount = filteredBrand.branch?.length;
				if (branchCount) {
					const newActivityBrands = filteredBrand.branch.map(
						(branchName: string) => ({
							call_plan_schedule_id: activity.call_plan_schedule_id,
							name: branchName,
							value: 0,
							description: '',
							notes: '',
							id: 0,
						})
					);
					setActivityBrand(newActivityBrands);
				}
			} catch (error) {
				console.error('Error initializing brands:', error);
			}
		};

		initializeBrands();
	}, [item.id, brands, activity.call_plan_schedule_id]);

	const updateSaleOutletWeekly = async (data: number) => {
		const activities = await ActivityRepository.findByCallPlanScheduleId(
			db,
			activity.call_plan_schedule_id
		);
		const findActivity = activities[0];
		if (findActivity) {
			findActivity.sale_outlet_weekly = data;
			await ActivityRepository.update(db, findActivity);
		}
	};

	const insertBrandToSqlite = async (data: any) => {
		try {
			data.forEach((activityBrand: any) => {
				if (activityBrand.id) {
					ActivityBranchModel.update(db, activityBrand);
				} else {
					ActivityBranchModel.create(db, activityBrand);
				}
			});
		} catch (error) {
			console.error('Error inserting branch:', error);
			Alert.alert('Error', 'Failed to save branch. Please try again.');
		}
	};

	const goToSog = async () => {
		await insertBrandToSqlite(activityBrand);
		await updateSaleOutletWeekly(saleOutletWeekly);
		navigation.navigate('FormDetailSog', { item, activity });
	};

	const [collapsedStates, setCollapsedStates] = useState<boolean[]>(
		Array(brands.length).fill(false)
	);

	const toggleCollapse = (index: number) => {
		setCollapsedStates((prevStates) => {
			const newStates = [...prevStates];
			newStates[index] = !newStates[index];
			return newStates;
		});
	};
	if (!Array.isArray(activityBrand)) {
		console.warn('activityBrand is not an array:', activityBrand);
		return null;
	}

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<View style={[styles.cardContainer]}>
				<View style={styles.card}>
					<View>
						<Text
							style={[
								styles.label,
								{ alignItems: 'flex-end', marginBottom: 8 },
							]}>
							Total Penjualan Outlet / Minggu
						</Text>
						<View style={[styles.row, { flexDirection: 'row' }]}>
							<TextInput
								style={[styles.input, { flex: 1 }]}
								placeholder="0"
								value={saleOutletWeekly.toString()}
								keyboardType="numeric"
								onChangeText={(text) => {
									setSaleOutletWeekly(Number(text));
								}}
							/>
							<Text
								style={[
									styles.label,
									{ marginLeft: 10, marginTop: 10 },
								]}>
								{' '}
								/ Bungkus
							</Text>
						</View>
					</View>
				</View>
			</View>

			<Text style={styles.title}>Stock Brand</Text>
			{activityBrand?.map((brand, index) => (
				<View key={index} style={styles.cardContainer}>
					<View style={styles.card}>
						<Text style={styles.toggleText}>{brand.name}</Text>
						<TouchableOpacity
							onPress={() => toggleCollapse(index)}
							style={[
								styles.iconButton,
								{
									width: 40,
									height: 40,
									justifyContent: 'center',
									alignItems: 'center',
								},
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
							<View style={styles.cardContent}>
								<View>
									<Text
										style={[
											styles.label,
											{ alignItems: 'flex-end', marginBottom: 8 },
										]}>
										Total (/Bungkus) :
									</Text>
									<TextInput
										style={[styles.input, { flex: 1 }]}
										value={brand.value.toString()}
										keyboardType="numeric"
										onChangeText={(text) => {
											const newActivityBrand = [...activityBrand];
											newActivityBrand[index].value = Number(text);
											setActivityBrand(newActivityBrand);
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
					onPress={goToSog}>
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

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		backgroundColor: '#f5f5f5',
	},
	image: {
		width: Dimensions.get('window').width,
		height: 200,
	},
	title: {
		fontSize: 20,
		fontWeight: 'bold',
		marginHorizontal: 16,
		marginTop: 16,
		marginBottom: 8,
		textAlign: 'center',
	},
	cardContainer: {
		marginHorizontal: 16,
		marginTop: 8,
	},
	toggleText: {
		fontSize: 14,
		color: '#333',
		marginRight: 4,
	},
	card: {
		width: width - 40,
		backgroundColor: '#fff',
		borderRadius: 8,
		padding: 16,
		elevation: 4,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
		position: 'relative',
	},
	iconButton: {
		position: 'absolute',
		top: 8,
		right: 8,
		zIndex: 1,
	},
	cardContent: {
		marginTop: 8,
	},
	row: {
		width: '100%',
		flexDirection: 'row',

		marginBottom: 12,
		justifyContent: 'space-between',
	},
	label: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#333',
		marginRight: 8,
		textTransform: 'capitalize',
	},
	value: {
		fontSize: 16,
		color: '#555',
	},
	input: {
		height: height * 0.05,
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 5,
		paddingHorizontal: width * 0.02,
		marginBottom: height * 0.015,
		backgroundColor: '#fff',
	},
	imageContainer: {
		flex: 1,
		position: 'relative',
		alignItems: 'center',
		backgroundColor: '#ddd',
		borderRadius: 10,
		margin: 10,
	},
	clearButton: {
		marginTop: height * 0.01,
		backgroundColor: 'red',
		padding: height * 0.01,
		borderRadius: 5,
	},
	imagePreview: {
		width: width * 0.25,
		height: width * 0.25,
		marginTop: height * 0.014,
		borderRadius: 5,
	},
	photoButton: {
		width: '100%',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: Colors.secondaryColor,
		padding: 4,
		borderRadius: 5,
		margin: 4,
	},
	containerDropdown: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'flex-start',
		padding: 10,
		backgroundColor: '#f9f9f9',
	},
	dropdownButton: {
		padding: 15,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#ccc',
		backgroundColor: '#fff',
		width: '100%',
		alignItems: 'center',
	},
	buttonText: {
		fontSize: 16,
		color: '#555',
	},
	dropdown: {
		marginTop: 10,
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 8,
		backgroundColor: '#fff',
		width: '100%',
	},
	optionContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 10,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
	},
	optionLabel: {
		marginLeft: 10,
		fontSize: 16,
		color: '#333',
	},
	customCheckbox: {
		width: 20,
		height: 20,
		borderRadius: 4,
		borderWidth: 2,
		borderColor: '#007bff',
		justifyContent: 'center',
		alignItems: 'center',
	},
	checkmark: {
		width: 10,
		height: 10,
		backgroundColor: '#fff',
		borderRadius: 2,
	},
	button: {
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: Colors.buttonBackground,
		borderRadius: 10,
		padding: 6,
		marginHorizontal: 15,
		marginVertical: 10,
	},
	pickerContainer: {
		width: '100%',
		height: height * 0.06,
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 5,
		marginBottom: height * 0.015,
		backgroundColor: '#fff',
		justifyContent: 'center',
	},
});
