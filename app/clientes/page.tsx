"use client"

import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Search, Phone, Mail, MapPin, Building2 } from "lucide-react"
import { useState } from "react"
import { useCompanyFilter } from "@/hooks/use-company-filter"
import { mockClientes } from "@/lib/mock-data"

export default function ClientesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const { clientes: filterClientes, currentCompany } = useCompanyFilter()

  const clientesDaEmpresa = filterClientes(mockClientes)

  const filteredClientes = clientesDaEmpresa.filter(
    (cliente) =>
      cliente.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <AppLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Clientes</h1>
              <p className="text-slate-600 dark:text-slate-400">
                Gerencie seus clientes e informações de contato
                {currentCompany && (
                  <span className="ml-2 text-sm">
                    • <Building2 className="inline h-4 w-4 mr-1" />
                    {currentCompany.nome}
                  </span>
                )}
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {currentCompany && (
            <div className="mb-4">
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
              >
                <Building2 className="h-3 w-3 mr-1" />
                Mostrando clientes de: {currentCompany.nome}
              </Badge>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredClientes.map((cliente) => (
              <Card key={cliente.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {cliente.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{cliente.name}</CardTitle>
                        <CardDescription>{cliente.cpfCnpj}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                    <Mail className="h-4 w-4 mr-2" />
                    {cliente.email}
                  </div>
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                    <Phone className="h-4 w-4 mr-2" />
                    {cliente.phone}
                  </div>
                  <div className="flex items-start text-sm text-slate-600 dark:text-slate-400">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{cliente.address}</span>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">
                        Cliente desde {cliente.createdAt.toLocaleDateString("pt-BR")}
                      </span>
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        ativo
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredClientes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400">
                {searchTerm
                  ? "Nenhum cliente encontrado para a busca."
                  : "Nenhum cliente cadastrado para esta empresa."}
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
