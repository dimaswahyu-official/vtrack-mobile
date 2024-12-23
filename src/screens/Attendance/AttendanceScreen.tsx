import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Dimensions,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useThemeStore } from "../../store/useThemeStore";
import Colors from "../../utils/Colors";
import { useAuthStore } from "../../store/useAuthStore";
import { useLoadingStore } from "../../store/useLoadingStore";
import Toast from "react-native-toast-message";
import { useOffline } from "../../context/OfflineProvider";
import useConstantStore from "../../store/useConstantStore";
import moment from "moment";
import * as Location from "expo-location";
import AbsenService from "../../services/absenService";
import useAbsenToday from "../../store/useAbsenToday";

const { width, height } = Dimensions.get("window");

type RootStackParamList = {
  Profile: undefined;
  Attendance: { profile: { name: string; email: string; photo: string } };
};

type AttendanceScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Attendance"
>;

export default function AttendanceScreen({
  route,
  navigation,
}: AttendanceScreenProps) {
  const { theme } = useThemeStore();
  const { clearAuth, user } = useAuthStore();
  const { clearConstants } = useConstantStore();
  const { absenToday, setAbsenToday, clearAbsenToday } = useAbsenToday();
  const { isOnline, isWifi } = useOffline();
  const { setLoading } = useLoadingStore();
  const { profile } = route.params;
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [photo, setPhoto] = useState<any | null>(null);
  const [photoExist, setPhotoExist] = useState(profile.photo);
  const [isDisabled, setIsDisabled] = useState(true);
  const date = moment().format("l");
  const time = moment().format("LT");
  const [displayCurrentAddress, setDisplayCurrentAddress] = useState(
    "Location Loading....."
  );
  const [displayLongLat, setDisplayLongLat] = useState(
    "Detail Location is Fetching....."
  );
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locationServicesEnabled, setLocationServicesEnabled] = useState(false);

  useEffect(() => {
    const checkTodayAttendance = async () => {
      try {
        if (!user) {
          setLoading(true);
          return;
        }

        if (absenToday === null) {
          const response = await AbsenService.findToday(user.id);
          const checkAbsenToday = response.data;
          if (checkAbsenToday) {
            setAbsenToday({
              id: checkAbsenToday.id,
              userId: checkAbsenToday.userId,
              date: checkAbsenToday.date,
              status: checkAbsenToday.status,
              remarks: checkAbsenToday.remarks,
              createdAt: checkAbsenToday.createdAt,
              updatedAt: checkAbsenToday.updatedAt,
              clockIn: checkAbsenToday.clockIn,
              clockOut: checkAbsenToday.clockOut,
              area: checkAbsenToday.area,
              region: checkAbsenToday.region,
              longitudeIn: checkAbsenToday.longitudeIn,
              latitudeIn: checkAbsenToday.latitudeIn,
              longitudeOut: checkAbsenToday.longitudeOut,
              latitudeOut: checkAbsenToday.latitudeOut,
              photoIn: checkAbsenToday.photoIn,
              photoOut: checkAbsenToday.photoOut,
            });
          } else {
            console.log('absenToday', absenToday)
            clearAbsenToday();
          }
        }
      } catch (error) {
        console.error('Error checking attendance:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to check today\'s attendance'
        });
      } finally {
        setLoading(false);
      }
    };

    checkTodayAttendance();

    console.log("absenToday", absenToday);
  }, [user, setLoading, absenToday]);

  useEffect(() => {
    const hasChanges =
      name !== profile.name ||
      email !== profile.email ||
      photoExist !== profile.photo;
    setIsDisabled(!hasChanges);
  }, [name, email, photoExist, profile]);

  const handleTakePhoto = async (flag: number) => {
    if (!isOnline) {
      Alert.alert("Error", "Please check your internet connection");
      return;
    }

    // if (absenToday?.clockIn) {
    //   Alert.alert("Notice", "You have already checked in today");
    //   return;
    // }

    try {
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Camera Permission Required",
          "Please grant permission to access the camera for attendance."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.8,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });

      if (result.canceled) {
        return;
      }

      const imageAsset = result.assets[0];
      setPhoto(imageAsset);
      setPhotoExist(imageAsset.uri);
      await handleAttendance(imageAsset, flag);
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  const handleAttendance = async (photoAsset: any, flag: number) => {
    setLoading(true);
    try {
      const userId = user?.id;
      if (!userId) {
        throw new Error("User ID not found");
      }

      if (!latitude || !longitude) {
        throw new Error(
          "Location not available. Please enable location services."
        );
      }
      const dateNow = new Date();
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("date", dateNow.toISOString());
      formData.append("latitude", latitude);
      formData.append("longitude", longitude);
      if (photoAsset) {
        // @ts-ignore
        formData.append("file", {
          uri: photoAsset.uri,
          type: "image/jpeg",
          name: photoAsset.fileName || "image.jpg",
        });
      }

      let response;
      if (flag === 0) {
        formData.append("clockIn", dateNow.toISOString());
        response = await AbsenService.AbsenIn(formData);
      } else {
        formData.append("clockOut", dateNow.toISOString());
        response = await AbsenService.AbsenOut(formData);
      }

      if (response.statusCode === 200) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: `Attendance recorded successfully`,
          visibilityTime: 3000,
        });

        if (flag === 0) {
          const absenData = response.data[0];
          setAbsenToday({
            id: absenData.id,
            userId: absenData.userId,
            date: absenData.date,
            status: absenData.status,
            remarks: absenData.remarks || "",
            createdAt: absenData.createdAt,
            updatedAt: absenData.updatedAt,
            clockIn: absenData.clockIn,
            clockOut: absenData.clockOut,
            area: absenData.area,
            region: absenData.region,
            longitudeIn: absenData.longitudeIn,
            latitudeIn: absenData.latitudeIn,
            longitudeOut: absenData.longitudeOut || "",
            latitudeOut: absenData.latitudeOut || "",
            photoIn: absenData.photoIn || "",
            photoOut: absenData.photoOut || "",
          });
        }
        
      } else {
        throw new Error(response.message || "Failed to record attendance");
      }
    } catch (error: any) {
      console.error("Attendance Error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred";

      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage,
        visibilityTime: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Confirm Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: () => {
          setLoading(true);
          clearAuth();
          clearConstants();
          Toast.show({
            type: "success",
            text1: "Success",
            text2: "Logout Successful",
          });
          setTimeout(() => setLoading(false), 1000);
        },
      },
    ]);
  };

  useEffect(() => {
    checkIfLocationEnabled();
    getCurrentLocation();
  }, []);

  const checkIfLocationEnabled = async () => {
    let enabled = await Location.hasServicesEnabledAsync();
    if (!enabled) {
      Alert.alert(
        "Location Required",
        "Please enable location services to use attendance features",
        [
          {
            text: "Open Settings",
            onPress: () => Location.enableNetworkProviderAsync(),
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
    } else {
      setLocationServicesEnabled(enabled);
    }
  };

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required for attendance"
        );
        return;
      }

      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      if (coords) {
        const { latitude, longitude } = coords;
        setLatitude(latitude.toString());
        setLongitude(longitude.toString());
        setDisplayLongLat(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);

        const response = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (response[0]) {
          const address = `${response[0].street || ""} ${
            response[0].city || ""
          } ${response[0].postalCode || ""}`;
          setDisplayCurrentAddress(address.trim());
        }
      }
    } catch (error) {
      console.error("Location Error:", error);
      Alert.alert("Error", "Failed to get current location");
    }
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Hi {profile.name}&ensp;
            <Ionicons
              name={"rocket"}
              size={width * 0.055}
              color={Colors.secondaryColor}
            />
          </Text>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Image
              source={{ uri: absenToday?.photoIn }}
              style={styles.coverPhoto}
            />
            <Text style={styles.dateTime}>
              {date} at {time}
            </Text>
            <View style={styles.locationContainer}>
              <Text style={styles.locationText}>{displayCurrentAddress}</Text>
              <Text style={styles.coordsText}>{displayLongLat}</Text>
            </View>
            <View style={styles.locationContainer}>
              <Text style={styles.locationText}>{absenToday?.remarks}</Text>
              <Text style={styles.locationText}>{absenToday?.status}</Text>
            </View>
            {(absenToday?.clockIn || absenToday == null) && time < "17" ? (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={() => handleTakePhoto(0)}
                  style={[
                    styles.attendanceButton,
                    absenToday?.clockIn && styles.disabledButton,
                  ]}
                  disabled={!!absenToday?.clockIn}
                >
                  <Text style={styles.attendanceButtonText}>
                    {absenToday?.clockIn ? "Already Checked In" : "Check In"}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={() => handleTakePhoto(1)}
                  style={styles.attendanceButton}
                >
                  <Text style={styles.attendanceButtonText}>Check Out</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View style={styles.profileContainer}>
          <View style={styles.profileRow}>
            <Text style={styles.label}>Email </Text>
            <Text style={styles.value}>{profile.email}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
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
    fontSize: width * 0.05,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: Colors.buttonBackground,
    paddingVertical: height * 0.01,
    paddingHorizontal: width * 0.05,
    borderRadius: 8,
  },
  cardContainer: {
    alignItems: "center",
    marginVertical: height * 0.02,
  },
  card: {
    width: width * 0.9,
    alignItems: "center",
    padding: width * 0.05,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  coverPhoto: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    marginBottom: height * 0.02,
  },
  dateTime: {
    fontSize: width * 0.04,
    marginBottom: height * 0.01,
  },
  locationContainer: {
    width: "100%",
    alignItems: "center",
    marginVertical: height * 0.01,
  },
  locationText: {
    fontSize: width * 0.04,
    textAlign: "center",
    marginBottom: height * 0.01,
  },
  coordsText: {
    fontSize: width * 0.035,
    color: "#666",
  },
  buttonContainer: {
    marginTop: height * 0.02,
  },
  attendanceButton: {
    backgroundColor: Colors.buttonBackground,
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.08,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  attendanceButtonText: {
    color: "#fff",
    fontSize: width * 0.04,
    fontWeight: "600",
  },
  profileContainer: {
    alignItems: "center",
    marginTop: height * 0.02,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: width * 0.045,
    color: "gray",
    marginRight: width * 0.02,
  },
  value: {
    fontSize: width * 0.045,
    fontWeight: "bold",
  },
  buttonText: {
    color: "#fff",
    fontSize: width * 0.04,
  },
});
