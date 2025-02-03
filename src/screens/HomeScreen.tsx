import React, {useEffect, useState} from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View,
    Text,
    Clipboard,
    Alert,
    FlatList,
    Image,
    ScrollView,
    Dimensions
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
    const [syncedCount, setSyncedCount] = useState<number>(0);
    const [notSyncedCount, setNotSyncedCount] = useState<number>(0);
    const [checkStatus, setCheckStatus] = useState<string>('');
    const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();


    const db = useSQLiteContext();
    const BACKGROUND_FETCH_TASK = 'SYNC_ACTIVITIES_TASK';

    TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
        try {
            const now = Date.now();
            console.log(`[Background Fetch] Started at ${new Date(now).toISOString()}`);

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

            for (const activity of activities) {
                try {
                    console.log(`[Background Fetch] Processing activity ID: ${activity.id}`);
                    //Sync Data On Background
                    const dataSend = await ActivityRepository.findActivityWithDetail(db, activity.call_plan_schedule_id);
                    // await sendOfflineData(dataSend);
                } catch (error) {
                    console.error('[Background Fetch] Failed to sync activity:', error);
                    continue;
                }
            }

            console.log('[Background Fetch] Completed successfully');
            return BackgroundFetch.BackgroundFetchResult.NewData;
        } catch (error: any) {
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
            console.log('[Background Fetch] Current status:', BackgroundFetch.BackgroundFetchStatus[status as any]);
            console.log('[Background Fetch] Is registered:', isRegistered);
            setStatus(status);
            setIsRegistered(isRegistered);
            return {status, isRegistered};
        } catch (error) {
            console.error('[Background Fetch] Error checking status:', error);
            return null;
        }
    };

    const registerBackgroundFetch = async () => {
        try {
            const {status, isRegistered} = await checkStatusAsync() || {};

            if (!isRegistered) {
                console.log('[Background Fetch] Registering task...');
                await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
                    minimumInterval: 3 * 60,
                    stopOnTerminate: false,
                    startOnBoot: true,
                });

                const newStatus = await checkStatusAsync();
                if (newStatus?.isRegistered) {
                    console.log('[Background Fetch] Task registered successfully');
                } else {
                    console.error('[Background Fetch] Task registration failed');
                }
            } else {
                console.log('[Background Fetch] Task already registered');
            }
        } catch (error: any) {
            console.error('[Background Fetch] Registration error:', error);
        }
    };

    useEffect(() => {
        if (isOnline || isWifi) {
            // registerBackgroundFetch();
        }
    }, [isOnline, isWifi]);




    const showAlert = () => {
        Alert.alert('Option selected')
    }

    const fetchConstants = async () => {
        setSyncStatus('syncing');
        try {
            const getBrands = await ConstantService.getBrands();
            setBrands(getBrands.data.data);
            const getSio = await ConstantService.getSio();
            setSio(getSio.data.data);
            const getDashboard = await ConstantService.getDashboard(user?.id ?? '');
            const data = [
                {
                    id: 0,
                    title: getDashboard.data?.belum_dikunjungi,
                    color: '#f3e7be',
                    members: "Outlet Belum Dikunjungi",
                    image: 'https://img.icons8.com/color/70/000000/name.png',
                },
                {
                    id: 1,
                    title: getDashboard.data?.sudah_dikunjungi,
                    color: '#9bcfb6',
                    members: "Outlet Sudah Dikunjungi",
                    image: 'https://img.icons8.com/office/70/000000/home-page.png',
                },
                {
                    id: 2,
                    title: getDashboard.data?.belum_dikunjungi,
                    color: '#d68d96',
                    members: "Total Activity Outlet",
                    image: 'https://img.icons8.com/color/70/000000/two-hearts.png',
                },
                {
                    id: 3,
                    title: getDashboard.data?.total_activity_survey,
                    color: '#819bf3',
                    members: "Total Activity Survey",
                    image: 'https://img.icons8.com/color/70/000000/family.png',
                },
                {
                    id: 4,
                    title: getDashboard.data?.total_schedule,
                    color: '#996d99',
                    members: "Total Outlet dalam schedule",
                    image: 'https://img.icons8.com/color/70/000000/groups.png',
                },
            ]
            setDashboard(data);
            setSyncStatus('synced');
        } catch (error) {
            console.error('Error fetching constants:', error);
            setSyncStatus('not synced');
        }
    }

    useEffect(() => {
        if ((isOnline || isWifi) && !brands.length && !sio.length && !dashboard.length) {
            fetchConstants();
        }
    }, [isOnline, isWifi, brands, sio, dashboard]);


    return (
        <View style={styles.container}>
            <FlatList
                style={styles.list}
                contentContainerStyle={styles.listContainer}
                data={dashboard}
                horizontal={false}
                numColumns={2}
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
                                        Alert.alert(item?.title)
                                    }}>
                                    <Image style={styles.cardImage} source={{uri: item.image}}/>
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
                                Alert.alert(item.title)
                            }}>
                            <Image style={styles.cardImage} source={{uri: item.image}}/>

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
        color: '#FFFFFF',
    },
    icon: {
        height: 5,
        width: 5,
    },
});
