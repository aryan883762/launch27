import {adminRoles} from '@/utils/auth/ability.js'


export const routes = {
  path: '/dashboard/booking',
  component: require('@/views/modals/CreateBooking.vue').default,
  meta: {
    permission: 'manage_appointment'
  },
  children: [
    {
      path: '',
      name: 'dashboard_booking_new',
      component: require('@/views/modals/booking_form/AddAppointment.vue').default,
      meta: {
        permission: 'manage_appointment'
      },
    },
    {
      path: '/dashboard/booking/event',
      name: 'dashboard_booking_event',
      component: require('@/views/modals/booking_form/AddEvent.vue').default,
      meta: {
        permission: 'manage_appointment'
      },
    },
    {
      path: '/dashboard/booking/:id/edit',
      name: 'dashboard_booking_edit',
      component: require('@/views/modals/booking_form/AddAppointment.vue').default,
      meta: {
        permission: 'view_appointment'
      }
    }
  ]
}
