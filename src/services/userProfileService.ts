import AsyncStorage from '@react-native-async-storage/async-storage';  // Use the correct AsyncStorage import
import axiosInstance from "../config/axiosInstance";
import axios from "axios";

interface Response {
    statusCode: number;
    message: string;
    data: any;
}

class UserProfileService {
    static async updateProfile(id: string, formData: any): Promise<any> {
        try {
            const response = await axiosInstance.post(`/user/${id}`, formData,
                {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data
        } catch (error: any) {
            console.error('Profile update failed:', error);
            throw new Error('Profile update failed: ' + error.message); // Customize error message
        }
    }
    static async updateImageProfile(id: string, file: any): Promise<any> {
        try {
            const response = await axiosInstance.post(`/user/image/${id}`, { file }, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            // console.log(response)

            // Return the structured response
            return response.data
        } catch (error: any) {
            console.error('Profile update failed:', error);
            throw new Error('Profile update failed: ' + error.message); // Customize error message
        }
    }
}

export default UserProfileService;
