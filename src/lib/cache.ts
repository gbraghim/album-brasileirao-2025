import { Redis } from '@upstash/redis'
import { getTimes, getTime, getElenco, getTabela } from './api-futebol'

// Inicializa o Redis apenas se as variáveis de ambiente estiverem definidas
let redis: Redis | null = null

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  } catch (error) {
    console.error('Erro ao inicializar Redis:', error)
    redis = null
  }
}

// Cache em memória para fallback
const memoryCache = new Map<string, any>()
const CACHE_DURATION = 3600 * 1000 // 1 hora em milissegundos

export async function getCachedData<T>(key: string, fetchFn: () => Promise<T>, ttl: number = 3600): Promise<T> {
  try {
    // Tenta buscar do cache em memória primeiro
    const memoryCached = memoryCache.get(key)
    if (memoryCached) {
      console.log(`Cache hit em memória para ${key}`)
      return memoryCached as T
    }

    // Se não encontrou no cache em memória, tenta buscar do Redis
    if (redis) {
      try {
        const cached = await redis.get<string>(key)
        if (cached) {
          console.log(`Cache hit para ${key}`)
          const data = JSON.parse(cached) as T
          // Salva no cache em memória para futuras requisições
          memoryCache.set(key, data)
          return data
        }
      } catch (redisError) {
        console.error('Erro ao acessar Redis:', redisError)
        // Continua para buscar da API em caso de erro no Redis
      }
    }

    // Se não encontrou em nenhum cache, busca da API
    console.log(`Cache miss para ${key}, buscando da API`)
    const data = await fetchFn()

    // Salva no cache em memória
    memoryCache.set(key, data)

    // Tenta salvar no Redis se disponível
    if (redis) {
      try {
        await redis.set(key, JSON.stringify(data), { ex: ttl })
      } catch (redisError) {
        console.error('Erro ao salvar no Redis:', redisError)
        // Continua mesmo com erro no Redis
      }
    }

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