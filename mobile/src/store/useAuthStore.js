import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/client';

const useAuthStore = create((set) => ({
    token: null,
    userRole: null, // "patient" | "worker"
    isInit: false,

    init: async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const role = await AsyncStorage.getItem('role');
            if (token && role) {
                set({ token, userRole: role, isInit: true });
            } else {
                set({ isInit: true });
            }
        } catch (e) {
            set({ isInit: true });
        }
    },

    login: async (email, password) => {
        const formData = new FormData();
        formData.append("username", email);
        formData.append("password", password);
        
        try {
            const response = await apiClient.post('/auth/login', formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            const { access_token, role } = response.data;
            await AsyncStorage.setItem('token', access_token);
            await AsyncStorage.setItem('role', role);
            set({ token: access_token, userRole: role });
        } catch (error) {
            throw error;
        }
    },

    register: async (email, password, role) => {
        try {
            const response = await apiClient.post('/auth/register', {
                email,
                password,
                role
            });
            const { access_token, role: newRole } = response.data;
            await AsyncStorage.setItem('token', access_token);
            await AsyncStorage.setItem('role', newRole);
            set({ token: access_token, userRole: newRole });
        } catch (error) {
            throw error;
        }
    },

    logout: async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('role');
        set({ token: null, userRole: null });
    }
}));

export default useAuthStore;
