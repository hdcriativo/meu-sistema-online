// ARQUIVO: app/orcamentos/page.tsx

"use client";

import { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, PlusCircle, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Componentes da Aplicação
import AppLayout from '@/components/layout/app-layout';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

// Componentes de Orçamento
import { OrcamentoDetails } from '@/components/orcamentos/orcamento-details';
import { OrcamentoForm } from '@/components/orcamentos/orcamento-form'; 

// Dados e Tipos
import { mockOrcamentos, mockObras, mockUsers } from '@/lib/mock-data';
import type { Orcamento, OrcamentoStatus, UserRole } from '@/lib/types';

// Contexto (CORREÇÃO DE ERRO: useAuth not defined)
import { useAuth } from '@/contexts/auth-context'; 

// --- FUNÇÕES AUXILIARES ---

interface ProcessedOrcamento extends Orcamento {
    obraName: string;
    clienteName: string;
    vendedorName: string;
    // Não precisa mais de campos como tipoConcreto ou volumeM3 aqui, 
    // pois o valor total é calculado dos itens.
}

const statusVariant = (status: OrcamentoStatus) => {
    switch (status) {
        case 'aprovado':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case 'recusado':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        case 'em_revisao':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        case 'pendente':
        default:
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
};

const createColumns = (
    role: UserRole, 
    handleStatusChange: (orcamentoId: string, newStatus: OrcamentoStatus) => void,
    openViewSheet: (orcamento: Orcamento) => void,
    openEditSheet: (orcamento: Orcamento) => void,
): ColumnDef<ProcessedOrcamento>[] => [
    {
        accessorKey: 'id',
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                ID
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.id.substring(0, 8).toUpperCase()}</span>,
    },
    {
        accessorKey: 'obraName',
        header: 'Obra',
    },
    {
        accessorKey: 'clienteName',
        header: 'Cliente',
        cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.clienteName}</span>
    },
    {
        accessorKey: 'vendedorName',
        header: 'Vendedor',
        cell: ({ row }) => (role === 'admin' ? row.original.vendedorName : 'Você'),
    },
    {
        accessorKey: 'dataCriacao',
        header: 'Criado em',
        cell: ({ row }) => format(new Date(row.original.dataCriacao), 'dd/MM/yyyy', { locale: ptBR }),
    },
    {
        accessorKey: 'valorTotal',
        header: 'Valor Total',
        cell: ({ row }) => (
            <span className="font-semibold">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.original.valorTotal)}
            </span>
        ),
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
            <Badge className={statusVariant(row.original.status)} variant="secondary">
                {row.original.status.replace('_', ' ')}
            </Badge>
        ),
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const orcamento = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openViewSheet(orcamento)}>
                            Ver Detalhes
                        </DropdownMenuItem>
                        {(role === 'vendedor' || role === 'admin') && orcamento.status !== 'aprovado' && (
                            <DropdownMenuItem onClick={() => openEditSheet(orcamento)}>
                                Editar
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {orcamento.status === 'pendente' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(orcamento.id, 'aprovado')}>
                                Marcar como Aprovado
                            </DropdownMenuItem>
                        )}
                        {orcamento.status === 'aprovado' && (
                             <DropdownMenuItem>
                                Criar Agendamento
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

// --- COMPONENTE PRINCIPAL (OrcamentosPage) ---
export default function OrcamentosPage() {
    const { user } = useAuth(); // Agora useAuth está importado!
    const [data, setData] = useState<Orcamento[]>(mockOrcamentos);
    
    // Estado para controlar o Drawer/Sheet
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [selectedOrcamento, setSelectedOrcamento] = useState<Orcamento | null>(null);
    const [sheetMode, setSheetMode] = useState<'view' | 'edit' | 'new'>('view');

    // Função para abrir o drawer no modo de visualização
    const openViewSheet = (orcamento: Orcamento) => {
        setSelectedOrcamento(orcamento);
        setSheetMode('view');
        setIsSheetOpen(true);
    };

    // Função para abrir o drawer no modo de edição
    const openEditSheet = (orcamento: Orcamento) => {
        setSelectedOrcamento(orcamento);
        setSheetMode('edit');
        setIsSheetOpen(true);
    };
    
    // Função para abrir o drawer no modo de criação
    const openNewSheet = () => {
        setSelectedOrcamento(null);
        setSheetMode('new');
        setIsSheetOpen(true);
    };

    // Função de Ação para mudança de status (simulação)
    const handleStatusChange = (orcamentoId: string, newStatus: OrcamentoStatus) => {
        setData((prev) =>
            prev.map((o) => (o.id === orcamentoId ? { ...o, status: newStatus } : o))
        );
        console.log(`Orçamento ${orcamentoId} atualizado para status: ${newStatus}`);
        // Fechar o sheet se a atualização for feita a partir dele
        if (selectedOrcamento?.id === orcamentoId) {
            setIsSheetOpen(false);
        }
    };

    // Mapeamento de colunas
    const columns = useMemo(() => createColumns(user?.role || 'vendedor', handleStatusChange, openViewSheet, openEditSheet), [user?.role]);

    // Lógica de processamento de dados para a tabela
    const processedData: ProcessedOrcamento[] = useMemo(() => {
        return data.map((orcamento) => {
            const obra = mockObras.find((o) => o.id === orcamento.obraId);
            const vendedor = mockUsers.find((u) => u.id === orcamento.vendedorId);
            
            return {
                ...orcamento,
                obraName: obra?.name || 'Obra Desconhecida',
                clienteName: obra?.cliente || 'Cliente Desconhecido',
                vendedorName: vendedor?.name || 'Vendedor Desconhecido',
            };
        });
    }, [data]);


    return (
        <AppLayout>
            <div className="p-8 max-w-7xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Gestão de Orçamentos</h1>
                    
                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        
                        {/* Botão para Criar Novo Orçamento (Abre o Sheet) */}
                        <SheetTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700" onClick={openNewSheet}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Novo Orçamento
                            </Button>
                        </SheetTrigger>

                        {/* Conteúdo do Drawer Lateral */}
                        <SheetContent side="right" className="sm:max-w-xl overflow-y-auto">
                            <SheetHeader>
                                <SheetTitle>
                                    {sheetMode === 'new' ? 'Criar Novo Orçamento' : 
                                     sheetMode === 'edit' ? `Editar Orçamento #${selectedOrcamento?.id.substring(0, 8).toUpperCase()}` : 
                                     `Detalhes do Orçamento #${selectedOrcamento?.id.substring(0, 8).toUpperCase()}`}
                                </SheetTitle>
                            </SheetHeader>
                            
                            <div className="pt-6">
                                {/* Renderiza o Formulário ou os Detalhes */}
                                {sheetMode === 'new' || sheetMode === 'edit' ? (
                                    <OrcamentoForm
                                        orcamento={selectedOrcamento}
                                        onClose={() => setIsSheetOpen(false)}
                                    />
                                ) : (
                                    selectedOrcamento && (
                                        <OrcamentoDetails
                                            orcamento={selectedOrcamento}
                                            onClose={() => setIsSheetOpen(false)}
                                        />
                                    )
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Lista de Orçamentos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable columns={columns} data={processedData} filterColumn="obraName" />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}