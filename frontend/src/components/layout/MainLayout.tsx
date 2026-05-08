import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'

export default function MainLayout() {
  const location = useLocation()

  return (
    <div className="page-enter" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div style={{ display: 'flex', marginTop: '60px', minHeight: 'calc(100vh - 60px)' }}>
        <Sidebar />
        <div style={{ flex: 1, marginLeft: '220px', display: 'flex', flexDirection: 'column' }}>
          <main key={location.pathname} className="page-enter" style={{ flex: 1, padding: '1.5rem' }}>
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  )
}
