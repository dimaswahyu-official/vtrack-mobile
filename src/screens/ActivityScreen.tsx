import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableWithoutFeedback,
    Animated,
    RefreshControl,
} from 'react-native';
import ActivityService from '../services/activityService';
import { useAuthStore } from '../store/useAuthStore';
import { useLoadingStore } from '../store/useLoadingStore';
import Colors from "../utils/Colors";
import {createTableActivity} from "../model/activityModel";
import {useOffline} from "../context/OfflineProvider";

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

export default function ActivityScreen() {
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
            console.log(userId)
            const response = await ActivityService.getListingSchedule(userId);
            const data: Activity[] = await response.data;
            setActivities(data);
        } catch (err) {
            setError((err as Error).message);
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
                onPress={() => toggleSelection(item.id)} // Handle toggle on press
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
                            <Text style={styles.description}>{item.status.toUpperCase()}</Text>
                            <Text style={styles.description}>{item.day_plan.toUpperCase()}</Text>
                            <Text style={styles.description}>{item.notes.toUpperCase()}</Text>
                        </View>
                        {/* Column 2 */}
                        <View style={styles.col2}>
                            <Text style={styles.description}>{item.callPlanOutlet.brand.toUpperCase()}</Text>
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
        padding: 25,
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
        marginBottom: 5,
    },
    description: {
        fontSize: 14,
        fontWeight: '700',
        color: 'black',
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
        flex: 1,
    },
    col2: {
        flex: 1,
        alignItems: 'flex-end',
    },
});
