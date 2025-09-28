"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Truck, Building2, ArrowLeft } from "lucide-react"
import type { UserRole } from "@/lib/types"

interface RegisterFormProps {
  onRegister: (userData: RegisterData) => Promise<void>
  onBack: () => void
  currentUserRole?: UserRole
}

export interface RegisterData {
  name: string
  email: string
  phone: string
  role: UserRole
  companyName: string; // Adicionado
}

export function RegisterForm({ onRegister, onBack, currentUserRole }: RegisterFormProps) {
  const [formData, setFormData] = useState<RegisterData>({
    name: "",
    email: "",
    phone: "",
    role: "vendedor",
    companyName: "", // Adicionado
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      await onRegister(formData)
      setSuccess("Usuário cadastrado com sucesso! Link de ativação será enviado.")
      setFormData({ name: "", email: "", phone: "", role: "vendedor", companyName: "" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar usuário")
    } finally {
      setIsLoading(false)
    }
  }

  const canCreateRole = (role: UserRole): boolean => {
    if (currentUserRole === "admin") return true
    return false
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
            <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">Cadastrar Usuário</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Criar novo acesso ao sistema
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">
                Nome Completo
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Nome do usuário"
                required
                className="bg-white/50 dark:bg-slate-800/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="email@empresa.com"
                required
                className="bg-white/50 dark:bg-slate-800/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-700 dark:text-slate-300">
                Telefone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="(11) 99999-9000"
                required
                className="bg-white/50 dark:bg-slate-800/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-slate-700 dark:text-slate-300">
                Nome da Empresa
              </Label>
              <Input
                id="companyName"
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
                placeholder="Nome da sua empresa"
                required
                className="bg-white/50 dark:bg-slate-800/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-slate-700 dark:text-slate-300">
                Perfil de Acesso
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) => setFormData((prev) => ({ ...prev, role: value }))}
              >
                <SelectTrigger className="bg-white/50 dark:bg-slate-800/50">
                  <SelectValue placeholder="Selecione o perfil" />
                </SelectTrigger>
                <SelectContent>
                  {canCreateRole("admin") && <SelectItem value="admin">Administrador</SelectItem>}
                  <SelectItem value="vendedor">Vendedor</SelectItem>
                  <SelectItem value="motorista">Motorista</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="flex-1 bg-transparent"
                disabled={isLoading}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
                disabled={isLoading}
              >
                {isLoading ? "Cadastrando..." : "Cadastrar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}