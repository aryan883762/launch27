export const routes = {
  path: '/dashboard/sms_preferences/:id',
  name: 'dashboard_sms_preferences',
  component: require('@/views/modals/EmailPreferences.vue').default,
  meta: {
    permission: 'general_settings',
    sms_preferences: true
  }
}
