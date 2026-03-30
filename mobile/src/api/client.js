import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// In development with Expo Go, use your local machine's IP instead of localhost (e.g. 192.168.x.x)
const API_URL = "http://192.168.1.36:8000/api/v1";

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;
