import {Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import {RouteProp, useNavigation} from "@react-navigation/native";
import {ActivityStackParamList} from "../../navigation/ActivityNavigator";
import React, {useEffect, useState} from "react";
import useConstantStore from "../../store/useConstantStore";
import Colors from "../../utils/Colors";
import {MaterialIcons} from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {StackNavigationProp} from "@react-navigation/stack";
import ActivityStyles from "../../utils/ActivityStyles";
import {ActivitySioModel} from "../../model/activityModel";
import {createTableActivitySio, SioModel} from "../../model/ActivitySioRepository";
import {useSQLiteContext} from "expo-sqlite";
import {ActivityModel2, createTableActivity} from "../../model/activityModel2";

type NavigationProp = StackNavigationProp<ActivityStackParamList, 'FormDetailSio'>;
type FormActivityRouteProp = RouteProp<ActivityStackParamList, 'FormDetailSio'>;
const activityStyles = ActivityStyles();
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
    const {item, photox, idx} = route.params || {};
    const navigation = useNavigation<NavigationProp>();
    const activityStyles = ActivityStyles();
    const [sioType, setSioType] = useState<SioType | null>(null);
    const defaultImage = 'https://via.placeholder.com/100';

    const [activitySio, setActivitySio] = useState<{
        activity_id: number;
        name: string;
        description: string;
        notes: string;
        photo: string
        photo_before: string,
        photo_after: string,
    }[]>([]);

    const initializeActivitySio = (data: Partial<{
        activity_id: number;
        name: string;
        description: string;
        notes: string;
        photo: string;
        photo_before: string;
        photo_after: string;
    }>[]) => {
        const initializedData = data.map(item => ({
            activity_id: item.activity_id ?? 0, // Default to 0 if missing
            name: item.name ?? '', // Default to empty string
            description: item.description ?? '', // Default to empty string
            notes: item.notes ?? '', // Default to empty string
            photo: item.photo ?? '', // Default to empty string
            photo_before: item.photo_before ?? '', // Default to empty string
            photo_after: item.photo_after ?? '', // Default to empty string
        }));
        setActivitySio(initializedData);
    };


    const {sio} = useConstantStore();
    const [collapsedStates, setCollapsedStates] = useState<boolean[]>(
        Array(sio.length).fill(true) // Initialize all items as collapsed
    );
    useEffect(() => {
        createTableActivitySio(db).then(r => {})
        SioModel.getSioByScheduleId(db, idx)
            .then(response => {
                if (!response || response.length === 0) {
                    console.log("No data found for the given schedule ID.");
                    if (sio.length > 0) {
                        if (item.callPlanOutlet != null) {
                            const filteredSio = sio.filter(s => s.name === (item.callPlanOutlet.sio_type));
                            setSioType(filteredSio.length > 0 ? filteredSio[0] : {});
                            if (filteredSio.length > 0) {
                                setActivitySio(Array.from({length: filteredSio[0].sioTypeGalery.length}, (_, i) => ({
                                    activity_id: idx,
                                    name: filteredSio[0].sioTypeGalery[i].name,
                                    description: '',
                                    notes: '',
                                    photo: filteredSio[0].sioTypeGalery[i].photo,
                                    photo_before: '',
                                    photo_after: '',
                                })));
                            }
                        } else {
                            const filteredSio = sio.filter(s => s.name === (item.callPlanSurvey.sio_type));
                            setSioType(filteredSio.length > 0 ? filteredSio[0] : {});
                            if (filteredSio.length > 0) {
                                setActivitySio(Array.from({length: filteredSio[0].sioTypeGalery.length}, (_, i) => ({
                                    activity_id: idx,
                                    name: filteredSio[0].sioTypeGalery[i].name,
                                    description: '',
                                    notes: '',
                                    photo: filteredSio[0].sioTypeGalery[i].photo,
                                    photo_before: '',
                                    photo_after: '',
                                })));
                            }
                        }
                    }
                } else {
                    initializeActivitySio(response)
                }
            })
            .catch(error => {
                console.error("Error fetching data:", error.message);
            });


    }, [item.id]);


    if (!Array.isArray(activitySio)) {
        console.warn('activitySio is not an array:', activitySio);
        return null; // or return a fallback UI
    }

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
                <View style={{width: 50, height: 2, backgroundColor: 'grey', marginHorizontal: 8,}}/>
                <View style={{width: 10, height: 10, borderWidth: 0.5, borderRadius: 5, backgroundColor: 'white',}}/>
                <View style={{width: 50, height: 2, backgroundColor: 'grey', marginHorizontal: 8,}}/>
                <View style={{width: 10, height: 10, borderWidth: 0.5, borderRadius: 5, backgroundColor: 'white',}}/>
                <View style={{width: 50, height: 2, backgroundColor: 'grey', marginHorizontal: 8,}}/>
                <View style={{width: 10, height: 10, borderWidth: 0.5, borderRadius: 5, backgroundColor: 'white',}}/>
            </View>
        )
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
            allowsEditing: false,
            quality: 1,
        });

        if (!result.canceled) {
            const newActivitySio = [...activitySio];
            newActivitySio[index].photo_after = result.assets[0].uri;
            setActivitySio(newActivitySio);
        }
    };

    const handleClearPhoto = (index: number) => {
        const newActivitySio = [...activitySio];
        newActivitySio[index].photo_after = '';
        setActivitySio(newActivitySio);
    };

    const handleTakePhotoBefore = async (index: number) => {
        // Request camera permissions
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('Permission required', 'Please grant permission to access the camera.');
            return;
        }

        // Launch the camera
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: false,
            quality: 1,
        });

        if (!result.canceled) {
            const newActivitySio = [...activitySio];
            newActivitySio[index].photo_before = result.assets[0].uri;
            setActivitySio(newActivitySio);
        }
    };

    const handleClearPhotoBefore = (index: number) => {
        const newActivitySio = [...activitySio];
        newActivitySio[index].photo_before = '';
        setActivitySio(newActivitySio);
    };


    const insertSioToSqlite = async (data: any) => {
        // If the input is an array, loop through and process each item
        if (Array.isArray(data)) {
            data.forEach((activity: any) => {
                insertSioToSqlite(activity); // Call the function for each individual item
            });
            console.log('You have total Data to Insert Sio = ' + data.length);
            return; // Exit after processing the array
        }
        // If the input is a single object, process it
        const sioData = {
            activity_id: idx,
            name: data.name,
            description: data.description ?? '',
            notes: data.notes ?? '',
            photo:data.photo ?? '',
            photo_before: data.photoBefore ?? '',
            photo_after: data.photoAfter ?? '',
        }
        try {
            const response = await SioModel.getSioByScheduleId(db, idx);
            if (!response || (await response).length === 0) {
                try {
                    // Insert data and retrieve the newly inserted activity
                    await SioModel.create(db, sioData);
                } catch (error) {
                    console.error("Error handling activity:", error);
                }
            } else {
                // await ActivityModel2.updateStatusActivity(db, status,photosx,callPlanScheduleId)
                console.log("Sio already exists for the call plan schedule ID:", idx);
            }

            // console.log(JSON.stringify(sioData) + "Data Sio")
            navigation.navigate('FormDetailProgram', {item, idx});
        } catch (error) {
            console.error('Error inserting sio:', error);
            Alert.alert('Error', 'Failed to save sio. Please try again.');
        }
    }

    const goToBrand = async () => {
        await insertSioToSqlite(activitySio)
        // navigation.navigate('FormDetailBrand', {item});
        // setIsFullActivity(true); // Set state to true when button is clicked
    };

    const toggleCollapse = (index: number) => {
        setCollapsedStates((prevStates) => {
            const newStates = [...prevStates];
            newStates[index] = !newStates[index]; // Toggle the specific index
            return newStates;
        });
    };

    const areAllPhotosTaken = (activitySio: any) => {
        return activitySio.every((sio: any) => sio.photo_before && sio.photo_after);
    };

    return (
        <ScrollView contentContainerStyle={activityStyles.container}>
            <Text style={activityStyles.title}>Foto Outlet Baru</Text>
            {photox && <Image
                source={{uri: photox}} // Replace with your image URL
                style={activityStyles.image}
                resizeMode="cover"
            />}

            <Text style={activityStyles.title}>Materi Branding SIO</Text>
            {activitySio?.map((sio, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => toggleCollapse(index)} // Toggle collapse when the card is pressed
                        activeOpacity={0.8} // Add a slight opacity effect when pressed
                        style={activityStyles.cardContainer}
                    >
                        <View style={activityStyles.card}>
                            {/* Toggle Button as Icon */}
                            <Text style={activityStyles.toggleText}>
                                {sio.name ?? ''}
                            </Text>
                            <TouchableOpacity
                                onPress={() => toggleCollapse(index)}
                                style={activityStyles.iconButton}
                            >
                                <MaterialIcons
                                    name={collapsedStates[index] ? 'keyboard-arrow-down' : 'keyboard-arrow-up'}
                                    size={24}
                                    color="#333"
                                />
                            </TouchableOpacity>
                            {!collapsedStates[index] && (
                                <View style={activityStyles.cardContent}>
                                    <View style={styles.column}>
                                        <Image
                                            source={{uri: sio.photo || defaultImage}}
                                            style={styles.image}
                                        />
                                        <Text style={styles.text}>Contoh</Text>
                                    </View>
                                    <View style={styles.row}>
                                        {/* First Picture Section */}
                                        <View style={styles.column}>
                                            <Image
                                                source={{uri: sio.photo_before || defaultImage}}
                                                style={styles.image}
                                            />{sio.photo_before === '' ? (<>
                                                    <Text style={styles.text}>Foto Sebelum</Text>
                                                    <TouchableOpacity style={[activityStyles.photoButton]}
                                                                      onPress={() => handleTakePhotoBefore(index)}>
                                                        <MaterialIcons name="camera-alt" size={24} color="#fff"/>
                                                        <Text style={[activityStyles.label, {color: 'white'}]}>new
                                                            photo</Text>
                                                    </TouchableOpacity>

                                                </>
                                            )
                                            : (
                                                <TouchableOpacity style={activityStyles.clearButton}
                                                                  onPress={() => handleClearPhotoBefore(index)}>
                                                    <MaterialIcons name="delete" size={15} color="#fff"/>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                        <View style={styles.divider}/>
                                        {/* Second Picture Section */}
                                        <View style={styles.column}>
                                            <Image
                                                source={{uri: sio.photo_after || defaultImage}}
                                                style={styles.image}
                                            />
                                            {sio.photo_after === '' ? (<>
                                                        <Text style={styles.text}>Foto Sesudah</Text>
                                                        <TouchableOpacity style={[activityStyles.photoButton]}
                                                                          onPress={() => handleTakePhoto(index)}>
                                                            <MaterialIcons name="camera-alt" size={24} color="#fff"/>
                                                            <Text style={[activityStyles.label, {color: 'white'}]}>new
                                                                photo</Text>
                                                        </TouchableOpacity>

                                                    </>
                                                )
                                                : (
                                                    <TouchableOpacity style={activityStyles.clearButton}
                                                                      onPress={() => handleClearPhoto(index)}>
                                                        <MaterialIcons name="delete" size={15} color="#fff"/>
                                                    </TouchableOpacity>
                                                )}

                                        </View>
                                    </View>

                                    {/* Text Fields */}
                                    <View style={[activityStyles.row, {marginTop: 12}]}>
                                        <Text style={[activityStyles.label, {alignItems: 'flex-end'}]}>Notes :</Text>
                                        <TextInput
                                            style={[activityStyles.input, {flex: 1}]}
                                            placeholder="SIO Notes"
                                            value={sio.notes}
                                            onChangeText={(text) => {
                                                const newActivitySio = [...activitySio];
                                                newActivitySio[index].notes = text;
                                                setActivitySio(newActivitySio);
                                            }}
                                        />
                                    </View>
                                    <Text style={[activityStyles.value, {fontSize: 10}]}>* Tolong isi catatan jika Komponen
                                        SIO Tidak Ada, Rusak atau Bermasalah</Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                )
            )}
            <View style={{flexDirection: 'row', justifyContent: 'space-between', padding: 16,}}>
                <TouchableOpacity style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 8,
                    alignItems: 'center',
                    marginHorizontal: 8,
                    backgroundColor: Colors.secondaryColor
                }}
                                  onPress={() => navigation.goBack()}>
                    <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16,}}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 8,
                    alignItems: 'center',
                    marginHorizontal: 8,
                    backgroundColor: Colors.buttonBackground
                }} onPress={() => {
                    console.log('cucucuit'+areAllPhotosTaken(activitySio))
                    if (areAllPhotosTaken(activitySio)) {
                        goToBrand();
                    } else {
                        alert("Tolong Lengkapi Seluruh data photo");
                    }
                }}
                >
                    <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16,}}>Next</Text>
                </TouchableOpacity>
            </View>
            {footer()}
        </ScrollView>

    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        margin: 10,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    column: {
        flex: 1,
        alignItems: 'center',
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginBottom: 5,
    },
    text: {
        fontSize: 14,
        color: '#333',
    },
    divider: {
        width: 1,
        backgroundColor: '#ccc',
        height: '100%',
        marginHorizontal: 10,
    },

});