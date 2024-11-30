import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    TextInput,
    Text,
    TouchableOpacity,
    Alert,
    ScrollView,
    Image,
    Dimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { RouteProp } from "@react-navigation/native";
import { ActivityStackParamList } from "../../navigation/ActivityNavigator";
import useConstantStore from '../../store/useConstantStore';
import { ActivityModel } from '../../model/activityModel';
import * as ImagePicker from 'expo-image-picker';
import { getStatusLabel, STATUS_ACTIVITY_MD_1, STATUS_ACTIVITY_MD_21, STATUS_ACTIVITY_MD_22, STATUS_ACTIVITY_MD_23 } from '../../constants/status';
import { MaterialIcons } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import Colors from '../../utils/Colors';
import Carousel from 'react-native-reanimated-carousel';
import { formatDate, formatDateWithTime } from '../../utils/DateHelper';
import AntDesign from '@expo/vector-icons/AntDesign';

const { width, height } = Dimensions.get('window');


type FormActivityRouteProp = RouteProp<ActivityStackParamList, 'FormActivityNormal'>;

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

// Define the SioType type
type SioType = {
    component: string[];
    created_at: string;
    created_by: string | null;
    deleted_at: string | null;
    deleted_by: string | null;
    id: number;
    name: string;
    updated_at: string;
    updated_by: string | null;
};

export default function FormActivityNormal({ route }: FormActivityProps) {
    const db = useSQLiteContext();
    const { item } = route.params || {};
    const [userId, setUserId] = useState(1);
    const [callPlanScheduleId, setCallPlanScheduleId] = useState(1);
    const [callPlanId, setCallPlanId] = useState(1);
    const [outletId, setOutletId] = useState(1);
    const [status, setStatus] = useState(0);
    const [area, setArea] = useState('Area A');
    const [region, setRegion] = useState('Region X');
    const [brand, setBrand] = useState<Brand | null>(null);
    const [sioType, setSioType] = useState<SioType | null>(null);
    const [startTime, setStartTime] = useState('2023-01-01T10:00:00Z');
    const [endTime, setEndTime] = useState('2023-01-01T11:00:00Z');
    const [activitySio, setActivitySio] = useState<{ name: string; description: string; notes: string; photo: string }[]>([]);
    const [activitySog, setActivitySog] = useState<{ name: string; description: string; notes: string }[]>([]);
    const { brands, sio } = useConstantStore(); 
    const [isSioCollapsed, setIsSioCollapsed] = useState(true);
    const [isSogCollapsed, setIsSogCollapsed] = useState(true);
    const [dataOffline, setDataOffline] = useState({});
    const [activityPhotos, setActivityPhotos] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const { width, height } = Dimensions.get('window');

    useEffect(() => {
        const initializeDatabase = async () => {
            const getDataOffline = await ActivityModel.getActivityByScheduleId(db, item?.id);
            setDataOffline(getDataOffline || {});
            // Map existing data to state
            if (getDataOffline) {
                setUserId(getDataOffline.user_id || item?.user_id);
                setCallPlanScheduleId(getDataOffline.call_plan_schedule_id || item?.id);
                setCallPlanId(getDataOffline.call_plan_id || item.call_plan_id);
                setOutletId(getDataOffline.outlet_id || item.outlet_id);
                setStatus(getDataOffline.status || item.status);
                setArea(getDataOffline.area || item.callPlanOutlet?.area);
                setRegion(getDataOffline.region || item.callPlanOutlet?.region);
                setStartTime(getDataOffline.start_time || item.start_time);
                setEndTime(getDataOffline.end_time || item.end_time);
                setBrand({brand: getDataOffline.brand} as Brand);
                setSioType({name: getDataOffline.type_sio} as SioType);
                setActivitySio(getDataOffline.activity_sio || []);
                setActivitySog(getDataOffline.activity_sog || []);
                setActivityPhotos(getDataOffline.photo ? JSON.parse(getDataOffline.photo) : []);                
            } else {
                // If getDataOffline is null, use item values as fallback
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
                setSioType(item.callPlanOutlet?.sio_type);
                setActivityPhotos(item.callPlanOutlet?.photos || []);
                if(brands.length > 0 && sio.length > 0) {
                    const filteredBrand = brands.filter(b => b.brand === item.callPlanOutlet.brand);
                    setBrand(filteredBrand.length > 0 ? filteredBrand[0] : {});
                    const filteredSio = sio.filter(s => s.name === item.callPlanOutlet.sio_type);
                    setSioType(filteredSio.length > 0 ? filteredSio[0] : {});

                    // Initialize activitySio and activitySog based on the selected brand and sioType
                    if (filteredBrand.length > 0) {
                        setActivitySog(Array.from({ length: filteredBrand[0].sog.length }, (_, i) => ({
                            name: filteredBrand[0].sog[i],
                            description: '',
                            notes: ''
                        })));
                    }

                    if (filteredSio.length > 0) {
                        setActivitySio(Array.from({ length: filteredSio[0].component.length }, (_, i) => ({
                            name: filteredSio[0].component[i],
                            description: '',
                            notes: '',
                            photo: ''
                        })));
                    }
                }
            }
        };

        initializeDatabase();
    }, [db, item?.id]);

    console.log('activityPhotos', activityPhotos);
    
    // const handleSioChange = (index: number, field: keyof typeof activitySio[number], value: string) => {
    //     const newActivitySio = [...activitySio];
    //     newActivitySio[index][field] = value as never;
    //     setActivitySio(newActivitySio);
    // };

    // const handleSogChange = (index: number, field: keyof typeof activitySog[number], value: string) => {
    //     const newActivitySog = [...activitySog];
    //     newActivitySog[index][field] = value as never;
    //     setActivitySog(newActivitySog);
    // };

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
            const newActivitySio = [...activitySio];
            newActivitySio[index].photo = result.assets[0].uri;
            setActivitySio(newActivitySio);
        }
    };

    const handleClearPhoto = (index: number) => {
        const newActivitySio = [...activitySio];
        newActivitySio[index].photo = '';
        setActivitySio(newActivitySio);
    };

    const handleImagePicker = async (index: number) => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            const newActivitySio = [...activitySio];
            newActivitySio[index].photo = result.assets[0].uri;
            setActivitySio(newActivitySio);
        }
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

        if (!result.canceled) {
            setActivityPhotos([...activityPhotos, result.assets[0].uri]);
        }
    };

    const handleSubmit = async () => {
        const activityData = {
            user_id: userId,
            call_plan_schedule_id: callPlanScheduleId,
            call_plan_id: callPlanId,
            outlet_id: outletId,
            status: status,
            area: area,
            region: region,
            brand: brand?.brand || '',
            type_sio: sioType?.name || '',
            start_time: startTime || new Date().toISOString(),
            end_time: new Date().toISOString(),
            photo: JSON.stringify(activityPhotos),
            activity_sio: activitySio,
            activity_sog: activitySog,
            is_sync: 0
        };

        try {
            if(dataOffline) {
                const data = await ActivityModel.update(db, dataOffline.id, activityData);
                Alert.alert('Success', 'Activity updated successfully!');
            }else{
                const data = await ActivityModel.create(db, activityData);
                Alert.alert('Success', 'Activity created successfully!');
            }
        } catch (error) {
            console.log(error);
            Alert.alert('Error', 'Failed to save activity.');
        }
    };

    const handleRemovePhoto = (index: number) => {
        const newPhotos = activityPhotos.filter((_, i) => i !== index);
        setActivityPhotos(newPhotos);
    };

    const handleNext = () => {
        if (currentIndex < activityPhotos.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    // Function to render SIO components
    const renderSioComponents = () => {
        return activitySio.map((sio, index) => (
            <View key={index} style={styles.activityContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="SIO Name"
                    value={sio.name}
                    onChangeText={(text) => {
                        const newActivitySio = [...activitySio];
                        newActivitySio[index].name = text;
                        setActivitySio(newActivitySio);
                    }}
                />
                <TextInput
                    style={styles.input}
                    placeholder="SIO Description"
                    value={sio.description}
                    onChangeText={(text) => {
                        const newActivitySio = [...activitySio];
                        newActivitySio[index].description = text;
                        setActivitySio(newActivitySio);
                    }}
                />
                <TextInput
                    style={styles.input}
                    placeholder="SIO Notes"
                    value={sio.notes}
                    onChangeText={(text) => {
                        const newActivitySio = [...activitySio];
                        newActivitySio[index].notes = text;
                        setActivitySio(newActivitySio);
                    }}
                />
                    {sio.photo === '' ? (
                    <TouchableOpacity style={styles.photoButton} onPress={() => handleTakePhoto(index)}>
                        <MaterialIcons name="camera-alt" size={24} color="#fff" />
                        <Text style={styles.buttonText}>Photo</Text>
                    </TouchableOpacity>
                ) : (
                    // Show Clear Photo button if a photo exists
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: sio.photo }}
                            style={styles.imagePreview}
                        />  
                        <TouchableOpacity style={styles.clearButton} onPress={() => handleClearPhoto(index)}>
                            <MaterialIcons name="delete" size={15} color="#fff" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        ));
    };

    // Function to render SOG components
    const renderSogComponents = () => {
        return activitySog.map((sog, index) => (
            <View key={index} style={styles.activityContainer}>
                <Text style={styles.title}>SOG {index + 1}</Text>
                <TextInput
                    style={styles.input}
                    placeholder="SOG Name"
                    value={sog.name}
                    onChangeText={(text) => {
                        const newActivitySog = [...activitySog];
                        newActivitySog[index].name = text;
                        setActivitySog(newActivitySog);
                    }}
                />
                <TextInput
                    style={styles.input}
                    placeholder="SOG Description"
                    value={sog.description}
                    onChangeText={(text) => {
                        const newActivitySog = [...activitySog];
                        newActivitySog[index].description = text;
                        setActivitySog(newActivitySog);
                    }}
                />
                <TextInput
                    style={styles.input}
                    placeholder="SOG Notes"
                    value={sog.notes}
                    onChangeText={(text) => {
                        const newActivitySog = [...activitySog];
                        newActivitySog[index].notes = text;
                        setActivitySog(newActivitySog);
                    }}
                />
            </View>
        ));
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.row}>
                <View style={styles.col1}>
                    <Text style={[styles.title, {alignSelf: 'flex-start', marginTop: height * 0.01}]}>Activity Form</Text>
                </View>
                <View style={[styles.col2, {flex:1.2}]}>
                    <TextInput
                        style={styles.input}
                        value={formatDateWithTime(startTime)}
                        editable={false}
                    />
                </View>
            </View>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={status}
                    onValueChange={(itemValue) => {
                        setStatus(itemValue);
                        if (itemValue !== 0) {
                            setStartTime(new Date().toISOString());
                        }
                    }}>
                    <Picker.Item label="Pilih Status Outlet" value={0} />
                    <Picker.Item label={getStatusLabel(STATUS_ACTIVITY_MD_1)} value={STATUS_ACTIVITY_MD_1} />
                    <Picker.Item label={getStatusLabel(STATUS_ACTIVITY_MD_21)} value={STATUS_ACTIVITY_MD_21} />
                    <Picker.Item label={getStatusLabel(STATUS_ACTIVITY_MD_22)} value={STATUS_ACTIVITY_MD_22} />
                    <Picker.Item label={getStatusLabel(STATUS_ACTIVITY_MD_23)} value={STATUS_ACTIVITY_MD_23} />
                </Picker>
            </View>
            <View style={styles.row}>
                <View style={styles.col1}>
                    <Text style={styles.titleForm}>Outlet</Text>
                    <TextInput
                        style={styles.input}
                        value={item.callPlanOutlet.name}
                    />
                    <Text style={styles.titleForm}>Area</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Area"
                        value={area}
                        onChangeText={setArea}
                    />
                </View>
                <View style={styles.col2}>
                    <Text style={styles.titleForm}>Brand</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Brand"
                        value={brand?.brand || ''}
                    />
                    <Text style={styles.titleForm}>Tipe SIO</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Tipe SIO"
                        value={sioType?.name || ''}
                    />
                </View>
            </View>
            <Text style={styles.titleForm}>Alamat</Text>
            <TextInput
                style={styles.input}
                placeholder="Alamat"
                value={item.callPlanOutlet.address_line}
            />
            <View style={[styles.row, {alignItems: 'center', justifyContent: 'center'}]}>
                <TouchableOpacity style={[styles.photoButton, {marginBottom: height * 0.02}]} onPress={handleTakePhotoMany}>
                    <MaterialIcons name="camera-alt" size={22} color="#fff" />
                    <Text style={styles.buttonText}>Photo</Text>
                </TouchableOpacity>
            </View>
            {activityPhotos.length > 0 && (
                    <Carousel
                        loop={false}
                        width={width * 0.8}
                        height={height * 0.22}
                        data={activityPhotos}
                        renderItem={({ item, index }) => (
                            <View style={styles.imageContainer}>
                            <Image source={{ uri: item }} style={styles.imagePreview} />
                                <TouchableOpacity style={styles.removeButton} onPress={() => handleRemovePhoto(index)}>
                                    <MaterialIcons name="delete" size={15} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        )}
                        pagingEnabled={true}
                    />
            )}
           
            <View style={styles.collapsibleHeader}>
                {/* Collapsible Section */}
                <TouchableOpacity onPress={() => setIsSioCollapsed(!isSioCollapsed)} style={[styles.collapsibleHeader, 
                    {backgroundColor: isSioCollapsed ? '#f0f0f0' : '#fff', marginRight: width * 0.02}]}>
                    <Text style={[styles.titleCollapsible, {marginRight: width * 0.02}]}>Activity SIO</Text>
                    <AntDesign name={isSioCollapsed ? "caretup" : "caretdown"} size={22} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsSogCollapsed(!isSogCollapsed)} style={[styles.collapsibleHeader, 
                    {backgroundColor: isSogCollapsed ? '#f0f0f0' : '#fff', marginLeft: width * 0.02}]}>
                    <Text style={[styles.titleCollapsible, {marginRight: width * 0.02}]}>Activity SOG</Text>
                    <AntDesign name={isSogCollapsed ? "caretup" : "caretdown"} size={22} color="#333" />
                </TouchableOpacity>
            </View>

            {!isSioCollapsed && renderSioComponents()}
            
            {!isSogCollapsed && renderSogComponents()}

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    col1: {
        flex: 1,
        paddingRight: width * 0.02,
    },
    col2: {
        flex: 1,
    },
    container: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: width * 0.05,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: width * 0.05,
        fontWeight: 'bold',
        marginBottom: height * 0.02,
        color: '#333',
    },
    titleForm: {
        fontSize: width * 0.03,
        fontWeight: '500',
        marginBottom: height * 0.005,
        color: '#333',
        marginLeft: width * 0.02,
    },
    titleCollapsible: {
        fontSize: width * 0.035,
        fontWeight: 'bold',
        marginBottom: 0,
        color: '#333',
    },
    input: {
        width: '100%',
        height: height * 0.05,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: width * 0.02,
        marginBottom: height * 0.015,
        backgroundColor: '#fff',
    },
    button: {
        width: '100%',
        height: height * 0.06,
        backgroundColor: Colors.buttonBackground,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        marginTop: height * 0.02,
    },
    buttonText: {
        color: '#fff',
        fontSize: width * 0.04,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    activityContainer: {
        marginVertical: height * 0.012,
        width: '100%',
    },
    imagePreview: {
        width: width * 0.25,
        height: width * 0.25,
        marginTop: height * 0.014,
        borderRadius: 5,
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
    photoButton: {
        width: '28%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.secondaryColor,
        padding: height * 0.015,
        borderRadius: 5,
        marginTop: height * 0.01,
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
    clearButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    collapsibleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: height * 0.009,
        paddingLeft: width * 0.025,
        paddingRight: width * 0.025,
        backgroundColor: Colors.secondaryColor,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
    },
    removeButton: {
        marginTop: 10,
        padding: 6,
        backgroundColor: 'red',
        borderRadius: 5,
    },
    removeButtonText: {
        color: 'white',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
});
