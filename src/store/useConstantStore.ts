import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
    
interface ConstantState {
    brands: any[];
    sio: any[];
    setBrands: (brands: any[]) => void;
    setSio: (sio: any[]) => void;
    getBrands: () => void;
    getSio: () => void;
    clearConstants: () => void;
}

const useConstantStore = create<ConstantState>((set) => ({
    brands: [],
    sio: [],
    setBrands: async (brands: any[]) => {
        await AsyncStorage.setItem('brands', JSON.stringify(brands));
        set({ brands });
    },
    setSio: async (sio: any[]) => {
        await AsyncStorage.setItem('sio', JSON.stringify(sio));
        set({ sio });
    },
    getBrands: async () => {
        const storedBrands = await AsyncStorage.getItem('brands');
        set({ brands: storedBrands ? JSON.parse(storedBrands) : [] });
    },
    getSio: async () => {
        const storedSio = await AsyncStorage.getItem('sio');
        set({ sio: storedSio ? JSON.parse(storedSio) : [] });
    },
    clearConstants: async () => {
        await AsyncStorage.removeItem('brands');
        await AsyncStorage.removeItem('sio');
        set({ brands: [], sio: [] });
    },
}));

export default useConstantStore;
