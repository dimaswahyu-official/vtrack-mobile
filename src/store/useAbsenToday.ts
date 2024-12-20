import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

interface AbsenToday {
    id: number;
    userId: number;
    date: string;
    status: string;
    remarks: string;
    createdAt: string;
    updatedAt: string;
    clockIn: string;
    clockOut: string | null;
    area: string;
    region: string;
    longitudeIn: string;
    latitudeIn: string;
    longitudeOut: string;
    latitudeOut: string;
    photoIn: string;
    photoOut: string;
}

interface AbsenTodayState {
    absenToday: AbsenToday | null;
    setAbsenToday: (absenToday: AbsenToday) => void;
    clearAbsenToday: () => void;
}

const useAbsenToday = create<AbsenTodayState>((set) => ({
    absenToday: null,
    setAbsenToday: (absenToday) => {
        set({ absenToday });
        AsyncStorage.setItem('absenToday', JSON.stringify(absenToday));
    },
    clearAbsenToday: () => {
        set({ absenToday: null });
        AsyncStorage.removeItem('absenToday');
    },
}));

export default useAbsenToday;