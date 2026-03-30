import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import useAuthStore from '../../store/useAuthStore';
import apiClient from '../../api/client';
import GlassCard from '../../components/GlassCard';
import Button from '../../components/Button';
import { colors } from '../../theme/colors';

const PatientHomeScreen = () => {
    const { logout } = useAuthStore();
    const [patientData, setPatientData] = useState(null);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        fetchData();
    }, []);

    const getRiskColor = (tier) => {
        if (!tier) return colors.textSecondary;
        if (tier.toLowerCase() === 'red') return colors.critical;
        if (tier.toLowerCase() === 'yellow') return colors.warning;
        if (tier.toLowerCase() === 'green') return colors.stable;
        return colors.textSecondary;
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Health Overview</Text>
                <Button title="Logout" variant="secondary" onPress={logout} style={styles.logoutBtn} />
            </View>

            <ScrollView 
                contentContainerStyle={styles.scroll}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
            >
                {loading && !patientData ? (
                    <ActivityIndicator size="large" color={colors.primaryTeal} style={{marginTop: 50}} />
                ) : !patientData?.latest_record ? (
                    <GlassCard>
                        <Text style={styles.emptyText}>No health data available yet.</Text>
                        <Text style={styles.subText}>A health worker will record your vitals during a visit.</Text>
                    </GlassCard>
                ) : (
                    <>
                        <GlassCard style={{ alignItems: 'center', paddingVertical: 32 }}>
                            <Text style={styles.label}>Current Risk Status</Text>
                            <Text style={[styles.riskTier, { color: getRiskColor(patientData.latest_record.risk_tier || 'Yellow') }]}>
                                {patientData.latest_record.risk_tier || "Pending Analysis"}
                            </Text>
                            {patientData.latest_record.risk_score && (
                                <Text style={styles.riskScore}>
                                    Severity Score: {Math.round(patientData.latest_record.risk_score * 100)}%
                                </Text>
                            )}
                        </GlassCard>

                        <Text style={styles.sectionTitle}>Latest Vitals</Text>
                        <GlassCard>
                            {Object.entries(patientData.latest_record.vitals || {}).map(([key, value]) => (
                                <View key={key} style={styles.row}>
                                    <Text style={styles.rowKey}>{key.replace('_', ' ').toUpperCase()}</Text>
                                    <Text style={styles.rowVal}>{value}</Text>
                                </View>
                            ))}
                        </GlassCard>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: colors.border },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: colors.slateDark },
    logoutBtn: { paddingVertical: 8, paddingHorizontal: 12, marginVertical: 0 },
    scroll: { padding: 16, flexGrow: 1 },
    emptyText: { fontSize: 18, fontWeight: '600', color: colors.slateDark, textAlign: 'center' },
    subText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 8 },
    label: { fontSize: 14, color: colors.textSecondary, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8 },
    riskTier: { fontSize: 36, fontWeight: 'bold' },
    riskScore: { fontSize: 16, color: colors.slateDark, marginTop: 8 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.slateDark, marginBottom: 12, marginTop: 16 },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
    rowKey: { fontSize: 14, color: colors.textSecondary, fontWeight: '600' },
    rowVal: { fontSize: 16, color: colors.slateDark, fontWeight: 'bold' }
});

export default PatientHomeScreen;
