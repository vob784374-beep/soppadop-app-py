import { useState, useEffect, useCallback } from 'react'
import { AxiosError } from 'axios'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T>(fetcher: () => Promise<T>, deps: any[] = []) {
  const [state, setState] = useState<UseApiState<T>>({ data: null, loading: true, error: null })

  const refetch = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const data = await fetcher()
      setState({ data, loading: false, error: null })
    } catch (err) {
      const e = err as AxiosError<{ error: string }>
      setState({ data: null, loading: false, error: e.response?.data?.error || 'Request failed' })
    }
  }, deps)

  useEffect(() => { refetch() }, [refetch])

  return { ...state, refetch }
}

export function useMutation<T, P = void>(mutator: (params: P) => Promise<T>) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(async (params: P): Promise<T | null> => {
    setLoading(true)
    setError(null)
    try {
      const result = await mutator(params)
      setLoading(false)
      return result
    } catch (err) {
      const e = err as AxiosError<{ error: string }>
      setError(e.response?.data?.error || 'Request failed')
      setLoading(false)
      return null
    }
  }, [mutator])

  return { mutate, loading, error, setError }
}
