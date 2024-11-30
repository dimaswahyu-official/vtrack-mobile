import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { useOffline } from '../context/OfflineProvider';
import LottieView from 'lottie-react-native';

// Get the screen dimensions
const { width, height } = Dimensions.get('window');

const OfflineIndicator = () => {
    const { isOnline, isWifi } = useOffline();

    let animationSource: any;
    let statusColor = 'green'; // Default color (online)

    if (!isOnline) {
        animationSource = require('../../assets/lottie/offline.json');
        statusColor = 'red';
    } else if (isOnline && !isWifi) {
        animationSource = require('../../assets/lottie/online.json');
        statusColor = 'orange';
    } else {
        animationSource = require('../../assets/lottie/online.json');
        statusColor = 'green';
    }

    return (
        <LottieView
            source={animationSource}
            autoPlay
            loop
            style={[styles.animation, { top: height * 0.01 }]}
        />
    );
};

const styles = StyleSheet.create({
    animation: {
        position: 'absolute',
        right: width * 0.05,
        width: width * 0.1,
        height: width * 0.1,
        zIndex: 1000,
    },
});

export default OfflineIndicator;
