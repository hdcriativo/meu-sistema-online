"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Truck, Building2, UserPlus, KeyRound } from "lucide-react"
import { CreateUserForm, type CreateUserData } from "./create-user-form"
import { ForgotPasswordForm } from "./forgot-password-form"
import { PublicRegisterForm, type PublicRegisterData } from "./public-register-form"
import type { UserRole } from "@/lib/types"

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>
  onCreateUser?: (userData: CreateUserData) => Promise<void>
  onResetPassword?: (contact: string, method: "email" | "whatsapp") => Promise<void>
  onPublicRegister?: (userData: PublicRegisterData) => Promise<void>
  currentUserRole?: UserRole
}

export function LoginForm({
  onLogin,
  onCreateUser,
  onResetPassword,
  onPublicRegister,
  currentUserRole,
}: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [currentForm, setCurrentForm] = useState<"login" | "register" | "forgot" | "public-register">("login")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await onLogin(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Credenciais inválidas. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateUser = async (userData: CreateUserData) => {
    if (onCreateUser) {
      await onCreateUser(userData)
    }
  }

  const handleResetPassword = async (contact: string, method: "email" | "whatsapp") => {
    if (onResetPassword) {
      await onResetPassword(contact, method)
    }
  }

  const handlePublicRegister = async (userData: PublicRegisterData) => {
    if (onPublicRegister) {
      await onPublicRegister(userData)
    }
  }

  if (currentForm === "register" && onCreateUser) {
    return <CreateUserForm onCreateUser={handleCreateUser} onBack={() => setCurrentForm("login")} />
  }

  if (currentForm === "forgot" && onResetPassword) {
    return <ForgotPasswordForm onResetPassword={handleResetPassword} onBack={() => setCurrentForm("login")} />
  }

  if (currentForm === "public-register" && onPublicRegister) {
    return <PublicRegisterForm onRegister={handlePublicRegister} onBack={() => setCurrentForm("login")} />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 text-slate-700 dark:text-slate-300">
            <Building2 className="h-8 w-8" />
            <Truck className="h-8 w-8" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">ConcreteFlow</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Sistema de Gestão de Concretagem
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="bg-white/50 dark:bg-slate-800/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-white/50 dark:bg-slate-800/50"
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              className="w-full bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-2 text-slate-500 dark:text-slate-400">
                  Outras opções
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {onCreateUser && currentUserRole === "admin" && (
                <Button type="button" variant="outline" onClick={() => setCurrentForm("register")} className="text-xs">
                  <UserPlus className="h-3 w-3 mr-1" />
                  Cadastrar
                </Button>
              )}
              {onResetPassword && (
                <Button type="button" variant="outline" onClick={() => setCurrentForm("forgot")} className="text-xs">
                  <KeyRound className="h-3 w-3 mr-1" />
                  Esqueci a senha
                </Button>
              )}
            </div>

            {onPublicRegister && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentForm("public-register")}
                className="w-full text-sm border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Criar Nova Conta
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
