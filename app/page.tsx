"use client"

import { AppLayout } from "@/components/layout/app-layout"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { VendedorDashboard } from "@/components/dashboard/vendedor-dashboard"
import { MotoristaDashboard } from "@/components/dashboard/motorista-dashboard"
import { useAuth } from "@/contexts/auth-context"

export default function HomePage() {
  const { user } = useAuth()

  const renderDashboard = () => {
    if (!user) return null

    switch (user.role) {
      case "admin":
        return <AdminDashboard />
      case "vendedor":
        return <VendedorDashboard />
      case "motorista":
        return <MotoristaDashboard />
      default:
        return <AdminDashboard />
    }
  }

  return (
    <AppLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              {user?.role === "admin" && "Dashboard Administrativo"}
              {user?.role === "vendedor" && "Dashboard do Vendedor"}
              {user?.role === "motorista" && "Dashboard do Motorista"}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {user?.role === "admin" && "Visão geral completa do sistema de gestão"}
              {user?.role === "vendedor" && "Gerencie seus orçamentos e clientes"}
              {user?.role === "motorista" && "Acompanhe suas entregas e rotas"}
            </p>
          </div>

          {renderDashboard()}
        </div>
      </div>
    </AppLayout>
  )
}
