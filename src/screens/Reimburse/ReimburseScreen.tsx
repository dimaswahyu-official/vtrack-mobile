import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {Dimensions, ScrollView, Text, StyleSheet, TouchableOpacity, View, FlatList} from "react-native";
import Colors from "../../utils/Colors";
import React from "react";

const {width, height} = Dimensions.get("window");


type RootStackParamList = {
    Profile: undefined;
    Reimburse: undefined;
};

type ReimburseScreenProps = NativeStackScreenProps<
    RootStackParamList,
    "Reimburse"
>;

export default function ReimburseScreen({
                                            navigation,
                                        }: ReimburseScreenProps) {

    const data = [
        {id: '1', date: '2025-01-01', name: 'John Doe', status: 'Active'},
        {id: '2', date: '2025-01-02', name: 'Jane Smith', status: 'Inactive'},
        {id: '3', date: '2025-01-03', name: 'Sam Wilson', status: 'Active'},
        {id: '4', date: '2025-01-04', name: 'Alex Johnson', status: 'Pending'},
        {id: '5', date: '2025-01-05', name: 'Chris Lee', status: 'Active'},
    ];

    const renderItem = ({item}:{item:any}) => (
        <View style={styles.row}>
            <Text style={styles.text}>{item.date}</Text>
            <Text style={styles.text}>{item.name}</Text>
            <Text style={styles.text}>{item.status}</Text>
        </View>
    );

    return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.greeting}>
                        Reimburse
                    </Text>

                    <TouchableOpacity style={styles.logoutButton} onPress={() => {
                    }}>
                        <Text style={styles.buttonText}>+</Text>
                    </TouchableOpacity>
                </View>
                <View style={{paddingHorizontal:width * 0.05,
                    borderWidth:0.5,
                    borderColor:'gray',
                    paddingVertical: height * 0.01,
                    alignContent:'center'}}>
                    <FlatList
                        data={data}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                    />
                </View>
            </View>
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
    greeting: {
        fontSize: 30,
        fontWeight: "bold",
    },
    logoutButton: {
        backgroundColor: Colors.buttonBackground,
        paddingVertical: height * 0.01,
        paddingHorizontal: width * 0.05,
        borderRadius: 8,
    },
    buttonText: {
        color: "#fff",
        fontSize: width * 0.04,
    },
    // container: {
    //     flex: 1,
    //     padding: 20,
    //     backgroundColor: '#f7f7f7',
    // },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    text: {
        fontSize: 14,
        color: '#333',
    },
})