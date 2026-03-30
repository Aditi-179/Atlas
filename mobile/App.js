import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import useAuthStore from './src/store/useAuthStore';
import { colors } from './src/theme/colors';

import LoginScreen from './src/screens/Auth/LoginScreen';
import RegisterScreen from './src/screens/Auth/RegisterScreen';

import WorkerDashboardScreen from './src/screens/Worker/WorkerDashboardScreen';
import PatientVisitScreen from './src/screens/Worker/PatientVisitScreen';

import PatientHomeScreen from './src/screens/Patient/PatientHomeScreen';

const Stack = createNativeStackNavigator();

export default function App() {
    const { isInit, token, userRole, init } = useAuthStore();

    useEffect(() => {
        init();
    }, []);

    if (!isInit) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.primaryTeal} />
            </View>
        );
    }

    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    {!token ? (
                        // Auth Flow
                        <>
                            <Stack.Screen name="Login" component={LoginScreen} />
                            <Stack.Screen name="Register" component={RegisterScreen} />
                        </>
                    ) : userRole === 'worker' ? (
                        // Health Worker Flow
                        <>
                            <Stack.Screen name="WorkerDashboard" component={WorkerDashboardScreen} />
                            <Stack.Screen name="PatientVisit" component={PatientVisitScreen} options={{ headerShown: true, title: "Patient Visit" }} />
                        </>
                    ) : (
                        // Patient Flow
                        <>
                            <Stack.Screen name="PatientHome" component={PatientHomeScreen} />
                        </>
                    )}
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}
