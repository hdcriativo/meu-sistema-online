import { MetricsCard } from "./metrics-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Truck, Clock, MapPin, Calendar, CheckCircle, AlertCircle } from "lucide-react"

const minhasEntregas = [
  {
    id: "1",
    cliente: "Construtora ABC",
    obra: "Edifício Residencial Central",
    endereco: "Rua Central, 789 - São Paulo, SP",
    horario: "08:00",
    volume: "150m³",
    status: "agendado" as const,
  },
  {
    id: "2",
    cliente: "Engenharia XYZ",
    obra: "Shopping Center Norte",
    endereco: "Av. Norte, 1000 - São Paulo, SP",
    horario: "14:00",
    volume: "200m³",
    status: "em_transito" as const,
  },
  {
    id: "3",
    cliente: "Construtora DEF",
    obra: "Condomínio Jardins",
    endereco: "Rua das Flores, 456 - São Paulo, SP",
    horario: "16:30",
    volume: "100m³",
    status: "concluido" as const,
  },
]

const statusColors = {
  agendado: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  em_transito: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  concluido: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  cancelado: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

const statusIcons = {
  agendado: Clock,
  em_transito: Truck,
  concluido: CheckCircle,
  cancelado: AlertCircle,
}

export function MotoristaDashboard() {
  return (
    <div className="space-y-6">
      {/* Motorista metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard title="Entregas Hoje" value="3" change="1 concluída" changeType="positive" icon={Truck} />
        <MetricsCard title="Volume Total" value="450m³" change="Hoje" changeType="neutral" icon={Calendar} />
        <MetricsCard
          title="Entregas do Mês"
          value="45"
          change="+12% vs mês anterior"
          changeType="positive"
          icon={CheckCircle}
        />
        <MetricsCard title="Avaliação Média" value="4.8" change="⭐ Excelente" changeType="positive" icon={Clock} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Minhas Entregas */}
        <Card>
          <CardHeader>
            <CardTitle>Minhas Entregas - Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {minhasEntregas.map((entrega) => {
                const StatusIcon = statusIcons[entrega.status]
                return (
                  <div key={entrega.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <StatusIcon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium text-foreground">{entrega.cliente}</h4>
                          <p className="text-sm text-muted-foreground">{entrega.obra}</p>
                        </div>
                      </div>
                      <Badge className={statusColors[entrega.status]}>{entrega.status}</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        {entrega.endereco}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="h-4 w-4 mr-2" />
                          {entrega.horario}
                        </div>
                        <span className="font-medium text-foreground">{entrega.volume}</span>
                      </div>
                    </div>
                    {entrega.status === "agendado" && (
                      <div className="mt-3 flex space-x-2">
                        <Button size="sm" className="flex-1">
                          Iniciar Entrega
                        </Button>
                        <Button size="sm" variant="outline">
                          Ver Rota
                        </Button>
                      </div>
                    )}
                    {entrega.status === "em_transito" && (
                      <div className="mt-3 flex space-x-2">
                        <Button size="sm" className="flex-1">
                          Finalizar Entrega
                        </Button>
                        <Button size="sm" variant="outline">
                          Reportar Problema
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Status da Frota */}
        <Card>
          <CardHeader>
            <CardTitle>Status do Veículo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium">Caminhão #001</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                Disponível
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Combustível</span>
                <span className="font-medium">85%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Última Manutenção</span>
                <span className="font-medium">15/03/2024</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Próxima Revisão</span>
                <span className="font-medium">15/04/2024</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Quilometragem</span>
                <span className="font-medium">45.230 km</span>
              </div>
            </div>

            <Button variant="outline" className="w-full mt-4 bg-transparent">
              Reportar Problema
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
