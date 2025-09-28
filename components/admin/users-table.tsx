"use client"

import { useEffect, useState, useMemo } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
    mockUsers, 
    mockEntregas, 
    mockConfiguracoes 
} from "@/lib/mock-data"
import { useAuth } from "@/contexts/auth-context"
import { DataTable } from "@/components/ui/data-table"
import { User } from "@/lib/definitions"
import { ColumnDef } from "@tanstack/react-table"
import { formatCurrency } from "@/lib/utils" // Assumindo que você tem essa função

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
    // Lucro Bruto = Volume Vendido * Valor de Repasse do Vendedor (que é a Receita da Empresa)
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

    // Colunas de métricas APENAS para o Administrador e APENAS para Vendedores
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


export function UsersTable() {
    const { user, empresa } = useAuth()
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)

    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        if (user && empresa) {
            // Filtra os usuários pertencentes à empresa do usuário logado
            let filteredUsers = mockUsers.filter(u => u.empresaId === empresa.id);
            
            // Regra: Motoristas não precisam ver esta página.
            // Para motorista, esta página não será renderizada na navegação,
            // mas mantemos o filtro de empresa para garantir.

            setUsers(filteredUsers)
            setLoading(false)
        }
    }, [user, empresa])

    // Monta as colunas dinamicamente
    const columns = useMemo(() => getColumns(isAdmin, empresa?.id), [isAdmin, empresa?.id]);

    // Bloqueio de Acesso: Motoristas não têm acesso a esta página
    if (user?.role === 'motorista') {
        return (
            <div className="text-center py-20">
                <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
                <p className="text-muted-foreground mt-2">Você não tem permissão para visualizar este relatório de usuários.</p>
            </div>
        );
    }

    if (loading) {
        return <p>Carregando usuários...</p>
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Todos os Usuários</CardTitle>
                <CardDescription>
                    {isAdmin ? "Gerencie os usuários e monitore o desempenho de vendas (m³ vendidos e lucro bruto)." : "Visualize e gerencie todos os usuários de sua empresa."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <DataTable columns={columns} data={users} />
            </CardContent>
        </Card>
    )
}