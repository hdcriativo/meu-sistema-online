"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { LoginForm } from "./login-form"
import type { UserRole } from "@/lib/types"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, login, createUser, resetPassword, publicRegister, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 dark:border-slate-200"></div>
          <p className="text-slate-600 dark:text-slate-400">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <LoginForm
        onLogin={login}
        onCreateUser={createUser}
        onResetPassword={resetPassword}
        onPublicRegister={publicRegister}
        currentUserRole={user?.role}
      />
    )
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Acesso Negado</h1>
          <p className="text-slate-600 dark:text-slate-400">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
