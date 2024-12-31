import {Alert, Dimensions, FlatList, ScrollView, Text, TouchableOpacity, View} from "react-native";
import {StackNavigationProp} from "@react-navigation/stack";
import {ActivityStackParamList} from "../../navigation/ActivityNavigator";
import {RouteProp, useNavigation} from "@react-navigation/native";
import ActivityStyles from "../../utils/ActivityStyles";
import {useSQLiteContext} from "expo-sqlite";
import React, {useEffect, useState} from "react";
import useConstantStore from "../../store/useConstantStore";
import Colors from "../../utils/Colors";

const {width, height} = Dimensions.get('window');
type NavigationProp = StackNavigationProp<ActivityStackParamList, 'FormDetailOutlet'>;
type FormActivityRouteProp = RouteProp<ActivityStackParamList, 'FormDetailOutlet'>;
type FormActivityProps = {
    route: FormActivityRouteProp;
};
const activityStyles = ActivityStyles();

export default function FormDetailOutlet({route}: FormActivityProps) {
    const db = useSQLiteContext();
    const {item} = route.params || {};
    const navigation = useNavigation<NavigationProp>();
    const [isFullActivity, setIsFullActivity] = useState(false);
    const [userId, setUserId] = useState(1);
    const [callPlanScheduleId, setCallPlanScheduleId] = useState(1);
    const [callPlanId, setCallPlanId] = useState(1);
    const [outletId, setOutletId] = useState(1);
    const [status, setStatus] = useState(0);
    const [area, setArea] = useState('Area A');
    const [region, setRegion] = useState('Region X');
    const [startTime, setStartTime] = useState('2023-01-01T10:00:00Z');
    const [endTime, setEndTime] = useState('2023-01-01T11:00:00Z');
    type Outlet = {
        label: string;
        value: string;
    };
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

    }, [item.id]);

    useEffect(() => {
        if (item.range_educational_facilities == 0 ||
            item.range_health_facilities == 0 ||
            item.range_playground_facilities == 0 ||
            item.range_public_transportation_facilities == 0 ||
            item.range_worship_facilities == 0 ||
            item.range_work_place == 0
        ) {
            navigation.replace('Activity2')
        }
    }, []);
    const checkOutData = () => {
        // navigation.navigate('FormDetailSio', {item});
        // setIsFullActivity(true); // Set state to true when button is clicked
    };

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
                <View style={{width: 50, height: 2, backgroundColor: Colors.buttonBackground, marginHorizontal: 8,}}/>
                <View style={{
                    width: 10,
                    height: 10,
                    borderWidth: 0.5,
                    borderRadius: 5,
                    backgroundColor: Colors.buttonBackground,
                }}/>
            </View>
        )
    }

    //NEW CUSTOM CHECKBOX
    const CustomCheckbox = ({isChecked, onPress}: { isChecked: any, onPress: any }) => (
        <TouchableOpacity
            style={[
                activityStyles.customCheckbox,
                {backgroundColor: isChecked ? '#007bff' : '#fff'},
            ]}
            onPress={onPress}
        >
            {isChecked && (
                <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 10}}>✔</Text> // Display checkmark
            )}
        </TouchableOpacity>
    );
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [selectedValues, setSelectedValues] = useState<string[]>([]);
    const outlet: Outlet[] = [
        {label: '<500m FASILITAS KESEHATAN (RS, PUSKESMAS, KLINIK)', value: 'range_health_facilities'},
        {label: '<200m SARANA PENDIDIKAN (SEKOLAH KAMPUS PAUD DLL)', value: 'range_educational_facilities'},
        {label: '<200m TEMPAT BERMAIN ANAK (TAMAN ,PLAYGROUND)', value: 'range_playground_facilities'},
        {
            label: '<500m TEMPAT IBADAH (MESJID, MUSHOLA, PURA, VIHARA, GEREJA,PESANTREN)',
            value: 'range_worship_facilities'
        },
        {
            label: '<500m ANGKUTAN UMUM (HALTE, TERMINAL, AIRPORT, STASIUN)',
            value: 'range_public_transportation_facilities'
        },
        {label: '<500m TEMPAT KERJA (KANTOR PEMERINTAHAN)', value: 'range_work_place'},
    ];
    const toggleSelection = (value: string) => {
        setSelectedValues((prev) => {
            if (prev.includes(value)) {
                // Deselect the item if it's already selected
                return prev.filter((item) => item !== value);
            } else if (prev.length < 2) {
                // Add the item if the limit of 2 is not reached
                return [...prev, value];
            } else {
                // If limit reached, ignore the action
                Alert.alert('Limit Area', 'Maksimal area yang dapat dipilih adalah sebanyak 2 area.');
                return prev;
            }
        });
    };
    const renderOption = ({item}: { item: any }) => (
        <TouchableOpacity
            style={activityStyles.optionContainer}
            onPress={() => toggleSelection(item.value)}
        >
            <CustomCheckbox
                isChecked={selectedValues.includes(item.value)}
                onPress={() => toggleSelection(item.value)}
            />
            <Text style={[activityStyles.optionLabel, {paddingRight: 6}]}>{item.label}</Text>
        </TouchableOpacity>
    );
    return (
        <ScrollView contentContainerStyle={activityStyles.container}>
            <View style={activityStyles.cardContainer}>
                <View style={activityStyles.card}>
                    <View style={{padding: 6, justifyContent: "flex-start", alignItems: "flex-start"}}>
                        <Text style={[activityStyles.label, {marginBottom: 6}]}>
                            Pastikan Outlet berada di jarak aman dari jarak berikut:
                        </Text>
                        <TouchableOpacity
                            style={activityStyles.dropdownButton}
                            onPress={() => setIsDropdownVisible((prev) => !prev)}
                        >
                            <Text style={activityStyles.buttonText}>
                                {selectedValues.length > 0
                                    ? `Area yang dipilih: ${selectedValues.length} Area`
                                    : 'Pilihan Area'}
                            </Text>
                        </TouchableOpacity>

                        {isDropdownVisible && (
                            <View style={activityStyles.dropdown}>
                                <FlatList
                                    scrollEnabled={false}
                                    data={outlet}
                                    keyExtractor={(item) => item.value}
                                    renderItem={renderOption}
                                />
                            </View>
                        )}
                    </View>
                </View>
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', padding: 16}}>
                <TouchableOpacity
                    style={{
                        flex: 1,
                        padding: 12,
                        borderRadius: 8,
                        alignItems: 'center',
                        marginHorizontal: 8,
                        backgroundColor: Colors.secondaryColor,
                    }}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{
                        flex: 1,
                        padding: 12,
                        borderRadius: 8,
                        alignItems: 'center',
                        marginHorizontal: 8,
                        backgroundColor: Colors.buttonBackground,
                    }}
                    onPress={() => {
                        console.log(selectedValues)
                        navigation.replace('Activity2')
                        navigation.reset({
                            index: 0, // Sets the starting screen index
                            routes: [{ name: 'Activity2' }], // Sets the new navigation stack
                        });

                    }}
                >
                    <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>Next</Text>
                </TouchableOpacity>
            </View>
            {footer()}
        </ScrollView>
    )
}
