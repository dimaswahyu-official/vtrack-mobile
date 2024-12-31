import {Alert, Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import {StackNavigationProp} from "@react-navigation/stack";
import {ActivityStackParamList} from "../../navigation/ActivityNavigator";
import {RouteProp, useNavigation} from "@react-navigation/native";
import {useSQLiteContext} from "expo-sqlite";
import React, {useEffect, useState} from "react";
import useConstantStore from "../../store/useConstantStore";
import {MaterialIcons} from "@expo/vector-icons";
import Colors from "../../utils/Colors";
import ActivityStyles from "../../utils/ActivityStyles";

const {width, height} = Dimensions.get('window');
type NavigationProp = StackNavigationProp<ActivityStackParamList, 'FormDetailSog'>;
type FormActivityRouteProp = RouteProp<ActivityStackParamList, 'FormDetailSog'>;
type FormActivityProps = {
    route: FormActivityRouteProp;
};
const activityStyles = ActivityStyles();
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

export default function FormDetailSog({route}: FormActivityProps) {
    const db = useSQLiteContext();
    const {item, idx} = route.params || {};
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
    const [activitySog, setActivitySog] = useState<{
        activity_id: number;
        name: string;
        description: string;
        value: number;
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
            if (item.callPlanOutlet != null) {
                const filteredBrand = brands.filter(b => b.brand === item.callPlanOutlet.brand);
                setBrand(filteredBrand.length > 0 ? filteredBrand[0] : {});
                if (filteredBrand.length > 0) {
                    setActivitySog(Array.from({length: filteredBrand[0].sog.length}, (_, i) => ({
                        activity_id: idx,
                        name: filteredBrand[0].sog[i],
                        value: 0,
                        description: '',
                        notes: ''
                    })));
                }
            } else {
                const filteredBrand = brands.filter(b => b.brand === item.callPlanSurvey.brand);
                setBrand(filteredBrand.length > 0 ? filteredBrand[0] : {});
                if (filteredBrand.length > 0) {
                    setActivitySog(Array.from({length: filteredBrand[0].sog.length}, (_, i) => ({
                        activity_id: idx,
                        name: filteredBrand[0].sog[i],
                        value: 0,
                        description: '',
                        notes: ''
                    })));
                }
            }
        }
    }, [item.id]);

    const insertSogToSqlite = async (data: any) => {
        // If the input is an array, loop through and process each item
        if (Array.isArray(data)) {
            data.forEach((activity: any) => {
                insertSogToSqlite(activity); // Call the function for each individual item
            });
            console.log('You have total Data to Insert Sog = ' + data.length);
            return; // Exit after processing the array
        }
        // If the input is a single object, process it
        const brandSog = {
            activity_id: idx,
            name: data.name,
            description: data.description ?? '',
            notes: data.notes ?? '',
            value: data.value,
        }
        try {
            console.log(JSON.stringify(brandSog) + " Data Sog")
            navigation.navigate('FormDetailOutlet', {item, idx});
            // Uncomment this line to insert data into SQLite
            // await SioModel.create(db, sioData);
        } catch (error) {
            console.error('Error inserting sio:', error);
            Alert.alert('Error', 'Failed to save sio. Please try again.');
        }
    }

    const goToOutlet = async () => {
        await insertSogToSqlite(activitySog)
        // setIsFullActivity(true); // Set state to true when button is clicked
    };
    const [isCollapsed, setIsCollapsed] = useState(false); // State to toggle collapse

    if (!Array.isArray(activitySog)) {
        console.warn('activitySog is not an array:', activitySog);
        return null; // or return a fallback UI
    }
    const footer = () => {
        return (
            <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
                marginVertical: 8,
                alignItems: 'center',
                padding: 8,
            }}>
                <View style={{
                    width: 10,
                    height: 10,
                    borderWidth: 0.5,
                    borderRadius: 5,
                    backgroundColor: Colors.buttonBackground,
                }}/>
                <View style={{width: 50, height: 2, backgroundColor: Colors.buttonBackground, marginHorizontal: 8,}}/>
                <View style={{
                    width: 10,
                    height: 10,
                    borderWidth: 0.5,
                    borderRadius: 5,
                    backgroundColor: Colors.buttonBackground,
                }}/>
                <View style={{width: 50, height: 2, backgroundColor: Colors.buttonBackground, marginHorizontal: 8,}}/>
                <View style={{
                    width: 10,
                    height: 10,
                    borderWidth: 0.5,
                    borderRadius: 5,
                    backgroundColor: Colors.buttonBackground
                }}/>
                <View style={{width: 50, height: 2, backgroundColor: 'grey', marginHorizontal: 8,}}/>
                <View style={{width: 10, height: 10, borderWidth: 0.5, borderRadius: 5, backgroundColor: 'white',}}/>
            </View>
        )
    }


    return (
        <ScrollView contentContainerStyle={activityStyles.container}>
            <Text style={activityStyles.title}>Source Of Goods (SOG)</Text>
            {activitySog?.map((sog, index) => (
                <View style={activityStyles.cardContainer} key={index}>
                    <View style={activityStyles.card}>
                        {/* Toggle Button as Icon */}
                        <Text style={activityStyles.toggleText}>
                            {sog.name}
                        </Text>
                        <TouchableOpacity
                            onPress={() => setIsCollapsed(!isCollapsed)}
                            style={activityStyles.iconButton}
                        >
                            <MaterialIcons
                                name={isCollapsed ? 'keyboard-arrow-down' : 'keyboard-arrow-up'}
                                size={24}
                                color="#333"
                            />
                        </TouchableOpacity>
                        {!isCollapsed && (
                            <View style={activityStyles.cardContent}>
                                {/* Text Fields */}
                                <View>
                                    <Text style={[activityStyles.label, {alignItems: 'flex-end', marginBottom: 8}]}>Total
                                        (/Bungkus)
                                        :</Text>
                                    <TextInput
                                        style={[activityStyles.input, {flex: 1}]}
                                        placeholder="Stock (/Bungkus)"
                                        value={sog.value.toString()}
                                        keyboardType="numeric"
                                        onChangeText={(text) => {
                                            const newActivitySog = [...activitySog];
                                            newActivitySog[index].value = Number(text);
                                            setActivitySog(newActivitySog);
                                        }}
                                    />
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            ))}
            <View style={{flexDirection: 'row', justifyContent: 'space-between', padding: 16,}}>
                <TouchableOpacity style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 8,
                    alignItems: 'center',
                    marginHorizontal: 8,
                    backgroundColor: Colors.secondaryColor
                }}
                                  onPress={() => navigation.goBack()}
                >
                    <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16,}}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 8,
                    alignItems: 'center',
                    marginHorizontal: 8,
                    backgroundColor: Colors.buttonBackground
                }} onPress={goToOutlet}>
                    <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16,}}>Next</Text>
                </TouchableOpacity>
            </View>
            {footer()}
        </ScrollView>

    )

}
