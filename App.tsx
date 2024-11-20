import { OfflineProvider } from './src/context/OfflineProvider';
import AppNavigator from "./src/AppNavigator";
import OfflineIndicator from "./src/components/OfflineIndicator";
import Toast from "react-native-toast-message";
import React, {useEffect, useState} from "react";
import Spinner from "react-native-loading-spinner-overlay";
import {useLoadingStore} from "./src/store/useLoadingStore";

export default function App() {
    const { isLoading, setLoading } = useLoadingStore();
    return (
        <OfflineProvider>
            <AppNavigator />
            <OfflineIndicator />
            <Spinner
                visible={isLoading}
                color="tomato"
                size="large"
                overlayColor="rgba(0, 0, 0, 0.1)"
            />
            <Toast />
        </OfflineProvider>
    );
}
