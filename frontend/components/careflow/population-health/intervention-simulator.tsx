"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { PopulationAggregateResponse, InterventionConfig } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, TrendingDown } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts"

const COLORS = {
    red: "#f7c9c5",
    yellow: "#f4ddb3",
    green: "#9ce6df",
}

export function InterventionSimulator() {
    const [intervention, setIntervention] = useState<InterventionConfig>({
        home_visit_increase: 0,
        counseling_sessions: 0,
        screening_boost: 0,
    })

    const [simData, setSimData] = useState<PopulationAggregateResponse | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSimulate = async () => {
        try {
            setLoading(true)
            const response = await api.simulateIntervention({
                source: "csv",
                location_field: "City",
                forecast_months: 6,
                intervention,
            })
            setSimData(response)
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to run simulation")
        } finally {
            setLoading(false)
        }
    }

    const updateIntervention = (key: keyof InterventionConfig, value: number) => {
        setIntervention((prev) => ({ ...prev, [key]: value }))
    }

    // Calculate aggregated impact
    const totalBefore = simData
        ? simData.groups.reduce((sum, g) => sum + g.intervention_impact.before_hospitalizations, 0)
        : 0
    const totalAfter = simData
        ? simData.groups.reduce((sum, g) => sum + g.intervention_impact.after_hospitalizations, 0)
        : 0
    const avgReduction = simData
        ? simData.groups.reduce((sum, g) => sum + g.intervention_impact.reduction_percent, 0) / simData.groups.length
        : 0

    // Chart data for impact by location
    const impactData = simData
        ? simData.groups
            .sort((a, b) => b.intervention_impact.reduction_percent - a.intervention_impact.reduction_percent)
            .slice(0, 10)
            .map((group) => ({
                name: group.phc.slice(0, 12),
                before: group.intervention_impact.before_hospitalizations,
                after: group.intervention_impact.after_hospitalizations,
                reduction: group.intervention_impact.reduction_percent,
            }))
        : []

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Intervention Configuration</CardTitle>
                    <CardDescription>Adjust parameters to see projected outcomes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="font-semibold">
                                    Home Visits Increase: <span className="text-primary">{intervention.home_visit_increase}%</span>
                                </label>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={intervention.home_visit_increase}
                                onChange={(e) => updateIntervention("home_visit_increase", parseInt(e.target.value))}
                                className="w-full"
                            />
                            <p className="text-xs text-foreground/60 mt-1">
                                Increases home visits to high-risk patients to reduce risk by up to 10%
                            </p>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="font-semibold">
                                    Counseling Sessions: <span className="text-primary">{intervention.counseling_sessions}%</span>
                                </label>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={intervention.counseling_sessions}
                                onChange={(e) => updateIntervention("counseling_sessions", parseInt(e.target.value))}
                                className="w-full"
                            />
                            <p className="text-xs text-foreground/60 mt-1">
                                Targeted smoking cessation and lifestyle counseling reduces smoker-related risk by up to 8%
                            </p>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="font-semibold">
                                    Screening Boost: <span className="text-primary">{intervention.screening_boost}%</span>
                                </label>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={intervention.screening_boost}
                                onChange={(e) => updateIntervention("screening_boost", parseInt(e.target.value))}
                                className="w-full"
                            />
                            <p className="text-xs text-foreground/60 mt-1">
                                Early detection and preventive screenings reduce overall risk by up to 5%
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleSimulate}
                        disabled={loading}
                        className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 transition"
                    >
                        {loading ? "Simulating..." : "Run What-If Simulation"}
                    </button>
                </CardContent>
            </Card>

            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <div className="flex gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-red-900">Simulation error</p>
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {simData && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>Projected Hospitalizations (6 months)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-sm text-foreground/60">Before Intervention</p>
                                        <p className="text-2xl font-bold">{totalBefore}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-foreground/60">After Intervention</p>
                                        <p className="text-2xl font-bold text-green-600">{totalAfter}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>Total Reduction</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-green-600">{totalBefore - totalAfter}</p>
                                <p className="text-sm text-foreground/60 mt-2">fewer hospitalizations projected</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>Average Reduction Rate</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-green-600">{avgReduction.toFixed(1)}%</p>
                                <p className="text-sm text-foreground/60 mt-2">across all locations</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Impact by Location (Top 10)</CardTitle>
                            <CardDescription>Hospitalization reduction forecast</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={impactData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" fontSize={12} />
                                    <YAxis yAxisId="left" />
                                    <YAxis yAxisId="right" orientation="right" />
                                    <Tooltip />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="before" fill="rgba(0,0,0,0.3)" name="Before" />
                                    <Bar yAxisId="left" dataKey="after" fill={COLORS.green} name="After" />
                                    <Bar yAxisId="right" dataKey="reduction" fill={COLORS.red} name="Reduction %" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Risk Tier Shifts</CardTitle>
                            <CardDescription>How the population distribution moves after intervention</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2 px-2 font-semibold">Location</th>
                                            <th className="text-right py-2 px-2 font-semibold">High Risk Before</th>
                                            <th className="text-right py-2 px-2 font-semibold">High Risk After</th>
                                            <th className="text-right py-2 px-2 font-semibold">Saved from High Risk</th>
                                            <th className="text-right py-2 px-2 font-semibold">Reduction %</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {simData.groups
                                            .sort((a, b) => b.intervention_impact.reduction_percent - a.intervention_impact.reduction_percent)
                                            .slice(0, 15)
                                            .map((group) => {
                                                const savedCount =
                                                    (group.intervention_impact.before_hospitalizations -
                                                        group.intervention_impact.after_hospitalizations) *
                                                    (group.population /
                                                        (group.risk_distribution.red +
                                                            group.risk_distribution.yellow +
                                                            group.risk_distribution.green))
                                                return (
                                                    <tr key={group.phc} className="border-b hover:bg-muted/50">
                                                        <td className="py-2 px-2 font-medium">{group.phc}</td>
                                                        <td className="text-right py-2 px-2">{group.risk_distribution.red}</td>
                                                        <td className="text-right py-2 px-2 text-green-600">
                                                            {Math.max(
                                                                0,
                                                                group.risk_distribution.red -
                                                                Math.round(group.risk_distribution.red * (group.intervention_impact.reduction_percent / 100))
                                                            )}
                                                        </td>
                                                        <td className="text-right py-2 px-2 text-green-600">
                                                            {Math.round(group.risk_distribution.red * (group.intervention_impact.reduction_percent / 100))}
                                                        </td>
                                                        <td className="text-right py-2 px-2 font-semibold">
                                                            {group.intervention_impact.reduction_percent.toFixed(1)}%
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
