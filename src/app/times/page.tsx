'use client'

import { useEffect, useState } from 'react'
import { getTimesComCache } from '@/lib/cache'
import { Time } from '@/lib/api-futebol'
import Image from 'next/image'
import Loading from '@/components/loading'

export default function TimesPage() {
  const [times, setTimes] = useState<Time[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function carregarTimes() {
      try {
        const dados = await getTimesComCache()
        setTimes(dados)
      } catch (err) {
        console.error('Erro ao carregar times:', err)
        setError('Erro ao carregar times')
      } finally {
        setLoading(false)
      }
    }

    carregarTimes()
  }, [])

  if (loading) {
    return <Loading />
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Times do Brasileirão Série B</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {times.map((time) => (
          <div key={time.time_id} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24 mb-4">
                <Image
                  src={time.escudo}
                  alt={time.nome_popular}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <h2 className="text-lg font-semibold text-center">{time.nome_popular}</h2>
              <p className="text-sm text-gray-600">{time.sigla}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 