import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Colors from "../../utils/Colors";
import React, {useEffect, useState} from "react";
import * as ImagePicker from "expo-image-picker";
import {useAuthStore} from "../../store/useAuthStore";
import ReimburseService from "../../services/reimburseService";
import Toast from "react-native-toast-message";
import {MaterialIcons} from "@expo/vector-icons";
import activityStyles from "../../utils/ActivityStyles";
import ActivityStyles from "../../utils/ActivityStyles";
import {useLoadingStore} from "../../store/useLoadingStore";

const {width, height} = Dimensions.get("window");


type RootStackParamList = {
    Profile: undefined;
    Reimburse: undefined;
    ReimburseDetails: { bbmItem: any; };
};

type ReimburseDetailsScreenProps = NativeStackScreenProps<
    RootStackParamList,
    "ReimburseDetails"
>;

export default function ReimburseDetailsScreen({route, navigation}: ReimburseDetailsScreenProps) {
    const {user} = useAuthStore();
    const userId = user?.id || '';
    const {bbmItem} = route.params || {};
    const { setLoading } = useLoadingStore();
    const activityStyles = ActivityStyles();
    const [result, setResult] = useState(0);
    const [input1, setInput1] = useState(0);
    const [input2, setInput2] = useState(0);
    const [photoIn, setPhotoIn] = useState<any | null>(null);
    const [photoOut, setPhotoOut] = useState<any | null>(null);

    const handleTextChange = (text: string, setInput: Function) => {
        const numericValue = text.replace(/\D/g, ''); // Remove non-numeric characters
        const formatted = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Add thousands separator
        setInput({
            raw: numericValue ? parseInt(numericValue, 10) : null, // Store raw numeric value
            formatted, // Store formatted string
        });
    };
    console.log(bbmItem)

    useEffect(() => {
        setInput1(bbmItem.kilometer_in ?? 0)
        setInput2(bbmItem.kilometer_out ?? 0)
        setPhotoOut(bbmItem.photo_out ?? '')
        setPhotoIn(bbmItem.photo_in ?? '')
    }, [bbmItem]);

    useEffect(() => {
        setResult(input2-input1)
    }, [input2]);



    const handleSave = async () => {
        setLoading(true)
        try {
            //handle if BBM Reimburse first time
            if (Object.keys(bbmItem).length === 0) {
                const dateNow = new Date();
                const formData = new FormData();
                formData.append('user_id', userId);
                formData.append('date_in', dateNow.toISOString() ?? '');
                formData.append('kilometer_in', String(input1) );
                formData.append('description', '');
                // If there is a photo, handle the file
                if (photoIn) {
                    // @ts-ignore
                    formData.append('photo_in', {
                        uri: photoIn,
                        type: 'image/jpeg',
                        name: photoIn.fileName || 'image.jpg',
                    });
                }
                const response = await ReimburseService.initialReimburse(formData);
                // Handle the response
                if (response.statusCode === 200) {
                    Toast.show({
                        type: 'success',
                        text1: 'Success',
                        text2: `Update Successful`,
                    });
                    navigation.replace('Reimburse');
                } else {
                    Alert.alert('Error', response.message || 'Failed to Reimburse');
                    console.error('Update Error:', response);
                }
            } else {
                const dateNow = new Date();
                const formData = new FormData();
                formData.append('id', bbmItem.id ?? 0);
                formData.append('date_out', dateNow.toISOString() ?? '');
                formData.append('kilometer_out', String(input2) );
                formData.append('description', '');
                // If there is a photo, handle the file
                if (photoOut) {
                    // @ts-ignore
                    formData.append('photo_out', {
                        uri: photoOut,
                        type: 'image/jpeg',
                        name: photoOut.fileName || 'image.jpg',
                    });

                }
                const response = await ReimburseService.finalReimburse(formData);
                // Handle the response
                if (response.statusCode === 200) {
                    Toast.show({
                        type: 'success',
                        text1: 'Success',
                        text2: `Update Successful`,
                    });
                    // Optionally navigate back or refresh the profile
                    navigation.replace("Reimburse");
                } else {
                    Alert.alert('Error', response.message || 'Failed to Reimburse');
                    console.error('Update Error:', response);
                }

            }
        } catch (error : any) {
            // Handle errors
            const { data } = error.response || {};
            if (data?.statusCode === 404) {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: `${data.message}`,
                });
            } else {
                Alert.alert('Error', 'An unexpected error occurred while submit Reimburse');
                console.error(error.response);
            }
        } finally {
            setLoading(false)
        }
    }

    const PhotoKilometerIn = async () => {
        // Request camera permissions
        const permissionResult =
            await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert(
                'Permission required',
                'Please grant permission to access the camera.'
            );
            return;
        }
        // Launch the camera
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: false,
            quality: 1,
        });
        if (!result.canceled) {
            setPhotoIn(result.assets[0].uri);
        }
    };

    const PhotoKilometerOut = async () => {
        // Request camera permissions
        const permissionResult =
            await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert(
                'Permission required',
                'Please grant permission to access the camera.'
            );
            return;
        }
        // Launch the camera
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: false,
            quality: 1,
        });
        if (!result.canceled) {
            setPhotoOut(result.assets[0].uri);
        }
    };

    return (
        <ScrollView>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.greeting}>
                        Reimburse
                    </Text>
                </View>
                {/*KM AWAL*/}
                <View style={styles.card}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Kilometer Awal:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Masukan Kilometer Awal"
                            value={input1.toString() ?? ''}
                            editable={!bbmItem.kilometer_in}
                            keyboardType={'numeric'}
                            onChangeText={(text) => setInput1(Number(text))}
                        />
                    </View>
                    <View style={{flex: 1, alignItems: 'center',}}>
                        <Image
                            source={{
                                uri: photoIn || 'https://via.placeholder.com/200',
                            }}
                            style={styles.image}
                        />
                        { Object.keys(bbmItem).length === 0  ? <TouchableOpacity
                            style={activityStyles.photoButton}
                            onPress={() =>
                                PhotoKilometerIn()
                            }>
                            <MaterialIcons
                                name="camera-alt"
                                size={24}
                                color="#fff"
                            />
                            <Text
                                style={[
                                    activityStyles.label,
                                    {color: 'white'},
                                ]}>
                                take a new photo
                            </Text>
                        </TouchableOpacity>
                        : null
                        }


                    </View>
                </View>
                { Object.keys(bbmItem).length === 0 ? null : (<>
                        {/*KM AKHIR*/}
                        <View style={styles.card}>
                            <View style={styles.row}>
                                <Text style={styles.label}>Kilometer Akhir:</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Masukan Kilometer Akhir"
                                    value={input2.toString() ?? ''}
                                    editable={!bbmItem.kilometer_out}
                                    keyboardType={'numeric'}
                                    onChangeText={(text) => setInput2(Number(text))}
                                />
                            </View>
                            <View style={{flex: 1, alignItems: 'center',}}>
                                <Image
                                    source={{
                                        uri: photoOut || 'https://via.placeholder.com/200',
                                    }}
                                    style={styles.image}
                                />
                                { bbmItem.photo_out === '' ? (
                                    <>
                                        <TouchableOpacity
                                            style={activityStyles.photoButton}
                                            onPress={() =>
                                                PhotoKilometerOut()
                                            }>
                                            <MaterialIcons
                                                name="camera-alt"
                                                size={24}
                                                color="#fff"
                                            />
                                            <Text
                                                style={[
                                                    activityStyles.label,
                                                    {color: 'white'},
                                                ]}>
                                                take a new photo
                                            </Text>
                                        </TouchableOpacity>
                                    </>
                                ) : null}

                            </View>
                        </View>
                            <View style={styles.card}>
                                <Text style={styles.label}>Jumlah Kilometer Yang Ditempuh</Text>
                                <TextInput
                                    style={styles.input}
                                    value={photoOut ==='' ? '' :  result.toString()}
                                    editable={false}
                                    keyboardType="numeric"
                                />
                            </View>
                    </>
                )}

                {bbmItem.kilometer_out && bbmItem.kilometer_in !== 0 ? <View>
                    <TouchableOpacity style={styles.button} onPress={() => {
                        navigation.goBack()
                    }}>
                        <Text style={styles.buttonText}>Back</Text>
                    </TouchableOpacity>
                </View> :  <View>
                    <TouchableOpacity style={styles.button} onPress={() => {
                        handleSave()
                    }}>
                        <Text style={styles.buttonText}>SUBMIT</Text>
                    </TouchableOpacity>
                </View>}



            </View>
        </ScrollView>

    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: height * 0.02,
        width: "100%",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: width * 0.05,
        marginBottom: height * 0.02,
    },
    listContainer: {
        paddingHorizontal: width * 0.05,
        paddingVertical: height * 0.02,
    },
    greeting: {
        fontSize: 30,
        fontWeight: "bold",
    },
    card: {
        borderWidth: 0.5,
        borderColor: 'gray',
        borderRadius: 10,
        padding: 15,
        margin: 10,
        backgroundColor: '#fff',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        paddingHorizontal: 10,
        backgroundColor: '#f9f9f9',
    },
    imageContainer: {
        alignItems: 'center',
        marginTop: 10,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    button: {
        margin: 10,
        height: 50,
        backgroundColor: Colors.buttonBackground,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
})