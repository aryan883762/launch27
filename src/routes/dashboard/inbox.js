import { adminRoles } from '@/utils/auth/ability.js'

export const routes = {
  path: '/dashboard/inbox',
  name: 'dashboard_inbox',
  component: require('@/views/dashboard/Inbox.vue').default
}
