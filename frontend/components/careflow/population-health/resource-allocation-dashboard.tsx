"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { PopulationAggregateResponse, PopulationGroup } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { AlertCircle, TrendingUp } from "lucide-react"

const COLORS = {
  red: "#f7c9c5",
  yellow: "#f4ddb3",
  green: "#9ce6df",
}

export function ResourceAllocationDashboard() {
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
            <p className="text-foreground/60">Loading resource allocation data...</p>
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

  const totalPopulation = data.groups.reduce((sum, g) => sum + g.population, 0)
  const totalRed = data.groups.reduce((sum, g) => sum + g.risk_distribution.red, 0)
  const totalYellow = data.groups.reduce((sum, g) => sum + g.risk_distribution.yellow, 0)
  const totalGreen = data.groups.reduce((sum, g) => sum + g.risk_distribution.green, 0)
  const avgRiskScore =
    data.groups.reduce((sum, g) => sum + g.avg_risk_score * g.population, 0) / totalPopulation

  const pieData = [
    { name: "High Risk", value: totalRed, color: COLORS.red },
    { name: "Medium Risk", value: totalYellow, color: COLORS.yellow },
    { name: "Low Risk", value: totalGreen, color: COLORS.green },
  ]

  const barData = data.groups
    .sort((a, b) => b.population - a.population)
    .slice(0, 10)
    .map((group) => ({
      name: group.phc.slice(0, 12),
      Red: group.risk_distribution.red,
      Yellow: group.risk_distribution.yellow,
      Green: group.risk_distribution.green,
      population: group.population,
    }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Population</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalPopulation.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>High Risk (Red)</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#c85a5a]">{totalRed}</p>
            <p className="text-xs text-foreground/60 mt-1">
              {((totalRed / totalPopulation) * 100).toFixed(1)}% of population
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Medium Risk (Yellow)</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#d4a574]">{totalYellow}</p>
            <p className="text-xs text-foreground/60 mt-1">
              {((totalYellow / totalPopulation) * 100).toFixed(1)}% of population
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Average Risk Score</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{avgRiskScore.toFixed(1)}</p>
            <p className="text-xs text-foreground/60 mt-1">out of 100</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
            <CardDescription>Population breakdown by risk tier</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 10 Locations</CardTitle>
            <CardDescription>Risk distribution by geographic area</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Red" stackId="a" fill={COLORS.red} />
                <Bar dataKey="Yellow" stackId="a" fill={COLORS.yellow} />
                <Bar dataKey="Green" stackId="a" fill={COLORS.green} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed View</CardTitle>
          <CardDescription>Population metrics for each location</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 font-semibold">Location (PHC)</th>
                  <th className="text-right py-2 px-2 font-semibold">Population</th>
                  <th className="text-right py-2 px-2 font-semibold">Avg Risk Score</th>
                  <th className="text-right py-2 px-2 font-semibold">High Risk</th>
                  <th className="text-right py-2 px-2 font-semibold">Medium Risk</th>
                  <th className="text-right py-2 px-2 font-semibold">Low Risk</th>
                </tr>
              </thead>
              <tbody>
                {data.groups
                  .sort((a, b) => b.population - a.population)
                  .slice(0, 20)
                  .map((group) => (
                    <tr key={group.phc} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-2 font-medium">{group.phc}</td>
                      <td className="text-right py-2 px-2">{group.population}</td>
                      <td className="text-right py-2 px-2">{group.avg_risk_score.toFixed(1)}</td>
                      <td className="text-right py-2 px-2 text-[#c85a5a]">{group.risk_distribution.red}</td>
                      <td className="text-right py-2 px-2 text-[#d4a574]">{group.risk_distribution.yellow}</td>
                      <td className="text-right py-2 px-2 text-[#5eb0a1]">{group.risk_distribution.green}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
