import React, {useEffect} from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, ScrollView, FlatList} from 'react-native';
import {useThemeStore} from '../store/useThemeStore';
import {useAuthStore} from '../store/useAuthStore';
import ButtonComponent from "../components/ButtonComponent";
import GlobalStyles from "../utils/GlobalStyles";
import {useNavigation} from '@react-navigation/native';
import Ionicons from "@expo/vector-icons/Ionicons";
import {StackNavigationProp} from "@react-navigation/stack";
import {ProfileStackParamList} from "../navigation/ProfileNavigator";
import {useLoadingStore} from "../store/useLoadingStore";
import Toast from "react-native-toast-message";
import useConstantStore from '../store/useConstantStore';
import Colors from "../utils/Colors";

const {width, height} = Dimensions.get('window');

type NavigationProp = StackNavigationProp<ProfileStackParamList, 'Profile'>;
export default function ProfileScreen() {
    const navigation = useNavigation<NavigationProp>();

    const {setLoading} = useLoadingStore();
    const {theme, setTheme} = useThemeStore();
    const {clearAuth, user} = useAuthStore();
    const {clearConstants} = useConstantStore();


    useEffect(() => {
        if (!user) {
            setLoading(true);
        } else {
            setLoading(false);
        }
        console.log(user)
    }, [user, setLoading]);

    const profile = {
        name: user?.fullName || '',
        email: user?.email || '',
        photo: user?.photo || "https://via.placeholder.com/150",
    };

    const handleThemeToggle = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
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

    const toAttendanceScreen = () => {
        navigation.navigate('Attendance', {profile});
    };

    const globalStyles = GlobalStyles(theme);

    return (
        <ScrollView>
            <View style={{justifyContent: 'center', width: '100%'}}>
                {/* Logout Button */}
                <View style={styles.row}>
                    <Text style={styles.name}>
                        Hi {profile.name}
                        <Ionicons name={"rocket"} size={22} color={Colors.secondaryColor}/>
                    </Text>

                    <TouchableOpacity style={styles.button} onPress={handleLogout}>
                        <Text style={styles.buttonText}>Logout</Text>
                    </TouchableOpacity>

                </View>
                {/*Card Container Profiles*/}
                <View style={{alignItems: 'center'}}>
                    <View style={styles.containerCard}>
                        <Image source={require('../../assets/cover-profile.png')} style={styles.coverPhoto}/>
                        <Image source={require('../../assets/logo-nna-white.png')} style={styles.logo}/>
                        <View style={styles.avatarContainer}>
                            <Image source={{uri: profile.photo}} style={styles.avatar}/>
                            <Text style={styles.name}>{profile.name}</Text>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.email}>Email </Text>
                        <Text style={styles.name}>{profile.email}</Text>
                    </View>
                    <ButtonComponent
                        title={'Ambil Absen'}
                        onPress={() => {
                            toAttendanceScreen();
                        }}
                        buttonStyle={globalStyles.button}
                        textStyle={globalStyles.buttonText}
                    />
                </View>
                <View style={{alignItems: "center", padding: 20}}>
                    <Text style={{color: 'gray', marginVertical: 8}}>active since</Text>
                    <Text style={{color: Colors.buttonBackground, fontWeight: 'bold'}}>28/06/2024</Text>
                </View>
            </View>

        </ScrollView>
    );
}

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         justifyContent: 'flex-start',
//         alignItems: 'center',
//         paddingHorizontal: 10,
//         paddingVertical: 10,
//     },
//     profileContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 20,
//         width: '100%',
//         padding: 10,
//         borderRadius: 8,
//         justifyContent: 'space-between',
//     },
//     profileUpdate: {
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     profileImage: {
//         width: 80,
//         height: 80,
//         borderRadius: 40,
//         marginRight: 10,
//     },
//     profileDetails: {
//         flex: 1,
//     },
//     profileName: {
//         fontSize: 22,
//         fontWeight: 'bold',
//     },
//     profileEmail: {
//         fontSize: 16,
//     },
//     settingContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 40,
//     },
//     settingText: {
//         fontSize: 18,
//         marginRight: 10,
//     },
//     updateIcon: {
//         position: 'absolute',
//         right: width / 20 - 20,
//         top: height / 100 - 25,
//     },
// });

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
    },
    containerCard: {
        width: '80%',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
        borderRadius: 8,
        borderWidth: 0.4,
    },
    coverPhoto: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    logo: {
        marginTop: 20,
        alignSelf: 'center',
        position: 'absolute',
        zIndex: 15,
        width: 120,
        height: 90,
        resizeMode: 'contain'
    },
    avatarContainer: {
        alignItems: 'center',
        marginTop: -75,
    },
    avatar: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 5,
        borderColor: 'white',
    },
    name: {
        marginTop: 15,
        fontSize: 20,
        fontWeight: 'bold',
    },
    email: {
        marginTop: 15,
        fontSize: 20,
        color: 'gray',
    },
    rowContainer: {
        flexDirection: 'row',
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginVertical: 8,
    },
    box: {
        marginTop: 10,
        backgroundColor: 'white',
        alignItems: 'center',
        shadowColor: 'black',
        shadowOpacity: 0.2,
        shadowOffset: {
            height: 1,
            width: -2,
        },
        elevation: 2,
        paddingTop: 10,
    },
    button: {
        backgroundColor: Colors.buttonBackground,
        paddingVertical: 5,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
});