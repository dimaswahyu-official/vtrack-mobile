import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ActivityScreen from "../screens/ActivityScreen";
import ActivityScreen2 from "../screens/ActivityScreen2";
import FormActivityNormal from "../screens/Activity/FormActivityNormal";
import FormDetailActivity from "../screens/Activity/FormDetailActivity";

export type ActivityStackParamList = {
    Activity2: undefined;
    Activity: undefined;
    FormActivityNormal: { item: any };
    FormDetailActivity: { item: any };
};

const Stack = createNativeStackNavigator<ActivityStackParamList>();

const ActivityNavigator = () => {

    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Activity2"
                component={ActivityScreen2}
                options={{ headerTitle: '' }}
            />
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
            <Stack.Screen
                name="FormDetailActivity"
                component={FormDetailActivity}
                options={{ headerTitle: '' }}
            />
        </Stack.Navigator>
    );
};

export default ActivityNavigator;
