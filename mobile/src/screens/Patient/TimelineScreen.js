import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, ActivityIndicator,
    TouchableOpacity
} from 'react-native';
import apiClient from '../../api/client';
import GlassCard from '../../components/GlassCard';
import { colors } from '../../theme/colors';

// ─── Digital Twin State Mutation Engines ─────────────────────────

/**
 * Path A: "Natural Progression" Twin — Biological Drift
 * At each quarter, the patient's state DETERIORATES from lack of intervention.
 * Logic mirrors clinical reality:
 *   - Untreated High BP → BMI and cardiovascular load creep upward
 *   - Continued smoking → weight gain, reduced lung capacity
 *   - No physical activity → eventual mobility issues (DiffWalk)
 */
const applyNaturalDrift = (baseState, quarter) => {
    const s = { ...baseState };
    // BMI creeps up: +0.4 per quarter if HighBP, +0.2 per quarter if smoker
    const bmiDrift = (s.HighBP === 1 ? 0.4 : 0.15) + (s.Smoker === 1 ? 0.2 : 0);
    s.BMI = parseFloat((baseState.BMI + bmiDrift * quarter).toFixed(1));
    // By quarter 3 (9 months), sedentary lifestyle causes mobility problems
    if (quarter >= 3 && s.PhysActivity === 0) s.DiffWalk = 1;
    // High cholesterol worsens without diet change
    if (quarter >= 2 && s.Veggies === 0) s.HighChol = 1;
    return s;
};

/**
 * Path B: "Optimized" Twin — AI Protocol Adherence
 * Progressive physiological impact of following the care plan:
 *   Month 3:  Quit smoking (immediate cardiovascular benefit)
 *   Month 6:  BMI −5% from sustained exercise, start veggies, physical activity
 *   Month 9:  HighBP controlled (medication + lifestyle), alcohol reduced
 *   Month 12: Cholesterol normalised, full mobility restored, BMI −15%
 */
const applyAdherentImprovements = (baseState, quarter) => {
    const s = { ...baseState };
    if (quarter >= 1) {
        // Month 3: Quit smoking
        s.Smoker = 0;
        s.PhysActivity = 1;
    }
    if (quarter >= 2) {
        // Month 6: Exercise effect on BMI (5% reduction), add veggies
        s.BMI = parseFloat((baseState.BMI * 0.95).toFixed(1));
        s.Veggies = 1;
    }
    if (quarter >= 3) {
        // Month 9: BP controlled via medication + lifestyle, reduce alcohol
        s.HighBP = 0;
        s.HvyAlcoholConsump = 0;
        s.BMI = parseFloat((baseState.BMI * 0.90).toFixed(1));
    }
    if (quarter >= 4) {
        // Month 12: Cholesterol normalised, mobility restored, BMI −15%
        s.HighChol = 0;
        s.DiffWalk = 0;
        s.BMI = parseFloat((baseState.BMI * 0.85).toFixed(1));
    }
    return s;
};

/**
 * Helper: Call the behavioral-sim API with a specific state and no habit changes
 * to get the ML model's risk score for that exact state.
 * modified_habits: {} means the model runs once on current_state only.
 */
const getModelScore = async (state) => {
    const res = await apiClient.post('/behavioral-sim/run', {
        current_state: state,
        modified_habits: {},
    });
    return parseFloat((res.data.current_risk * 100).toFixed(2));
};

// ─── UI Sub-components ───────────────────────────────────────────

const CHECKPOINTS = [
    { label: 'Now', months: 0 },
    { label: '3 Months', months: 3 },
    { label: '6 Months', months: 6 },
    { label: '9 Months', months: 9 },
    { label: '12 Months', months: 12 },
];

const getRiskColor = (pct) => {
    if (pct >= 60) return colors.critical;
    if (pct >= 35) return colors.warning;
    return colors.stable;
};

const getTierLabel = (pct) => {
    if (pct >= 60) return 'High Risk';
    if (pct >= 35) return 'Moderate';
    return 'Low Risk';
};

const TimelineEntry = ({ checkpoint, pct, prevPct, isLast, pathColor }) => {
    const color = getRiskColor(pct);
    const trend = prevPct != null ? pct - prevPct : 0;
    const trendIcon = trend > 0.5 ? '↑' : trend < -0.5 ? '↓' : '→';
    const trendColor = trend > 0.5 ? colors.critical : trend < -0.5 ? colors.stable : colors.textSecondary;

    return (
        <View style={entryStyles.row}>
            {/* Vertical line + dot */}
            <View style={entryStyles.lineCol}>
                <View style={[entryStyles.dot, { borderColor: color }]}>
                    <View style={[entryStyles.dotCore, { backgroundColor: color }]} />
                </View>
                {!isLast && <View style={[entryStyles.line, { backgroundColor: pathColor + '40' }]} />}
            </View>

            {/* Content card */}
            <View style={[entryStyles.card, { borderLeftColor: color }]}>
                <View style={entryStyles.headerRow}>
                    <Text style={entryStyles.monthLabel}>{checkpoint.label}</Text>
                    <View style={[entryStyles.badge, { backgroundColor: color + '18', borderColor: color }]}>
                        <Text style={[entryStyles.badgeText, { color }]}>{getTierLabel(pct)}</Text>
                    </View>
                </View>

                <View style={entryStyles.scoreRow}>
                    <Text style={[entryStyles.score, { color }]}>{pct.toFixed(2)}%</Text>
                    {prevPct != null && (
                        <Text style={[entryStyles.trend, { color: trendColor }]}>
                            {trendIcon} {Math.abs(trend).toFixed(2)}%
                        </Text>
                    )}
                </View>

                {checkpoint.months === 0 && (
                    <Text style={entryStyles.hint}>ML baseline — current visit</Text>
                )}
                {checkpoint.months === 3 && (
                    <Text style={entryStyles.hint}>
                        {pathColor === colors.stable ? 'Smoker off · Exercise started' : 'BMI drifting · Habits unchanged'}
                    </Text>
                )}
                {checkpoint.months === 6 && (
                    <Text style={entryStyles.hint}>
                        {pathColor === colors.stable ? 'BMI −5% · Veggies added' : 'High chol. worsening · No diet change'}
                    </Text>
                )}
                {checkpoint.months === 9 && (
                    <Text style={entryStyles.hint}>
                        {pathColor === colors.stable ? 'BP controlled · Alcohol reduced' : 'Mobility declining · BP untreated'}
                    </Text>
                )}
                {checkpoint.months === 12 && (
                    <Text style={entryStyles.hint}>
                        {pathColor === colors.stable ? 'Chol. normal · BMI −15% · Full adherence' : 'Full deterioration — Year 1 projection'}
                    </Text>
                )}
            </View>
        </View>
    );
};

const PathTimeline = ({ title, emoji, accentColor, subtitle, scores, loading }) => (
    <View style={[pStyles.container, { borderColor: accentColor + '50' }]}>
        <View style={pStyles.header}>
            <Text style={pStyles.emoji}>{emoji}</Text>
            <View style={{ flex: 1 }}>
                <Text style={[pStyles.title, { color: accentColor }]}>{title}</Text>
                <Text style={pStyles.subtitle}>{subtitle}</Text>
            </View>
            {loading && <ActivityIndicator size="small" color={accentColor} />}
        </View>

        {scores.map((pct, idx) => (
            <TimelineEntry
                key={idx}
                checkpoint={CHECKPOINTS[idx]}
                pct={pct}
                prevPct={idx > 0 ? scores[idx - 1] : null}
                isLast={idx === scores.length - 1}
                pathColor={accentColor}
            />
        ))}

        {/* Summary delta */}
        {scores.length === 5 && (
            <View style={[pStyles.summaryRow, { backgroundColor: accentColor + '10', borderColor: accentColor + '30' }]}>
                <Text style={[pStyles.summaryText, { color: accentColor }]}>
                    {scores[4] < scores[0]
                        ? `✅ ${(scores[0] - scores[4]).toFixed(2)}% risk reduction over 1 year`
                        : `⚠️ ${(scores[4] - scores[0]).toFixed(2)}% risk increase over 1 year`}
                </Text>
            </View>
        )}
    </View>
);

// ─── Main Screen ─────────────────────────────────────────────────

const TimelineScreen = () => {
    const [globalLoading, setGlobalLoading] = useState(true);
    const [driftLoading, setDriftLoading] = useState(true);
    const [adherentLoading, setAdherentLoading] = useState(true);
    const [error, setError] = useState(null);
    const [driftPath, setDriftPath] = useState([]);
    const [adherentPath, setAdherentPath] = useState([]);
    const [activeView, setActiveView] = useState('both');

    const runDigitalTwin = async () => {
        setGlobalLoading(true);
        setDriftLoading(true);
        setAdherentLoading(true);
        setError(null);
        setDriftPath([]);
        setAdherentPath([]);

        try {
            // 1. Fetch current patient profile
            const profileRes = await apiClient.get('/mobile/patient/me');
            const record = profileRes.data?.latest_record;

            if (!record) {
                setError('No clinical data found. A health worker must complete a visit first.');
                setGlobalLoading(false);
                return;
            }

            // 2. Reconstruct the RiskPredictionInput from the stored record
            const baseState = {
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
            };

            // 3. Get baseline score (Month 0 — same for both paths)
            const baselineScore = await getModelScore(baseState);
            setGlobalLoading(false);

            // 4. Run Path A (Natural Drift) — quarters 1..4
            const driftScores = [baselineScore];
            setDriftPath([baselineScore]);
            for (let q = 1; q <= 4; q++) {
                const mutatedState = applyNaturalDrift(baseState, q);
                const score = await getModelScore(mutatedState);
                driftScores.push(score);
                setDriftPath([...driftScores]); // live update
            }
            setDriftLoading(false);

            // 5. Run Path B (AI-Adherent) — quarters 1..4
            const adherentScores = [baselineScore];
            setAdherentPath([baselineScore]);
            for (let q = 1; q <= 4; q++) {
                const improvedState = applyAdherentImprovements(baseState, q);
                const score = await getModelScore(improvedState);
                adherentScores.push(score);
                setAdherentPath([...adherentScores]); // live update
            }
            setAdherentLoading(false);

        } catch (e) {
            console.error('Digital Twin error:', e);
            setError('Failed to run projections. ' + (e.response?.data?.detail || e.message || ''));
            setGlobalLoading(false);
            setDriftLoading(false);
            setAdherentLoading(false);
        }
    };

    useEffect(() => { runDigitalTwin(); }, []);

    if (globalLoading) return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primaryTeal} />
            <Text style={styles.loadingTitle}>Digital Twin Computing…</Text>
            <Text style={styles.loadingSubtitle}>Calling XGBoost model for baseline score</Text>
        </View>
    );

    if (error) return (
        <View style={styles.center}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={runDigitalTwin}>
                <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <ScrollView contentContainerStyle={styles.scroll}>
            {/* Header explanation */}
            <GlassCard style={styles.heroCard}>
                <Text style={styles.heroTitle}>🤖 Digital Twin — 1-Year Projection</Text>
                <Text style={styles.heroSubtitle}>
                    Your XGBoost model is called at each 3-month checkpoint with two different scenarios.
                    Every score below is a real ML inference, not an estimate.
                </Text>
                <View style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: colors.stable }]} />
                    <Text style={styles.legendText}>Path A: Follow AI Protocol</Text>
                    <View style={[styles.legendDot, { backgroundColor: colors.critical, marginLeft: 12 }]} />
                    <Text style={styles.legendText}>Path B: No Action Taken</Text>
                </View>
            </GlassCard>

            {/* View switcher */}
            <View style={styles.switcher}>
                {[['both', 'Both Paths'], ['follow', '✅ Follow'], ['ignore', '⚠️ No Action']].map(([key, label]) => (
                    <TouchableOpacity
                        key={key}
                        style={[styles.switchBtn, activeView === key && styles.switchBtnActive]}
                        onPress={() => setActiveView(key)}
                    >
                        <Text style={[styles.switchText, activeView === key && styles.switchTextActive]}>{label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Path B: AI-Adherent (shown first — good news first) */}
            {(activeView === 'both' || activeView === 'follow') && (
                <PathTimeline
                    title="If You Follow the AI Protocol"
                    emoji="✅"
                    accentColor={colors.stable}
                    subtitle="Quit smoking (M3) · Exercise + veggies (M6) · BP controlled (M9) · Full recovery (M12)"
                    scores={adherentPath}
                    loading={adherentLoading}
                />
            )}

            {/* Path A: Natural Drift */}
            {(activeView === 'both' || activeView === 'ignore') && (
                <PathTimeline
                    title="If You Take No Action"
                    emoji="⚠️"
                    accentColor={colors.critical}
                    subtitle="Biological drift applied: BMI, cholesterol, BP progressively worsen each quarter"
                    scores={driftPath}
                    loading={driftLoading}
                />
            )}

            <Text style={styles.mlNote}>
                🤖 All scores above are live XGBoost inferences. State mutations reflect clinical evidence of
                physiological change over time.
            </Text>
        </ScrollView>
    );
};

// ─── Styles ──────────────────────────────────────────────────────

const entryStyles = StyleSheet.create({
    row: { flexDirection: 'row', marginBottom: 0 },
    lineCol: { width: 24, alignItems: 'center' },
    dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', zIndex: 2 },
    dotCore: { width: 7, height: 7, borderRadius: 3.5 },
    line: { width: 2, flex: 1, minHeight: 20 },
    card: { flex: 1, marginLeft: 10, marginBottom: 14, backgroundColor: '#fff', borderRadius: 12, padding: 12, borderLeftWidth: 3, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    monthLabel: { fontSize: 12, fontWeight: '700', color: colors.slateDark },
    badge: { borderRadius: 6, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2 },
    badgeText: { fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase' },
    scoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 2 },
    score: { fontSize: 22, fontWeight: 'bold' },
    trend: { fontSize: 13, fontWeight: '700' },
    hint: { fontSize: 10, color: colors.textSecondary, fontStyle: 'italic', lineHeight: 14 },
});

const pStyles = StyleSheet.create({
    container: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, gap: 8 },
    emoji: { fontSize: 26 },
    title: { fontSize: 14, fontWeight: '700', marginBottom: 3 },
    subtitle: { fontSize: 10, color: colors.textSecondary, lineHeight: 14 },
    summaryRow: { marginTop: 8, borderRadius: 10, borderWidth: 1, padding: 10, alignItems: 'center' },
    summaryText: { fontSize: 13, fontWeight: '700' },
});

const styles = StyleSheet.create({
    scroll: { padding: 16, paddingBottom: 40 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, marginTop: 60 },
    loadingTitle: { marginTop: 16, color: colors.slateDark, fontSize: 16, fontWeight: '700' },
    loadingSubtitle: { marginTop: 6, color: colors.textSecondary, fontSize: 12, textAlign: 'center' },
    errorIcon: { fontSize: 40, marginBottom: 12 },
    errorText: { fontSize: 14, color: colors.critical, textAlign: 'center', marginBottom: 16, lineHeight: 20 },
    retryBtn: { backgroundColor: colors.primaryTeal, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
    retryBtnText: { color: '#fff', fontWeight: '700' },
    heroCard: { marginBottom: 16 },
    heroTitle: { fontSize: 16, fontWeight: '700', color: colors.slateDark, marginBottom: 6 },
    heroSubtitle: { fontSize: 12, color: colors.textSecondary, lineHeight: 17, marginBottom: 10 },
    legendRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    legendText: { fontSize: 11, color: colors.textSecondary, fontWeight: '600' },
    switcher: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    switchBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: '#f8fafc' },
    switchBtnActive: { backgroundColor: colors.primaryTeal, borderColor: colors.primaryTeal },
    switchText: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },
    switchTextActive: { color: '#fff', fontWeight: '700' },
    mlNote: { fontSize: 10, color: colors.textSecondary, textAlign: 'center', fontStyle: 'italic', lineHeight: 14, paddingHorizontal: 8, marginTop: 4 },
});

export default TimelineScreen;
