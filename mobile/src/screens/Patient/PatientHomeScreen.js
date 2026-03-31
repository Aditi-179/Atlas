import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuthStore from '../../store/useAuthStore';
import apiClient from '../../api/client';
import GlassCard from '../../components/GlassCard';
import Button from '../../components/Button';
import { colors } from '../../theme/colors';
import SimulatorScreen from './SimulatorScreen';
import TimelineScreen from './TimelineScreen';

const PatientHomeScreen = () => {
    const { logout } = useAuthStore();
    const [patientData, setPatientData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/mobile/patient/me');
            setPatientData(response.data);
        } catch (error) {
            console.error("Fetch error", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const getRiskColor = (tier) => {
        if (!tier) return colors.textSecondary;
        if (tier.toLowerCase() === 'red') return colors.critical;
        if (tier.toLowerCase() === 'yellow') return colors.warning;
        if (tier.toLowerCase() === 'green') return colors.stable;
        return colors.textSecondary;
    };

    const TABS = [
        { key: 'overview', label: '📊 Overview' },
        { key: 'simulator', label: '🧪 Simulator' },
        { key: 'timeline', label: '📋 Timeline' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>🛡️ CareFlow AI</Text>
                <Button title="Logout" variant="secondary" onPress={logout} style={styles.logoutBtn} />
            </View>

            {/* Tab Bar */}
            <View style={styles.tabBar}>
                {TABS.map(({ key, label }) => (
                    <TouchableOpacity
                        key={key}
                        style={[styles.tab, activeTab === key && styles.tabActive]}
                        onPress={() => setActiveTab(key)}
                    >
                        <Text style={[styles.tabText, activeTab === key && styles.tabTextActive]}>
                            {label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
                >
                    {loading && !patientData ? (
                        <ActivityIndicator size="large" color={colors.primaryTeal} style={{ marginTop: 50 }} />
                    ) : !patientData?.latest_record ? (
                        <GlassCard>
                            <Text style={styles.emptyText}>No health data available yet.</Text>
                            <Text style={styles.subText}>A health worker will record your vitals during a visit.</Text>
                        </GlassCard>
                    ) : (
                        <>
                            {/* Risk Score Hero */}
                            <GlassCard style={{ alignItems: 'center', paddingVertical: 32 }}>
                                <Text style={styles.label}>Current Risk Status</Text>
                                <Text style={[styles.riskTier, { color: getRiskColor(patientData.latest_record.risk_tier || 'Yellow') }]}>
                                    {patientData.latest_record.risk_tier || "Pending Analysis"}
                                </Text>
                                {patientData.latest_record.risk_score && (
                                    <Text style={styles.riskScore}>
                                        Severity Score: {patientData.latest_record.risk_score.toFixed(2)}%
                                    </Text>
                                )}
                            </GlassCard>

                            {/* Latest Vitals */}
                            <Text style={styles.sectionTitle}>Latest Vitals</Text>
                            <GlassCard>
                                <View style={styles.row}>
                                    <Text style={styles.rowKey}>AGE</Text>
                                    <Text style={styles.rowVal}>{patientData.latest_record.age}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.rowKey}>BMI</Text>
                                    <Text style={styles.rowVal}>{patientData.latest_record.vitals?.BMI}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.rowKey}>BLOOD PRESSURE</Text>
                                    <Text style={styles.rowVal}>{patientData.latest_record.vitals?.HighBP ? 'High' : 'Normal'}</Text>
                                </View>
                            </GlassCard>

                            {/* Predictive Drivers (XAI) */}
                            {patientData.latest_record.top_contributors?.length > 0 && (
                                <>
                                    <Text style={styles.sectionTitle}>Predictive Drivers (XAI)</Text>
                                    <GlassCard>
                                        {patientData.latest_record.top_contributors.map((item, idx) => (
                                            <View key={idx} style={styles.xaiRow}>
                                                <Text style={styles.xaiFeature}>{item.feature}</Text>
                                                <View style={[styles.xaiImpactBar, { width: Math.abs(item.impact) * 50, backgroundColor: item.impact > 0 ? colors.critical : colors.stable }]} />
                                            </View>
                                        ))}
                                    </GlassCard>
                                </>
                            )}

                            {/* Action Plan */}
                            {patientData.latest_record.protocol?.protocol_steps?.length > 0 && (
                                <>
                                    <Text style={styles.sectionTitle}>Your Action Plan</Text>
                                    <View style={styles.protocolContainer}>
                                        {patientData.latest_record.protocol.protocol_steps.map((step, idx) => (
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
                                </>
                            )}
                        </>
                    )}
                </ScrollView>
            )}

            {/* Simulator Tab */}
            {activeTab === 'simulator' && <SimulatorScreen />}

            {/* Timeline Tab */}
            {activeTab === 'timeline' && <TimelineScreen />}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: colors.border },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.slateDark },
    logoutBtn: { paddingVertical: 8, paddingHorizontal: 12, marginVertical: 0 },

    // Tab bar
    tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colors.border },
    tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
    tabActive: { borderBottomColor: colors.primaryTeal },
    tabText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
    tabTextActive: { color: colors.primaryTeal, fontWeight: '700' },

    scroll: { padding: 16, flexGrow: 1 },
    emptyText: { fontSize: 18, fontWeight: '600', color: colors.slateDark, textAlign: 'center' },
    subText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 8 },
    label: { fontSize: 14, color: colors.textSecondary, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8 },
    riskTier: { fontSize: 36, fontWeight: 'bold' },
    riskScore: { fontSize: 16, color: colors.slateDark, marginTop: 8 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.slateDark, marginBottom: 12, marginTop: 16 },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
    rowKey: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
    rowVal: { fontSize: 16, color: colors.slateDark, fontWeight: 'bold' },

    // XAI & Protocol Styles
    xaiRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 6 },
    xaiFeature: { fontSize: 13, color: colors.textPrimary, flex: 1 },
    xaiImpactBar: { height: 8, borderRadius: 4 },
    protocolContainer: { marginBottom: 20 },
    stepCard: { padding: 12, marginBottom: 12 },
    stepHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    stepCategory: { fontSize: 11, fontWeight: 'bold', color: colors.primaryTeal, textTransform: 'uppercase' },
    stepUrgency: { fontSize: 10, fontWeight: 'bold', color: colors.critical, textTransform: 'uppercase' },
    stepAction: { fontSize: 14, color: colors.textPrimary, fontWeight: '500', marginBottom: 8 },
    stepCitation: { fontSize: 10, color: colors.textSecondary, fontStyle: 'italic' },
});

export default PatientHomeScreen;
