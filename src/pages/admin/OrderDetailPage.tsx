import { useCallback, useEffect } from 'react'
import { useParams } from 'react-router'
import { ShoppingCart } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../../i18n/useLanguage'
import BackButton from '../../components/ui/BackButton'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import Spinner from '../../components/ui/feedback/Spinner'
import { useAsync } from '../../hooks/useAsync'
import { getAdminOrder } from '../../services/orderService'
import type { AdminOrder } from '../../types/order'
import { formatDateTime, formatPrice } from '../../utils/format'
import {
  getOrderStatusLabelKey,
  getOrderTypeLabelKey,
  getPaymentStatusLabelKey,
} from '../../utils/orderLabels'

export default function OrderDetailPage() {
  const { locale } = useLanguage()

  const { id } = useParams()
  const { t } = useTranslation()

  const {
    data: order,
    error,
    isLoading,
    execute,
  } = useAsync<AdminOrder>()

  const loadOrder = useCallback(() => {
    if (!id) {
      return Promise.resolve(undefined)
    }

    const orderId = Number(id)

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return Promise.resolve(undefined)
    }

    return execute(() => getAdminOrder(orderId))
  }, [execute, id])

  useEffect(() => {
    void loadOrder()
  }, [loadOrder])

  if (
    !id ||
    !Number.isInteger(Number(id)) ||
    Number(id) <= 0
  ) {
    return (
      <section className="space-y-4">
        <PageHeader
          icon={ShoppingCart}
          title={t('orders.detail.title')}
          description={t('orders.detail.invalidId')}
        />

        <BackButton to="/admin/orders">
          {t('common.back')}
        </BackButton>
      </section>
    )
  }

  if (isLoading) {
    return (
      <section className="flex min-h-64 items-center justify-center">
        <Spinner size="lg" />
      </section>
    )
  }

  if (error !== null || !order) {
    return (
      <section className="space-y-4">
        <PageHeader
          icon={ShoppingCart}
          title={t('orders.detail.title')}
          description={t('orders.detail.loadError')}
        />

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => void loadOrder()}
          >
            {t('common.retry')}
          </Button>

          <BackButton to="/admin/orders">
            {t('common.back')}
          </BackButton>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <PageHeader
        icon={ShoppingCart}
        title={`${t('orders.detail.order')} #${order.id}`}
        description={t('orders.detail.description')}
        actions={
          <BackButton to="/admin/orders">
            {t('common.back')}
          </BackButton>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-5 p-4 sm:p-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {t('orders.detail.orderInfo')}
            </h2>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">
                {t('orders.detail.id')}
              </dt>
              <dd className="mt-1 font-medium text-foreground">
                #{order.id}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-muted-foreground">
                {t('orders.detail.type')}
              </dt>
              <dd className="mt-1 font-medium text-foreground">
                {t(getOrderTypeLabelKey(order.type))}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-muted-foreground">
                {t('orders.detail.status')}
              </dt>
              <dd className="mt-1 font-medium text-foreground">
                {t(getOrderStatusLabelKey(order.status))}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-muted-foreground">
                {t('orders.detail.totalAmount')}
              </dt>
              <dd className="mt-1 font-medium text-foreground">
                {formatPrice(order.total_price, locale)}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-muted-foreground">
                {t('orders.detail.createdAt')}
              </dt>
              <dd className="mt-1 font-medium text-foreground">
                {formatDateTime(order.created_at, locale)}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-muted-foreground">
                {t('orders.detail.updatedAt')}
              </dt>
              <dd className="mt-1 font-medium text-foreground">
                {formatDateTime(order.updated_at, locale)}
              </dd>
            </div>
          </dl>
        </Card>

        <Card className="space-y-5 p-4 sm:p-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {t('orders.detail.user')}
            </h2>
          </div>

          {order.user ? (
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-muted-foreground">
                  {t('orders.detail.name')}
                </dt>
                <dd className="mt-1 font-medium text-foreground">
                  {order.user.name}
                </dd>
              </div>

              <div>
                <dt className="text-sm text-muted-foreground">
                  {t('orders.detail.email')}
                </dt>
                <dd className="mt-1 break-all font-medium text-foreground">
                  {order.user.email}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t('orders.detail.userInfoUnavailable')}
            </p>
          )}
        </Card>
      </div>

      {order.items && order.items.length > 0 && (
        <Card className="space-y-5 p-4 sm:p-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {t('orders.detail.orderItems')}
            </h2>
          </div>

          <div className="space-y-3">
            {order.items.map((orderItem) => (
              <div
                key={orderItem.id}
                className="flex flex-col gap-3 rounded-md border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground">
                    {orderItem.item.title}
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {orderItem.item.slug}
                  </p>
                </div>

                <div className="shrink-0 font-medium text-foreground">
                  {formatPrice(orderItem.price, locale)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {order.subscription_plan && (
        <Card className="space-y-5 p-4 sm:p-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {t('orders.detail.subscriptionPlan')}
            </h2>
          </div>

          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-muted-foreground">
                {t('orders.detail.name')}
              </dt>
              <dd className="mt-1 font-medium text-foreground">
                {order.subscription_plan.name}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-muted-foreground">
                {t('orders.detail.duration')}
              </dt>
              <dd className="mt-1 font-medium text-foreground">
                {order.subscription_plan.duration_months} {t('orders.detail.months')}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-muted-foreground">
                {t('orders.detail.price')}
              </dt>
              <dd className="mt-1 font-medium text-foreground">
                {formatPrice(order.subscription_plan.price, locale)}
              </dd>
            </div>
          </dl>
        </Card>
      )}

      {order.payments && order.payments.length > 0 && (
        <Card className="space-y-5 p-4 sm:p-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {t('orders.detail.payments')}
            </h2>
          </div>

          <div className="space-y-3">
            {order.payments.map((payment) => (
              <div
                key={payment.id}
                className="flex flex-col gap-2 rounded-md border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {t('orders.detail.payment')} #{payment.id}
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDateTime(payment.created_at, locale)}
                  </p>
                </div>

                <div className="text-sm">
                  <span className="font-medium text-foreground">
                    {formatPrice(payment.amount, locale)}
                  </span>

                  <span className="mx-2 text-muted-foreground">
                    •
                  </span>

                  <span className="text-muted-foreground">
                    {t(getPaymentStatusLabelKey(payment.status))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

    </section>
  )
}
