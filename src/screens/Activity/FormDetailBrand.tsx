import {Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import {StackNavigationProp} from "@react-navigation/stack";
import {ActivityStackParamList} from "../../navigation/ActivityNavigator";
import {RouteProp, useNavigation} from "@react-navigation/native";
import {useSQLiteContext} from "expo-sqlite";
import React, {useEffect, useState} from "react";
import useConstantStore from "../../store/useConstantStore";
import Colors from "../../utils/Colors";
import {MaterialIcons} from "@expo/vector-icons";

const {width, height} = Dimensions.get('window');
type NavigationProp = StackNavigationProp<ActivityStackParamList, 'FormDetailBrand'>;
type FormActivityRouteProp = RouteProp<ActivityStackParamList, 'FormDetailBrand'>;
type FormActivityProps = {
    route: FormActivityRouteProp;
};
// Define the Brand type
type Brand = {
    brand: string;
    created_at: string;
    created_by: string | null;
    deleted_at: string | null;
    deleted_by: string | null;
    id: number;
    sog: string[];
    updated_at: string;
};

export default function FormDetailBrand({route}: FormActivityProps) {
    const db = useSQLiteContext();
    const {item} = route.params || {};
    const navigation = useNavigation<NavigationProp>();
    const [isFullActivity, setIsFullActivity] = useState(false);
    const [userId, setUserId] = useState(1);
    const [callPlanScheduleId, setCallPlanScheduleId] = useState(1);
    const [callPlanId, setCallPlanId] = useState(1);
    const [outletId, setOutletId] = useState(1);
    const [status, setStatus] = useState(0);
    const [brand, setBrand] = useState<Brand | null>(null);
    const [area, setArea] = useState('Area A');
    const [region, setRegion] = useState('Region X');
    const [startTime, setStartTime] = useState('2023-01-01T10:00:00Z');
    const [endTime, setEndTime] = useState('2023-01-01T11:00:00Z');
    const [activityBrand, setActivityBrand] = useState<{
        activity_id: number;
        name: string;
        value: string;
        description: string;
        notes: string
    }[]>([]);

    const {brands} = useConstantStore();

    useEffect(() => {
        setUserId(item.user_id);
        setCallPlanScheduleId(item.id);
        setCallPlanId(item.call_plan_id);
        setOutletId(item.outlet_id);
        setStatus(item.status);
        setArea(item.callPlanOutlet?.area);
        setRegion(item.callPlanOutlet?.region);
        setStartTime(item.start_time);
        setEndTime(item.end_time);
        setBrand(item.callPlanOutlet?.brand);
        if (brands.length > 0) {
            const filteredBrand = brands.filter(b => b.brand === item.callPlanOutlet.brand);
            setBrand(filteredBrand.length > 0 ? filteredBrand[0] : {});
            if (filteredBrand.length > 0) {
                setActivityBrand(Array.from({length: filteredBrand[0].branch.length}, (_, i) => ({
                    activity_id: filteredBrand[0].id,
                    name: filteredBrand[0].branch,
                    value: '',
                    description: '',
                    notes: ''
                })));
            }
        }
    }, [item.id]);

    const goToSog = () => {
        // navigation.navigate('FormDetailSio', {item});
        // setIsFullActivity(true); // Set state to true when button is clicked
    };
    const [isCollapsed, setIsCollapsed] = useState(false); // State to toggle collapse
    if (!Array.isArray(activityBrand)) {
        console.warn('activityBrand is not an array:', activityBrand);
        return null; // or return a fallback UI
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Penjualan Brand</Text>
            {activityBrand?.map((brand, index) => (
                    <View style={styles.cardContainer} key={index}>
                        <View style={styles.card}>
                            {/* Toggle Button as Icon */}
                            <Text style={styles.toggleText}>
                                {brand.name}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setIsCollapsed(!isCollapsed)}
                                style={styles.iconButton}
                            >
                                <MaterialIcons
                                    name={isCollapsed ? 'keyboard-arrow-down' : 'keyboard-arrow-up'}
                                    size={24}
                                    color="#333"
                                />
                            </TouchableOpacity>
                            {!isCollapsed && (
                                <View style={styles.cardContent}>
                                    {/* Text Fields */}
                                    <View>
                                        <Text style={[styles.label, {alignItems: 'flex-end', marginBottom: 8}]}>Total
                                            (/Bungkus)
                                            :</Text>
                                        <TextInput
                                            style={[styles.input, {flex: 1}]}
                                            placeholder="Stock (/Bungkus)"
                                            value={brand.value}
                                            onChangeText={(text) => {
                                                const newActivityBrand = [...activityBrand];
                                                newActivityBrand[index].value = text;
                                                setActivityBrand(newActivityBrand);
                                            }}
                                        />
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                )
            )
            }
            <TouchableOpacity style={styles.button} onPress={goToSog}>
                <Text style={{color: Colors.buttonText, fontWeight: 'bold', fontSize: 20}}>NEXT</Text>
            </TouchableOpacity>
        </ScrollView>

    )
}


const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#f5f5f5',
    },
    image: {
        width: Dimensions.get('window').width, // Full width of the screen
        height: 200, // Adjust height as needed
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    cardContainer: {
        marginHorizontal: 16,
        marginTop: 8,
    },
    toggleText: {
        fontSize: 14,
        color: '#333',
        marginRight: 4, // Space between text and icon
    },
    card: {
        width: width - 40,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        elevation: 4, // Shadow for Android
        shadowColor: '#000', // Shadow for iOS
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 4,
        position: 'relative', // Required for positioning the icon
    },
    iconButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 1,
    },
    cardContent: {
        marginTop: 8, // Space below the toggle button
    },
    row: {
        width: '100%',
        flexDirection: 'row',

        marginBottom: 12,
        justifyContent: "space-between"
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginRight: 8,
        textTransform: 'capitalize', // Capitalize keys like "name", "age"
    },
    value: {
        fontSize: 16,
        color: '#555',
    },
    input: {
        height: height * 0.05,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: width * 0.02,
        marginBottom: height * 0.015,
        backgroundColor: '#fff',
    },
    imageContainer: {
        flex: 1,
        position: 'relative',
        alignItems: 'center',
        backgroundColor: '#ddd',
        borderRadius: 10,
        margin: 10,
    },
    clearButton: {
        marginTop: height * 0.01,
        backgroundColor: 'red',
        padding: height * 0.01,
        borderRadius: 5,
    },
    imagePreview: {
        width: width * 0.25,
        height: width * 0.25,
        marginTop: height * 0.014,
        borderRadius: 5,
    },
    photoButton: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.secondaryColor,
        padding: 4,
        borderRadius: 5,
        margin: 4,
    },
    containerDropdown: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: 10,
        backgroundColor: '#f9f9f9',
    },
    // label: {
    //     fontSize: 16,
    //     marginBottom: 10,
    //     color: '#333',
    // },
    dropdownButton: {
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#fff',
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        color: '#555',
    },
    dropdown: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: '#fff',
        width: '100%',
    },
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    optionLabel: {
        marginLeft: 10,
        fontSize: 16,
        color: '#333',
    },
    customCheckbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#007bff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmark: {
        width: 10,
        height: 10,
        backgroundColor: '#fff',
        borderRadius: 2,
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.buttonBackground,
        borderRadius: 10,
        padding: 6,
        marginHorizontal: 15,
        marginVertical: 10
    },
    pickerContainer: {
        width: '100%',
        height: height * 0.06,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: height * 0.015,
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
});