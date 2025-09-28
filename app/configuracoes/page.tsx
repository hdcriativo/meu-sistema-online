"use client"

import { useState, useMemo } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { User as UserIcon, Bell, Shield, Building2, Save, Users, DollarSign, Calendar, Filter, Truck } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { mockConfiguracoes, ConfiguracoesEmpresa, mockUsinas } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils"

// --- COMPONENTES AUXILIARES PARA ADMIN (Mestres) ---

// Componente para a seção de Frete
const FreteConfigForm = ({ config, onSave }: { config: ConfiguracoesEmpresa, onSave: (newConfig: ConfiguracoesEmpresa) => void }) => {
    const [taxaMinima, setTaxaMinima] = useState(config.taxaMinimaFrete);
    const [valorM3, setValorM3] = useState(config.valorM3Frete);

    const handleSave = () => {
        const newConfig = {
            ...config,
            taxaMinimaFrete: parseFloat(taxaMinima.toFixed(2)),
            valorM3Frete: parseFloat(valorM3.toFixed(2)),
        };
        onSave(newConfig);
    };

    return (
        <Card className="shadow-lg border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-blue-600">Configurações de Frete</CardTitle>
                <Truck className="h-6 w-6 text-blue-500" />
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="taxaMinima">Taxa Mínima do Frete (R$)</Label>
                    <Input 
                        id="taxaMinima" 
                        type="number" 
                        value={taxaMinima} 
                        onChange={(e) => setTaxaMinima(parseFloat(e.target.value) || 0)}
                        placeholder="80.00"
                    />
                    <CardDescription>Valor mínimo pago ao motorista por entrega.</CardDescription>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="valorM3Frete">Valor Cobrado por m³ Carregado (R$)</Label>
                    <Input 
                        id="valorM3Frete" 
                        type="number" 
                        value={valorM3} 
                        onChange={(e) => setValorM3(parseFloat(e.target.value) || 0)}
                        placeholder="10.00"
                    />
                    <CardDescription>Valor adicional pago ao motorista por m³.</CardDescription>
                </div>
            </CardContent>
            <CardFooter className="pt-4">
                <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 w-full"><Save className="h-4 w-4 mr-2" /> Salvar Frete</Button>
            </CardFooter>
        </Card>
    );
};

// Componente para a seção de Repasse do Vendedor
const VendedorRepasseConfigForm = ({ config, onSave }: { config: ConfiguracoesEmpresa, onSave: (newConfig: ConfiguracoesEmpresa) => void }) => {
    const [valorRepasse, setValorRepasse] = useState(config.valorM3RepasseVendedor);

    const handleSave = () => {
        const newConfig = {
            ...config,
            valorM3RepasseVendedor: parseFloat(valorRepasse.toFixed(2)),
        };
        onSave(newConfig);
    };

    return (
        <Card className="shadow-lg border-green-200">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-green-600">Repasse do Vendedor</CardTitle>
                <DollarSign className="h-6 w-6 text-green-500" />
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="valorRepasse">Valor de Repasse/m³ (para a Empresa - R$)</Label>
                    <Input 
                        id="valorRepasse" 
                        type="number" 
                        value={valorRepasse} 
                        onChange={(e) => setValorRepasse(parseFloat(e.target.value) || 0)}
                        placeholder="150.00"
                    />
                    <CardDescription>Valor que o vendedor deve repassar à empresa por m³ vendido. Isso define a receita bruta da empresa.</CardDescription>
                </div>
            </CardContent>
            <CardFooter className="pt-4">
                <Button onClick={handleSave} variant="secondary" className="w-full bg-green-500 hover:bg-green-600 text-white"><Save className="h-4 w-4 mr-2" /> Salvar Repasse</Button>
            </CardFooter>
        </Card>
    );
};


// --- MOCKED DATA (movido para fora do componente para evitar re-render) ---
const MOCKED_APPOINTMENTS = [
  { id: 1, date: "2025-09-25", time: "08:00", description: "Entrega Obra A" },
  { id: 2, date: "2025-09-25", time: "10:30", description: "Entrega Obra B" },
  { id: 3, date: "2025-09-26", time: "09:00", description: "Entrega Obra C" },
  { id: 4, date: "2025-09-27", time: "14:00", description: "Entrega Obra D" },
];


// ====================================================================
// COMPONENTE PRINCIPAL
// ====================================================================

export default function ConfiguracoesPage() {
    const { user, empresa } = useAuth();
    const [configuracoes, setConfiguracoes] = useState({
        notificacoes: { email: true, push: true, sms: false },
        tema: "system",
        idioma: "pt-BR",
    });
    
    // Dados de Configuração Mestra (usamos o mockConfiguracoes real)
    const [masterConfig, setMasterConfig] = useState<ConfiguracoesEmpresa | null>(null);

    // Campos adicionais do seu código original (simulação)
    const [blockedDate, setBlockedDate] = useState("");
    const [blockedTime, setBlockedTime] = useState("");
    const [view, setView] = useState<"day" | "week" | "month">("month");
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [companyName, setCompanyName] = useState(empresa?.name || "Nome da Empresa");
    const [companyLogo, setCompanyLogo] = useState("/images/logo-placeholder.png");


    // 1. Lógica para carregar a Master Config
    useMemo(() => {
        if (empresa) {
            const currentConfig = mockConfiguracoes.find(c => c.empresaId === empresa.id);
            setMasterConfig(currentConfig || null);
        }
    }, [empresa]);

    // 2. Lógica para salvar a Master Config (simulação)
    const updateMasterConfig = (newConfig: ConfiguracoesEmpresa) => {
        console.log("Configurações mestras salvas (Simulação):", newConfig);
        setMasterConfig(newConfig); 
        alert("Configurações mestras salvas com sucesso!");
    };

    // 3. Cálculos e Lógica da Agenda (mantidos do seu código original)
    const appointmentsForSelectedDate = useMemo(() => {
        return MOCKED_APPOINTMENTS.filter(app => app.date === selectedDate);
    }, [selectedDate]);

    const handleBlockSchedule = (period: string, date: string, time?: string) => {
        console.log(`Bloqueando ${period} em: ${date} ${time || ''}`);
        alert(`A agenda foi bloqueada para o período: ${period}, na data: ${date} ${time ? ' e no horário: ' + time : ''}.`);
    };

    const isAdmin = user?.role === 'admin';
    const isVendedor = user?.role === 'vendedor';
    const isMotorista = user?.role === 'motorista';

    if (!user) return <p>Carregando...</p>;
    
    // ====================================================================
    // BLOQUEIO GERAL: MOTORISTA
    // ====================================================================
    if (isMotorista) {
        return (
            <AppLayout>
                <div className="p-8 max-w-7xl mx-auto text-center py-20">
                    <h1 className="text-3xl font-bold text-red-600">Acesso Negado</h1>
                    <p className="text-muted-foreground mt-2">Você não tem permissão para acessar as Configurações do Sistema.</p>
                </div>
            </AppLayout>
        );
    }

    // ====================================================================
    // DEFINIÇÃO DAS SEÇÕES
    // ====================================================================

    const secoes = [
        // 1. PERFIL (Comum a todos, exceto Motorista)
        {
            titulo: "Perfil do Usuário",
            descricao: "Gerencie suas informações pessoais",
            icone: UserIcon,
            acesso: true, // Sempre visível para Admin/Vendedor
            conteudo: (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="nome">Nome Completo</Label>
                            <Input id="nome" defaultValue={user?.name} />
                        </div>
                        <div>
                            <Label htmlFor="email">E-mail</Label>
                            <Input id="email" type="email" defaultValue={user?.email} disabled={!isAdmin} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="telefone">Telefone</Label>
                            <Input id="telefone" defaultValue={user?.phone || ""} />
                        </div>
                        <div>
                            <Label htmlFor="cargo">Cargo</Label>
                            <Input id="cargo" defaultValue={user?.role.toUpperCase()} disabled />
                        </div>
                    </div>
                </div>
            ),
        },
        // 2. NOTIFICAÇÕES (Comum a todos, exceto Motorista)
        {
            titulo: "Notificações",
            descricao: "Configure como você quer receber notificações",
            icone: Bell,
            acesso: true, // Sempre visível para Admin/Vendedor
            conteudo: (
                 <div className="space-y-4">
                     <div className="flex items-center justify-between">
                         <div>
                             <Label>Notificações por E-mail</Label>
                             <p className="text-sm text-muted-foreground">Receba atualizações importantes por e-mail</p>
                         </div>
                         <Switch
                             checked={configuracoes.notificacoes.email}
                             onCheckedChange={(checked) =>
                                 setConfiguracoes((prev) => ({
                                     ...prev,
                                     notificacoes: { ...prev.notificacoes, email: checked },
                                 }))
                             }
                         />
                     </div>
                     <Separator />
                     <div className="flex items-center justify-between">
                         <div>
                             <Label>Notificações Push</Label>
                             <p className="text-sm text-muted-foreground">Receba notificações no navegador</p>
                         </div>
                         <Switch
                             checked={configuracoes.notificacoes.push}
                             onCheckedChange={(checked) =>
                                 setConfiguracoes((prev) => ({
                                     ...prev,
                                     notificacoes: { ...prev.notificacoes, push: checked },
                                 }))
                             }
                         />
                     </div>
                 </div>
            ),
        },
        // 3. SEGURANÇA (Comum a todos, exceto Motorista)
        {
            titulo: "Segurança",
            descricao: "Configurações de segurança da conta",
            icone: Shield,
            acesso: true, // Sempre visível para Admin/Vendedor
            conteudo: (
                 <div className="space-y-4">
                     <div>
                         <Label>Alterar Senha</Label>
                         <div className="grid grid-cols-2 gap-4 mt-2">
                             <Input type="password" placeholder="Senha atual" />
                             <Input type="password" placeholder="Nova senha" />
                         </div>
                     </div>
                     <div className="flex items-center justify-between">
                         <div>
                             <Label>Autenticação de Dois Fatores</Label>
                             <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança</p>
                         </div>
                         <Badge variant="outline">Em breve</Badge>
                     </div>
                 </div>
            ),
        },
        // 4. CONFIGURAÇÕES MESTRAS (APENAS ADMINISTRADOR)
        {
            titulo: "Valores Mestres e Repasses",
            descricao: "Defina a taxa de frete para motoristas e o repasse obrigatório/m³ do vendedor.",
            icone: DollarSign,
            acesso: isAdmin,
            conteudo: masterConfig ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <FreteConfigForm config={masterConfig} onSave={updateMasterConfig} />
                    <VendedorRepasseConfigForm config={masterConfig} onSave={updateMasterConfig} />
                </div>
            ) : <p className="text-red-500">Configurações não encontradas. Entre em contato com o suporte.</p>,
        },
        // 5. GESTÃO DE AGENDA (APENAS ADMINISTRADOR)
        {
            titulo: "Gestão de Agenda e Bloqueios",
            descricao: "Bloqueie dias e horários no sistema para evitar novos agendamentos.",
            icone: Calendar,
            acesso: isAdmin,
            conteudo: (
                <div className="space-y-4">
                    {/* Menu de Filtros e Visualização */}
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <Button
                            variant={view === 'day' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setView('day')}
                        >Dia</Button>
                        <Button
                            variant={view === 'week' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setView('week')}
                        >Semana</Button>
                        <Button
                            variant={view === 'month' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setView('month')}
                        >Mês</Button>
                    </div>

                    <Separator />

                    {/* Simulação de Calendário */}
                    <div className="grid grid-cols-7 gap-1 text-center font-bold text-sm">
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                            <div key={day} className="text-muted-foreground">{day}</div>
                        ))}
                        {Array.from({ length: 30 }, (_, i) => {
                            const day = i + 1;
                            const date = `2025-09-${day.toString().padStart(2, '0')}`;
                            const hasAppointments = MOCKED_APPOINTMENTS.some(app => app.date === date);
                            return (
                                <Button
                                    key={day}
                                    variant={date === selectedDate ? 'default' : 'ghost'}
                                    className={`w-full p-0 h-10 ${hasAppointments ? 'bg-primary/20 text-primary' : ''}`}
                                    onClick={() => setSelectedDate(date)}
                                >
                                    {day}
                                </Button>
                            )
                        })}
                    </div>

                    <Separator />

                    {/* Bloquear Período */}
                    <div>
                        <h4 className="font-semibold mb-2">Bloquear Agendamentos</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                type="date"
                                value={blockedDate}
                                onChange={(e) => setBlockedDate(e.target.value)}
                            />
                            <Input
                                type="time"
                                value={blockedTime}
                                onChange={(e) => setBlockedTime(e.target.value)}
                                disabled={!blockedDate}
                            />
                        </div>
                        <div className="flex gap-2 mt-4">
                            <Button onClick={() => handleBlockSchedule("dia inteiro", blockedDate)} disabled={!blockedDate} variant="destructive">Bloquear Dia</Button>
                            <Button onClick={() => handleBlockSchedule("semana", blockedDate)} disabled={!blockedDate} variant="destructive">Bloquear Semana</Button>
                            <Button onClick={() => handleBlockSchedule("mês", blockedDate)} disabled={!blockedDate} variant="destructive">Bloquear Mês</Button>
                        </div>
                        <Button 
                            className="w-full mt-4"
                            onClick={() => handleBlockSchedule("horário específico", blockedDate, blockedTime)}
                            disabled={!blockedDate || !blockedTime}
                            variant="destructive"
                        >
                            Bloquear Horário Específico
                        </Button>
                    </div>
                </div>
            )
        },
        // 6. GESTÃO DE USUÁRIOS (APENAS ADMINISTRADOR)
        {
            titulo: "Gestão de Usuários",
            descricao: "Aprove cadastros, convide e gerencie todos os acessos.",
            icone: Users,
            acesso: isAdmin,
            conteudo: (
                <div className="space-y-4">
                    <Link href="/usuarios" passHref>
                        <Button variant="outline" className="w-full">
                            Ir para Tabela de Usuários (Relatórios)
                        </Button>
                    </Link>
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Convidar Novo Usuário</Button>
                </div>
            )
        },
        // 7. EMPRESA (APENAS ADMINISTRADOR)
        {
            titulo: "Empresa",
            descricao: "Informações cadastrais e logo da sua empresa",
            icone: Building2,
            acesso: isAdmin,
            conteudo: (
                 <div className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                         <div>
                             <Label htmlFor="empresa">Nome da Empresa</Label>
                             <Input 
                                 id="empresa" 
                                 value={companyName}
                                 onChange={(e) => setCompanyName(e.target.value)}
                             />
                         </div>
                         <div>
                             <Label htmlFor="logo">Logo da Empresa</Label>
                             <Input 
                                 id="logo" 
                                 type="file"
                                 onChange={(e) => {
                                     if (e.target.files && e.target.files[0]) {
                                         setCompanyLogo(URL.createObjectURL(e.target.files[0]));
                                     }
                                 }}
                             />
                         </div>
                     </div>
                     <div>
                         <Label htmlFor="cnpj">CNPJ</Label>
                         <Input id="cnpj" defaultValue={empresa?.cnpj || "12.345.678/0001-90"} />
                     </div>
                     <div>
                         <Label htmlFor="endereco">Endereço</Label>
                         <Input id="endereco" defaultValue={empresa?.address || "Rua das Empresas, 123"} />
                     </div>
                 </div>
            ),
        },
    ];

    return (
        <AppLayout>
            <div className="p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
                            <p className="text-muted-foreground">
                                {isAdmin ? "Acesso total aos valores mestres e gestão do sistema." : "Gerencie suas preferências pessoais e de notificação."}
                            </p>
                        </div>
                        <Button onClick={() => console.log("Salvar GERAL")}>
                            <Save className="h-4 w-4 mr-2" />
                            Salvar Perfil e Notificações
                        </Button>
                    </div>

                    <div className="space-y-6">
                        {secoes.filter(s => s.acesso).map((secao, index) => {
                            const IconeComponent = secao.icone
                            return (
                                <Card key={index}>
                                    <CardHeader>
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 rounded-lg bg-primary/10">
                                                <IconeComponent className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <CardTitle>{secao.titulo}</CardTitle>
                                                <CardDescription>{secao.descricao}</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>{secao.conteudo}</CardContent>
                                </Card>
                            )
                        })}
                        
                        {/* Seção de Vendedor: Repasse Apenas Visualização */}
                        {isVendedor && masterConfig && (
                             <Card>
                                 <CardHeader className="flex flex-row items-center justify-between">
                                     <CardTitle className="text-red-600">Regras de Repasse (Mestre)</CardTitle>
                                     <DollarSign className="h-6 w-6 text-red-500" />
                                 </CardHeader>
                                 <CardContent>
                                     <div className="text-xl font-bold">
                                         Repasse Obrigatório por m³: <span className="text-red-600">{formatCurrency(masterConfig.valorM3RepasseVendedor)}</span>
                                     </div>
                                     <CardDescription className="mt-2 font-semibold">
                                         Este valor é fixo e definido pelo Administrador. Ele é usado para calcular seu Lucro Pessoal.
                                     </CardDescription>
                                 </CardContent>
                             </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}