import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Activity,
  Copy,
  Eye,
  FolderKanban,
  LayoutDashboard,
  Package,
  Users,
} from 'lucide-react'
import Card from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import Spinner from '../../components/ui/feedback/Spinner'
import Alert from '../../components/ui/feedback/Alert'
import Button from '../../components/ui/Button'
import { getDashboardStats } from '../../services/dashboardService'
import { useAsync } from '../../hooks/useAsync'
import type { DashboardStats } from '../../types/dashboard'

interface DashboardCardProps {
  title: string
  value: number | string
  icon: typeof Users
}

interface AnalyticsPeriodCardProps {
  title: string
  visits: number
  uniqueVisitors: number
  promptAccess: number
  promptCopies: number
  labels: {
    visits: string
    uniqueVisitors: string
    promptAccess: string
    promptCopies: string
  }
}

function DashboardCard({
  title,
  value,
  icon: Icon,
}: DashboardCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {title}
          </p>

          <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
        </div>

        <div className="flex size-11 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-5 text-muted-foreground" />
        </div>
      </div>
    </Card>
  )
}

function AnalyticsPeriodCard({
  title,
  visits,
  uniqueVisitors,
  promptAccess,
  promptCopies,
  labels,
}: AnalyticsPeriodCardProps) {
  const metrics = [
    { label: labels.visits, value: visits, Icon: Activity },
    { label: labels.uniqueVisitors, value: uniqueVisitors, Icon: Users },
    { label: labels.promptAccess, value: promptAccess, Icon: Eye },
    { label: labels.promptCopies, value: promptCopies, Icon: Copy },
  ]

  return (
    <Card className="min-w-0 p-4 sm:p-5 xl:p-6">
      <h3 className="text-start text-base font-semibold text-foreground">
        {title}
      </h3>

      <dl className="mt-5 grid grid-cols-1 gap-y-4">
        {metrics.map(({ label, value, Icon }) => (
          <div key={label} className="min-w-0">
            <dt className="flex min-w-0 items-start gap-2 text-start text-sm text-muted-foreground">
              <Icon className="mt-0.5 size-4 shrink-0" />
              <span className="min-w-0 break-words">{label}</span>
            </dt>
            <dd className="mt-1 break-words text-start text-2xl font-semibold tabular-nums tracking-tight text-foreground">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  )
}

export default function DashboardPage() {
  const { t } = useTranslation()

  const {
    data: stats,
    error,
    isLoading,
    execute,
  } = useAsync<DashboardStats>()

  const loadDashboard = useCallback(() => {
    return execute(getDashboardStats)
  }, [execute])

  useEffect(() => {
    void loadDashboard()
  }, [loadDashboard])

  return (
    <section className="space-y-6">
      <PageHeader
        icon={LayoutDashboard}
        title={t('dashboard.title')}
        description={t('dashboard.welcome')}
      />

      {error !== null && (
        <div className="space-y-3">
          <Alert variant="error">
            {t('dashboard.loadError')}
          </Alert>

          <Button
            variant="secondary"
            onClick={() => void loadDashboard()}
          >
            {t('dashboard.retry')}
          </Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <Card className="flex min-h-32 items-center justify-center p-6 sm:col-span-2 lg:col-span-3">
            <Spinner size="lg" />
          </Card>
        ) : (
          <>
            <DashboardCard
              title={t('dashboard.users')}
              value={stats?.users_count ?? 0}
              icon={Users}
            />

            <DashboardCard
              title={t('dashboard.items')}
              value={stats?.items_count ?? 0}
              icon={Package}
            />

            <DashboardCard
              title={t('dashboard.categories')}
              value={stats?.categories_count ?? 0}
              icon={FolderKanban}
            />
          </>
        )}
      </div>

      {stats !== null && stats !== undefined && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            {t('dashboard.analytics')}
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AnalyticsPeriodCard
              title={t('dashboard.today')}
              visits={stats.analytics.today.visits}
              uniqueVisitors={stats.analytics.today.unique_visitors}
              promptAccess={stats.analytics.today.item_access}
              promptCopies={stats.analytics.today.item_copies}
              labels={{
                visits: t('dashboard.visits'),
                uniqueVisitors: t('dashboard.uniqueVisitors'),
                promptAccess: t('dashboard.promptAccess'),
                promptCopies: t('dashboard.promptCopies'),
              }}
            />

            <AnalyticsPeriodCard
              title={t('dashboard.week')}
              visits={stats.analytics.week.visits}
              uniqueVisitors={stats.analytics.week.unique_visitors}
              promptAccess={stats.analytics.week.item_access}
              promptCopies={stats.analytics.week.item_copies}
              labels={{
                visits: t('dashboard.visits'),
                uniqueVisitors: t('dashboard.uniqueVisitors'),
                promptAccess: t('dashboard.promptAccess'),
                promptCopies: t('dashboard.promptCopies'),
              }}
            />

            <AnalyticsPeriodCard
              title={t('dashboard.month')}
              visits={stats.analytics.month.visits}
              uniqueVisitors={stats.analytics.month.unique_visitors}
              promptAccess={stats.analytics.month.item_access}
              promptCopies={stats.analytics.month.item_copies}
              labels={{
                visits: t('dashboard.visits'),
                uniqueVisitors: t('dashboard.uniqueVisitors'),
                promptAccess: t('dashboard.promptAccess'),
                promptCopies: t('dashboard.promptCopies'),
              }}
            />

            <AnalyticsPeriodCard
              title={t('dashboard.year')}
              visits={stats.analytics.year.visits}
              uniqueVisitors={stats.analytics.year.unique_visitors}
              promptAccess={stats.analytics.year.item_access}
              promptCopies={stats.analytics.year.item_copies}
              labels={{
                visits: t('dashboard.visits'),
                uniqueVisitors: t('dashboard.uniqueVisitors'),
                promptAccess: t('dashboard.promptAccess'),
                promptCopies: t('dashboard.promptCopies'),
              }}
            />
          </div>
        </section>
      )}
    </section>
  )
}
