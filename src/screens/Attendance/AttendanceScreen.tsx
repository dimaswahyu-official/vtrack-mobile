import React, {useState, useEffect} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    Alert, ScrollView,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import {Ionicons} from '@expo/vector-icons';
import {useThemeStore} from "../../store/useThemeStore";
import GlobalStyles from "../../utils/GlobalStyles";
import Colors from "../../utils/Colors";
import UserProfileService from "../../services/userProfileService";
import {useAuthStore} from "../../store/useAuthStore";
import {useLoadingStore} from "../../store/useLoadingStore";
import Toast from "react-native-toast-message";
import {useOffline} from "../../context/OfflineProvider";
import useConstantStore from "../../store/useConstantStore";
import moment from "moment";
import * as Location from 'expo-location'

type RootStackParamList = {
    Profile: undefined;
    Attendance: { profile: { name: string; email: string; photo: string } };
};

type AttendanceScreenProps = NativeStackScreenProps<
    RootStackParamList,
    'Attendance'
>;

export default function AttendanceScreen({route, navigation}: AttendanceScreenProps) {
    const {theme} = useThemeStore();
    const {clearAuth, user} = useAuthStore();
    const {clearConstants} = useConstantStore();
    const {isOnline, isWifi} = useOffline();
    const {setLoading} = useLoadingStore();
    const {profile} = route.params;
    const [name, setName] = useState(profile.name);
    const [email, setEmail] = useState(profile.email);
    const [photo, setPhoto] = useState<any | null>(null);
    const [photoExist, setPhotoExist] = useState(profile.photo);
    const [isDisabled, setIsDisabled] = useState(true);
    const date = moment().format('l');
    const time = moment().format('LT');
    const [displayCurrentAddress, setDisplayCurrentAddress] = useState('Location Loading.....');
    const [displayLongLat, setDisplayLongLat] = useState('Detail Location is Fetching.....');
    const [locationServicesEnabled, setLocationServicesEnabled] = useState(false)

    useEffect(() => {
        if (!user) {
            setLoading(true);
        } else {
            setLoading(false);
        }
    }, [user, setLoading]);
    // Check for changes whenever input values change
    useEffect(() => {
        const hasChanges =
            name !== profile.name || email !== profile.email || photoExist !== profile.photo;
        setIsDisabled(!hasChanges); // Disable button if no changes
    }, [name, email, photoExist, profile]);

    const handleAttendance = async () => {
        setLoading(true);
        try {
            const id = user?.id || '';
            const roles = user?.roles || '';
            const username = user?.username || '';
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);

            // If there is a photo, handle the file
            if (photo) {
                const fetchImage = await fetch(photo.uri);
                const blob = await fetchImage.blob();

                // @ts-ignore
                formData.append('file', {
                    uri: photo.uri,
                    type: blob.type || 'image/jpeg',
                    name: photo.fileName || 'image.jpg',
                });
            }

            // Call the updateProfile method and send the FormData
            const response = await UserProfileService.updateProfile(id, formData);

            // Handle the response
            if (response.statusCode === 200) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: `Update Successful`,
                });
                useAuthStore.getState().setUser({
                    id,
                    fullName: response.data.fullname,
                    email: response.data.email,
                    photo: response.data.photo,
                    roles,
                    username
                });
                // Optionally navigate back or refresh the profile
                // navigation.goBack();
            } else {
                Alert.alert('Error', response.message || 'Failed to update profile');
                console.error('Update Error:', response);
            }
        } catch (error: any) {
            // Handle errors
            const {data} = error.response || {};
            if (data?.statusCode === 404) {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: `${data.message}`,
                });
            } else {
                Alert.alert('Error', 'An unexpected error occurred while updating the profile');
                console.error(error.response);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        setLoading(true);
        Toast.show({
            type: 'success',
            text1: 'Success',
            text2: `Logout Successful`,
        });

        // Clear auth and show success toast
        clearAuth();
        clearConstants();

        // Set a timeout to stop the loading after 2 seconds (2000ms)
        setTimeout(() => {
            setLoading(false);
        }, 2000);
    };

    const handleTakePhoto = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert(
                'Permission required',
                'Please grant permission to access the camera.'
            );
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setPhoto(result.assets[0]);
            setPhotoExist(result.assets[0].uri);
        }
    };

    useEffect(() => {
        checkIfLocationEnabled();
        getCurrentLocation();
    }, [])
    //check if location is enable or not
    const checkIfLocationEnabled = async () => {
        let enabled = await Location.hasServicesEnabledAsync();       //returns true or false
        if (!enabled) {                     //if not enable
            Alert.alert('Location not enabled', 'Please enable your Location', [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                {text: 'OK', onPress: () => console.log('OK Pressed')},
            ]);
        } else {
            setLocationServicesEnabled(enabled)         //store true into state
        }
    }
    //get current location
    const getCurrentLocation = async () => {
        let {status} = await Location.requestForegroundPermissionsAsync();  //used for the pop up box where we give permission to use location
        console.log(status);
        if (status !== 'granted') {
            Alert.alert('Permission denied', 'Allow the app to use the location services', [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                {text: 'OK', onPress: () => console.log('OK Pressed')},
            ]);
        }

        //get current position lat and long
        const {coords} = await Location.getCurrentPositionAsync();
        console.log(coords)

        if (coords) {
            const {latitude, longitude} = coords;
            console.log(latitude, longitude);
            setDisplayLongLat(`${latitude},${longitude}`);

            //provide lat and long to get the the actual address
            let response = await Location.reverseGeocodeAsync({
                latitude,
                longitude
            });
            console.log(response);
            //loop on the responce to get the actual result
            for (let item of response) {
                let address = `${item.city} ${item.postalCode}`
                setDisplayCurrentAddress(address)
            }
        }
    }
    return (
        <ScrollView>
            <View style={{justifyContent: 'center', width: '100%'}}>
                {/* Logout Button */}
                <View style={styles.row}>
                    <Text style={styles.name}>
                        Hi {profile.name}&ensp;
                        <Ionicons name={"rocket"} size={22} color={Colors.secondaryColor}/>
                    </Text>

                    <TouchableOpacity style={styles.button} onPress={handleLogout}>
                        <Text style={styles.buttonText}>Logout</Text>
                    </TouchableOpacity>
                </View>

                <View style={{alignItems: 'center'}}>
                    <View style={styles.containerCard}>
                        <Image source={{uri: photoExist}} style={styles.coverPhoto} />
                        <Text>
                            {date} at {time}
                        </Text>
                        <View style={{width: '100%', alignItems: 'center', justifyContent: 'center', margin: 10}}>
                            <Text>{displayCurrentAddress}</Text>
                        </View>
                        <Text>{displayLongLat}</Text>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={handleTakePhoto} style={styles.iconButton}>
                                <Text style={styles.iconButtonText}>Ambil absen sekarang</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View style={{alignItems:'center'}}>
                    <View style={styles.row}>
                        <Text style={styles.email}>Email </Text>
                        <Text style={styles.name}>{profile.email}</Text>
                    </View>
                </View>

                {/*<TextInput*/}
                {/*    style={globalStyles.input}*/}
                {/*    value={email}*/}
                {/*    onChangeText={setEmail}*/}
                {/*    placeholder="Email"*/}
                {/*    keyboardType="email-address"*/}
                {/*/>*/}
                {/*<TouchableOpacity*/}
                {/*    onPress={handleSave}*/}
                {/*    style={[*/}
                {/*        globalStyles.button,*/}
                {/*        isDisabled && styles.saveButtonDisabled,*/}
                {/*    ]}*/}
                {/*    disabled={isDisabled}*/}
                {/*>*/}
                {/*    <Text style={styles.saveButtonText}>*/}
                {/*        {isDisabled ? 'No Changes' : 'Save'}*/}
                {/*    </Text>*/}
                {/*</TouchableOpacity>*/}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 20,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    photo: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 20,
        backgroundColor: '#f0f0f0',
    },
    buttonContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        marginTop: 20
    },
    coverPhoto: {
        width: 150,
        height: 150,
        resizeMode: 'cover',
        borderRadius:50,
        marginBottom:20
    },
    email: {
        marginTop: 15,
        fontSize: 20,
        color: 'gray',
    },
    iconButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.buttonBackground,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    iconButtonText: {
        color: Colors.buttonText,
        fontSize: 16,
        marginLeft: 8,
    },
    saveButton: {
        width: '100%',
        paddingVertical: 15,
        backgroundColor: Colors.buttonBackground,
        borderRadius: 5,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        backgroundColor: '#ccc',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginVertical: 8,
    },
    button: {
        backgroundColor: Colors.buttonBackground,
        paddingVertical: 5,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    containerCard: {
        width: '80%',
        alignItems: 'center',
        marginTop: 10,
        paddingVertical:40,

        borderRadius: 8,
        borderWidth: 0.4,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    name: {
        marginTop: 15,
        fontSize: 20,
        fontWeight: 'bold',
    },
});
