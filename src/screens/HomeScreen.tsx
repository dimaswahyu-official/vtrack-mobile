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
import Colors from "../utils/Colors";
import {useNavigation} from "@react-navigation/native";
import {BottomTabNavigationProp} from "@react-navigation/bottom-tabs";
import {MainTabParamList} from "../navigation/MainNavigator";

const {width, height} = Dimensions.get('window');

export default function HomeScreen() {
    const db = useSQLiteContext();
    const {setBrands, setSio, brands, sio} = useConstantStore();
    const {isOnline, isWifi} = useOffline();

    // State to track sync status and counts
    const [syncStatus, setSyncStatus] = useState<string>('');
    const [syncedCount, setSyncedCount] = useState<number>(0);
    const [notSyncedCount, setNotSyncedCount] = useState<number>(0);
    const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();


    const data = [
        {
            id: 0,
            title: '10',
            color: '#FF4500',
            members: "Outlet Belum Dikunjungi",
            image: 'https://img.icons8.com/color/70/000000/name.png',
        },
        {
            id: 1,
            title: '12',
            color: '#87CEEB',
            members: "Outlet Sudah Dikunjungi",
            image: 'https://img.icons8.com/office/70/000000/home-page.png',
        },
        {
            id: 2,
            title: '12',
            color: '#4682B4',
            members: "Outlet Buka",
            image: 'https://img.icons8.com/color/70/000000/two-hearts.png',
        },
        {
            id: 3,
            title: '10',
            color: '#6A5ACD',
            members: "outlet Tutup",
            image: 'https://img.icons8.com/color/70/000000/family.png',
        },
        {
            id: 4,
            title: '22',
            color: '#FF69B4',
            members: "Total Outlet dalam schedule",
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
            <Text style={styles.header}>Dashboard</Text>
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
                renderItem={({item, index}) => {
                    if (index === data.length - 1) {
                        return (
                            <>
                                <TouchableOpacity
                                    key={item.id}
                                    style={[styles.card, {flexBasis: '100%', backgroundColor: item.color}]}
                                    onPress={() => {
                                        Alert.alert(item.title)
                                    }}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.title}>{item.title}</Text>
                                    </View>
                                    {/*<Image style={styles.cardImage} source={{uri: item.image}}/>*/}
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
        padding: width * 0.02,
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
