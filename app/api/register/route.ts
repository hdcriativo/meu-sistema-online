import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { name, email, phone, role, password, companyName } = await request.json();

  if (!email || !password || !companyName) {
    return NextResponse.json({ message: 'Dados de cadastro incompletos.' }, { status: 400 });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingCompany = await prisma.empresa.findUnique({
      where: { nomeEmpresa: companyName },
    });

    if (existingCompany) {
      // A empresa existe, cadastrar como funcionário pendente
      await prisma.usuario.create({
        data: {
          name,
          email,
          phone,
          senha: hashedPassword,
          funcao: role,
          statusConta: 'pendente',
          empresaId: existingCompany.id,
        },
      });
      return NextResponse.json({ status: 'pendente' });
    } else {
      // A empresa não existe, cadastrar como administrador ativo
      const newCompany = await prisma.empresa.create({
        data: {
          nomeEmpresa: companyName,
          usuarios: {
            create: {
              name,
              email,
              phone,
              senha: hashedPassword,
              funcao: 'admin',
              statusConta: 'ativo',
            },
          },
        },
      });
      return NextResponse.json({ status: 'ativo' });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json(
      { message: 'Erro ao registrar usuário. Tente novamente.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}