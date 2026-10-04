import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../../i18n/useLanguage'
import {
  Eye,
  EyeOff,
  FileText,
  Package,
  Pencil,
  Tag,
  Trash2,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'
import Badge from '../../components/ui/Badge'
import BackButton from '../../components/ui/BackButton'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import MediaManager from '../../components/items/MediaManager'
import Alert from '../../components/ui/feedback/Alert'
import Spinner from '../../components/ui/feedback/Spinner'
import { confirm } from '../../components/ui/feedback/confirm'
import { toast } from '../../components/ui/feedback/toast'
import { useAsync } from '../../hooks/useAsync'
import {
  deleteAdminItem,
  getAdminItem,
} from '../../services/itemService'
import type { AdminItem } from '../../types/item'
import { formatPrice } from '../../utils/format'

export default function ItemDetailPage() {
  const { locale } = useLanguage()

  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [hasLoaded, setHasLoaded] = useState(false)

  const {
    data: item,
    error,
    isLoading,
    execute,
  } = useAsync<AdminItem>()

  const loadItem = useCallback(async () => {
    if (!id) {
      return
    }

    const itemId = Number(id)

    if (!Number.isInteger(itemId) || itemId <= 0) {
      return
    }

    try {
      await execute(() => getAdminItem(itemId))
    } finally {
      setHasLoaded(true)
    }
  }, [execute, id])

  useEffect(() => {
    void loadItem()
  }, [loadItem])

  if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
    return (
      <section className="space-y-4">
        <Alert variant="error">
          {t('items.detail.invalidId')}
        </Alert>

        <BackButton to="/admin/items">
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
      title: t('items.detail.deleteTitle', { title: item?.title ?? '' }),
      text: t('items.detail.deleteWarning'),
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
      danger: true,
    })

    if (!accepted || !item) {
      return
    }

    try {
      await deleteAdminItem(item.id)
      await toast.success(t('items.detail.deleteSuccess'))
    } catch {
      await toast.error(t('items.detail.deleteError'))
      return
    }

    navigate('/admin/items', {
      replace: true,
    })
  }

  if (error !== null || !item) {
    return (
      <section className="space-y-4">
        <Alert variant="error">
          {t('items.detail.loadError')}
        </Alert>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() => void loadItem()}
          >
            {t('items.detail.retry')}
          </Button>

          <BackButton to="/admin/items">
            {t('common.back')}
          </BackButton>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <PageHeader
        icon={Package}
        title={item.title}
        description={item.slug}
        actions={
          <>
            <BackButton to="/admin/items">
              {t('common.back')}
            </BackButton>

            <div className="flex items-center gap-1">
              <Link
                to={`/admin/items/${item.id}/edit`}
                title={t('items.detail.edit')}
                aria-label={`${t('items.detail.edit')} ${item.title}`}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  aria-label={`${t('items.detail.edit')} ${item.title}`}
                >
                  <Pencil className="size-4" />
                </Button>
              </Link>

              <Button
                variant="danger"
                size="sm"
                onClick={() => void handleDelete()}
                title={t('items.detail.delete')}
                aria-label={`${t('items.detail.delete')} ${item.title}`}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="size-5 text-muted-foreground" />

            <h2 className="font-semibold text-foreground">
              {t('items.detail.mainInfo')}
            </h2>
          </div>

          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-muted-foreground">
                {t('items.detail.title')}
              </dt>

              <dd className="mt-1 text-foreground">
                {item.title}
              </dd>
            </div>

            <div>
              <dt className="text-muted-foreground">
                {t('items.detail.slug')}
              </dt>

              <dd className="mt-1 text-foreground">
                {item.slug}
              </dd>
            </div>

            <div>
              <dt className="text-muted-foreground">
                {t('items.detail.visibility')}
              </dt>

              <dd className="mt-2">
                {item.is_visible ? (
                  <Badge variant="success">
                    <Eye className="me-1 size-3.5" />
                    {t('items.detail.visible')}
                  </Badge>
                ) : (
                  <Badge variant="neutral">
                    <EyeOff className="me-1 size-3.5" />
                    {t('items.detail.hidden')}
                  </Badge>
                )}
              </dd>
            </div>

            <div>
              <dt className="text-muted-foreground">
                {t('items.detail.accessType')}
              </dt>

              <dd className="mt-2">
                {item.access_type === 'paid' ? (
                  <Badge variant="warning">
                    {t('items.detail.paid')}
                  </Badge>
                ) : (
                  <Badge variant="success">
                    {t('items.detail.free')}
                  </Badge>
                )}
              </dd>
            </div>

            <div>
              <dt className="text-muted-foreground">
                {t('items.detail.price')}
              </dt>

              <dd className="mt-1 text-foreground">
                {item.access_type === 'paid'
                  ? formatPrice(item.price, locale)
                  : t('items.detail.free')}
              </dd>
            </div>
          </dl>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Tag className="size-5 text-muted-foreground" />

            <h2 className="font-semibold text-foreground">
              {t('items.detail.categoriesAndTags')}
            </h2>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              {t('items.detail.categories')}
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              {item.categories.length > 0 ? (
                item.categories.map((category) => (
                  <Badge key={category.id}>
                    {category.name}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">
                  —
                </span>
              )}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm text-muted-foreground">
              {t('items.detail.tags')}
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              {item.tags.length > 0 ? (
                item.tags.map((tag) => (
                  <Badge key={tag.id} variant="info">
                    {tag.name}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">
                  —
                </span>
              )}
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="mb-4 font-semibold text-foreground">
          {t('items.detail.description')}
        </h2>

        <div className="space-y-6 text-sm leading-7 text-foreground">
          <div>
            <p className="mb-2 text-muted-foreground">
              {t('items.detail.description')}
            </p>

            <p className="whitespace-pre-wrap">
              {item.description || '—'}
            </p>
          </div>

          <div>
            <p className="mb-2 text-muted-foreground">
              {t('items.detail.content')}
            </p>

            <p className="whitespace-pre-wrap">
              {item.content || '—'}
            </p>
          </div>
        </div>
      </Card>

      <MediaManager
        key={item.id}
        itemId={item.id}
        media={item.media}
      />

    </section>
  )
}
