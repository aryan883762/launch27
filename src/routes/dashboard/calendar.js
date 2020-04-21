import {adminRoles} from '@/utils/auth/ability.js'

export const routes = {
    path: '/dashboard/scheduler',
    component: require('@/views/dashboard/calendar/Default.vue').default,
    meta: {
        permission: 'view_appointment',
        breadcrumbs: [
            {
                name: 'Dashboard',
                link: 'dashboard'
            },
            {
                name: 'Calendar',
                link: ''
            }
        ]
    },
    children: [
        {
            component: require('@/views/dashboard/calendar/Schedule.vue').default,
            name: 'dashboard_calendar_schedule',
            path: '/dashboard/scheduler/schedule',
            meta: {
                breadcrumbs: [
                    {
                        name: 'Dashboard',
                        link: 'dashboard'
                    },
                    {
                        name: 'Schedule',
                        link: ''
                    }
                ]
            }
        },
        {
            component: require('@/views/dashboard/calendar/Customers.vue').default,
            name: 'dashboard_calendar_customers',
            path: '/dashboard/scheduler/customers',
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
                        name: 'Customers',
                        link: ''
                    }
                ]
            }
        },
        {
            component: require('@/views/dashboard/calendar/Teams.vue').default,
            name: 'dashboard_calendar_teams',
            path: '/dashboard/scheduler/teams',
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
                        name: 'Teams',
                        link: ''
                    }
                ]
            }
        },
        {
            name: 'dashboard_calendar_list',
            path: '/dashboard/scheduler/list',
            component: require('@/views/dashboard/calendar/CalendarList.vue').default,
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
                        name: 'List',
                        link: ''
                    }
                ]
            }
        },
        {
            name: 'dashboard_calendar_map',
            path: '/dashboard/scheduler/map',
            component: require('@/views/dashboard/calendar/CalendarMap.vue').default,
            meta: {
                breadcrumbs: [
                    {
                        name: 'Dashboard',
                        link: 'dashboard'
                    },
                    {
                        name: 'Calendar',
                        link: 'dashboard_calendar_schedule'
                    },
                    {
                        name: 'List',
                        link: ''
                    }
                ]
            }
        }
    ]
}
