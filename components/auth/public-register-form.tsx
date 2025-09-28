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
import { Truck, Building2, ArrowLeft, Mail, MessageCircle, UserPlus } from "lucide-react"

export interface PublicRegisterData {
  name: string
  email: string
  password: string
  phone: string
  role: "vendedor" | "motorista" | "admin"
  notificationMethod: "email" | "whatsapp"
  companyName: string
}

interface PublicRegisterFormProps {
  onRegister: (userData: PublicRegisterData) => Promise<void>
  onBack: () => void
}

export function PublicRegisterForm({ onRegister, onBack }: PublicRegisterFormProps) {
  const [formData, setFormData] = useState<PublicRegisterData>({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "vendedor",
    notificationMethod: "email",
    companyName: "",
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao realizar cadastro")
    } finally {
      setIsLoading(false)
    }
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
            <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">Criar Conta</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Crie a conta de administrador da sua empresa
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
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Seu nome completo"
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
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="Sua senha"
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
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="(11) 99999-9999"
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
              <Label className="text-slate-700 dark:text-slate-300">Função Desejada</Label>
              <Select
                value={formData.role}
                onValueChange={(value: "vendedor" | "motorista" | "admin") =>
                  setFormData((prev) => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger className="bg-white/50 dark:bg-slate-800/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vendedor">Vendedor</SelectItem>
                  <SelectItem value="motorista">Motorista</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-slate-700 dark:text-slate-300">Como prefere receber notificações?</Label>
              <RadioGroup
                value={formData.notificationMethod}
                onValueChange={(value: "email" | "whatsapp") =>
                  setFormData((prev) => ({ ...prev, notificationMethod: value }))
                }
                className="flex space-x-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="email-method" />
                  <Label
                    htmlFor="email-method"
                    className="flex items-center space-x-1 text-slate-700 dark:text-slate-300"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="whatsapp" id="whatsapp-method" />
                  <Label
                    htmlFor="whatsapp-method"
                    className="flex items-center space-x-1 text-slate-700 dark:text-slate-300"
                  >
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
              <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Button
                type="submit"
                className="w-full bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
                disabled={isLoading}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {isLoading ? "Cadastrando..." : "Cadastrar"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full bg-transparent"
                onClick={onBack}
                disabled={isLoading}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}