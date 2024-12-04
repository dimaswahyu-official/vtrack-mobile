import { StyleSheet, Dimensions } from 'react-native';
import Colors from './Colors';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Create a function to return styles based on the theme and dimensions
const GlobalStyles = (theme: 'light' | 'dark') => {
    const currentColors = Colors[theme];

    return StyleSheet.create({
        container: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: width > 400 ? width * 0.075 : width * 0.05,
            backgroundColor: currentColors.background,
        },
        text: {
            fontSize: width > 400 ? width * 0.05 : width * 0.045,
            color: currentColors.text,
        },
        button: {
            backgroundColor: Colors.buttonBackground,
            padding: height > 700 ? height * 0.02 : height * 0.015,
            borderRadius: 8,
            width: width * 0.8,
            alignItems: 'center',
            justifyContent: 'center',
        },
        buttonText: {
            color: Colors.buttonText,
            fontSize: width > 400 ? width * 0.04 : width * 0.035,
            fontWeight: 'bold',
        },
        input: {
            height: 40,
            borderColor: currentColors.border,
            borderWidth: 1.5,
            paddingLeft: width * 0.025,
            borderRadius: 8,
            width: width - 20 ,
            marginBottom: height * 0.02,
            backgroundColor: currentColors.inputBackground,
            color: currentColors.inputText,
        },
        headerLeft: {
            marginLeft: width * 0.04,
            zIndex: 100,
            padding: 5,
        },
    });
};

export default GlobalStyles;
