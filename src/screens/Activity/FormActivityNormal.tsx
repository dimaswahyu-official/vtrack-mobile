import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    TextInput,
    Text,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { RouteProp } from "@react-navigation/native";
import { ActivityStackParamList } from "../../navigation/ActivityNavigator";

type FormActivityNormalRouteProp = RouteProp<ActivityStackParamList, 'FormActivityNormal'>;

type FormActivityNormalProps = {
    route: FormActivityNormalRouteProp;
};


export default function FormActivityNormal({ route }: FormActivityNormalProps) {
    const { item } = route.params || {};
    // State for form fields
    const [activityName, setActivityName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');

    const handleSubmit = () => {
        if (!activityName || !description || !category) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }
        Alert.alert('Success', `Activity "${activityName}" submitted!`);
        // Add your form submission logic here
    };

    console.log(item)

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Activity Form</Text>
            {/* Input for Call Plan */}
            <TextInput
                style={styles.input}
                placeholder="CallPlan Code"
                value={item.code_call_plan}
                onChangeText={setActivityName}
            />

            {/* Input for Brand Name */}
            <TextInput
                style={styles.input}
                placeholder="Brand"
                value={item.callPlanOutlet.brand}
                onChangeText={setActivityName}
            />

            {/* Input for Description */}
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
                multiline={true}
            />

            {/* Dropdown for Category */}
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={category}
                    onValueChange={(itemValue) => setCategory(itemValue)}>
                    <Picker.Item label="Select Category" value="" />
                    <Picker.Item label="Work" value="work" />
                    <Picker.Item label="Exercise" value="exercise" />
                    <Picker.Item label="Leisure" value="leisure" />
                </Picker>
            </View>

            {/* Submit Button */}
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top', // Align text to the top of the textarea
    },
    pickerContainer: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 15,
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
    button: {
        width: '100%',
        height: 50,
        backgroundColor: '#007bff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
