import { useCallback, useEffect, useState } from 'react'
import {
  CircleDollarSign,
  Eye,
  EyeOffIcon,
  Gift,
  Package,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../../i18n/useLanguage'
import Alert from '../../components/ui/feedback/Alert'
import Button from '../../components/ui/Button'
import IconButton from '../../components/ui/IconButton'
import Card from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import CollapsibleFilterBar from '../../components/ui/CollapsibleFilterBar'
import Input from '../../components/ui/Input'
import Pagination from '../../components/ui/Pagination'
import Select from '../../components/ui/Select'
import Spinner from '../../components/ui/feedback/Spinner'
import Table, {
  type TableColumn,
} from '../../components/ui/Table'
import { confirm } from '../../components/ui/feedback/confirm'
import { toast } from '../../components/ui/feedback/toast'
import { useAsync } from '../../hooks/useAsync'
import {
  deleteAdminItem,
  getAdminItems,
} from '../../services/itemService'
import { getAllCategories } from '../../services/categoryService'
import type {
  AdminItem,
  ItemCategory,
  PaginatedResponse,
} from '../../types/item'
import { formatPrice } from '../../utils/format'

interface ItemFilters {
  search: string
  is_visible: 'all' | 'visible' | 'hidden'
  access_type: 'all' | 'free' | 'paid'
  category_id: string
  sort: 'latest' | 'oldest' | 'title'
}

const emptyFilters: ItemFilters = {
  search: '',
  is_visible: 'all',
  access_type: 'all',
  category_id: '',
  sort: 'latest',
}

interface ItemActionsProps {
  item: AdminItem
  onDelete: (item: AdminItem) => void
  disabled?: boolean
}

function ItemActions({
  item,
  onDelete,
  disabled = false,
}: ItemActionsProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-center gap-1">
      <IconButton
        type="button"
        disabled={disabled}
        onClick={() => navigate(`/admin/items/${item.id}`)}
        title={t('items.table.view')}
        aria-label={`${t('items.table.view')} ${item.title}`}
      >
        <Eye className="size-4" />
      </IconButton>

      <IconButton
        type="button"
        disabled={disabled}
        onClick={() => navigate(`/admin/items/${item.id}/edit`)}
        title={t('items.table.edit')}
        aria-label={`${t('items.table.edit')} ${item.title}`}
      >
        <Pencil className="size-4" />
      </IconButton>

      <IconButton
        type="button"
        disabled={disabled}
        onClick={() => onDelete(item)}
        title={t('items.table.delete')}
        aria-label={`${t('items.table.delete')} ${item.title}`}
        variant="danger"
      >
        <Trash2 className="size-4" />
      </IconButton>
    </div>
  )
}

interface ItemsTableProps {
  items: AdminItem[]
  onDelete: (item: AdminItem) => void
  deletingItemId: number | null
}

function ItemsTable({
  items,
  onDelete,
  deletingItemId,
}: ItemsTableProps) {
  const { t } = useTranslation()
  const { locale } = useLanguage()

  const columns: TableColumn<AdminItem>[] = [
    {
      key: 'title',
      header: t('items.table.title'),
      className: 'w-56 max-w-56',
      render: (item) => (
        <div className="w-56 max-w-full">
          <p
            className="truncate font-medium"
            title={item.title}
          >
            {item.title}
          </p>

          <p
            className="mt-1 truncate text-xs text-muted-foreground"
            title={item.slug}
          >
            {item.slug}
          </p>
        </div>
      ),
    },
    {
      key: 'visibility',
      header: <span className="block text-center">{t('items.table.visibility')}</span>,
      className: 'w-20 text-center',
      render: (item) =>
        item.is_visible ? (
          <span
            title={t('items.table.visible')}
            aria-label={t('items.table.visible')}
            className="mx-auto inline-flex size-9 items-center justify-center rounded-full text-success transition hover:bg-success/10 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <Eye className="size-5" />
          </span>
        ) : (
          <span
            title={t('items.table.hidden')}
            aria-label={t('items.table.hidden')}
            className="mx-auto inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <EyeOffIcon className="size-5" />
          </span>
        ),
    },
    {
      key: 'access_type',
      header: <span className="block text-center">{t('items.table.access')}</span>,
      className: 'w-20 text-center',
      render: (item) =>
        item.access_type === 'paid' ? (
          <span
            title={formatPrice(item.price, locale)}
            aria-label={`${t('items.table.paidProduct')} - ${formatPrice(item.price, locale)}`}
            className="mx-auto inline-flex size-9 items-center justify-center rounded-full text-warning"
          >
            <CircleDollarSign className="size-5" />
          </span>
        ) : (
          <span
            title={t('items.table.free')}
            aria-label={t('items.table.freeProduct')}
            className="mx-auto inline-flex size-9 items-center justify-center rounded-full text-success"
          >
            <Gift className="size-5" />
          </span>
        ),
    },
    {
      key: 'actions',
      header: <span className="block text-center">{t('items.table.actions')}</span>,
      className: 'w-32 text-center',
      render: (item) => (
        <ItemActions
          item={item}
          onDelete={onDelete}
          disabled={deletingItemId !== null}
        />
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      data={items}
      getRowKey={(item) => item.id}
      emptyMessage={t('items.table.empty')}
    />
  )
}

export default function ItemsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const sortOptions: Array<{
    value: ItemFilters['sort']
    label: string
  }> = [
    { value: 'latest', label: t('items.filters.latest') },
    { value: 'oldest', label: t('items.filters.oldest') },
    { value: 'title', label: t('items.filters.titleSort') },
  ]

  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] =
    useState<ItemFilters>(emptyFilters)
  const [appliedFilters, setAppliedFilters] =
    useState<ItemFilters>(emptyFilters)
  const [categories, setCategories] = useState<ItemCategory[]>([])
  const [isCategoriesLoading, setIsCategoriesLoading] =
    useState(true)
  const [deletingItemId, setDeletingItemId] =
    useState<number | null>(null)

  const {
    data,
    error,
    isLoading,
    execute,
  } = useAsync<PaginatedResponse<AdminItem>>()

  const loadItems = useCallback(
    (page = currentPage, activeFilters = appliedFilters) =>
      execute(() =>
        getAdminItems(page, {
          search: activeFilters.search.trim() || undefined,
          is_visible:
            activeFilters.is_visible === 'all'
              ? undefined
              : activeFilters.is_visible === 'visible',
          access_type:
            activeFilters.access_type === 'all'
              ? undefined
              : activeFilters.access_type,
          category_id: activeFilters.category_id
            ? Number(activeFilters.category_id)
            : undefined,
          sort: activeFilters.sort,
        }),
      ),
    [currentPage, appliedFilters, execute],
  )

  useEffect(() => {
    void loadItems(currentPage, appliedFilters)
  }, [currentPage, appliedFilters, loadItems])

  useEffect(() => {
    let cancelled = false

    async function loadCategories() {
      try {
        const result = await getAllCategories()

        if (!cancelled) {
          setCategories(result)
        }
      } catch {
        if (!cancelled) {
          await toast.error(
            t('items.feedback.categoriesLoadError'),
          )
        }
      } finally {
        if (!cancelled) {
          setIsCategoriesLoading(false)
        }
      }
    }

    void loadCategories()

    return () => {
      cancelled = true
    }
  }, [t])

  function handleFilterChange<K extends keyof ItemFilters>(
    field: K,
    value: ItemFilters[K],
  ) {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function handleApplyFilters() {
    setCurrentPage(1)
    setAppliedFilters(filters)
  }

  function handleClearFilters() {
    setCurrentPage(1)
    setFilters(emptyFilters)
    setAppliedFilters(emptyFilters)
  }

  async function handleDelete(item: AdminItem) {
    const accepted = await confirm({
      title: t('items.feedback.deleteTitle', { title: item.title }),
      text: t('items.feedback.deleteWarning'),
      confirmText: t('items.feedback.confirmDelete'),
      cancelText: t('items.feedback.cancelDelete'),
      danger: true,
    })

    if (!accepted) {
      return
    }

    setDeletingItemId(item.id)

    try {
      await deleteAdminItem(item.id)
      await toast.success(t('items.feedback.deleteSuccess'))

      const isLastItemOnPage =
        data?.data.length === 1 && currentPage > 1

      if (isLastItemOnPage) {
        setCurrentPage((page) => page - 1)
        return
      }

      await loadItems(currentPage, appliedFilters)
    } catch {
      await toast.error(t('items.feedback.deleteError'))
    } finally {
      setDeletingItemId(null)
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader
        icon={Package}
        title={t('items.title')}
        description={t('items.description')}
        actions={
          <Button
            className="w-full sm:w-auto"
            onClick={() => navigate('/admin/items/create')}
          >
            <Plus className="size-4" />
            {t('items.add')}
          </Button>
        }
      />

      <CollapsibleFilterBar
        title={t('items.filters.title')}
        description={t('items.filters.description')}
      >

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Input
              id="item-search-filter"
              label={t('items.filters.search')}
              placeholder={t('items.filters.searchPlaceholder')}
              value={filters.search}
              onChange={(event) =>
                handleFilterChange(
                  'search',
                  event.target.value,
                )
              }
            />

            <Select
              id="item-visibility-filter"
              label={t('items.filters.visibility')}
              value={filters.is_visible}
              onChange={(event) =>
                handleFilterChange(
                  'is_visible',
                  event.target.value as ItemFilters['is_visible'],
                )
              }
            >
              <option value="all">{t('items.filters.allVisibility')}</option>
              <option value="visible">{t('items.table.visible')}</option>
              <option value="hidden">{t('items.table.hidden')}</option>
            </Select>

            <Select
              id="item-access-type-filter"
              label={t('items.filters.accessType')}
              value={filters.access_type}
              onChange={(event) =>
                handleFilterChange(
                  'access_type',
                  event.target.value as ItemFilters['access_type'],
                )
              }
            >
              <option value="all">{t('items.filters.allAccessTypes')}</option>
              <option value="free">{t('items.filters.free')}</option>
              <option value="paid">{t('items.filters.paid')}</option>
            </Select>

            <Select
              id="item-category-filter"
              label={t('items.filters.category')}
              value={filters.category_id}
              disabled={isCategoriesLoading}
              onChange={(event) =>
                handleFilterChange(
                  'category_id',
                  event.target.value,
                )
              }
            >
              <option value="">
                {isCategoriesLoading
                  ? t('items.filters.loadingCategories')
                  : t('items.filters.allCategories')}
              </option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </Select>

            <Select
              id="item-sort-filter"
              label={t('items.filters.sort')}
              value={filters.sort}
              onChange={(event) =>
                handleFilterChange(
                  'sort',
                  event.target.value as ItemFilters['sort'],
                )
              }
            >
              {sortOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClearFilters}
            >
              {t('items.filters.clear')}
            </Button>

            <Button
              type="button"
              onClick={handleApplyFilters}
            >
              {t('items.filters.apply')}
            </Button>
          </div>
      </CollapsibleFilterBar>

      <Card className="overflow-hidden">
        {error !== null && (
          <div className="p-4 sm:p-6">
            <Alert variant="error">
              {t('items.feedback.loadError')}
            </Alert>

            <div className="mt-3">
              <Button
                variant="secondary"
                onClick={() =>
                  void loadItems(currentPage, appliedFilters)
                }
              >
                {t('items.feedback.retry')}
              </Button>
            </div>
          </div>
        )}

        {deletingItemId !== null ? (
          <div className="flex items-center gap-2 border-b border-border px-4 py-3 text-sm text-muted-foreground sm:px-6">
            <Spinner size="sm" />
            <span>{t('items.feedback.deleting')}</span>
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <ItemsTable
            items={data?.data ?? []}
            onDelete={(item) => {
              void handleDelete(item)
            }}
            deletingItemId={deletingItemId}
          />
        )}

        {data && (
          <div className="border-t border-border px-4 py-4">
            <Pagination
              currentPage={data.meta.current_page}
              lastPage={data.meta.last_page}
              onPageChange={setCurrentPage}
              disabled={
                isLoading || deletingItemId !== null
              }
            />
          </div>
        )}
      </Card>
    </section>
  )
}
