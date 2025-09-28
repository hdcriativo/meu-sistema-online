// components/usuarios/UsersTable.tsx (Corrigido para receber estado via props)
"use client"

import { useMemo } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
    mockEntregas, 
    mockConfiguracoes 
} from "@/lib/mock-data"
import { useAuth } from "@/contexts/auth-context"
import { DataTable } from "@/components/ui/data-table"
import type { User } from "@/lib/types" // Certifique-se de que o tipo User está importado
import { ColumnDef } from "@tanstack/react-table"
import { formatCurrency } from "@/lib/utils" 

// --- FUNÇÃO PARA CALCULAR MÉTRICAS DO VENDEDOR ---
const calcularMetricasVendedor = (vendedorId: string, empresaId: string) => {
    // 1. Configurações da Empresa
    const config = mockConfiguracoes.find(c => c.empresaId === empresaId);
    if (!config) {
        return { volumeVendido: 0, lucroBrutoEmpresa: 0 };
    }

    // 2. Entregas (vendas) realizadas por este vendedor
    const vendasDoVendedor = mockEntregas.filter(e => e.vendedorId === vendedorId);

    // 3. Volume total vendido (em m³)
    const volumeVendido = vendasDoVendedor.reduce((sum, entrega) => {
        return sum + (entrega.volumeTotalM3 || 0);
    }, 0);

    // 4. Lucro Bruto da Empresa gerado por este vendedor
    const lucroBrutoEmpresa = volumeVendido * config.valorM3RepasseVendedor;

    return { volumeVendido, lucroBrutoEmpresa };
}


// Definição das colunas da tabela
const getColumns = (isAdmin: boolean, empresaId: string | undefined): ColumnDef<User>[] => {
    const baseColumns: ColumnDef<User>[] = [
        {
            accessorKey: "name",
            header: "Nome",
        },
        {
            accessorKey: "email",
            header: "E-mail",
        },
        {
            accessorKey: "role",
            header: "Função",
            cell: ({ row }) => {
                const role = row.getValue("role") as User["role"]
                const roleColors = {
                    admin: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
                    motorista: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
                    vendedor: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
                    bombista: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
                    ajudante: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
                }
                return (
                    <Badge className={roleColors[role]}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Badge>
                )
            },
        },
    ];

    if (isAdmin) {
        return [
            ...baseColumns,
            {
                id: "volumeVendido",
                header: "m³ Vendidos",
                cell: ({ row }) => {
                    if (row.original.role !== 'vendedor' || !empresaId) return "-";
                    const metrics = calcularMetricasVendedor(row.original.id, empresaId);
                    return <span className="font-semibold">{metrics.volumeVendido} m³</span>
                }
            },
            {
                id: "lucroBrutoEmpresa",
                header: "Lucro Bruto (Empresa)",
                cell: ({ row }) => {
                    if (row.original.role !== 'vendedor' || !empresaId) return "-";
                    const metrics = calcularMetricasVendedor(row.original.id, empresaId);
                    return (
                        <span className="font-bold text-green-600">
                            {formatCurrency(metrics.lucroBrutoEmpresa)}
                        </span>
                    );
                }
            }
        ];
    }
    
    return baseColumns;
};

// 💥 Propriedades para receber a lista de usuários
interface UsersTableProps {
    allUsers: User[]; 
}

export function UsersTable({ allUsers }: UsersTableProps) {
    const { user, empresa } = useAuth()
    const isAdmin = user?.role === 'admin';

    // 💥 Filtra os usuários: Apenas os que NÃO ESTÃO PENDENTES
    const activeUsers = useMemo(() => {
        if (!empresa) return [];
        return allUsers.filter(u => u.empresaId === empresa.id && !u.isPendingApproval);
    }, [allUsers, empresa?.id]);

    // Monta as colunas dinamicamente
    const columns = useMemo(() => getColumns(isAdmin, empresa?.id), [isAdmin, empresa?.id]);

    // Bloqueio de Acesso
    if (user?.role === 'motorista') {
        return (
            <div className="text-center py-20">
                <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
                <p className="text-muted-foreground mt-2">Você não tem permissão para visualizar este relatório de usuários.</p>
            </div>
        );
    }

    if (!empresa) {
        return <p>Carregando dados da empresa...</p>
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Usuários Ativos e Aprovados</CardTitle>
                <CardDescription>
                    {isAdmin ? "Gerencie os usuários e monitore o desempenho de vendas (m³ vendidos e lucro bruto)." : "Visualize e gerencie todos os usuários de sua empresa."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* 💥 Usa a lista filtrada `activeUsers` */}
                <DataTable columns={columns} data={activeUsers} /> 
            </CardContent>
        </Card>
    )
}