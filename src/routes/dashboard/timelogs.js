import {adminRoles} from '@/utils/auth/ability.js'

export const routes = {
  path: '/dashboard/timelogs',
  name: 'dashboard_timelogs',
  component: require('@/views/dashboard/TimeLogs.vue').default,
  meta: {
    permission: 'timesheets',
    breadcrumbs: [
      {
        name: 'Dashboard',
        link: 'dashboard'
      },
      {
        name: 'Time logs',
        link: ''
      }
    ]
  }
}
