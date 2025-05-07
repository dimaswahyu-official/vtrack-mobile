// app/auth/login.tsx
import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TextInput, View, Image, TouchableOpacity, Dimensions} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from "react-native-toast-message";
import GlobalStyles from "../utils/GlobalStyles";
import ButtonComponent from "../components/ButtonComponent";
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from "@react-navigation/stack";
import {loadAuthState, useAuthStore} from "../store/useAuthStore";
import {useThemeStore} from "../store/useThemeStore";
import AuthServices from "../services/authService";
import {AuthStackParamList} from "../navigation/AuthNavigator";
import {useLoadingStore} from "../store/useLoadingStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";
import * as Device from "expo-device";
import Colors from "../utils/Colors";

type FormData = {
    email: string;
    password: string;
};

type NavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;
export default function LoginScreen() {
    const {setAuthenticated, setUser, setToken, user, isAuthenticated, accessToken} = useAuthStore();
    const navigation = useNavigation<NavigationProp>();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const {control, handleSubmit, formState: {errors}, setValue} = useForm<FormData>();
    const {theme} = useThemeStore();
    const {setLoading} = useLoadingStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [deviceId, setDeviceId] = useState("");
    const [deviceInfo, setDeviceInfo] = useState({});


    useEffect(() => {
        const initializeAuthState = async () => {
            setLoading(true);
            await loadAuthState(useAuthStore.setState);
            setLoading(false);
        };
        const loadCredentials = async () => {
            try {
                const savedEmail = await AsyncStorage.getItem('rememberedEmail');
                const savedPassword = await AsyncStorage.getItem('rememberedPassword');
                const savedRememberMe = await AsyncStorage.getItem('rememberMe');
                if (savedRememberMe === 'true') {
                    setEmail(savedEmail || '');
                    setValue('email', savedEmail || '');
                    setPassword(savedPassword || '');
                    setRememberMe(true);
                }
            } catch (error) {
                console.error('Failed to load credentials:', error);
            }
        };

        initializeAuthState();
        loadCredentials();
    }, [setLoading]);

    console.log(`User:${user}`, `isAuthenticated:${isAuthenticated}`, `accessToken:${accessToken}`)

    // useEffect(() => {
    //     const id = Application.getAndroidId();
    //     setDeviceId(id);
    //         const getDeviceInfo = async () => {
    //             setDeviceInfo({
    //                 brand: Device.brand,
    //                 modelName: Device.modelName,
    //                 deviceName: Device.deviceName,
    //                 osVersion: Device.osVersion,
    //                 totalMemory: Device.totalMemory
    //             });
    //         };
    //
    //         getDeviceInfo();
    // }, []);


    const handleLogin = async (data: any) => {
        const {email, password} = data;
        if (email && password) {
            try {
                setLoading(true);
                const response = await AuthServices.login(email, password);
                if (response.statusCode === 200) {
                    if (rememberMe) {
                        // Save credentials
                        await AsyncStorage.setItem('rememberedEmail', data.email);
                        await AsyncStorage.setItem('rememberedPassword', data.password);
                        await AsyncStorage.setItem('rememberMe', 'true');
                    } else {
                        // Clear credentials
                        await AsyncStorage.removeItem('rememberedEmail');
                        await AsyncStorage.removeItem('rememberedPassword');
                        await AsyncStorage.setItem('rememberMe', 'false');
                    }
                    setToken(response.data.accessToken);
                    setUser({
                        id: response.data.user.id,
                        region : response.data.user.region,
                        email: response.data.user.email,
                        fullName: response.data.user.fullname,
                        photo: response.data.user.photo,
                        roles: response.data.user.roles,
                        username: response.data.user.username,
                    });
                    setAuthenticated(true)
                    Toast.show({
                        type: 'success',
                        text1: 'Success',
                        text2: `Login Successful`,
                    });
                }
            } catch (error: any) {
                const {data} = error.response;
                if (data.statusCode === 404) {
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: `${data.message}`,
                    });
                } else {
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: `${data.message}`,
                    });
                }
            } finally {
                setLoading(false);
            }
        }
    };

    const {width, height} = Dimensions.get('window'); // Get device dimensions

    const signInStyles = StyleSheet.create({
        headerImage: {
            width: width * 0.7, // Use percentage of device width
            height: height * 0.2, // Use percentage of device height
            resizeMode: 'contain',
            marginBottom: 10,
        },
        forgotPassword: {
            color: Colors.buttonBackground,
            marginTop: height * 0.02, // Use percentage of device height
            textAlign: 'center',
            fontSize: width * 0.04, // Use percentage of device width
        },
        passwordContainer: {
            marginBottom: 10,

        },
        eyeIcon: {
            position: 'absolute',
            right: 10,
            top: 5,
            zIndex: 1,
        },
    });


    const handleForgotPassword = () => {
        navigation.replace('ForgotPassword');  // Navigate to the ForgotPassword screen
    };

    const styles = GlobalStyles(theme);

    return (
        <View style={styles.container}>
            <Image source={require('../../assets/logo-nna.png')} style={signInStyles.headerImage}/>
            {/*<View>*/}
            {/*    <Text>Device ID: {deviceId}</Text>*/}
            {/*    {Object.entries(deviceInfo).map(([key, value]) => (*/}
            {/*        <Text key={key} style={{ marginTop: 5 }}>*/}
            {/*            <Text style={{ fontWeight: "bold" }}>{key}:</Text> {value?.toString()}*/}
            {/*        </Text>*/}
            {/*    ))}*/}
            {/*</View>*/}

            <Controller
                control={control}
                name="email"
                defaultValue={email}
                rules={{
                    required: 'Email is required',
                    pattern: {
                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, // Regex for email validation
                        message: 'Invalid email address',
                    },
                }}
                render={({field: {onChange, onBlur, value}}) => (
                    <TextInput
                        placeholder="Email"
                        value={value || email}
                        onBlur={onBlur}
                        onChangeText={(text) => {
                            onChange(text); // Update react-hook-form value
                            setEmail(text); // Update local state
                        }}
                        style={[styles.input, errors.email && {borderColor: 'red'}]}
                    />
                )}
            />


            {/* Password Input Field */}
            <View style={signInStyles.passwordContainer}>
                <Controller
                    control={control}
                    name="password"
                    rules={{required: 'Password is required'}}
                    render={({field: {onChange, onBlur, value}}) => (
                        <TextInput
                            placeholder="Password"
                            secureTextEntry={!passwordVisible}
                            value={value}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            style={[styles.input, errors.password && {borderColor: 'red'}]}
                        />
                    )}
                />
                <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={signInStyles.eyeIcon}>
                    <Icon name={passwordVisible ? 'eye-off' : 'eye'} size={24}/>
                </TouchableOpacity>
            </View>

            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 20,
            }}>
                <TouchableOpacity onPress={() => setRememberMe(!rememberMe)} style={{
                    width: 20,
                    height: 20,
                    marginRight: 10,
                }}>
                    <View style={rememberMe ? {
                        width: 20,
                        height: 20,
                        alignItems: 'center',
                        backgroundColor: Colors.buttonBackground,
                        borderRadius: 5,
                    } : {
                        width: 20,
                        height: 20,
                        backgroundColor: '#fff',
                        borderWidth: 1,
                        borderColor: '#ccc',
                        borderRadius: 5,
                    }}
                    >
                        {rememberMe ? <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 10}}>
                            ✔
                        </Text> : null}
                    </View>


                </TouchableOpacity>
                <Text style={{
                    fontSize: 16,
                    color: '#333',
                }}>Remember Me</Text>
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
