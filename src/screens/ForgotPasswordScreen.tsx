import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Appearance, Dimensions, BackHandler } from 'react-native';
import Toast from 'react-native-toast-message';
import { useForm, Controller } from 'react-hook-form';
import GlobalStyles from "../utils/GlobalStyles";
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from "@react-navigation/stack"; // Import navigation

type FormData = {
    email: string;
};

type RootStackParamList = {
    Login: undefined;
    ForgotPassword: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'ForgotPassword'>;

// Get screen dimensions
const { width, height } = Dimensions.get('window');

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const { control, handleSubmit, formState: { errors } } = useForm<FormData>();
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const navigation = useNavigation<NavigationProp>();  // Add the type here

    // Handle back press on Android
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

        return () => backHandler.remove();
    }, []);

    const handleBackPress = () => {
        navigation.navigate("Login");  // Go back when hardware back button is pressed
        return true;  // Prevent default behavior
    };

    useEffect(() => {
        const currentColorScheme = Appearance.getColorScheme();
        if (currentColorScheme === 'light' || currentColorScheme === 'dark') {
            setTheme(currentColorScheme);
        }

        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
            if (colorScheme === 'light' || colorScheme === 'dark') {
                setTheme(colorScheme);
            }
        });

        return () => subscription.remove(); // Cleanup listener on unmount
    }, []);

    const styles = GlobalStyles(theme);

    const validateEmail = (email: string) => {
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const onSubmit = async (data: FormData) => {
        try {
            // Simulate API call to send reset link
            await new Promise(resolve => setTimeout(resolve, 2000));

            Toast.show({
                type: 'success',
                text1: 'Email Sent',
                text2: 'A password reset link has been sent to your email.',
            });

        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to send email. Please try again later.',
            });
        }
    };

    return (
        <View style={styles.container}>
            <Text style={forgotPasswordStyles.headerText}>Forgot Password</Text>
            <Text style={forgotPasswordStyles.descriptionText}>
                Enter your email address below to receive a password reset link.
            </Text>

            <Controller
                control={control}
                name="email"
                rules={{
                    required: 'Email is required',
                    pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Enter a valid email address',
                    },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        placeholder="Email"
                        style={styles.input}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholderTextColor="#888"
                    />
                )}
            />
            {errors.email && (
                <Text style={forgotPasswordStyles.errorText}>{errors.email.message}</Text>
            )}

            <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                style={styles.button}
            >
                <Text style={styles.buttonText}>Send Reset Link</Text>
            </TouchableOpacity>
        </View>
    );
}

const forgotPasswordStyles = StyleSheet.create({
    errorText: {
        color: 'red',
        marginBottom: height > 700 ? 20 : 15,
        alignSelf: 'flex-start',
        fontSize: width > 400 ? 14 : 12,
        paddingHorizontal: 12,
    },
    headerText: {
        fontSize: width > 400 ? 24 : 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: height > 700 ? 20 : 10,
    },
    descriptionText: {
        fontSize: width > 400 ? 16 : 14,
        textAlign: 'center',
        marginBottom: height > 700 ? 25 : 20,
        color: '#555',
    },
});
