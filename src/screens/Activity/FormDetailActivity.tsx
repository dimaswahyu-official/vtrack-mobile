import {
    Alert,
    Dimensions, FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import {RouteProp, useNavigation} from "@react-navigation/native";
import {ActivityStackParamList} from "../../navigation/ActivityNavigator";
import {useSQLiteContext} from "expo-sqlite";
import React, {useEffect, useRef, useState} from "react";
import {Picker} from "@react-native-picker/picker";
import Colors from "../../utils/Colors";
import * as ImagePicker from "expo-image-picker";
import {StackNavigationProp} from "@react-navigation/stack";
import ActivityStyles from "../../utils/ActivityStyles";
import {EXISTING_SURVEY_STATUS, NEW_SURVEY_STATUS} from "../../constants/status";
import { ActivityRepository } from "../../model/ActivityRepository";

type NavigationProp = StackNavigationProp<ActivityStackParamList, 'FormDetailActivity'>;
type FormActivityRouteProp = RouteProp<ActivityStackParamList, 'FormDetailActivity'>;
type FormActivityProps = {
    route: FormActivityRouteProp;
};
export default function FormDetailActivity({route}: FormActivityProps) {
    const db = useSQLiteContext();
    const {item} = route.params || {};
    const navigation = useNavigation<NavigationProp>();
    const [userId, setUserId] = useState('');
    const [callPlanScheduleId, setCallPlanScheduleId] = useState(1);
    const [photosx, setPhotos] = useState<any | null>(null);
    const [visible, setVisible] = useState(false);
    const activityStyles = ActivityStyles();
    const defaultImage = 'https://via.placeholder.com/100';
    const statusOptions = Object.entries(NEW_SURVEY_STATUS);
    const statusOptionExist = Object.entries(EXISTING_SURVEY_STATUS);
    const defaultStatus = item.type === 1
        ? Number(statusOptions?.[0]?.[0] || 100)
        : Number(statusOptionExist?.[0]?.[0] || 100);
    const [status, setStatus] = useState(defaultStatus);
    const [activityDatas, setActivityDatas] = useState<any>(null);

    useEffect(() => {
        // Fetch data and update state
        ActivityRepository.findByCallPlanScheduleId(db, item.id)
            .then((response) => {
                console.log("Data retrieved:", response);
                setActivityDatas(response); // Update state with the fetched data
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });
    }, [db, callPlanScheduleId]); // Dependencies to ensure useEffect runs when these change


    useEffect(() => {
        setUserId(item.user_id);
        setCallPlanScheduleId(item.id);
        setStatus(item.status ?? 100);
    }, [item.id]);


    //PopUp Notification
    const PopupCard = () => {
        return (
            <View style={styles.container}>
                {/* Modal */}
                <Modal
                    transparent
                    visible={visible}
                    animationType="fade"
                    onRequestClose={() => setVisible(false)}
                >
                    <View style={styles.modalBackground}>
                        {/* Centered Pop-Up Card */}
                        <View style={styles.card}>
                            {/* Close Button in Top-Right */}
                            <TouchableOpacity
                                style={styles.closeIcon}
                                onPress={() => setVisible(false)}
                            >
                                <Text style={styles.closeIconText}>✕</Text>
                            </TouchableOpacity>

                            <Text style={styles.title}>Check In Outlet</Text>
                            <Text>Ambil foto depan outlet untuk memulai Check In Outlet</Text>
                            <TouchableOpacity style={styles.closeButton} onPress={() => handleTakePhoto()}>
                                <Text style={styles.closeButtonText}>Check In</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    };
    // insert data after fetching to sqlite
    const insertActivityDB =  async (data: any , image:any) => {
        const activity = {
            user_id: userId ?? 0,
            call_plan_id: data.call_plan_id ?? 0,
            call_plan_schedule_id: callPlanScheduleId ?? 0,
            outlet_id: data.outlet_id ?? 0,
            status: status ?? 100,
            area: data?.callPlanOutlet?.area ?? data?.callPlanSurvey?.area ?? '',
            region: data?.callPlanOutlet?.region ?? data?.callPlanSurvey?.region ?? '',
            brand: data?.callPlanOutlet?.brand ?? data?.callPlanSurvey?.brand ?? '',
            type_sio: data?.callPlanOutlet?.sio_type ?? data?.callPlanSurvey?.sio_type ?? '',
            start_time: new Date().toISOString() ?? '',
            end_time: new Date().toISOString() ?? '',
            photo: image ?? '',
            is_sync: 0,
            id_server: 0,
        };
        try {
            setVisible(false);
            if (!activityDatas || (Array.isArray(activityDatas) && activityDatas.length === 0)) {
                try {
                    // Insert data and retrieve the newly inserted activity
                    await ActivityRepository.create(db, activity);
                    const [resultInsert] = await ActivityRepository.findByCallPlanScheduleId(db, callPlanScheduleId);
                    console.log("Inserted Activity:", resultInsert);

                    // Handle navigation based on status
                    if ([401, 402, 403, 404].includes(status)) {
                        navigation.replace('Activity2'); // Navigate to "Activity2" screen
                    } else {
                        // navigation.navigate('FormDetailSio', { item, photox: image });
                        console.log('Navigation to FormDetailSio successful');
                    }
                } catch (error) {
                    console.error("Error while inserting new activity:", error);
                }
            } else {
                console.log("masuk" + status);
                try {
                    // Update the status of the existing activity
                    await ActivityRepository.update(db , activity);
                    console.log(`Activity already exists for Schedule ID: ${callPlanScheduleId}, with Status: ${status}`);

                    // Handle navigation based on status
                    if ([401, 402, 403, 404].includes(status)) {
                        navigation.replace('Activity2'); // Navigate to "Activity2" screen
                    } else {
                        navigation.navigate('FormDetailSio', { item, photox: image, activity:activityDatas });
                        console.log('Navigation to FormDetailSio successful');
                    }
                } catch (error) {
                    console.error("Error while updating activity:", error);
                }
            }
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', `${error}`);
        }
    };
    const handleTakePhoto = async () => {
        // Request camera permissions
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('Permission required', 'Please grant permission to access the camera.');
            return;
        }
        // Launch the camera
        const response = await ImagePicker.launchCameraAsync({
            allowsEditing: false,
            quality: 1,
        });
        if (!response.canceled) {
            // Pass the photo URI to the next page
            setPhotos(response.assets[0].uri ?? defaultImage)
            await insertActivityDB(item, response.assets[0].uri)
        }
    }

    return (
        <ScrollView contentContainerStyle={activityStyles.container}>
            {/* Full-Width Image */}
            <Image
                source={{uri: item.callPlanOutlet? item.callPlanOutlet.photos[0] : item.callPlanSurvey.photos[0] || defaultImage}} // Replace with your image URL
                style={activityStyles.image}
                resizeMode="cover"
            />

            {/* OUTLET INFORMATION */}
            <Text style={activityStyles.title}>Outlet Information</Text>
            <View style={activityStyles.cardContainer}>
                <View style={activityStyles.card}>
                    <View style={activityStyles.cardContent}>
                        {/* Text Fields */}
                        <View style={activityStyles.row}>
                            <Text style={activityStyles.label}>Shop Name :</Text>
                            <Text
                                style={activityStyles.value}>{item.callPlanOutlet ? item.callPlanOutlet.name : item.callPlanSurvey.name}</Text>
                        </View>
                        <View style={activityStyles.row}>
                            <Text style={activityStyles.label}>Kode Outlet :</Text>
                            <Text
                                style={activityStyles.value}>{item.callPlanOutlet ? item.callPlanOutlet.outlet_code : item.callPlanSurvey.outlet_code}</Text>
                        </View>
                        <View style={activityStyles.row}>
                            <Text style={activityStyles.label}>Address :</Text>
                            <Text style={[activityStyles.value, {
                                flexShrink: 1,
                                textAlign: 'right'
                            }]}>{item.callPlanOutlet ? item.callPlanOutlet.address_line : item.callPlanSurvey.address_line}</Text>
                        </View>
                        <View style={activityStyles.row}>
                            <Text style={activityStyles.label}>Brand :</Text>
                            <Text
                                style={activityStyles.value}>{item.callPlanOutlet ? item.callPlanOutlet.brand : item.callPlanSurvey.brand}</Text>
                        </View>
                        <View style={activityStyles.row}>
                            <Text style={activityStyles.label}>Tipe Outlet :</Text>
                            <Text
                                style={activityStyles.value}>{item.callPlanOutlet ? item.callPlanOutlet.sio_type : item.callPlanSurvey.sio_type}</Text>
                        </View>
                        <View style={activityStyles.row}>
                            <Text style={activityStyles.label}>Regional :</Text>
                            <Text
                                style={activityStyles.value}>{item.callPlanOutlet ? item.callPlanOutlet.region : item.callPlanSurvey.region}</Text>
                        </View>
                        <View style={activityStyles.row}>
                            <Text style={activityStyles.label}>Area :</Text>
                            <Text
                                style={activityStyles.value}>{item.callPlanOutlet ? item.callPlanOutlet.area : item.callPlanSurvey.area}</Text>
                        </View>
                    </View>

                </View>
            </View>
            <View style={activityStyles.cardContainer}>
                <View style={activityStyles.card}>
                    <View style={activityStyles.cardContent}>
                        <View>
                            <Text style={[activityStyles.label, {marginBottom: 8}]}>Status Outlet</Text>
                            <View style={activityStyles.pickerContainer}>
                                <Picker
                                    selectedValue={status}
                                    onValueChange={(itemValue) => {
                                        setStatus(itemValue);
                                        console.log(status + " STATUS NEW");
                                    }}>
                                    {item.type === 1 ? statusOptions.map(([key, value]) => (
                                        <Picker.Item key={key} label={value} value={String(key)}/>
                                    )) : statusOptionExist.map(([key, value]) => (
                                        <Picker.Item key={key} label={value} value={String(key)}/>
                                    ))}
                                </Picker>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
            <TouchableOpacity style={activityStyles.button} onPress={() => {
                setVisible(true)
            }}>
                <Text style={{color: Colors.buttonText, fontWeight: 'bold', fontSize: 20}}>Checkin</Text>
            </TouchableOpacity>
            {PopupCard()}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    button: {
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    closeButton: {
        marginTop: 15,
        backgroundColor: Colors.buttonBackground,
        padding: 10,
        borderRadius: 5,
    },
    closeButtonText: {
        color: '#fff',
    },
    closeIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#FF6347',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeIconText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    image: {
        width: 300,
        height: 300,
        borderRadius: 10,
    },
});
