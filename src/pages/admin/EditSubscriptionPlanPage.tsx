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
import SubscriptionPlanForm from '../../components/subscriptionPlans/SubscriptionPlanForm'
import type { SubscriptionPlanFormValues } from '../../types/subscriptionPlan'
import { toast } from '../../components/ui/feedback/toast'
import { useAsync } from '../../hooks/useAsync'
import {
  getAdminSubscriptionPlan,
  updateAdminSubscriptionPlan,
} from '../../services/subscriptionPlanService'
import type { AdminSubscriptionPlan } from '../../types/subscriptionPlan'

function mapPlanToFormValues(
  plan: AdminSubscriptionPlan,
): SubscriptionPlanFormValues {
  return {
    name: plan.name,
    duration_months: String(plan.duration_months),
    price: String(plan.price),
    is_active: plan.is_active,
  }
}

export default function EditSubscriptionPlanPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [values, setValues] =
    useState<SubscriptionPlanFormValues | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  const {
    data: plan,
    error: loadError,
    isLoading: isLoadingPlan,
    execute: executeLoad,
  } = useAsync<AdminSubscriptionPlan>()

  const {
    error: submitError,
    isLoading: isSubmitting,
    execute: executeSubmit,
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
      await executeLoad(() =>
        getAdminSubscriptionPlan(planId),
      )
    } finally {
      setHasLoaded(true)
    }
  }, [executeLoad, id])

  useEffect(() => {
    void loadPlan()
  }, [loadPlan])

  const formValues =
    values ?? (plan ? mapPlanToFormValues(plan) : null)

  function handleChange<
    K extends keyof SubscriptionPlanFormValues,
  >(
    field: K,
    value: SubscriptionPlanFormValues[K],
  ) {
    setValues((current) => ({
      ...(current ??
        (plan
          ? mapPlanToFormValues(plan)
          : {
              name: '',
              duration_months: '',
              price: '',
              is_active: false,
            })),
      [field]: value,
    }))
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (!plan || !formValues) {
      return
    }

    const result = await executeSubmit(() =>
      updateAdminSubscriptionPlan(plan.id, {
        name: formValues.name.trim(),
        duration_months: formValues.duration_months,
        price: formValues.price,
        is_active: formValues.is_active,
      }),
    )

    if (result) {
      await toast.success(t('subscriptionPlans.edit.success'))

      navigate(`/admin/subscription-plans/${result.id}`)
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
          title={t('subscriptionPlans.edit.title')}
          description={t('subscriptionPlans.edit.invalidId')}
        />

        <BackButton to="/admin/subscription-plans">
          {t('common.back')}
        </BackButton>
      </section>
    )
  }

  if (isLoadingPlan || !hasLoaded) {
    return (
      <section className="flex min-h-64 items-center justify-center">
        <Spinner size="lg" />
      </section>
    )
  }

  if (loadError || !plan || !formValues) {
    return (
      <section className="space-y-4">
        <PageHeader
          icon={Pencil}
          title={t('subscriptionPlans.edit.title')}
          description={t('subscriptionPlans.edit.loadError')}
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
        icon={Pencil}
        title={t('subscriptionPlans.edit.title')}
        description={t('subscriptionPlans.edit.description')}
        actions={
          <BackButton
            to={`/admin/subscription-plans/${plan.id}`}
          >
            {t('common.back')}
          </BackButton>
        }
      />

      {submitError !== null && (
        <Alert variant="error">
          {t('subscriptionPlans.edit.submitError')}
        </Alert>
      )}

      <SubscriptionPlanForm
        values={formValues}
        isSubmitting={isSubmitting}
        submitLabel={t('subscriptionPlans.edit.save')}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={() =>
          navigate(`/admin/subscription-plans/${plan.id}`)
        }
      />
    </section>
  )
}
