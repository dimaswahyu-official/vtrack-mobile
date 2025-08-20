import React, {ReactNode, useEffect} from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
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
            if (colorScheme === 'light') {
                setTheme('light');
            }
        });

        return () => subscription.remove();
    }, [initializeTheme, setTheme]);

    const navTheme = DefaultTheme;
    navTheme.colors.background = '#fff';

    return (
        <NavigationContainer theme={navTheme}>
            {children}
        </NavigationContainer>
    );
};

export default ThemeProvider;

