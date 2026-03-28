import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authApi } from '@/api'

const styles = {
  container: { maxWidth: 400, margin: '100px auto', padding: '2rem' },
  error: { color: '#ef4444', marginBottom: '1rem' },
  success: { color: '#22c55e', marginBottom: '1rem' },
  label: { display: 'block', marginBottom: '0.25rem', fontWeight: 500 },
  input: { width: '100%', padding: '0.5rem', marginBottom: '1rem', border: '1px solid #d1d5db', borderRadius: '4px' },
  btn: { width: '100%', padding: '0.75rem', background: '#3b82f6', color: '#fff', borderRadius: '4px' },
  link: { marginTop: '1rem', textAlign: 'center' as const },
}

export default function ResetPasswordPage() {
  const { t } = useTranslation()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRequest = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.resetPasswordRequest(email)
      setMessage(res.message)
      if (res.verification_code) setCode(res.verification_code)
      setStep(2)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Request failed')
    } finally { setLoading(false) }
  }

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.resetPasswordVerify(email, code, newPassword)
      setMessage(res.message)
      setStep(3)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Reset failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={styles.container}>
      <h1>{t('resetPassword.title')}</h1>
      {error && <p style={styles.error}>{error}</p>}
      {message && step < 3 && <p style={styles.success}>{message}</p>}

      {step === 1 && (
        <form onSubmit={handleRequest}>
          <div>
            <label style={styles.label}>{t('resetPassword.email')}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={styles.input} />
          </div>
          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? t('resetPassword.sending') : t('resetPassword.sendCode')}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerify}>
          <div>
            <label style={styles.label}>{t('resetPassword.verificationCode')}</label>
            <input type="text" value={code} onChange={e => setCode(e.target.value)} required style={styles.input} placeholder={t('resetPassword.codePlaceholder')} />
          </div>
          <div>
            <label style={styles.label}>{t('resetPassword.newPassword')}</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={8} style={styles.input} />
          </div>
          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? t('resetPassword.resetting') : t('resetPassword.resetPassword')}
          </button>
        </form>
      )}

      {step === 3 && (
        <div style={{ textAlign: 'center' }}>
          <p style={styles.success}>{message}</p>
          <Link to="/login" style={{ color: '#3b82f6' }}>{t('resetPassword.backToLogin')}</Link>
        </div>
      )}

      <p style={styles.link}>
        <Link to="/login">{t('resetPassword.backToLogin')}</Link>
      </p>
    </div>
  )
}
