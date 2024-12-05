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
import {countSyncedActivities, countNotSyncedActivities} from '../model/activityModel';
import {SafeAreaView} from "react-native-safe-area-context";

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
    const db = useSQLiteContext();
    const {setBrands, setSio, brands, sio} = useConstantStore();
    const {isOnline, isWifi} = useOffline();

    // State to track sync status and counts
    const [syncStatus, setSyncStatus] = useState<string>('');
    const [syncedCount, setSyncedCount] = useState<number>(0);
    const [notSyncedCount, setNotSyncedCount] = useState<number>(0);

    const data = [
        {
            id: 0,
            title: 'You',
            color: '#FF4500',
            members: 8,
            image: 'https://img.icons8.com/color/70/000000/name.png',
        },
        {
            id: 1,
            title: 'Home',
            color: '#87CEEB',
            members: 6,
            image: 'https://img.icons8.com/office/70/000000/home-page.png',
        },
        {
            id: 2,
            title: 'Love',
            color: '#4682B4',
            members: 12,
            image: 'https://img.icons8.com/color/70/000000/two-hearts.png',
        },
        {
            id: 3,
            title: 'Family',
            color: '#6A5ACD',
            members: 5,
            image: 'https://img.icons8.com/color/70/000000/family.png',
        },
        {
            id: 4,
            title: 'Friends',
            color: '#FF69B4',
            members: 6,
            image: 'https://img.icons8.com/color/70/000000/groups.png',
        },
    ]

    const [options, setOptions] = useState(data)

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
            setSyncStatus('synced');
        } catch (error) {
            console.error('Error fetching constants:', error);
            setSyncStatus('not synced');
        }
    }

    const fetchActivityCounts = async () => {
        try {
            const syncedQuery = await countSyncedActivities(db);
            setSyncedCount(syncedQuery);
            const notSyncedQuery = await countNotSyncedActivities(db);
            setNotSyncedCount(notSyncedQuery);
        } catch (error) {
            console.error('Error fetching activity counts:', error);
        }
    }

    useEffect(() => {
        if ((isOnline || isWifi) && !brands.length && !sio.length) {
            fetchConstants();
        }
        fetchActivityCounts();
    }, [isOnline, isWifi, brands, sio]);



    return (
        <View style={styles.container}>
            <Text style={styles.title}>Data Sync Dashboard</Text>
            <View style={styles.statusContainer}>
                <Text style={styles.syncStatus}>
                    Sync Status: {syncStatus}
                </Text>
                <Text style={styles.countText}>
                    Synced Activities: {syncedCount}
                </Text>
                <Text style={styles.countText}>
                    Not Synced Activities: {notSyncedCount}
                </Text>
            </View>

            <FlatList
                style={styles.list}
                contentContainerStyle={styles.listContainer}
                data={options}
                horizontal={false}
                numColumns={2}
                keyExtractor={(item, index) => {
                    return index.toString()
                }}
                renderItem={({item}) => {
                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.card, {backgroundColor: item.color}]}
                            onPress={() => {
                                Alert.alert(item.title)
                            }}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.title}>{item.title}</Text>
                            </View>
                            <Image style={styles.cardImage} source={{uri: item.image}}/>
                            <View style={styles.cardFooter}>
                                <Text style={styles.subTitle}>{item.members} members</Text>
                            </View>
                        </TouchableOpacity>
                    )
                }}

            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5', // Light background for better contrast
        padding: width * 0.02,
    },
    divider: {
        height: 1,
        backgroundColor: '#ccc',
        marginVertical: height * 0.005,
    },
    // title: {
    //     fontSize: 24,
    //     fontWeight: 'bold',
    //     marginBottom: 20,
    // },
    statusContainer: {
        backgroundColor: '#fff', // White background for the status box
        borderRadius: 10,
        padding: 20,
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
        //paddingHorizontal: 5,
        backgroundColor: '#E6E6E6',
    },
    listContainer: {
        alignItems: 'center',
    },
    /******** card **************/
    card: {
        marginHorizontal: 2,
        marginVertical: 2,
        flexBasis: '48%',
        width: '100%',
    },
    cardHeader: {
        paddingVertical: 17,
        paddingHorizontal: 16,
        borderTopLeftRadius: 1,
        borderTopRightRadius: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
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
        height: 70,
        width: 70,
        alignSelf: 'center',
    },
    title: {
        fontSize: 16,
        flex: 1,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    subTitle: {
        fontSize: 12,
        flex: 1,
        color: '#FFFFFF',
    },
    icon: {
        height: 20,
        width: 20,
    },
});
