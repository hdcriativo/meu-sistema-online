import { MetricsCard } from "./metrics-card"
import { RecentActivities } from "./recent-activities"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, Users, DollarSign, Target, Clock } from "lucide-react"

const myOrcamentos = [
  {
    id: "1",
    cliente: "Construtora ABC",
    obra: "Edifício Residencial Central",
    valor: "R$ 42.000",
    status: "aprovado" as const,
    prazo: "2 dias",
  },
  {
    id: "2",
    cliente: "Engenharia XYZ",
    obra: "Shopping Center Norte",
    valor: "R$ 85.000",
    status: "pendente" as const,
    prazo: "5 dias",
  },
  {
    id: "3",
    cliente: "Construtora DEF",
    obra: "Condomínio Jardins",
    valor: "R$ 28.000",
    status: "rascunho" as const,
    prazo: "1 dia",
  },
]

const statusColors = {
  aprovado: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  pendente: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  rascunho: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  rejeitado: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export function VendedorDashboard() {
  return (
    <div className="space-y-6">
      {/* Vendedor metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard title="Meus Orçamentos" value="18" change="3 pendentes" changeType="neutral" icon={FileText} />
        <MetricsCard
          title="Vendas do Mês"
          value="R$ 89k"
          change="+22% vs mês anterior"
          changeType="positive"
          icon={DollarSign}
        />
        <MetricsCard title="Meta Mensal" value="78%" change="R$ 25k restantes" changeType="positive" icon={Target} />
        <MetricsCard title="Meus Clientes" value="12" change="2 novos este mês" changeType="positive" icon={Users} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meus Orçamentos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Meus Orçamentos</CardTitle>
            <Button size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Novo Orçamento
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myOrcamentos.map((orcamento) => (
                <div key={orcamento.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-foreground">{orcamento.cliente}</h4>
                      <p className="text-sm text-muted-foreground">{orcamento.obra}</p>
                    </div>
                    <Badge className={statusColors[orcamento.status]}>{orcamento.status}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{orcamento.valor}</span>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      {orcamento.prazo}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <RecentActivities />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent">
              <FileText className="h-6 w-6" />
              <span>Criar Orçamento</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent">
              <Users className="h-6 w-6" />
              <span>Contatar Cliente</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent">
              <Calendar className="h-6 w-6" />
              <span>Ver Agendamentos</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
