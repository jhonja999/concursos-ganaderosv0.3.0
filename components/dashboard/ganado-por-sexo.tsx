"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface GanadoPorSexoProps {
  data: {
    sexo: string
    porcentaje: number
  }[]
}

export function GanadoPorSexo({ data }: GanadoPorSexoProps) {
  const chartData = data.map((item) => ({
    name: item.sexo === "MACHO" ? "Machos" : "Hembras",
    value: item.porcentaje,
  }))

  const COLORS = ["#8884d8", "#82ca9d"]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ganado por Sexo</CardTitle>
        <CardDescription>Distribución de ganado por sexo</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
