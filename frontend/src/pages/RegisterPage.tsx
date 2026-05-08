import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authService } from '@/services'
import { Button, Input, Card, Alert } from '@/components/ui'
import { useToast } from '@/components/ui'

export default function RegisterPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'admin' | 'manager' | 'client'>('client')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.register({ email, username, password, role })
      toast.success(t('register.registerSuccess'))
      navigate('/admin/users')
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Registration failed'
      setError(msg)
      toast.error(msg)
    } finally { setLoading(false) }
  }

  return (
    <div className="page-enter" style={{ maxWidth: 450 }}>
      <h1>{t('register.title')}</h1>
      <Card>
        {error && <Alert type="error" message={error} />}
        <form onSubmit={handleSubmit}>
          <Input label={t('register.email')} type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input label={t('register.username')} value={username} onChange={e => setUsername(e.target.value)} required minLength={3} />
          <Input label={t('register.password')} type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' }}>{t('register.role')}</label>
            <select value={role} onChange={e => setRole(e.target.value as any)} style={{
              width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px',
            }}>
              <option value="client">Client</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <Button type="submit" loading={loading} style={{ width: '100%' }}>{t('register.register')}</Button>
        </form>
      </Card>
    </div>
  )
}
