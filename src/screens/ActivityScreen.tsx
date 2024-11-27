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
    Linking
} from 'react-native';
import ActivityService from '../services/activityService';
import { useAuthStore } from '../store/useAuthStore';
import { useLoadingStore } from '../store/useLoadingStore';
import Colors from "../utils/Colors";
import {createTableActivity} from "../model/activityModel";
import {useOffline} from "../context/OfflineProvider";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {formatDate} from "../utils/DateHelper";
import {StackNavigationProp} from "@react-navigation/stack";
import {ActivityStackParamList} from "../navigation/ActivityNavigator";
import {useNavigation} from "@react-navigation/native";
import Toast from "react-native-toast-message";

interface Activity {
    id: number;
    user_id: number;
    call_plan_id: number;
    outlet_id: number;
    code_call_plan: string;
    status: string;
    day_plan: string;
    notes: string;
    callPlanOutlet: {
        name: string
        brand: string
        outlet_code: string
        latitude: string
        longitude: string
        outlet_type: string
        region: string
        area: string
        cycle: string
        visit_day: string
        odd_even: string
        range_health_facilities: number
        range_work_place: number
        range_public_transportation_facilities: number
        range_worship_facilities: number
        range_playground_facilities: number
        range_educational_facilities: number
        photos: []
    };
}
type NavigationProp = StackNavigationProp<ActivityStackParamList, 'Activity'>;
export default function ActivityScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { isOnline, isWifi } = useOffline();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const { setLoading } = useLoadingStore();
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuthStore();
    const userId = user?.id || '';

    const fetchData = async () => {
        setRefreshing(true);
        try {
            const response = await ActivityService.getListingSchedule(userId);
            const data: Activity[] = await response.data;
            setActivities(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        createTableActivity();
        fetchData();
    }, []);

    const toggleSelection = (id: number) => {
        console.log(id)
    };

    const openMaps = (latitude: string, longitude: string) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
        Linking.openURL(url).catch((err) => {
            console.error("Failed to open map", err);
            Toast.show({type: "error", text1: "Failed to open map"});
        });
    };

    const handlePressWork = (item: any) => {
        navigation.navigate('FormActivityNormal', { item });
        console.log('Button pressed for', item.callPlanOutlet.brand);
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
                            <Text style={styles.title}>{item.code_call_plan}</Text>
                            <View style={styles.divider} />
                            <Text style={styles.description}>{item.status.toUpperCase()}</Text>
                            <View style={styles.divider} />
                            <Text style={styles.description}>{formatDate(item.day_plan)}</Text>
                            <View style={styles.divider} />
                            <Text style={styles.description}>{item.notes.toUpperCase()}</Text>
                        </View>
                        {/* Column 2 */}
                        <View style={styles.col2}>
                            <Image
                                style={styles.image}
                                source={require('../../assets/logo-nna.png')}
                            />
                            <Text style={styles.brand}>{item.callPlanOutlet.brand.toUpperCase()}</Text>
                            <View style={styles.row}>
                                <TouchableOpacity style={styles.buttonWork} onPress={() => openMaps('-6.198453', '106.802473')}>
                                    <MaterialCommunityIcons name="google-maps" size={25} color={Colors.buttonBackground} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.buttonWork} onPress={() => handlePressWork(item)}>
                                    <MaterialIcons name="input" size={25} color={Colors.buttonBackground} />
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
        padding: 15,
    },
    divider: {
        height: 1,
        backgroundColor: '#ccc',
        marginVertical: 5,
    },
    image: {
        width: "70%",
        height: 30,
        marginTop: 5,
        resizeMode: 'contain',
    },
    buttonWork: {
        marginTop: 10,
        backgroundColor: 'transparent',
        padding: 9,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 1,
        borderWidth: 2,
        borderColor: Colors.buttonBackground,
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: 20,
        textAlign: 'left',
    },
    list: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#fcf6f3',
        borderRadius: 20,
        padding: 20,
        marginBottom: 12,
        shadowColor: 'rgba(150,145,145,0.75)',
        shadowOpacity: 1.15,
        shadowRadius: 30,
        shadowOffset: { width: 0, height: 1 },
        elevation: 3,
        borderLeftWidth: 3,
        borderTopWidth: 3,
        borderLeftColor: Colors.secondaryColor,
        borderTopColor: Colors.secondaryColor,
    },
    cardSelected: {
        backgroundColor: '#ecf1ed',
        borderLeftColor: Colors.secondaryColor,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: 'black',
    },
    description: {
        fontSize: 14,
        fontWeight: '700',
        color: 'black',
    },
    brand: {
        fontSize: 14,
        fontWeight: '800',
        color: 'black',
        marginVertical: 5,
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
    },
    col1: {
        flex: 2,
    },
    col2: {
        flex: 1,
        alignItems: 'flex-end',
    },
});
