import {StackNavigationProp} from "@react-navigation/stack";
import {ActivityStackParamList} from "../../navigation/ActivityNavigator";
import {RouteProp, useNavigation} from "@react-navigation/native";
import ActivityStyles from "../../utils/ActivityStyles";
import {useSQLiteContext} from "expo-sqlite";
import React, {useEffect, useState} from "react";
import {Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import Colors from "../../utils/Colors";
import useConstantStore from "../../store/useConstantStore";
import * as ImagePicker from "expo-image-picker";
import {MaterialIcons} from "@expo/vector-icons";

type NavigationProp = StackNavigationProp<ActivityStackParamList, 'FormDetailProgram'>;
type FormActivityRouteProp = RouteProp<ActivityStackParamList, 'FormDetailProgram'>;
type FormActivityProps = {
    route: FormActivityRouteProp;
};

// Define the SioType type

export default function FormDetailProgram({route}: FormActivityProps) {
    const db = useSQLiteContext();
    const {item, idx} = route.params || {};
    const navigation = useNavigation<NavigationProp>();
    const activityStyles = ActivityStyles();
    const defaultImage = 'https://via.placeholder.com/100';
    const [activityProgram, setActivityProgram] = useState<{
        activity_id: number;
        nameProgram: string;
        description: string;
        photo: string
    }[]>([]);

    const [activityProgramCompetitor, setActivityProgramCompetitor] = useState<{
        nameProgramCompetitor: string[];
        photoCompetitor: string[];
        descriptionCompetitor: string[];
    }>({
        nameProgramCompetitor: [''],
        photoCompetitor: [''],
        descriptionCompetitor: [''],
    });

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

    const handleAddProgramCompetitor = () => {
        setActivityProgramCompetitor({
            nameProgramCompetitor: [...activityProgramCompetitor.nameProgramCompetitor, ''],
            photoCompetitor: [...activityProgramCompetitor.photoCompetitor, ''],
            descriptionCompetitor: [...activityProgramCompetitor.descriptionCompetitor, ''],
        });
    };

    const handleDeleteProgramCompetitor = (index: number) => {
        const newActivityProgram = {
            nameProgramCompetitor: activityProgramCompetitor.nameProgramCompetitor.filter((_, i) => i !== index),
            photoCompetitor: activityProgramCompetitor.photoCompetitor.filter((_, i) => i !== index),
            descriptionCompetitor: activityProgramCompetitor.descriptionCompetitor.filter((_, i) => i !== index),
        };
        setActivityProgramCompetitor(newActivityProgram);
    };

    const [isCollapsed, setIsCollapsed] = useState(false); // State to toggle collapse


    const handleTakePhoto = async () => {
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
            const newActivityProgram = [...activityProgram];
            newActivityProgram[0].photo = result.assets[0].uri;
            setActivityProgram(newActivityProgram);
        }
    };

    const handleTakePhotoCompetitor = async (index:number) => {
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
            const newActivityProgram = {...activityProgramCompetitor};
            newActivityProgram.photoCompetitor[index] = result.assets[0].uri;
            setActivityProgramCompetitor(newActivityProgram);
        }
    };

    const handleClearPhoto = () => {
        const newActivityProgram = [...activityProgram];
        newActivityProgram[0].photo = '';
        setActivityProgram(newActivityProgram);
    };

    const handleClearPhotoCompetitor = (index:number) => {
        const newActivityProgram = {...activityProgramCompetitor};
        newActivityProgram.photoCompetitor[index] = '';
        setActivityProgramCompetitor(newActivityProgram);
    };

    const handleUpdateProgram = (
        index: number,
        field: keyof typeof activityProgramCompetitor,
        value: string
    ) => {
        const newActivityProgram = { ...activityProgramCompetitor };
        newActivityProgram[field][index] = value;
        setActivityProgramCompetitor(newActivityProgram);
    };


    // const insertSioToSqlite = async (data: any) => {
    //     // If the input is an array, loop through and process each item
    //     if (Array.isArray(data)) {
    //         data.forEach((activity: any) => {
    //             insertSioToSqlite(activity); // Call the function for each individual item
    //         });
    //         console.log('You have total Data to Insert Sio = ' + data.length);
    //         return; // Exit after processing the array
    //     }
    //     // If the input is a single object, process it
    //     const sioData = {
    //         activity_id: idx,
    //         name: data.name,
    //         description: data.description ?? '',
    //         notes: data.notes ?? '',
    //         photo: data.newPhoto,
    //     }
    //     try {
    //         console.log(JSON.stringify(sioData) + "Data Sio")
    //         navigation.navigate('FormDetailBrand', {item, idx});
    //         // Uncomment this line to insert data into SQLite
    //         // await SioModel.create(db, sioData);
    //     } catch (error) {
    //         console.error('Error inserting sio:', error);
    //         Alert.alert('Error', 'Failed to save sio. Please try again.');
    //     }
    // }

    const goToBrand = async () => {
        // await insertSioToSqlite(activitySio)
        navigation.navigate('FormDetailBrand', {item, idx});
        // setIsFullActivity(true); // Set state to true when button is clicked
    };

    useEffect(() => {
        setActivityProgram([
            {
                activity_id: 1,
                nameProgram: '',
                description: '',
                photo: '',
            },
        ]);
    }, []);

    return (
        <ScrollView contentContainerStyle={activityStyles.container}>
            {/* Program Section */}
            <Text style={activityStyles.title}>Program</Text>
            <View style={activityStyles.cardContainer}>
                <View style={activityStyles.card}>
                    <View style={activityStyles.cardContent}>
                        {/* Program Details */}
                        <Text style={[activityStyles.label, { alignItems: 'flex-end' }]}>Judul Program</Text>
                        <Text style={[activityStyles.buttonText, { alignItems: 'flex-end' }]}>
                            Deskripsi Program, Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
                            been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type
                            and scrambled it to make a type specimen book.
                        </Text>
                        <Text style={[activityStyles.label, { alignItems: 'flex-end' }]}>Foto Bukti Menjalankan Program</Text>
                        {/* Image Section */}
                        <View style={activityStyles.imageContainer}>
                            <Image
                                source={{ uri: activityProgram[0]?.photo || defaultImage }}
                                style={styles.image}
                            />
                            {activityProgram[0]?.photo === '' ? (
                                <TouchableOpacity
                                    style={activityStyles.photoButton}
                                    onPress={handleTakePhoto}
                                >
                                    <MaterialIcons name="camera-alt" size={24} color="#fff" />
                                    <Text style={[activityStyles.label, { color: 'white' }]}>New Photo</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={activityStyles.clearButton}
                                    onPress={handleClearPhoto}
                                >
                                    <MaterialIcons name="delete" size={15} color="#fff" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </View>

            {/* Competitor Program Section */}
            <Text style={activityStyles.title}>Program Competitor</Text>
            {activityProgramCompetitor.nameProgramCompetitor.map((_, index) => (
            <View style={activityStyles.cardContainer} key={index}>
                <View style={activityStyles.card}>
                    <TouchableOpacity
                        style={activityStyles.deleteButton}
                        onPress={() => handleDeleteProgramCompetitor(index)}
                    >
                        <MaterialIcons name="delete" size={24} color="red" />
                    </TouchableOpacity>
                    <View style={activityStyles.cardContent}>
                        {/* Competitor Details */}
                        <Text style={[activityStyles.label, { alignItems: 'flex-end' }]}>Nama Program:</Text>
                        <TextInput
                            style={[activityStyles.input, { flex: 1 }]}
                            placeholder="Nama Program"
                            value={activityProgramCompetitor.nameProgramCompetitor[index]}
                            onChangeText={(text) => {handleUpdateProgram(index, 'nameProgramCompetitor', text)
                            }}
                        />
                        <Text style={[activityStyles.label, { alignItems: 'flex-end' }]}>Deskripsi Program:</Text>
                        <TextInput
                            style={[activityStyles.input, { flex: 1 }]}
                            placeholder="Deskripsi Program"
                            value={activityProgramCompetitor.descriptionCompetitor[index]}
                            onChangeText={(text) => {
                                handleUpdateProgram(index, 'descriptionCompetitor', text)
                            }}
                        />
                        <Text style={[activityStyles.label, { alignItems: 'flex-end' }]}>
                            Foto Program Kompetitor (Jika Ada):
                        </Text>
                        {/* Image Section */}
                        <View style={activityStyles.imageContainer}>
                            <Image
                                source={{ uri: activityProgramCompetitor.photoCompetitor[index] || defaultImage }}
                                style={styles.image}
                            />
                            {activityProgramCompetitor.photoCompetitor[index] === '' ? (
                                <TouchableOpacity
                                    style={activityStyles.photoButton}
                                    onPress={()=>handleTakePhotoCompetitor(index)}
                                >
                                    <MaterialIcons name="camera-alt" size={24} color="#fff" />
                                    <Text style={[activityStyles.label, { color: 'white' }]}>New Photo</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={activityStyles.clearButton}
                                    onPress={()=>handleClearPhotoCompetitor(index)}
                                >
                                    <MaterialIcons name="delete" size={15} color="#fff" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </View>
            ))}
            {/*//add new card*/}
            <TouchableOpacity
                style={[activityStyles.button, { marginTop: 16 }]}
                onPress={handleAddProgramCompetitor}
            >
                <MaterialIcons name="add" size={24} color="#fff" />
                <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8 }}>Add New Program Competitor</Text>
            </TouchableOpacity>

            {/* Navigation Buttons */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 16 }}>
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
                >
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{
                        flex: 1,
                        padding: 12,
                        borderRadius: 8,
                        alignItems: 'center',
                        marginHorizontal: 8,
                        backgroundColor: Colors.buttonBackground,
                    }}
                    onPress={goToBrand}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Next</Text>
                </TouchableOpacity>
            </View>

            {/* Footer */}
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
        marginVertical: 10,
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