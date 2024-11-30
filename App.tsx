import { OfflineProvider } from './src/context/OfflineProvider';
import AppNavigator from "./src/AppNavigator";
import OfflineIndicator from "./src/components/OfflineIndicator";
import Toast from "react-native-toast-message";
import React, { useMemo, useEffect } from "react";
import Spinner from "react-native-loading-spinner-overlay";
import { useLoadingStore } from "./src/store/useLoadingStore";
import { defaultDatabaseDirectory, SQLiteProvider } from 'expo-sqlite';
import { Platform } from 'react-native';
import { Paths } from 'expo-file-system/next';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { syncActivitiesInBatches } from './src/model/activityModel'; // Adjust the import path
import { getDatabaseInstance } from './src/config/db';
import * as FileSystem from 'expo-file-system';

// Define the background fetch task
TaskManager.defineTask('SYNC_ACTIVITIES_TASK', async () => {
    try {
        const now = Date.now();
        await logToFile(`Got background fetch call at date: ${new Date(now).toISOString()}`);
        
        const db = await getDatabaseInstance();
        await syncActivitiesInBatches(db);
        return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (error: any) {
        await logToFile(`Error syncing activities: ${error.message}`);
        return BackgroundFetch.BackgroundFetchResult.Failed;
    }
});

// Example logging function
const logToFile = async (message: string) => {
    const logFileUri = `${FileSystem.documentDirectory}logs.txt`;
    const logMessage = `${new Date().toISOString()}: ${message}\n`;
    console.log(logFileUri);
    await FileSystem.writeAsStringAsync(logFileUri, logMessage, { encoding: FileSystem.EncodingType.UTF8 });
};

export default function App() {
    const { isLoading, setLoading } = useLoadingStore();
    const dbDirectory = useMemo(() => {
        if (Platform.OS === 'ios') {
            return Object.values(Paths.appleSharedContainers)?.[0]?.uri;
        }
        return defaultDatabaseDirectory;
    }, []);

    const registerBackgroundFetch = async () => {
        await BackgroundFetch.registerTaskAsync('SYNC_ACTIVITIES_TASK', {
            minimumInterval: 10 * 60,
            stopOnTerminate: false,
            startOnBoot: true,
        });
    };

    useEffect(() => {
        registerBackgroundFetch();
    }, []);

    return (
        <OfflineProvider>
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
        </OfflineProvider>
    );
}
