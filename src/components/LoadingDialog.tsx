import React from 'react';
import { View, Text, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { useLoadingDialogStore } from '../store/useLoadingStore'; // Import the zustand store

const LoadingDialog = () => {
    const { visible, message } = useLoadingDialogStore(); // Get the loading dialog state from zustand

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
            onRequestClose={() => {}}
        >
            <View style={styles.overlay}>
                <View style={styles.dialogContainer}>
                    <ActivityIndicator size="large" color="tomato" style={styles.spinner} />
                    <Text style={styles.message}>{message}</Text>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark overlay background
    },
    dialogContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    spinner: {
        marginBottom: 10,
    },
    message: {
        fontSize: 16,
        color: '#333',
    },
});

export default LoadingDialog;
