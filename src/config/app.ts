export type AppLocale = 'fa' | 'en'
export type AppTheme = 'light' | 'dark' | 'system'

interface AppConfig {
  name: string
  defaultLocale: AppLocale
  defaultTheme: AppTheme
}

export const appConfig: AppConfig = {
  name: 'Prompt Box Admin',
  defaultLocale: 'fa',
  defaultTheme: 'dark',
}
