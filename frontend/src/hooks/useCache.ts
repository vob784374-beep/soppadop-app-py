import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface CacheConfig {
  staleTime?: number
  cacheTime?: number
  refetchOnWindowFocus?: boolean
}

const defaultConfig: CacheConfig = {
  staleTime: 5 * 60 * 1000,
  cacheTime: 10 * 60 * 1000,
  refetchOnWindowFocus: false,
}

export function useCache<T>(
  key: string[],
  fetcher: () => Promise<T>,
  config: CacheConfig = {}
) {
  const mergedConfig = { ...defaultConfig, ...config }
  return useQuery<T>({
    queryKey: key,
    queryFn: fetcher,
    staleTime: mergedConfig.staleTime,
    gcTime: mergedConfig.cacheTime,
    refetchOnWindowFocus: mergedConfig.refetchOnWindowFocus,
  })
}

export function useCacheMutation<T, P = void>(
  mutationFn: (params: P) => Promise<T>,
  invalidateKeys: string[][]
) {
  const queryClient = useQueryClient()
  return useMutation<T, Error, P>({
    mutationFn,
    onSuccess: () => {
      invalidateKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

export const cacheKeys = {
  resources: (params?: any) => ['resources', params],
  resourceStats: () => ['resources', 'stats'],
  resourceAccount: () => ['resources', 'account'],
  resourceCollections: () => ['resources', 'collections'],
  resourceFolders: (collection?: string) => ['resources', 'folders', collection],
  cloudinaryFolders: (path: string) => ['resources', 'cloudinary-folders', path],
  users: (params?: any) => ['users', params],
  roles: () => ['roles'],
  health: () => ['health'],
}
