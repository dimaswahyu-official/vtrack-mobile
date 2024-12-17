import React from 'react';
import {StyleSheet, Dimensions, View, Text} from 'react-native';
import {useOffline} from '../context/OfflineProvider';
import LottieView from 'lottie-react-native';

// Get the screen dimensions
const {width, height} = Dimensions.get('window');

const OfflineIndicator = () => {
    const {isOnline, isWifi} = useOffline();
    let animationSource: any;
    let statusText = 'online';
    let statusColor = 'green'; // Default color (online)

    if (!isOnline) {
        // <View style={{borderWidth:1,borderColor:'red',width:'100%'}}></View>
        animationSource = require('../../assets/lottie/offline.json');
        statusColor = 'red';
        statusText = 'offline'
    } else if (isOnline && !isWifi) {
        // <View style={{borderWidth:1,borderColor:'green',width:'100%'}}></View>
        animationSource = require('../../assets/lottie/online.json');
        statusColor = 'orange';
    } else {
        // <View style={{borderWidth:1,borderColor:'green',width:'100%'}}></View>
        animationSource = require('../../assets/lottie/online.json');
        statusColor = 'green';
        statusText = 'online'
    }

    return (
        <>
            <View style={styles.container}>
                <View style={[styles.line, {backgroundColor: statusColor}]}/>
                <Text style={[styles.text, {color: statusColor}]}>{statusText}</Text>
                <View style={[styles.line, {backgroundColor: statusColor}]}/>
            </View>
            {/*<View style={{*/}
            {/*    borderWidth: 1,*/}
            {/*    borderColor: statusColor,*/}
            {/*    width: '100%',*/}
            {/*    position: 'absolute',*/}
            {/*    marginTop: 55,*/}
            {/*    zIndex: 1*/}
            {/*}}></View>*/}
        </>

        // <LottieView
        //     source={animationSource}
        //     autoPlay
        //     loop
        //     style={[styles.animation, { top: height * 0.01 }]}
        // />

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
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
        position: 'absolute',
        marginTop: 2,
    },
    line: {
        flex: 1,
        height: 1,
        // backgroundColor: 'black',
    },
    text: {
        paddingHorizontal: 5,
        fontSize: 16,
        backgroundColor: '#FFFFFF',
    },
});

export default OfflineIndicator;
