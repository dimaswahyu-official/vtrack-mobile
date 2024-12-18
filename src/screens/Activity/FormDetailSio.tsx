import {Alert, Dimensions, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import {RouteProp, useNavigation} from "@react-navigation/native";
import {ActivityStackParamList} from "../../navigation/ActivityNavigator";
import {useSQLiteContext} from "expo-sqlite";
import React, {useEffect, useState} from "react";
import useConstantStore from "../../store/useConstantStore";
import Colors from "../../utils/Colors";
import {MaterialIcons} from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {StackNavigationProp} from "@react-navigation/stack";

const {width, height} = Dimensions.get('window');

type NavigationProp = StackNavigationProp<ActivityStackParamList, 'FormDetailSio'>;
type FormActivityRouteProp = RouteProp<ActivityStackParamList, 'FormDetailSio'>;

type FormActivityProps = {
    route: FormActivityRouteProp;
};

// Define the SioType type
type SioType = {
    sioTypeGalery: {
        id: number;
        name: string;
        photo: string;
    }[];
    id: number;
    name: string;
};

export default function FormDetailSio({route}: FormActivityProps) {
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
    const [sioType, setSioType] = useState<SioType | null>(null);
    const [startTime, setStartTime] = useState('2023-01-01T10:00:00Z');
    const [endTime, setEndTime] = useState('2023-01-01T11:00:00Z');
    const [activitySio, setActivitySio] = useState<{
        activity_id: number;
        name: string;
        description: string;
        notes: string;
        photo: string
    }[]>([]);

    const {sio} = useConstantStore();
    useEffect(() => {
        if (sio.length > 0) {
            const filteredSio = sio.filter(s => s.name === item.callPlanOutlet.sio_type);
            setSioType(filteredSio.length > 0 ? filteredSio[0] : {});
            if (filteredSio.length > 0) {
                setActivitySio(Array.from({length: filteredSio[0].sioTypeGalery.length}, (_, i) => ({
                    activity_id: filteredSio[0].sioTypeGalery[i].id,
                    name: filteredSio[0].sioTypeGalery[i].name,
                    description: '',
                    notes: '',
                    photo: filteredSio[0].sioTypeGalery[i].photo
                })));
            }
        }
    }, [item.id]);
    const [isCollapsed, setIsCollapsed] = useState(false); // State to toggle collapse

    if (!Array.isArray(activitySio)) {
        console.warn('activitySio is not an array:', activitySio);
        return null; // or return a fallback UI
    }

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

    const goToBrand = () => {
        navigation.navigate('FormDetailBrand', {item});
        //
        // setIsFullActivity(true); // Set state to true when button is clicked
    };


    return (

        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Materi Branding SIO</Text>
            {activitySio?.map((sio, index) => (
                    <View style={styles.cardContainer} key={index}>
                        <View style={styles.card}>
                            {/* Toggle Button as Icon */}
                            <Text style={styles.toggleText}>
                                {sio.name}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setIsCollapsed(!isCollapsed)}
                                style={styles.iconButton}
                            >
                                <MaterialIcons
                                    name={isCollapsed ? 'keyboard-arrow-down' : 'keyboard-arrow-up'}
                                    size={24}
                                    color="#333"
                                />
                            </TouchableOpacity>
                            {!isCollapsed && (
                                <View style={styles.cardContent}>
                                    {sio.photo === '' ? (
                                        <TouchableOpacity style={styles.photoButton} onPress={() => handleTakePhoto(index)}>
                                            <MaterialIcons name="camera-alt" size={24} color="#fff"/>
                                            <Text style={[styles.label, {color: 'white'}]}>Take new photo</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        // Show Clear Photo button if a photo exists
                                        <View style={styles.imageContainer}>
                                            <Image
                                                source={{uri: sio.photo}}
                                                style={styles.imagePreview}
                                            />
                                            <TouchableOpacity style={styles.clearButton}
                                                              onPress={() => handleClearPhoto(index)}>
                                                <MaterialIcons name="delete" size={15} color="#fff"/>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                    {/* Text Fields */}
                                    <View style={styles.row}>
                                        <Text style={[styles.label, {alignItems: 'flex-end'}]}>Notes :</Text>
                                        <TextInput
                                            style={[styles.input, {flex: 1}]}
                                            placeholder="SIO Notes"
                                            value={sio.notes}
                                            onChangeText={(text) => {
                                                const newActivitySio = [...activitySio];
                                                newActivitySio[index].notes = text;
                                                setActivitySio(newActivitySio);
                                            }}
                                        />
                                    </View>
                                    <Text style={[styles.value, {fontSize: 10}]}>* Tolong isi catatan jika Komponen SIO
                                        Tidak
                                        Ada, Rusak atau Bermasalah</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )
            )}
            <TouchableOpacity style={styles.button} onPress={goToBrand}>
                <Text style={{color: Colors.buttonText, fontWeight: 'bold', fontSize: 20}}>NEXT</Text>
            </TouchableOpacity>
        </ScrollView>

    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#f5f5f5',
    },
    image: {
        width: Dimensions.get('window').width, // Full width of the screen
        height: 200, // Adjust height as needed
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    cardContainer: {
        marginHorizontal: 16,
        marginTop: 8,
    },
    toggleText: {
        fontSize: 14,
        color: '#333',
        marginRight: 4, // Space between text and icon
    },
    card: {
        width: width - 40,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        elevation: 4, // Shadow for Android
        shadowColor: '#000', // Shadow for iOS
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 4,
        position: 'relative', // Required for positioning the icon
    },
    iconButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 1,
    },
    cardContent: {
        marginTop: 8, // Space below the toggle button
    },
    row: {
        width: '100%',
        flexDirection: 'row',

        marginBottom: 12,
        justifyContent: "space-between"
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginRight: 8,
        textTransform: 'capitalize', // Capitalize keys like "name", "age"
    },
    value: {
        fontSize: 16,
        color: '#555',
    },
    input: {
        height: height * 0.05,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: width * 0.02,
        marginBottom: height * 0.015,
        backgroundColor: '#fff',
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
    imagePreview: {
        width: width * 0.25,
        height: width * 0.25,
        marginTop: height * 0.014,
        borderRadius: 5,
    },
    photoButton: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.secondaryColor,
        padding: 4,
        borderRadius: 5,
        margin: 4,
    },
    containerDropdown: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: 10,
        backgroundColor: '#f9f9f9',
    },
    // label: {
    //     fontSize: 16,
    //     marginBottom: 10,
    //     color: '#333',
    // },
    dropdownButton: {
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#fff',
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        color: '#555',
    },
    dropdown: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: '#fff',
        width: '100%',
    },
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    optionLabel: {
        marginLeft: 10,
        fontSize: 16,
        color: '#333',
    },
    customCheckbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#007bff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmark: {
        width: 10,
        height: 10,
        backgroundColor: '#fff',
        borderRadius: 2,
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.buttonBackground,
        borderRadius: 10,
        padding: 6,
        marginHorizontal: 15,
        marginVertical: 10
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
});