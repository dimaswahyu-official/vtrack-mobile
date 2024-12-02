import React, { useMemo, useEffect, useState } from 'react';
import { OfflineProvider, useOffline } from './src/context/OfflineProvider';
import AppNavigator from "./src/AppNavigator";
import OfflineIndicator from "./src/components/OfflineIndicator";
import Toast from "react-native-toast-message";
import Spinner from "react-native-loading-spinner-overlay";
import { useLoadingStore } from "./src/store/useLoadingStore";
import { defaultDatabaseDirectory, SQLiteProvider } from 'expo-sqlite';
import { Platform } from 'react-native';
import { Paths } from 'expo-file-system/next';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { syncActivitiesInBatches } from './src/model/activityModel'; // Adjust the import path
import { getDatabaseInstance } from './src/config/db';
import { BackgroundFetchStatus } from 'expo-background-fetch';

const BACKGROUND_FETCH_TASK = 'SYNC_ACTIVITIES_TASK';

// Define the background fetch task at the top level
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
    try {
        const now = Date.now();
        console.log(`Got background fetch call at ${new Date(now).toISOString()}`); // Log for debugging
        Toast.show({ type: "info", text1: "Got background fetch call", text2: `${new Date(now).toISOString()}` });
        
        const db = getDatabaseInstance();
        if (!db) {
            console.error('Database instance is null or undefined.');
            return BackgroundFetch.BackgroundFetchResult.Failed;
        }

        console.log('Starting syncActivitiesInBatches...');
        await syncActivitiesInBatches(db);
        console.log('syncActivitiesInBatches completed successfully.');

        return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (error: any) {
        Toast.show({ type: "error", text1: "Error syncing activities", text2: `${error.message}` });
        console.error('Error during background fetch task:', error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
    }
});

// Create a component to handle the loading and online status
const MainApp = () => {
    const { isLoading } = useLoadingStore();
    const { isOnline, isWifi } = useOffline();
    const [isRegistered, setIsRegistered] = useState(false);
    const [status, setStatus] = useState<BackgroundFetchStatus | null>(null);

    const checkStatusAsync = async () => {
        const status = await BackgroundFetch.getStatusAsync();
        const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
        setStatus(status);
        setIsRegistered(isRegistered);
    };

    const dbDirectory = useMemo(() => {
        if (Platform.OS === 'ios') {
            return Object.values(Paths.appleSharedContainers)?.[0]?.uri;
        }
        return defaultDatabaseDirectory;
    }, []);

    const registerBackgroundFetch = async () => {
        try {
            await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
                minimumInterval: 5 * 60, // 5 minutes
                stopOnTerminate: false, // Keep the task registered even if the app is terminated
                startOnBoot: true, // Start the task on device boot
            });

            await checkStatusAsync();
            console.log(`Background fetch status: ${status && BackgroundFetch.BackgroundFetchStatus[status]} | Registered: ${isRegistered ? 'Yes' : 'No'}`);
            Toast.show({ type: "info", text1: "Background fetch registered", text2: `${new Date().toISOString()}` });
            console.log('Background fetch task registered successfully.');
        } catch (error: any) {
            Toast.show({ type: "error", text1: "Failed to register background fetch", text2: `${error.message}` });
            console.error('Error registering background fetch task:', error);
        }
    };

    useEffect(() => {
        if (isOnline || isWifi) {
            Toast.show({ type: "info", text1: "Registering background fetch", text2: `${new Date().toISOString()}` });
            registerBackgroundFetch();
        }
    }, [isOnline, isWifi]);

    return (
        <>
            <SQLiteProvider databaseName="VTrackOffline.db" assetSource={{ assetId: require('./assets/VTrackOffline.db') }} directory={dbDirectory}>
                <AppNavigator />
                <OfflineIndicator />
                <Spinner
                    visible={isLoading}
                    color="tomato"
                    size="large"
                    overlayColor="rgba(0, 0, 0, 0.1)"
                />
                <Toast />
            </SQLiteProvider>
        </>
    );
};

export default function App() {
    return (
        <OfflineProvider>
            <MainApp />
        </OfflineProvider>
    );
}
