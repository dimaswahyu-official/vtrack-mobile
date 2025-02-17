import React, {useEffect, useState} from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View,
    Text,
    Alert,
    FlatList,
    Dimensions, RefreshControl
} from 'react-native';
import ConstantService from '../services/constantService';
import useConstantStore from '../store/useConstantStore';
import {useOffline} from '../context/OfflineProvider';
import {useSQLiteContext} from 'expo-sqlite';
import Colors from "../utils/Colors";
import {useNavigation} from "@react-navigation/native";
import {BottomTabNavigationProp} from "@react-navigation/bottom-tabs";
import {MainTabParamList} from "../navigation/MainNavigator";
import {BackgroundFetchStatus} from 'expo-background-fetch';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import {ActivityRepository} from '../model/ActivityRepository';
import {sendOfflineData} from "../services/sendOfflineData";
import {useAuthStore} from "../store/useAuthStore";
import Ionicons from "@expo/vector-icons/Ionicons";

const {width, height} = Dimensions.get('window');

interface DashboardData {
    belum_dikunjungi: number;
    sudah_dikunjungi: number;
    total_activity_outlet: number;
    total_activity_survey: number;
    total_schedule: number;
}


export default function HomeScreen() {
    const {setBrands, setSio, setDashboard, dashboard, brands, sio} = useConstantStore();
    const {isOnline, isWifi} = useOffline();
    const {user} = useAuthStore();
    // State to track sync status and counts
    const [syncStatus, setSyncStatus] = useState<string>('');
    const [refreshing, setRefreshing] = useState(false);
    const [syncedCount, setSyncedCount] = useState<number>(0);
    const [notSyncedCount, setNotSyncedCount] = useState<number>(0);
    const [checkStatus, setCheckStatus] = useState<string>('');
    const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();


    const db = useSQLiteContext();

    const BACKGROUND_FETCH_TASK = 'SYNC_ACTIVITIES_TASK';

    // Define task outside component and before any usage
    TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
        try {
            const now = Date.now();
            console.log(`[Background Fetch] Started at ${new Date(now).toISOString()}`);

            // Check network connectivity first
            if (!isOnline && !isWifi) {
                console.log('[Background Fetch] No network connection available');
                return BackgroundFetch.BackgroundFetchResult.NoData;
            }

            if (!db) {
                console.error('[Background Fetch] Database instance is null');
                return BackgroundFetch.BackgroundFetchResult.Failed;
            }

            console.log('[Background Fetch] Fetching unsynced activities...');
            const activities = await ActivityRepository.findUnsyncedActivities(db);
            console.log(`[Background Fetch] Found ${activities.length} unsynced activities`);

            if (activities.length === 0) {
                console.log('[Background Fetch] No activities to sync');
                return BackgroundFetch.BackgroundFetchResult.NoData;
            }

            let syncedCount = 0;
            let failedCount = 0;

            for (const activity of activities) {
                try {
                    console.log(`[Background Fetch] Processing activity ID: ${activity.id}`);
                    const dataSend = await ActivityRepository.findActivityWithDetail(db, activity.call_plan_schedule_id);

                    if (!dataSend || dataSend.length === 0) {
                        console.error(`[Background Fetch] No data found for activity ID: ${activity.id}`);
                        failedCount++;
                        continue;
                    }

                    await sendOfflineData(dataSend[0], db);
                    syncedCount++;
                    console.log(`[Background Fetch] Successfully synced activity ID: ${activity.id}`);

                } catch (error) {
                    console.error(`[Background Fetch] Failed to sync activity ${activity.id}:`, error);
                    failedCount++;
                }
            }

            console.log(`[Background Fetch] Sync complete. Synced: ${syncedCount}, Failed: ${failedCount}`);
            return syncedCount > 0
                ? BackgroundFetch.BackgroundFetchResult.NewData
                : BackgroundFetch.BackgroundFetchResult.Failed;

        } catch (error) {
            console.error('[Background Fetch] Fatal error:', error);
            return BackgroundFetch.BackgroundFetchResult.Failed;
        }
    });

    const [isRegistered, setIsRegistered] = useState(false);
    const [status, setStatus] = useState<BackgroundFetchStatus | null>(null);

    const checkStatusAsync = async () => {
        try {
            const status = await BackgroundFetch.getStatusAsync();
            const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
            setCheckStatus(`Status: ${BackgroundFetch.BackgroundFetchStatus[status as any]}, Registered: ${isRegistered}`);
            console.log('[Background Fetch] Status check:', {
                status: BackgroundFetch.BackgroundFetchStatus[status as any],
                isRegistered
            });
            setStatus(status);
            setIsRegistered(isRegistered);
            return {status, isRegistered};
        } catch (error) {
            console.error('[Background Fetch] Error checking status:', error);
            setCheckStatus('Error checking status');
            return null;
        }
    };

    const registerBackgroundFetch = async () => {
        try {
            console.log('[Background Fetch] Starting registration...');

            // Check if already registered
            const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
            if (isRegistered) {
                console.log('[Background Fetch] Task already registered, unregistering first...');
                await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
            }

            console.log('[Background Fetch] Registering new task...');
            await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
                minimumInterval: 2 * 60, // 2 minutes
                stopOnTerminate: false,
                startOnBoot: true,
            });

            // Verify registration
            const newStatus = await checkStatusAsync();
            if (newStatus?.isRegistered) {
                console.log('[Background Fetch] Task registered successfully');
            } else {
                console.error('[Background Fetch] Task registration verification failed');
            }
        } catch (error) {
            console.error('[Background Fetch] Registration error:', error);
        }
    };

    // Register background fetch only once when component mounts
    useEffect(() => {
        const initializeBackgroundFetch = async () => {
            if (isOnline || isWifi) {
                await registerBackgroundFetch();
                await checkStatusAsync();
            }

            const Sync =  await ActivityRepository.findSyncedActivities(db);
            console.log('Sync activity', JSON.stringify(Sync));
        };

        initializeBackgroundFetch();


        // Cleanup on unmount
        // return () => {
        //     BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK)
        //         .catch(error => console.error('[Background Fetch] Cleanup error:', error));
        // };
    }, []);

    const fetchDashboard = async () => {
        setSyncStatus('syncing');
        setRefreshing(true);
        try {
            const getDashboard = await ConstantService.getDashboard(user?.id ?? '');
            const data = [
                {
                    id: 0,
                    title: getDashboard.data ? getDashboard.data?.belum_dikunjungi : 'NotSynced',
                    // title: 'NotSynced',
                    color: '#dac680',
                    members: "Outlet Belum Dikunjungi",
                },
                {
                    id: 1,
                    title: getDashboard.data ? getDashboard.data?.sudah_dikunjungi : 'NotSynced',
                    // title: 'NotSynced',
                    color: '#9bcfb6',
                    members: "Outlet Sudah Dikunjungi",
                },
                {
                    id: 2,
                    title: getDashboard.data ? getDashboard.data?.total_activity_outlet : 'NotSynced',
                    // title: 'NotSynced',
                    color: '#d68d96',
                    members: "Total Activity Outlet yang Telah Dikunjungi",
                },
                {
                    id: 3,
                    title: getDashboard.data ? getDashboard.data?.total_activity_survey : 'NotSynced',
                    // title: 'NotSynced',
                    color: '#819bf3',
                    members: "Total Activity Survey yang Telah Dikunjungi",
                },
                {
                    id: 4,
                    title: getDashboard.data ? getDashboard.data?.total_schedule : 'NotSynced',
                    // title: 'NotSynced',
                    color: '#996d99',
                    members: "Total Outlet dalam schedule",
                },
            ];
            setDashboard(data);
            setSyncStatus('synced');
        } catch (error) {
            setSyncStatus('not synced');
            console.error('Error fetching dashboard data:', error);
        }finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if ((isOnline || isWifi)) {
            if (user) {
                fetchDashboard();
            }
        }
    }, [user,navigation]);


    const fetchConstants = async () => {
        setSyncStatus('syncing');
        try {
            // Add error handling for each API call
            try {
                const getBrands = await ConstantService.getBrands();
                setBrands(getBrands.data.data);
            } catch (err) {
                console.error('Error fetching brands:', err);
                throw new Error('Failed to fetch brands data');
            }

            try {
                const getSio = await ConstantService.getSio();
                setSio(getSio.data.data);
            } catch (err) {
                console.error('Error fetching SIO:', err);
                throw new Error('Failed to fetch SIO data');
            }
            setSyncStatus('synced');
        } catch (error) {
            console.error('Error fetching constants:', error);
            setSyncStatus('not synced');
            Alert.alert(
                'Error',
                'Failed to fetch data. Please check your connection and try again.',
                [{text: 'OK'}]
            );
        }
    }

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchDashboard();
    };

    useEffect(() => {
        if ((isOnline || isWifi) && !brands.length && !sio.length) {
            fetchConstants();
        }
    }, [isOnline, isWifi, brands, sio]);


    return (
        <>
            <View style={styles.row}>
                <Text style={styles.name}>
                    Hi {user?.fullName} {'  '}
                    <Ionicons name={"rocket"} size={22} color={Colors.secondaryColor}/>
                </Text>
            </View>
            <View style={styles.container}>
                <FlatList
                    style={styles.list}
                    contentContainerStyle={styles.listContainer}
                    data={dashboard}
                    horizontal={false}
                    numColumns={2}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    keyExtractor={(item, index) => {
                        return index.toString()
                    }}
                    renderItem={({item, index}) => {
                        if (index === dashboard.length - 1) {
                            return (
                                <>
                                    <TouchableOpacity
                                        style={[styles.card, {flexBasis: '98%', backgroundColor: item.color}]}
                                        onPress={() => {
                                            {
                                            }
                                        }}>
                                        {/*<Image style={styles.cardImage} source={{uri: item.image}}/>*/}
                                        <View style={styles.cardHeader}>
                                            <Text style={styles.title}>{item.title}</Text>
                                        </View>

                                        <View style={styles.cardFooter}>
                                            <Text style={styles.subTitle}>{item.members}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </>
                            );
                        }
                        return (
                            <TouchableOpacity
                                key={item.id}
                                style={[styles.card, {backgroundColor: item.color}]}
                                onPress={() => {
                                    {}
                                }}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.title}>{item.title}</Text>
                                </View>
                                <View style={styles.cardFooter}>
                                    <Text style={styles.subTitle}>{item.members}</Text>
                                </View>
                            </TouchableOpacity>
                        )
                    }}

                />
                <TouchableOpacity style={styles.button} onPress={() => {
                    navigation.navigate('ActivityStack');
                }}>
                    <Text style={styles.buttonText}>RUTE</Text>
                </TouchableOpacity>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white', // Light background for better contrast
        padding: width * 0.04,
        alignItems: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: '#ccc',
        marginVertical: height * 0.005,
    },
    header: {
        fontSize: width > 400 ? 24 : 20,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: height * 0.02,

    },
    statusContainer: {
        backgroundColor: '#fff', // White background for the status box
        borderRadius: 10,
        padding: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5, // For Android shadow
        width: '100%', // Full width for the status box
        alignItems: 'center',
    },
    syncStatus: {
        fontSize: 18,
        marginBottom: 10,
    },
    countText: {
        fontSize: 16,
        marginVertical: 5,
    },
    list: {
        // flex:1,
        //paddingHorizontal: 5,
        backgroundColor: 'white',
    },
    listContainer: {
        alignItems: 'center',

    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    button: {
        width: '80%',
        height: 50,
        backgroundColor: Colors.buttonBackground,
        paddingVertical: 5,
        paddingHorizontal: 20,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    /******** card **************/
    card: {
        marginHorizontal: 2,
        marginVertical: 2,
        flexBasis: '48%',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,

    },
    cardHeader: {
        paddingTop: 17,
        paddingHorizontal: 16,
        borderTopLeftRadius: 1,
        borderTopRightRadius: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    },
    cardContent: {
        paddingVertical: 12.5,
        paddingHorizontal: 16,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 12.5,
        paddingBottom: 25,
        paddingHorizontal: 16,
        borderBottomLeftRadius: 1,
        borderBottomRightRadius: 1,
    },
    cardImage: {
        height: 40,
        width: 40,
        alignSelf: 'flex-end',
    },
    title: {
        fontSize: 25,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    subTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    icon: {
        height: 5,
        width: 5,
    },
    name: {
        marginTop: 2,
        fontSize: 22,
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginVertical: 8,
        paddingHorizontal: width * 0.08,
    },
});
