import { useState, useEffect, useCallback, useRef } from 'react'
import { AxiosError } from 'axios'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T>(fetcher: () => Promise<T>, deps: any[] = []) {
  const [state, setState] = useState<UseApiState<T>>({ data: null, loading: true, error: null })
  const fetcherRef = useRef(fetcher)
  const [refetchKey, setRefetchKey] = useState(0)

  useEffect(() => {
    fetcherRef.current = fetcher
  })

  const refetch = useCallback(() => {
    setRefetchKey(k => k + 1)
  }, [])

  useEffect(() => {
    let cancelled = false
    setState(prev => ({ ...prev, loading: true, error: null }))
    fetcherRef.current().then(data => {
      if (!cancelled) setState({ data, loading: false, error: null })
    }).catch(err => {
      if (!cancelled) {
        const e = err as AxiosError<{ error: string }>
        setState({ data: null, loading: false, error: e.response?.data?.error || 'Request failed' })
      }
    })
    return () => { cancelled = true }
  }, [refetchKey, ...deps])

  return { ...state, refetch }
}

export function useMutation<T, P = void>(mutator: (params: P) => Promise<T>, options?: { 
  onSuccess?: (data: T) => void 
  onMutate?: (variables: P) => Promise<any> | any
  onError?: (error: any, variables: P, context: any) => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(async (params: P): Promise<T | null> => {
    let context: any = undefined
    setLoading(true)
    setError(null)
    try {
      if (options?.onMutate) {
        context = await options.onMutate(params)
      }
      const result = await mutator(params)
      setLoading(false)
      options?.onSuccess?.(result)
      return result
    } catch (err) {
      const e = err as AxiosError<{ error: string }>
      const errorObj = e.response?.data?.error || 'Request failed'
      if (options?.onError) {
        options.onError(errorObj, params, context)
      } else {
        setError(errorObj)
      }
      setLoading(false)
      return null
    }
  }, [mutator, options])

  return { mutate, loading, error, setError }
}
