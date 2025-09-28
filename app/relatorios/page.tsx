"use client"

import { useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart, PieChart } from "lucide-react"
import { mockOrcamentos, mockFinanceiroMovimentos, mockEntregas, mockUsers } from "@/lib/mock-data"
import { useAuth } from "@/contexts/auth-context"
import { format, subMonths, isSameMonth } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts"

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-border">
        <p className="font-bold">{label}</p>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold">{data.name}:</span> {data.value}
        </p>
      </div>
    )
  }
  return null
}

export default function RelatoriosPage() {
  const { user, empresa } = useAuth()
  if (!user || !empresa) return null

  // Filtra dados pela empresa
  const orcamentosEmpresa = mockOrcamentos.filter(o => o.empresaId === empresa.id)
  const financeiroEmpresa = mockFinanceiroMovimentos.filter(m => m.empresaId === empresa.id)
  const entregasEmpresa = mockEntregas.filter(e => e.empresaId === empresa.id)

  // Dados para Relatório de Orçamentos
  const orcamentoStatusData = [
    { name: "Aprovados", value: orcamentosEmpresa.filter(o => o.status === "aprovado").length },
    { name: "Enviados", value: orcamentosEmpresa.filter(o => o.status === "enviado").length },
  ]
  const PIE_COLORS = ["hsl(var(--primary))", "#FFC107", "#EF4444"]

  // Dados para Relatório Financeiro
  const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), i)
    return format(date, "MMM yyyy", { locale: ptBR })
  }).reverse()

  const financialChartData = lastSixMonths.map(month => {
    const monthData = financeiroEmpresa.filter(m => isSameMonth(new Date(m.date), new Date(month)))
    const receita = monthData.filter(m => m.type === "receita").reduce((sum, m) => sum + m.amount, 0)
    const despesa = monthData.filter(m => m.type === "despesa").reduce((sum, m) => sum + m.amount, 0)
    return { name: month, Receita: receita, Despesa: despesa }
  })

  // Dados para Relatório de Entregas
  const entregasPorMotorista = entregasEmpresa.reduce((acc, entrega) => {
    const motorista = mockUsers.find(u => u.id === entrega.motoristId)
    if (motorista) {
      acc[motorista.name] = (acc[motorista.name] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const entregasChartData = Object.entries(entregasPorMotorista).map(([name, count]) => ({
    name,
    entregas: count,
  }))

  return (
    <AppLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Relatórios</h1>
              <p className="text-muted-foreground">Visualize o desempenho da sua empresa com dados</p>
            </div>
          </div>

          <Tabs defaultValue="orcamentos">
            <TabsList>
              <TabsTrigger value="orcamentos">Orçamentos</TabsTrigger>
              <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
              <TabsTrigger value="entregas">Entregas</TabsTrigger>
            </TabsList>

            <TabsContent value="orcamentos">
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Status dos Orçamentos</CardTitle>
                  <CardDescription>
                    Distribuição de orçamentos por status (aprovado, enviado).
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={orcamentoStatusData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {orcamentoStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financeiro">
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Receita vs Despesa (Últimos 6 meses)</CardTitle>
                  <CardDescription>
                    Comparativo do fluxo de caixa ao longo do tempo.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={financialChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="Receita" stroke="hsl(var(--primary))" />
                        <Line type="monotone" dataKey="Despesa" stroke="hsl(var(--destructive))" />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="entregas">
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Entregas por Motorista</CardTitle>
                  <CardDescription>
                    Número de entregas concluídas por cada motorista da sua frota.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={entregasChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="entregas" fill="hsl(var(--primary))" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  )
}