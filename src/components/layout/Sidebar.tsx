import { LogOut, User, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, useNavigate } from 'react-router'
import { appConfig } from '../../config/app'
import { useAuth } from '../../auth/useAuth'
import Spinner from '../ui/feedback/Spinner'

import { adminNavigation } from './navigation'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    if (isLoggingOut) {
      return
    }

    setIsLoggingOut(true)

    try {
      await logout()
      navigate('/login', { replace: true })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label={t('common.close')}
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={[
          'fixed inset-y-0 start-0 z-50 flex w-64 shrink-0 flex-col border-e border-border bg-surface',
          'transition-transform duration-200 ease-out',
          isOpen
            ? 'translate-x-0'
            : 'max-lg:rtl:translate-x-full max-lg:ltr:-translate-x-full',
          'lg:z-50',
        ].join(' ')}
      >
        <div className="flex min-h-16 items-center justify-between border-b border-border px-6 py-4">
          <h1 className="text-lg font-semibold text-foreground">
            {appConfig.name}
          </h1>

          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            title={t('common.close')}
            className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground lg:hidden"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {adminNavigation.map((item) => {
              const Icon = item.icon

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end
                  onClick={onClose}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition',
                      isActive
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    ].join(' ')
                  }
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{t(`navigation.${item.key}`)}</span>
                </NavLink>
              )
            })}
        </nav>

        <div className="border-t border-border p-4">
          <div className="mb-3 flex items-center gap-3 min-w-0">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <User className="size-4" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {user?.name}
              </p>

              <p className="truncate text-xs text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut className="size-4" />

            {isLoggingOut && <Spinner size="sm" />}

            <span>
              {t('common.logout')}
            </span>
          </button>
        </div>
      </aside>
    </>
  )
}
