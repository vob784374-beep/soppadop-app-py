import { useRoutes } from 'react-router-dom'
import { publicRoutes, protectedRoutes, fallbackRoute } from '@/routes'

export default function App() {
  const element = useRoutes([...publicRoutes, ...protectedRoutes, fallbackRoute])
  return element
}
