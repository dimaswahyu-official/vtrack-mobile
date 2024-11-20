import React, { useEffect } from 'react';
import { loadAuthState, useAuthStore } from './store/useAuthStore';
import MainNavigator from './navigation/MainNavigator';
import AuthNavigator from './navigation/AuthNavigator';
import Spinner from 'react-native-loading-spinner-overlay';
import { StatusBar } from 'react-native';
import { useLoadingStore } from './store/useLoadingStore';
import { useThemeStore } from './store/useThemeStore';
import ThemeProvider from './context/ThemeProvider';

const AppNavigator = () => {
    const { isAuthenticated } = useAuthStore();
    const { isLoading, setLoading } = useLoadingStore();
    const { theme } = useThemeStore();

    useEffect(() => {
        const initializeAuthState = async () => {
            setLoading(true);
            await loadAuthState(useAuthStore.setState);
            setLoading(false);
        };

        initializeAuthState();
    }, [setLoading]);
    return (
        <ThemeProvider>
            <StatusBar
                barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
                backgroundColor={theme === 'dark' ? '#121212' : '#fff'}
            />
            {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
        </ThemeProvider>
    );
};

export default AppNavigator;
