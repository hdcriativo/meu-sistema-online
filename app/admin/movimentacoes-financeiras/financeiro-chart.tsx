"use client"

import { Card, CardContent } from "@/components/ui/card"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { FinanceiroMovimento } from "@/lib/types"

interface FinanceiroChartProps {
  data: FinanceiroMovimento[]
}

export function FinanceiroChart({ data }: FinanceiroChartProps) {
  const chartData = data
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((mov) => ({
      name: format(new Date(mov.date), "dd/MM"),
      Receita: mov.type === "receita" ? mov.amount : 0,
      Despesa: mov.type === "despesa" ? mov.amount : 0,
    }))

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Receita" stroke="hsl(var(--primary))" />
              <Line type="monotone" dataKey="Despesa" stroke="hsl(var(--destructive))" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}