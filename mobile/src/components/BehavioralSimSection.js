import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ActivityIndicator, TouchableOpacity } from 'react-native';
import apiClient from '../api/client';
import GlassCard from './GlassCard';
import { colors } from '../theme/colors';

/**
 * BehavioralSimSection
 * Props:
 *   currentState: object  — the RiskPredictionInput fields (Age, Sex, BMI, Income, Education,
 *                            HighBP, HighChol, Smoker, Veggies, PhysActivity, HvyAlcoholConsump, DiffWalk)
 */
const BehavioralSimSection = ({ currentState }) => {
    const [quitSmoking, setQuitSmoking] = useState(false);
    const [exercise, setExercise] = useState(false);
    const [eatVeggies, setEatVeggies] = useState(false);
    const [reduceAlcohol, setReduceAlcohol] = useState(false);

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const runSimulation = async () => {
        if (!currentState) {
            setError('No patient data available. Please submit a visit first.');
            return;
        }
        setLoading(true);
        setError(null);
        setResult(null);

        const modifiedHabits = {
            Smoker: quitSmoking ? 0 : (currentState.Smoker ?? 1),
            PhysActivity: exercise ? 1 : (currentState.PhysActivity ?? 0),
            Veggies: eatVeggies ? 1 : (currentState.Veggies ?? 0),
            HvyAlcoholConsump: reduceAlcohol ? 0 : (currentState.HvyAlcoholConsump ?? 1),
        };

        const payload = {
            current_state: currentState,
            modified_habits: modifiedHabits,
        };

        try {
            const res = await apiClient.post('/behavioral-sim/run', payload);
            setResult(res.data);
        } catch (e) {
            setError('Simulation failed. ' + (e.response?.data?.detail || ''));
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (pct) => {
        if (pct >= 60) return colors.critical;
        if (pct >= 35) return colors.warning;
        return colors.stable;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>🧪 Lifestyle Simulator</Text>
            <Text style={styles.subtitle}>Toggle habits below and run the simulation to see how changes could affect this patient's risk score.</Text>

            <GlassCard style={styles.toggleCard}>
                <ToggleRow label="Quit Smoking" emoji="🚭" value={quitSmoking} onChange={setQuitSmoking} />
                <ToggleRow label="Daily Exercise" emoji="🏃" value={exercise} onChange={setExercise} />
                <ToggleRow label="Eat Daily Veggies" emoji="🥦" value={eatVeggies} onChange={setEatVeggies} />
                <ToggleRow label="Reduce Heavy Alcohol" emoji="🍷" value={reduceAlcohol} onChange={setReduceAlcohol} last />
            </GlassCard>

            <TouchableOpacity style={styles.simBtn} onPress={runSimulation} disabled={loading}>
                {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.simBtnText}>Run Simulation →</Text>
                }
            </TouchableOpacity>

            {error && <Text style={styles.errorText}>{error}</Text>}

            {result && (
                <View>
                    <View style={styles.gaugeRow}>
                        {/* Current Risk */}
                        <GlassCard style={styles.gaugeCard}>
                            <Text style={styles.gaugeLabel}>Current Risk</Text>
                            <Text style={[styles.gaugeValue, { color: getRiskColor(result.current_risk * 100) }]}>
                                {(result.current_risk * 100).toFixed(1)}%
                            </Text>
                        </GlassCard>

                        {/* Delta */}
                        <View style={styles.deltaContainer}>
                            <Text style={styles.deltaArrow}>{result.risk_reduction > 0 ? '⬇️' : result.risk_reduction < 0 ? '⬆️' : '➡️'}</Text>
                            <Text style={[styles.deltaValue, { color: result.risk_reduction > 0 ? colors.stable : result.risk_reduction < 0 ? colors.critical : colors.textSecondary }]}>
                                {result.risk_reduction > 0 ? '−' : result.risk_reduction < 0 ? '+' : ''}
                                {(Math.abs(result.risk_reduction) * 100).toFixed(1)}%
                            </Text>
                            <Text style={styles.deltaLabel}>reduction</Text>
                        </View>

                        {/* Projected Risk */}
                        <GlassCard style={styles.gaugeCard}>
                            <Text style={styles.gaugeLabel}>Projected</Text>
                            <Text style={[styles.gaugeValue, { color: getRiskColor(result.simulated_risk * 100) }]}>
                                {(result.simulated_risk * 100).toFixed(1)}%
                            </Text>
                        </GlassCard>
                    </View>

                    <GlassCard style={[styles.impactCard, {
                        borderColor: result.risk_reduction > 0.10 ? colors.stable : result.risk_reduction > 0 ? colors.primaryTeal : colors.border
                    }]}>
                        <Text style={styles.impactIcon}>
                            {result.risk_reduction > 0.15 ? '🎯' : result.risk_reduction > 0 ? '💡' : '✅'}
                        </Text>
                        <Text style={styles.impactLabel}>AI Insight</Text>
                        <Text style={styles.impactText}>{result.impact_message}</Text>
                    </GlassCard>
                </View>
            )}
        </View>
    );
};

const ToggleRow = ({ label, emoji, value, onChange, last }) => (
    <View style={[styles.toggleRow, last && { borderBottomWidth: 0 }]}>
        <Text style={styles.toggleLabel}>{emoji}  {label}</Text>
        <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primaryTeal }} thumbColor={value ? '#fff' : '#ccc'} />
    </View>
);

const styles = StyleSheet.create({
    container: { marginTop: 24 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.slateDark, marginBottom: 6, textTransform: 'uppercase' },
    subtitle: { fontSize: 13, color: colors.textSecondary, marginBottom: 16, lineHeight: 18 },
    toggleCard: { marginBottom: 0 },
    toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
    toggleLabel: { fontSize: 14, color: colors.textPrimary, fontWeight: '500' },
    simBtn: { backgroundColor: colors.primaryTeal, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 16, marginBottom: 8 },
    simBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
    errorText: { color: colors.critical, fontSize: 13, textAlign: 'center', marginTop: 8 },
    gaugeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, gap: 8 },
    gaugeCard: { flex: 1, alignItems: 'center', paddingVertical: 16 },
    gaugeLabel: { fontSize: 10, color: colors.textSecondary, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6 },
    gaugeValue: { fontSize: 24, fontWeight: 'bold' },
    deltaContainer: { alignItems: 'center', paddingHorizontal: 4 },
    deltaArrow: { fontSize: 18 },
    deltaValue: { fontSize: 18, fontWeight: 'bold' },
    deltaLabel: { fontSize: 9, color: colors.textSecondary, textTransform: 'uppercase' },
    impactCard: { marginTop: 12, padding: 16, borderWidth: 1 },
    impactIcon: { fontSize: 24, marginBottom: 4 },
    impactLabel: { fontSize: 10, color: colors.primaryTeal, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
    impactText: { fontSize: 14, color: colors.textPrimary, lineHeight: 20 },
});

export default BehavioralSimSection;
