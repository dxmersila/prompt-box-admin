export interface DashboardAnalyticsPeriod {
  visits: number
  unique_visitors: number
  item_access: number
  item_copies: number
}

export interface DashboardStats {
  users_count: number
  items_count: number
  categories_count: number
  analytics: {
    today: DashboardAnalyticsPeriod
    week: DashboardAnalyticsPeriod
    month: DashboardAnalyticsPeriod
    year: DashboardAnalyticsPeriod
  }
}
