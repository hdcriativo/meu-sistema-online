"use client";

import { useState, useMemo } from 'react';
import { Truck, MapPin, Clock, Package, CheckCircle, XCircle, Play, Undo2 } from 'lucide-react';

// ====================================================================
// --- 1. MOCKS DE NEXT.JS E BIBLIOTECAS INTERNAS (Para Funcionalidade)
// ====================================================================

// Mock de Next.js Navigation
// Usa um ID fixo para demonstração
const mockRouter = { push: (path: string) => console.log('NAVIGATE:', path) };
const useRouter = () => mockRouter;
const useParams = () => ({ id: 'ent-001' }); // ID de teste padrão
const notFound = () => {
    console.error("404 Not Found triggered (Mock)");
    return (
        <AppLayout>
            <div className="p-8 max-w-xl mx-auto text-center py-20">
                <h1 className="text-3xl font-bold text-red-600">404 - Entrega Não Encontrada</h1>
                <p className="text-muted-foreground mt-2">Verifique o ID da entrega.</p>
            </div>
        </AppLayout>
    );
};

// Mock de date-fns (simplificado para o mínimo necessário)
const format = (date: Date, formatStr: string) => {
    // Implementação extremamente simplificada para demo (ignora locale)
    if (!date) return 'Data Inválida';
    const d = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const t = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${d} - ${t}`;
};
const ptBR = {}; // Mock do objeto locale

// Mock de AppLayout
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100">{children}</main>
);

// ====================================================================
// --- 2. MOCKS DE SHADCN/UI (Para Renderização)
// ====================================================================

const Card: React.FC<{ className?: string, children: React.ReactNode }> = ({ className, children }) => (
    <div className={`rounded-xl border bg-card text-card-foreground shadow ${className}`}>
        {children}
    </div>
);
const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="flex flex-col space-y-1.5 p-6">{children}</div>;
const CardTitle: React.FC<{ className?: string, children: React.ReactNode }> = ({ className, children }) => <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
const CardContent: React.FC<{ className?: string, children: React.ReactNode }> = ({ className, children }) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;
const CardDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => <p className="text-sm text-muted-foreground">{children}</p>;
const Button: React.FC<{ onClick?: () => void, className?: string, children: React.ReactNode, variant?: string, type?: 'button' | 'submit' }> = ({ onClick, className, children }) => (
    <button onClick={onClick} className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 h-10 px-4 py-2 ${className}`}>
        {children}
    </button>
);
const Badge: React.FC<{ variant: string, className?: string, children: React.ReactNode }> = ({ variant, className, children }) => {
    let baseStyle = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
    let colorStyle = "bg-gray-100 text-gray-800 border-transparent dark:bg-gray-700 dark:text-gray-200"; // default
    if (variant === "concluido") colorStyle = "bg-green-100 text-green-800 border-green-400 dark:bg-green-900 dark:text-green-200";
    if (variant === "em_andamento") colorStyle = "bg-yellow-100 text-yellow-800 border-yellow-400 dark:bg-yellow-900 dark:text-yellow-200";
    if (variant === "recusado") colorStyle = "bg-red-100 text-red-800 border-red-400 dark:bg-red-900 dark:text-red-200";
    return <div className={`${baseStyle} ${colorStyle} ${className}`}>{children}</div>;
};
const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
);
const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = (props) => (
    <label {...props} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" />
);

// Mocks para Dialog (modal)
const Dialog: React.FC<{ open: boolean, onOpenChange: (open: boolean) => void, children: React.ReactNode }> = ({ open, onOpenChange, children }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full">
                {children}
            </div>
        </div>
    );
};
const DialogContent: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="p-6">{children}</div>;
const DialogHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="text-center sm:text-left space-y-2">{children}</div>;
const DialogTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => <h4 className="text-xl font-semibold">{children}</h4>;
const DialogDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => <p className="text-sm text-muted-foreground">{children}</p>;
const DialogFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="flex justify-end pt-4 space-x-2 border-t mt-4">{children}</div>;


// ====================================================================
// --- 3. MOCKS DE DADOS (Substituindo @/lib/mock-data)
// ====================================================================

interface User { id: string; name: string; role: 'admin' | 'vendedor' | 'motorista'; empresaId: string; }
interface Obra { id: string; name: string; endereco: string; clienteId: string; }
interface Entrega {
    id: string;
    orcamentoId: string;
    local: string;
    dataEntrega: string;
    motoristaId: string;
    volumeAgendado: number;
    volumeRealizado?: number;
    status: 'agendada' | 'em_rota' | 'finalizada' | 'cancelada';
}

const mockUsers: User[] = [
    { id: 'mot-003', name: 'Motorista Bruno', role: 'motorista', empresaId: 'emp-a' },
    { id: 'mot-004', name: 'Motorista César', role: 'motorista', empresaId: 'emp-a' },
    { id: 'user-002', name: 'Vendedor Alpha', role: 'vendedor', empresaId: 'emp-a' },
];
const mockObras: Obra[] = [
    { id: 'o-123', name: 'Construção Edifício Luxor', endereco: 'Rua A, 100', clienteId: 'cli-01' },
    { id: 'o-456', name: 'Reforma Casa Beta', endereco: 'Av. B, 200', clienteId: 'cli-02' },
];

// O mock de entregas inicial (usamos ent-001 como padrão para o useParams mock)
const initialMockEntregas: Entrega[] = [
    { id: 'ent-001', orcamentoId: 'orc-123', local: 'Rua A, 100, Centro, SP', dataEntrega: '2025-10-01T08:00:00', motoristaId: 'mot-003', volumeAgendado: 5.5, status: 'agendada' },
    { id: 'ent-002', orcamentoId: 'orc-456', local: 'Av. B, 200, Bairro Jardim, RJ', dataEntrega: '2025-10-02T10:30:00', motoristaId: 'mot-004', volumeAgendado: 12.0, status: 'em_rota' },
    { id: 'ent-003', orcamentoId: 'orc-789', local: 'Rua C, 300, Indústria, MG', dataEntrega: '2025-10-03T14:00:00', motoristaId: 'mot-003', volumeAgendado: 8.0, volumeRealizado: 7.8, status: 'finalizada' },
];
// Usamos uma variável mutável para simular a persistência de status (apenas para este mock)
let mockEntregas = [...initialMockEntregas];

// ====================================================================
// --- 4. FUNÇÕES AUXILIARES (Definições Locais)
// ====================================================================

const statusVariant = (status: string): "default" | "concluido" | "recusado" | "em_andamento" => {
    switch (status) {
        case "finalizada": return "concluido";
        case "em_rota": return "em_andamento";
        case "cancelada": return "recusado";
        case "agendada":
        default: return "default";
    }
}

const getStatusIcon = (status: string) => {
    switch (status) {
        case "finalizada": return <CheckCircle className="h-5 w-5 mr-2" />;
        case "em_rota": return <Play className="h-5 w-5 mr-2" />;
        case "cancelada": return <XCircle className="h-5 w-5 mr-2" />;
        case "agendada": return <Clock className="h-5 w-5 mr-2" />;
        default: return null;
    }
}


// ====================================================================
// --- 5. COMPONENTE PRINCIPAL (EntregaDetalhesPage)
// ====================================================================
export default function EntregaDetalhesPage() {
    const router = useRouter();
    const params = useParams();
    const entregaId = params.id as string;

    // Estado para a entrega, inicializado com o valor do mock
    const [entregaData, setEntregaData] = useState(mockEntregas.find(e => e.id === entregaId));
    const [isFinishing, setIsFinishing] = useState(false);
    const [volumeReal, setVolumeReal] = useState<number | ''>(entregaData?.volumeAgendado || ''); // Inicializa com o volume agendado
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

    // Se a entrega não for encontrada (o que só aconteceria se o ID de teste fosse trocado)
    if (!entregaData) {
        return notFound();
    }

    // Enriquecer dados (Obra e Motorista)
    const { obra, motorista } = useMemo(() => {
        // Encontra a obra pelo ID do orçamento (simulação: orc-123 -> o-123)
        const obra = mockObras.find(o => o.id === entregaData.orcamentoId.replace('orc', 'o'));
        const motorista = mockUsers.find(u => u.id === entregaData.motoristaId);
        return { obra, motorista };
    }, [entregaData]);

    // --- WORKFLOW 1: INICIAR VIAGEM (PATCH API SIMULADO) ---
    const handleIniciarViagem = () => {
        setFeedbackMessage(null);
        
        try {
            // Simula a chamada PATCH na API para mudar o status
            setEntregaData(prev => ({
                ...prev!,
                status: 'em_rota',
            }));
            
            // Atualiza o mock global para persistir o estado de teste
            const index = mockEntregas.findIndex(e => e.id === entregaId);
            if (index !== -1) mockEntregas[index].status = 'em_rota';
            
            setFeedbackMessage('✅ Viagem iniciada com sucesso! Status atualizado para "Em Rota".');
        } catch (error) {
            setFeedbackMessage('❌ Erro ao iniciar viagem.');
            console.error(error);
        }
    };

    // --- WORKFLOW 2: FINALIZAR ENTREGA (Coleta de Dados e PATCH SIMULADO) ---
    const handleFinalizar = () => {
        setFeedbackMessage(null);

        if (typeof volumeReal !== 'number' || volumeReal <= 0) {
            setFeedbackMessage('⚠️ Por favor, insira um volume real entregue válido.');
            return;
        }
        
        try {
            // Simula a chamada PATCH na API para mudar o status e gravar o volume
            setEntregaData(prev => ({
                ...prev!,
                status: 'finalizada',
                volumeRealizado: volumeReal,
            }));
            
            // Atualiza o mock global
            const index = mockEntregas.findIndex(e => e.id === entregaId);
            if (index !== -1) {
                mockEntregas[index].status = 'finalizada';
                mockEntregas[index].volumeRealizado = volumeReal;
            }
            
            setIsFinishing(false);
            setFeedbackMessage(`✅ Entrega finalizada com sucesso! Volume real: ${volumeReal} m³.`);
            // router.push('/entregas'); // Comentado para não sair da página de teste
        } catch (error) {
            setFeedbackMessage('❌ Erro ao finalizar entrega.');
            console.error(error);
        }
    };
    
    // --- WORKFLOW 3: CANCELAR ENTREGA (Motorista não pode fazer, mas Vendedor/Admin pode) ---
    const handleCancelar = () => {
        setFeedbackMessage(null);
        if (window.confirm("Tem certeza que deseja cancelar esta entrega?")) {
            try {
                // Simula a chamada PATCH na API para mudar o status
                setEntregaData(prev => ({
                    ...prev!,
                    status: 'cancelada',
                }));
                
                const index = mockEntregas.findIndex(e => e.id === entregaId);
                if (index !== -1) mockEntregas[index].status = 'cancelada';
                
                setFeedbackMessage('🔴 Entrega cancelada com sucesso!');
            } catch (error) {
                setFeedbackMessage('❌ Erro ao cancelar entrega.');
                console.error(error);
            }
        }
    };


    const isAgendada = entregaData.status === 'agendada';
    const isEmRota = entregaData.status === 'em_rota';
    const isFinalizada = entregaData.status === 'finalizada';
    const isCancelada = entregaData.status === 'cancelada';

    return (
        <AppLayout>
            <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
                
                {/* CABEÇALHO */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4">
                    <div>
                        <h1 className="text-3xl font-bold">Detalhes da Entrega #{entregaId.substring(4).toUpperCase()}</h1>
                        <p className="text-muted-foreground">Obra: <span className='font-semibold'>{obra?.name || 'N/A'}</span></p>
                    </div>
                    <Badge variant={statusVariant(entregaData.status)} className="mt-2 md:mt-0 text-lg py-1 px-4 shadow-md">
                        {getStatusIcon(entregaData.status)}
                        <span className='font-bold'>{entregaData.status.toUpperCase().replace(/_/g, ' ')}</span>
                    </Badge>
                </div>

                {/* FEEDBACK DE AÇÃO */}
                {feedbackMessage && (
                    <div className="p-4 rounded-lg shadow-inner text-center font-medium bg-blue-50 border border-blue-200 dark:bg-blue-950 dark:border-blue-700 dark:text-blue-200">
                        {feedbackMessage}
                    </div>
                )}

                {/* --- DADOS DA ENTREGA --- */}
                <Card className="shadow-xl dark:bg-gray-800">
                    <CardHeader>
                        <CardTitle className="flex items-center text-blue-600 dark:text-blue-400">
                            <MapPin className="h-5 w-5 mr-2" /> Local e Agendamento
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className='bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border'>
                            <Label className="text-muted-foreground block text-sm mb-1">Endereço de Entrega</Label>
                            <p className="font-semibold text-lg">{entregaData.local}</p>
                        </div>
                        <div className='bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border'>
                            <Label className="text-muted-foreground block text-sm mb-1">Data/Hora Agendada</Label>
                            <p className="font-semibold text-lg">
                                {format(new Date(entregaData.dataEntrega), 'dd/MM/yyyy - HH:mm', { locale: ptBR })}
                            </p>
                        </div>
                        <div className='bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border'>
                            <Label className="text-muted-foreground block text-sm mb-1">Motorista Atribuído</Label>
                            <p className="font-semibold text-lg flex items-center">
                                <Truck className='h-4 w-4 mr-2 text-gray-500'/>{motorista?.name || 'Não Atribuído'}
                            </p>
                        </div>
                        <div className='bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border'>
                            <Label className="text-muted-foreground block text-sm mb-1">Volume Agendado</Label>
                            <p className="font-bold text-xl text-green-700 dark:text-green-400">{entregaData.volumeAgendado} m³</p>
                        </div>
                        
                        {/* Exibição do volume realizado (se finalizada) */}
                        {isFinalizada && (
                            <div className="md:col-span-2 bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-300">
                                <Label className="text-green-700 dark:text-green-300 block text-sm mb-1">Volume REALIZADO</Label>
                                <p className="font-bold text-2xl text-red-600 dark:text-red-400">{entregaData.volumeRealizado} m³</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
                
                {/* --- BOTÕES DE AÇÃO (Workflow do Motorista/Operacional) --- */}
                {!isFinalizada && !isCancelada && (
                    <Card className="bg-gray-100 dark:bg-gray-700 border-4 border-dashed border-gray-300 shadow-inner">
                        <CardHeader>
                            <CardTitle className="text-xl">Ações Operacionais</CardTitle>
                            <CardDescription>Atualize o status da entrega para iniciar ou finalizar o serviço.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col md:flex-row gap-4">
                            
                            {/* Botão INICIAR VIAGEM (Visível se AGENDADA) */}
                            {isAgendada && (
                                <Button 
                                    className="w-full bg-yellow-600 hover:bg-yellow-700 h-12 text-lg shadow-md transition-all hover:shadow-lg" 
                                    onClick={handleIniciarViagem}
                                >
                                    <Truck className="h-5 w-5 mr-2" />
                                    Iniciar Viagem
                                </Button>
                            )}
                            
                            {/* Botão FINALIZAR ENTREGA (Visível se EM ROTA ou AGENDADA) */}
                            {(isEmRota || isAgendada) && (
                                <Button 
                                    className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg shadow-md transition-all hover:shadow-lg" 
                                    onClick={() => setIsFinishing(true)}
                                >
                                    <CheckCircle className="h-5 w-5 mr-2" />
                                    Finalizar Entrega
                                </Button>
                            )}
                            
                            {/* Botão CANCELAR (Disponível sempre que não estiver finalizada) */}
                            <Button 
                                variant="outline"
                                className="w-full bg-red-100 text-red-600 border-red-300 hover:bg-red-200 h-12 text-lg transition-all" 
                                onClick={handleCancelar}
                            >
                                <XCircle className="h-5 w-5 mr-2" />
                                Cancelar Entrega
                            </Button>

                        </CardContent>
                    </Card>
                )}
                
                {/* Botão de Voltar */}
                <div className="text-center pt-4">
                    <Button 
                        variant="link" 
                        onClick={() => router.push('/entregas')}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        <Undo2 className='h-4 w-4 mr-1'/> Voltar para a Lista de Entregas
                    </Button>
                </div>
                

            </div>
            
            {/* --- POP-UP / DIALOGO DE FINALIZAÇÃO --- */}
            <Dialog open={isFinishing} onOpenChange={setIsFinishing}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmação de Entrega</DialogTitle>
                        <DialogDescription>
                            Insira o volume real de concreto entregue no local da obra.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="volumeReal" className="text-right">
                                Volume Real (m³)
                            </Label>
                            <Input
                                id="volumeReal"
                                type="number"
                                step="0.1"
                                min="0"
                                placeholder={String(entregaData.volumeAgendado)}
                                value={volumeReal}
                                onChange={(e) => setVolumeReal(parseFloat(e.target.value))}
                                className="col-span-3 text-lg font-bold"
                            />
                        </div>
                        <p className="text-sm text-muted-foreground text-center">
                            Volume Agendado: <span className='font-semibold text-green-600'>{entregaData.volumeAgendado} m³</span>
                        </p>
                    </div>
                    
                    <DialogFooter>
                        <Button className='bg-gray-200 text-gray-800 hover:bg-gray-300' onClick={() => setIsFinishing(false)}>Cancelar</Button>
                        <Button 
                            type="button" 
                            onClick={handleFinalizar} 
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <CheckCircle className="h-5 w-5 mr-2" /> Confirmar e Finalizar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
