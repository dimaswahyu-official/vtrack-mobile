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
    const {item, photox} = route.params || {};
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
        newPhoto: string;
    }[]>([]);

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

    const {sio} = useConstantStore();
    useEffect(() => {
        if (sio.length > 0) {
            if (item.callPlanOutlet != null) {
                const filteredSio = sio.filter(s => s.name === (item.callPlanOutlet.sio_type));
                setSioType(filteredSio.length > 0 ? filteredSio[0] : {});
                if (filteredSio.length > 0) {
                    setActivitySio(Array.from({length: filteredSio[0].sioTypeGalery.length}, (_, i) => ({
                        activity_id: filteredSio[0].sioTypeGalery[i].id,
                        name: filteredSio[0].sioTypeGalery[i].name,
                        description: '',
                        notes: '',
                        photo: filteredSio[0].sioTypeGalery[i].photo,
                        newPhoto: ''
                    })));
                }
            } else {
                const filteredSio = sio.filter(s => s.name === (item.callPlanSurvey.sio_type));
                setSioType(filteredSio.length > 0 ? filteredSio[0] : {});
                if (filteredSio.length > 0) {
                    setActivitySio(Array.from({length: filteredSio[0].sioTypeGalery.length}, (_, i) => ({
                        activity_id: filteredSio[0].sioTypeGalery[i].id,
                        name: filteredSio[0].sioTypeGalery[i].name,
                        description: '',
                        notes: '',
                        photo: filteredSio[0].sioTypeGalery[i].photo,
                        newPhoto: ''
                    })));
                }
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
            allowsEditing: false,
            quality: 1,
        });

        if (!result.canceled) {
            const newActivitySio = [...activitySio];
            newActivitySio[index].newPhoto = result.assets[0].uri;
            setActivitySio(newActivitySio);
        }
    };

    const handleClearPhoto = (index: number) => {
        const newActivitySio = [...activitySio];
        newActivitySio[index].newPhoto = '';
        setActivitySio(newActivitySio);
    };

    const goToBrand = () => {
        navigation.navigate('FormDetailBrand', {item});
        // setIsFullActivity(true); // Set state to true when button is clicked
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
                    <View style={activityStyles.cardContainer} key={index}>
                        <View style={activityStyles.card}>
                            {/* Toggle Button as Icon */}
                            <Text style={activityStyles.toggleText}>
                                {sio.name ?? ''}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setIsCollapsed(!isCollapsed)}
                                style={activityStyles.iconButton}
                            >
                                <MaterialIcons
                                    name={isCollapsed ? 'keyboard-arrow-down' : 'keyboard-arrow-up'}
                                    size={24}
                                    color="#333"
                                />
                            </TouchableOpacity>
                            {!isCollapsed && (
                                <View style={activityStyles.cardContent}>
                                    <View style={styles.row}>
                                        {/* First Picture Section */}
                                        <View style={styles.column}>
                                            <Image
                                                source={{uri: sio.photo || defaultImage}}
                                                style={styles.image}
                                            />
                                            <Text style={styles.text}>Contoh</Text>
                                        </View>
                                        <View style={styles.divider}/>
                                        {/* Second Picture Section */}
                                        <View style={styles.column}>
                                            <Image
                                                source={{uri: sio.newPhoto || defaultImage}}
                                                style={styles.image}
                                            />
                                            {sio.newPhoto === '' ? (
                                                <TouchableOpacity style={[activityStyles.photoButton]}
                                                                  onPress={() => handleTakePhoto(index)}>
                                                    <MaterialIcons name="camera-alt" size={24} color="#fff"/>
                                                    <Text style={[activityStyles.label, {color: 'white'}]}>new
                                                        photo</Text>
                                                </TouchableOpacity>
                                            ) : (
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
                    </View>
                )
            )}
            <View style={{flexDirection: 'row', justifyContent: 'space-between', padding: 16,}}>
                <TouchableOpacity style={{flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 8, backgroundColor: Colors.secondaryColor}}
                                  onPress={() => navigation.goBack()}>
                    <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16,}}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 8, backgroundColor: Colors.buttonBackground}} onPress={goToBrand}>
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