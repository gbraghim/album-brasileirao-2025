import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verificarPacotesIniciais, verificarPacotesDiarios } from '@/lib/pacotes';
import { Prisma } from '@prisma/client';

const FIGURINHAS_POR_PACOTE = 4;

// Map para rastrear usuários que já estão sendo processados
const usuariosEmProcessamento = new Map<string, Promise<any>>();

export async function GET() {
  try {
    console.log('[GET /api/pacotes] Iniciando verificação de pacotes...');
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      console.log('[GET /api/pacotes] Usuário não autenticado');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar o usuário pelo email
    const usuario = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true,
        email: true,
        primeiroAcesso: true
      }
    });

    if (!usuario) {
      console.log('[GET /api/pacotes] Usuário não encontrado');
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    console.log(`[GET /api/pacotes] Verificando pacotes para usuário ${usuario.id} (${usuario.email})`);
    console.log(`[GET /api/pacotes] Primeiro acesso: ${usuario.primeiroAcesso}`);

    // Verificar se o usuário já está sendo processado
    if (usuariosEmProcessamento.has(usuario.id)) {
      console.log(`[GET /api/pacotes] Usuário ${usuario.id} já está sendo processado, aguardando...`);
      await usuariosEmProcessamento.get(usuario.id);
    }

    // Criar uma nova promessa para o processamento
    const processamentoPromise = (async () => {
      try {
        // Verificar e criar pacotes iniciais se necessário
        try {
          console.log('[GET /api/pacotes] Verificando pacotes iniciais...');
          const pacotesIniciais = await verificarPacotesIniciais(usuario.id);
          console.log('[GET /api/pacotes] Verificação de pacotes iniciais concluída', pacotesIniciais);
        } catch (err) {
          console.error('[GET /api/pacotes] Erro ao verificar/criar pacotes iniciais:', err);
          throw err; // Propagar o erro para ser tratado
        }

        // Verificar e criar pacotes diários se necessário
        try {
          console.log('[GET /api/pacotes] Verificando pacotes diários...');
          const pacotesDiarios = await verificarPacotesDiarios(usuario.id);
          console.log('[GET /api/pacotes] Verificação de pacotes diários concluída', pacotesDiarios);
        } catch (err) {
          console.error('[GET /api/pacotes] Erro ao verificar/criar pacotes diários:', err);
          throw err; // Propagar o erro para ser tratado
        }

        // Buscar os pacotes do usuário
        console.log('[GET /api/pacotes] Buscando pacotes do usuário...');
        const pacotes = await prisma.pacote.findMany({
          where: {
            userId: usuario.id,
            aberto: false
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        console.log(`[GET /api/pacotes] Encontrados ${pacotes.length} pacotes para o usuário`);
        return pacotes;
      } catch (error) {
        console.error('[GET /api/pacotes] Erro durante o processamento:', error);
        throw error;
      } finally {
        // Remover o usuário do Map após o processamento
        usuariosEmProcessamento.delete(usuario.id);
      }
    })();

    // Armazenar a promessa no Map
    usuariosEmProcessamento.set(usuario.id, processamentoPromise);

    // Aguardar o resultado
    const pacotes = await processamentoPromise;
    return NextResponse.json(pacotes);
  } catch (error) {
    console.error('[GET /api/pacotes] Erro ao buscar pacotes:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar pacotes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log('=== INÍCIO DO PROCESSO DE ABRIR PACOTE ===');
    console.log('Iniciando abertura de pacote...');
    
    const session = await getServerSession(authOptions);
    console.log('Sessão obtida:', session ? 'Sim' : 'Não');

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

    console.log('Usuário encontrado:', { id: user.id, email: user.email });

    const body = await request.json();
    console.log('Corpo da requisição:', body);

    const { pacoteId } = body;

    if (!pacoteId) {
      console.log('ID do pacote não fornecido');
      return NextResponse.json(
        { message: 'ID do pacote é obrigatório' },
        { status: 400 }
      );
    }

    console.log('ID do pacote recebido:', pacoteId);

    return await prisma.$transaction(async (tx) => {
      console.log('Iniciando transação...');
      
      console.log('Verificando pacote...');
      // Verificar se o pacote pertence ao usuário
      const pacote = await tx.pacote.findFirst({
        where: {
          id: pacoteId,
          userId: user.id,
          aberto: false
        }
      });

      console.log('Resultado da busca do pacote:', pacote ? {
        id: pacote.id,
        userId: pacote.userId,
        aberto: pacote.aberto,
        tipo: pacote.tipo
      } : 'Pacote não encontrado');

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

      console.log(`Total de jogadores encontrados: ${jogadores.length}`);

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

      // Selecionar jogadores aleatórios baseado na raridade
      for (let i = 0; i < FIGURINHAS_POR_PACOTE; i++) {
        const random = Math.random();
        let jogador;

        if (random < 0.05 && jogadoresPorRaridade['Lendário'].length > 0) {
          // 5% de chance de jogador lendário
          const index = Math.floor(Math.random() * jogadoresPorRaridade['Lendário'].length);
          jogador = jogadoresPorRaridade['Lendário'][index];
          jogadoresPorRaridade['Lendário'].splice(index, 1);
        } else if (random < 0.25 && jogadoresPorRaridade['Ouro'].length > 0) {
          // 20% de chance de jogador ouro
          const index = Math.floor(Math.random() * jogadoresPorRaridade['Ouro'].length);
          jogador = jogadoresPorRaridade['Ouro'][index];
          jogadoresPorRaridade['Ouro'].splice(index, 1);
        } else {
          // 75% de chance de jogador prata
          const index = Math.floor(Math.random() * jogadoresPorRaridade['Prata'].length);
          jogador = jogadoresPorRaridade['Prata'][index];
          jogadoresPorRaridade['Prata'].splice(index, 1);
        }

        console.log(`Jogador selecionado: ${jogador.nome} (${jogador.raridade})`);

        // Criar a figurinha
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
            raridade: jogador.raridade
          }
        });

        console.log('Figurinha criada:', {
          id: figurinha.id,
          nome: figurinha.nome,
          raridade: figurinha.raridade
        });

        // Criar a relação com o usuário
        const userFigurinha = await tx.userFigurinha.create({
          data: {
            userId: user.id,
            figurinhaId: figurinha.id,
            quantidade: 1,
            nomeJogador: jogador.nome || '',
            nomeTime: jogador.time?.nome || '',
          }
        });

        console.log('UserFigurinha criada:', {
          id: userFigurinha.id,
          userId: userFigurinha.userId,
          figurinhaId: userFigurinha.figurinhaId
        });

        figurinhasCriadas.push(figurinha);
      }

      // Marcar o pacote como aberto
      await tx.pacote.update({
        where: { id: pacote.id },
        data: { aberto: true }
      });

      console.log('Pacote aberto com sucesso');
      console.log('=== FIM DO PROCESSO DE ABRIR PACOTE ===');

      return NextResponse.json({
        message: 'Pacote aberto com sucesso',
        figurinhas: figurinhasCriadas.map(figurinha => ({
          id: figurinha.id,
          jogador: {
            id: figurinha.jogadorId,
            nome: figurinha.nome,
            posicao: figurinha.posicao,
            time: {
              id: jogadores.find(j => j.id === figurinha.jogadorId)?.timeId,
              nome: jogadores.find(j => j.id === figurinha.jogadorId)?.time?.nome,
              escudo: jogadores.find(j => j.id === figurinha.jogadorId)?.time?.escudo
            }
          },
          quantidadeAtual: 1,
          raridade: figurinha.raridade
        }))
      });
    });
  } catch (error) {
    console.error('Erro ao abrir pacote:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Erro ao abrir pacote' },
      { status: 500 }
    );
  }
} 