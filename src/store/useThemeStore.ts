// src/store/useThemeStore.ts
import { create } from 'zustand';
import { Appearance } from 'react-native';

type Theme = 'light' | 'dark';

interface ThemeState {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    initializeTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
    theme: 'light',  // Default theme is light
    setTheme: (theme) => set({ theme }),
    initializeTheme: () => {
        const currentColorScheme = Appearance.getColorScheme();
        set({ theme: currentColorScheme === 'light' || currentColorScheme === 'dark' ? currentColorScheme : 'light' });
    },
}));
