// ARQUIVO: app/layout.tsx

import React from "react" // Corrigido para importação padrão
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

// Providers globais
import { AuthProvider } from "@/contexts/auth-context"
import { NotificationProvider } from "@/components/notifications/notification-provider"
import { Toaster } from "sonner"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "ConcreteFlow - Sistema de Gestão de Concretagem",
  description: "Sistema completo para gestão de orçamentos, agendamentos e entregas de concreto",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${GeistSans.variable} ${GeistMono.variable}`}> {/* Classes aplicadas diretamente */}
        <Suspense fallback={<div>Carregando...</div>}>
          <AuthProvider>
            <NotificationProvider>
              {children}
              <Toaster position="top-right" richColors />
            </NotificationProvider>
          </AuthProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}