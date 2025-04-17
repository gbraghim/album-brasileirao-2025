import { NextResponse } from 'next/server';

const TIMES = {
  'america-mg': { nome: 'América-MG', estado: 'Minas Gerais', fundacao: '1912' },
  'athletico-pr': { nome: 'Athletico-PR', estado: 'Paraná', fundacao: '1924' },
  'atletico-mg': { nome: 'Atlético-MG', estado: 'Minas Gerais', fundacao: '1908' },
  'bahia': { nome: 'Bahia', estado: 'Bahia', fundacao: '1931' },
  'botafogo': { nome: 'Botafogo', estado: 'Rio de Janeiro', fundacao: '1904' },
  'corinthians': { nome: 'Corinthians', estado: 'São Paulo', fundacao: '1910' },
  'cruzeiro': { nome: 'Cruzeiro', estado: 'Minas Gerais', fundacao: '1921' },
  'cuiaba': { nome: 'Cuiabá', estado: 'Mato Grosso', fundacao: '2001' },
  'flamengo': { nome: 'Flamengo', estado: 'Rio de Janeiro', fundacao: '1895' },
  'fluminense': { nome: 'Fluminense', estado: 'Rio de Janeiro', fundacao: '1902' },
  'fortaleza': { nome: 'Fortaleza', estado: 'Ceará', fundacao: '1918' },
  'gremio': { nome: 'Grêmio', estado: 'Rio Grande do Sul', fundacao: '1903' },
  'internacional': { nome: 'Internacional', estado: 'Rio Grande do Sul', fundacao: '1909' },
  'palmeiras': { nome: 'Palmeiras', estado: 'São Paulo', fundacao: '1914' },
  'bragantino': { nome: 'Red Bull Bragantino', estado: 'São Paulo', fundacao: '1928' },
  'santos': { nome: 'Santos', estado: 'São Paulo', fundacao: '1912' },
  'sao-paulo': { nome: 'São Paulo', estado: 'São Paulo', fundacao: '1930' },
  'vasco': { nome: 'Vasco', estado: 'Rio de Janeiro', fundacao: '1898' },
  'vitoria': { nome: 'Vitória', estado: 'Bahia', fundacao: '1899' },
  'juventude': { nome: 'Juventude', estado: 'Rio Grande do Sul', fundacao: '1913' }
};

export async function GET() {
  return NextResponse.json(TIMES);
}

export async function POST(request: Request) {
  const data = await request.json();
  const { timeId } = data;

  if (!timeId || !TIMES[timeId as keyof typeof TIMES]) {
    return NextResponse.json(
      { error: 'Time não encontrado' },
      { status: 404 }
    );
  }

  return NextResponse.json(TIMES[timeId as keyof typeof TIMES]);
} 