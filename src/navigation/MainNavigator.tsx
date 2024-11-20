import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import ProfileNavigator from './ProfileNavigator';
import { Ionicons } from '@expo/vector-icons';
import ActivityNavigator from "./ActivityNavigator";
import Colors from "../utils/Colors";
import { View } from 'react-native';

export type MainTabParamList = {
    Home: undefined;
    ProfileStack: undefined;
    ActivityStack: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator = () => (
    <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
                let iconName: keyof typeof Ionicons.glyphMap = 'alert-circle';

                if (route.name === 'Home') iconName = 'home';
                else if (route.name === 'ProfileStack') iconName = 'person';
                else if (route.name === 'ActivityStack') iconName = 'rocket';

                return <Ionicons name={iconName} size={22} color={color} />;
            },
            tabBarActiveTintColor: Colors.secondaryColor,
            tabBarInactiveTintColor: 'gray',
            tabBarStyle: {
                backgroundColor: Colors.buttonBackground,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                paddingTop: 4,
                height: 60,
            },
            tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '700',
                marginBottom: 0,
            },
            headerShown: false,
        })}
    >
        <Tab.Screen
            name="ActivityStack"
            component={ActivityNavigator}
        />
        <Tab.Screen
            name="Home"
            component={HomeScreen}
        />
        <Tab.Screen
            name="ProfileStack"
            component={ProfileNavigator}
        />
    </Tab.Navigator>
);

export default MainNavigator;
