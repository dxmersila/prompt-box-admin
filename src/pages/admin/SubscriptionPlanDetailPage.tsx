import { Pencil, BadgeCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { useCallback, useEffect, useState } from 'react'
import { useLanguage } from '../../i18n/useLanguage'
import BackButton from '../../components/ui/BackButton'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import Spinner from '../../components/ui/feedback/Spinner'
import { useAsync } from '../../hooks/useAsync'
import { getAdminSubscriptionPlan } from '../../services/subscriptionPlanService'
import type { AdminSubscriptionPlan } from '../../types/subscriptionPlan'
import {
  formatDateTime,
  formatPrice,
} from '../../utils/format'

export default function SubscriptionPlanDetailPage() {
  const { locale } = useLanguage()
  const { t } = useTranslation()

  const { id } = useParams()

  const [hasLoaded, setHasLoaded] = useState(false)

  const {
    data: plan,
    error,
    isLoading,
    execute,
  } = useAsync<AdminSubscriptionPlan>()

  const loadPlan = useCallback(async () => {
    if (!id) {
      return
    }

    const planId = Number(id)

    if (!Number.isInteger(planId) || planId <= 0) {
      return
    }

    try {
      await execute(() => getAdminSubscriptionPlan(planId))
    } finally {
      setHasLoaded(true)
    }
  }, [execute, id])

  useEffect(() => {
    void loadPlan()
  }, [loadPlan])

  if (isLoading || !hasLoaded) {
    return (
      <section className="flex min-h-64 items-center justify-center">
        <Spinner size="lg" />
      </section>
    )
  }

  if (
    !id ||
    !Number.isInteger(Number(id)) ||
    Number(id) <= 0
  ) {
    return (
      <section className="space-y-4">
        <PageHeader
          icon={BadgeCheck}
          title={t('subscriptionPlans.detail.title')}
          description={t('subscriptionPlans.detail.invalidId')}
        />

        <BackButton to="/admin/subscription-plans">
          {t('common.back')}
        </BackButton>
      </section>
    )
  }

  if (error !== null || !plan) {
    return (
      <section className="space-y-4">
        <PageHeader
          icon={BadgeCheck}
          title={t('subscriptionPlans.detail.title')}
          description={t('subscriptionPlans.detail.loadError')}
        />

        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() => void loadPlan()}
          >
            {t('common.retry')}
          </Button>

          <BackButton to="/admin/subscription-plans">
            {t('common.back')}
          </BackButton>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <PageHeader
        icon={BadgeCheck}
        title={plan.name}
        description={`${t('subscriptionPlans.detail.subscription')} #${plan.id}`}
        actions={
          <>
            <BackButton to="/admin/subscription-plans">
              {t('common.back')}
            </BackButton>

            <Link
              to={`/admin/subscription-plans/${plan.id}/edit`}
            >
              <Button
                variant="secondary"
                size="sm"
                aria-label={`${t('common.edit')} ${plan.name}`}
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
          <BadgeCheck className="size-5 text-muted-foreground" />

          <h2 className="font-semibold text-foreground">
            {t('subscriptionPlans.detail.information')}
          </h2>
        </div>

        <dl className="grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted-foreground">
              {t('subscriptionPlans.detail.name')}
            </dt>

            <dd className="mt-1 font-medium text-foreground">
              {plan.name}
            </dd>
          </div>

          <div>
            <dt className="text-sm text-muted-foreground">
              {t('subscriptionPlans.detail.status')}
            </dt>

            <dd className="mt-2">
              {plan.is_active ? (
                <Badge variant="success">
                  {t('subscriptionPlans.detail.active')}
                </Badge>
              ) : (
                <Badge variant="neutral">
                  {t('subscriptionPlans.detail.inactive')}
                </Badge>
              )}
            </dd>
          </div>

          <div>
            <dt className="text-sm text-muted-foreground">
              {t('subscriptionPlans.detail.duration')}
            </dt>

            <dd className="mt-1 font-medium text-foreground">
              {plan.duration_months} {t('subscriptionPlans.detail.months')}
            </dd>
          </div>

          <div>
            <dt className="text-sm text-muted-foreground">
              {t('subscriptionPlans.detail.price')}
            </dt>

            <dd className="mt-1 font-medium text-foreground">
              {formatPrice(plan.price, locale)}
            </dd>
          </div>

          <div>
            <dt className="text-sm text-muted-foreground">
              {t('subscriptionPlans.detail.createdAt')}
            </dt>

            <dd className="mt-1 font-medium text-foreground">
              {formatDateTime(plan.created_at, locale)}
            </dd>
          </div>

          <div>
            <dt className="text-sm text-muted-foreground">
              {t('subscriptionPlans.detail.updatedAt')}
            </dt>

            <dd className="mt-1 font-medium text-foreground">
              {formatDateTime(plan.updated_at, locale)}
            </dd>
          </div>
        </dl>
      </Card>
    </section>
  )
}
