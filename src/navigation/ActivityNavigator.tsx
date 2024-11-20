import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ActivityScreen from "../screens/ActivityScreen";

export type ActivityStackParamList = {
    Activity: undefined;
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
        </Stack.Navigator>
    );
};

export default ActivityNavigator;
