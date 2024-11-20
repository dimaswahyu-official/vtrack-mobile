import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import NetInfo from '@react-native-community/netinfo';

// Define the shape of the context
interface OfflineContextType {
    isOnline: boolean;
    isWifi: boolean;
}

// Define the type for the provider props
interface OfflineProviderProps {
    children: ReactNode;
}

// Create the context
const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

// Create the provider component
export const OfflineProvider: React.FC<OfflineProviderProps> = ({ children }) => {
    const [isOnline, setIsOnline] = useState(false);
    const [isWifi, setIsWifi] = useState(false);

    // Listen for network status changes
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsOnline(state.isConnected ?? false);
            setIsWifi(state.isWifiEnabled ?? false);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <OfflineContext.Provider value={{ isOnline, isWifi }}>
            {children}
        </OfflineContext.Provider>
    );
};

// Custom hook to use the offline context
export const useOffline = (): OfflineContextType => {
    const context = useContext(OfflineContext);
    if (!context) {
        throw new Error('useOffline must be used within an OfflineProvider');
    }
    return context;
};
