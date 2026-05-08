import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Input, Alert, Card, useToast } from '@/components/ui'
import { useForm } from '@/hooks'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const { t } = useTranslation()
  const [redirecting, setRedirecting] = useState(false)

  const { values, errors, loading, submitError, setValue, handleSubmit } = useForm({
    initialValues: { email: '', password: '' },
    onSubmit: async (data) => {
      await login(data)
      toast.success(t('login.loginSuccess'))
      setRedirecting(true)
      setTimeout(() => navigate('/admin/dashboard'), 500)
    },
    validate: (v) => {
      const errs: Record<string, string> = {}
      if (!v.email) errs.email = t('login.emailRequired')
      if (!v.password) errs.password = t('login.passwordRequired')
      return errs
    },
  })

  useEffect(() => {
    if (submitError) toast.error(submitError)
  }, [submitError])

  if (redirecting) {
    return (
      <div className="app-loading">
        <div className="app-loading-spinner" />
        <p className="app-loading-text">{t('login.signingIn')}</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: '0 1rem' }} className="page-enter">
      <Card title={t('login.title')}>
        {submitError && <Alert type="error" message={submitError} />}
        <form onSubmit={handleSubmit}>
          <Input label={t('login.emailOrUsername')} type="text" value={values.email} onChange={e => setValue('email', e.target.value)} error={errors.email} placeholder={t('login.emailOrUsernamePlaceholder')} />
          <Input label={t('login.password')} type="password" value={values.password} onChange={e => setValue('password', e.target.value)} error={errors.password} />
          <Button type="submit" loading={loading} style={{ width: '100%' }}>{t('login.login')}</Button>
        </form>
        <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
          <Link to="/admin/reset-password" style={{ color: '#3b82f6' }}>{t('login.forgotPassword')}</Link>
        </div>
      </Card>
    </div>
  )
}
