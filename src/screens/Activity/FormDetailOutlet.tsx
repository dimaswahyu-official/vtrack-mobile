import {
	FlatList,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
    Alert
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ActivityStackParamList } from '../../navigation/ActivityNavigator';
import { RouteProp, useNavigation } from '@react-navigation/native';
import ActivityStyles from '../../utils/ActivityStyles';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useEffect, useState } from 'react';
import Colors from "../../utils/Colors";
import { ActivityOutletModel } from '../../model/ActivityOutletRepository';

type NavigationProp = StackNavigationProp<ActivityStackParamList, 'FormDetailOutlet'>;
type FormActivityRouteProp = RouteProp<ActivityStackParamList, 'FormDetailOutlet'>;
type FormActivityProps = {
    route: FormActivityRouteProp;
};
const activityStyles = ActivityStyles();

export default function FormDetailOutlet({route}: FormActivityProps) {
    const db = useSQLiteContext();
    const {item, activity} = route.params || {};
    const navigation = useNavigation<NavigationProp>();
    const [endTime, setEndTime] = useState(activity.end_time);
    const [outletFacilities, setOutletFacilities] = useState<Outlet[]>([]);

    type Outlet = {
        label: string;
        value: string;
    };
    useEffect(() => {
        setEndTime(activity.end_time);
    }, [activity.id]);

    useEffect(() => {
        
    }, []);

    const submitOutlet = async () => {
        // const outletFacilities = await ActivityOutletModel.findByCallPlanScheduleId(db, item.id);
        // console.log(outletFacilities);
        Alert.alert(
            "Success",
            "Data has been saved successfully",
            [
                {
                    text: "OK",
                    onPress: () => {
                        console.log("OK");
                        // navigation.replace('Activity2');
                        // navigation.reset({
                        //     index: 0,
                        //     routes: [{ name: 'Activity2' }],
                        // });
                    }
                }
            ]
        );
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
            } else {
                // Add the item to the selection
                return [...prev, value];
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
                    onPress={submitOutlet}>
                    <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>Submit</Text>
                </TouchableOpacity>
            </View>
            {footer()}
        </ScrollView>
    )
}
