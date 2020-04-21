import {adminRoles} from '@/utils/auth/ability.js'


export const routes =   {
  path: '/dashboard/charges',
  name: 'dashboard_charges',
  component: require('@/views/dashboard/Charges.vue').default,
  meta: {
    permission: 'charge_customer',
    breadcrumbs: [
      {
        name: 'Dashboard',
        link: 'dashboard'
      },
      {
        name: 'Charges',
        link: ''
      }
    ]
  }
}
