import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ProfileScreen from '../screens/ProfileScreen';
import {useNavigation} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {MainTabParamList} from "./MainNavigator";
import UpdateProfileForm from "../screens/Profile/UpdateProfileForm";
// Declare your param list for the Profile stack
export type ProfileStackParamList = {
    Profile: undefined;
    UpdateProfile: { profile: { name: string; email: string; photo: string; } };
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileNavigator = () => {

    const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();

    useEffect(() => {
        return navigation.addListener('tabPress', (e) => {
            e.preventDefault();
            // Reset the ProfileNavigator stack to the "Profile" screen
            navigation.reset({
                routes: [{
                    name: "ProfileStack",
                }],
            });
        });
    }, [navigation]);


    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ headerTitle: '' }}
            />
            <Stack.Screen
                name="UpdateProfile"
                component={UpdateProfileForm}
                options={{ headerTitle: '' }}
            />
        </Stack.Navigator>
    );
};

export default ProfileNavigator;
