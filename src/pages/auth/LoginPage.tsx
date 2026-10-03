import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { appConfig } from '../../config/app'
import { useLocation, useNavigate } from 'react-router'
import { useAuth } from '../../auth/useAuth'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/feedback/Alert'
import Input from '../../components/ui/Input'

interface LoginLocationState {
  from?: {
    pathname?: string
  }
}

export default function LoginPage() {
  const { login, logout, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const state = location.state as LoginLocationState | null
  const from = state?.from?.pathname ?? '/admin'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError(null)
    setIsSubmitting(true)

    try {
      const user = await login(email, password)

      if (user.role !== 'admin') {
        await logout()
        setError(t('auth.notAuthorized'))
        return
      }

      navigate(from, { replace: true })
    } catch {
      setError(t('auth.invalidCredentials'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">
          {appConfig.name}
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {t('auth.subtitle')}
        </p>
      </div>

      {error && (
        <div className="mb-5">
          <Alert variant="error">
            {error}
          </Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          id="email"
          type="email"
          label={t('auth.email')}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />

        <Input
          id="password"
          type="password"
          label={t('auth.password')}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />

        <Button
          type="submit"
          loading={isSubmitting || isLoading}
          className="w-full"
        >
          {t('auth.signIn')}
        </Button>
      </form>
    </div>
  )
}
