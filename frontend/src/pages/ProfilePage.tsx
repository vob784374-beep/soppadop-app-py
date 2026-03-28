import { useState, FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/services'
import { Button, Input, Card, Alert, Badge } from '@/components/ui'
import { useToast } from '@/components/ui'

export default function ProfilePage() {
  const { user } = useAuth()
  const { t } = useTranslation()

  return (
    <div>
      <h1>{t('profile.title')}</h1>
      <Card title={t('profile.accountInfo')}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div><strong>{t('profile.username')}:</strong> {user?.username}</div>
          <div><strong>{t('profile.email')}:</strong> {user?.email}</div>
          <div><strong>{t('profile.role')}:</strong> <Badge color="blue">{user?.role?.name}</Badge></div>
          <div><strong>{t('profile.status')}:</strong> <Badge color={user?.is_active ? 'green' : 'red'}>{user?.is_active ? t('common.active') : t('common.inactive')}</Badge></div>
        </div>
      </Card>
      <UpdateUsername />
      <UpdateEmail />
    </div>
  )
}

function UpdateUsername() {
  const { t } = useTranslation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const handleRequest = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authService.updateUsernameRequest(username, password)
      if (res.verification_code) setCode(res.verification_code)
      setStep(2)
      toast.show(t('profile.codeSent'), 'info')
    } catch (err: any) { setError(err.response?.data?.error || 'Failed') }
    finally { setLoading(false) }
  }

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.updateUsernameVerify(code)
      toast.show(t('profile.usernameUpdated'), 'success')
      setStep(1); setUsername(''); setPassword(''); setCode('')
    } catch (err: any) { setError(err.response?.data?.error || 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <Card title={t('profile.changeUsername')}>
      {error && <Alert type="error" message={error} />}
      {step === 1 ? (
        <form onSubmit={handleRequest}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}><Input label={t('profile.newUsername')} value={username} onChange={e => setUsername(e.target.value)} required minLength={3} /></div>
            <div style={{ flex: 1 }}><Input label={t('profile.currentPassword')} type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
            <Button type="submit" loading={loading}>{t('common.request')}</Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerify}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}><Input label={t('profile.verificationCode')} value={code} onChange={e => setCode(e.target.value)} required placeholder={t('profile.codePlaceholder')} /></div>
            <Button type="submit" loading={loading} variant="success">{t('common.verify')}</Button>
          </div>
        </form>
      )}
    </Card>
  )
}

function UpdateEmail() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const handleRequest = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authService.updateEmailRequest(email, password)
      if (res.verification_code) setCode(res.verification_code)
      setStep(2)
      toast.show(t('profile.codeSent'), 'info')
    } catch (err: any) { setError(err.response?.data?.error || 'Failed') }
    finally { setLoading(false) }
  }

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.updateEmailVerify(code)
      toast.show(t('profile.emailUpdated'), 'success')
      setStep(1); setEmail(''); setPassword(''); setCode('')
    } catch (err: any) { setError(err.response?.data?.error || 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <Card title={t('profile.changeEmail')}>
      {error && <Alert type="error" message={error} />}
      {step === 1 ? (
        <form onSubmit={handleRequest}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}><Input label={t('profile.newEmail')} type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
            <div style={{ flex: 1 }}><Input label={t('profile.currentPassword')} type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
            <Button type="submit" loading={loading}>{t('common.request')}</Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerify}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}><Input label={t('profile.verificationCode')} value={code} onChange={e => setCode(e.target.value)} required placeholder={t('profile.codePlaceholder')} /></div>
            <Button type="submit" loading={loading} variant="success">{t('common.verify')}</Button>
          </div>
        </form>
      )}
    </Card>
  )
}
