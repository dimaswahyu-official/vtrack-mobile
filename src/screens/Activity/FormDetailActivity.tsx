import {
    Alert,
    Dimensions, FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import {RouteProp} from "@react-navigation/native";
import {ActivityStackParamList} from "../../navigation/ActivityNavigator";
import {useSQLiteContext} from "expo-sqlite";
import React, {useEffect, useRef, useState} from "react";
import useConstantStore from "../../store/useConstantStore";
import {MaterialIcons} from "@expo/vector-icons";
import {formatDateWithTime} from "../../utils/DateHelper";
import {Picker} from "@react-native-picker/picker";
import Carousel from "react-native-reanimated-carousel";
import AntDesign from "@expo/vector-icons/AntDesign";
import Colors from "../../utils/Colors";
import * as ImagePicker from "expo-image-picker";

const {width, height} = Dimensions.get('window');


type FormActivityRouteProp = RouteProp<ActivityStackParamList, 'FormDetailActivity'>;

type FormActivityProps = {
    route: FormActivityRouteProp;
};

// Define the Brand type
type Brand = {
    brand: string;
    created_at: string;
    created_by: string | null;
    deleted_at: string | null;
    deleted_by: string | null;
    id: number;
    sog: string[];
    updated_at: string;
};

// Define the SioType type
type SioType = {
    sioTypeGalery: {
        id: number;
        name: string;
        photo: string;
    }[];
    id: number;
    name: string;
};

export default function FormDetailActivity({route}: FormActivityProps) {
    const db = useSQLiteContext();
    const {item} = route.params || {};
    const [userId, setUserId] = useState(1);
    const [callPlanScheduleId, setCallPlanScheduleId] = useState(1);
    const [callPlanId, setCallPlanId] = useState(1);
    const [outletId, setOutletId] = useState(1);
    const [status, setStatus] = useState(0);
    const [area, setArea] = useState('Area A');
    const [region, setRegion] = useState('Region X');
    const [brand, setBrand] = useState<Brand | null>(null);
    const [sioType, setSioType] = useState<SioType | null>(null);

    const [startTime, setStartTime] = useState('2023-01-01T10:00:00Z');
    const [endTime, setEndTime] = useState('2023-01-01T11:00:00Z');
    const [activitySio, setActivitySio] = useState<{
        activity_id: number;
        name: string;
        description: string;
        notes: string;
        photo: string
    }[]>([]);
    const [activityBrand, setActivityBrand] = useState<{
        activity_id: number;
        name: string;
        description: string;
        notes: string
    }[]>([]);
    const [activitySog, setActivitySog] = useState<{
        activity_id: number;
        name: string;
        description: string;
        notes: string
    }[]>([]);

    type Option = {
        label: string;
        value: string;
    };

    const {brands, sio} = useConstantStore();
    const [dataOffline, setDataOffline] = useState<any>({});
    const [activityPhotos, setActivityPhotos] = useState<Array<string>>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    useEffect(() => {
        setUserId(item.user_id);
        setCallPlanScheduleId(item.id);
        setCallPlanId(item.call_plan_id);
        setOutletId(item.outlet_id);
        setStatus(item.status);
        setArea(item.callPlanOutlet?.area);
        setRegion(item.callPlanOutlet?.region);
        setStartTime(item.start_time);
        setEndTime(item.end_time);
        setBrand(item.callPlanOutlet?.brand);
        setSioType(item.callPlanOutlet?.sio_type);
        setActivityPhotos(item.photo ? JSON.parse(item.photo) : []);
        if (brands.length > 0 && sio.length > 0) {
            const filteredBrand = brands.filter(b => b.brand === item.callPlanOutlet.brand);
            setBrand(filteredBrand.length > 0 ? filteredBrand[0] : {});
            const filteredSio = sio.filter(s => s.name === item.callPlanOutlet.sio_type);
            setSioType(filteredSio.length > 0 ? filteredSio[0] : {});
            if (filteredBrand.length > 0) {
                setActivityBrand(Array.from({length: filteredBrand[0].branch.length}, (_, i) => ({
                    activity_id: filteredBrand[0].id,
                    name: filteredBrand[0].branch,
                    description: '',
                    notes: ''
                })));
                setActivitySog(Array.from({length: filteredBrand[0].sog.length}, (_, i) => ({
                    activity_id: filteredBrand[0].id,
                    name: filteredBrand[0].sog[i],
                    description: '',
                    notes: ''
                })));
            }
            if (filteredSio.length > 0) {
                setActivitySio(Array.from({length: filteredSio[0].sioTypeGalery.length}, (_, i) => ({
                    activity_id: filteredSio[0].sioTypeGalery[i].id,
                    name: filteredSio[0].sioTypeGalery[i].name,
                    description: '',
                    notes: '',
                    photo: filteredSio[0].sioTypeGalery[i].photo
                })));
            }
        }
    }, [item.id]);

    // HANDLE SUBMIT
    const handleSubmit = async () => {
        const activityData = {
            user_id: userId,
            call_plan_schedule_id: callPlanScheduleId,
            call_plan_id: callPlanId,
            outlet_id: outletId,
            survey_outlet_id:"", //NEW
            program_id:"" , //NEW
            status: status,
            area: area,
            region: region,
            brand: brand?.brand || '',
            type_sio: sioType?.name || '',
            start_time: startTime || new Date().toISOString(),
            end_time: new Date().toISOString(),
            photo: JSON.stringify(activityPhotos),
            created_by: "user_creator",
            created_at: new Date().toISOString(),
            activity_sio: activitySio,
            activity_sog: activitySog,
            activity_branch: activityBrand,
            is_sync: 0,
            id_server: 0
        };
    }

        // NEW RENDER SIO>>>
        const renderSioComponent = () => {
            const [isCollapsed, setIsCollapsed] = useState(false); // State to toggle collapse

            if (!Array.isArray(activitySio)) {
                console.warn('activitySio is not an array:', activitySio);
                return null; // or return a fallback UI
            }
            return activitySio?.map((sio, index) => (
                <View style={styles.cardContainer} key={index}>
                    <View style={styles.card}>
                        {/* Toggle Button as Icon */}
                        <Text style={styles.toggleText}>
                            {sio.name}
                        </Text>
                        <TouchableOpacity
                            onPress={() => setIsCollapsed(!isCollapsed)}
                            style={styles.iconButton}
                        >
                            <MaterialIcons
                                name={isCollapsed ? 'keyboard-arrow-down' : 'keyboard-arrow-up'}
                                size={24}
                                color="#333"
                            />
                        </TouchableOpacity>
                        {!isCollapsed && (
                            <View style={styles.cardContent}>
                                {sio.photo === '' ? (
                                    <TouchableOpacity style={styles.photoButton} onPress={() => handleTakePhoto(index)}>
                                        <MaterialIcons name="camera-alt" size={24} color="#fff"/>
                                        <Text style={[styles.label, {color: 'white'}]}>Take new photo</Text>
                                    </TouchableOpacity>
                                ) : (
                                    // Show Clear Photo button if a photo exists
                                    <View style={styles.imageContainer}>
                                        <Image
                                            source={{uri: sio.photo}}
                                            style={styles.imagePreview}
                                        />
                                        <TouchableOpacity style={styles.clearButton}
                                                          onPress={() => handleClearPhoto(index)}>
                                            <MaterialIcons name="delete" size={15} color="#fff"/>
                                        </TouchableOpacity>
                                    </View>
                                )}
                                {/* Text Fields */}
                                <View style={styles.row}>
                                    <Text style={[styles.label, {alignItems: 'flex-end'}]}>Notes :</Text>
                                    <TextInput
                                        style={[styles.input, {flex: 1}]}
                                        placeholder="SIO Notes"
                                        value={sio.notes}
                                        onChangeText={(text) => {
                                            const newActivitySio = [...activitySio];
                                            newActivitySio[index].notes = text;
                                            setActivitySio(newActivitySio);
                                        }}
                                    />
                                </View>
                                <Text style={[styles.value, {fontSize: 10}]}>* Tolong isi catatan jika Komponen SIO
                                    Tidak
                                    Ada, Rusak atau Bermasalah</Text>
                            </View>
                        )}
                    </View>
                </View>
            ));
        };

        //NEW RENDER BRANDS COMPONENTS
        const renderBrandComponent = () => {
            const [isCollapsed, setIsCollapsed] = useState(false); // State to toggle collapse

            if (!Array.isArray(activityBrand)) {
                console.warn('activityBrand is not an array:', activityBrand);
                return null; // or return a fallback UI
            }
            return activityBrand?.map((brand, index) => (
                <View style={styles.cardContainer} key={index}>
                    <View style={styles.card}>
                        {/* Toggle Button as Icon */}
                        <Text style={styles.toggleText}>
                            {brand.name}
                        </Text>
                        <TouchableOpacity
                            onPress={() => setIsCollapsed(!isCollapsed)}
                            style={styles.iconButton}
                        >
                            <MaterialIcons
                                name={isCollapsed ? 'keyboard-arrow-down' : 'keyboard-arrow-up'}
                                size={24}
                                color="#333"
                            />
                        </TouchableOpacity>
                        {!isCollapsed && (
                            <View style={styles.cardContent}>
                                {/* Text Fields */}
                                <View>
                                    <Text style={[styles.label, {alignItems: 'flex-end', marginBottom: 8}]}>Total
                                        (/Bungkus)
                                        :</Text>
                                    <TextInput
                                        style={[styles.input, {flex: 1}]}
                                        placeholder="Stock (/Bungkus)"
                                        value={brand.notes}
                                        onChangeText={(text) => {
                                            const newActivityBrand = [...activityBrand];
                                            newActivityBrand[index].notes = text;
                                            setActivityBrand(newActivityBrand);
                                        }}
                                    />
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            ));
        };

        //NEW RENDER SOG COMPONENTS
        const renderSogComponent = () => {
            const [isCollapsed, setIsCollapsed] = useState(false); // State to toggle collapse

            if (!Array.isArray(activitySog)) {
                console.warn('activitySog is not an array:', activitySog);
                return null; // or return a fallback UI
            }
            return activitySog?.map((sog, index) => (
                <View style={styles.cardContainer} key={index}>
                    <View style={styles.card}>
                        {/* Toggle Button as Icon */}
                        <Text style={styles.toggleText}>
                            {sog.name}
                        </Text>
                        <TouchableOpacity
                            onPress={() => setIsCollapsed(!isCollapsed)}
                            style={styles.iconButton}
                        >
                            <MaterialIcons
                                name={isCollapsed ? 'keyboard-arrow-down' : 'keyboard-arrow-up'}
                                size={24}
                                color="#333"
                            />
                        </TouchableOpacity>
                        {!isCollapsed && (
                            <View style={styles.cardContent}>
                                {/* Text Fields */}
                                <View>
                                    <Text style={[styles.label, {alignItems: 'flex-end', marginBottom: 8}]}>Total
                                        (/Bungkus)
                                        :</Text>
                                    <TextInput
                                        style={[styles.input, {flex: 1}]}
                                        placeholder="Stock (/Bungkus)"
                                        value={sog.notes}
                                        onChangeText={(text) => {
                                            const newActivitySog = [...activitySog];
                                            newActivitySog[index].notes = text;
                                            setActivitySog(newActivitySog);
                                        }}
                                    />
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            ));
        };

        //NEW CUSTOM CHECKBOX
        const CustomCheckbox = ({isChecked, onPress}: { isChecked: any, onPress: any }) => (
            <TouchableOpacity
                style={[
                    styles.customCheckbox,
                    {backgroundColor: isChecked ? '#007bff' : '#fff'},
                ]}
                onPress={onPress}
            >
                {isChecked && <View style={styles.checkmark}/>}
            </TouchableOpacity>
        );

        //NEW OUTLET RADIUS
        const outletMultiSelect = () => {
            const [isDropdownVisible, setIsDropdownVisible] = useState(false);
            const [selectedValues, setSelectedValues] = useState<string[]>([]);
            const options: Option[] = [
                {label: '<500m FASKES (RS,PUSKESMAS,KLINIK)', value: 'option1'},
                {label: '<200m SARANA PENDIDIKAN (SEKOLAH KAMPUS PAUD DLL)', value: 'option2'},
                {label: '<200m TEMPAT BERMAIN ANAK (TAMAN,PLAYGROUND)', value: 'option3'},
                {label: '<500m TEMPAT IBADAH (MESJID,MUSHOLA,PURA,VIHARA,GEREJA,PESANTREN)', value: 'option4'},
                {label: '<500m ANGKUTAN UMUM (HALTE, TERMINAL, AIRPORT, STASIUN)', value: 'option5'},
                {label: '<500m TEMPAT KERJA (KANTOR PEMERINTAHAN)', value: 'option6'},
            ];

            const toggleSelection = (value: any) => {
                setSelectedValues((prev: any) =>
                    prev.includes(value)
                        ? prev.filter((item: any) => item !== value)
                        : [...prev, value]
                );
            };

            const renderOption = ({item}: { item: any }) => (
                <TouchableOpacity
                    style={styles.optionContainer}
                    onPress={() => toggleSelection(item.value)}
                >
                    <CustomCheckbox
                        isChecked={selectedValues.includes(item.value)}
                        onPress={() => toggleSelection(item.value)}
                    />
                    <Text style={styles.optionLabel}>{item.label}</Text>
                </TouchableOpacity>
            );

            return (
                <View style={[styles.containerDropdown, {backgroundColor: 'white'}]}>
                    <Text style={[styles.label, {marginBottom: 6}]}>Pastikan Outlet berada di jarak aman dari jarak
                        berikut
                        :</Text>
                    <TouchableOpacity
                        style={styles.dropdownButton}
                        onPress={() => setIsDropdownVisible((prev) => !prev)}
                    >
                        <Text style={styles.buttonText}>
                            {selectedValues.length > 0
                                ? `Selected: ${selectedValues.length} item(s)`
                                : 'Choose options'}
                        </Text>
                    </TouchableOpacity>

                    {isDropdownVisible && (
                        <View style={styles.dropdown}>
                            <FlatList
                                scrollEnabled={false}
                                data={options}
                                keyExtractor={(item) => item.value}
                                renderItem={renderOption}
                            />
                        </View>
                    )}
                </View>
            );
        };

        // Function to handle image press
        const handleImagePress = (item: string) => {
            setSelectedImage(item);
            setIsModalVisible(true);
        };
        const handleRemovePhoto = (index: number) => {
            const newPhotos = activityPhotos.filter((_, i) => i !== index);
            setActivityPhotos(newPhotos);
        };

        const handleTakePhoto = async (index: number) => {
            // Request camera permissions
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert('Permission required', 'Please grant permission to access the camera.');
                return;
            }

            // Launch the camera
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                quality: 1,
            });

            if (!result.canceled) {
                const newActivitySio = [...activitySio];
                newActivitySio[index].photo = result.assets[0].uri;
                setActivitySio(newActivitySio);
            }
        };

        const handleClearPhoto = (index: number) => {
            const newActivitySio = [...activitySio];
            newActivitySio[index].photo = '';
            setActivitySio(newActivitySio);
        };

        const handleTakePhotoMany = async () => {
            // Request camera permissions
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert('Permission required', 'Please grant permission to access the camera.');
                return;
            }

            // Launch the camera
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                quality: 1,
            });

            console.log('result', activityPhotos);
            if (!result.canceled) {
                setActivityPhotos([...activityPhotos, result.assets[0].uri]);
            }

            console.log('result2', activityPhotos);
        };

        console.log('activityPhotos:', activityPhotos);
        // console.log('activitySio:', activitySio);
        // console.log('activityBrand:', activityBrand);
        console.log('activitySOG:', activitySog);

        return (
            <ScrollView contentContainerStyle={styles.container}>
                {/* Full-Width Image */}
                <Image
                    source={{uri: item.callPlanOutlet.photos[0]}} // Replace with your image URL
                    style={styles.image}
                    resizeMode="cover"
                />

                {/* OUTLET INFORMATION */}
                <Text style={styles.title}>Outlet Information</Text>
                <View style={styles.cardContainer}>
                    <View style={styles.card}>
                        <View style={styles.cardContent}>
                            {/* Text Fields */}
                            <View style={styles.row}>
                                <Text style={styles.label}>Shop Name :</Text>
                                <Text style={styles.value}>{item.callPlanOutlet.name}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Kode Outlet :</Text>
                                <Text style={styles.value}>{item.callPlanOutlet.outlet_code}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Address :</Text>
                                <Text style={[styles.value, {
                                    flexShrink: 1,
                                    textAlign: 'right'
                                }]}>{item.callPlanOutlet.address_line}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Brand :</Text>
                                <Text style={styles.value}>{item.callPlanOutlet.brand}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Tipe Outlet :</Text>
                                <Text style={styles.value}>{item.callPlanOutlet.sio_type}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Regional :</Text>
                                <Text style={styles.value}>{item.callPlanOutlet.region}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Area :</Text>
                                <Text style={styles.value}>{item.callPlanOutlet.area}</Text>
                            </View>
                        </View>

                    </View>
                </View>
                <Text style={styles.title}>Materi Branding SIO</Text>

                {renderSioComponent()}
                <Text style={styles.title}>Penjualan Brand</Text>
                {renderBrandComponent()}

                <Text style={styles.title}>Selling Of Goods (SOG)</Text>
                {renderSogComponent()}

                <Text style={styles.title}>Program</Text>
                <View style={styles.cardContainer}>
                    <View style={styles.card}>
                        <View style={styles.cardContent}>
                            <View>
                                <Text style={[styles.label, {alignItems: 'flex-end', marginBottom: 8}]}>JUDUL
                                    PROGRAM</Text>
                                <Text style={styles.value}>Isi Program : ajkbsdkjandkjnaskdnan kjasnndajkndkjas
                                    ajsnjasdnkandjkan</Text>

                            </View>
                        </View>
                    </View>
                </View>

                <Text style={styles.title}>Outlet Radius</Text>
                <View style={styles.cardContainer}>
                    <View style={styles.card}>
                        <View style={styles.cardContent}>
                            {outletMultiSelect()}
                        </View>
                    </View>
                </View>
                <TouchableOpacity style={{alignItems:'center', justifyContent:'center', backgroundColor:Colors.buttonBackground, borderRadius:10,padding:6, marginHorizontal:15, marginVertical:10}} onPress={handleSubmit}>
                    <Text style={{color:Colors.buttonText, fontWeight:'bold', fontSize:20}}>Submit</Text>
                </TouchableOpacity>
            </ScrollView>
        );
    };

    const styles = StyleSheet.create({
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
            marginLeft: 10,
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
            width: '80%',
            textAlign:"center",
            height: height * 0.06,
            backgroundColor: Colors.buttonBackground,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 5,
            margin: 20,
        },
    });
