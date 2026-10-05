import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'
import Alert from '../../components/ui/feedback/Alert'
import BackButton from '../../components/ui/BackButton'
import Button from '../../components/ui/Button'
import FormActions from '../../components/ui/FormActions'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Spinner from '../../components/ui/feedback/Spinner'
import { toast } from '../../components/ui/feedback/toast'
import { useAsync } from '../../hooks/useAsync'
import {
  getAdminUser,
  updateAdminUser,
} from '../../services/userService'
import type {
  AdminUser,
  UpdateAdminUserPayload,
  UserRole,
} from '../../types/user'

interface UserFormValues {
  name: string
  role: UserRole
}

const emptyValues: UserFormValues = {
  name: '',
  role: 'user',
}

function mapUserToFormValues(
  user: AdminUser,
): UserFormValues {
  return {
    name: user.name,
    role: user.role,
  }
}

export default function EditUserPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const roleOptions: Array<{
    value: UserRole
    label: string
  }> = [
    { value: 'user', label: t('users.edit.userRole') },
    { value: 'admin', label: t('users.edit.adminRole') },
  ]

  const [values, setValues] =
    useState<UserFormValues | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  const {
    data: user,
    error: loadError,
    isLoading: isLoadingUser,
    execute: executeLoad,
  } = useAsync<AdminUser>()

  const {
    error: submitError,
    isLoading: isSubmitting,
    execute: executeSubmit,
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
      await executeLoad(() => getAdminUser(userId))
    } finally {
      setHasLoaded(true)
    }
  }, [executeLoad, id])

  useEffect(() => {
    void loadUser()
  }, [loadUser])

  const formValues =
    values ?? (user ? mapUserToFormValues(user) : null)

  function handleChange<K extends keyof UserFormValues>(
    field: K,
    value: UserFormValues[K],
  ) {
    setValues((current) => ({
      ...(current ??
        (user
          ? mapUserToFormValues(user)
          : emptyValues)),
      [field]: value,
    }))
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (!user || !formValues) {
      return
    }

    const payload: UpdateAdminUserPayload = {
      name: formValues.name.trim(),
      role: formValues.role,
    }

    const result = await executeSubmit(() =>
      updateAdminUser(user.id, payload),
    )

    if (result) {
      await toast.success(t('users.edit.success'))

      navigate(`/admin/users/${result.id}`)
    }
  }

  if (
    !id ||
    !Number.isInteger(Number(id)) ||
    Number(id) <= 0
  ) {
    return (
      <section className="space-y-4">
        <PageHeader
          icon={Pencil}
          title={t('users.edit.title')}
          description={t('users.edit.invalidId')}
        />

        <BackButton to="/admin/users">
          {t('common.back')}
        </BackButton>
      </section>
    )
  }

  if (isLoadingUser || !hasLoaded) {
    return (
      <section className="flex min-h-64 items-center justify-center">
        <Spinner size="lg" />
      </section>
    )
  }

  if (loadError || !user || !formValues) {
    return (
      <section className="space-y-4">
        <PageHeader
          icon={Pencil}
          title={t('users.edit.title')}
          description={t('users.edit.loadError')}
        />

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
        icon={Pencil}
        title={t('users.edit.title')}
        description={t('users.edit.description')}
        actions={
          <BackButton to={`/admin/users/${user.id}`}>
            {t('common.back')}
          </BackButton>
        }
      />

      {submitError !== null && (
        <Alert variant="error">
          {t('users.edit.submitError')}
        </Alert>
      )}

      <Card className="p-4 sm:p-6">
        <form
          className="space-y-6"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              id="user-name"
              label={t('users.edit.name')}
              value={formValues.name}
              onChange={(event) =>
                handleChange('name', event.target.value)
              }
              required
            />

            <Input
              id="user-email"
              label={t('users.edit.email')}
              value={user.email}
              disabled
            />

            <Select
              id="user-role"
              label={t('users.edit.role')}
              value={formValues.role}
              onChange={(event) =>
                handleChange(
                  'role',
                  event.target.value as UserRole,
                )
              }
            >
              {roleOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <FormActions
            cancelLabel={t('users.edit.cancel')}
            submitLabel={t('users.edit.save')}
            onCancel={() => navigate(`/admin/users/${user.id}`)}
            isSubmitting={isSubmitting}
          />
        </form>
      </Card>
    </section>
  )
}
