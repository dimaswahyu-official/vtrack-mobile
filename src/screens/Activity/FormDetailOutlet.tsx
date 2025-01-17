import {
    FlatList,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    Alert,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {ActivityStackParamList} from '../../navigation/ActivityNavigator';
import {RouteProp, useNavigation} from '@react-navigation/native';
import ActivityStyles from '../../utils/ActivityStyles';
import {useSQLiteContext} from 'expo-sqlite';
import * as Location from "expo-location";
import React, {useEffect, useState, useCallback} from 'react';
import Colors from '../../utils/Colors';
import {ActivityOutletModel} from '../../model/ActivityOutletRepository';
import {ActivityRepository} from '../../model/ActivityRepository';
import ActivityService from "../../services/activityService";
import Toast from "react-native-toast-message";

type NavigationProp = StackNavigationProp<
    ActivityStackParamList,
    'FormDetailOutlet'
>;
type FormActivityRouteProp = RouteProp<
    ActivityStackParamList,
    'FormDetailOutlet'
>;
type FormActivityProps = {
    route: FormActivityRouteProp;
};

type Outlet = {
    id?: number;
    label: string;
    value: number;
};

const activityStyles = ActivityStyles();

export default function FormDetailOutlet({route}: FormActivityProps) {
    const db = useSQLiteContext();
    const {item, activity} = route.params || {};
    const navigation = useNavigation<NavigationProp>();
    const [outletFacilities, setOutletFacilities] = useState<Outlet[]>([]);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [selectedValues, setSelectedValues] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");

    // Initialize outlet facilities from existing data
    useEffect(() => {
        const initializeOutletFacilities = async () => {
            try {
                const existingFacilities = await ActivityOutletModel.findByCallPlanScheduleId(
                    db,
                    activity.call_plan_schedule_id
                );

                if (existingFacilities.length > 0) {
                    console.log('existingFacilities', existingFacilities);
                    setOutletFacilities(existingFacilities);
                    setSelectedValues(
                        existingFacilities
                            .filter(facility => facility.value === 1)
                            .map(facility => facility.label)
                    );
                } else {
                    // Set default facilities if none exist
                    const defaultFacilities = [
                        'range_health_facilities',
                        'range_educational_facilities',
                        'range_playground_facilities',
                        'range_worship_facilities',
                        'range_public_transportation_facilities',
                        'range_work_place',
                    ].map(label => ({
                        label,
                        value: item?.callPlanOutlet?.[label] || item?.callPlanSurvey?.[label] || 0
                    }));
                    setOutletFacilities(defaultFacilities);
                }
            } catch (error) {
                console.error('Error initializing facilities:', error);
                Alert.alert('Error', 'Failed to load facility data');
            }
        };

        initializeOutletFacilities();
    }, [activity.call_plan_schedule_id, db, item]);

    const toggleSelection = useCallback((value: string) => {
        setSelectedValues(prev =>
            prev.includes(value)
                ? prev.filter(item => item !== value)
                : [...prev, value]
        );
    }, []);

    const submitOutlet = async () => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            const updatedFacilities = outletFacilities.map(facility => ({
                ...facility,
                value: selectedValues.includes(facility.label) ? 1 : 0,
                call_plan_schedule_id: activity.call_plan_schedule_id,
                is_sync: 0
            }));

            await Promise.all(
                updatedFacilities.map(facility =>
                    facility.id
                        ? ActivityOutletModel.update(db, facility)
                        : ActivityOutletModel.create(db, facility)
                )
            );

            const submitToServer = await ActivityRepository.findActivityWithDetail(db, activity.call_plan_schedule_id)
            // console.log('submitToServer', submitToServer);

            // Alert.alert(
            //     'Success',
            //     'Data has been saved successfully',
            //     [{text: 'OK', onPress: () => navigation.goBack()}]
            // );
            const {coords} = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            if (coords) {
                const {latitude, longitude} = coords;
                setLatitude(latitude.toString());
                setLongitude(longitude.toString());
            }

            const formData = new FormData();
            formData.append('user_id', submitToServer[0].user_id);
            formData.append('call_plan_id', submitToServer[0].call_plan_id.toString());
            formData.append('call_plan_schedule_id', submitToServer[0].call_plan_schedule_id.toString());
            if (submitToServer[0].outlet_id) {
                formData.append('outlet_id', submitToServer[0].outlet_id.toString());
            }
            if (submitToServer[0].survey_outlet_id) {
                formData.append('survey_outlet_id', submitToServer[0].survey_outlet_id.toString());
            }
            if (submitToServer[0].program_id) {
                formData.append('program_id', submitToServer[0].program_id.toString());
            }
            formData.append('status', submitToServer[0].status.toString());
            formData.append('area', submitToServer[0].area);
            formData.append('region', submitToServer[0].region);
            formData.append('brand', submitToServer[0].brand);
            formData.append('type_sio', submitToServer[0].type_sio);
            formData.append('start_time', submitToServer[0].start_time ? new Date(submitToServer[0].start_time).toISOString() : '');
            formData.append('end_time', submitToServer[0].end_time ? new Date(submitToServer[0].end_time).toISOString() : '');
            formData.append('latitude', latitude);
            formData.append('longitude', longitude);
            formData.append('sale_outlet_weekly', submitToServer[0].sale_outlet_weekly?.toString() || '');

            // Add range_facility data
            const rangeFacility = {
                range_health_facilities: selectedValues.includes('range_health_facilities') ? 1 : 0,
                range_work_place: selectedValues.includes('range_work_place') ? 1 : 0,
                range_public_transportation_facilities: selectedValues.includes('range_public_transportation_facilities') ? 1 : 0,
                range_worship_facilities: selectedValues.includes('range_worship_facilities') ? 1 : 0,
                range_playground_facilities: selectedValues.includes('range_playground_facilities') ? 1 : 0,
                range_educational_facilities: selectedValues.includes('range_educational_facilities') ? 1 : 0
            };
            formData.append('range_facility', JSON.stringify(rangeFacility));

            // Handle photos
            if (submitToServer[0].photo_program) {
                // @ts-ignore
                formData.append('photo_program', {
                    uri: submitToServer[0].photo_program,
                    type: 'image/jpeg',
                    name: submitToServer[0].photo_program.fileName || 'program.jpg'
                });
            }

            if (submitToServer[0].photo) {
                // @ts-ignore
                formData.append('photos', {
                    uri: submitToServer[0].photo,
                    type: 'image/jpeg',
                    name: submitToServer[0].photo.fileName || 'photo.jpg'
                });
            }

            // const responseActivity = await ActivityService.postActivity(formData)
            // console.log('responseActivity', responseActivity);
            // if (responseActivity.statusCode === 200) {
            //     Toast.show({
            //         type: 'success',
            //         text1: 'Success',
            //         text2: 'Update Successful',
            //     });
            // }


            //Hit SIO to API
            const formDataSio = new FormData();
            submitToServer[0].activity_sio?.forEach((data, index) => {
                formDataSio.append('name', data.name);
                formDataSio.append('description', data.description);
                formDataSio.append('notes', data.notes);
                // @ts-ignore
                formDataSio.append('files', {
                        'photo_before': {
                            uri: data.photo_before,
                            type: 'image/jpeg',
                            name: data.photo_before.fileName || 'photo.jpg'
                        },
                        'photo_after': {
                            uri: data.photo_after,
                            type: 'image/jpeg',
                            name: data.photo_after.fileName || 'photo.jpg'
                        }
                    });
                console.log(JSON.stringify(formDataSio), 'testtt');
                const response = ActivityService.postSio(submitToServer[0].call_plan_schedule_id, formDataSio)
            })

            // //Hit PROGRAM to API
            // const formDataProgram = new FormData();
            // submitToServer[0].activity_program?.forEach((data, index) => {
            //     formDataProgram.append('name', data.name);
            //     formDataProgram.append('description', data.description);
            //     // @ts-ignore
            //     formDataProgram.append('file', {
            //         uri: data.photo,
            //         type: 'image/jpeg',
            //         name: data.photo.fileName || 'image.jpg',
            //     });
            //     const responseProgram = ActivityService.postProgram(submitToServer[0].call_plan_schedule_id, formDataProgram)
            //     console.log('responseProgram', responseProgram);
            // })

            // //Hit BRANCH to API
            // submitToServer[0].activity_branch?.forEach((data) => {
            //     const jsonPayload = {
            //         name: data.name,
            //         description: data.description,
            //         value: data.value,
            //         notes: data.notes,
            //     };
            //     const responseBranch = ActivityService.postBranch(submitToServer[0].call_plan_schedule_id, jsonPayload)
            // })

            // //Hit SOG to API
            // submitToServer[0].activity_sog?.forEach((data, index) => {
            //     const sogData = {
            //                 name: data.name,
            //                 description: data.description,
            //                 value: data.value,
            //                 notes: data.notes,
            //             };
            //     const responseSog = ActivityService.postSog(submitToServer[0].call_plan_schedule_id, sogData)
            //     console.log('responseSog', responseSog);
            // })


        } catch (error) {
            console.error('Error saving facilities:', error);
            Alert.alert('Error', 'Failed to save data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const outlet = [
        {
            title: '<500m FASILITAS KESEHATAN (RS, PUSKESMAS, KLINIK)',
            label: 'range_health_facilities',
        },
        {
            title: '<200m SARANA PENDIDIKAN (SEKOLAH KAMPUS PAUD DLL)',
            label: 'range_educational_facilities',
        },
        {
            title: '<200m TEMPAT BERMAIN ANAK (TAMAN ,PLAYGROUND)',
            label: 'range_playground_facilities',
        },
        {
            title: '<500m TEMPAT IBADAH (MESJID, MUSHOLA, PURA, VIHARA, GEREJA,PESANTREN)',
            label: 'range_worship_facilities',
        },
        {
            title: '<500m ANGKUTAN UMUM (HALTE, TERMINAL, AIRPORT, STASIUN)',
            label: 'range_public_transportation_facilities',
        },
        {
            title: '<500m TEMPAT KERJA (KANTOR PEMERINTAHAN)',
            label: 'range_work_place',
        },
    ];

    const CustomCheckbox = ({
                                isChecked,
                                onPress,
                            }: {
        isChecked: boolean;
        onPress: () => void;
    }) => (
        <TouchableOpacity
            style={[
                activityStyles.customCheckbox,
                {backgroundColor: isChecked ? Colors.buttonBackground : '#fff'},
            ]}
            onPress={onPress}>
            {isChecked && (
                <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 10}}>
                    ✔
                </Text>
            )}
        </TouchableOpacity>
    );

    const renderOption = useCallback(({item}: { item: any }) => (
        <TouchableOpacity
            style={activityStyles.optionContainer}
            onPress={() => toggleSelection(item.label)}>
            <CustomCheckbox
                isChecked={selectedValues.includes(item.label)}
                onPress={() => toggleSelection(item.label)}
            />
            <Text style={[activityStyles.optionLabel, {paddingRight: 6}]}>
                {item.title}
            </Text>
        </TouchableOpacity>
    ), [selectedValues, toggleSelection]);

    const footer = () => (
        <View
            style={{
                flexDirection: 'row',
                justifyContent: 'center',
                marginVertical: 8,
                alignItems: 'center',
                padding: 8,
            }}>
            {[...Array(4)].map((_, index) => (
                <React.Fragment key={index}>
                    <View
                        style={{
                            width: 10,
                            height: 10,
                            borderWidth: 0.5,
                            borderRadius: 5,
                            backgroundColor: Colors.buttonBackground,
                        }}
                    />
                    {index < 3 && (
                        <View
                            style={{
                                width: 50,
                                height: 2,
                                backgroundColor: Colors.buttonBackground,
                                marginHorizontal: 8,
                            }}
                        />
                    )}
                </React.Fragment>
            ))}
        </View>
    );

    return (
        <ScrollView contentContainerStyle={activityStyles.container}>
            <View style={activityStyles.cardContainer}>
                <View style={activityStyles.card}>
                    <View
                        style={{
                            padding: 6,
                            justifyContent: 'flex-start',
                            alignItems: 'flex-start',
                        }}>
                        <Text style={[activityStyles.label, {marginBottom: 6}]}>
                            Pastikan Outlet berada di jarak aman dari jarak berikut:
                        </Text>
                        <TouchableOpacity
                            style={activityStyles.dropdownButton}
                            onPress={() => setIsDropdownVisible(prev => !prev)}>
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
                                    keyExtractor={item => item.label}
                                    renderItem={renderOption}
                                />
                            </View>
                        )}
                    </View>
                </View>
            </View>
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    padding: 16,
                }}>
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
                    disabled={isLoading}>
                    <Text
                        style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>
                        Back
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{
                        flex: 1,
                        padding: 12,
                        borderRadius: 8,
                        alignItems: 'center',
                        marginHorizontal: 8,
                        backgroundColor: isLoading ? Colors.light.background : Colors.buttonBackground,
                    }}
                    onPress={submitOutlet}
                    disabled={isLoading}>
                    <Text
                        style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>
                        {isLoading ? 'Submitting...' : 'Submit'}
                    </Text>
                </TouchableOpacity>
            </View>
            {footer()}
        </ScrollView>
    );
}
