import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-20 text-foreground">
      <section className="w-full max-w-xl text-center">
        <div
          className="text-8xl font-bold tracking-tighter sm:text-9xl"
          aria-hidden="true"
        >
          404
        </div>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
          {t('notFound.title')}
        </h1>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
          {t('notFound.description')}
        </p>

        <Link
          to="/admin"
          className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {t('notFound.button')}
          <ArrowRight className="size-4 rtl:rotate-180" />
        </Link>
      </section>
    </main>
  )
}
