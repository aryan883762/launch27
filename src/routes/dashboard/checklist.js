import {adminRoles} from '@/utils/auth/ability.js'


export const create = {
  path: '/dashboard/checklists/create',
  name: 'dashboard_checklists_create',
  component: require('@/views/dashboard/checklists/CreateChecklistModal.vue').default,
  meta: {
    permission: 'manage_checklist',
    breadcrumbs: [
      {
        name: 'Dashboard',
        link: 'dashboard'
      },
      {
        name: 'Checklists',
        link: 'dashboard_checklists'
      },
      {
        name: 'Add Checklist',
        link: ''
      }
    ]
  }
}


export const list = {
  path: '/dashboard/checklists',
  name: 'dashboard_checklists',
  component: require('@/views/dashboard/checklists/ListChecklists.vue').default,
  meta: {
    permission: 'manage_checklist',
    breadcrumbs: [
      {
        name: 'Dashboard',
        link: 'dashboard'
      },
      {
        name: 'Checklists',
        link: ''
      }
    ]
  }
}


export const edit_checklist = {
  path: '/dashboard/checklists/:id/edit',
  name: 'dashboard_checklists_edit',
  component: require('@/views/dashboard/checklists/CreateChecklistModal.vue').default,
  meta: {
    permission: 'manage_checklist',
    breadcrumbs: [
      {
        name: 'Dashboard',
        link: 'dashboard'
      },
      {
        name: 'Checklists',
        link: 'dashboard_checklists'
      },
      {
        name: 'Edit Checklist',
        link: ''
      }
    ]
  }
}

export const checklist_tasks = {
  path: '/dashboard/checklists/:id/tasks',
  name: 'dashboard_checklists_tasks',
  component: require('@/views/dashboard/checklists/CreateChecklistTaskModal.vue').default,
  meta: {
    permission: 'manage_checklist',
    breadcrumbs: [
      {
        name: 'Dashboard',
        link: 'dashboard'
      },
      {
        name: 'Checklists',
        link: 'dashboard_checklists'
      },
      {
        name: 'Add Tasks',
        link: ''
      }
    ]
  }
}


