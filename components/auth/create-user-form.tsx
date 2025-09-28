"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { UserPlus, ArrowLeft, Mail, MessageCircle } from "lucide-react"
import type { CreateUserData } from "@/contexts/auth-context"

interface CreateUserFormProps {
  onCreateUser: (userData: CreateUserData) => Promise<void>
  onBack: () => void
}

export function CreateUserForm({ onCreateUser, onBack }: CreateUserFormProps) {
  const [formData, setFormData] = useState<CreateUserData>({
    name: "",
    email: "",
    phone: "",
    role: "vendedor",
    notificationMethod: "email",
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
      await onCreateUser(formData)
      setSuccess("Usuário criado com sucesso! Link de ativação enviado.")
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "vendedor",
        notificationMethod: "email",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar usuário")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <UserPlus className="h-8 w-8 text-slate-700 dark:text-slate-300" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">Criar Usuário</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Cadastre um novo vendedor ou motorista
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="João Silva"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="joao@empresa.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="(11) 99999-9999"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Função</Label>
              <Select
                value={formData.role}
                onValueChange={(value: "vendedor" | "motorista") => setFormData((prev) => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vendedor">Vendedor</SelectItem>
                  <SelectItem value="motorista">Motorista</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Método de Notificação</Label>
              <RadioGroup
                value={formData.notificationMethod}
                onValueChange={(value: "email" | "whatsapp") =>
                  setFormData((prev) => ({ ...prev, notificationMethod: value }))
                }
                className="flex space-x-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="email-method" />
                  <Label htmlFor="email-method" className="flex items-center space-x-1">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="whatsapp" id="whatsapp-method" />
                  <Label htmlFor="whatsapp-method" className="flex items-center space-x-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>WhatsApp</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Button type="submit" className="w-full bg-slate-800 hover:bg-slate-700" disabled={isLoading}>
                {isLoading ? "Criando..." : "Criar Usuário"}
              </Button>

              <Button type="button" variant="outline" className="w-full bg-transparent" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
