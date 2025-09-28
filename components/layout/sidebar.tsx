// ARQUIVO: C:\Users\ciami\a\components\layout\sidebar.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  Truck,
  DollarSign,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
} from "lucide-react"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { useNotifications } from "@/components/notifications/notification-provider"
import type { User } from "@/lib/types"

interface SidebarProps {
  user: User
  onLogout: () => void
}

const menuItems = {
  admin: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Users, label: "Clientes", href: "/clientes" },
    { icon: Building2, label: "Obras", href: "/obras" },
    { icon: Calendar, label: "Agendamentos", href: "/agendamentos" },
    { icon: Truck, label: "Entregas", href: "/entregas" },
    { icon: DollarSign, label: "Financeiro", href: "/financeiro" },
    { icon: MessageSquare, label: "Chat", href: "/chat" },
    { icon: BarChart3, label: "Relatórios", href: "/relatorios" },
    { icon: Settings, label: "Configurações", href: "/configuracoes" },
  ],
  vendedor: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Users, label: "Clientes", href: "/clientes" },
    { icon: Building2, label: "Obras", href: "/obras" },
    { icon: Calendar, label: "Agendamentos", href: "/agendamentos" },
    { icon: MessageSquare, label: "Chat", href: "/chat" },
  ],
  motorista: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Calendar, label: "Agendamentos", href: "/agendamentos" },
    { icon: Truck, label: "Entregas", href: "/entregas" },
    { icon: MessageSquare, label: "Chat", href: "/chat" },
  ],
}

export function Sidebar({ user, onLogout }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const userMenuItems = menuItems[user.role]

  const { unreadCount, getNotificationsForUser } = useNotifications()
  const userNotifications = getNotificationsForUser(user.id)
  const userUnreadCount = userNotifications.filter((n) => !n.read).length

  return (
    <>
      {/* Mobile overlay */}
      {!isCollapsed && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsCollapsed(true)} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out",
          isCollapsed ? "-translate-x-full lg:translate-x-0 lg:w-16" : "translate-x-0 w-64",
          "lg:relative lg:translate-x-0",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <Building2 className="h-6 w-6 text-slate-700 dark:text-slate-300" />
              <span className="font-bold text-slate-800 dark:text-slate-100">ConcreteFlow</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  {userUnreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs"
                    >
                      {userUnreadCount > 9 ? "9+" : userUnreadCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <NotificationCenter />
              </PopoverContent>
            </Popover>
            <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)} className="lg:hidden">
              {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-slate-200 dark:bg-slate-700">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user.role}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {userMenuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100",
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <Button
            variant="ghost"
            onClick={onLogout}
            className="w-full justify-start text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            <LogOut className="h-5 w-5 mr-3" />
            {!isCollapsed && <span>Sair</span>}
          </Button>
        </div>
      </div>
    </>
  )
}