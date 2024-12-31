import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ActivityScreen from "../screens/ActivityScreen";
import ActivityScreen2 from "../screens/ActivityScreen2";
import FormActivityNormal from "../screens/Activity/FormActivityNormal";
import FormDetailActivity from "../screens/Activity/FormDetailActivity";
import FormDetailSio from "../screens/Activity/FormDetailSio";
import FormDetailBrand from "../screens/Activity/FormDetailBrand";
import FormDetailSog from "../screens/Activity/FormDetailSog";
import FormDetailOutlet from "../screens/Activity/FormDetailOutlet";

export type ActivityStackParamList = {
    Activity2: undefined;
    Activity: undefined;
    FormActivityNormal: { item: any };
    FormDetailActivity: { item: any};
    FormDetailSio: { item: any ;  photox: any, idx:any};
    FormDetailBrand: { item: any,idx:any };
    FormDetailSog: { item: any,idx:any };
    FormDetailOutlet: { item: any,idx:any };
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
            {/*<Stack.Screen*/}
            {/*    name="Activity"*/}
            {/*    component={ActivityScreen}*/}
            {/*    options={{ headerTitle: '' }}*/}
            {/*/>*/}
            <Stack.Screen
                name="FormActivityNormal"
                component={FormActivityNormal}
                options={{ headerTitle: '' }}
            />
            <Stack.Screen
                name="FormDetailActivity"
                component={FormDetailActivity}
                options={{ headerTitle: '' , headerBackVisible: false  }}
            />
            <Stack.Screen
                name="FormDetailSio"
                component={FormDetailSio}
                options={{ headerTitle: '' , headerBackVisible: false }}
            />
            <Stack.Screen
                name="FormDetailBrand"
                component={FormDetailBrand}
                options={{ headerTitle: '', headerBackVisible: false  }}
            />
            <Stack.Screen
                name="FormDetailSog"
                component={FormDetailSog}
                options={{ headerTitle: '', headerBackVisible: false  }}
            />
            <Stack.Screen
                name="FormDetailOutlet"
                component={FormDetailOutlet}
                options={{ headerTitle: '' , headerBackVisible: false  }}
            />
        </Stack.Navigator>
    );
};

export default ActivityNavigator;
