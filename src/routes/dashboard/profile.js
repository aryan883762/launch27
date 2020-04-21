import {adminRoles} from '@/utils/auth/ability.js'


export const routes = {
    path: '/dashboard/profile',
    component: require('@/views/dashboard/people/Profile.vue').default,
    meta: {
        breadcrumbs: [
            {
                name: 'Dashboard',
                link: 'dashboard'
            },
            {
                name: 'People',
                link: ''
            }
        ]
    },
    children: [
        {
            path: '/dashboard/profile/:id/teams',
            name: 'profile_teams',
            component: require('@/views/dashboard/people/Teams.vue').default,
            meta: {
                auth: adminRoles,
                breadcrumbs: [
                    {name: 'Dashboard', link: 'dashboard'},
                    {name: 'People', link: ''},
                    {name: 'Teams', link: ''}
                ]
            }
        },
        {
            path: '/dashboard/profile/:id/address',
            name: 'profile_address',
            component: require('@/views/dashboard/people/Address.vue').default,
            meta: {
                auth: adminRoles,
                breadcrumbs: [
                    {name: 'Dashboard', link: 'dashboard'},
                    {name: 'People', link: ''},
                    {name: 'Addresses', link: ''}
                ]
            }
        },
        {
            path: '/dashboard/profile/:id/notes',
            name: 'profile_notes',
            component: require('@/views/dashboard/people/Notes.vue').default,
            meta: {
                auth: adminRoles,
                breadcrumbs: [
                    {name: 'Dashboard', link: 'dashboard'},
                    {name: 'People', link: ''},
                    {name: 'Notes', link: ''}
                ]
            }
        },
        {
            path: '/dashboard/profile/:id/messages',
            name: 'profile_messages',
            component: require('@/views/dashboard/people/Messages.vue').default,
            meta: {
                auth: adminRoles,
                breadcrumbs: [
                    {name: 'Dashboard', link: 'dashboard'},
                    {name: 'People', link: ''},
                    {name: 'Messages', link: ''}
                ]
            }
        },
        {
            path: '/dashboard/profile/:id/stats',
            name: 'profile_stats',
            component: require('@/views/dashboard/people/Stats.vue').default,
            meta: {
                auth: adminRoles,
                breadcrumbs: [
                    {name: 'Dashboard', link: 'dashboard'},
                    {name: 'People', link: ''},
                    {name: 'Stats', link: ''}
                ]
            }
        },
        {
            path: '/dashboard/profile/:id',
            name: 'dashboard_profile_appointments',
            component: require('@/views/dashboard/people/Appointments.vue').default,
            meta: {
                auth: adminRoles,
                breadcrumbs: [
                    {name: 'Dashboard', link: 'dashboard'},
                    {name: 'People', link: ''}
                ]
            }
        },
    ]
}


export const edit_account = {
    path: '/dashboard/profile/:id/edit',
    name: 'dashboard_profile_edit',
    component: require('@/views/dashboard/people/edit/AddPerson.vue').default,
    meta: {
        breadcrumbs: [
            {
                name: 'Dashboard',
                link: 'dashboard'
            },
            {
                name: 'People',
                link: 'dashboard_people'
            },
            {
                name: 'Manage',
                link: ''
            }
        ]
    }
}



