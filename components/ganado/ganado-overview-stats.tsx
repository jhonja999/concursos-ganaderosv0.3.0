"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts"

interface EstadisticaItem {
  name: string
  value: number
  porcentaje: number
}

interface GanadoOverviewStatsProps {
  totalGanado: number
  datosSexo: EstadisticaItem[]
  datosRaza: EstadisticaItem[]
  datosEstablo: EstadisticaItem[]
  datosConcursos: EstadisticaItem[]
}

export function GanadoOverviewStats({
  totalGanado,
  datosSexo,
  datosRaza,
  datosEstablo,
  datosConcursos,
}: GanadoOverviewStatsProps) {
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
        <CardTitle>Estadísticas del Ganado</CardTitle>
        <CardDescription>Distribución del ganado por diferentes criterios</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="sexo">Por Sexo</TabsTrigger>
            <TabsTrigger value="raza">Por Raza</TabsTrigger>
            <TabsTrigger value="establo">Por Establo</TabsTrigger>
            <TabsTrigger value="concursos">Por Concursos</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Ganado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalGanado}</div>
                  <p className="text-xs text-muted-foreground">Ejemplares registrados en el sistema</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Machos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {datosSexo.find((item) => item.name === "Machos")?.value || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {datosSexo.find((item) => item.name === "Machos")?.porcentaje || 0}% del total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Hembras</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {datosSexo.find((item) => item.name === "Hembras")?.value || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {datosSexo.find((item) => item.name === "Hembras")?.porcentaje || 0}% del total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Razas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{datosRaza.length}</div>
                  <p className="text-xs text-muted-foreground">Razas diferentes registradas</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sexo">
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={datosSexo}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {datosSexo.map((entry, index) => (
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
                      <th className="text-left p-2">Sexo</th>
                      <th className="text-right p-2">Cantidad</th>
                      <th className="text-right p-2">Porcentaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datosSexo.map((item, index) => (
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

          <TabsContent value="raza">
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={datosRaza.slice(0, 10)} // Mostrar solo las 10 razas más comunes
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {datosRaza.slice(0, 10).map((entry, index) => (
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
                      data={datosEstablo.slice(0, 10)} // Mostrar solo los 10 establos más comunes
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {datosEstablo.slice(0, 10).map((entry, index) => (
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

          <TabsContent value="concursos">
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={datosConcursos.sort((a, b) => b.value - a.value).slice(0, 10)}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip formatter={(value: number) => [`${value} ejemplares`, "Participantes"]} />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-auto max-h-[300px]">
                <table className="w-full">
                  <thead className="sticky top-0 bg-background">
                    <tr className="border-b">
                      <th className="text-left p-2">Concurso</th>
                      <th className="text-right p-2">Participantes</th>
                      <th className="text-right p-2">Porcentaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datosConcursos
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
