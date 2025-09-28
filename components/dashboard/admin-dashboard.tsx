import { MetricsCard } from "./metrics-card"
import { RecentActivities } from "./recent-activities"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { FileText, Calendar, Truck, DollarSign, Users, Building2, TrendingUp, AlertTriangle } from "lucide-react"

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Main metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          title="Orçamentos Pendentes"
          value="12"
          change="+2 desde ontem"
          changeType="positive"
          icon={FileText}
        />
        <MetricsCard title="Entregas Hoje" value="5" change="3 concluídas" changeType="positive" icon={Truck} />
        <MetricsCard
          title="Obras Ativas"
          value="8"
          change="2 iniciando esta semana"
          changeType="positive"
          icon={Building2}
        />
        <MetricsCard
          title="Receita Mensal"
          value="R$ 125k"
          change="+15% vs mês anterior"
          changeType="positive"
          icon={DollarSign}
        />
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricsCard title="Clientes Ativos" value="24" change="+3 este mês" changeType="positive" icon={Users} />
        <MetricsCard
          title="Volume Total (m³)"
          value="1,250"
          change="+8% vs mês anterior"
          changeType="positive"
          icon={TrendingUp}
        />
        <MetricsCard
          title="Pagamentos Pendentes"
          value="R$ 45k"
          change="3 em atraso"
          changeType="negative"
          icon={AlertTriangle}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <RecentActivities />

        {/* Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Desempenho Mensal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Meta de Vendas</span>
                <span>75%</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Entregas no Prazo</span>
                <span>92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Satisfação do Cliente</span>
                <span>88%</span>
              </div>
              <Progress value={88} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Utilização da Frota</span>
                <span>67%</span>
              </div>
              <Progress value={67} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent">
              <FileText className="h-6 w-6" />
              <span>Novo Orçamento</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent">
              <Calendar className="h-6 w-6" />
              <span>Agendar Entrega</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent">
              <Users className="h-6 w-6" />
              <span>Cadastrar Cliente</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent">
              <Building2 className="h-6 w-6" />
              <span>Nova Obra</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
