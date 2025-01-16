import React, { useMemo } from 'react';
import { OfflineProvider } from './src/context/OfflineProvider';
import AppNavigator from './src/AppNavigator';
import OfflineIndicator from './src/components/OfflineIndicator';
import Toast from 'react-native-toast-message';
import Spinner from 'react-native-loading-spinner-overlay';
import { useLoadingStore } from './src/store/useLoadingStore';
import { defaultDatabaseDirectory, SQLiteProvider } from 'expo-sqlite';
import { Platform } from 'react-native';
import { Paths } from 'expo-file-system/next';

const MainApp = () => {
	const { isLoading } = useLoadingStore();

	const dbDirectory = useMemo(() => {
		if (Platform.OS === 'ios') {
			return Object.values(Paths.appleSharedContainers)?.[0]?.uri;
		}
		return defaultDatabaseDirectory;
	}, []);

	return (
		<>
			<SQLiteProvider
				databaseName="VTrackOffline.db"
				assetSource={{ assetId: require('./assets/VTrackOffline.db') }}
				directory={dbDirectory}>
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
