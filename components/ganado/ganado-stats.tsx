"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface EstadisticaItem {
  name: string
  value: number
  porcentaje: number
}

interface GanadoStatsProps {
  totalGanado: number
  datosRaza: EstadisticaItem[]
  datosEstablo: EstadisticaItem[]
  concursoNombre: string
}

export function GanadoStats({ totalGanado, datosRaza, datosEstablo, concursoNombre }: GanadoStatsProps) {
  const COLORS = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
    "#0088fe",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#a4de6c",
    "#d0ed57",
  ]

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return percent > 0.05 ? (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fontSize={12}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estadísticas del Ganado - {concursoNombre}</CardTitle>
        <CardDescription>Distribución del ganado por raza y establo</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="raza">Por Raza</TabsTrigger>
            <TabsTrigger value="establo">Por Establo</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Ganado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalGanado}</div>
                  <p className="text-xs text-muted-foreground">Ejemplares registrados en el concurso</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Razas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{datosRaza.length}</div>
                  <p className="text-xs text-muted-foreground">Razas diferentes en el concurso</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Establos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{datosEstablo.length}</div>
                  <p className="text-xs text-muted-foreground">Establos participantes</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="raza">
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={datosRaza}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {datosRaza.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `${value} (${((value / totalGanado) * 100).toFixed(1)}%)`,
                        name,
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-auto max-h-[300px]">
                <table className="w-full">
                  <thead className="sticky top-0 bg-background">
                    <tr className="border-b">
                      <th className="text-left p-2">Raza</th>
                      <th className="text-right p-2">Cantidad</th>
                      <th className="text-right p-2">Porcentaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datosRaza
                      .sort((a, b) => b.value - a.value)
                      .map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{item.name}</td>
                          <td className="text-right p-2">{item.value}</td>
                          <td className="text-right p-2">{item.porcentaje}%</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="establo">
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={datosEstablo}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {datosEstablo.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `${value} (${((value / totalGanado) * 100).toFixed(1)}%)`,
                        name,
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-auto max-h-[300px]">
                <table className="w-full">
                  <thead className="sticky top-0 bg-background">
                    <tr className="border-b">
                      <th className="text-left p-2">Establo</th>
                      <th className="text-right p-2">Cantidad</th>
                      <th className="text-right p-2">Porcentaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datosEstablo
                      .sort((a, b) => b.value - a.value)
                      .map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{item.name}</td>
                          <td className="text-right p-2">{item.value}</td>
                          <td className="text-right p-2">{item.porcentaje}%</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
