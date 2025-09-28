"use client"

import { useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FinanceiroForm } from "@/app/admin/movimentacoes-financeiras/financeiro-form"
import { FluxoCaixa } from "@/app/admin/movimentacoes-financeiras/fluxo-caixa"

export default function FinanceiroPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)

  return (
    <AppLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Financeiro</h1>
              <p className="text-muted-foreground">Gerencie o fluxo de caixa da sua empresa</p>
            </div>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Lançamento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Lançamento Financeiro</DialogTitle>
                </DialogHeader>
                <FinanceiroForm onClose={() => setIsFormOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FluxoCaixa />
            {/* O componente de gráfico poderia ser inserido aqui no futuro */}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}