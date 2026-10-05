import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil } from 'lucide-react'
import BackButton from '../../components/ui/BackButton'
import { useNavigate, useParams } from 'react-router'
import ItemForm, {
  type ItemFormValues,
} from '../../components/items/ItemForm'
import MediaManager from '../../components/items/MediaManager'
import Button from '../../components/ui/Button'
import PageHeader from '../../components/ui/PageHeader'
import Spinner from '../../components/ui/feedback/Spinner'
import { toast } from '../../components/ui/feedback/toast'
import { useAsync } from '../../hooks/useAsync'
import { getAllCategories } from '../../services/categoryService'
import { getAdminItem, updateAdminItem } from '../../services/itemService'
import { setAdminMediaPrimary } from '../../services/mediaService'
import type { AdminItem, ItemCategory } from '../../types/item'

function mapItemToFormValues(item: AdminItem): ItemFormValues {
  return {
    title: item.title,
    slug: item.slug,
    description: item.description ?? '',
    content: item.content ?? '',
    is_visible: item.is_visible,
    access_type: item.access_type,
    price: String(item.price ?? 0),
    categories: item.categories.map((category) => category.id),
    tags: item.tags.map((tag) => tag.name),
  }
}

interface EditItemFormProps {
  item: AdminItem
  categories: ItemCategory[]
}

function EditItemForm({
  item,
  categories,
}: EditItemFormProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [values, setValues] = useState<ItemFormValues>(() =>
    mapItemToFormValues(item),
  )

  const [currentMedia, setCurrentMedia] =
    useState<AdminItem['media']>(item.media)

  const [pendingPrimaryMediaId, setPendingPrimaryMediaId] =
    useState<number | null>(
      () => item.media.find((media) => media.is_primary)?.id ?? null,
    )

  const {
    isLoading: isSaving,
    execute: executeSave,
  } = useAsync<AdminItem>()

  function handleChange<K extends keyof ItemFormValues>(
    field: K,
    value: ItemFormValues[K],
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const price =
      values.access_type === 'paid' && values.price !== ''
        ? Number(values.price)
        : 0

    const result = await executeSave(async () => {
      const updatedItem = await updateAdminItem(item.id, {
        title: values.title,
        slug: values.slug || undefined,
        description: values.description || null,
        content: values.content || null,
        is_visible: values.is_visible,
        access_type: values.access_type,
        price,
        categories: values.categories,
        tags: values.tags,
      })

      const originalPrimaryMediaId =
        item.media.find((media) => media.is_primary)?.id ?? null

      if (
        pendingPrimaryMediaId !== null &&
        pendingPrimaryMediaId !== originalPrimaryMediaId &&
        currentMedia.some(
          (media) => media.id === pendingPrimaryMediaId,
        )
      ) {
        await setAdminMediaPrimary(
          item.id,
          pendingPrimaryMediaId,
        )
      }

      return updatedItem
    })

    if (result) {
      await toast.success(t('items.edit.success'))
      navigate(`/admin/items/${result.id}`)
    }
  }

  return (
    <ItemForm
      values={values}
      categories={categories}
      isSubmitting={isSaving}
      submitLabel={t('items.edit.save')}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onCancel={() => navigate(`/admin/items/${item.id}`)}
      mediaSection={
        <MediaManager
          itemId={item.id}
          media={currentMedia}
          deferPrimaryChange
          onMediaChange={setCurrentMedia}
          onPrimaryChange={setPendingPrimaryMediaId}
        />
      }
    />
  )
}

export default function EditItemPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const [hasLoaded, setHasLoaded] = useState(false)

  const {
    data: item,
    error: itemError,
    isLoading: isItemLoading,
    execute: executeItem,
  } = useAsync<AdminItem>()

  const {
    data: categories,
    error: categoriesError,
    isLoading: areCategoriesLoading,
    execute: executeCategories,
  } = useAsync<ItemCategory[]>()

  const loadData = useCallback(async () => {
    if (!id) {
      return
    }

    const numericId = Number(id)

    if (!Number.isInteger(numericId) || numericId <= 0) {
      return
    }

    try {
      await Promise.all([
        executeItem(() => getAdminItem(numericId)),
        executeCategories(getAllCategories),
      ])
    } finally {
      setHasLoaded(true)
    }
  }, [id, executeItem, executeCategories])

  useEffect(() => {
    void loadData()
  }, [loadData])

  if (
    !id ||
    !Number.isInteger(Number(id)) ||
    Number(id) <= 0
  ) {
    return (
      <div className="space-y-4">
        <PageHeader
          icon={Pencil}
          title={t('items.edit.title')}
          description={t('items.edit.invalidId')}
        />

        <BackButton to="/admin/items">
          {t('common.back')}
        </BackButton>
      </div>
    )
  }

  if (isItemLoading || areCategoriesLoading || !hasLoaded) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (
    itemError ||
    categoriesError ||
    !item ||
    !categories
  ) {
    return (
      <div className="space-y-4">
        <PageHeader
          icon={Pencil}
          title={t('items.edit.title')}
          description={t('items.edit.loadError')}
        />

        <Button
          variant="secondary"
          onClick={() => void loadData()}
        >
          {t('items.edit.retry')}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Pencil}
        title={t('items.edit.title')}
        description={t('items.edit.description')}
        actions={
          <BackButton to="/admin/items">
            {t('common.back')}
          </BackButton>
        }
      />

      <EditItemForm
        key={item.id}
        item={item}
        categories={categories}
      />
    </div>
  )
}
