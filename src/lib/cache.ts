import { getTimes, getTime, getElenco, getTabela } from './api-futebol'

// Cache em memória
const memoryCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 3600 * 1000 // 1 hora em milissegundos

export async function getCachedData<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
  try {
    const cached = memoryCache.get(key)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`Cache hit para ${key}`)
      return cached.data as T
    }

    console.log(`Cache miss para ${key}, buscando da API`)
    const data = await fetchFn()
    memoryCache.set(key, { data, timestamp: Date.now() })
    return data
  } catch (error) {
    console.error(`Erro ao buscar dados para ${key}:`, error)
    throw error
  }
}

// Funções específicas para cada tipo de dado
export async function getTimesComCache() {
  return getCachedData('times_brasileirao', getTimes)
}

export async function getTimeComCache(timeId: number) {
  return getCachedData(`time_${timeId}`, () => getTime(timeId))
}

export async function getElencoComCache(timeId: number) {
  return getCachedData(`elenco_${timeId}`, () => getElenco(timeId))
}

export async function getTabelaComCache() {
  return getCachedData('tabela_brasileirao', getTabela)
} 