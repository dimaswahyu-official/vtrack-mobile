import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
    id: string;
    fullName: string;
    email: string;
    photo: string;
}

interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    accessToken: string | null;
    setAuthenticated: (status: boolean) => void;
    setUser: (user: User) => void;
    setToken: (token: string) => void;
    clearAuth: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
    isAuthenticated: false,
    user: null,
    accessToken: null,
    setAuthenticated: async (status) => {
        await AsyncStorage.setItem('isAuthenticated', JSON.stringify(status));
        set({ isAuthenticated: status });
    },
    setUser: async (user) => {
        await AsyncStorage.setItem('user', JSON.stringify(user));
        set({ user });
    },
    setToken: async (accessToken) => {
        await AsyncStorage.setItem('accessToken', accessToken);
        set({ accessToken });
    },
    clearAuth: async () => {
        await AsyncStorage.removeItem('isAuthenticated');
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('accessToken');
        set({ isAuthenticated: false, user: null, accessToken: null });
    },
}));


// Load initial authentication state from AsyncStorage
const loadAuthState = async (set: any) => {
    const savedAuthState = await AsyncStorage.getItem('isAuthenticated');
    const savedUser = await AsyncStorage.getItem('user');
    const savedToken = await AsyncStorage.getItem('accessToken');
    if (savedAuthState) {
        set({ isAuthenticated: JSON.parse(savedAuthState) });
    }
    if (savedUser) {
        set({ user: JSON.parse(savedUser) });
    }
    if (savedToken) {
        set({ accessToken: savedToken });
    }
};

export { useAuthStore, loadAuthState };
