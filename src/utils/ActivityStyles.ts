import { StyleSheet, Dimensions } from 'react-native';
import Colors from './Colors';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Create a function to return styles based on the theme and dimensions
const ActivityStyles = () => {
    return StyleSheet.create({
        container: {
            flexGrow: 1,
            backgroundColor: '#f5f5f5',
        },
        image: {
            width: Dimensions.get('window').width, // Full width of the screen
            height: 200, // Adjust height as needed
        },
        title: {
            fontSize: 20,
            fontWeight: 'bold',
            marginHorizontal: 16,
            marginTop: 16,
            marginBottom: 8,
            textAlign: 'center',
        },
        cardContainer: {
            marginHorizontal: 16,
            marginTop: 8,
        },
        toggleText: {
            fontSize: 14,
            color: '#333',
            marginRight: 4, // Space between text and icon
        },
        card: {
            width: width - 40,
            backgroundColor: '#fff',
            borderRadius: 8,
            padding: 16,
            elevation: 4, // Shadow for Android
            shadowColor: '#000', // Shadow for iOS
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.2,
            shadowRadius: 4,
            position: 'relative', // Required for positioning the icon
        },
        iconButton: {
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
        },
        cardContent: {
            marginTop: 8, // Space below the toggle button
        },
        row: {
            width: '100%',
            flexDirection: 'row',

            marginBottom: 12,
            justifyContent: "space-between"
        },
        label: {
            fontSize: 16,
            fontWeight: 'bold',
            color: '#333',
            marginRight: 8,
            textTransform: 'capitalize', // Capitalize keys like "name", "age"
        },
        value: {
            fontSize: 16,
            color: '#555',
        },
        input: {
            height: height * 0.05,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 5,
            paddingHorizontal: width * 0.02,
            marginBottom: height * 0.015,
            backgroundColor: '#fff',
        },
        imageContainer: {
            flex: 1,
            position: 'relative',
            alignItems: 'center',
            backgroundColor: '#ddd',
            borderRadius: 10,
            margin: 10,
        },
        clearButton: {
            marginTop: height * 0.01,
            backgroundColor: 'red',
            padding: height * 0.01,
            borderRadius: 5,
        },
        imagePreview: {
            width: width * 0.25,
            height: width * 0.25,
            marginTop: height * 0.014,
            borderRadius: 5,
        },
        photoButton: {
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Colors.secondaryColor,
            padding: 4,
            borderRadius: 5,
            margin: 4,
        },
        containerDropdown: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: 10,
            backgroundColor: '#f9f9f9',
        },
        // label: {
        //     fontSize: 16,
        //     marginBottom: 10,
        //     color: '#333',
        // },
        dropdownButton: {
            padding: 15,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#ccc',
            backgroundColor: '#fff',
            width: '100%',
            alignItems: 'center',
        },
        buttonText: {
            fontSize: 16,
            color: '#555',
        },
        dropdown: {
            marginTop: 10,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            backgroundColor: '#fff',
            width: '100%',
        },
        optionContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 10,
            borderBottomWidth: 1,
            borderBottomColor: '#eee',
        },
        optionLabel: {
            marginHorizontal: 10,
            fontSize: 16,
            color: '#333',
        },
        customCheckbox: {
            width: 20,
            height: 20,
            borderRadius: 4,
            borderWidth: 2,
            borderColor: '#007bff',
            justifyContent: 'center',
            alignItems: 'center',
        },
        checkmark: {
            width: 10,
            height: 10,
            backgroundColor: '#fff',
            borderRadius: 2,
        },
        button: {
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Colors.buttonBackground,
            borderRadius: 10,
            padding: 6,
            marginHorizontal: 15,
            marginVertical: 10
        },
        pickerContainer: {
            width: '100%',
            height: height * 0.06,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 5,
            marginBottom: height * 0.015,
            backgroundColor: '#fff',
            justifyContent: 'center',
        },
    });
};

export default ActivityStyles;
