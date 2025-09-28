"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Bell, Check, X, AlertTriangle, Info, CheckCircle, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Notification {
  id: string
  type: "info" | "success" | "warning" | "error"
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "success",
    title: "Orçamento Aprovado",
    message: "O orçamento #1234 da Construtora ABC foi aprovado pelo cliente.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    read: false,
    actionUrl: "/orcamentos",
  },
  {
    id: "2",
    type: "warning",
    title: "Entrega Atrasada",
    message: "A entrega para o Shopping Norte está com 15 minutos de atraso.",
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 min ago
    read: false,
    actionUrl: "/entregas",
  },
  {
    id: "3",
    type: "info",
    title: "Novo Agendamento",
    message: "Agendamento criado para 26/03 às 14:00 - Edifício Central.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: true,
    actionUrl: "/agendamentos",
  },
  {
    id: "4",
    type: "error",
    title: "Pagamento Vencido",
    message: "O pagamento do orçamento #1230 está vencido há 3 dias.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
    actionUrl: "/financeiro",
  },
  {
    id: "5",
    type: "success",
    title: "Entrega Concluída",
    message: "Entrega de 150m³ concluída com sucesso na obra Central.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    read: true,
    actionUrl: "/entregas",
  },
]

const notificationIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: X,
}

const notificationColors = {
  info: "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300",
  success: "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300",
  warning: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300",
  error: "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300",
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const filteredNotifications = showUnreadOnly ? notifications.filter((n) => !n.read) : notifications

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <Card className="w-96">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notificações
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
        </div>
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            className="text-xs h-7 px-2"
          >
            {showUnreadOnly ? "Mostrar Todas" : "Apenas Não Lidas"}
          </Button>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-7 px-2">
              <Check className="h-3 w-3 mr-1" />
              Marcar Todas
            </Button>
          )}
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          {filteredNotifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {showUnreadOnly ? "Nenhuma notificação não lida" : "Nenhuma notificação"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredNotifications.map((notification) => {
                const Icon = notificationIcons[notification.type]

                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-muted/50 transition-colors ${!notification.read ? "bg-muted/30" : ""}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-1 rounded-full ${notificationColors[notification.type]}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-foreground truncate">{notification.title}</h4>
                          {!notification.read && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDistanceToNow(notification.timestamp, { addSuffix: true, locale: ptBR })}
                          </div>
                          <div className="flex items-center space-x-1">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="h-6 w-6 p-0"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
