import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuthStore from '../../store/useAuthStore';
import GlassCard from '../../components/GlassCard';
import Button from '../../components/Button';
import { colors } from '../../theme/colors';

const RegisterScreen = ({ navigation }) => {
    const { register } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('patient'); // default patient
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill all fields");
            return;
        }
        setLoading(true);
        try {
            await register(email, password, role);
        } catch (error) {
            Alert.alert("Registration Failed", "Something went wrong. Try a different email.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.inner}>
                    <Text style={styles.brandTitle}>🛡️ Aegis Health OS</Text>
                    <Text style={styles.subtitle}>Create your account</Text>

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
                        
                        <Text style={styles.label}>Select Role:</Text>
                        <View style={styles.roleContainer}>
                            <TouchableOpacity 
                                style={[styles.roleBtn, role === 'patient' && styles.roleActive]} 
                                onPress={() => setRole('patient')}
                            >
                                <Text style={[styles.roleText, role === 'patient' && styles.roleTextActive]}>Patient</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.roleBtn, role === 'worker' && styles.roleActive]} 
                                onPress={() => setRole('worker')}
                            >
                                <Text style={[styles.roleText, role === 'worker' && styles.roleTextActive]}>Worker</Text>
                            </TouchableOpacity>
                        </View>

                        <Button 
                            title="Register" 
                            onPress={handleRegister} 
                            loading={loading}
                        />
                        <Button 
                            title="Back to Login" 
                            variant="secondary" 
                            onPress={() => navigation.goBack()} 
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
    },
    label: {
        fontSize: 14,
        color: colors.slateDark,
        fontWeight: '600',
        marginBottom: 8,
    },
    roleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    roleBtn: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 14,
        alignItems: 'center',
        borderRadius: 8,
        marginHorizontal: 4,
    },
    roleActive: {
        backgroundColor: colors.primaryTeal,
        borderColor: colors.primaryTeal,
    },
    roleText: {
        color: colors.textSecondary,
        fontWeight: '600',
    },
    roleTextActive: {
        color: '#fff',
    }
});

export default RegisterScreen;
