"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Truck, Building2, ArrowLeft, Mail, MessageCircle } from "lucide-react"

interface ForgotPasswordFormProps {
  onResetPassword: (contact: string, method: "email" | "whatsapp") => Promise<void>
  onBack: () => void
}

export function ForgotPasswordForm({ onResetPassword, onBack }: ForgotPasswordFormProps) {
  const [contact, setContact] = useState("")
  const [method, setMethod] = useState<"email" | "whatsapp">("email")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      await onResetPassword(contact, method)
      setSuccess(
        method === "email"
          ? "Link de recuperação enviado para seu email!"
          : "Link de recuperação enviado para seu WhatsApp!",
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar link de recuperação")
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
            <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">Recuperar Senha</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Enviaremos um link para redefinir sua senha
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <Label className="text-slate-700 dark:text-slate-300">Como deseja receber o link?</Label>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant={method === "email" ? "default" : "outline"}
                  onClick={() => setMethod("email")}
                  className="flex-1"
                  size="sm"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button
                  type="button"
                  variant={method === "whatsapp" ? "default" : "outline"}
                  onClick={() => setMethod("whatsapp")}
                  className="flex-1"
                  size="sm"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact" className="text-slate-700 dark:text-slate-300">
                {method === "email" ? "Email" : "Telefone"}
              </Label>
              <Input
                id="contact"
                type={method === "email" ? "email" : "tel"}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={method === "email" ? "seu@email.com" : "(11) 99999-9999"}
                required
                className="bg-white/50 dark:bg-slate-800/50"
              />
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
                {isLoading ? "Enviando..." : "Enviar Link"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
