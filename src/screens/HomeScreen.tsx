import React, { useEffect, useState } from 'react';
import {StyleSheet, TouchableOpacity, View, Text, Clipboard} from 'react-native';
import ConstantService from '../services/constantService';
import useConstantStore from '../store/useConstantStore';
import { useOffline } from '../context/OfflineProvider';
import { useSQLiteContext } from 'expo-sqlite';
import { countSyncedActivities, countNotSyncedActivities } from '../model/activityModel';

export default function HomeScreen() {
    const db = useSQLiteContext();
    const { setBrands, setSio, brands, sio } = useConstantStore();
    const { isOnline, isWifi } = useOffline();
    
    // State to track sync status and counts
    const [syncStatus, setSyncStatus] = useState<string>('');
    const [syncedCount, setSyncedCount] = useState<number>(0);
    const [notSyncedCount, setNotSyncedCount] = useState<number>(0);

    const fetchConstants = async () => {
        setSyncStatus('syncing');
        try {
            const getBrands = await ConstantService.getBrands();
            setBrands(getBrands.data.data);
            const getSio = await ConstantService.getSio();
            setSio(getSio.data.data);
            setSyncStatus('synced');
        } catch (error) {
            console.error('Error fetching constants:', error);
            setSyncStatus('not synced');
        }
    }

    const fetchActivityCounts = async () => {
        try {
            const syncedQuery = await countSyncedActivities(db);
            setSyncedCount(syncedQuery);
            const notSyncedQuery = await countNotSyncedActivities(db);
            setNotSyncedCount(notSyncedQuery);
        } catch (error) {
            console.error('Error fetching activity counts:', error);
        }
    }

    useEffect(() => {
        if ((isOnline || isWifi) && !brands.length && !sio.length) {
            fetchConstants();
        }
        fetchActivityCounts();
    }, [isOnline, isWifi, brands, sio]);

  return (
    <View style={styles.container}>
        <Text style={styles.title}>Data Sync Dashboard</Text>
        <View style={styles.statusContainer}>
            <Text style={styles.syncStatus}>
                Sync Status: {syncStatus}
            </Text>
            <Text style={styles.countText}>
                Synced Activities: {syncedCount}
            </Text>
            <Text style={styles.countText}>
                Not Synced Activities: {notSyncedCount}
            </Text>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f5f5f5', // Light background for better contrast
      padding: 20,
  },
  title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
  },
  statusContainer: {
      backgroundColor: '#fff', // White background for the status box
      borderRadius: 10,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: {
          width: 0,
          height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5, // For Android shadow
      width: '100%', // Full width for the status box
      alignItems: 'center',
  },
  syncStatus: {
      fontSize: 18,
      marginBottom: 10,
  },
  countText: {
      fontSize: 16,
      marginVertical: 5,
  },
});
