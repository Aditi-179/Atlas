"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { PopulationAggregateResponse, PopulationGroup } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, TrendingUp, AlertTriangle, Zap } from "lucide-react"

export function PopulationInsights() {
    const [data, setData] = useState<PopulationAggregateResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const response = await api.getResourceAllocation("csv", "City")
                setData(response)
                setError(null)
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load data")
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center h-64">
                        <p className="text-foreground/60">Loading insights...</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                    <div className="flex gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-red-900">Error loading data</p>
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!data || data.groups.length === 0) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-center text-foreground/60">No population data available</p>
                </CardContent>
            </Card>
        )
    }

    const groups = data.groups
    const highRiskGroups = groups
        .filter((g) => (g.risk_distribution.red / g.population) * 100 > 20)
        .sort((a, b) => (b.risk_distribution.red / b.population) - (a.risk_distribution.red / a.population))

    const lowEngagementGroups = groups.filter((g) => g.population < 10)

    const highBurdenGroups = groups
        .filter((g) => g.avg_risk_score > 60)
        .sort((a, b) => b.avg_risk_score - a.avg_risk_score)

    const totalPopulation = groups.reduce((sum, g) => sum + g.population, 0)
    const totalHighRisk = groups.reduce((sum, g) => sum + g.risk_distribution.red, 0)
    const avgRiskScore = groups.reduce((sum, g) => sum + g.avg_risk_score * g.population, 0) / totalPopulation

    const recommendations = generateRecommendations({
        groups,
        totalHighRisk,
        totalPopulation,
        avgRiskScore,
        highRiskGroups,
        highBurdenGroups,
    })

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card className="border-red-200 bg-red-50">
                    <CardHeader className="pb-3">
                        <CardDescription className="text-red-900">High-Risk Locations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-red-600">{highRiskGroups.length}</p>
                        <p className="text-xs text-red-800 mt-1">
                            {((highRiskGroups.length / groups.length) * 100).toFixed(0)}% of all locations
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-yellow-200 bg-yellow-50">
                    <CardHeader className="pb-3">
                        <CardDescription className="text-yellow-900">Population Burden</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-yellow-600">{totalHighRisk}</p>
                        <p className="text-xs text-yellow-800 mt-1">
                            people at high risk ({((totalHighRisk / totalPopulation) * 100).toFixed(1)}%)
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Average Risk Score</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{avgRiskScore.toFixed(1)}</p>
                        <p className="text-xs text-foreground/60 mt-1">
                            {avgRiskScore > 50 ? "Elevated - Priority intervention needed" : "Moderate - Continue monitoring"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex gap-2 items-center">
                        <Zap className="h-5 w-5" />
                        Strategic Recommendations
                    </CardTitle>
                    <CardDescription>AI-generated insights based on population health data</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recommendations.map((rec, idx) => (
                            <div key={idx} className={`p-4 rounded-lg border ${rec.priority === "high" ? "border-red-200 bg-red-50" : rec.priority === "medium" ? "border-yellow-200 bg-yellow-50" : "border-green-200 bg-green-50"}`}>
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0 mt-0.5">
                                        {rec.priority === "high" && <AlertTriangle className="h-5 w-5 text-red-600" />}
                                        {rec.priority === "medium" && <AlertCircle className="h-5 w-5 text-yellow-600" />}
                                        {rec.priority === "low" && <TrendingUp className="h-5 w-5 text-green-600" />}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground">{rec.title}</p>
                                        <p className="text-sm text-foreground/75 mt-1">{rec.description}</p>
                                        {rec.action && <p className="text-xs mt-2 font-medium text-primary">→ {rec.action}</p>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {highRiskGroups.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Highest Risk Locations (Intervention Priority)</CardTitle>
                        <CardDescription>Focus resources on these areas first</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {highRiskGroups.slice(0, 8).map((group) => (
                                <div key={group.phc} className="p-3 rounded-lg border border-border hover:bg-muted/50 transition">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-semibold">{group.phc}</p>
                                            <p className="text-sm text-foreground/60">Population: {group.population.toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-red-600">{group.risk_distribution.red}</p>
                                            <p className="text-xs text-foreground/60">
                                                {((group.risk_distribution.red / group.population) * 100).toFixed(0)}% high risk
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex gap-2">
                                        <div className="flex-1">
                                            <div className="text-xs text-foreground/60 mb-1">Risk Profile</div>
                                            <div className="w-full h-2 rounded-full bg-border flex overflow-hidden">
                                                <div
                                                    className="bg-red-500"
                                                    style={{
                                                        width: `${(group.risk_distribution.red / group.population) * 100}%`,
                                                    }}
                                                />
                                                <div
                                                    className="bg-yellow-500"
                                                    style={{
                                                        width: `${(group.risk_distribution.yellow / group.population) * 100}%`,
                                                    }}
                                                />
                                                <div
                                                    className="bg-green-500"
                                                    style={{
                                                        width: `${(group.risk_distribution.green / group.population) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-foreground/60 mt-2">Avg Risk Score: {group.avg_risk_score.toFixed(1)}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {highBurdenGroups.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>High-Burden Locations (Avg Risk Score &gt; 60)</CardTitle>
                        <CardDescription>Areas needing intensive intervention programs</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {highBurdenGroups.slice(0, 6).map((group) => (
                                <div key={group.phc} className="p-3 rounded-lg border border-yellow-200 bg-yellow-50">
                                    <p className="font-semibold text-yellow-900">{group.phc}</p>
                                    <p className="text-sm text-yellow-800 mt-1">Population: {group.population}</p>
                                    <p className="text-2xl font-bold text-yellow-600 mt-2">{group.avg_risk_score.toFixed(1)}</p>
                                    <p className="text-xs text-yellow-700 mt-1">Average risk score</p>
                                    <div className="mt-3 space-y-1">
                                        <p className="text-xs font-semibold">Recommendations:</p>
                                        <ul className="text-xs text-yellow-800 space-y-0.5">
                                            <li>• Increase home visit frequency</li>
                                            <li>• Deploy mobile health clinics</li>
                                            <li>• Implement screening camps</li>
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Data Quality & Coverage</CardTitle>
                    <CardDescription>Summary of your current data collection</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-semibold text-foreground/60 mb-2">Total Locations Covered</p>
                            <p className="text-2xl font-bold">{groups.length}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-foreground/60 mb-2">Total Population Monitored</p>
                            <p className="text-2xl font-bold">{totalPopulation.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-foreground/60 mb-2">Avg Population per Location</p>
                            <p className="text-2xl font-bold">{Math.round(totalPopulation / groups.length)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-foreground/60 mb-2">High-Risk Concentration</p>
                            <p className="text-2xl font-bold">
                                {((highBurdenGroups.length / groups.length) * 100).toFixed(0)}%
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

interface RecommendationInput {
    groups: PopulationGroup[]
    totalHighRisk: number
    totalPopulation: number
    avgRiskScore: number
    highRiskGroups: PopulationGroup[]
    highBurdenGroups: PopulationGroup[]
}

function generateRecommendations(input: RecommendationInput) {
    const recommendations: Array<{
        title: string
        description: string
        action?: string
        priority: "high" | "medium" | "low"
    }> = []

    const highRiskPercent = (input.totalHighRisk / input.totalPopulation) * 100

    if (highRiskPercent > 25) {
        recommendations.push({
            title: "Critical: High Disease Burden Detected",
            description: `${highRiskPercent.toFixed(0)}% of your population is at high risk. This exceeds global NCD prevention targets and requires immediate scaled intervention.`,
            action: "Launch intensive intervention in top 5 locations using the What-If Simulator",
            priority: "high",
        })
    }

    if (input.highRiskGroups.length > input.groups.length * 0.3) {
        recommendations.push({
            title: "Geographic Concentration Strategy Needed",
            description: `${input.highRiskGroups.length} out of ${input.groups.length} locations have >20% high-risk population. Consider clustering interventions geographically.`,
            action: "Group by district and allocate mobile health teams",
            priority: "high",
        })
    }

    if (input.avgRiskScore > 50) {
        recommendations.push({
            title: "Preventive Screening Programs",
            description:
                "Average risk score of " +
                input.avgRiskScore.toFixed(1) +
                " suggests significant preventable disease burden. Early detection can reduce severity.",
            action: "Organize quarterly screening camps in high-burden locations",
            priority: "medium",
        })
    }

    if (input.highBurdenGroups.length > 0) {
        recommendations.push({
            title: "Home Visit and Counseling Focus",
            description: `${input.highBurdenGroups.length} locations have avg risk >60. These areas benefit most from intensive counseling and behavior change programs.`,
            action: "Use the What-If Simulator with 60%+ counseling to forecast outcomes",
            priority: "high",
        })
    }

    recommendations.push({
        title: "Leverage Data for Targeting",
        description: "Your baseline data is now established. Use the What-If Simulator to model intervention scenarios and validate assumptions.",
        action: "Test scenarios: home visits only vs. counseling vs. screening combinations",
        priority: "medium",
    })

    recommendations.push({
        title: "Six-Month Impact Tracking",
        description: "Simulate a 6-month intervention cycle to forecast hospitalizations and plan resource allocation accordingly.",
        action: "Run simulation for your proposed intervention mix and review hospitalization reduction %",
        priority: "medium",
    })

    if (input.groups.some((g) => g.population < 5)) {
        recommendations.push({
            title: "Data Quality: Low-Sample Locations",
            description: "Some locations have <5 people monitored, which may not be statistically reliable for planning.",
            action: "Prioritize data collection in undercovered areas",
            priority: "low",
        })
    }

    return recommendations
}
