import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FolderTree,
  Pencil,
  Trash2,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'
import Alert from '../../components/ui/feedback/Alert'
import BackButton from '../../components/ui/BackButton'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import Spinner from '../../components/ui/feedback/Spinner'
import { confirm } from '../../components/ui/feedback/confirm'
import { toast } from '../../components/ui/feedback/toast'
import { useAsync } from '../../hooks/useAsync'
import {
  deleteAdminCategory,
  getAdminCategory,
} from '../../services/categoryService'
import type { AdminCategory } from '../../types/category'

export default function CategoryDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [hasLoaded, setHasLoaded] = useState(false)

  const {
    data: category,
    error,
    isLoading,
    execute,
  } = useAsync<AdminCategory>()

  const loadCategory = useCallback(async () => {
    if (!id) {
      return
    }

    const categoryId = Number(id)

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return
    }

    try {
      await execute(() => getAdminCategory(categoryId))
    } finally {
      setHasLoaded(true)
    }
  }, [execute, id])

  useEffect(() => {
    void loadCategory()
  }, [loadCategory])

  if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
    return (
      <section className="space-y-4">
        <Alert variant="error">
          {t('categories.detail.invalidId')}
        </Alert>

        <BackButton to="/admin/categories">
          {t('common.back')}
        </BackButton>
      </section>
    )
  }

  if (isLoading || !hasLoaded) {
    return (
      <section className="flex min-h-64 items-center justify-center">
        <Spinner size="lg" />
      </section>
    )
  }

  async function handleDelete() {
    const accepted = await confirm({
      title: t('categories.detail.deleteTitle', { name: category?.name ?? '' }),
      text: t('categories.detail.deleteWarning'),
      confirmText: t('categories.detail.delete'),
      cancelText: t('common.cancel'),
      danger: true,
    })

    if (!accepted || !category) {
      return
    }

    try {
      await deleteAdminCategory(category.id)
      await toast.success(t('categories.detail.deleteSuccess'))
    } catch {
      await toast.error(t('categories.detail.deleteError'))
      return
    }

    navigate('/admin/categories', {
      replace: true,
    })
  }

  if (error !== null || !category) {
    return (
      <section className="space-y-4">
        <Alert variant="error">
          {t('categories.detail.loadError')}
        </Alert>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() => void loadCategory()}
          >
            {t('categories.detail.retry')}
          </Button>

          <BackButton to="/admin/categories">
            {t('common.back')}
          </BackButton>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <PageHeader
        icon={FolderTree}
        title={category.name}
        description={category.slug}
        actions={
          <>
            <BackButton to="/admin/categories">
              {t('common.back')}
            </BackButton>

            <div className="flex items-center gap-1">
              <Link
                to={`/admin/categories/${category.id}/edit`}
                title={t('categories.detail.edit')}
                aria-label={`${t('categories.detail.edit')} ${category.name}`}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  aria-label={`${t('categories.detail.edit')} ${category.name}`}
                >
                  <Pencil className="size-4" />
                </Button>
              </Link>

              <Button
                variant="danger"
                size="sm"
                onClick={() => void handleDelete()}
                title={t('categories.detail.delete')}
                aria-label={`${t('categories.detail.delete')} ${category.name}`}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </>
        }
      />

      <Card className="p-4 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <FolderTree className="size-5 text-muted-foreground" />

          <h2 className="font-semibold text-foreground">
            {t('categories.detail.information')}
          </h2>
        </div>

        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-muted-foreground">
              {t('categories.detail.name')}
            </dt>

            <dd className="mt-1 text-foreground">
              {category.name}
            </dd>
          </div>

          <div>
            <dt className="text-muted-foreground">
              {t('categories.detail.slug')}
            </dt>

            <dd className="mt-1 break-all text-foreground">
              {category.slug}
            </dd>
          </div>
        </dl>
      </Card>
    </section>
  )
}
