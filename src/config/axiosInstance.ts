// src/api/axiosInstance.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@env';


const axiosInstance = axios.create({
  baseURL: BASE_URL + '/api/v1',
  timeout: 10000,
});

// You can add interceptors here if needed
axiosInstance.interceptors.request.use(
  async config => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch (error) {
      console.error('Error fetching token from AsyncStorage', error);
      throw new Error('Error fetching token from AsyncStorage: ' + error);
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  },
)

export default axiosInstance;
