// lib/mock-data.ts
// Arquivo corrigido para garantir que todos os arrays mock sejam exportados corretamente.

import type { User, Obra, Orcamento, OrcamentoItem, Produto, Entrega } from './types';

// --- USUÁRIOS ---
export const mockUsuarios: User[] = [
    { id: 'u001', name: 'Admin Flow', email: 'admin@flow.com', role: 'admin' },
    { id: 'u002', name: 'João Vendedor', email: 'joao@flow.com', role: 'vendedor' },
    { id: 'u003', name: 'Maria Motorista', email: 'maria@flow.com', role: 'motorista' },
];

// --- ADICIONADOS PARA RESOLVER TODOS OS WARNINGS DE IMPORTAÇÃO ---
export const mockClientes = [
  // Adicione dados de clientes aqui, se necessário.
];

export const mockCaminhoes = [
  // Adicione dados de caminhões aqui, se necessário.
];


// --- PRODUTOS ---
export const mockProdutos: Produto[] = [
    { id: 'p001', name: 'Concreto Usinado C25', unidade: 'm3', price: 350.00 },
    { id: 'p002', name: 'Concreto Bombeado C35', unidade: 'm3', price: 420.00 },
    { id: 'p003', name: 'Aditivo Retardador', unidade: 'servico', price: 50.00 },
    { id: 'p004', name: 'Bloco Estrutural (Un)', unidade: 'un', price: 2.50 },
];

// --- OBRAS ---
export const mockObras: Obra[] = [
    { id: 'o001', name: 'Edifício Residencial Harmony', cliente: 'Construtora Alpha', endereco: 'Rua A, 123, São Paulo', vendedorId: 'u002' },
    { id: 'o002', name: 'Reforma Sede Corporativa', cliente: 'Construtora Alpha', endereco: 'Av. Paulista, 2000, São Paulo', vendedorId: 'u002' },
    { id: 'o003', name: 'Ponte Rio-Sul', cliente: 'Engenharia Beta', endereco: 'Rodovia Federal, KM 50', vendedorId: 'u001' },
];

// --- ORÇAMENTOS ---
const item1: OrcamentoItem = { produtoId: 'p001', produtoNome: 'Concreto Usinado C25', quantidade: 15.0, precoUnitario: 350.00, subtotal: 15.0 * 350.00 };
const item2: OrcamentoItem = { produtoId: 'p002', produtoNome: 'Concreto Bombeado C35', quantidade: 50.0, precoUnitario: 420.00, subtotal: 50.0 * 420.00 };
const item3: OrcamentoItem = { produtoId: 'p003', produtoNome: 'Aditivo Retardador', quantidade: 1.0, precoUnitario: 50.00, subtotal: 50.00 };

export const mockOrcamentos: Orcamento[] = [
    {
        id: 'orc001', obraId: 'o001', vendedorId: 'u002',
        dataCriacao: '2024-07-20T10:00:00Z',
        itens: [item1],
        valorTotal: item1.subtotal,
        status: 'aprovado',
    },
    {
        id: 'orc002', obraId: 'o002', vendedorId: 'u002',
        dataCriacao: '2024-08-01T14:30:00Z',
        itens: [item2, item3],
        valorTotal: item2.subtotal + item3.subtotal,
        status: 'pendente',
        observacao: 'Preço válido por 30 dias.',
    },
    {
        id: 'orc003', obraId: 'o003', vendedorId: 'u001',
        dataCriacao: '2024-06-10T09:00:00Z',
        itens: [{ produtoId: 'p001', produtoNome: 'Concreto Usinado C25', quantidade: 100.0, precoUnitario: 350.00, subtotal: 35000.00 }],
        valorTotal: 35000.00,
        status: 'recusado',
    },
];

// --- ENTREGAS ---
export const mockEntregas: Entrega[] = [
    {
        id: 'ent001', orcamentoId: 'orc001', motoristaId: 'u003',
        status: 'agendada', local: mockObras[0].endereco,
        volumeAgendado: 15.0, volumeRealizado: null, // Ainda não finalizada
        dataEntrega: '2024-09-30T10:00:00Z',
    },
    {
        id: 'ent002', orcamentoId: 'orc001', motoristaId: 'u003',
        status: 'finalizada', local: mockObras[0].endereco,
        volumeAgendado: 15.0, volumeRealizado: 14.8, 
        dataEntrega: '2024-09-20T14:00:00Z',
    },
];
