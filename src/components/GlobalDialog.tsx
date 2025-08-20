// components/GlobalDialog.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import LottieView from 'lottie-react-native';
import { useDialogStore } from '../store/useGlobalDialog';

const GlobalDialog = () => {
    const { visible, type, title, hideDialog } = useDialogStore();
    const animation = useRef<LottieView>(null);

    useEffect(() => {
        if (visible) {
            animation.current?.play();
            const timer = setTimeout(() => hideDialog(), 3000);
            return () => clearTimeout(timer);
        }
    }, [visible]);

    const source =
        type === 'success'
            ? require('../../assets/success-animation.json')
            : require('../../assets/error-animation.json');

    return (
        <Modal visible={visible} transparent onRequestClose={hideDialog}>
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <LottieView
                        ref={animation}
                        source={source}
                        style={styles.animation}
                        autoPlay
                        loop={type === 'error'}
                    />
                    <Text style={styles.title}>{title}</Text>
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
    },
    card: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
    },
    animation: {
        width: 200,
        height: 200,
    },
    title: {
        marginTop: 12,
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
});

export default GlobalDialog;
