// src/services/authService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';  // Use the correct AsyncStorage import
import axiosInstance from "../config/axiosInstance";

interface LoginResponse {
    statusCode: number;
    message: string;
    data: any;
}


class AuthServices {
    // Login function: Accepts credentials, performs authentication, and stores the token
    static async login(email: string, password: string): Promise<LoginResponse> {
        try {
            const response = await axiosInstance.post('/auth/login', {
                email,
                password,
            });
            return response.data
        } catch (error: any) {
            console.error('Login failed:', error)
            throw error
        }
    }

    static async forgotPassword(email: string): Promise<void> {
        try {
            const response = await axiosInstance.post('/auth/forgot-password', {
                email
            });
            return response.data;
        } catch (error: any) {
            console.error('Login failed:', error)
            throw error.response
        }
    }

    // Logout function: Removes the token from AsyncStorage
    static async logout(): Promise<void> {
        try {
            await AsyncStorage.removeItem('token')
        } catch (error: any) {
            console.error('Logout failed:', error)
            throw error.response
        }
    }

    // Get token: Retrieves the token from AsyncStorage
    static async getToken(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem('token')
        } catch (error: any) {
            console.error('Failed to get token:', error)
            throw error.response
        }
    }

    // Check if the user is authenticated: Returns a boolean indicating if the user is logged in
    static async isAuthenticated(): Promise<boolean> {
        try {
            const token = await this.getToken()
            return token !== null
        } catch (error: any) {
            console.error('Error checking authentication:', error)
            return false
        }
    }
}

export default AuthServices
