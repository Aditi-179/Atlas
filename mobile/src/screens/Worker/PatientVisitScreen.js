import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import apiClient from '../../api/client';
import GlassCard from '../../components/GlassCard';
import Button from '../../components/Button';
import { colors } from '../../theme/colors';

const PatientVisitScreen = ({ route, navigation }) => {
    const { patient } = route.params;
    
    const [age, setAge] = useState(patient.latest_record?.age?.toString() || '45');
    const [gender, setGender] = useState(patient.latest_record?.gender || 'Male');
    
    const [systolicBp, setSystolicBp] = useState(patient.latest_record?.vitals?.systolic_bp?.toString() || '120');
    const [bmi, setBmi] = useState(patient.latest_record?.vitals?.bmi?.toString() || '24.5');
    
    const [smoking, setSmoking] = useState(patient.latest_record?.habits?.smoking || 'Never');
    const [diet, setDiet] = useState(patient.latest_record?.habits?.diet || 'Healthy');
    
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const payload = {
                age: parseInt(age),
                gender: gender,
                vitals: {
                    systolic_bp: parseInt(systolicBp),
                    bmi: parseFloat(bmi)
                },
                habits: {
                    smoking,
                    diet
                }
            };

            await apiClient.post(`/mobile/worker/patients/${patient.id}/update`, payload);
            Alert.alert("Success", "Patient record updated successfully", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert("Error", "Failed to update record. " + (error.response?.data?.detail || ""));
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scroll}>
                    <Text style={styles.title}>Visit: {patient.email}</Text>
                    
                    <Text style={styles.sectionHeader}>Demographics</Text>
                    <GlassCard>
                        <TextInput style={styles.input} placeholder="Age" keyboardType="numeric" value={age} onChangeText={setAge} />
                        <TextInput style={styles.input} placeholder="Gender (Male/Female)" value={gender} onChangeText={setGender} />
                    </GlassCard>

                    <Text style={styles.sectionHeader}>Vitals</Text>
                    <GlassCard>
                        <TextInput style={styles.input} placeholder="Systolic BP" keyboardType="numeric" value={systolicBp} onChangeText={setSystolicBp} />
                        <TextInput style={styles.input} placeholder="BMI" keyboardType="numeric" value={bmi} onChangeText={setBmi} />
                    </GlassCard>

                    <Text style={styles.sectionHeader}>Habits</Text>
                    <GlassCard>
                        <TextInput style={styles.input} placeholder="Smoking (Current/Former/Never)" value={smoking} onChangeText={setSmoking} />
                        <TextInput style={styles.input} placeholder="Diet (Healthy/High Sodium)" value={diet} onChangeText={setDiet} />
                    </GlassCard>

                    <Button title="Save Record" onPress={handleSubmit} loading={loading} style={{marginTop: 16}} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { padding: 16, paddingBottom: 40 },
    title: { fontSize: 24, fontWeight: 'bold', color: colors.slateDark, marginBottom: 16 },
    sectionHeader: { fontSize: 16, fontWeight: '600', color: colors.slateDark, marginBottom: 8, marginTop: 16 },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 }
});

export default PatientVisitScreen;
