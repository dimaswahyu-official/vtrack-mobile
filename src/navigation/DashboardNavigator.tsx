import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ActivityScreen from "../screens/ActivityScreen";
import FormActivityNormal from "../screens/Activity/FormActivityNormal";
import HomeScreen from "../screens/HomeScreen";

export type DashboardStackParamList = {
    Dashboard: undefined;
};

const Stack = createNativeStackNavigator<DashboardStackParamList>();

const DashboardNavigator = () => {

    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Dashboard"
                component={HomeScreen}
                options={{ headerTitle: '' }}
            />
        </Stack.Navigator>
    );
};

export default DashboardNavigator;
