"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Building2, UserPlus, ArrowLeft, Mail, MessageCircle, Shield } from "lucide-react"
import type { CreateAdminData } from "@/contexts/auth-context"

interface AdminRegisterFormProps {
  onRegister: (userData: CreateAdminData) => Promise<void>
  onBack: () => void
}

export function AdminRegisterForm({ onRegister, onBack }: AdminRegisterFormProps) {
  const [formData, setFormData] = useState<CreateAdminData>({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    companyCnpj: "",
    companyAddress: "",
    companyPhone: "",
    companyEmail: "",
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
      await onRegister(formData)
      setSuccess("Administrador e empresa criados com sucesso! Link de ativação enviado.")
      setFormData({
        name: "",
        email: "",
        phone: "",
        companyName: "",
        companyCnpj: "",
        companyAddress: "",
        companyPhone: "",
        companyEmail: "",
        notificationMethod: "email",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar administrador")
    } finally {
      setIsLoading(false)
    }
  }

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-2xl shadow-xl border-0 bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 text-slate-700 dark:text-slate-300">
            <Shield className="h-8 w-8" />
            <Building2 className="h-8 w-8" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Criar Administrador + Empresa
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Cadastre um novo administrador e crie automaticamente uma nova empresa
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados do Administrador */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Dados do Administrador</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">
                    Nome Completo *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="João Silva"
                    required
                    className="bg-white/50 dark:bg-slate-800/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="joao@empresa.com"
                    required
                    className="bg-white/50 dark:bg-slate-800/50"
                  />
                </div>

                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="phone" className="text-slate-700 dark:text-slate-300">
                    Telefone *
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: formatPhone(e.target.value) }))}
                    placeholder="(11) 99999-9999"
                    required
                    className="bg-white/50 dark:bg-slate-800/50"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Dados da Empresa */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Dados da Empresa</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-slate-700 dark:text-slate-300">
                    Nome da Empresa *
                  </Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
                    placeholder="ConcreteFlow Ltda"
                    required
                    className="bg-white/50 dark:bg-slate-800/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyCnpj" className="text-slate-700 dark:text-slate-300">
                    CNPJ *
                  </Label>
                  <Input
                    id="companyCnpj"
                    value={formData.companyCnpj}
                    onChange={(e) => setFormData((prev) => ({ ...prev, companyCnpj: formatCNPJ(e.target.value) }))}
                    placeholder="12.345.678/0001-90"
                    required
                    className="bg-white/50 dark:bg-slate-800/50"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="companyAddress" className="text-slate-700 dark:text-slate-300">
                    Endereço da Empresa
                  </Label>
                  <Input
                    id="companyAddress"
                    value={formData.companyAddress}
                    onChange={(e) => setFormData((prev) => ({ ...prev, companyAddress: e.target.value }))}
                    placeholder="Rua das Empresas, 123 - São Paulo, SP"
                    className="bg-white/50 dark:bg-slate-800/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyPhone" className="text-slate-700 dark:text-slate-300">
                    Telefone da Empresa
                  </Label>
                  <Input
                    id="companyPhone"
                    value={formData.companyPhone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, companyPhone: formatPhone(e.target.value) }))}
                    placeholder="(11) 3000-0000"
                    className="bg-white/50 dark:bg-slate-800/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyEmail" className="text-slate-700 dark:text-slate-300">
                    Email da Empresa
                  </Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={formData.companyEmail}
                    onChange={(e) => setFormData((prev) => ({ ...prev, companyEmail: e.target.value }))}
                    placeholder="contato@empresa.com"
                    className="bg-white/50 dark:bg-slate-800/50"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Método de Notificação */}
            <div className="space-y-3">
              <Label className="text-slate-700 dark:text-slate-300">Como prefere receber o link de ativação? *</Label>
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

            <div className="flex space-x-3">
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
                <UserPlus className="h-4 w-4 mr-2" />
                {isLoading ? "Criando..." : "Criar Admin + Empresa"}
              </Button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Importante:</strong> Ao criar um administrador, uma nova empresa será automaticamente criada e
              vinculada a ele. O administrador terá acesso total apenas aos dados da sua empresa.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
