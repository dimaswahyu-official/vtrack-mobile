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
import {EXISTING_SURVEY_STATUS, getStatusLabelNew, NEW_SURVEY_STATUS} from "../../constants/status";

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
    const [userId, setUserId] = useState(1);
    const [callPlanScheduleId, setCallPlanScheduleId] = useState(1);
    const [callPlanId, setCallPlanId] = useState(1);
    const [outletId, setOutletId] = useState(1);
    const [status, setStatus] = useState(0);
    const [pickerOptions, setPickerOptions] = useState([]); // Options for the picker

    const [area, setArea] = useState('Area A');
    const [region, setRegion] = useState('Region X');
    const [visible, setVisible] = useState(false);
    const [startTime, setStartTime] = useState('2023-01-01T10:00:00Z');
    const [endTime, setEndTime] = useState('2023-01-01T11:00:00Z');
    const [dataOffline, setDataOffline] = useState<any>({});
    const [activityPhotos, setActivityPhotos] = useState<Array<string>>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const activityStyles = ActivityStyles();
    const defaultImage = 'https://via.placeholder.com/100';
    const statusOptions = Object.entries(NEW_SURVEY_STATUS);
    const statusOptionExist = Object.entries(EXISTING_SURVEY_STATUS);
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


    // HANDLE SUBMIT
    const handleSubmit = async () => {
        const activityData = {
            user_id: userId,
            call_plan_schedule_id: callPlanScheduleId,
            call_plan_id: callPlanId,
            outlet_id: outletId,
            survey_outlet_id: "", //NEW
            program_id: "", //NEW
            status: status,
            area: area,
            region: region,
            start_time: startTime || new Date().toISOString(),
            end_time: new Date().toISOString(),
            photo: JSON.stringify(activityPhotos),
            created_by: "user_creator",
            created_at: new Date().toISOString(),
            is_sync: 0,
            id_server: 0
        };
        console.log("SUBMIT DATAA" + JSON.stringify(activityData));
    }

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

    // Function to handle image press
    const handleImagePress = (item: string) => {
        setSelectedImage(item);
        setIsModalVisible(true);
    };
    const handleRemovePhoto = (index: number) => {
        const newPhotos = activityPhotos.filter((_, i) => i !== index);
        setActivityPhotos(newPhotos);
    };
    console.log("dd"+ item.callPlanOutlet.photos[0])
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
            navigation.navigate('FormDetailSio', { item, photox:response.assets[0].uri ?? defaultImage });
            setVisible(false);
        }
    }

    const handleClearPhoto = (index: number) => {
        // const newActivitySio = [...activitySio];
        // newActivitySio[index].photo = '';
        // setActivitySio(newActivitySio);
    };

    // const handleTakePhotoMany = async () => {
    //     // Request camera permissions
    //     const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    //     if (!permissionResult.granted) {
    //         Alert.alert('Permission required', 'Please grant permission to access the camera.');
    //         return;
    //     }
    //
    //     // Launch the camera
    //     const result = await ImagePicker.launchCameraAsync({
    //         allowsEditing: true,
    //         quality: 1,
    //     });
    //
    //     console.log('result', activityPhotos);
    //     if (!result.canceled) {
    //         setActivityPhotos([...activityPhotos, result.assets[0].uri]);
    //     }
    //
    //     console.log('result2', activityPhotos);
    // };

    return (
        <ScrollView contentContainerStyle={activityStyles.container}>
            {/* Full-Width Image */}
            <Image
                source={{uri:  item.callPlanOutlet.photos[0] || defaultImage}} // Replace with your image URL
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
                            <Text style={activityStyles.value}>{item.callPlanOutlet? item.callPlanOutlet.name : ''}</Text>
                        </View>
                        <View style={activityStyles.row}>
                            <Text style={activityStyles.label}>Kode Outlet :</Text>
                            <Text style={activityStyles.value}>{item.callPlanOutlet? item.callPlanOutlet.outlet_code : ''}</Text>
                        </View>
                        <View style={activityStyles.row}>
                            <Text style={activityStyles.label}>Address :</Text>
                            <Text style={[activityStyles.value, {
                                flexShrink: 1,
                                textAlign: 'right'
                            }]}>{item.callPlanOutlet? item.callPlanOutlet.address_line : ''}</Text>
                        </View>
                        <View style={activityStyles.row}>
                            <Text style={activityStyles.label}>Brand :</Text>
                            <Text style={activityStyles.value}>{item.callPlanOutlet? item.callPlanOutlet.brand :''}</Text>
                        </View>
                        <View style={activityStyles.row}>
                            <Text style={activityStyles.label}>Tipe Outlet :</Text>
                            <Text style={activityStyles.value}>{item.callPlanOutlet? item.callPlanOutlet.sio_type : ''}</Text>
                        </View>
                        <View style={activityStyles.row}>
                            <Text style={activityStyles.label}>Regional :</Text>
                            <Text style={activityStyles.value}>{item.callPlanOutlet? item.callPlanOutlet.region :''}</Text>
                        </View>
                        <View style={activityStyles.row}>
                            <Text style={activityStyles.label}>Area :</Text>
                            <Text style={activityStyles.value}>{item.callPlanOutlet? item.callPlanOutlet.area:''}</Text>
                        </View>
                    </View>

                </View>
            </View>
            <Text style={activityStyles.title}>Program</Text>
            <View style={activityStyles.cardContainer}>
                <View style={activityStyles.card}>
                    <View style={activityStyles.cardContent}>
                        <View>
                            <Text style={[activityStyles.label, {alignItems: 'flex-end', marginBottom: 8}]}>JUDUL
                                PROGRAM</Text>
                            <Text style={activityStyles.value}>Isi Program : Telah terjadi penembakan di game valorant
                                yang
                                menyebabkan perdamaian dunia terganggu</Text>
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
                                        console.log(status+" STATUS");
                                        if (itemValue !== 0) {
                                            setStartTime(new Date().toISOString());
                                        }
                                    }}>
                                    {item.type===1 ? statusOptions.map(([key, value]) => (
                                        <Picker.Item key={key} label={value} value={key} />
                                    )) : statusOptionExist.map(([key, value]) => (
                                        <Picker.Item key={key} label={value} value={key} />
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
