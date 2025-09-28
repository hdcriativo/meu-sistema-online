// app/agendamentos/page.tsx (Corrigido para Salvar o Agendamento)
"use client"

import { useMemo, useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Truck, Map, CheckCircle, XCircle, ArrowRight, Calendar, User, Factory, Send, Pin } from "lucide-react"
import { mockEntregas, mockUsers, Entrega } from "@/lib/mock-data"
import { useAuth } from "@/contexts/auth-context"
import { formatCurrency } from "@/lib/utils" 
import Link from "next/link"
import { NewServicoDialog } from "@/components/servicos/NewServicoDialog"

// --- COMPONENTE AUXILIAR: CARTÃO DE ENTREGA (Mobile-First) ---

interface EntregaDetalheProps {
    entrega: Entrega;
    isMotoristaView: boolean;
}

const EntregaDetalheCard: React.FC<EntregaDetalheProps> = ({ entrega, isMotoristaView }) => {
    // Nota: Aqui assumimos que a Entrega importada possui os campos necessários
    const motorista = mockUsers.find(u => u.id === entrega.motoristaId)?.name || 'Não atribuído';
    const volume = entrega.volumeTotalM3 || 0;
    
    let statusBadge;
    let actionButton;

    if (entrega.status === 'pendente') {
        statusBadge = <Badge variant="secondary" className="bg-orange-500 hover:bg-orange-500"><Clock className="h-4 w-4 mr-2" /> Pendente</Badge>;
        if (isMotoristaView) {
            actionButton = (
                <Button 
                    size="sm" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => alert(`Iniciando Rota para a entrega ${entrega.id}!`)}
                >
                    <Send className="h-4 w-4 mr-2" /> Iniciar Viagem
                </Button>
            );
        }
    } else if (entrega.status === 'concluida') {
        statusBadge = <Badge variant="default" className="bg-green-600 hover:bg-green-600"><CheckCircle className="h-4 w-4 mr-2" /> Concluída</Badge>;
    } else if (entrega.status === 'cancelada') {
        statusBadge = <Badge variant="destructive"><XCircle className="h-4 w-4 mr-2" /> Cancelada</Badge>;
    }

    // Visão Móvel do Motorista
    if (isMotoristaView) {
        return (
            <Card className="shadow-lg border-l-4 border-blue-600">
                <CardHeader className="p-4 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold flex items-center">
                            <Truck className="h-5 w-5 mr-2 text-blue-600" /> Entrega #{entrega.id.toUpperCase()}
                        </CardTitle>
                        <CardDescription className="text-sm mt-1 flex items-center">
                            <Calendar className="h-4 w-4 mr-1"/> {new Date(entrega.dataAgendamento).toLocaleDateString()}
                        </CardDescription>
                    </div>
                    {statusBadge}
                </CardHeader>
                <CardContent className="p-4 border-t space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Local:</span>
                        <span className="font-semibold">{entrega.localEntrega}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Volume:</span>
                        <span className="font-semibold">{volume.toFixed(2)} m³</span>
                    </div>
                    
                    {/* Botão de Rota (Aberto no Google Maps) */}
                    <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(entrega.localEntrega)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-800 font-medium pt-2"
                    >
                        <Map className="h-5 w-5" />
                        <span>Ver Rota no Mapa</span>
                    </a>
                    
                    <div className="pt-2">
                        {actionButton}
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    // Visão de Admin/Vendedor (mais densa, foco na tabela)
    return (
        <tr key={entrega.id}>
            <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium">
                 <Link href={`/entregas/${entrega.id}`} className="text-blue-500 hover:underline">
                    {entrega.id.toUpperCase()}
                </Link>
            </td>
            <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{entrega.localEntrega}</td>
            <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{volume.toFixed(2)} m³</td>
            <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{motorista}</td>
            <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{new Date(entrega.dataAgendamento).toLocaleDateString()}</td>
            <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{statusBadge}</td>
            <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right">
                {/* Ação para Admin/Vendedor: Ver Detalhes */}
                <Link href={`/entregas/${entrega.id}`}>
                    <Button variant="outline" size="sm">Ver</Button>
                </Link>
            </td>
        </tr>
    );
};


// --- COMPONENTE PRINCIPAL ---

export default function AgendamentosPage() {
    // 1. HOOKS NO TOPO
    const { user, empresa } = useAuth();
    const [filtroStatus, setFiltroStatus] = useState<'todos' | 'pendente' | 'concluida' | 'cancelada'>('pendente');
    
    // 💥 MUDANÇA CRÍTICA: Inicializa o estado com mockEntregas
    const [entregas, setEntregas] = useState<Entrega[]>(mockEntregas); 

    // 2. LÓGICA DE FILTRAGEM (useMemo)
    const entregasFiltradas = useMemo(() => {
        if (!user || !empresa) return [];
        
        // Agora filtra o estado 'entregas'
        let entregasBase = entregas.filter(e => e.empresaId === empresa.id);
        
        // MOTORISTA: Vê apenas as entregas atribuídas a ele
        if (user.role === 'motorista') {
            entregasBase = entregasBase.filter(e => e.motoristaId === user.id);
        }
        
        // VENDEDOR: Vê apenas as entregas que ele vendeu
        if (user.role === 'vendedor') {
            entregasBase = entregasBase.filter(e => e.vendedorId === user.id);
        }

        // Filtro por Status
        if (filtroStatus !== 'todos') {
            return entregasBase.filter(e => e.status === filtroStatus);
        }
        
        return entregasBase;
        
    // 💥 Dependência adicionada: 'entregas'
    }, [user, empresa, filtroStatus, entregas]);

    // 3. HANDLER QUE RECEBE E SALVA O NOVO AGENDAMENTO
    const handleNewAgendamento = (agendamentoData: any) => { 
        console.log("SUCESSO: Novo Agendamento Recebido. Mapeando para Entrega...", agendamentoData);
        
        // 🚨 Mapeia os dados do formulário (Concretagem) para o formato esperado (Entrega)
        const newEntrega: Entrega = {
            id: agendamentoData.id,
            dataAgendamento: agendamentoData.dataAgendamento, // Mantém como string ou converte se necessário
            localEntrega: agendamentoData.enderecoObra,
            volumeTotalM3: agendamentoData.quantidadeM3,
            status: 'pendente',
            // Preenchendo campos obrigatórios para a lógica de filtragem
            empresaId: empresa.id, 
            motoristaId: null, // Motorista ainda não atribuído
            vendedorId: user.role === 'vendedor' || user.role === 'admin' ? user.id : 'desconhecido',
            
            // Campos extras (Opcional, mas útil para o contexto)
            cliente: agendamentoData.nomeCliente, 
            telefone: agendamentoData.telefone,
            usaBomba: agendamentoData.usaBomba,
        };
        
        // 💥 ATUALIZA O ESTADO: Adiciona a nova entrega ao topo da lista (prev)
        setEntregas(prev => [newEntrega as Entrega, ...prev]);

        // Aqui você faria a chamada API REAL para salvar newEntrega no banco de dados.
        // Se a API retornar sucesso, você manteria o setEntregas acima.
    }


    // 4. RETORNOS CONDICIONAIS APÓS HOOKS
    if (!user || !empresa) return <p>Carregando dados...</p>;

    const isMotorista = user.role === 'motorista';
    const isAdminOrVendedor = user.role === 'admin' || user.role === 'vendedor';
    
    // Motorista (View Mobile)
    if (isMotorista) {
        // ... (código do motorista inalterado)
        return (
            <AppLayout>
                <div className="p-4 space-y-6 max-w-lg mx-auto">
                    <h1 className="text-2xl font-bold text-foreground flex items-center">
                        <Truck className="h-6 w-6 mr-2" /> Minhas Viagens Pendentes
                    </h1>
                    <p className="text-muted-foreground">
                        {entregasFiltradas.length} entrega(s) agendada(s) para você, {user.name}.
                    </p>
                    
                    {/* Botões de Filtro Rápido para Motorista (Priorizando Pendentes/Concluídas) */}
                    <div className="flex space-x-2">
                         <Button 
                            variant={filtroStatus === 'pendente' ? 'default' : 'outline'} 
                            onClick={() => setFiltroStatus('pendente')}
                        >
                            <Clock className="h-4 w-4 mr-2" /> Pendentes
                        </Button>
                        <Button 
                            variant={filtroStatus === 'concluida' ? 'default' : 'outline'} 
                            onClick={() => setFiltroStatus('concluida')}
                        >
                            <CheckCircle className="h-4 w-4 mr-2" /> Concluídas
                        </Button>
                    </div>

                    {/* Lista de Entregas em formato Card (Mobile) */}
                    <div className="space-y-4">
                        {entregasFiltradas.length > 0 ? (
                            entregasFiltradas.map((entrega) => (
                                <EntregaDetalheCard key={entrega.id} entrega={entrega} isMotoristaView={true} />
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground pt-8">
                                Não há entregas {filtroStatus === 'pendente' ? 'pendentes' : 'neste status'} no momento.
                            </p>
                        )}
                    </div>
                </div>
            </AppLayout>
        );
    }

    // Admin/Vendedor (View Desktop/Tablet)
    if (isAdminOrVendedor) {
        return (
            <AppLayout>
                <div className="p-8 space-y-8 max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">
                                {user.role === 'admin' ? "Gestão de Agendamentos (Frota)" : "Minhas Entregas Vendidas"}
                            </h1>
                            <p className="text-muted-foreground">
                                {entregasFiltradas.length} entrega(s) encontradas no sistema.
                            </p>
                        </div>
                        {/* Chamada para o Modal, passando a função de sucesso */}
                        <NewServicoDialog onSuccess={handleNewAgendamento} /> 
                    </div>

                    {/* Botões de Filtro Rápido para Admin/Vendedor */}
                    <div className="flex space-x-2">
                         <Button variant={filtroStatus === 'pendente' ? 'default' : 'outline'} onClick={() => setFiltroStatus('pendente')}>Pendentes</Button>
                         <Button variant={filtroStatus === 'concluida' ? 'default' : 'outline'} onClick={() => setFiltroStatus('concluida')}>Concluídas</Button>
                         <Button variant={filtroStatus === 'todos' ? 'default' : 'outline'} onClick={() => setFiltroStatus('todos')}>Todos</Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Entregas Agendadas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto"> 
                                <table className="w-full text-sm caption-bottom">
                                    <thead>
                                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Local de Entrega</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Volume</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Motorista</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Data</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                            <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {entregasFiltradas.length > 0 ? (
                                            entregasFiltradas.map((entrega) => (
                                                <EntregaDetalheCard key={entrega.id} entrega={entrega} isMotoristaView={false} />
                                            ))
                                        ) : (
                                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                <td colSpan={7} className="p-4 text-center text-muted-foreground">
                                                    Nenhuma entrega encontrada para este status.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        );
    }
    
    // Se o usuário não for Motorista, Admin ou Vendedor
    return (
        <AppLayout>
             <div className="p-8 max-w-7xl mx-auto text-center py-20">
                 <h1 className="text-3xl font-bold text-red-600">Acesso Negado</h1>
                 <p className="text-muted-foreground mt-2">Você não tem permissão para visualizar o Agendamento de Entregas.</p>
             </div>
        </AppLayout>
    );
}