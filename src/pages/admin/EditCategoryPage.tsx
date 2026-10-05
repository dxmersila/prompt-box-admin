import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'
import Alert from '../../components/ui/feedback/Alert'
import BackButton from '../../components/ui/BackButton'
import Button from '../../components/ui/Button'
import PageHeader from '../../components/ui/PageHeader'
import Spinner from '../../components/ui/feedback/Spinner'
import CategoryForm, {
  type CategoryFormValues,
} from '../../components/categories/CategoryForm'
import { toast } from '../../components/ui/feedback/toast'
import { useAsync } from '../../hooks/useAsync'
import {
  getAdminCategory,
  updateAdminCategory,
} from '../../services/categoryService'
import type { AdminCategory } from '../../types/category'

function mapCategoryToFormValues(
  category: AdminCategory,
): CategoryFormValues {
  return {
    name: category.name,
    slug: category.slug,
  }
}

export default function EditCategoryPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [values, setValues] =
    useState<CategoryFormValues | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  const {
    data: category,
    error: loadError,
    isLoading: isLoadingCategory,
    execute: executeLoad,
  } = useAsync<AdminCategory>()

  const {
    error: submitError,
    isLoading: isSubmitting,
    execute: executeSubmit,
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
      await executeLoad(() => getAdminCategory(categoryId))
    } finally {
      setHasLoaded(true)
    }
  }, [executeLoad, id])

  useEffect(() => {
    void loadCategory()
  }, [loadCategory])

  const formValues =
    values ?? (category ? mapCategoryToFormValues(category) : null)

  function handleChange<K extends keyof CategoryFormValues>(
    field: K,
    value: CategoryFormValues[K],
  ) {
    setValues((current) => ({
      ...(current ??
        (category
          ? mapCategoryToFormValues(category)
          : { name: '', slug: '' })),
      [field]: value,
    }))
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (!category || !formValues) {
      return
    }

    const result = await executeSubmit(() =>
      updateAdminCategory(category.id, {
        name: formValues.name.trim(),
        slug: formValues.slug.trim() || undefined,
      }),
    )

    if (result) {
      await toast.success(t('categories.edit.success'))

      navigate(`/admin/categories/${result.id}`)
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
          title={t('categories.edit.title')}
          description={t('categories.edit.invalidId')}
        />

        <BackButton to="/admin/categories">
          {t('common.back')}
        </BackButton>
      </section>
    )
  }

  if (isLoadingCategory || !hasLoaded) {
    return (
      <section className="flex min-h-64 items-center justify-center">
        <Spinner size="lg" />
      </section>
    )
  }

  if (loadError || !category || !formValues) {
    return (
      <section className="space-y-4">
        <PageHeader
          icon={Pencil}
          title={t('categories.edit.title')}
          description={t('categories.edit.loadError')}
        />

        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() => void loadCategory()}
          >
            {t('categories.edit.retry')}
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
        icon={Pencil}
        title={t('categories.edit.title')}
        description={t('categories.edit.description')}
        actions={
          <BackButton to="/admin/categories">
            {t('common.back')}
          </BackButton>
        }
      />

      {submitError !== null && (
        <Alert variant="error">
          {t('categories.edit.submitError')}
        </Alert>
      )}

      <CategoryForm
        values={formValues}
        isSubmitting={isSubmitting}
        submitLabel={t('categories.edit.save')}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={() =>
          navigate(`/admin/categories/${category.id}`)
        }
      />
    </section>
  )
}
