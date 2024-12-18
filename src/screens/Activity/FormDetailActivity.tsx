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
    const [dataOffline, setDataOffline] = useState<any>({});
    const [activityPhotos, setActivityPhotos] = useState<Array<string>>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const activityStyles = ActivityStyles();
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

    const handleCheckIn = () => {
        navigation.navigate('FormDetailSio', {item});

        // setIsFullActivity(true); // Set state to true when button is clicked
    };

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


    // Function to handle image press
    const handleImagePress = (item: string) => {
        setSelectedImage(item);
        setIsModalVisible(true);
    };
    const handleRemovePhoto = (index: number) => {
        const newPhotos = activityPhotos.filter((_, i) => i !== index);
        setActivityPhotos(newPhotos);
    };
    const handleTakePhoto = async (index: number) => {
        // Request camera permissions
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('Permission required', 'Please grant permission to access the camera.');
            return;
        }

        // Launch the camera
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            // const newActivitySio = [...activitySio];
            // newActivitySio[index].photo = result.assets[0].uri;
            // setActivitySio(newActivitySio);
        }
    };
    const handleClearPhoto = (index: number) => {
        // const newActivitySio = [...activitySio];
        // newActivitySio[index].photo = '';
        // setActivitySio(newActivitySio);
    };
    const handleTakePhotoMany = async () => {
        // Request camera permissions
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('Permission required', 'Please grant permission to access the camera.');
            return;
        }

        // Launch the camera
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 1,
        });

        console.log('result', activityPhotos);
        if (!result.canceled) {
            setActivityPhotos([...activityPhotos, result.assets[0].uri]);
        }

        console.log('result2', activityPhotos);
    };

    return (
        <ScrollView contentContainerStyle={activityStyles.container}>
            {/* Full-Width Image */}
            <Image
                source={{uri: item.callPlanOutlet.photos[0]}} // Replace with your image URL
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
                            <Text style={activityStyles.value}>{item.callPlanOutlet.name}</Text>
                        </View>
                        <View style={activityStyles.row}>
                            <Text style={activityStyles.label}>Kode Outlet :</Text>
                            <Text style={activityStyles.value}>{item.callPlanOutlet.outlet_code}</Text>
                        </View>
                        <View style={activityStyles.row}>
                            <Text style={activityStyles.label}>Address :</Text>
                            <Text style={[activityStyles.value, {
                                flexShrink: 1,
                                textAlign: 'right'
                            }]}>{item.callPlanOutlet.address_line}</Text>
                        </View>
                        <View style={activityStyles.row}>
                            <Text style={activityStyles.label}>Brand :</Text>
                            <Text style={activityStyles.value}>{item.callPlanOutlet.brand}</Text>
                        </View>
                        <View style={activityStyles.row}>
                            <Text style={activityStyles.label}>Tipe Outlet :</Text>
                            <Text style={activityStyles.value}>{item.callPlanOutlet.sio_type}</Text>
                        </View>
                        <View style={activityStyles.row}>
                            <Text style={activityStyles.label}>Regional :</Text>
                            <Text style={activityStyles.value}>{item.callPlanOutlet.region}</Text>
                        </View>
                        <View style={activityStyles.row}>
                            <Text style={activityStyles.label}>Area :</Text>
                            <Text style={activityStyles.value}>{item.callPlanOutlet.area}</Text>
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
                            <Text style={activityStyles.value}>Isi Program : Telah terjadi penembakan di game valorant yang
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
                                        if (itemValue !== 0) {
                                            setStartTime(new Date().toISOString());
                                        }
                                    }}>
                                    <Picker.Item label="Pilih Status Outlet" value={0}/>
                                    <Picker.Item label="Proses Dikunjungi"
                                                 value={"STATUS_ACTIVITY_MD_1"}/>
                                    <Picker.Item label={"Belum Dikunjungi"}
                                                 value={"STATUS_ACTIVITY_MD_2"}/>
                                    <Picker.Item label={"Sudah Dikunjungi"}
                                                 value={"STATUS_ACTIVITY_MD_3"}/>
                                    <Picker.Item label={"Selesai"}
                                                 value={"STATUS_ACTIVITY_MD_4"}/>
                                </Picker>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
            <TouchableOpacity style={activityStyles.button} onPress={handleCheckIn}>
                <Text style={{color: Colors.buttonText, fontWeight: 'bold', fontSize: 20}}>Checkin</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

