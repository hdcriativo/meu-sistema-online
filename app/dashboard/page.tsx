// ARQUIVO: app/dashboard/page.tsx

"use client";

import { useMemo } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { mockOrcamentos, mockEntregas, mockObras, mockUsers } from '@/lib/mock-data';
import { useAuth } from '@/contexts/auth-context';
import { DollarSign, Package, Truck, Clock, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// --- FUNÇÕES AUXILIARES ---
const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

// --- LÓGICA CENTRAL DE KPI ---
const useKpis = () => {
  return useMemo(() => {
    
    // --- MÓDULO VENDAS ---
    const totalOrcamentos = mockOrcamentos.length;
    const aprovados = mockOrcamentos.filter(o => o.status === 'aprovado').length;
    const pendentes = mockOrcamentos.filter(o => o.status === 'pendente' || o.status === 'em_revisao').length;
    const recusados = mockOrcamentos.filter(o => o.status === 'recusado').length;
    
    const volumeVendidoM3 = mockOrcamentos
        .filter(o => o.status === 'aprovado')
        .reduce((sum, o) => sum + (o.valorTotal / 100), 0); // Mock simples de volume para teste
    
    const valorTotalAprovado = mockOrcamentos
        .filter(o => o.status === 'aprovado')
        .reduce((sum, o) => sum + o.valorTotal, 0);

    // --- MÓDULO LOGÍSTICA ---
    const entregasEmRota = mockEntregas.filter(e => e.status === 'em_rota').length;
    const entregasFinalizadas = mockEntregas.filter(e => e.status === 'finalizada').length;
    const totalEntregas = mockEntregas.length;

    return {
      totalOrcamentos,
      aprovados,
      pendentes,
      recusados,
      valorTotalAprovado: formatCurrency(valorTotalAprovado),
      volumeVendidoM3: volumeVendidoM3.toFixed(1) + ' m³',
      entregasEmRota,
      entregasFinalizadas,
      totalEntregas
    };
  }, [mockOrcamentos, mockEntregas]);
};

// --- COMPONENTE PRINCIPAL ---
export default function DashboardPage() {
  const { user, role } = useAuth();
  const kpis = useKpis();

  // Filtra as próximas 5 entregas agendadas (útil para o Admin/Vendedor)
  const proximasEntregas = useMemo(() => {
    return mockEntregas
        .filter(e => e.status === 'agendada' || e.status === 'em_rota')
        .sort((a, b) => new Date(a.dataEntrega).getTime() - new Date(b.dataEntrega).getTime())
        .slice(0, 5)
        .map(entrega => {
            const obra = mockObras.find(o => o.id === entrega.orcamentoId.replace('orc', 'o'));
            const motorista = mockUsers.find(u => u.id === entrega.motoristaId);
            return {
                ...entrega,
                obraName: obra?.name || 'N/A',
                motoristaName: motorista?.name || 'N/A'
            };
        });
  }, [mockEntregas]);

  // Se for motorista, redireciona para a lista de entregas (ou mostra um dashboard diferente)
  if (role === 'motorista') {
    // Motoristas veem o painel de entregas, não este dashboard de vendas/gestão.
    // Você pode adicionar um redirecionamento aqui, mas por enquanto, mantemos a proteção de rota no SideNav.
    return (
        <AppLayout>
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold">Acesso Restrito</h1>
                <p>O perfil Motorista não possui acesso a este Dashboard de Gestão.</p>
            </div>
        </AppLayout>
    );
  }


  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold border-b pb-2">
            Dashboard Executivo <span className="text-blue-600">({user?.role.toUpperCase()})</span>
        </h1>

        {/* --- CARDS DE VENDAS E LOGÍSTICA --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
            {/* KPI 1: VALOR APROVADO */}
            <Card className="shadow-lg bg-green-50 border-l-4 border-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Vendas Aprovadas (Mês)
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{kpis.valorTotalAprovado}</div>
                    <p className="text-xs text-muted-foreground">+20.1% em relação ao mês passado</p>
                </CardContent>
            </Card>

            {/* KPI 2: VOLUME VENDIDO */}
            <Card className="shadow-lg bg-blue-50 border-l-4 border-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Volume Concreto (Aprovado)
                    </CardTitle>
                    <Package className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{kpis.volumeVendidoM3}</div>
                    <p className="text-xs text-muted-foreground">{kpis.totalEntregas} entregas agendadas</p>
                </CardContent>
            </Card>
            
            {/* KPI 3: ORÇAMENTOS PENDENTES */}
            <Card className="shadow-lg bg-orange-50 border-l-4 border-orange-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Aprovação Pendente
                    </CardTitle>
                    <Clock className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{kpis.pendentes}</div>
                    <p className="text-xs text-muted-foreground">de {kpis.totalOrcamentos} orçamentos</p>
                </CardContent>
            </Card>
            
            {/* KPI 4: ENTREGAS EM ROTA */}
            <Card className="shadow-lg bg-red-50 border-l-4 border-red-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Entregas Em Rota
                    </CardTitle>
                    <Truck className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{kpis.entregasEmRota}</div>
                    <p className="text-xs text-muted-foreground">{kpis.entregasFinalizadas} finalizadas hoje</p>
                </CardContent>
            </Card>
        </div>
        
        {/* --- LISTA DE PRÓXIMAS ENTREGAS --- */}
        <Card>
            <CardHeader>
                <CardTitle>Próximas Atividades Logísticas</CardTitle>
                <CardDescription>
                    As 5 entregas mais urgentes ou em andamento.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {proximasEntregas.length > 0 ? (
                    <div className="grid gap-4">
                        {proximasEntregas.map((entrega) => (
                            <div key={entrega.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition">
                                <div className="flex items-center space-x-3">
                                    <Truck className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="font-semibold">{entrega.obraName}</p>
                                        <p className="text-sm text-muted-foreground">{entrega.local}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Badge className="text-xs" variant={entrega.status === 'em_rota' ? 'em_andamento' : 'default'}>
                                        {entrega.status.toUpperCase().replace(/_/g, ' ')}
                                    </Badge>
                                    <p className="text-sm font-medium mt-1">
                                        {format(new Date(entrega.dataEntrega), 'dd/MM HH:mm', { locale: ptBR })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500">Nenhuma entrega agendada ou em rota no momento.</p>
                )}
            </CardContent>
        </Card>

      </div>
    </AppLayout>
  );
}