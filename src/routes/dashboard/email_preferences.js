export const routes = {
  path: '/dashboard/email_preferences/:id',
  name: 'dashboard_email_preferences',
  component: require('@/views/modals/EmailPreferences.vue').default,
  meta: {
    permission: 'general_settings'
  }
}
