import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {Dimensions, ScrollView, Text, StyleSheet, TouchableOpacity, View, FlatList} from "react-native";
import Colors from "../../utils/Colors";
import React, {useEffect} from "react";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import ReimburseService from "../../services/reimburseService";
import {useAuthStore} from "../../store/useAuthStore";

const {width, height} = Dimensions.get("window");


type RootStackParamList = {
    Profile: undefined;
    Reimburse: undefined;
    ReimburseDetails: undefined;
};

type ReimburseScreenProps = NativeStackScreenProps<
    RootStackParamList,
    "Reimburse",
    'ReimburseDetails'
>;

export default function ReimburseScreen({navigation}: ReimburseScreenProps) {
    const {user} = useAuthStore();

    useEffect(() => {
        // const response = ReimburseService.getReimburseBbmList(idUser)
    }, []);

    const data = [
        {id: '1', date: '2025-01-01',  status: 'Draft'},
        {id: '2', date: '2025-01-02',  status: 'Complete'},
        {id: '3', date: '2025-01-03',  status: 'Complete'},
        {id: '4', date: '2025-01-04',  status: 'Complete'},
        {id: '5', date: '2025-01-05',  status: 'Complete'},
    ];

    const checkedStatus =(data:any)=>{
        if (data.status.toLocaleLowerCase() == 'draft'){
            //show notification
            //you still have data that should be inserted on date
        }
    }

    const renderItem = ({item}:{item:any}) => (
        <View style={styles.row}>
            <Text style={styles.text}>{item.date}</Text>
            <Text style={styles.text}>{item.status}</Text>
            <Icon
                onPress={()=>navigation.navigate('ReimburseDetails')}
                name={'eye'}
                size={24}
                color={Colors.buttonBackground}
            />
        </View>
    );

    return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.greeting}>
                        Reimburse
                    </Text>

                    <TouchableOpacity style={styles.Button} onPress={() => {
                    }}>
                        <Text style={styles.buttonText}>+</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.listContainer}>
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
    listContainer: {
        paddingHorizontal: width * 0.05,
        paddingVertical: height * 0.02,
    },
    greeting: {
        fontSize: 30,
        fontWeight: "bold",
    },
    Button: {
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