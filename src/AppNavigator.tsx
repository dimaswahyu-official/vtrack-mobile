import React, { useEffect } from 'react';
import { loadAuthState, useAuthStore } from './store/useAuthStore';
import MainNavigator from './navigation/MainNavigator';
import AuthNavigator from './navigation/AuthNavigator';
import Spinner from 'react-native-loading-spinner-overlay';
import { StatusBar } from 'react-native';
import { useThemeStore } from './store/useThemeStore';
import ThemeProvider from './context/ThemeProvider';
import {useLoadingDialogStore} from "./store/useLoadingStore";

const AppNavigator = () => {
    const { isAuthenticated } = useAuthStore();
    const { theme } = useThemeStore();
    const {showLoadingDialog, hideLoadingDialog} = useLoadingDialogStore();


    useEffect(() => {
        const initializeAuthState = async () => {
            try{
                showLoadingDialog("loading...");
                await loadAuthState(useAuthStore.setState);
            }catch (error) {
                console.error('Error initializing auth state:', error);
                hideLoadingDialog();
            }finally {
                hideLoadingDialog();
            }

        };

        initializeAuthState();
    }, []);
    return (
        <ThemeProvider>
            <StatusBar
                barStyle={ 'light-content'}
                backgroundColor={'#fff'}
            />
            {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
        </ThemeProvider>
    );
};

export default AppNavigator;
