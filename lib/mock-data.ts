// lib/mock-data.ts
// CORRIGIDO: Todas as estruturas de mock de dados referenciadas agora são exportadas.

// NOTA: Estruturas de Mock simplificadas para satisfazer as importações.
interface Empresa { id: string; name: string; cnpj: string; contactEmail: string; phone: string; address: string; isActive: boolean; }
interface Configuracao { empresaId: string; valorM3RepasseVendedor: number; alertaNivelEstoque: number; settings: any; }
interface User { id: string; name: string; email: string; role: 'admin' | 'vendedor' | 'motorista' | 'bombista' | 'ajudante'; isPendingApproval: boolean; isActive: boolean; empresaId: string; avatarUrl: string; createdAt: Date; }
interface Caminhao { id: string; plate: string; model: string; capacityM3: number; status: string; driverId: string; empresaId: string; }
interface Cliente { id: string; name: string; cnpj: string; contactName: string; phone: string; address: string; empresaId: string; }
interface FinanceiroMovimento { id: string; type: 'Receita' | 'Despesa'; description: string; amount: number; date: Date; status: string; empresaId: string; }
interface EntregaMock { vendedorId: string; volumeTotalM3: number; }
interface Obra { id: string; name: string; clienteId: string; status: 'Em Andamento' | 'Concluída' | 'Pendente'; totalM3: number; startedAt: Date; empresaId: string; }
interface Orcamento { id: string; obraId: string; clientName: string; totalValue: number; status: 'Pendente' | 'Aprovado' | 'Rejeitado'; createdAt: Date; }

// --- MOCK EMPRESAS (Exportado) ---
export const mockEmpresas: Empresa[] = [
    {
        id: 'empresa-1',
        name: 'Concreto Alpha',
        cnpj: '12.345.678/0001-90',
        contactEmail: 'contato@alpha.com',
        phone: '11987654321',
        address: 'Rua das Concretagens, 100',
        isActive: true,
    },
];

// --- MOCK CONFIGURAÇÕES (Exportado) ---
export const mockConfiguracoes: Configuracao[] = [
    {
        empresaId: 'empresa-1',
        valorM3RepasseVendedor: 5.50,
        alertaNivelEstoque: 1000,
        settings: { allowNotifications: true }
    }
];

// --- MOCK USUÁRIOS (Exportado como mockUsuarios e mockUsers) ---
export const mockUsuarios: User[] = [
    { 
        id: 'user-1', 
        name: 'Admin Master', 
        email: 'admin@alpha.com', 
        role: 'admin', 
        isPendingApproval: false, 
        isActive: true, 
        empresaId: 'empresa-1', 
        avatarUrl: '/avatars/admin.png',
        createdAt: new Date(Date.now() - 86400000 * 30),
    },
    { 
        id: 'user-2', 
        name: 'João Vendedor', 
        email: 'joao@alpha.com', 
        role: 'vendedor', 
        isPendingApproval: false, 
        isActive: true, 
        empresaId: 'empresa-1', 
        avatarUrl: '/avatars/joao.png',
        createdAt: new Date(Date.now() - 86400000 * 5),
    },
    { 
        id: 'user-4', 
        name: 'Novo Cadastro Pendente', 
        email: 'novo@pending.com', 
        role: 'vendedor', 
        isPendingApproval: true, 
        isActive: false,
        empresaId: 'empresa-1', 
        avatarUrl: '/avatars/default.png',
        createdAt: new Date(Date.now() - 86400000 * 1),
    },
];
export const mockUsers = mockUsuarios; // Alias para cobrir todas as importações

// --- MOCK CAMINHÕES (Exportado) ---
export const mockCaminhoes: Caminhao[] = [
    { 
        id: 'truck-1', 
        plate: 'ABC1234', 
        model: 'Mercedes-Benz Axor', 
        capacityM3: 10, 
        status: 'Disponível', 
        driverId: 'user-3',
        empresaId: 'empresa-1' 
    },
];

// --- MOCK CLIENTES (Exportado) ---
export const mockClientes: Cliente[] = [
    {
        id: 'client-1',
        name: 'Construtora Sol',
        cnpj: '11.222.333/0001-44',
        contactName: 'Pedro Silva',
        phone: '21999887766',
        address: 'Rua do Sol, 500',
        empresaId: 'empresa-1',
    },
];

// --- MOCK MOVIMENTOS FINANCEIROS (Exportado) ---
export const mockFinanceiroMovimentos: FinanceiroMovimento[] = [
    { 
        id: 'mov-1', 
        type: 'Receita', 
        description: 'Venda de Concreto - Cliente 1', 
        amount: 55000.00, 
        date: new Date(Date.now() - 86400000 * 20),
        status: 'Pago',
        empresaId: 'empresa-1',
    },
];

// --- MOCK ENTREGAS (Exportado) ---
export const mockEntregas: EntregaMock[] = [
    { vendedorId: 'user-2', volumeTotalM3: 500 },
];

// --- NOVAS MOCKS ADICIONADAS (mockObras e mockOrcamentos) ---

// --- MOCK OBRAS (Exportado) ---
export const mockObras: Obra[] = [
    {
        id: 'obra-1',
        name: 'Projeto Residencial Urbano',
        clienteId: 'client-1',
        status: 'Em Andamento',
        totalM3: 500,
        startedAt: new Date(Date.now() - 86400000 * 60),
        empresaId: 'empresa-1',
    },
    {
        id: 'obra-2',
        name: 'Condomínio Solar',
        clienteId: 'client-1',
        status: 'Pendente',
        totalM3: 1200,
        startedAt: new Date(Date.now() - 86400000 * 10),
        empresaId: 'empresa-1',
    },
];

// --- MOCK ORÇAMENTOS (Exportado) ---
export const mockOrcamentos: Orcamento[] = [
    {
        id: 'orc-1',
        obraId: 'obra-1',
        clientName: 'Construtora Sol',
        totalValue: 150000.00,
        status: 'Aprovado',
        createdAt: new Date(Date.now() - 86400000 * 30),
    },
    {
        id: 'orc-2',
        obraId: 'obra-2',
        clientName: 'Condomínio Teste',
        totalValue: 400000.00,
        status: 'Pendente',
        createdAt: new Date(Date.now() - 86400000 * 5),
    },
];
