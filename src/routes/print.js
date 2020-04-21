'use strict'

import {adminRoles} from '@/utils/auth/ability.js'

export const routes = {
    path: '',
    component: require('@/views/print/PrintLayout.vue').default,
    children: [
        {
            path: '/print/teams',
            name: 'print_team_schedule',
            component: require('@/views/print/PrintSchedule.vue').default,
            meta: {
            }
        },
        {
            path: '',
            name: 'print_staff_schedule',
            component: require('@/views/print/StaffSchedule.vue').default,
            meta: {
            }
        }
    ]

}
