import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ActivityScreen from "../screens/ActivityScreen";
import FormActivityNormal from "../screens/Activity/FormActivityNormal";

export type ActivityStackParamList = {
    Activity: undefined;
    FormActivityNormal: { item: any };
};

const Stack = createNativeStackNavigator<ActivityStackParamList>();

const ActivityNavigator = () => {

    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Activity"
                component={ActivityScreen}
                options={{ headerTitle: '' }}
            />
            <Stack.Screen
                name="FormActivityNormal"
                component={FormActivityNormal}
                options={{ headerTitle: '' }}
            />
        </Stack.Navigator>
    );
};

export default ActivityNavigator;
