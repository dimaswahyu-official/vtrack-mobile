import React, {useEffect} from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity, Dimensions} from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import { useAuthStore } from '../store/useAuthStore';
import ButtonComponent from "../components/ButtonComponent";
import GlobalStyles from "../utils/GlobalStyles";
import { useNavigation } from '@react-navigation/native';
import Ionicons from "@expo/vector-icons/Ionicons";
import {StackNavigationProp} from "@react-navigation/stack";
import {ProfileStackParamList} from "../navigation/ProfileNavigator";
import {useLoadingStore} from "../store/useLoadingStore";
import Toast from "react-native-toast-message";
import useConstantStore from '../store/useConstantStore';

const { width, height } = Dimensions.get('window');

type NavigationProp = StackNavigationProp<ProfileStackParamList, 'Profile'>;
export default function ProfileScreen() {
    const navigation = useNavigation<NavigationProp>();

    const { setLoading } = useLoadingStore();
    const { theme, setTheme } = useThemeStore();
    const { clearAuth, user } = useAuthStore();
    const { clearConstants } = useConstantStore();


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

    const toUpdateProfile = () => {
        navigation.navigate('UpdateProfile', { profile });
    };

    const globalStyles = GlobalStyles(theme);

    return (
        <View style={[styles.container]}>
            {/* Profile Information */}
            <View style={styles.profileContainer}>
                <Image source={{ uri: profile.photo }} style={styles.profileImage} />
                <View style={styles.profileDetails}>
                    <View style={styles.profileUpdate}>
                        <Text style={[styles.profileName, { color: theme === 'dark' ? '#fff' : '#000' }]}>
                            {profile.name}
                        </Text>
                        <TouchableOpacity onPress={toUpdateProfile} style={styles.updateIcon}>
                            <Ionicons name="create-outline" size={28} color={theme === 'dark' ? '#fff' : '#000'} />
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.profileEmail, { color: theme === 'dark' ? '#aaa' : '#555' }]}>
                        {profile.email}
                    </Text>
                </View>
            </View>
            {/* Update Profile Button */}
            {/* Theme Switcher */}
            {/*<View style={styles.settingContainer}>*/}
            {/*    <Text style={[styles.settingText, { color: theme === 'dark' ? '#fff' : '#000' }]}>*/}
            {/*        Dark Mode*/}
            {/*    </Text>*/}
            {/*    <Switch*/}
            {/*        value={theme === 'dark'}*/}
            {/*        onValueChange={handleThemeToggle}*/}
            {/*        thumbColor={theme === 'dark' ? '#fff' : '#000'}*/}
            {/*        trackColor={{ false: '#767577', true: '#81b0ff' }}*/}
            {/*    />*/}
            {/*</View>*/}
            {/* Logout Button */}
            <ButtonComponent
                title="Logout"
                onPress={handleLogout}
                buttonStyle={globalStyles.button}
                textStyle={globalStyles.buttonText}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        width: '100%',
        padding: 10,
        borderRadius: 8,
        justifyContent: 'space-between',
    },
    profileUpdate: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: 10,
    },
    profileDetails: {
        flex: 1,
    },
    profileName: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    profileEmail: {
        fontSize: 16,
    },
    settingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 40,
    },
    settingText: {
        fontSize: 18,
        marginRight: 10,
    },
    updateIcon: {
        position: 'absolute',
        right: width / 20 - 20,
        top: height / 100 - 25,
    },
});
