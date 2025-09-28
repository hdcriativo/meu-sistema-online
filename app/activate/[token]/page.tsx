"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ActivateAccountForm } from "@/components/auth/activate-account-form"
import { useAuth } from "@/contexts/auth-context"

export default function ActivateAccountPage() {
  const params = useParams()
  const router = useRouter()
  const { activateAccount } = useAuth()
  const [userEmail, setUserEmail] = useState("")
  const [isValidToken, setIsValidToken] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const token = params.token as string

  useEffect(() => {
    // Simular validação do token
    const validateToken = async () => {
      try {
        // Em um sistema real, aqui validaria o token com a API
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Simular dados do usuário baseado no token
        setUserEmail("usuario@empresa.com") // Em produção, viria da API
        setIsValidToken(true)
      } catch (error) {
        setIsValidToken(false)
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      validateToken()
    } else {
      setIsLoading(false)
    }
  }, [token])

  const handleActivate = async (password: string, confirmPassword: string) => {
    try {
      await activateAccount(token, password)
      // Redirecionar para login após ativação
      router.push("/?activated=true")
    } catch (error) {
      throw error
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 dark:border-slate-200"></div>
          <p className="text-slate-600 dark:text-slate-400">Validando link...</p>
        </div>
      </div>
    )
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Link Inválido</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-4">Este link de ativação é inválido ou expirou.</p>
          <button onClick={() => router.push("/")} className="text-slate-800 dark:text-slate-200 underline">
            Voltar ao login
          </button>
        </div>
      </div>
    )
  }

  return <ActivateAccountForm token={token} userEmail={userEmail} onActivate={handleActivate} />
}
