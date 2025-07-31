// Get screen dimensions
import {
    Animated,
    Dimensions,
    FlatList,
    Linking,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {ActivityStackParamList} from '../navigation/ActivityNavigator';
import {useSQLiteContext} from 'expo-sqlite';
import {RouteProp, useFocusEffect, useNavigation,} from '@react-navigation/native';
import {useOffline} from '../context/OfflineProvider';
import React, {useCallback, useState} from 'react';
import {useAuthStore} from '../store/useAuthStore';
import ActivityService from '../services/activityService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import {getStatusLabel} from '../constants/status';
import {formatDate} from '../utils/DateHelper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Colors from '../utils/Colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {ActivityRepository} from '../model/ActivityRepository';
import {
    createTableActivity,
    createTableActivityBranch,
    createTableActivityOutlet,
    createTableActivityProgram,
    createTableActivitySio,
    createTableActivitySog,
} from '../model';
import Ionicons from '@expo/vector-icons/Ionicons';
import {useLoadingDialogStore} from "../store/useLoadingStore";

const {width, height} = Dimensions.get('window');

export interface Activity2 {
    id: number;
    user_id: number;
    call_plan_id: number;
    code_call_plan: string;
    outlet_id: number | null;
    survey_outlet_id: number | null;
    day_plan: string;
    notes: string;
    status: number;
    type: number;
    time_start: string;
    time_end: string;
    created_by: string;
    created_at: string;
    updated_by: string;
    updated_at: string;
    deleted_by: string;
    deleted_at: string;
    program_id: number;
    callPlanOutlet: CallPlan | null | undefined;
    callPlanSurvey: CallPlan | null | undefined;
    callPlanProgram: null;
}

export interface CallPlan {
    id: number;
    outlet_code: string;
    name: string;
    brand: string;
    unique_name?: string;
    address_line: string;
    sub_district: string;
    district: string;
    city_or_regency: string;
    postal_code: number;
    latitude: string;
    longitude: string;
    sio_type: string;
    region: string;
    area: string;
    cycle: string;
    is_active: number;
    visit_day: string;
    odd_even: string;
    photos: string[];
    remarks: string;
    range_health_facilities: number;
    range_work_place: number;
    range_public_transportation_facilities: number;
    range_worship_facilities: number;
    range_playground_facilities: number;
    range_educational_facilities: number;
    survey_outlet_id: number;
    created_by: string;
    created_at: string;
    updated_by: string;
    updated_at: string;
    deleted_by: string;
    deleted_at: string;
    batch_code: string;
    outlet_id: number;
    new_outlet_id: number;
    status: number;
    is_approved: boolean;
}

type FormActivityRouteProp = RouteProp<ActivityStackParamList, 'Activity2'>;

type FormActivityProps = {
    route: FormActivityRouteProp;
};
type NavigationProp = StackNavigationProp<ActivityStackParamList, 'Activity2'>;

export default function ActivityScreen({route}: FormActivityProps) {
    const db = useSQLiteContext();
    const navigation = useNavigation<NavigationProp>();
    const {isOnline, isWifi} = useOffline();
    const [activities, setActivities] = useState<Activity2[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const {user} = useAuthStore();
    const {showLoadingDialog, hideLoadingDialog} = useLoadingDialogStore();
    const userId = user?.id || '';

    const fetchScedule = async () => {
        setRefreshing(true);
        showLoadingDialog("loading...");
        try {
            // Ensure required tables exist
            // await dropTableExisting(db);
            await createTableActivity(db);
            await createTableActivitySio(db);
            await createTableActivitySog(db);
            await createTableActivityBranch(db);
            await createTableActivityProgram(db);
            await createTableActivityOutlet(db);

            // Get local data
            const localActivities = await ActivityRepository.getAll(db);
            const cachedActivities = await AsyncStorage.getItem('activities');
            const parsedCachedActivities = cachedActivities ? JSON.parse(cachedActivities) : [];

            // Create status map from local SQLite data
            const localStatusMap = new Map(
                localActivities.map((activity) => [
                    activity.call_plan_schedule_id,
                    activity.status,
                ])
            );

            if (!isOnline && !isWifi) {
                // Offline mode
                let finalActivities = [];

                if (localActivities.length > 0 && parsedCachedActivities.length > 0) {
                    // Merge SQLite and AsyncStorage data
                    finalActivities = parsedCachedActivities.map((item: Activity2) => {
                        const localStatus = localStatusMap.get(item.id);
                        return localStatus ? {...item, status: localStatus} : item;
                    });
                    Toast.show({
                        type: 'info',
                        text1: 'Offline Mode',
                        text2: 'Using merged local data',
                    });
                } else if (localActivities.length > 0) {
                    // Use SQLite data only
                    finalActivities = localActivities;
                    Toast.show({
                        type: 'info',
                        text1: 'Offline Mode',
                        text2: 'Using SQLite data',
                    });
                } else if (parsedCachedActivities.length > 0) {
                    // Use AsyncStorage data only
                    finalActivities = parsedCachedActivities;
                    Toast.show({
                        type: 'info',
                        text1: 'Offline Mode',
                        text2: 'Using cached data',
                    });
                } else {
                    Toast.show({
                        type: 'error',
                        text1: 'Offline Mode',
                        text2: 'No local data available',
                    });
                }

                setActivities(finalActivities);
            } else {
                // Online mode
                try {
                    const response = await ActivityService.getListingSchedule(userId);
                    const serverData: Activity2[] = response.data;

                    // Merge server data with local status updates
                    const mergedData = serverData.map((item) => {
                        const localStatus = localStatusMap.get(item.id);
                        return localStatus ? {...item, status: localStatus} : item;
                    });

                    setActivities(mergedData);

                    // Update local caches
                    await AsyncStorage.setItem('activities', JSON.stringify(serverData));

                    Toast.show({
                        type: 'success',
                        text1: 'Online Mode',
                        text2: 'Data synchronized successfully',
                    });
                } catch (error) {
                    // If server fetch fails, fallback to local data
                    const fallbackData = localActivities.length > 0 ? localActivities : parsedCachedActivities;
                    setActivities(fallbackData);

                    Toast.show({
                        type: 'error',
                        text1: 'Sync Failed',
                        text2: 'Using local data instead',
                    });
                }
            }
        } catch (e: any) {
            setError(e.message);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: e.message,
            });
            hideLoadingDialog()
        } finally {
            hideLoadingDialog();
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const fetchData = async () => {
                if (!isActive) return;

                try {
                    setRefreshing(true);
                    setActivities([]);
                    await fetchScedule();
                } catch (error) {
                    console.error('Error fetching schedule:', error);
                    if (isActive) {
                        setError('Failed to fetch schedule');
                        Toast.show({
                            type: 'error',
                            text1: 'Error',
                            text2: 'Failed to fetch schedule',
                        });
                    }
                } finally {
                    if (isActive) {
                        setRefreshing(false);
                    }
                }
            };

            fetchData();

            return () => {
                isActive = false;
            };
        }, [navigation, isOnline, isWifi])
    );

    const openMaps = (latitude: string, longitude: string) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${longitude},${latitude}`;
        Linking.openURL(url).catch((err) => {
            console.error('Failed to open map', err);
            Toast.show({type: 'error', text1: 'Failed to open map'});
        });
    };

    const handlePressWork = (item: any) => {
        navigation.navigate('FormDetailActivity', {item});
    };

    const renderItem = ({item}: { item: Activity2 }) => {
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
                onPressOut={onPressOut}>
                <Animated.View
                    style={[styles.card, {transform: [{scale: scaleAnim}]}]}>
                    <View style={styles.row}>
                        {/* Column 1 */}
                        <View style={styles.col1}>
                            <Text
                                style={[
                                    styles.title,
                                    {
                                        fontStyle: 'italic',
                                        marginBottom: 20,
                                    },
                                ]}>
                                {item.callPlanOutlet
                                    ? item.callPlanOutlet.name
                                    : item.callPlanSurvey?.name}
                            </Text>

                            <Text
                                style={[styles.description, {fontStyle: 'italic'}]}>
                                {item.code_call_plan}
                            </Text>
                            <View style={styles.divider}/>
                            <Text style={styles.description}>
                                {item.callPlanOutlet
                                    ? item.callPlanOutlet?.brand
                                    : item.callPlanSurvey?.brand}
                            </Text>
                            <View style={styles.divider}/>
                            <Text style={[styles.description]}>
                                {item.callPlanOutlet
                                    ? item.callPlanOutlet.sio_type
                                    : item.callPlanSurvey?.sio_type}
                            </Text>
                            <View style={styles.divider}/>
                            <Text style={styles.description}>
                                Schedule: {formatDate(item.day_plan)}
                            </Text>
                            <View style={styles.divider}/>
                            <Text style={styles.description}>
                                Visit Day:{' '}
                                {item.callPlanOutlet
                                    ? item.callPlanOutlet.visit_day
                                    : item.callPlanSurvey?.visit_day}
                            </Text>
                        </View>
                        {/* Column 2 */}
                        <View style={styles.col2}>
                            <Text
                                style={[
                                    styles.brand,
                                    {
                                        textAlign: 'right',
                                        color: item.status === 400 ? 'red' : 'green',
                                        //
                                    },
                                ]}>
                                {item.type === 1 ? 'Outlet Baru, ' : ''}
                                {getStatusLabel(item.status as any)}
                            </Text>
                            <TouchableOpacity
                                style={styles.buttonWork}
                                onPress={() =>
                                    openMaps(
                                        item.callPlanOutlet?.longitude ?? '',
                                        item.callPlanOutlet?.latitude ?? ''
                                    )
                                }>
                                <MaterialCommunityIcons
                                    name="google-maps"
                                    size={22}
                                    color={Colors.buttonBackground}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.buttonWork}
                                onPress={() => handlePressWork(item)}>
                                <MaterialIcons
                                    name="input"
                                    size={22}
                                    color={Colors.buttonBackground}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            </TouchableWithoutFeedback>
        );
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchScedule();
    };

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>Error: {error}</Text>
            </View>
        );
    }

    if (activities.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.rowHeader}>
                    <Text style={styles.header}>Route's Schedule Plan</Text>
                    <TouchableOpacity
                        style={styles.historyContainer}
                        onPress={() => {
                            navigation.navigate('History');
                        }}>
                        <Ionicons
                            name="time-outline"
                            size={20}
                            color={Colors.buttonBackground}
                        />
                        <Text style={styles.headerHistory}>History</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.center}>
                    <Text style={styles.header}>No Data Schedule Today</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.rowHeader}>
                <Text style={styles.header}>Route's Schedule Plan</Text>
                <TouchableOpacity
                    style={styles.historyContainer}
                    onPress={() => {
                        navigation.navigate('History');
                    }}>
                    <Ionicons
                        name="time-outline"
                        size={20}
                        color={Colors.buttonBackground}
                    />
                    <Text style={styles.headerHistory}>History</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={activities}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        padding: width * 0.02,
    },
    divider: {
        height: 1,
        backgroundColor: '#ccc',
        marginVertical: height * 0.005,
    },
    image: {
        width: '80%',
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
        backgroundColor: 'white',
        borderRadius: 15,
        padding: height * 0.02,
        marginBottom: height * 0.02,
        shadowColor: 'rgba(150,145,145,0.75)',
        shadowOpacity: 0.5,
        shadowRadius: 10,
        shadowOffset: {width: 0, height: 2},
        elevation: 3,
        borderWidth: 3,
        borderColor: 'gray',
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
        fontStyle: 'italic',
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
        justifyContent: 'space-around',
    },
    col1: {
        flex: 2,
        paddingRight: 10,
    },
    col2: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    headerHistory: {
        fontSize: width > 400 ? 20 : 16,
        fontWeight: 'bold',
        color: Colors.buttonBackground,
        textAlign: 'right',
    },
    historyContainer: {
        borderRadius: 8,
        marginBottom: height * 0.005,
        paddingHorizontal: 3,
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});
