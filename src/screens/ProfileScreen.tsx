import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, ScrollView, FlatList, Alert} from 'react-native';
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
import colors from "../utils/Colors";
import {ActivityRepository} from "../model/ActivityRepository";
import * as BackgroundFetch from "expo-background-fetch";
import {sendOfflineData} from "../services/sendOfflineData";
import {useSQLiteContext} from "expo-sqlite";

const {width, height} = Dimensions.get('window');

type NavigationProp = StackNavigationProp<ProfileStackParamList, 'Profile'>;
export default function ProfileScreen() {
    const navigation = useNavigation<NavigationProp>();

    const {setLoading} = useLoadingStore();
    const {theme, setTheme} = useThemeStore();
    const {clearAuth, user} = useAuthStore();
    const {clearConstants} = useConstantStore();
    const db = useSQLiteContext();
    const [loading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0); // Progress state (0-100)
    const [syncedCount, setSyncedCount] = useState(0); // Track successfully synced activities
    const [failedCount, setFailedCount] = useState(0); // Track failed activities


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
            setIsLoading(true);
            setProgress(0); // Reset progress at the start
            setSyncedCount(0); // Reset synced count
            setFailedCount(0); // Reset failed count
            const activities = await ActivityRepository.findUnsyncedActivities(db);
            console.log(`[Sync Fetch] Found ${activities.length} unsynced activities`);

            if (activities.length === 0) {
                console.log('[Sync Fetch] No activities to sync');
                return BackgroundFetch.BackgroundFetchResult.NoData;
            }

            for (const activity of activities) {
                try {
                    console.log(`[Sync Fetch] Processing activity ID: ${activity.id}`);
                    const dataSend = await ActivityRepository.findActivityWithDetail(db, activity.call_plan_schedule_id);

                    if (!dataSend || dataSend.length === 0) {
                        console.error(`[Sync Fetch] No data found for activity ID: ${activity.id}`);
                        setFailedCount((prev) => prev + 1);
                        continue;
                    }

                    await sendOfflineData(dataSend[0], db);
                    setSyncedCount((prev) => prev + 1); // Increment synced count
                    console.log(`[Sync Fetch] Successfully synced activity ID: ${activity.id}`);

                } catch (error) {
                    console.error(`[Sync Fetch] Failed to sync activity ${activity.id}:`, error);
                    setFailedCount((prev) => prev + 1); // Increment failed count
                }
            }
        } catch (error) {
            setIsLoading(false);
        } finally {
            setIsLoading(false);
            setProgress(100);
        }

    }

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
                            <View style={{margin: height * 0.02}}></View>
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

                    {/* Progress Bar */}
                    <View style={{ width: "90%", backgroundColor: "#e0e0e0", borderRadius: 5}}>
                        <View
                            style={{
                                width: `${progress}%`,
                                height: 20,
                                backgroundColor: progress === 100 ? Colors.secondaryColor : Colors.buttonBackground,
                                borderRadius: 10,
                                alignItems:"center"
                            }}
                        >
                            <Text style={{color: "white"}}>
                                {progress}%
                            </Text>
                        </View>
                    </View>

                    {/* Display synced and failed counts */}
                    {loading && (
                        <Text>
                            Synced: {syncedCount}, Failed: {failedCount}
                        </Text>
                    )}
                    <View style={styles.row}>
                        <Ionicons
                            name={"sync-circle"}
                            size={52}
                            color={Colors.secondaryColor}
                            onPress={() => {
                                triggerBackgroundFetch();
                            }}
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
        height: height / 1.85,
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
        marginTop: height / 25,
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
        marginVertical: height * -0.02
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