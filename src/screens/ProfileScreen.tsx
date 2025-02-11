import React, {useEffect} from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, ScrollView, FlatList, Alert} from 'react-native';
import {useThemeStore} from '../store/useThemeStore';
import {useAuthStore} from '../store/useAuthStore';
import ButtonComponent from "../components/ButtonComponent";
import GlobalStyles from "../utils/GlobalStyles";
import {useNavigation} from '@react-navigation/native';
import Ionicons from "@expo/vector-icons/Ionicons";
import {StackNavigationProp} from "@react-navigation/stack";
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import {ProfileStackParamList} from "../navigation/ProfileNavigator";
import {useLoadingStore} from "../store/useLoadingStore";
import Toast from "react-native-toast-message";
import useConstantStore from '../store/useConstantStore';
import Colors from "../utils/Colors";
import colors from "../utils/Colors";

const {width, height} = Dimensions.get('window');

type NavigationProp = StackNavigationProp<ProfileStackParamList, 'Profile'>;
export default function ProfileScreen() {
    const navigation = useNavigation<NavigationProp>();

    const {setLoading} = useLoadingStore();
    const {theme, setTheme} = useThemeStore();
    const {clearAuth, user} = useAuthStore();
    const {clearConstants} = useConstantStore();
    const defaultImage = 'http://placehold.co/100';
    const BACKGROUND_FETCH_TASK = 'SYNC_ACTIVITIES_TASK';


    useEffect(() => {
        if (!user) {
            setLoading(true);
        } else {
            setLoading(false);
        }
    }, [user, setLoading]);

    const profile = {
        name: user?.fullName || '',
        email: user?.email || '',
        photo: user?.photo || '',
        roles: user?.roles || '',
        username: user?.username || '',
    };

    const handleThemeToggle = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const handleLogout = () => {
        Alert.alert("Confirm Logout", "Are you sure you want to logout?", [
            {
                text: "Cancel",
                style: "cancel",
            },
            {
                text: "Logout",
                onPress: () => {
                    setLoading(true);
                    clearAuth();
                    clearConstants();
                    Toast.show({
                        type: "success",
                        text1: "Success",
                        text2: "Logout Successful",
                    });
                    setTimeout(() => setLoading(false), 1000);
                },
            },
        ]);
    };
    const triggerBackgroundFetch = async () => {
        try {
            await BackgroundFetch.registerTaskAsync('SYNC_ACTIVITIES_TASK', {
                minimumInterval: 30, // Runs after 30 second (for testing)
                startOnBoot: true,
                stopOnTerminate: false,
            });
            console.log('[Background Fetch] Task scheduled manually!');
        } catch (error) {
            console.error('[Background Fetch] Task scheduling failed:', error);
        }
    };

    const toAttendanceScreen = () => {
        navigation.navigate('Attendance', {profile});
    };

    const toUpdateProfileScreen = () => {
        navigation.navigate('UpdateProfile', {profile});
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
                        <Ionicons style={styles.iconEdit} name={"pencil"} size={22} color='white' onPress={() => {
                            toUpdateProfileScreen();
                        }}/>
                        <View style={styles.avatarContainer}>
                            {profile.photo === '' ? (
                                <View style={{
                                    borderRadius: 75,
                                    borderColor: 'white',
                                    backgroundColor: 'white',
                                    padding: 15,
                                    margin: 10
                                }}>
                                    <Ionicons name="rocket" size={70} color={colors.buttonBackground}/>
                                </View>
                            ) : (
                                <Image source={{uri: profile.photo}} style={styles.avatar}/>
                            )}
                            {/*<Image source={{uri: profile.photo}} style={styles.avatar}/>*/}
                            <Text style={styles.name}>{profile.name}</Text>
                            <Text style={styles.roles}>{profile.roles}</Text>
                            <Text style={styles.email}>{profile.email}</Text>

                        </View>
                        <View style={styles.verticalView}>
                            <Text style={styles.verticalText}>{profile.roles}</Text>
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={[styles.row, {width: '100%'}]}>
                            <ButtonComponent
                                title={'Reimburse'}
                                onPress={() => {
                                    navigation.navigate('Reimburse');
                                }}
                                buttonStyle={styles.buttonSync}
                                textStyle={globalStyles.buttonText}
                            />
                            <ButtonComponent
                                title={'Ambil Absen'}
                                onPress={() => {
                                    toAttendanceScreen();
                                }}
                                buttonStyle={styles.buttonSync}
                                textStyle={globalStyles.buttonText}
                            />
                        </View>
                    </View>
                    <View style={styles.row}>
                        <ButtonComponent
                            title={'Synchronize'}
                            onPress={() => {
                                triggerBackgroundFetch();
                            }}
                            buttonStyle={styles.buttonSync}
                            textStyle={globalStyles.buttonText}
                        />
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
    },
    containerCard: {
        position: 'relative',
        width: '80%',
        height: height / 2,
        marginTop: 10,
        marginBottom: 10,
        borderRadius: 8,
        borderWidth: 0.4,
    },
    coverPhoto: {
        width: '100%',
        height: height / 4,
        resizeMode: 'cover',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    logo: {
        marginTop: height / 18,
        alignSelf: 'center',
        position: 'absolute',
        zIndex: 15,
        width: width / 4,
        height: height / 9,
        resizeMode: 'contain'
    },
    iconEdit: {
        top: 10, // Adjust for vertical positioning
        right: 10,
        position: 'absolute',
        zIndex: 16,
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
        marginTop: 2,
        fontSize: 20,
        fontWeight: 'bold',
    },
    username: {
        marginBottom: 40,
        fontSize: 36,
        fontWeight: 'bold',
        color: Colors.buttonBackground,
    },
    roles: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.secondaryColor
    },
    email: {
        fontWeight: 'bold',
        color: colors.buttonBackground,
        fontSize: 20,
        alignItems: 'center',
        justifyContent: 'center',
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
        justifyContent: 'space-evenly',
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
    buttonSync: {
        backgroundColor: Colors.buttonBackground,
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderRadius: 8,
        alignItems: 'center',
        margin: 5,
    },
    buttonUpdateProfile: {
        backgroundColor: Colors.secondaryColor,
        padding: height > 700 ? height * 0.02 : height * 0.015,
        borderRadius: 8,
        width: width * 0.8,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    verticalView: {
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        paddingVertical: 2
    },
    verticalText: {
        transform: [{rotate: '-90deg'}], // Rotates the text
        textAlign: 'center',
        fontSize: 60,
        fontWeight: 'bold',
        color: '#d3d4d9',
        position: 'absolute',
        zIndex: -1,
        paddingVertical: 14,
    },
});