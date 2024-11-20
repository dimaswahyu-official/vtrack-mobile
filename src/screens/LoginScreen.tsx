// app/auth/login.tsx
import React, {useEffect, useState} from 'react';
import { StyleSheet, Text, TextInput, View, Image, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from "react-native-toast-message";
import GlobalStyles from "../utils/GlobalStyles";
import ButtonComponent from "../components/ButtonComponent";
import { useNavigation } from '@react-navigation/native';
import {StackNavigationProp} from "@react-navigation/stack";
import {loadAuthState, useAuthStore} from "../store/useAuthStore";
import {useThemeStore} from "../store/useThemeStore";
import AuthServices from "../services/authService";
import {AuthStackParamList} from "../navigation/AuthNavigator";
import {useLoadingStore} from "../store/useLoadingStore";

type FormData = {
    email: string;
    password: string;
};

type NavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;
export default function LoginScreen() {
    const { setAuthenticated, setUser, setToken, user, isAuthenticated, accessToken } = useAuthStore();
    const navigation = useNavigation<NavigationProp>();  // Add the type here
    const [passwordVisible, setPasswordVisible] = useState(false);
    const { control, handleSubmit, formState: { errors } } = useForm<FormData>();
    const { theme } = useThemeStore(); // Access the theme and setter from your store
    const {  setLoading } = useLoadingStore();

    useEffect(() => {
        const initializeAuthState = async () => {
            setLoading(true);
            await loadAuthState(useAuthStore.setState);
            setLoading(false);
        };

        initializeAuthState();
    }, [setLoading]);

    console.log(`User:${user}`, `isAuthenticated:${isAuthenticated}`, `accessToken:${accessToken}`)


    const handleLogin = async (data: any) => {
        const { email, password } = data;
        if (email && password) {
            try {
                const response = await AuthServices.login(email, password);
                if (response.statusCode === 200){
                    setToken(response.data.accessToken);
                    setUser({
                        id: response.data.user.id,
                        email: response.data.user.email,
                        fullName: response.data.user.fullname,
                        photo: response.data.user.photo,
                    });
                    setAuthenticated(true)
                    Toast.show({
                        type: 'success',
                        text1: 'Success',
                        text2: `Login Successful`,
                    });
                }
            } catch (error: any) {
                const { data } = error.response;
                if (data.statusCode === 404){
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: `${data.message}`,
                    });
                }
            }
        }
    };

    const signInStyles = StyleSheet.create({
        headerImage: {
            width: '70%', height: 150, resizeMode: 'contain', marginBottom: 10,
        },
        forgotPassword: {
            color: theme === 'dark' ? '#1e90ff' : '#007aff', marginTop: 15, textAlign: 'center', fontSize: 14,
        },
        passwordContainer: {
            width: '94%',
            position: 'relative',
            marginBottom: 10,
        },
        eyeIcon: {
            position: 'absolute',
            right: 10,
            top: 8,
            zIndex: 1,
        },
    });


    const handleForgotPassword = () => {
        navigation.replace('ForgotPassword');  // Navigate to the ForgotPassword screen
    };

    const styles = GlobalStyles(theme);

    return (
        <View style={styles.container}>
            <Image source={require('../../assets/logo-nna.png')} style={signInStyles.headerImage} />

            <Controller
                control={control}
                name="email"
                rules={{
                    required: 'Email is required',
                    pattern: {
                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, // Regex for email validation
                        message: 'Invalid email address',
                    },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        placeholder="Email"
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        style={[styles.input, errors.email && { borderColor: 'red' }]}
                    />
                )}
            />


            {/* Password Input Field */}
            <View style={signInStyles.passwordContainer}>
                <Controller
                    control={control}
                    name="password"
                    rules={{ required: 'Password is required' }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            placeholder="Password"
                            secureTextEntry={!passwordVisible}
                            value={value}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            style={[styles.input, errors.password && { borderColor: 'red' }]}
                        />
                    )}
                />
                <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={signInStyles.eyeIcon}>
                    <Icon name={passwordVisible ? 'eye-off' : 'eye'} size={24} color={theme === 'dark' ? '#fff' : '#333'} />
                </TouchableOpacity>
            </View>

            <ButtonComponent
                title="Login"
                onPress={handleSubmit(handleLogin)}
                buttonStyle={styles.button}
                textStyle={styles.buttonText}
            />

            <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={signInStyles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>
        </View>
    );
}
