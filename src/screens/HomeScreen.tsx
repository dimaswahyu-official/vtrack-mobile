import React, { useEffect } from 'react';
import {StyleSheet, TouchableOpacity, View, Text, Clipboard} from 'react-native';
import ConstantService from '../services/constantService';
import useConstantStore from '../store/useConstantStore';
import { useOffline } from '../context/OfflineProvider';
import * as TaskManager from 'expo-task-manager';
import { useSQLiteContext } from 'expo-sqlite';

export default function HomeScreen() {
    const db = useSQLiteContext();
    const { setBrands, setSio, brands, sio } = useConstantStore();
    const { isOnline, isWifi } = useOffline();


    const fetchConstants = async () => {
        const getBrands = await ConstantService.getBrands();
        setBrands(getBrands.data.data);
        const getSio = await ConstantService.getSio();
        setSio(getSio.data.data);
    }

    useEffect(() => {
        if ((isOnline || isWifi) && !brands.length && !sio.length) {
            fetchConstants();
        }
    }, [isOnline, isWifi, brands, sio]);
    
    // useEffect(() => {
    //     const share = async () => {
    //         const data = await shareDatabaseFile();
    //         console.log('Data:', data);
    //     }
    //     share();
    // }, []);

  return (
    <View style={styles.container}>
      {/* <TouchableOpacity onPress={copyToClipboard}>
        <Text>Copy Link</Text>
      </TouchableOpacity>
      <Text>
        https://drive.google.com/file/d/1P4w1RgpIUUypPol5qXPG4qTPcGfE3FdW/view?usp=sharing
      </Text> */}
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
