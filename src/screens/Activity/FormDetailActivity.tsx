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
import useConstantStore from "../../store/useConstantStore";
import {MaterialIcons} from "@expo/vector-icons";
import {formatDateWithTime} from "../../utils/DateHelper";
import {Picker} from "@react-native-picker/picker";
import Carousel from "react-native-reanimated-carousel";
import AntDesign from "@expo/vector-icons/AntDesign";
import Colors from "../../utils/Colors";
import * as ImagePicker from "expo-image-picker";
import {StackNavigationProp} from "@react-navigation/stack";
import ActivityStyles from "../../utils/ActivityStyles";
import {EXISTING_SURVEY_STATUS, NEW_SURVEY_STATUS} from "../../constants/status";
import useAbsenToday from "../../store/useAbsenToday";
import {ActivityModel2} from "../../model/activityModel2";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ActivityService from "../../services/activityService";

const {width, height} = Dimensions.get('window');
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
    const [callPlanId, setCallPlanId] = useState(1);
    const [outletId, setOutletId] = useState(1);
    const [surveyOutletId, setSurveyOutletId] = useState(1);
    const [programId, setProgramId] = useState(1);
    const [area, setArea] = useState('Area A');
    const [region, setRegion] = useState('Region X');
    const [brand, setBrand] = useState('Region X');
    const [typeSio, setSio] = useState('Region X');
    const [createdAt, setCreatedAt] = useState('Region X');
    const [createdBy, setCreatedBy] = useState('Region X');
    const [startTime, setStartTime] = useState('2023-01-01T10:00:00Z');
    const [endTime, setEndTime] = useState('2023-01-01T11:00:00Z');
    const [photosx, setPhotos] = useState<any | null>(null);
    const [pickerOptions, setPickerOptions] = useState([]); // Options for the picker

    const [visible, setVisible] = useState(false);
    const [idActivity, setIdActivity] = useState(0);

    const [dataOffline, setDataOffline] = useState<any>({});
    const [activityPhotos, setActivityPhotos] = useState<Array<string>>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const activityStyles = ActivityStyles();
    const defaultImage = 'https://via.placeholder.com/100';
    const statusOptions = Object.entries(NEW_SURVEY_STATUS);
    const statusOptionExist = Object.entries(EXISTING_SURVEY_STATUS);
    const [status, setStatus] = useState(
        item.type === 1 ? Number(statusOptions[0][0]) : Number(statusOptionExist[0][0])
    );

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
                            {/*{photox && (*/}
                            {/*    <Image source={{ uri: photox }} style={{ width: 100, height: 100 }} />*/}
                            {/*)}*/}
                        </View>
                    </View>
                </Modal>
            </View>
        );
    };
    // insert data after fetching to sqlite
    const insertActivityDB =  async (data: any , image:any) => {
        // If the input is an array, loop through and process each item
        // if (Array.isArray(data)) {
        //     data.forEach((activity: any) => {
        //         insertActivityDB(activity); // Call the function for each individual item
        //     });
        //     console.log('You have total Data to Insert = ' + data.length);
        //     return; // Exit after processing the array
        // }
        // If the input is a single object, process it
        const activityData = {
            user_id: userId, // Ensure `userId` is defined
            call_plan_id: data.call_plan_id ?? 0,
            call_plan_schedule_id: callPlanScheduleId,
            outlet_id: data.outlet_id ?? 0,
            survey_outlet_id: data.survey_outlet_id ?? 0,
            program_id: data.program_id ?? 0,
            status: status ?? 200, // Ensure `status` is defined
            area: data?.callPlanOutlet?.area ?? data?.callPlanSurvey?.area ?? '',
            region: data?.callPlanOutlet?.region ?? data?.callPlanSurvey?.region ?? '',
            brand: data?.callPlanOutlet?.brand ?? data?.callPlanSurvey?.brand ?? '',
            type_sio: data?.callPlanOutlet?.sio_type ?? data?.callPlanSurvey?.sio_type ?? '',
            start_time: new Date().toISOString(),
            end_time: new Date().toISOString(),
            photo: image,
            updated_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            is_sync: 0,
            id_server: 0,
        };
        try {
            setVisible(false);
            // insert data into SQLite
            const idAct = await ActivityModel2.create(db, activityData);
            setIdActivity(idAct);
            //get activity by schedule id
            const resultinsert = await ActivityModel2.getActivityByScheduleId(db, callPlanScheduleId);
            console.log("resultinsert = ", resultinsert[0]);
            //test to send backend
            // const response = await ActivityService.syncActivity(resultinsert);
            // console.log("from api = "+response);
            if (status == 401 || status == 402 || status == 403 || status == 404) {
                navigation.replace('Activity2',{status}); // Navigate to "Activity" screen
            } else {
                // Step 2: Navigate to the next screen if the insertion is successful
                navigation.navigate('FormDetailSio', {item, photox: image, idx: idActivity});
                console.log('Navigation to FormDetailSio successful');

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

    useEffect(() => {
        console.log(`Default Status: ${status}`);
    }, [status]);


    return (
        <ScrollView contentContainerStyle={activityStyles.container}>
            {/* Full-Width Image */}
            <Image
                source={{uri: item.callPlanOutlet.photos[0] || defaultImage}} // Replace with your image URL
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
                                style={activityStyles.value}>{item.callPlanOutlet ? item.callPlanOutlet.name : ''}</Text>
                        </View>
                        <View style={activityStyles.row}>
                            <Text style={activityStyles.label}>Kode Outlet :</Text>
                            <Text
                                style={activityStyles.value}>{item.callPlanOutlet ? item.callPlanOutlet.outlet_code : ''}</Text>
                        </View>
                        <View style={activityStyles.row}>
                            <Text style={activityStyles.label}>Address :</Text>
                            <Text style={[activityStyles.value, {
                                flexShrink: 1,
                                textAlign: 'right'
                            }]}>{item.callPlanOutlet ? item.callPlanOutlet.address_line : ''}</Text>
                        </View>
                        <View style={activityStyles.row}>
                            <Text style={activityStyles.label}>Brand :</Text>
                            <Text
                                style={activityStyles.value}>{item.callPlanOutlet ? item.callPlanOutlet.brand : ''}</Text>
                        </View>
                        <View style={activityStyles.row}>
                            <Text style={activityStyles.label}>Tipe Outlet :</Text>
                            <Text
                                style={activityStyles.value}>{item.callPlanOutlet ? item.callPlanOutlet.sio_type : ''}</Text>
                        </View>
                        <View style={activityStyles.row}>
                            <Text style={activityStyles.label}>Regional :</Text>
                            <Text
                                style={activityStyles.value}>{item.callPlanOutlet ? item.callPlanOutlet.region : ''}</Text>
                        </View>
                        <View style={activityStyles.row}>
                            <Text style={activityStyles.label}>Area :</Text>
                            <Text
                                style={activityStyles.value}>{item.callPlanOutlet ? item.callPlanOutlet.area : ''}</Text>
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
                                        console.log(status + " STATUS");
                                        if (itemValue !== 0) {
                                            setStartTime(new Date().toISOString());
                                        }
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
