"use client"

import { useMemo, useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Truck, Factory, BarChart3, TrendingUp, TrendingDown } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { mockEntregas, mockConfiguracoes, Entrega } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils" 
import Link from "next/link"

// --- FUNÇÃO AUXILIAR DE CÁLCULO ---
const calcularDetalhesFinanceiros = (entregas: Entrega[], config: typeof mockConfiguracoes[0]) => {
    const custoUsinaPorM3 = 80; 

    return entregas.map(entrega => {
        const volume = entrega.volumeTotalM3 || 0; 
        
        const receitaBruta = volume * config.valorM3RepasseVendedor;
        const custoFrete = Math.max(config.taxaMinimaFrete, volume * config.valorM3Frete);
        const custoUsina = volume * custoUsinaPorM3;
        const custoTotal = custoFrete + custoUsina;
        const lucroLiquido = receitaBruta - custoTotal;

        return {
            ...entrega,
            receitaBruta,
            custoFrete,
            custoUsina,
            custoTotal,
            lucroLiquido,
        };
    });
};

// --- COMPONENTE PRINCIPAL ---

export default function FinanceiroPage() {
    // 1. TODOS OS HOOKS CHAMADOS NO TOPO, SEM CONDIÇÕES
    const { user, empresa } = useAuth();
    const [filtroStatus, setFiltroStatus] = useState<'todos' | 'concluida' | 'cancelada'>('todos');

    const isAdmin = user?.role === 'admin';
    const isVendedor = user?.role === 'vendedor';
    
    // 2. useMemo CHAMA LÓGICA DE CARREGAMENTO SE NECESSÁRIO
    const { detalhesEntregas, totais } = useMemo(() => {
        // CORREÇÃO: Trata a falta de user/empresa retornando dados vazios
        if (!user || !empresa) {
            return { detalhesEntregas: [], totais: { receitaTotal: 0, custoFreteTotal: 0, custoUsinaTotal: 0, lucroTotal: 0 } };
        }
        
        const config = mockConfiguracoes.find(c => c.empresaId === empresa.id);
        
        if (!config) {
            return { detalhesEntregas: [], totais: { receitaTotal: 0, custoFreteTotal: 0, custoUsinaTotal: 0, lucroTotal: 0 } };
        }

        let entregasBase = mockEntregas.filter(e => e.empresaId === empresa.id);
        
        if (isVendedor) {
            entregasBase = entregasBase.filter(e => e.vendedorId === user.id);
        }

        const detalhes = calcularDetalhesFinanceiros(entregasBase, config);
        
        let entregasFiltradas = detalhes;
        if (filtroStatus !== 'todos') {
            entregasFiltradas = detalhes.filter(d => d.status === filtroStatus);
        }

        const receitaTotal = entregasFiltradas.reduce((sum, d) => sum + d.receitaBruta, 0);
        const custoFreteTotal = entregasFiltradas.reduce((sum, d) => sum + d.custoFrete, 0);
        const custoUsinaTotal = entregasFiltradas.reduce((sum, d) => sum + d.custoUsina, 0);
        const lucroTotal = entregasFiltradas.reduce((sum, d) => sum + d.lucroLiquido, 0);
        
        return { 
            detalhesEntregas: entregasFiltradas, 
            totais: { receitaTotal, custoFreteTotal, custoUsinaTotal, lucroTotal } 
        };
    }, [user, empresa, isVendedor, filtroStatus]);

    // 3. O RETURN CONDICIONAL AGORA É SEGURO, pois todos os Hooks já foram chamados
    if (!user || !empresa) return <p>Carregando dados...</p>;

    // Bloqueio de Acesso
    if (!isAdmin && !isVendedor) {
        return (
             <AppLayout>
                 <div className="p-8 max-w-7xl mx-auto text-center py-20">
                     <h1 className="text-3xl font-bold text-red-600">Acesso Negado</h1>
                     <p className="text-muted-foreground mt-2">Você não tem permissão para acessar o módulo Financeiro.</p>
                 </div>
             </AppLayout>
        );
    }
    
    // --- RENDERIZAÇÃO ---
    return (
        <AppLayout>
            <div className="p-8 space-y-8 max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-foreground">
                    {isAdmin ? "Fluxo de Caixa e Custos (Admin)" : "Performance de Vendas (Vendedor)"}
                </h1>
                <p className="text-muted-foreground">
                    {isAdmin 
                        ? "Análise detalhada de receitas e despesas por entrega."
                        : "Detalhamento das suas vendas e o repasse à empresa."
                    }
                </p>

                {/* VISÃO GERAL (KPIs Financeiros) */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
                            <BarChart3 className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${totais.lucroTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(totais.lucroTotal)} 
                            </div>
                            <p className="text-xs text-muted-foreground">Total no período</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Receita (Repasse)</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(totais.receitaTotal)}</div>
                            <p className="text-xs text-muted-foreground">Total repassado pelos Vendedores</p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Custo do Frete</CardTitle>
                            <Truck className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{formatCurrency(totais.custoFreteTotal)}</div>
                            <p className="text-xs text-muted-foreground">Pagamentos a Motoristas/Bombistas</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Custo da Usina</CardTitle>
                            <Factory className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{formatCurrency(totais.custoUsinaTotal)}</div>
                            <p className="text-xs text-muted-foreground">Custo de compra do concreto (simulado)</p>
                        </CardContent>
                    </Card>
                </div>
                
                {/* TABELA DE DETALHES POR ENTREGA */}
                <Card>
                    <CardHeader>
                        <CardTitle>Transações Detalhadas (Entregas)</CardTitle>
                        <CardDescription>
                            Detalhes financeiros de cada entrega, considerando o repasse e os custos.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Entrega ID</TableHead>
                                    <TableHead>Cliente/Local</TableHead>
                                    <TableHead className="text-right">Volume (m³)</TableHead>
                                    <TableHead className="text-right">Receita Bruta</TableHead>
                                    <TableHead className="text-right">Custo Total</TableHead>
                                    <TableHead className="text-right">Lucro Líquido</TableHead>
                                    {isAdmin && <TableHead>Vendedor</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {detalhesEntregas.map((detalhe) => (
                                    <TableRow key={detalhe.id}>
                                        <TableCell>
                                            <Link href={`/entregas/${detalhe.id}`} className="text-blue-500 hover:underline">
                                                {detalhe.id.toUpperCase()}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{detalhe.localEntrega}</TableCell>
                                        <TableCell className="text-right font-medium">{detalhe.volumeTotalM3.toFixed(2)}</TableCell>
                                        <TableCell className="text-right text-green-600 font-medium">
                                            {formatCurrency(detalhe.receitaBruta)}
                                        </TableCell>
                                        <TableCell className="text-right text-red-600 font-medium">
                                            ({formatCurrency(detalhe.custoTotal)})
                                        </TableCell>
                                        <TableCell className={`text-right font-bold ${detalhe.lucroLiquido >= 0 ? 'text-primary' : 'text-red-600'}`}>
                                            {formatCurrency(detalhe.lucroLiquido)}
                                        </TableCell>
                                        {isAdmin && <TableCell>{detalhe.vendedorId}</TableCell>}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}