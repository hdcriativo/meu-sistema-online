"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { toast } from "sonner"

interface Notification {
  id: string
  type: "info" | "success" | "warning" | "error"
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
  userId?: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  getNotificationsForUser: (userId: string) => Notification[]
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

const initialNotifications: Notification[] = [
  {
    id: "1",
    type: "success",
    title: "Orçamento Aprovado",
    message: "O orçamento #1234 da Construtora ABC foi aprovado pelo cliente.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: false,
    actionUrl: "/orcamentos",
    userId: "2",
  },
  {
    id: "2",
    type: "warning",
    title: "Entrega Atrasada",
    message: "A entrega para o Shopping Norte está com 15 minutos de atraso.",
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    read: false,
    actionUrl: "/entregas",
    userId: "3",
  },
  {
    id: "3",
    type: "info",
    title: "Novo Usuário Criado",
    message: "Ana Costa foi adicionada como vendedora. Link de ativação enviado.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: true,
    actionUrl: "/usuarios",
    userId: "1",
  },
  {
    id: "4",
    type: "success",
    title: "Conta Ativada",
    message: "Maria Santos ativou sua conta com sucesso.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: true,
    userId: "1",
  },
]

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)

  const unreadCount = notifications.filter((n) => !n.read).length

  const addNotification = (notificationData: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notificationData,
      id: `${Date.now()}_${Math.random().toString(36).substring(2)}`,
      timestamp: new Date(),
      read: false,
    }

    setNotifications((prev) => [newNotification, ...prev])

    // Mostrar toast notification
    const toastConfig = {
      info: { icon: "ℹ️", style: { background: "#3b82f6" } },
      success: { icon: "✅", style: { background: "#10b981" } },
      warning: { icon: "⚠️", style: { background: "#f59e0b" } },
      error: { icon: "❌", style: { background: "#ef4444" } },
    }

    const config = toastConfig[notificationData.type]
    toast(notificationData.title, {
      description: notificationData.message,
      duration: 5000,
      style: { ...config.style, color: "white" },
    })
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const getNotificationsForUser = (userId: string) => {
    return notifications.filter((n) => !n.userId || n.userId === userId)
  }

  // Simular notificações em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      const randomNotifications = [
        {
          type: "info" as const,
          title: "Nova Mensagem",
          message: "Você recebeu uma nova mensagem no chat.",
          actionUrl: "/chat",
        },
        {
          type: "success" as const,
          title: "Entrega Concluída",
          message: "Entrega realizada com sucesso na obra Central.",
          actionUrl: "/entregas",
        },
        {
          type: "warning" as const,
          title: "Agendamento Próximo",
          message: "Você tem uma entrega agendada em 30 minutos.",
          actionUrl: "/agendamentos",
        },
      ]

      // 10% de chance de gerar uma notificação a cada 30 segundos
      if (Math.random() < 0.1) {
        const randomNotification = randomNotifications[Math.floor(Math.random() * randomNotifications.length)]
        addNotification(randomNotification)
      }
    }, 30000) // 30 segundos

    return () => clearInterval(interval)
  }, [])

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getNotificationsForUser,
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}
