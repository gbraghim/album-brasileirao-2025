import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const FIGURINHAS_POR_PACOTE = 4;

export async function POST(request: Request) {
  try {
    console.log('Iniciando abertura de pacote...');
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      console.log('Usuário não autenticado');
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      );
    }

    console.log('Buscando usuário...');
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      console.log('Usuário não encontrado');
      return NextResponse.json(
        { message: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const { pacoteId } = await request.json();

    if (!pacoteId) {
      console.log('ID do pacote não fornecido');
      return NextResponse.json(
        { message: 'ID do pacote é obrigatório' },
        { status: 400 }
      );
    }

    return await prisma.$transaction(async (tx) => {
      console.log('Verificando pacote...');
      // Verificar se o pacote pertence ao usuário
      const pacote = await tx.pacote.findFirst({
        where: {
          id: pacoteId,
          userId: user.id,
          aberto: false
        }
      });

      if (!pacote) {
        console.log('Pacote não encontrado ou já aberto');
        throw new Error('Pacote não encontrado ou já aberto');
      }

      console.log('Buscando jogadores...');
      // Buscar todos os jogadores agrupados por raridade
      const jogadores = await tx.jogador.findMany({
        include: {
          time: true
        }
      });

      if (jogadores.length === 0) {
        console.log('Nenhum jogador encontrado');
        throw new Error('Nenhum jogador encontrado');
      }

      // Agrupar jogadores por raridade
      const jogadoresPorRaridade = {
        'Lendário': jogadores.filter(j => j.raridade === 'Lendário'),
        'Ouro': jogadores.filter(j => j.raridade === 'Ouro'),
        'Prata': jogadores.filter(j => j.raridade === 'Prata')
      };

      console.log('Quantidade de jogadores por raridade:');
      console.log('- Lendário:', jogadoresPorRaridade['Lendário'].length);
      console.log('- Ouro:', jogadoresPorRaridade['Ouro'].length);
      console.log('- Prata:', jogadoresPorRaridade['Prata'].length);

      console.log('Selecionando jogadores aleatórios...');
      const figurinhasCriadas = [];
      const userFigurinhasParaAtualizar = [];
      
      for (let i = 0; i < FIGURINHAS_POR_PACOTE; i++) {
        console.log(`\nSorteando figurinha ${i + 1} de ${FIGURINHAS_POR_PACOTE}`);
        
        // Sortear a raridade do jogador
        const random = Math.random();
        console.log('Número aleatório para sorteio de raridade:', random);
        
        let raridadeSorteada: 'Lendário' | 'Ouro' | 'Prata';
        
        if (random < 0.1) { // 10% de chance para Lendário
          raridadeSorteada = 'Lendário';
        } else if (random < 0.5) { // 40% de chance para Ouro
          raridadeSorteada = 'Ouro';
        } else { // 50% de chance para Prata
          raridadeSorteada = 'Prata';
        }
        
        console.log('Raridade sorteada:', raridadeSorteada);

        // Selecionar um jogador aleatório da raridade sorteada
        const jogadoresDaRaridade = jogadoresPorRaridade[raridadeSorteada];
        console.log(`Quantidade de jogadores ${raridadeSorteada} disponíveis:`, jogadoresDaRaridade.length);
        
        if (jogadoresDaRaridade.length === 0) {
          console.log(`Nenhum jogador ${raridadeSorteada} encontrado, tentando outra raridade...`);
          // Se não houver jogadores da raridade sorteada, tenta outra raridade
          const raridadesDisponiveis = Object.entries(jogadoresPorRaridade)
            .filter(([_, jogadores]) => jogadores.length > 0)
            .map(([raridade]) => raridade as 'Lendário' | 'Ouro' | 'Prata');
          
          console.log('Raridades disponíveis:', raridadesDisponiveis);
          
          if (raridadesDisponiveis.length === 0) {
            throw new Error('Nenhum jogador disponível para sorteio');
          }
          
          raridadeSorteada = raridadesDisponiveis[Math.floor(Math.random() * raridadesDisponiveis.length)];
          console.log('Nova raridade sorteada:', raridadeSorteada);
        }

        const jogador = jogadoresPorRaridade[raridadeSorteada][
          Math.floor(Math.random() * jogadoresPorRaridade[raridadeSorteada].length)
        ];
        
        console.log('Jogador sorteado:', {
          nome: jogador.nome,
          raridade: jogador.raridade,
          time: jogador.time.nome
        });

        // Criar a figurinha com a raridade do jogador
        const figurinha = await tx.figurinha.create({
          data: {
            nome: jogador.nome,
            numero: jogador.numero,
            posicao: jogador.posicao,
            nacionalidade: jogador.nacionalidade,
            foto: jogador.foto,
            timeId: jogador.timeId,
            jogadorId: jogador.id,
            pacoteId: pacote.id,
            raridade: jogador.raridade // Usa a raridade do jogador
          }
        });

        console.log('Figurinha criada:', {
          id: figurinha.id,
          raridade: figurinha.raridade
        });

        // Criar a relação com o usuário
        const userFigurinha = await tx.userFigurinha.create({
          data: {
            userId: user.id,
            figurinhaId: figurinha.id,
            quantidade: 1
          }
        });

        userFigurinhasParaAtualizar.push({
          id: userFigurinha.id,
          nomeJogador: jogador.nome,
          nomeTime: jogador.time.nome
        });

        figurinhasCriadas.push({
          id: figurinha.id,
          jogador: {
            id: jogador.id,
            nome: jogador.nome,
            numero: jogador.numero || 0,
            posicao: jogador.posicao || '',
            nacionalidade: jogador.nacionalidade || '',
            foto: jogador.foto || '',
            time: {
              id: jogador.time.id,
              nome: jogador.time.nome,
              escudo: jogador.time.escudo || ''
            }
          },
          quantidadeAtual: 1
        });
      }

      // Atualizar os nomes das UserFigurinhas em lote
      for (const uf of userFigurinhasParaAtualizar) {
        await tx.$executeRaw`
          UPDATE "UserFigurinha"
          SET "nomeJogador" = ${uf.nomeJogador}, "nomeTime" = ${uf.nomeTime}
          WHERE id = ${uf.id}
        `;
      }

      console.log('Atualizando pacote...');
      // Atualizar o pacote como aberto
      await tx.pacote.update({
        where: { id: pacoteId },
        data: { aberto: true }
      });

      console.log('Pacote aberto com sucesso');
      return NextResponse.json({
        message: 'Pacote aberto com sucesso',
        figurinhas: figurinhasCriadas
      });
    });
  } catch (error) {
    console.error('Erro ao abrir pacote:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Erro do Prisma:', error.code, error.message);
      return NextResponse.json(
        { message: 'Erro ao abrir pacote', error: error.message },
        { status: 500 }
      );
    }
    if (error instanceof Error) {
      if (error.message === 'Pacote não encontrado ou já aberto') {
        return NextResponse.json(
          { message: error.message },
          { status: 404 }
        );
      }
      if (error.message === 'Nenhum jogador encontrado') {
        return NextResponse.json(
          { message: error.message },
          { status: 404 }
        );
      }
    }
    return NextResponse.json(
      { message: 'Erro ao abrir pacote', error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 