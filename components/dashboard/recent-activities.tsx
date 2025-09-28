import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Activity {
  id: string
  type: "orcamento" | "agendamento" | "entrega" | "pagamento"
  description: string
  user: string
  timestamp: Date
  status?: "success" | "warning" | "error"
}

const mockActivities: Activity[] = [
  {
    id: "1",
    type: "orcamento",
    description: "Orçamento #1234 aprovado pelo cliente Construtora ABC",
    user: "Maria Santos",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    status: "success",
  },
  {
    id: "2",
    type: "entrega",
    description: "Entrega concluída na obra Edifício Central - 150m³",
    user: "Carlos Oliveira",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    status: "success",
  },
  {
    id: "3",
    type: "agendamento",
    description: "Novo agendamento para 25/03 às 08:00 - Shopping Norte",
    user: "Maria Santos",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
  },
  {
    id: "4",
    type: "pagamento",
    description: "Pagamento em atraso - Orçamento #1230",
    user: "Sistema",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    status: "warning",
  },
]

const activityTypeColors = {
  orcamento: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  agendamento: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  entrega: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  pagamento: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
}

export function RecentActivities() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividades Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockActivities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {activity.user
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <Badge variant="secondary" className={activityTypeColors[activity.type]}>
                    {activity.type}
                  </Badge>
                  {activity.status && (
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        activity.status === "success" && "bg-green-500",
                        activity.status === "warning" && "bg-yellow-500",
                        activity.status === "error" && "bg-red-500",
                      )}
                    />
                  )}
                </div>
                <p className="text-sm text-foreground">{activity.description}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true, locale: ptBR })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
