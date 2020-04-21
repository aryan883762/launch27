import { adminRoles } from '@/utils/auth/ability.js'

export const routes = {
  path: '/dashboard/booking/:id/:service_date/view',
    name: 'dashboard_booking_view',
    component: require('@/views/dashboard/BookingView.vue').default,
    meta: {
    breadcrumbs: [
      {
        name: 'Dashboard',
        link: 'dashboard'
      },
      {
        name: 'Calendar',
        link: 'dashboard_calendar_spots'
      },
      {
        name: 'Booking',
        link: ''
      }
    ]
  }
}
