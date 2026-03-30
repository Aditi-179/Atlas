import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient from '../../api/client';
import GlassCard from '../../components/GlassCard';
import Button from '../../components/Button';
import { colors } from '../../theme/colors';
import { Switch } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import BehavioralSimSection from '../../components/BehavioralSimSection';

const PatientVisitScreen = ({ route, navigation }) => {
    const { patient } = route.params;
    
    const [age, setAge] = useState(patient.latest_record?.age?.toString() || '45');
    const [sex, setSex] = useState(patient.latest_record?.vitals?.Sex || 1); // 1 = Male, 0 = Female
    const [bmi, setBmi] = useState(patient.latest_record?.vitals?.BMI?.toString() || '24.5');
    const [income, setIncome] = useState(patient.latest_record?.vitals?.Income?.toString() || '5');
    const [education, setEducation] = useState(patient.latest_record?.vitals?.Education?.toString() || '4');

    // Clinical Toggles
    const [highBp, setHighBp] = useState(!!patient.latest_record?.vitals?.HighBP);
    const [highChol, setHighChol] = useState(!!patient.latest_record?.vitals?.HighChol);
    
    // Behavioral & Mobility
    const [smoker, setSmoker] = useState(!!patient.latest_record?.habits?.Smoker);
    const [veggies, setVeggies] = useState(!!patient.latest_record?.habits?.Veggies);
    const [physActivity, setPhysActivity] = useState(!!patient.latest_record?.habits?.PhysActivity);
    const [hvyAlcohol, setHvyAlcohol] = useState(!!patient.latest_record?.habits?.HvyAlcoholConsump);
    const [diffWalk, setDiffWalk] = useState(!!patient.latest_record?.habits?.DiffWalk);
    
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    // currentStateForSim stores the submitted data so the simulator can reuse it
    const [simCurrentState, setSimCurrentState] = useState(null);

    const handleSubmit = async () => {
        setLoading(true);
        setResults(null); 
        try {
            const payload = {
                Age: parseInt(age),
                Sex: sex,
                Income: parseInt(income),
                Education: parseInt(education),
                vitals: {
                    BMI: parseFloat(bmi),
                    HighBP: highBp ? 1 : 0,
                    HighChol: highChol ? 1 : 0,
                },
                habits: {
                    Smoker: smoker ? 1 : 0,
                    Veggies: veggies ? 1 : 0,
                    PhysActivity: physActivity ? 1 : 0,
                    HvyAlcoholConsump: hvyAlcohol ? 1 : 0,
                    DiffWalk: diffWalk ? 1 : 0
                }
            };

            const response = await apiClient.post(`/mobile/worker/patients/${patient.id}/update`, payload);
            setResults(response.data.record);
            // Save state so the Simulator can reuse
            setSimCurrentState({
                Age: parseInt(age),
                Sex: sex,
                BMI: parseFloat(bmi),
                Income: parseInt(income),
                Education: parseInt(education),
                HighBP: highBp ? 1 : 0,
                HighChol: highChol ? 1 : 0,
                Smoker: smoker ? 1 : 0,
                Veggies: veggies ? 1 : 0,
                PhysActivity: physActivity ? 1 : 0,
                HvyAlcoholConsump: hvyAlcohol ? 1 : 0,
                DiffWalk: diffWalk ? 1 : 0,
            });
            Alert.alert("Reasoning Complete", "Patient clinical result generated successfully.");
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
                    
                    {!results ? (
                        <>
                            <Text style={styles.sectionHeader}>Demographics</Text>
                            <GlassCard>
                                <Text style={styles.label}>Age</Text>
                                <TextInput style={styles.input} keyboardType="numeric" value={age} onChangeText={setAge} />
                                
                                <Text style={styles.label}>Gender</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={sex}
                                        onValueChange={(val) => setSex(val)}
                                        style={styles.picker}
                                    >
                                        <Picker.Item label="Male" value={1} />
                                        <Picker.Item label="Female" value={0} />
                                    </Picker>
                                </View>
                            </GlassCard>

                            <Text style={styles.sectionHeader}>Clinical Data</Text>
                            <GlassCard>
                                <Text style={styles.label}>BMI (Currently {bmi})</Text>
                                <TextInput style={styles.input} keyboardType="numeric" value={bmi} onChangeText={setBmi} />
                                
                                <View style={styles.toggleRow}>
                                    <Text style={styles.toggleLabel}>High Blood Pressure</Text>
                                    <Switch value={highBp} onValueChange={setHighBp} trackColor={{ true: colors.primaryTeal }} />
                                </View>
                                <View style={styles.toggleRow}>
                                    <Text style={styles.toggleLabel}>High Cholesterol</Text>
                                    <Switch value={highChol} onValueChange={setHighChol} trackColor={{ true: colors.primaryTeal }} />
                                </View>
                            </GlassCard>

                            <Text style={styles.sectionHeader}>Behavioral & Social</Text>
                            <GlassCard>
                                <View style={styles.toggleRow}>
                                    <Text style={styles.toggleLabel}>Smoker (Current/Former)</Text>
                                    <Switch value={smoker} onValueChange={setSmoker} trackColor={{ true: colors.primaryTeal }} />
                                </View>
                                <View style={styles.toggleRow}>
                                    <Text style={styles.toggleLabel}>Daily Veggies</Text>
                                    <Switch value={veggies} onValueChange={setVeggies} trackColor={{ true: colors.primaryTeal }} />
                                </View>
                                <View style={styles.toggleRow}>
                                    <Text style={styles.toggleLabel}>Physical Activity</Text>
                                    <Switch value={physActivity} onValueChange={setPhysActivity} trackColor={{ true: colors.primaryTeal }} />
                                </View>
                                <View style={styles.toggleRow}>
                                    <Text style={styles.toggleLabel}>Heavy Alcohol</Text>
                                    <Switch value={hvyAlcohol} onValueChange={setHvyAlcohol} trackColor={{ true: colors.primaryTeal }} />
                                </View>
                                <View style={styles.toggleRow}>
                                    <Text style={styles.toggleLabel}>Mobility Issues</Text>
                                    <Switch value={diffWalk} onValueChange={setDiffWalk} trackColor={{ true: colors.primaryTeal }} />
                                </View>
                                
                                <Text style={styles.label}>Income (Scale 1-8)</Text>
                                <TextInput style={styles.input} keyboardType="numeric" value={income} onChangeText={setIncome} />
                            </GlassCard>

                            <Button title="Calculate Risk & Protocol" onPress={handleSubmit} loading={loading} style={{marginTop: 16}} />
                        </>
                    ) : (
                        <View>
                            <Text style={styles.sectionHeader}>Analysis Results</Text>
                            <GlassCard style={{ alignItems: 'center', paddingVertical: 24 }}>
                                <Text style={styles.resultLabel}>Calculated Risk Tier</Text>
                                <Text style={[styles.riskTierLarge, { color: results.risk_tier === 'Red' ? colors.critical : (results.risk_tier === 'Yellow' ? colors.warning : colors.stable) }]}>
                                    {results.risk_tier}
                                </Text>
                                <Text style={styles.riskScoreSub}>Severity Score: {results.risk_score.toFixed(2)}%</Text>
                            </GlassCard>

                            <Text style={styles.sectionHeader}>Predictive Drivers (XAI)</Text>
                            <GlassCard>
                                {results.top_contributors?.map((item, idx) => (
                                    <View key={idx} style={styles.xaiRow}>
                                        <Text style={styles.xaiFeature}>{item.feature}</Text>
                                        <View style={[styles.xaiImpactBar, { width: Math.abs(item.impact) * 50, backgroundColor: item.impact > 0 ? colors.critical : colors.stable }]} />
                                    </View>
                                ))}
                            </GlassCard>

                            <Text style={styles.sectionHeader}>AI Action Plan</Text>
                            <View style={styles.protocolContainer}>
                                {results.protocol?.protocol_steps?.map((step, idx) => (
                                    <GlassCard key={idx} style={styles.stepCard}>
                                        <View style={styles.stepHeader}>
                                            <Text style={styles.stepCategory}>{step.category}</Text>
                                            <Text style={styles.stepUrgency}>{step.urgency}</Text>
                                        </View>
                                        <Text style={styles.stepAction}>{step.action}</Text>
                                        <Text style={styles.stepCitation}>Source: {step.evidence_citation}</Text>
                                    </GlassCard>
                                ))}
                            </View>

                            <BehavioralSimSection currentState={simCurrentState} />

                            <Button title="Back to Patient List" variant="secondary" onPress={() => navigation.goBack()} style={{ marginTop: 16 }} />
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { padding: 16, paddingBottom: 40 },
    title: { fontSize: 24, fontWeight: 'bold', color: colors.slateDark, marginBottom: 16 },
    sectionHeader: { fontSize: 16, fontWeight: '700', color: colors.slateDark, marginBottom: 8, marginTop: 16, textTransform: 'uppercase' },
    label: { fontSize: 12, color: colors.textSecondary, fontWeight: '600', marginBottom: 4 },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
    toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
    toggleLabel: { fontSize: 15, color: colors.textPrimary },
    pickerContainer: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, backgroundColor: '#fff', marginBottom: 12, overflow: 'hidden' },
    picker: { height: 50, width: '100%' },
    
    // Results
    resultLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: 'bold', textTransform: 'uppercase' },
    riskTierLarge: { fontSize: 38, fontWeight: 'bold', marginVertical: 4 },
    riskScoreSub: { fontSize: 16, color: colors.slateDark },
    xaiRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 6 },
    xaiFeature: { fontSize: 13, color: colors.textPrimary, flex: 1 },
    xaiImpactBar: { height: 8, borderRadius: 4 },
    stepCard: { padding: 12, marginBottom: 12 },
    stepHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    stepCategory: { fontSize: 11, fontWeight: 'bold', color: colors.primaryTeal, textTransform: 'uppercase' },
    stepUrgency: { fontSize: 10, fontWeight: 'bold', color: colors.critical, textTransform: 'uppercase' },
    stepAction: { fontSize: 14, color: colors.textPrimary, fontWeight: '500', marginBottom: 8 },
    stepCitation: { fontSize: 10, color: colors.textSecondary, fontStyle: 'italic' }
});

export default PatientVisitScreen;
