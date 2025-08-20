import React, {useEffect, useMemo} from 'react';
import { OfflineProvider } from './src/context/OfflineProvider';
import AppNavigator from './src/AppNavigator';
import OfflineIndicator from './src/components/OfflineIndicator';
import Toast from 'react-native-toast-message';
import Spinner from 'react-native-loading-spinner-overlay';
import { defaultDatabaseDirectory, SQLiteProvider } from 'expo-sqlite';
import {Alert, Platform, SafeAreaView} from 'react-native';
import { Paths } from 'expo-file-system/next';
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import LoadingDialog from "./src/components/LoadingDialog";
import GlobalDialog from "./src/components/GlobalDialog";

const MainApp = () => {

	const dbDirectory = useMemo(() => {
		if (Platform.OS === 'ios') {
			return Object.values(Paths.appleSharedContainers)?.[0]?.uri;
		}
		return defaultDatabaseDirectory;
	}, []);

	const permission = async () => {
		try{
			let { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") {
				Alert.alert(
					"Permission Denied",
					"Location permission is required for attendance"
				);
				return;
			}
			const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
			if (!permissionResult.granted) {
				Alert.alert('Permission required', 'Please grant permission to access the camera.');
				return;
			}
		}catch(error){
			console.error('[Background Fetch] Task scheduling failed:', error);
		}
	}

	useEffect(() => {
		 permission()
	}, []);

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<SQLiteProvider
				databaseName="VTrackOffline.db"
				assetSource={{ assetId: require('./assets/VTrackOffline.db') }}
				directory={dbDirectory}>
				<AppNavigator />
				<OfflineIndicator />
				<GlobalDialog />
				<LoadingDialog />
				{/*{isLoading && <Spinner color="tomato" size="large" overlayColor="rgba(0, 0, 0, 0.1)" />}*/}
				<Toast />
			</SQLiteProvider>
		</SafeAreaView>
	);
};

export default function App() {
	return (
		<OfflineProvider>
			<MainApp />
		</OfflineProvider>
	);
}
