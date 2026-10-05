import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../../i18n/useLanguage'
import {
  CalendarDays,
  Mail,
  Pencil,
  Shield,
  User as UserIcon,
  Users as UsersIcon,
} from 'lucide-react'
import { Link, useParams } from 'react-router'
import Alert from '../../components/ui/feedback/Alert'
import BackButton from '../../components/ui/BackButton'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import Spinner from '../../components/ui/feedback/Spinner'
import { useAsync } from '../../hooks/useAsync'
import { getAdminUser } from '../../services/userService'
import type { AdminUser, UserRole } from '../../types/user'
import { formatDate } from '../../utils/format'

function getRoleLabel(
  role: UserRole,
  t: (key: string) => string,
) {
  return role === 'admin'
    ? t('users.detail.adminRole')
    : t('users.detail.userRole')
}

function getRoleBadgeVariant(
  role: UserRole,
): 'neutral' | 'info' {
  return role === 'admin' ? 'info' : 'neutral'
}

export default function UserDetailPage() {
  const { locale } = useLanguage()

  const { id } = useParams()
  const { t } = useTranslation()

  const [hasLoaded, setHasLoaded] = useState(false)

  const {
    data: user,
    error,
    isLoading,
    execute,
  } = useAsync<AdminUser>()

  const loadUser = useCallback(async () => {
    if (!id) {
      return
    }

    const userId = Number(id)

    if (!Number.isInteger(userId) || userId <= 0) {
      return
    }

    try {
      await execute(() => getAdminUser(userId))
    } finally {
      setHasLoaded(true)
    }
  }, [execute, id])

  useEffect(() => {
    void loadUser()
  }, [loadUser])

  if (isLoading || !hasLoaded) {
    return (
      <section className="flex min-h-64 items-center justify-center">
        <Spinner size="lg" />
      </section>
    )
  }

  if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
    return (
      <section className="space-y-4">
        <Alert variant="error">
          {t('users.detail.invalidId')}
        </Alert>

        <BackButton to="/admin/users">
          {t('common.back')}
        </BackButton>
      </section>
    )
  }

  if (error !== null || !user) {
    return (
      <section className="space-y-4">
        <Alert variant="error">
          {t('users.detail.loadError')}
        </Alert>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() => void loadUser()}
          >
            {t('common.retry')}
          </Button>

          <BackButton to="/admin/users">
            {t('common.back')}
          </BackButton>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <PageHeader
        icon={UsersIcon}
        title={user.name}
        description={user.email}
        actions={
          <>
            <BackButton to="/admin/users">
              {t('common.back')}
            </BackButton>

            <Link to={`/admin/users/${user.id}/edit`}>
              <Button
                variant="secondary"
                size="sm"
                aria-label={`${t('common.edit')} ${user.name}`}
              >
                <Pencil className="size-4" />
                {t('common.edit')}
              </Button>
            </Link>
          </>
        }
      />

      <Card className="p-4 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <UserIcon className="size-5 text-muted-foreground" />

          <h2 className="font-semibold text-foreground">
            {t('users.detail.information')}
          </h2>
        </div>

        <dl className="space-y-5 text-sm">
          <div className="flex items-start gap-3">
            <UserIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

            <div>
              <dt className="text-muted-foreground">
                {t('users.detail.name')}
              </dt>

              <dd className="mt-1 text-foreground">
                {user.name}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

            <div>
              <dt className="text-muted-foreground">
                {t('users.detail.email')}
              </dt>

              <dd className="mt-1 break-all text-foreground">
                {user.email}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

            <div>
              <dt className="text-muted-foreground">
                {t('users.detail.role')}
              </dt>

              <dd className="mt-1">
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {user.role === 'admin' ? (
                    <Shield className="size-3.5" />
                  ) : null}
                  {getRoleLabel(user.role, t)}
                </Badge>
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

            <div>
              <dt className="text-muted-foreground">
                {t('users.detail.joinedAt')}
              </dt>

              <dd className="mt-1 text-foreground">
                {formatDate(user.created_at, locale)}
              </dd>
            </div>
          </div>
        </dl>
      </Card>
    </section>
  )
}
