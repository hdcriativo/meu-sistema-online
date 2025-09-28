// app/admin/cadastros-pendentes/page.tsx
// CORRIGIDO: Adicionado "use client" para resolver o erro fatal de "Unsupported Server Component type: Module"
// Componentes de UI interativos como DataTables precisam ser renderizados no cliente.

'use client'; // LINHA ESSENCIAL PARA A CORREÇÃO

import { mockUsuarios } from '@/lib/mock-data';
// Assumindo que você tem os seguintes componentes (Card, DataTable, Button, etc.)
// Estes componentes foram implicados pelos warnings, assumimos que existem.
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'; 
import { DataTable } from '@/components/ui/data-table'; 
import { Button } from '@/components/ui/button'; 
import React from 'react';

// Definição das colunas 
const columns = [
  { accessorKey: "name", header: "Nome" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "role", header: "Função" },
  { 
    id: "actions", 
    header: "Ações",
    cell: ({ row }) => (
      <div className="flex space-x-2">
        {/* As ações reais de aprovar/rejeitar devem ser implementadas aqui */}
        <Button size="sm" variant="secondary">Aprovar</Button>
        <Button size="sm" variant="destructive">Rejeitar</Button>
      </div>
    )
  }
];

export default function CadastrosPendentesPage() {
  // Filtra usuários pendentes de aprovação (mockUsuarios deve estar exportado em '@/lib/mock-data')
  const pendingUsers = mockUsuarios.filter(u => u.isPendingApproval);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Gerenciamento de Cadastros Pendentes</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Usuários Aguardando Aprovação ({pendingUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingUsers.length > 0 ? (
            <DataTable columns={columns} data={pendingUsers} />
          ) : (
            <p className="text-center text-muted-foreground py-10">Nenhum cadastro pendente no momento.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
