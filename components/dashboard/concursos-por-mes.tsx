"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"

const data = [
  { name: "Ene", value: 4 },
  { name: "Feb", value: 3 },
  { name: "Mar", value: 5 },
  { name: "Abr", value: 7 },
  { name: "May", value: 5 },
  { name: "Jun", value: 6 },
  { name: "Jul", value: 7 },
  { name: "Ago", value: 9 },
  { name: "Sep", value: 8 },
  { name: "Oct", value: 6 },
  { name: "Nov", value: 5 },
  { name: "Dic", value: 4 },
]

export function ConcursosPorMes() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Concursos por Mes</CardTitle>
        <CardDescription>Distribución de concursos a lo largo del año</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
