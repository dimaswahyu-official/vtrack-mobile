import {
    Dimensions,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Colors from "../../utils/Colors";
import React, {useState} from "react";

const {width, height} = Dimensions.get("window");


type RootStackParamList = {

    Profile: undefined;
    ReimburseDetails: undefined;
};

type ReimburseDetailsScreenProps = NativeStackScreenProps<
    RootStackParamList,
    "ReimburseDetails"
>;

export default function ReimburseDetailsScreen({navigation,}: ReimburseDetailsScreenProps) {

    const [inputValue, setInputValue] = useState('');
    const [input1, setInput1] = useState({ raw: null, formatted: '' });
    const [input2, setInput2] = useState({ raw: null, formatted: '' });


    const handleTextChange = (text: string, setInput: Function) => {
        const numericValue = text.replace(/\D/g, ''); // Remove non-numeric characters
        const formatted = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Add thousands separator
        setInput({
            raw: numericValue ? parseInt(numericValue, 10) : null, // Store raw numeric value
            formatted, // Store formatted string
        });
    };

    const checkedStatus = (data: any) => {
        if (data.status.toLocaleLowerCase() == 'draft') {
            //show notification
            //you still have data that should be inserted on date
        }
    }

    return (
        <ScrollView>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.greeting}>
                        Reimburse
                    </Text>
                </View>
                {/*KM AWAL*/}
                <View style={styles.card}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Kilometer Awal:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Masukan Kilometer Awal"
                            value={input1.formatted}
                            keyboardType={'numeric'}
                            onChangeText={(text) => handleTextChange(text, setInput1)}
                            />
                    </View>
                    <View style={styles.imageContainer}>
                        <Image
                            style={styles.image}
                            source={{uri: 'https://via.placeholder.com/200'}}>
                        </Image>
                    </View>
                </View>
                {/*KM AKHIR*/}
                <View style={styles.card}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Kilometer Akhir:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Masukan Kilometer Awal"
                            value={input2.formatted}
                            keyboardType={'numeric'}
                            onChangeText={(text) => handleTextChange(text, setInput2)}
                        />
                    </View>
                    <View style={styles.imageContainer}>
                        <Image
                            style={styles.image}
                            source={{uri: 'https://via.placeholder.com/200'}}>
                        </Image>
                    </View>
                </View>
                <View style={styles.card}>
                    <Text style={styles.label}>Jumlah Kilometer Yang Ditempuh</Text>
                    <TextInput
                        style={styles.input}
                        value={inputValue}
                        editable={false}
                        keyboardType="numeric"
                    />

                </View>
                <View>
                    <TouchableOpacity style={styles.button} onPress={() => {

                    }}>
                        <Text style={styles.buttonText}>SUBMIT</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </ScrollView>

    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: height * 0.02,
        width: "100%",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: width * 0.05,
        marginBottom: height * 0.02,
    },
    listContainer: {
        paddingHorizontal: width * 0.05,
        paddingVertical: height * 0.02,
    },
    greeting: {
        fontSize: 30,
        fontWeight: "bold",
    },
    card: {
        borderWidth: 0.5,
        borderColor: 'gray',
        borderRadius: 10,
        padding: 15,
        margin: 10,
        backgroundColor: '#fff',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        paddingHorizontal: 10,
        backgroundColor: '#f9f9f9',
    },
    imageContainer: {
        alignItems: 'center',
        marginTop: 10,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    button: {
        margin: 10,
        height: 50,
        backgroundColor: Colors.buttonBackground,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
})