import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import {RouteProp, useNavigation} from '@react-navigation/native';
import {ActivityStackParamList} from '../../navigation/ActivityNavigator';
import React, {useEffect, useState} from 'react';
import useConstantStore from '../../store/useConstantStore';
import Colors from '../../utils/Colors';
import {MaterialIcons} from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {StackNavigationProp} from '@react-navigation/stack';
import ActivityStyles from '../../utils/ActivityStyles';
import {ActivitySioModel} from '../../model/ActivitySioRepository';
import {useSQLiteContext} from 'expo-sqlite';
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import {ActivityRepository} from "../../model/ActivityRepository";
import {useLoadingDialogStore} from "../../store/useLoadingStore";

type NavigationProp = StackNavigationProp<
    ActivityStackParamList,
    'FormDetailSio'
>;
type FormActivityRouteProp = RouteProp<ActivityStackParamList, 'FormDetailSio'>;
type FormActivityProps = {
    route: FormActivityRouteProp;
};

export default function FormDetailSio({route}: FormActivityProps) {
    const db = useSQLiteContext();
    const {item, activity} = route.params || {};
    const navigation = useNavigation<NavigationProp>();
    const activityStyles = ActivityStyles();
    const {showLoadingDialog, hideLoadingDialog} = useLoadingDialogStore();
    const defaultImage = 'https://via.placeholder.com/100';

    const [activitySio, setActivitySio] = useState<
        {
            id?: number;
            call_plan_schedule_id: number;
            name: string;
            description: string;
            notes: string;
            photo: string;
            photo_before: string;
            photo_after: string;
            is_sync: number
        }[]
    >([]);

    const [activitySurvey, setActivitySurvey] = useState<{
        call_plan_schedule_id?: number;
        photo_first?: string;
        photo_second?: string;
        notes_survey?: string;
    }>()

    const initializeActivitySio = (
        data: Partial<{
            id?: number;
            call_plan_schedule_id: number;
            name: string;
            description: string;
            notes: string;
            photo: string;
            photo_before: string;
            photo_after: string;
            is_sync: number;
        }>[]
    ) => {
        const initializedData = data.map((item) => ({
            id: item.id ?? 0,
            call_plan_schedule_id: item.call_plan_schedule_id ?? 0,
            name: item.name ?? '',
            description: item.description ?? '',
            notes: item.notes ?? '',
            photo: item.photo ?? '',
            photo_before: item.photo_before ?? '',
            photo_after: item.photo_after ?? '',
            is_sync: item.is_sync ?? 0,
        }));
        setActivitySio(initializedData);
    };

    const {sio} = useConstantStore();
    const [collapsedStates, setCollapsedStates] = useState<boolean[]>(
        Array(sio.length).fill(true)
    );

    const dataSioFiltered = async () => {
        if (sio.length > 0) {
            if (item.callPlanOutlet != null) {
                const filteredSio = sio.filter(
                    (s) => s.name === item.callPlanOutlet.sio_type
                );
                if (filteredSio.length > 0) {
                    setActivitySio(
                        Array.from(
                            {length: filteredSio[0].sioTypeGalery.length},
                            (_, i) => ({
                                call_plan_schedule_id: activity.call_plan_schedule_id,
                                name: filteredSio[0].sioTypeGalery[i].name,
                                description: '',
                                notes: '',
                                photo: filteredSio[0].sioTypeGalery[i].photo,
                                photo_before: '',
                                photo_after: '',
                                is_sync: 0,
                            })
                        )
                    );
                }
            } else {
                const filteredSio = sio.filter(
                    (s) => s.name === item.callPlanSurvey.sio_type
                );
                if (filteredSio.length > 0) {
                    setActivitySio(
                        Array.from(
                            {length: filteredSio[0].sioTypeGalery.length},
                            (_, i) => ({
                                call_plan_schedule_id: activity.call_plan_schedule_id,
                                name: filteredSio[0].sioTypeGalery[i].name,
                                description: '',
                                notes: '',
                                photo: filteredSio[0].sioTypeGalery[i].photo,
                                photo_before: '',
                                photo_after: '',
                                is_sync: 0,
                            })
                        )
                    );
                }
            }
        }
    };

    useEffect(() => {
        ActivitySioModel.findByCallPlanScheduleId(
            db,
            activity?.call_plan_schedule_id
        ).then((response) => {
            if (!response || response.length === 0) {
                console.info('No data found for the given schedule ID.');
                dataSioFiltered();
            } else {
                initializeActivitySio(response);
            }
        });
        ActivityRepository.findByCallPlanScheduleId(
            db,
            activity?.call_plan_schedule_id
        ).then((response) => {
            if (!response || response.length === 0) {
                console.info('No data found for the given schedule ID.');
                return
            } else {
                setActivitySurvey({
                    call_plan_schedule_id: response[0].call_plan_schedule_id,
                    photo_first: response[0]?.photo_first,
                    photo_second: response[0]?.photo_second,
                    notes_survey: response[0]?.notes_survey
                })
            }
        })

    }, [item.id]);

    if (!Array.isArray(activitySio)) {
        console.warn('activitySio is not an array:', activitySio);
        return null; // or return a fallback UI
    }

    const footer = () => {
        return (
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    marginVertical: 8,
                    alignItems: 'center',
                    padding: 8,
                }}>
                <View
                    style={{
                        width: 10,
                        height: 10,
                        borderWidth: 0.5,
                        borderRadius: 5,
                        backgroundColor: Colors.buttonBackground,
                    }}
                />
                <View
                    style={{
                        width: 50,
                        height: 2,
                        backgroundColor: 'grey',
                        marginHorizontal: 8,
                    }}
                />
                <View
                    style={{
                        width: 10,
                        height: 10,
                        borderWidth: 0.5,
                        borderRadius: 5,
                        backgroundColor: 'white',
                    }}
                />
                <View
                    style={{
                        width: 50,
                        height: 2,
                        backgroundColor: 'grey',
                        marginHorizontal: 8,
                    }}
                />
                <View
                    style={{
                        width: 10,
                        height: 10,
                        borderWidth: 0.5,
                        borderRadius: 5,
                        backgroundColor: 'white',
                    }}
                />
                <View
                    style={{
                        width: 50,
                        height: 2,
                        backgroundColor: 'grey',
                        marginHorizontal: 8,
                    }}
                />
                <View
                    style={{
                        width: 10,
                        height: 10,
                        borderWidth: 0.5,
                        borderRadius: 5,
                        backgroundColor: 'white',
                    }}
                />
            </View>
        );
    };

    const handleTakePhoto = async (index: number) => {
        try {
            showLoadingDialog("Loading...") // Show loading dialog
            // Request camera permissions
            const permissionResult =
                await ImagePicker.requestCameraPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert(
                    'Permission required',
                    'Please grant permission to access the camera.'
                );
                return;
            }

            // Launch the camera
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: false,
                quality: 1,
            });

            // if (!result.canceled) {
            // 	const newActivitySio = [...activitySio];
            // 	newActivitySio[index].photo_after = result.assets[0].uri;
            // 	setActivitySio(newActivitySio);
            // }

            if (!result.canceled) {
                // Get the file size of the original image
                const fileInfo = await FileSystem.getInfoAsync(result.assets[0].uri, {size: true});
                if (!fileInfo.exists) {
                    Alert.alert('Error', 'File does not exist.');
                    return;
                }

                let fileSizeInMB = fileInfo.size / (1024 * 1024); // Convert bytes to MB

                // Dynamically adjust compression quality to ensure the file size is below 1 MB
                let compressQuality = 0.9; // Start with 90% quality
                let compressedImage = result.assets[0].uri;

                while (fileSizeInMB >= 1 && compressQuality > 0.1) {
                    // Use the correct manipulateAsync method
                    const manipResult = await ImageManipulator.manipulateAsync(
                        result.assets[0].uri,
                        [{resize: {width: 800}}], // Resize the image to a width of 800px
                        {compress: compressQuality, format: ImageManipulator.SaveFormat.JPEG}
                    );

                    // Check the new file size
                    const newFileInfo = await FileSystem.getInfoAsync(manipResult.uri, {size: true});
                    if (!newFileInfo.exists) {
                        Alert.alert('Error', 'Compressed file does not exist.');
                        return;
                    }

                    fileSizeInMB = newFileInfo.size / (1024 * 1024);

                    // Reduce quality for the next iteration
                    compressQuality -= 0.1;

                    // Update the compressed image URI
                    compressedImage = manipResult.uri;
                }

                if (fileSizeInMB >= 1) {
                    Alert.alert('Warning', 'Unable to compress the image below 2 MB.');
                } else {
                    const newActivitySio = [...activitySio];
                    newActivitySio[index].photo_after = compressedImage;
                    setActivitySio(newActivitySio);
                }
            }

        } catch (error) {
            console.error('Error handling activity:', error);
            Alert.alert('Error', error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
           hideLoadingDialog()
        }

    };

    const handleClearPhoto = (index: number) => {
        const newActivitySio = [...activitySio];
        newActivitySio[index].photo_after = '';
        setActivitySio(newActivitySio);
    };

    const handleTakePhotoBefore = async (index: number) => {
        try {
            showLoadingDialog("Loading...")
            // Request camera permissions
            const permissionResult =
                await ImagePicker.requestCameraPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert(
                    'Permission required',
                    'Please grant permission to access the camera.'
                );
                return;
            }

            // Launch the camera
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: false,
                quality: 1,
            });

            // if (!result.canceled) {
            // 	const newActivitySio = [...activitySio];
            // 	newActivitySio[index].photo_before = result.assets[0].uri;
            // 	setActivitySio(newActivitySio);
            // }

            if (!result.canceled) {
                // Get the file size of the original image
                const fileInfo = await FileSystem.getInfoAsync(result.assets[0].uri, {size: true});
                if (!fileInfo.exists) {
                    Alert.alert('Error', 'File does not exist.');
                    return;
                }

                let fileSizeInMB = fileInfo.size / (1024 * 1024); // Convert bytes to MB

                // Dynamically adjust compression quality to ensure the file size is below 1 MB
                let compressQuality = 0.9; // Start with 90% quality
                let compressedImage = result.assets[0].uri;

                while (fileSizeInMB >= 1 && compressQuality > 0.1) {
                    // Use the correct manipulateAsync method
                    const manipResult = await ImageManipulator.manipulateAsync(
                        result.assets[0].uri,
                        [{resize: {width: 800}}], // Resize the image to a width of 800px
                        {compress: compressQuality, format: ImageManipulator.SaveFormat.JPEG}
                    );

                    // Check the new file size
                    const newFileInfo = await FileSystem.getInfoAsync(manipResult.uri, {size: true});
                    if (!newFileInfo.exists) {
                        Alert.alert('Error', 'Compressed file does not exist.');
                        return;
                    }

                    fileSizeInMB = newFileInfo.size / (1024 * 1024);

                    // Reduce quality for the next iteration
                    compressQuality -= 0.1;

                    // Update the compressed image URI
                    compressedImage = manipResult.uri;
                }

                if (fileSizeInMB >= 1) {
                    Alert.alert('Warning', 'Unable to compress the image below 2 MB.');
                } else {
                    const newActivitySio = [...activitySio];
                    newActivitySio[index].photo_before = compressedImage;
                    setActivitySio(newActivitySio);
                }
            }
        } catch (error) {
            console.error('Error handling activity:', error);
            Alert.alert('Error', error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
            hideLoadingDialog()
        }

    };

    const handleClearPhotoBefore = (index: number) => {
        const newActivitySio = [...activitySio];
        newActivitySio[index].photo_before = '';
        setActivitySio(newActivitySio);
    };

    const photoSurveyFirst = async () => {
        try {
        showLoadingDialog("Loading...")
            // Request camera permissions
            const permissionResult =
                await ImagePicker.requestCameraPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert(
                    'Permission required',
                    'Please grant permission to access the camera.'
                );
                return;
            }

            // Launch the camera
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: false,
                quality: 1,
            });

            if (!result.canceled) {
                // Get the file size of the original image
                const fileInfo = await FileSystem.getInfoAsync(result.assets[0].uri, {size: true});
                if (!fileInfo.exists) {
                    Alert.alert('Error', 'File does not exist.');
                    return;
                }

                let fileSizeInMB = fileInfo.size / (1024 * 1024); // Convert bytes to MB

                // Dynamically adjust compression quality to ensure the file size is below 1 MB
                let compressQuality = 0.9; // Start with 90% quality
                let compressedImage = result.assets[0].uri;

                while (fileSizeInMB >= 1 && compressQuality > 0.1) {
                    // Use the correct manipulateAsync method
                    const manipResult = await ImageManipulator.manipulateAsync(
                        result.assets[0].uri,
                        [{resize: {width: 800}}], // Resize the image to a width of 800px
                        {compress: compressQuality, format: ImageManipulator.SaveFormat.JPEG}
                    );

                    // Check the new file size
                    const newFileInfo = await FileSystem.getInfoAsync(manipResult.uri, {size: true});
                    if (!newFileInfo.exists) {
                        Alert.alert('Error', 'Compressed file does not exist.');
                        return;
                    }

                    fileSizeInMB = newFileInfo.size / (1024 * 1024);

                    // Reduce quality for the next iteration
                    compressQuality -= 0.1;

                    // Update the compressed image URI
                    compressedImage = manipResult.uri;
                }

                if (fileSizeInMB >= 1) {
                    Alert.alert('Warning', 'Unable to compress the image below 2 MB.');
                } else {
                    const newActivitySurvey = {...activitySurvey};
                    newActivitySurvey.photo_first = compressedImage;
                    setActivitySurvey(newActivitySurvey);
                }
            }

        } catch (error) {
            console.error('Error handling activity:', error);
            Alert.alert('Error', error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
            hideLoadingDialog()
        }

    };

    const clearSurveyFirst = () => {
        const newActivitySurvey = {...activitySurvey};
        newActivitySurvey.photo_first = '';
        setActivitySurvey(newActivitySurvey);
    };

    const photoSurveySecond = async () => {
        try {
          showLoadingDialog("Loading...")
            // Request camera permissions
            const permissionResult =
                await ImagePicker.requestCameraPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert(
                    'Permission required',
                    'Please grant permission to access the camera.'
                );
                return;
            }

            // Launch the camera
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: false,
                quality: 1,
            });

            if (!result.canceled) {
                // Get the file size of the original image
                const fileInfo = await FileSystem.getInfoAsync(result.assets[0].uri, {size: true});
                if (!fileInfo.exists) {
                    Alert.alert('Error', 'File does not exist.');
                    return;
                }

                let fileSizeInMB = fileInfo.size / (1024 * 1024); // Convert bytes to MB

                // Dynamically adjust compression quality to ensure the file size is below 1 MB
                let compressQuality = 0.9; // Start with 90% quality
                let compressedImage = result.assets[0].uri;

                while (fileSizeInMB >= 1 && compressQuality > 0.1) {
                    // Use the correct manipulateAsync method
                    const manipResult = await ImageManipulator.manipulateAsync(
                        result.assets[0].uri,
                        [{resize: {width: 800}}], // Resize the image to a width of 800px
                        {compress: compressQuality, format: ImageManipulator.SaveFormat.JPEG}
                    );

                    // Check the new file size
                    const newFileInfo = await FileSystem.getInfoAsync(manipResult.uri, {size: true});
                    if (!newFileInfo.exists) {
                        Alert.alert('Error', 'Compressed file does not exist.');
                        return;
                    }

                    fileSizeInMB = newFileInfo.size / (1024 * 1024);

                    // Reduce quality for the next iteration
                    compressQuality -= 0.1;

                    // Update the compressed image URI
                    compressedImage = manipResult.uri;
                }

                if (fileSizeInMB >= 1) {
                    Alert.alert('Warning', 'Unable to compress the image below 2 MB.');
                } else {
                    const newActivitySurvey = {...activitySurvey};
                    newActivitySurvey.photo_second = compressedImage;
                    setActivitySurvey(newActivitySurvey);
                }
            }

        } catch (error) {
            console.error('Error handling activity:', error);
            Alert.alert('Error', error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
           hideLoadingDialog()
        }

    };

    const clearSurveySecond = () => {
        const newActivitySurvey = {...activitySurvey};
        newActivitySurvey.photo_second = '';
        setActivitySurvey(newActivitySurvey);
    };

    const insertSioToSqlite = async (data: any) => {
        try {
            data.forEach((sio: any) => {
                if (sio.id) {
                    ActivitySioModel.update(db, sio);
                } else {
                    ActivitySioModel.create(db, sio);
                }
            });

        } catch (error) {
            console.error('Error inserting sio:', error);
            Alert.alert('Error', 'Failed to save sio. Please try again.');
        }
    };

    const updateSurveyToSqlite = async (data: any) => {
        try {
            ActivityRepository.update(db, data)
        } catch (error) {
            console.error('Error inserting sio:', error);
            Alert.alert('Error', 'Failed to save sio. Please try again.');
        }
    };

    const goToFormDetailProgram = () => {
        if (item.type === 1) {
            updateSurveyToSqlite(activitySurvey).then((survey) => {
                navigation.navigate('FormDetailProgram', {item, activity});
            });
        } else {
            insertSioToSqlite(activitySio);
            navigation.navigate('FormDetailProgram', {item, activity});
        }
    };

    const toggleCollapse = (index: number) => {
        setCollapsedStates((prevStates) => {
            const newStates = [...prevStates];
            newStates[index] = !newStates[index];
            return newStates;
        });
    };

    const areAllPhotosTaken = (activitySio: any) => {
        return activitySio.every(
            (sio: any) => sio.photo_before && sio.photo_after
        );
    };

    return (
        <ScrollView contentContainerStyle={activityStyles.container}>
            <Text style={activityStyles.title}>Foto Outlet Baru</Text>
            {activity?.photo && (
                <Image
                    source={{uri: activity?.photo}} // Replace with your image URL
                    style={activityStyles.image}
                    resizeMode="cover"
                />
            )}
            {/*ini tambahin buat survey kalo dia type = 1*/}
            {item.type === 1 ? <>
                <Text style={activityStyles.title}>FOTO SURVEY OUTLET</Text>
                <View style={styles.row}>
                    {/* First Picture Section */}
                    <View style={styles.column}>
                        <Image
                            source={{
                                uri: activitySurvey?.photo_first||defaultImage,
                            }}
                            style={styles.image}
                        />
                        {activitySurvey?.photo_first === '' ? (
                            <>
                                <Text style={styles.text}>
                                    Foto 1
                                </Text>
                                <TouchableOpacity
                                    style={[activityStyles.photoButton, {width: '80%'}]}
                                    onPress={() =>
                                        photoSurveyFirst()
                                    }>
                                    <MaterialIcons
                                        name="camera-alt"
                                        size={24}
                                        color="#fff"
                                    />
                                    <Text
                                        style={[
                                            activityStyles.label,
                                            {color: 'white'},
                                        ]}>
                                        new photo
                                    </Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <Text style={styles.text}>
                                    Foto 1
                                </Text>
                                <TouchableOpacity
                                    style={activityStyles.clearButton}
                                    onPress={() =>
                                        clearSurveyFirst()
                                    }>
                                    <MaterialIcons
                                        name="delete"
                                        size={15}
                                        color="#fff"
                                    />
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                    <View style={styles.divider}/>
                    {/* Second Picture Section */}
                    <View style={styles.column}>
                        <Image
                            source={{
                                uri: activitySurvey?.photo_second||defaultImage,
                            }}
                            style={styles.image}
                        />
                        {activitySurvey?.photo_second === '' ? (
                            <>
                                <Text style={styles.text}>
                                    Foto 2
                                </Text>
                                <TouchableOpacity
                                    style={[activityStyles.photoButton, {width: '80%'}]}
                                    onPress={() =>
                                        photoSurveySecond()
                                    }>
                                    <MaterialIcons
                                        name="camera-alt"
                                        size={24}
                                        color="#fff"
                                    />
                                    <Text
                                        style={[
                                            activityStyles.label,
                                            {color: 'white'},
                                        ]}>
                                        new photo
                                    </Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <Text style={styles.text}>
                                    Foto 2
                                </Text>
                                <TouchableOpacity
                                    style={activityStyles.clearButton}
                                    onPress={() =>
                                        clearSurveySecond()
                                    }>
                                    <MaterialIcons
                                        name="delete"
                                        size={15}
                                        color="#fff"
                                    />
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
                {/* Text Fields */}
                <View style={[activityStyles.row, {marginTop: 12, paddingHorizontal: 10}]}>
                    <Text
                        style={[
                            activityStyles.label,
                            {alignItems: 'flex-end'},
                        ]}>
                        Notes :
                    </Text>
                    <TextInput
                        style={[activityStyles.input, {flex: 1}]}
                        placeholder="Notes"
                        value={activitySurvey?.notes_survey}
                        onChangeText={(text) => {
                            const newActivitySurvey = {...activitySurvey};
                            newActivitySurvey.notes_survey = text;
                            setActivitySurvey(newActivitySurvey);
                        }}
                    />
                </View>
            </> : <>
                <Text style={activityStyles.title}>Materi Branding SIO</Text>
                {activitySio?.map((sio, index) => (
                    <View
                        key={index}
                        // onPress={() => toggleCollapse(index)}
                        // activeOpacity={0.8}
                        style={activityStyles.cardContainer}>
                        <View style={activityStyles.card}>
                            {/* Toggle Button as Icon */}
                            <Text style={activityStyles.toggleText}>
                                {sio.name ?? ''}
                            </Text>
                            <TouchableOpacity
                                onPress={() => toggleCollapse(index)}
                                style={styles.iconButton}>
                                <MaterialIcons
                                    name={
                                        collapsedStates[index]
                                            ? 'keyboard-arrow-down'
                                            : 'keyboard-arrow-up'
                                    }
                                    size={24}
                                    color="#333"
                                />
                            </TouchableOpacity>
                            {!collapsedStates[index] && (
                                <View style={activityStyles.cardContent}>
                                    <View style={styles.column}>
                                        <Image
                                            source={{uri: sio.photo || defaultImage}}
                                            style={styles.image}
                                        />
                                        <Text style={styles.text}>Contoh</Text>
                                    </View>
                                    <View style={styles.row}>
                                        {/* First Picture Section */}
                                        <View style={styles.column}>
                                            <Image
                                                source={{
                                                    uri: sio.photo_before || defaultImage,
                                                }}
                                                style={styles.image}
                                            />
                                            {sio.photo_before === '' ? (
                                                <>
                                                    <Text style={styles.text}>
                                                        Foto Sebelum
                                                    </Text>
                                                    <TouchableOpacity
                                                        style={[activityStyles.photoButton]}
                                                        onPress={() =>
                                                            handleTakePhotoBefore(index)
                                                        }>
                                                        <MaterialIcons
                                                            name="camera-alt"
                                                            size={24}
                                                            color="#fff"
                                                        />
                                                        <Text
                                                            style={[
                                                                activityStyles.label,
                                                                {color: 'white'},
                                                            ]}>
                                                            new photo
                                                        </Text>
                                                    </TouchableOpacity>
                                                </>
                                            ) : (
                                                <>
                                                    <Text style={styles.text}>
                                                        Foto Sebelum
                                                    </Text>
                                                    <TouchableOpacity
                                                        style={activityStyles.clearButton}
                                                        onPress={() =>
                                                            handleClearPhotoBefore(index)
                                                        }>
                                                        <MaterialIcons
                                                            name="delete"
                                                            size={15}
                                                            color="#fff"
                                                        />
                                                    </TouchableOpacity>
                                                </>
                                            )}
                                        </View>
                                        <View style={styles.divider}/>
                                        {/* Second Picture Section */}
                                        <View style={styles.column}>
                                            <Image
                                                source={{
                                                    uri: sio.photo_after || defaultImage,
                                                }}
                                                style={styles.image}
                                            />
                                            {sio.photo_after === '' ? (
                                                <>
                                                    <Text style={styles.text}>
                                                        Foto Sesudah
                                                    </Text>
                                                    <TouchableOpacity
                                                        style={[activityStyles.photoButton]}
                                                        onPress={() => handleTakePhoto(index)}>
                                                        <MaterialIcons
                                                            name="camera-alt"
                                                            size={24}
                                                            color="#fff"
                                                        />
                                                        <Text
                                                            style={[
                                                                activityStyles.label,
                                                                {color: 'white'},
                                                            ]}>
                                                            new photo
                                                        </Text>
                                                    </TouchableOpacity>
                                                </>
                                            ) : (
                                                <>
                                                    <Text style={styles.text}>
                                                        Foto Sesudah
                                                    </Text>
                                                    <TouchableOpacity
                                                        style={activityStyles.clearButton}
                                                        onPress={() => handleClearPhoto(index)}>
                                                        <MaterialIcons
                                                            name="delete"
                                                            size={15}
                                                            color="#fff"
                                                        />
                                                    </TouchableOpacity>
                                                </>
                                            )}
                                        </View>
                                    </View>

                                    {/* Text Fields */}
                                    <View style={[activityStyles.row, {marginTop: 12}]}>
                                        <Text
                                            style={[
                                                activityStyles.label,
                                                {alignItems: 'flex-end'},
                                            ]}>
                                            Notes :
                                        </Text>
                                        <TextInput
                                            style={[activityStyles.input, {flex: 1}]}
                                            placeholder="SIO Notes"
                                            value={sio.notes}
                                            onChangeText={(text) => {
                                                const newActivitySio = [...activitySio];
                                                newActivitySio[index].notes = text;
                                                setActivitySio(newActivitySio);
                                            }}
                                        />
                                    </View>
                                    <Text style={[activityStyles.value, {fontSize: 10}]}>
                                        * Tolong isi catatan jika Komponen SIO Tidak Ada,
                                        Rusak atau Bermasalah
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                ))}
            </>}

            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    padding: 16,
                }}>
                <TouchableOpacity
                    style={{
                        flex: 1,
                        padding: 12,
                        borderRadius: 8,
                        alignItems: 'center',
                        marginHorizontal: 8,
                        backgroundColor: Colors.secondaryColor,
                    }}
                    onPress={() => navigation.goBack()}>
                    <Text
                        style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>
                        Back
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{
                        flex: 1,
                        padding: 12,
                        borderRadius: 8,
                        alignItems: 'center',
                        marginHorizontal: 8,
                        backgroundColor: Colors.buttonBackground,
                    }}
                    onPress={() => {
                        if(item.type===1) {
                            if (activitySurvey?.photo_first == '') {
                                alert('Tolong Lengkapi Seluruh data photo survey');
                            } else {
                                goToFormDetailProgram();
                            }

                        }else {
                            if (areAllPhotosTaken(activitySio)) {
                                goToFormDetailProgram();
                            } else {
                                alert('Tolong Lengkapi Seluruh data photo');
                            }
                        }
                    }}>
                    <Text
                        style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>
                        Next
                    </Text>
                </TouchableOpacity>
            </View>
            {footer()}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        margin: 10,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    column: {
        flex: 1,
        alignItems: 'center',
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginBottom: 5,
    },
    text: {
        fontSize: 14,
        color: '#333',
    },
    divider: {
        width: 1,
        backgroundColor: '#ccc',
        height: '100%',
        marginHorizontal: 10,
    },

    iconButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 9999,
        width: 40,
        height: 40,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
