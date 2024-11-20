import React, { useEffect, useRef, useState } from 'react';
import { BackHandler, Dimensions, StyleSheet, TouchableOpacity, View, Text, Image } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';

interface CameraComponentProps {
    onBack: () => void;
    onPhotoSelect: (photoUri: string | null) => void;  // Callback to send photo back
}

// Get screen dimensions
const { width, height } = Dimensions.get('window');

const CameraComponent: React.FC<CameraComponentProps> = ({ onBack, onPhotoSelect }) => {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const cameraRef = useRef<CameraView | null>(null);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

        return () => backHandler.remove();
    }, []);

    const handleBackPress = () => {
        if (onBack) {
            onBack();
            return true;
        }
        return false;
    };

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.permissionText}>We need your permission to show the camera</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.button}>
                    <Text style={styles.buttonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Toggle camera facing
    function toggleCameraFacing() {
        setFacing((current) => (current === 'back' ? 'front' : 'back'));
    }

    // Capture image
    const takePicture = async () => {
        if (cameraRef.current) {
            const photo = await cameraRef.current.takePictureAsync({ quality: 1 });
            setCapturedImage(photo?.uri || null);
            onPhotoSelect(photo?.uri || null);  // Send the photo URI back to the parent
        }
    };

    // Open image picker from gallery
    const openImagePicker = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setCapturedImage(result.assets[0].uri);
            onPhotoSelect(result.assets[0].uri);  // Send the selected photo URI back to the parent
        }
    };

    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} facing={facing} ref={cameraRef} />

            {/* Conditionally display the captured image */}
            {capturedImage && (
                <View style={styles.capturedImageContainer}>
                    <Text style={styles.capturedImageText}>Captured Image:</Text>
                    <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
                </View>
            )}

            {/* Camera controls */}
            <View style={styles.controls}>
                <TouchableOpacity style={styles.toggleButton} onPress={toggleCameraFacing}>
                    <Ionicons name="camera-reverse" size={30} color="white" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                    <Ionicons name="camera" size={50} color="white" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.galleryButton} onPress={openImagePicker}>
                    <Ionicons name="image" size={30} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'flex-start',
    },
    camera: {
        width: width,
        height: height * 0.75,
        borderRadius: 20,
        alignSelf: 'center',
        overflow: 'hidden',
    },
    controls: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 40,
        alignItems: 'center',
    },
    toggleButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 50,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    captureButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 50,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    galleryButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 50,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    permissionText: {
        fontSize: 18,
        color: 'white',
        textAlign: 'center',
        marginBottom: 20,
    },
    button: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    capturedImageContainer: {
        position: 'absolute',
        bottom: 100,
        left: 10,
        right: 10,
        alignItems: 'center',
    },
    capturedImageText: {
        color: 'white',
        fontSize: 16,
        marginBottom: 10,
    },
    capturedImage: {
        width: width * 0.8,
        height: 200,
        borderRadius: 10,
        marginBottom: 10,
    },
});

export default CameraComponent;
