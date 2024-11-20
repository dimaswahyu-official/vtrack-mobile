import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import {useThemeStore} from "../../store/useThemeStore";
import GlobalStyles from "../../utils/GlobalStyles";
import Colors from "../../utils/Colors";
import UserProfileService from "../../services/userProfileService";
import {useAuthStore} from "../../store/useAuthStore";
import {useLoadingStore} from "../../store/useLoadingStore";
import Toast from "react-native-toast-message";
import {useOffline} from "../../context/OfflineProvider";

type RootStackParamList = {
    Profile: undefined;
    UpdateProfile: { profile: { name: string; email: string; photo: string } };
};

type UpdateProfileScreenProps = NativeStackScreenProps<
    RootStackParamList,
    'UpdateProfile'
>;

export default function UpdateProfileForm({route, navigation}: UpdateProfileScreenProps) {
    const { theme } = useThemeStore();
    const { isOnline, isWifi } = useOffline();
    const { setLoading } = useLoadingStore();
    const { user } = useAuthStore();
    const { profile } = route.params;
    const [name, setName] = useState(profile.name);
    const [email, setEmail] = useState(profile.email);
    const [photo, setPhoto] = useState<any | null>(null);
    const [photoExist, setPhotoExist] = useState(profile.photo);
    const [isDisabled, setIsDisabled] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(true);
        } else {
            setLoading(false);
        }
    }, [user, setLoading]);
    // Check for changes whenever input values change
    useEffect(() => {
        const hasChanges =
            name !== profile.name || email !== profile.email || photoExist !== profile.photo;
        setIsDisabled(!hasChanges); // Disable button if no changes
    }, [name, email, photoExist, profile]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const id = user?.id || '';
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);

            // If there is a photo, handle the file
            if (photo) {
                const fetchImage = await fetch(photo.uri);
                const blob = await fetchImage.blob();

                // @ts-ignore
                formData.append('file', {
                    uri: photo.uri,
                    type: blob.type || 'image/jpeg',
                    name: photo.fileName || 'image.jpg',
                });
            }

            // Call the updateProfile method and send the FormData
            const response = await UserProfileService.updateProfile(id, formData);

            // Handle the response
            if (response.statusCode === 200) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: `Update Successful`,
                });
                useAuthStore.getState().setUser({
                    id,
                    fullName: response.data.fullname,
                    email: response.data.email,
                    photo: response.data.photo,
                });
                // Optionally navigate back or refresh the profile
                // navigation.goBack();
            } else {
                Alert.alert('Error', response.message || 'Failed to update profile');
                console.error('Update Error:', response);
            }
        } catch (error: any) {
            // Handle errors
            const { data } = error.response || {};
            if (data?.statusCode === 404) {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: `${data.message}`,
                });
            } else {
                Alert.alert('Error', 'An unexpected error occurred while updating the profile');
                console.error(error.response);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChoosePhoto = async () => {
        const permissionResult =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert(
                'Permission required',
                'Please grant permission to access the photo library.'
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setPhoto(result.assets[0]);
            setPhotoExist(result.assets[0].uri); // Use the captured image URI
        }
    };

    const handleTakePhoto = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert(
                'Permission required',
                'Please grant permission to access the camera.'
            );
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setPhoto(result.assets[0]);
            setPhotoExist(result.assets[0].uri);
        }
    };

    const globalStyles = GlobalStyles(theme);

    return (
        <View style={styles.container}>
            <Image source={{ uri: photoExist }} style={styles.photo} />
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={handleTakePhoto} style={styles.iconButton}>
                    <Ionicons name="camera" size={24} color="#fff" />
                    <Text style={styles.iconButtonText}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleChoosePhoto} style={styles.iconButton}>
                    <Ionicons name="images" size={24} color="#fff" />
                    <Text style={styles.iconButtonText}>Gallery</Text>
                </TouchableOpacity>
            </View>
            <TextInput
                style={globalStyles.input}
                value={name}
                onChangeText={setName}
                placeholder="Name"
            />
            <TextInput
                style={globalStyles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                keyboardType="email-address"
            />
            <TouchableOpacity
                onPress={handleSave}
                style={[
                    globalStyles.button,
                    isDisabled && styles.saveButtonDisabled,
                ]}
                disabled={isDisabled}
            >
                <Text style={styles.saveButtonText}>
                    {isDisabled ? 'No Changes' : 'Save'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 20,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    photo: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 20,
        backgroundColor: '#f0f0f0',
    },
    buttonContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    iconButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.buttonBackground,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    iconButtonText: {
        color: Colors.buttonText,
        fontSize: 16,
        marginLeft: 8,
    },
    saveButton: {
        width: '100%',
        paddingVertical: 15,
        backgroundColor: Colors.buttonBackground,
        borderRadius: 5,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        backgroundColor: '#ccc',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
