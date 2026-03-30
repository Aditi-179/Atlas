import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import apiClient from '../../api/client';
import BehavioralSimSection from '../../components/BehavioralSimSection';
import GlassCard from '../../components/GlassCard';
import { colors } from '../../theme/colors';

/**
 * SimulatorScreen — Patient side
 * Loads the patient's latest record to get the current clinical state,
 * then lets them toggle habit changes and run the what-if simulation.
 */
const SimulatorScreen = () => {
    const [currentState, setCurrentState] = useState(null);
    const [loading, setLoading] = useState(true);
    const [riskTier, setRiskTier] = useState(null);

    useEffect(() => {
        const loadState = async () => {
            try {
                const res = await apiClient.get('/mobile/patient/me');
                const record = res.data?.latest_record;
                if (record) {
                    // Reconstruct the RiskPredictionInput from stored visit data
                    setCurrentState({
                        Age: record.age ?? 45,
                        Sex: record.vitals?.Sex ?? 1,
                        BMI: record.vitals?.BMI ?? 25,
                        Income: record.vitals?.Income ?? 5,
                        Education: record.vitals?.Education ?? 4,
                        HighBP: record.vitals?.HighBP ?? 0,
                        HighChol: record.vitals?.HighChol ?? 0,
                        Smoker: record.habits?.Smoker ?? 0,
                        Veggies: record.habits?.Veggies ?? 0,
                        PhysActivity: record.habits?.PhysActivity ?? 0,
                        HvyAlcoholConsump: record.habits?.HvyAlcoholConsump ?? 0,
                        DiffWalk: record.habits?.DiffWalk ?? 0,
                    });
                    setRiskTier(record.risk_tier);
                }
            } catch (e) {
                console.error('SimulatorScreen load error', e);
            } finally {
                setLoading(false);
            }
        };
        loadState();
    }, []);

    if (loading) return <ActivityIndicator size="large" color={colors.primaryTeal} style={{ marginTop: 60 }} />;

    if (!currentState) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🧪</Text>
                <Text style={styles.emptyTitle}>No Data Available</Text>
                <Text style={styles.emptySubtitle}>
                    A health worker needs to record your clinical data before you can run lifestyle simulations.
                </Text>
            </View>
        );
    }

    const tierColor = riskTier === 'Red' ? colors.critical : riskTier === 'Yellow' ? colors.warning : colors.stable;

    return (
        <ScrollView contentContainerStyle={styles.scroll}>
            {/* Current baseline card */}
            <GlassCard style={styles.baselineCard}>
                <Text style={styles.baselineLabel}>Your Current Risk Baseline</Text>
                <Text style={[styles.baselineTier, { color: tierColor }]}>{riskTier || 'N/A'}</Text>
                <Text style={styles.baselineHint}>Toggle habits below to explore how lifestyle changes could improve your score.</Text>
            </GlassCard>

            <BehavioralSimSection currentState={currentState} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scroll: { padding: 16, paddingBottom: 40 },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 80 },
    emptyIcon: { fontSize: 48, marginBottom: 16 },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', color: colors.slateDark, marginBottom: 8 },
    emptySubtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
    baselineCard: { alignItems: 'center', paddingVertical: 20 },
    baselineLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6 },
    baselineTier: { fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
    baselineHint: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', lineHeight: 17 },
});

export default SimulatorScreen;
