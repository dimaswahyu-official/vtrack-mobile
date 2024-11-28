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
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { RouteProp } from "@react-navigation/native";
import { ActivityStackParamList } from "../../navigation/ActivityNavigator";
import useConstantStore from '../../store/useConstantStore';
import { ActivityModel, createTableActivity } from '../../model/activityModel'; // Import your models
import * as ImagePicker from 'expo-image-picker'; // Import ImagePicker
import { getStatusLabel, STATUS_ACTIVITY_MD_1, STATUS_ACTIVITY_MD_2, STATUS_ACTIVITY_MD_21, STATUS_ACTIVITY_MD_22, STATUS_ACTIVITY_MD_23, STATUS_ACTIVITY_MD_3, STATUS_INACTIVE } from '../../constants/status';
import { MaterialIcons } from '@expo/vector-icons'; // For Expo users
import { useSQLiteContext } from 'expo-sqlite';

type FormActivityRouteProp = RouteProp<ActivityStackParamList, 'FormActivityNormal'>;

type FormActivityProps = {
    route: FormActivityRouteProp;
};

// Define the Brand type
type Brand = {
    brand: string;
    created_at: string; // ISO date string
    created_by: string | null;
    deleted_at: string | null;
    deleted_by: string | null;
    id: number;
    sog: string[]; // Array of strings
    updated_at: string; // ISO date string
    updated_by: string | null;
};

// Define the SioType type
type SioType = {
    component: string[]; // Array of strings
    created_at: string; // ISO date string
    created_by: string | null;
    deleted_at: string | null;
    deleted_by: string | null;
    id: number;
    name: string;
    updated_at: string; // ISO date string
    updated_by: string | null;
};

export default function FormActivityNormal({ route }: FormActivityProps) {
    const db = useSQLiteContext(); // Access the database directly
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
    const [activitySio, setActivitySio] = useState<{ activity_id: number; name: string; description: string; notes: string; photo: string }[]>([]);
    const [activitySog, setActivitySog] = useState<{ activity_id: number; name: string; description: string; notes: string }[]>([]);
    const { brands, sio } = useConstantStore(); 
    const [isSioCollapsed, setIsSioCollapsed] = useState(true);
    const [isSogCollapsed, setIsSogCollapsed] = useState(true);

    useEffect(() => {
        const initializeDatabase = async () => {
            const getDataOffline = await ActivityModel.readAll(db);
            console.log('Table Data:', getDataOffline);
            console.log('Database Path:', db.databasePath); // Log the database path
        };

        initializeDatabase(); // Execute the initialization
    }, [db]);

    useEffect(() => {
        if (item) {
            setUserId(item.user_id || 1);
            setCallPlanScheduleId(item.call_plan_schedule_id || 1);
            setCallPlanId(item.call_plan_id || 1);
            setOutletId(item.outlet_id || 1);
            setStatus(item.status || null);
            setArea(item.callPlanOutlet.area || 'Area A');
            setRegion(item.callPlanOutlet.region || 'Region X');
            setStartTime(item.start_time || '2023-01-01T10:00:00Z');
            setEndTime(item.end_time || '2023-01-01T11:00:00Z');
        }
    }, [item]);

    console.log(db);
    

    useEffect(() => {
        if (item.callPlanOutlet) {
            // Filter the brand based on the item.callPlanOutlet.brand
            const filteredBrand = brands.filter(b => b.brand === item.callPlanOutlet.brand);
            // Set the brand state
            setBrand(filteredBrand.length > 0 ? filteredBrand[0] : {});

            // Filter the SIO based on the item.callPlanOutlet.sio_type
            const filteredSio = sio.filter(s => s.name === item.callPlanOutlet.sio_type);
            // Set the SIO type state
            setSioType(filteredSio.length > 0 ? filteredSio[0] : {});

            // Initialize activitySio and activitySog based on the selected brand and sioType
            if (filteredBrand.length > 0) {
                setActivitySog(Array.from({ length: filteredBrand[0].sog.length }, (_, i) => ({
                    activity_id: i + 1,
                    name: filteredBrand[0].sog[i],
                    description: '',
                    notes: ''
                })));
            }

            if (filteredSio.length > 0) {
                setActivitySio(Array.from({ length: filteredSio[0].component.length }, (_, i) => ({
                    activity_id: i + 1,
                    name: filteredSio[0].component[i],
                    description: '',
                    notes: '',
                    photo: ''
                })));
            }
        }
    }, [item, brands, sio]);

    const handleSioChange = (index: number, field: keyof typeof activitySio[number], value: string) => {
        const newActivitySio = [...activitySio];
        newActivitySio[index][field] = value as never;
        setActivitySio(newActivitySio);
    };

    const handleSogChange = (index: number, field: keyof typeof activitySog[number], value: string) => {
        const newActivitySog = [...activitySog];
        newActivitySog[index][field] = value as never;
        setActivitySog(newActivitySog);
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
            start_time: startTime,
            end_time: endTime,
            photo: '',
            activity_sio: activitySio,
            activity_sog: activitySog,
            is_sync: 0
        };

        try {
            const data = await ActivityModel.create(db, activityData);
            console.log(data);
            Alert.alert('Success', 'Activity created successfully!');
        } catch (error) {
            console.log(error);
            Alert.alert('Error', 'Failed to save activity.');
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
                        <Text style={styles.buttonText}> Take Photo</Text>
                    </TouchableOpacity>
                ) : (
                    // Show Clear Photo button if a photo exists
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: sio.photo }}
                            style={styles.imagePreview}
                        />  
                        <TouchableOpacity style={styles.clearButton} onPress={() => handleClearPhoto(index)}>
                            <Text style={styles.clearButtonText}>Clear Photo</Text>
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
            <Text style={styles.title}>Activity Form</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={status}
                    onValueChange={(itemValue) => setStatus(itemValue)}>
                    <Picker.Item label="Pilih Status Outlet" value={0}/>
                    <Picker.Item label={getStatusLabel(STATUS_ACTIVITY_MD_1)} value={STATUS_ACTIVITY_MD_1} />
                    <Picker.Item label={getStatusLabel(STATUS_ACTIVITY_MD_21)} value={STATUS_ACTIVITY_MD_21} />
                    <Picker.Item label={getStatusLabel(STATUS_ACTIVITY_MD_22)} value={STATUS_ACTIVITY_MD_22} />
                    <Picker.Item label={getStatusLabel(STATUS_ACTIVITY_MD_23)} value={STATUS_ACTIVITY_MD_23} />
                </Picker>
            </View>
            <TextInput
                style={styles.input}
                placeholder="Area"
                value={area}
                onChangeText={setArea}
            />
            <TextInput
                style={styles.input}
                placeholder="Region"
                value={region}
                onChangeText={setRegion}
            />
            <TextInput
                style={styles.input}
                placeholder="Brand"
                value={brand?.brand || ''}
            />
            <TextInput
                style={styles.input}
                placeholder="SIO Type"
                value={sioType?.name || ''}
            />
            <TextInput
                style={styles.input}
                placeholder="Start Time"
                value={startTime}
                onChangeText={setStartTime}
            />
            <TextInput
                style={styles.input}
                placeholder="End Time"
                value={endTime}
                onChangeText={setEndTime}
            />

           
            <View style={styles.collapsibleHeader}>
                {/* Collapsible Section */}
                <TouchableOpacity onPress={() => setIsSioCollapsed(!isSioCollapsed)} style={styles.collapsibleHeader}>
                    <Text style={styles.titleCollapsible}>Activity SIO</Text>
                    <MaterialIcons name={isSioCollapsed ? "add" : "remove"} size={24} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsSogCollapsed(!isSogCollapsed)} style={styles.collapsibleHeader}>
                    <Text style={styles.titleCollapsible}>Activity SOG</Text>
                    <MaterialIcons name={isSogCollapsed ? "add" : "remove"} size={24} color="#333" />
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
    container: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    titleCollapsible: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 0,
        color: '#333',
    },
    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    button: {
        width: '100%',
        height: 50,
        backgroundColor: '#007bff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    activityContainer: {
        marginBottom: 20,
        width: '100%',
    },
    imagePreview: {
        width: 100,
        height: 100,
        marginTop: 10,
        borderRadius: 5,
    },
    pickerContainer: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 15,
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
    photoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    imageContainer: {
        marginTop: 10,
        alignItems: 'center',
    },
    clearButton: {
        marginTop: 10,
        backgroundColor: 'red',
        padding: 5,
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
        padding: 10,
        backgroundColor: '#ddd',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
    },
});
