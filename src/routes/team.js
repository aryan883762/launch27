'use strict'

import {teamRoles} from '@/utils/auth/ability.js'

export const team = {
    path: '/team/dashboard',
    component: require('@/views/team/Layout').default,
    meta: {
        auth: teamRoles
    },
    children: [
        {
            path: '/team',
            redirect: '/team/dashboard'
        },
        {
            path: '',
            name: 'team_dashboard',
            component: require('@/views/team/Dashboard.vue').default
        },

        // {
        //     path: '/team/bookings/calendar',
        //     component: require('@/views/dashboard/calendar/Calendar.vue').default,
        //     meta: {
        //         breadcrumbs: [
        //             {name: 'Dashboard', link: 'team_dashboard'},
        //             {name: 'Bookings', link: ''},
        //         ]
        //     },
        //     children: [
        //         {
        //             path: '',
        //             name: 'team_bookings_spot',
        //             component: require('@/views/dashboard/calendar/Spots.vue').default,
        //             meta: {
        //                 breadcrumbs: [
        //                     {name: 'Dashboard', link: 'team_dashboard'},
        //                     {name: 'Calendar', link: ''},
        //                 ]
        //             }
        //         },
        //         {
        //             path: '/team/bookings/calendar/list',
        //             name: 'team_bookings_list',
        //             component: require('@/views/dashboard/calendar/List.vue').default,
        //             meta: {
        //                 breadcrumbs: [
        //                     {name: 'Dashboard', link: 'team_dashboard'},
        //                     {name: 'Calendar', link: 'team_bookings_spot'},
        //                     {name: 'List', link: ''},
        //                 ]
        //             }
        //         }
        //     ]
        // },

        {
            path: '/team/profile',
            name: 'team_profile',
            component: require('@/views/team/Profile.vue').default,
            children: []
        },

        {
            path: '/team/timelogs',
            name: 'team_timelogs',
            component: require('@/views/dashboard/TimeLogs.vue').default,
            meta: {
                breadcrumbs: [
                    {name: 'Dashboard', link: 'team_dashboard'},
                    {name: 'Timelogs', link: ''}
                ]
            }
        },

        {
            path: '/team/bookings',
            name: 'team_bookings_list',
            component: require('@/views/dashboard/calendar/CalendarList.vue').default,
            meta: {
                breadcrumbs: [
                    { name: 'Dashboard', link: 'team_dashboard' },
                    { name: 'Bookings', link: '' }
                ],
            }
        },

        {
            path: '/team/bookings/:id/:service_date/workdiary',
            name: 'team_bookings_workdiary',
            component: require('@/views/dashboard/BookingWorkDiary.vue').default,
            meta: {
                breadcrumbs: [
                    {name: 'Dashboard', link: 'team_dashboard'},
                    {name: 'Timelogs', link: 'team_timelogs'},
                    {name: 'Workdiary', link: ''},
                ],
            }
        },

        {
            path: '/team/bookings/:id/:service_date/view',
            name: 'team_bookings_view',
            component: require('@/views/dashboard/BookingView.vue').default,
            meta: {
                auth: true,
                breadcrumbs: [
                    {name: 'Dashboard', link: 'team_dashboard'},
                    // {name: 'Calendar', link: 'team_bookings_spot'},
                    {name: 'Booking', link: ''}
                ]
            }
        },

        {
            path: '/team/messages',
            name: 'team_messages',
            component: require('@/views/dashboard/Inbox.vue').default,
            meta: {
                breadcrumbs: [
                    {name: 'Dashboard', link: 'team_dashboard'},
                    {name: 'Messages', link: ''}
                ]
            }
        },

        {
            path: '/team/availability',
            name: 'team_availability',
            component: require('@/views/team/Availability.vue').default,
            meta: {
                breadcrumbs: [
                    {name: 'Dashboard', link: 'team_dashboard'},
                    {name: 'Availability', link: ''}
                ]
            }
        },

        {
            path: '/team/invitations',
            name: 'team_invitation',
            component: require('@/views/dashboard/Invitations.vue').default,
            meta: {
                breadcrumbs: [
                    {name: 'Dashboard', link: 'team_dashboard'},
                    {name: 'Invitations', link: ''}
                ]
            }
        },

        {
            path: '/team/workdiary',
            name: 'team_workdiary',
            component: require('@/views/dashboard/WorkDiary.vue').default,
            meta: {
                breadcrumbs: [
                    {name: 'Dashboard', link: 'team_dashboard'},
                    {name: 'Workdiary', link: ''}
                ]
            },
            children: [
                {
                    path: '/team/workdiary/:id/:service_date/booking',
                    name: 'team_workdiary_booking',
                    component: require('@/views/dashboard/BookingWorkDiary.vue').default,
                    meta: {
                        breadcrumbs: [
                            {name: 'Dashboard', link: 'team_dashboard'},
                            {name: 'Workdiary', link: 'team_workdiary'},
                            {name: 'Booking', link: ''}
                        ]
                    }
                }
            ]
        }
    ]
};
