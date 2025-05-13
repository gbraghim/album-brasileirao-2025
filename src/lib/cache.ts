import { getTimes, getTime, getElenco, getTabela } from './api-futebol'

// Cache em memória
const memoryCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 3600 * 1000 // 1 hora em milissegundos

// Cache de imagens em memória (base64)
const imageCache = new Map<string, { data: string; timestamp: number }>()
const IMAGE_CACHE_DURATION = 24 * 3600 * 1000 // 24 horas

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

export async function getCachedImage(url: string): Promise<string> {
  try {
    const cached = imageCache.get(url)
    if (cached && Date.now() - cached.timestamp < IMAGE_CACHE_DURATION) {
      console.log(`Cache hit para imagem: ${url}`)
      return cached.data
    }

    console.log(`Tentando buscar imagem: ${url}`)
    const response = await fetch(url)
    if (!response.ok) {
      console.error(`Erro ao buscar imagem ${url}: ${response.status} ${response.statusText}`)
      throw new Error(`Erro ao buscar imagem: ${response.status} ${response.statusText}`)
    }

    const blob = await response.blob()
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = (error) => {
        console.error(`Erro ao converter imagem para base64: ${error}`)
        reject(error)
      }
      reader.readAsDataURL(blob)
    })

    imageCache.set(url, { data: base64, timestamp: Date.now() })
    console.log(`Imagem carregada com sucesso: ${url}`)
    return base64
  } catch (error) {
    console.error(`Erro ao processar imagem ${url}:`, error)
    throw error
  }
} 