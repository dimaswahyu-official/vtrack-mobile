import { StyleSheet, Dimensions } from 'react-native';
import Colors from './Colors'; // Import colors

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Create a function to return styles based on the theme and dimensions
const GlobalStyles = (theme: 'light' | 'dark') => {
    const currentColors = Colors[theme];

    return StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: width > 400 ? 30 : 20,  // Adjust padding for larger screens
            backgroundColor: currentColors.background,
        },
        text: {
            fontSize: width > 400 ? 20 : 18,  // Increase font size for wider screens
            color: currentColors.text,
        },
        button: {
            backgroundColor: Colors.buttonBackground,
            padding: height > 700 ? 15 : 12,  // Increase padding for taller screens
            borderRadius: 8,
            width: width * 0.8,  // Set width to 80% of screen width
            alignItems: 'center',
            justifyContent: 'center',
        },
        buttonText: {
            color: Colors.buttonText,
            fontSize: width > 400 ? 14 : 12,  // Adjust font size based on screen width
            fontWeight: 'bold',
        },
        input: {
            height: 40,
            borderColor: currentColors.border,
            borderWidth: 1.5,
            paddingLeft: 10,
            borderRadius: 8,
            width: width * 0.8,  // Set input width to 80% of screen width
            marginBottom: 10,
            backgroundColor: currentColors.inputBackground,
            color: currentColors.inputText,
        },
        headerLeft: {
            marginLeft: 15,
            zIndex: 100,
            padding: 5,
        },
    });
};

export default GlobalStyles;
