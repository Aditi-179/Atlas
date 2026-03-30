import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableWithoutFeedback, Keyboard, SafeAreaView } from 'react-native';
import useAuthStore from '../../store/useAuthStore';
import GlassCard from '../../components/GlassCard';
import Button from '../../components/Button';
import { colors } from '../../theme/colors';

const LoginScreen = ({ navigation }) => {
    const { login } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill all fields");
            return;
        }
        setLoading(true);
        try {
            await login(email, password);
            // App.js handles navigation switch based on role
        } catch (error) {
            Alert.alert("Login Failed", "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.inner}>
                    <Text style={styles.brandTitle}>🛡️ Aegis Health OS</Text>
                    <Text style={styles.subtitle}>Sign in to your account</Text>

                    <GlassCard>
                        <TextInput
                            style={styles.input}
                            placeholder="Email Address"
                            placeholderTextColor={colors.textSecondary}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor={colors.textSecondary}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                        <Button 
                            title="Login" 
                            onPress={handleLogin} 
                            loading={loading}
                        />
                        <Button 
                            title="Create Account" 
                            variant="secondary" 
                            onPress={() => navigation.navigate('Register')} 
                            style={{marginTop: 8}}
                        />
                    </GlassCard>
                </View>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    inner: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    brandTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.slateDark,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 32,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 14,
        marginBottom: 16,
        color: colors.textPrimary,
        fontSize: 16,
    }
});

export default LoginScreen;
