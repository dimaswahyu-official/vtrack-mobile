import React, {ReactNode, useEffect} from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useThemeStore } from '../store/useThemeStore'; // Assuming you're using zustand or another store for theme management
import { Appearance } from 'react-native';

interface ThemeProviderProps {
    children: ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const { theme, setTheme, initializeTheme } = useThemeStore();

    useEffect(() => {
        initializeTheme();

        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
            if (colorScheme === 'light' || colorScheme === 'dark') {
                setTheme(colorScheme);
            }
        });

        return () => subscription.remove();
    }, [initializeTheme, setTheme]);

    const navTheme = theme === 'dark' ? DarkTheme : DefaultTheme;
    navTheme.colors.background = theme === 'dark' ? '#000' : '#fff';

    return (
        <NavigationContainer theme={navTheme}>
            {children}
        </NavigationContainer>
    );
};

export default ThemeProvider;

