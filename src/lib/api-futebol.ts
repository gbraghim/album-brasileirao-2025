const API_FUTEBOL_KEY = 'live_2a1019a127f097db6f4786016f9968'
const API_BASE_URL = 'https://api.api-futebol.com.br/v1'

const headers = {
  'Authorization': `Bearer ${API_FUTEBOL_KEY}`
}

// Tipos dos dados retornados pela API
export interface Time {
  time_id: number
  nome_popular: string
  sigla: string
  escudo: string
  fundacao: string
  uf: string
}

export interface Jogador {
  atleta_id: number
  nome_popular: string
  posicao: string
  idade: number
  nacionalidade: string
  altura: number
  peso: number
}

export interface TabelaPosicao {
  posicao: number
  time: Time
  pontos: number
  jogos: number
  vitorias: number
  empates: number
  derrotas: number
  gols_pro: number
  gols_contra: number
  saldo_gols: number
}

// Função para tratamento de erros
async function fetchWithErrorHandling(url: string) {
  try {
    console.log(`Fazendo requisição para: ${url}`)
    const response = await fetch(url, { 
      headers,
      next: { revalidate: 3600 } // Revalida a cada hora
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Erro na API: ${response.status}`, errorText)
      
      if (response.status === 429) {
        throw new Error('Limite de requisições excedido')
      }
      throw new Error(`Erro na API: ${response.status} - ${errorText}`)
    }
    
    const data = await response.json()
    console.log(`Resposta recebida de: ${url}`)
    return data
  } catch (error) {
    console.error('Erro ao acessar API:', error)
    throw error
  }
}

// Funções para acessar os endpoints
export async function getTimes(): Promise<Time[]> {
  try {
    // Primeiro, vamos buscar o ID do campeonato atual
    const campeonatos = await fetchWithErrorHandling(`${API_BASE_URL}/campeonatos`)
    console.log('Campeonatos disponíveis:', campeonatos)
    
    // Tenta encontrar o campeonato brasileiro com diferentes variações do nome
    const brasileirao = campeonatos.find((c: any) => 
      c.nome.toLowerCase().includes('brasileiro') || 
      c.nome.toLowerCase().includes('série a')
    )
    
    if (!brasileirao) {
      console.error('Campeonatos disponíveis:', campeonatos.map((c: any) => c.nome))
      throw new Error('Campeonato Brasileiro não encontrado')
    }

    console.log('Campeonato encontrado:', brasileirao)
    
    // Busca a tabela do campeonato para obter os times
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/campeonatos/${brasileirao.campeonato_id}/tabela`)
    
    // Extrai os times da tabela
    const times = response.map((item: any) => item.time)
    return times
  } catch (error) {
    console.error('Erro ao buscar times:', error)
    throw error
  }
}

export async function getTime(timeId: number): Promise<Time> {
  const response = await fetchWithErrorHandling(`${API_BASE_URL}/times/${timeId}`)
  return response
}

export async function getElenco(timeId: number): Promise<Jogador[]> {
  const response = await fetchWithErrorHandling(`${API_BASE_URL}/times/${timeId}/elenco`)
  return response
}

export async function getTabela(): Promise<TabelaPosicao[]> {
  // Primeiro, vamos buscar o ID do campeonato atual
  const campeonatos = await fetchWithErrorHandling(`${API_BASE_URL}/campeonatos`)
  const brasileirao = campeonatos.find((c: any) => c.nome === 'Campeonato Brasileiro Série A')
  
  if (!brasileirao) {
    throw new Error('Campeonato Brasileiro não encontrado')
  }

  const response = await fetchWithErrorHandling(`${API_BASE_URL}/campeonatos/${brasileirao.campeonato_id}/tabela`)
  return response
} 