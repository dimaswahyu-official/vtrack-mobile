import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {Dimensions, ScrollView, Text, StyleSheet, TouchableOpacity, View, FlatList, RefreshControl} from "react-native";
import Colors from "../../utils/Colors";
import React, {useEffect, useState} from "react";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import ReimburseService from "../../services/reimburseService";
import {useAuthStore} from "../../store/useAuthStore";
import {Activity2} from "../ActivityScreen2";
import {formatDate, formatDateWithTime} from "../../utils/DateHelper";
import Toast from "react-native-toast-message";

const {width, height} = Dimensions.get("window");


type RootStackParamList = {
    Profile: undefined;
    Reimburse: undefined;
    ReimburseDetails: { bbmItem: any };
};

type ReimburseScreenProps = NativeStackScreenProps<
    RootStackParamList,
    "Reimburse",
    'ReimburseDetails'
>;
type BbmItem = {
    "id": number,
    "photo_in": string,
    "photo_out": string,
    "kilometer_in": number,
    "kilometer_out": number,
    "date_in": string,
    "date_out": string,
    "total_kilometer": number,
    "description": string,
    "status": number,
};


export default function ReimburseScreen({navigation}: ReimburseScreenProps) {
    const {user} = useAuthStore();
    const userId = user?.id || '';
    const [bbmList, setBbmList] = useState<BbmItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const fetchBbmList = async () => {
        setRefreshing(true);
        try {
            setLoading(true); // Start loading
            setError(null); // Reset error state

            const response = await ReimburseService.getReimburseBbmList(userId); // Replace with your API URL
            setBbmList(response.data);

        } catch (err: any) {
            setError(err.message || 'Failed to fetch data reimburse');
        } finally {
            setRefreshing(false);
            setLoading(false); // Stop loading
        }
    };

    useEffect(() => {
        fetchBbmList();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchBbmList();
    };


    const checkDraft = (data: any) => {
        data.forEach((item: any) => {
            if (item.kilometer_out === 0) {
                Toast.show({type: 'error', text1: `Item with date in ${formatDateWithTime(item.date_in)} has kilometer_out as 0.`})
                console.log(`Item with date in ${formatDateWithTime(item.date_in)} has kilometer_out as 0.`);
            }
        })
        navigation.navigate('ReimburseDetails', {bbmItem: {}})
    }


    const renderItem = ({item}: { item: any }) => (
        <View style={styles.row}>
            <Text style={styles.text}>{formatDate(item.date_in)}</Text>
            <Text style={styles.text}>{formatDate(item.date_out) ?? 'Belum Input'}</Text>
            <Text style={styles.text}>{item.status === 1 ? "Completed" : "Pending"}</Text>
            <Icon
                style={{flex: 1, textAlign: "center"}}
                onPress={() => navigation.navigate('ReimburseDetails', {bbmItem: item})}
                name={'eye'}
                size={24}
                color={Colors.buttonBackground}
            />
        </View>
    );

    if (loading) {
        return (
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <Text>Loading...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <Text>Error: {error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.greeting}>
                    Reimburse
                </Text>

                <TouchableOpacity style={styles.Button} onPress={() => {
                    checkDraft(bbmList)
                }}>
                    <Text style={styles.buttonText}>+</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.listContainer}>
                <FlatList
                    data={bbmList}
                    renderItem={renderItem}
                    ListHeaderComponent={
                        <View style={styles.headerRow}>
                            <Text style={styles.headerText}>Date In</Text>
                            <Text style={styles.headerText}>Date Out</Text>
                            <Text style={styles.headerText}>Status</Text>
                            <Text style={styles.headerText}>Detail</Text>
                        </View>
                    }
                    keyExtractor={(item) => item.id.toString()}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: height * 0.02,
        width: "100%",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: width * 0.05,
        marginBottom: height * 0.02,
    },
    listContainer: {
        paddingHorizontal: width * 0.05,
        paddingVertical: height * 0.02,
    },
    greeting: {
        fontSize: 30,
        fontWeight: "bold",
    },
    Button: {
        backgroundColor: Colors.buttonBackground,
        paddingVertical: height * 0.01,
        paddingHorizontal: width * 0.05,
        borderRadius: 8,
    },
    buttonText: {
        color: "#fff",
        fontSize: width * 0.04,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    text: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        textAlign: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
    },
    headerText: {
        flex: 1,
        fontSize: 16,
        fontWeight: 'bold',
        width: '23%', // Adjust width as necessary
        textAlign: 'center',
    },
})