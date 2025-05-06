"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"

const data = [
  { name: "A - Terneras", value: 2.0 },
  { name: "B - Dos Dientes", value: 1.5 },
  { name: "C - Cuatro Dientes", value: 1.0 },
  { name: "D - Seis Dientes", value: 0.8 },
  { name: "E - Boca Llena", value: 2.5 },
]

export function GanadoPorCategoria() {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Ganado por Categoría</CardTitle>
        <CardDescription>Distribución de ganado por categoría</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
