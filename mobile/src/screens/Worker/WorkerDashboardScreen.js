import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import useAuthStore from '../../store/useAuthStore';
import apiClient from '../../api/client';
import GlassCard from '../../components/GlassCard';
import Button from '../../components/Button';
import { colors } from '../../theme/colors';

const WorkerDashboardScreen = ({ navigation }) => {
    const { logout } = useAuthStore();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/mobile/worker/patients');
            setPatients(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const renderPatient = ({ item }) => {
        const riskTier = item.latest_record?.risk_tier || "Unassessed";
        const riskColor = riskTier.toLowerCase() === 'red' ? colors.critical : (riskTier.toLowerCase() === 'yellow' ? colors.warning : (riskTier.toLowerCase() === 'green' ? colors.stable : colors.textSecondary));

        return (
            <TouchableOpacity onPress={() => navigation.navigate('PatientVisit', { patient: item })}>
                <GlassCard style={styles.cardContainer}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.patientEmail}>{item.email}</Text>
                        <Text style={[styles.statusBadge, { backgroundColor: riskColor + '20', color: riskColor, borderColor: riskColor }]}>
                            {riskTier}
                        </Text>
                    </View>
                    <Text style={styles.lastVisit}>
                        Last Visit: {item.latest_record ? new Date(item.latest_record.created_at).toLocaleDateString() : 'Never visited'}
                    </Text>
                    <Button 
                        title="Start Visit" 
                        onPress={() => navigation.navigate('PatientVisit', { patient: item })}
                        style={{marginTop: 12, paddingVertical: 10}}
                    />
                </GlassCard>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Assigned Patients</Text>
                <Button title="Logout" variant="secondary" onPress={logout} style={styles.logoutBtn} />
            </View>
            
            <FlatList
                contentContainerStyle={styles.list}
                data={patients}
                keyExtractor={(item) => item.id}
                renderItem={renderPatient}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchPatients} />}
                ListEmptyComponent={
                    !loading && <Text style={styles.emptyText}>No patients assigned.</Text>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: colors.border },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: colors.slateDark },
    logoutBtn: { paddingVertical: 8, paddingHorizontal: 12, marginVertical: 0 },
    list: { padding: 16, paddingBottom: 100 },
    cardContainer: { padding: 16 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    patientEmail: { fontSize: 16, fontWeight: 'bold', color: colors.slateDark },
    statusBadge: { fontSize: 12, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
    lastVisit: { fontSize: 14, color: colors.textSecondary },
    emptyText: { textAlign: 'center', marginTop: 40, color: colors.textSecondary, fontSize: 16 }
});

export default WorkerDashboardScreen;
