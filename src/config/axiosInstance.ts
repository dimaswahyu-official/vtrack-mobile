// src/api/axiosInstance.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const axiosInstance = axios.create({
  // baseURL: 'http://192.168.0.102:9001/api/v1',
  // baseURL: 'http://103.217.144.36:9001/api/v1',
  // baseURL: 'https://api.koneksi.co.id/api/v1',
  // baseURL: 'https://10.0.63.144:9001/api/v1',
  baseURL: 'http://10.0.63.223:9001/api/v1',
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
