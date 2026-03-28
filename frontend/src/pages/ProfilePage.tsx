import { useState, FormEvent } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/services'
import { Button, Input, Card, Alert, Badge } from '@/components/ui'
import { useToast } from '@/components/ui'

export default function ProfilePage() {
  const { user } = useAuth()

  return (
    <div>
      <h1>Profile</h1>
      <Card title="Account Info">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div><strong>Username:</strong> {user?.username}</div>
          <div><strong>Email:</strong> {user?.email}</div>
          <div><strong>Role:</strong> <Badge color="blue">{user?.role?.name}</Badge></div>
          <div><strong>Status:</strong> <Badge color={user?.is_active ? 'green' : 'red'}>{user?.is_active ? 'Active' : 'Inactive'}</Badge></div>
        </div>
      </Card>
      <UpdateUsername />
      <UpdateEmail />
    </div>
  )
}

function UpdateUsername() {
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
      toast.show('Code sent', 'info')
    } catch (err: any) { setError(err.response?.data?.error || 'Failed') }
    finally { setLoading(false) }
  }

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.updateUsernameVerify(code)
      toast.show('Username updated', 'success')
      setStep(1); setUsername(''); setPassword(''); setCode('')
    } catch (err: any) { setError(err.response?.data?.error || 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <Card title="Change Username">
      {error && <Alert type="error" message={error} />}
      {step === 1 ? (
        <form onSubmit={handleRequest}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}><Input label="New Username" value={username} onChange={e => setUsername(e.target.value)} required minLength={3} /></div>
            <div style={{ flex: 1 }}><Input label="Current Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
            <Button type="submit" loading={loading}>Request</Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerify}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}><Input label="Verification Code" value={code} onChange={e => setCode(e.target.value)} required placeholder="Enter code" /></div>
            <Button type="submit" loading={loading} variant="success">Verify</Button>
          </div>
        </form>
      )}
    </Card>
  )
}

function UpdateEmail() {
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
      toast.show('Code sent', 'info')
    } catch (err: any) { setError(err.response?.data?.error || 'Failed') }
    finally { setLoading(false) }
  }

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.updateEmailVerify(code)
      toast.show('Email updated', 'success')
      setStep(1); setEmail(''); setPassword(''); setCode('')
    } catch (err: any) { setError(err.response?.data?.error || 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <Card title="Change Email">
      {error && <Alert type="error" message={error} />}
      {step === 1 ? (
        <form onSubmit={handleRequest}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}><Input label="New Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
            <div style={{ flex: 1 }}><Input label="Current Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
            <Button type="submit" loading={loading}>Request</Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerify}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}><Input label="Verification Code" value={code} onChange={e => setCode(e.target.value)} required placeholder="Enter code" /></div>
            <Button type="submit" loading={loading} variant="success">Verify</Button>
          </div>
        </form>
      )}
    </Card>
  )
}
