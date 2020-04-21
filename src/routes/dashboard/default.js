import {adminRoles} from '@/utils/auth/ability.js'

export const default_route = {
  path: '',
  name: 'dashboard',
  component: require('@/views/dashboard/Dashboard.vue').default,
  meta: {
    auth: adminRoles,
    breadcrumbs: [
      {
        name: 'Dashboard',
        link: 'dashboard'
      }
    ]
  }
}

export const invitations = {
  path: '/dashboard/invitations',
  name: 'dashboard_invitations',
  component: require('@/views/dashboard/Invitations.vue').default,
  meta: {
    permission: 'manage_team_invitation',
    breadcrumbs: [
      {
        name: 'Dashboard',
        link: 'dashboard'
      },
      {
        name: 'Invitations',
        link: ''
      }
    ]
  }
}
