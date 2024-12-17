// Get screen dimensions
import {
    Animated,
    Dimensions, FlatList,
    Image,
    Linking, RefreshControl, StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";
import {StackNavigationProp} from "@react-navigation/stack";
import {ActivityStackParamList} from "../navigation/ActivityNavigator";
import {useSQLiteContext} from "expo-sqlite";
import {useNavigation} from "@react-navigation/native";
import {useOffline} from "../context/OfflineProvider";
import React, {useEffect, useState} from "react";
import {useAuthStore} from "../store/useAuthStore";
import ActivityService from "../services/activityService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import {getStatusLabel, getStatusLabelNew} from '../constants/status';
import {formatDate} from "../utils/DateHelper";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Colors from "../utils/Colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";


const {width, height} = Dimensions.get('window');

interface Activity2 {
    id: number;
    user_id: number;
    call_plan_id: number;
    outlet_id: number | null;
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
    } | null;
}

type NavigationProp = StackNavigationProp<ActivityStackParamList, 'Activity2'>;

export default function ActivityScreen() {
    const db = useSQLiteContext();
    const navigation = useNavigation<NavigationProp>();
    const {isOnline, isWifi} = useOffline();
    const [activities, setActivities] = useState<Activity2[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const {user} = useAuthStore();
    const userId = user?.id || '';


    const fetchScedule = async () => {
        setRefreshing(true);
        try {
            const response = await ActivityService.getListingSchedule(userId);
            const data: Activity2[] = await response.data;
            setActivities(data);
            // Store the fetched data in AsyncStorage
            await AsyncStorage.setItem('activities', JSON.stringify(data));
        } catch (e: any) {
            setError(e.message);
        } finally {
            setRefreshing(false);
        }
    }

    useEffect(() => {
        fetchScedule();
    }, []);

    const openMaps = (latitude: string, longitude: string) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
        Linking.openURL(url).catch((err) => {
            console.error("Failed to open map", err);
            Toast.show({type: "error", text1: "Failed to open map"});
        });
    };
    const handlePressWork = (item: any) => {
        navigation.navigate('FormDetailActivity', {item});
        // navigation.navigate('FormActivityNormal', {item});
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
                onPressOut={onPressOut}
                // onPress={() => toggleSelection(item.id)}
            >
                <Animated.View
                    style={[
                        styles.card,
                        {transform: [{scale: scaleAnim}]},
                    ]}
                >
                    <View style={styles.row}>
                        {/* Column 1 */}
                        <View style={styles.col1}>
                            <Text style={[styles.title, {fontStyle: 'italic', marginBottom:20}]}>{item.callPlanOutlet?.name}</Text>

                            <Text style={[styles.description, {fontStyle: 'italic'}]}>{item.code_call_plan}</Text>
                            <View style={styles.divider}/>
                            <Text style={styles.description}>{item.callPlanOutlet?.brand}</Text>
                            <View style={styles.divider}/>
                            <Text style={[styles.description]}>{item.callPlanOutlet ? item.callPlanOutlet.sio_type : ''}</Text>
                            <View style={styles.divider}/>
                            <Text style={styles.description}>Schedule: {formatDate(item.day_plan)}</Text>
                            <View style={styles.divider}/>
                            <Text style={styles.description}>Visit Day: {item.callPlanOutlet?.visit_day || ''}</Text>
                        </View>
                        {/* Column 2 */}
                        <View style={styles.col2}>
                            <Text
                                style={[styles.brand, {textAlign: 'right', color:item.status===400 ?'red':'green' }]}>{item.type === 1 ? 'Outlet New, ' : ''}{getStatusLabel(item.status as any)}</Text>
                            {/*<View style={[styles.row, {marginTop: height * 0.01, alignItems: 'center'}]}>*/}
                            <TouchableOpacity style={styles.buttonWork}
                                              onPress={() => openMaps('-6.198453', '106.802473')}>
                                <MaterialCommunityIcons name="google-maps" size={22}
                                                        color={Colors.buttonBackground}/>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.buttonWork} onPress={() => handlePressWork(item)}>
                                <MaterialIcons name="input" size={22} color={Colors.buttonBackground}/>
                            </TouchableOpacity>
                            {/*</View>*/}
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

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Route's Schedule Plan</Text>
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
        shadowOffset: {width: 0, height: 2},
        elevation: 3,
        borderWidth:3,
        borderColor: Colors.secondaryColor,
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
        justifyContent: 'space-around',
    },
    col1: {
        flex: 2,
        paddingRight: 10,
    },
    col2: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: "center"
    },
});