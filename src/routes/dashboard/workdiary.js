import {adminRoles} from '@/utils/auth/ability.js'

export const routes = {
    path: '/dashboard/workdiary',
    name: 'dashboard_workdiary',
    component: require('@/views/dashboard/WorkDiary.vue').default,
    meta: {
        breadcrumbs: [
            {
                name: 'Dashboard',
                link: 'dashboard'
            },
            {
                name: 'Workdiary',
                link: ''
            }
        ]
    },
    children: [
        {
            path: '/dashboard/workdiary/:id/:service_date/booking',
            name: 'dashboard_workdiary_booking',
            component: require('@/views/dashboard/BookingWorkDiary.vue').default,
            meta: {
                breadcrumbs: [
                    {
                        name: 'Dashboard',
                        link: 'dashboard'
                    },
                    {
                        name: 'Workdiary',
                        link: 'dashboard_workdiary'
                    },
                    {
                        name: 'Booking',
                        link: ''
                    }
                ]
            }
        }
    ]
}
