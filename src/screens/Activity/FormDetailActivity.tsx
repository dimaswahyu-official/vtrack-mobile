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
import {StackNavigationProp} from "@react-navigation/stack";
import ActivityStyles from "../../utils/ActivityStyles";
import {EXISTING_SURVEY_STATUS, NEW_SURVEY_STATUS} from "../../constants/status";
import { ActivityRepository } from "../../model/ActivityRepository";
import {useLoadingStore} from "../../store/useLoadingStore";
import {sendOfflineData} from "../../services/sendOfflineData";
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

type NavigationProp = StackNavigationProp<ActivityStackParamList, 'FormDetailActivity'>;
type FormActivityRouteProp = RouteProp<ActivityStackParamList, 'FormDetailActivity'>;
type FormActivityProps = {
    route: FormActivityRouteProp;
};
export default function FormDetailActivity({route}: FormActivityProps) {
    const db = useSQLiteContext();
    const {item} = route.params || {};
    const navigation = useNavigation<NavigationProp>();
    const [visible, setVisible] = useState(false);
    const activityStyles = ActivityStyles();
    const defaultImage = 'https://via.placeholder.com/100';
    const {setLoading} = useLoadingStore();
    const statusOptions = Object.entries(NEW_SURVEY_STATUS);
    const statusOptionExist = Object.entries(EXISTING_SURVEY_STATUS);
    const defaultStatus = item.type === 1
        ? Number(statusOptions?.[0]?.[0] || 100)
        : Number(statusOptionExist?.[0]?.[0] || 100);
    const [status, setStatus] = useState(defaultStatus);
    const [activityDatas, setActivityDatas] = useState<any>(null);


    useEffect(() => {

        const fetchActivityData = async () => {
            try {
                const response = await ActivityRepository.findByCallPlanScheduleId(db, item.id);
                if (response && response.length > 0) {
                    setActivityDatas(response[0]);
                    setStatus(response[0].status);
                } else {
                    console.warn("No activity data found for the given schedule ID:", item.id);
                }
            } catch (error) {
                console.error("Error fetching activity data:", error);
            }
        };

        fetchActivityData();

    }, [item]);


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
    const insertActivityDB = async (data: any, image: any) => {
        const activity = {
            user_id: item.user_id ?? 0,
            call_plan_id: data.call_plan_id ?? 0,
            call_plan_schedule_id: item.id ?? 0,
            outlet_id: data?.callPlanOutlet?.id ?? 0,
            status: status ?? 0,
            area: data?.callPlanOutlet?.area ?? data?.callPlanSurvey?.area ?? '',
            region: data?.callPlanOutlet?.region ?? data?.callPlanSurvey?.region ?? '',
            brand: data?.callPlanOutlet?.brand ?? data?.callPlanSurvey?.brand ?? '',
            type_sio: data?.callPlanOutlet?.sio_type ?? data?.callPlanSurvey?.sio_type ?? '',
            start_time: new Date().toISOString(),
            end_time: new Date().toISOString(),
            photo: image ?? '',
            is_sync: 0,
            id_server: 0,
            photo_program: data.photo_program ?? '',
            sale_outlet_weekly: data?.sale_outlet_weekly ?? 0,
            latitude: data.callPlanOutlet?.latitude ?? data?.callPlanSurvey?.latitude ?? '',
            longitude: data.callPlanOutlet?.longitude ?? data?.callPlanSurvey?.longitude ?? '',
            survey_outlet_id: data?.callPlanSurvey?.id ?? 0,
            program_id: data?.program_id ?? 0,
        };

        try {
            setVisible(false);

            // Validate required fields
            if (!activity.call_plan_schedule_id) {
                throw new Error('Call plan schedule ID is required');
            }

            if (!activity.user_id) {
                throw new Error('User ID is required');
            }

            // Check if activity exists
            const existingActivity = await ActivityRepository.findByCallPlanScheduleId(db, item.id);
            const activityExists = existingActivity && existingActivity.length > 0;
            if (!activityExists) {
                // Create new activity
                await ActivityRepository.create(db, activity);
                const [resultInsert] = await ActivityRepository.findByCallPlanScheduleId(db, item.id);

                if (!resultInsert) {
                    throw new Error('Failed to retrieve newly created activity');
                }

                handleNavigation(status, resultInsert);

            } else {
                // Update existing activity
                await ActivityRepository.update(db, {
                    ...activity,
                    call_plan_schedule_id: item.id
                });

                handleNavigation(status, activityDatas);
            }

        } catch (error) {
            console.error('Error handling activity:', error);
            Alert.alert('Error', error instanceof Error ? error.message : 'An unknown error occurred');
        }
    };

    // Helper function to handle navigation logic
    const handleNavigation = async (status: number, activity: any) => {
        if (status !== 100 && status !== 202) {
            try {
                setLoading(true);
                await sendOfflineData(activity, 0, db)
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
            navigation.replace('Activity2');
        } else {
            navigation.navigate('FormDetailSio', {item, activity});
        }
    }

    const handleTakePhoto = async () => {
        try {
            setLoading(true);
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
            // if (!response.canceled) {
            //     // Pass the photo URI to the next page
            //     await insertActivityDB(item, response.assets[0].uri)
            // }

            if (!response.canceled) {
                // Get the file size of the original image
                const fileInfo = await FileSystem.getInfoAsync(response.assets[0].uri, { size: true });
                if (!fileInfo.exists) {
                    Alert.alert('Error', 'File does not exist.');
                    return;
                }

                let fileSizeInMB = fileInfo.size / (1024 * 1024); // Convert bytes to MB

                // Dynamically adjust compression quality to ensure the file size is below 1 MB
                let compressQuality = 0.9; // Start with 90% quality
                let compressedImage = response.assets[0].uri;

                while (fileSizeInMB >= 1 && compressQuality > 0.1) {
                    // Use the correct manipulateAsync method
                    const manipResult = await ImageManipulator.manipulateAsync(
                        response.assets[0].uri,
                        [{ resize: { width: 800 } }], // Resize the image to a width of 800px
                        { compress: compressQuality, format: ImageManipulator.SaveFormat.JPEG }
                    );

                    // Check the new file size
                    const newFileInfo = await FileSystem.getInfoAsync(manipResult.uri, { size: true });
                    if (!newFileInfo.exists) {
                        Alert.alert('Error', 'Compressed file does not exist.');
                        return;
                    }

                    fileSizeInMB = newFileInfo.size / (1024 * 1024);

                    // Reduce quality for the next iteration
                    compressQuality -= 0.1;

                    // Update the compressed image URI
                    compressedImage = manipResult.uri;
                }

                if (fileSizeInMB >= 1) {
                    Alert.alert('Warning', 'Unable to compress the image below 2 MB.');
                } else {
                    await insertActivityDB(item, compressedImage)
                }
            }
        }catch (error) {
            console.error('Error handling activity:', error);
            Alert.alert('Error', error instanceof Error ? error.message : 'An unknown error occurred');
        }finally {
            setLoading(false);
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
                                    selectedValue={String(status)}
                                    onValueChange={(itemValue) => {
                                        setStatus(Number(itemValue));
                                    }}
                                >
                                    {(item.type === 1 ? statusOptions : statusOptionExist).map(([key, value]) => (
                                        <Picker.Item key={key} label={value} value={String(key)} />
                                    ))}
                                </Picker>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
            {(!(status === activityDatas?.status) || activityDatas?.status === 100) && (
                <TouchableOpacity style={activityStyles.button} onPress={() => {
                    status === 100 && activityDatas ? navigation.navigate('FormDetailSio', { item, activity: activityDatas }) : setVisible(true);
                }}>
                    <Text style={{color: Colors.buttonText, fontWeight: 'bold', fontSize: 20}}>{status === activityDatas?.status && status === 100 ? 'NEXT' : 'CHECKIN'}</Text>
                </TouchableOpacity>
            )}
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
