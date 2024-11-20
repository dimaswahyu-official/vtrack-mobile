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
            style={[styles.animation, { top: height * 0.01 }]} // Adjust top position based on screen height
        />
    );
};

const styles = StyleSheet.create({
    animation: {
        position: 'absolute',
        right: width / 9 - 20, // Center horizontally using screen width
        width: 35,  // Set the width of the animation
        height: 35, // Set the height of the animation
        zIndex: 1000, // Ensure it's on top of other components
    },
});

export default OfflineIndicator;
