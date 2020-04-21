import {adminRoles} from '@/utils/auth/ability.js'

export const routes = {
  path: '/dashboard/booking/:id/:service_date/workdiary',
  name: 'dashboard_booking_workdiary',
  component: require('@/views/dashboard/BookingWorkDiary.vue').default,
  meta: {
    breadcrumbs: [
      {
        name: 'Dashboard',
        link: 'dashboard'
      },
      {
        name: 'Timelogs',
        link: 'dashboard_time_logs'
      },
      {
        name: 'Workdiary',
        link: ''
      }
    ]
  }
}
