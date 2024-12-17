import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
    
interface ConstantState {
    brands: any[];
    sio: any[];
    sog: any[];
    setBrands: (brands: any[]) => void;
    setSio: (sio: any[]) => void;
    setSog: (sog: any[]) => void;
    getBrands: () => void;
    getSio: () => void;
    getSog: () => void;
    clearConstants: () => void;
}

const useConstantStore = create<ConstantState>((set) => ({
    brands: [],
    sio: [],
    sog:[],
    setBrands: async (brands: any[]) => {
        await AsyncStorage.setItem('brands', JSON.stringify(brands));
        set({ brands });
    },
    setSog: async (sog: any[]) => {
        await AsyncStorage.setItem('sog', JSON.stringify(sog));
        set({ sog });
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
    getSog: async () => {
        const storedSog = await AsyncStorage.getItem('sog');
        set({ sog: storedSog ? JSON.parse(storedSog) : [] });
    },
    clearConstants: async () => {
        await AsyncStorage.removeItem('brands');
        await AsyncStorage.removeItem('sio');
        set({ brands: [], sio: [] });
    },
}));

export default useConstantStore;
