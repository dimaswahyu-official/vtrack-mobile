import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableWithoutFeedback,
    Animated,
    RefreshControl,
    TouchableOpacity,
    Image,
    Linking,
    Dimensions
} from 'react-native';
import ActivityService from '../services/activityService';
import { useAuthStore } from '../store/useAuthStore';
import Colors from "../utils/Colors";
import { ActivityModel, createTableActivity } from "../model/activityModel";
import { useOffline } from "../context/OfflineProvider";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { formatDate } from "../utils/DateHelper";
import { StackNavigationProp } from "@react-navigation/stack";
import { ActivityStackParamList } from "../navigation/ActivityNavigator";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { getStatusLabel } from '../constants/status';
import { useSQLiteContext } from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

interface Activity {
    id: number;
    user_id: number;
    call_plan_id: number;
    outlet_id: number;
    code_call_plan: string;
    status: number;
    type: number;
    day_plan: string;
    notes: string;
    callPlanOutlet: {
        id: number;
        name: string;
        brand: string;
        outlet_code: string;
        latitude: string;
        longitude: string;
        sio_type: string;
        region: string;
        area: string;
        cycle: string;
        visit_day: string;
        odd_even: string;
        range_health_facilities: number;
        range_work_place: number;
        range_public_transportation_facilities: number;
        range_worship_facilities: number;
        range_playground_facilities: number;
        range_educational_facilities: number;
        photos: [];
    };
}

type NavigationProp = StackNavigationProp<ActivityStackParamList, 'Activity'>;

export default function ActivityScreen() {
    const db = useSQLiteContext();
    const navigation = useNavigation<NavigationProp>();
    const { isOnline, isWifi } = useOffline();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuthStore();
    const userId = user?.id || '';

    const fetchData = async () => {
        setRefreshing(true);
        try {
            if (!isOnline) {
                
                const getDataOffline = await ActivityModel.getAllActivity(db);
                // Load data from AsyncStorage if offline
                const storedActivities = await AsyncStorage.getItem('activities');
                if (storedActivities) {
                    setActivities(JSON.parse(storedActivities));
                    Toast.show({ type: "info", text1: "Offline Mode", text2: "Showing cached data." });
                } else {
                    Toast.show({ type: "error", text1: "No Internet Connection", text2: "No cached data available." });
                }
                setRefreshing(false);
                return;
            }

            const response = await ActivityService.getListingSchedule(userId);
            const data: Activity[] = await response.data;
            setActivities(data);
            // Store the fetched data in AsyncStorage
            await AsyncStorage.setItem('activities', JSON.stringify(data));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setRefreshing(false);
        }
    };

    const initializeDatabase = async () => {
        await createTableActivity(db);
        await ActivityModel.clear(db);
    };
    useEffect(() => {
        initializeDatabase();
    }, [db]);

    useEffect(() => {
        fetchData();
    }, [isOnline, isWifi]);

    const toggleSelection = (id: number) => {
        console.log(id);
    };

    const openMaps = (latitude: string, longitude: string) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
        Linking.openURL(url).catch((err) => {
            console.error("Failed to open map", err);
            Toast.show({ type: "error", text1: "Failed to open map" });
        });
    };

    const handlePressWork = (item: any) => {
        navigation.navigate('FormActivityNormal', { item });
    };

    const renderItem = ({ item }: { item: Activity }) => {
        const scaleAnim = new Animated.Value(1);

        const onPressIn = () => {
            Animated.spring(scaleAnim, {
                toValue: 0.95,
                useNativeDriver: true,
            }).start();
        };

        const onPressOut = () => {
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
            }).start();
        };

        return (
            <TouchableWithoutFeedback
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                onPress={() => toggleSelection(item.id)}
            >
                <Animated.View
                    style={[
                        styles.card,
                        { transform: [{ scale: scaleAnim }] },
                    ]}
                >
                    <View style={styles.row}>
                        {/* Column 1 */}
                        <View style={styles.col1}>
                            <Text style={[styles.title, { fontStyle: 'italic' }]}>{item.code_call_plan}</Text>
                            <Text style={[styles.description, { fontStyle: 'italic' }]}>{item.callPlanOutlet.sio_type}</Text>
                            <View style={styles.divider} />
                            <Text style={styles.description}>{item.type === 1 ? 'Outlet New, ' : ''}{getStatusLabel(item.status as any)}</Text>
                            <View style={styles.divider} />
                            <Text style={styles.description}>Schedule: {formatDate(item.day_plan)}</Text>
                            <View style={styles.divider} />
                            <Text style={styles.description}>Cycle: {item.callPlanOutlet.cycle} - Visit Day: {item.callPlanOutlet.visit_day}</Text>
                            <View style={styles.divider} />
                            <Text style={styles.description}>{item.notes?.toUpperCase() || ''}</Text>
                        </View>
                        {/* Column 2 */}
                        <View style={styles.col2}>
                            <Image
                                style={styles.image}
                                source={require('../../assets/logo-nna.png')}
                            />
                            <Text style={styles.brand}>{item.callPlanOutlet.brand.toUpperCase()}</Text>
                            <View style={[styles.row, { marginTop: height * 0.01 }]}>
                                <TouchableOpacity style={styles.buttonWork} onPress={() => openMaps('-6.198453', '106.802473')}>
                                    <MaterialCommunityIcons name="google-maps" size={22} color={Colors.buttonBackground} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.buttonWork} onPress={() => handlePressWork(item)}>
                                    <MaterialIcons name="input" size={22} color={Colors.buttonBackground} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            </TouchableWithoutFeedback>
        );
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
    };

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>Error: {error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Route's Schedule Plan</Text>
            <FlatList
                data={activities}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        padding: width * 0.02,
    },
    divider: {
        height: 1,
        backgroundColor: '#ccc',
        marginVertical: height * 0.005,
    },
    image: {
        width: "80%",
        height: height * 0.05,
        marginTop: 5,
        resizeMode: 'contain',
    },
    buttonWork: {
        marginTop: height * 0.01,
        backgroundColor: 'transparent',
        padding: height * 0.015,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 3,
        borderWidth: 2,
        borderColor: Colors.buttonBackground,
    },
    header: {
        fontSize: width > 400 ? 24 : 20,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: height * 0.02,
        textAlign: 'left',
    },
    list: {
        paddingBottom: height * 0.02,
    },
    card: {
        backgroundColor: '#fcf6f3',
        borderRadius: 15,
        padding: height * 0.02,
        marginBottom: height * 0.02,
        shadowColor: 'rgba(150,145,145,0.75)',
        shadowOpacity: 0.5,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
        borderLeftWidth: 3,
        borderTopWidth: 3,
        borderLeftColor: Colors.secondaryColor,
        borderTopColor: Colors.secondaryColor,
    },
    title: {
        fontSize: width > 400 ? 18 : 16,
        fontWeight: '700',
        color: 'black',
    },
    description: {
        fontSize: width > 400 ? 16 : 14,
        fontWeight: '400',
        color: 'black',
    },
    brand: {
        fontSize: width > 400 ? 16 : 14,
        fontWeight: '800',
        color: 'black',
        marginVertical: height * 0.01,
        fontStyle: 'italic'
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
    },
    errorText: {
        fontSize: 16,
        color: '#E53935',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    col1: {
        flex: 2,
        paddingRight: 10,
    },
    col2: {
        flex: 1,
        alignItems: 'flex-end',
    },
});
