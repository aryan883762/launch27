import {adminRoles} from '@/utils/auth/ability.js'


export const routes = {
    path: '/dashboard/people',
    component: require('@/views/dashboard/people/Default.vue').default,
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
            path: '/dashboard/people/teams/:id',
            name: 'people_teams',
            component: require('@/views/dashboard/people/Teams.vue').default,
            meta: {
                auth: adminRoles,
                breadcrumbs: [
                    {name: 'Dashboard', link: 'dashboard'},
                    {name: 'People', link: 'dashboard_people_appointments'},
                    {name: 'Teams', link: ''}
                ]
            }
        },
        {
            path: '/dashboard/people/address/:id',
            name: 'people_address',
            component: require('@/views/dashboard/people/Address.vue').default,
            meta: {
                auth: adminRoles,
                breadcrumbs: [
                    {name: 'Dashboard', link: 'dashboard'},
                    {name: 'People', link: 'dashboard_people_appointments'},
                    {name: 'Addresses', link: ''}
                ]
            }
        },
        {
            path: '/dashboard/people/notes/:id',
            name: 'people_notes',
            component: require('@/views/dashboard/people/Notes.vue').default,
            meta: {
                auth: adminRoles,
                breadcrumbs: [
                    {name: 'Dashboard', link: 'dashboard'},
                    {name: 'People', link: 'dashboard_people_appointments'},
                    {name: 'Notes', link: ''}
                ]
            }
        },
        {
            path: '/dashboard/people/messages/:id',
            name: 'people_messages',
            component: require('@/views/dashboard/people/Messages.vue').default,
            meta: {
                auth: adminRoles,
                breadcrumbs: [
                    {name: 'Dashboard', link: 'dashboard'},
                    {name: 'People', link: 'dashboard_people_appointments'},
                    {name: 'Messages', link: ''}
                ]
            }
        },
        {
            path: '/dashboard/people/stats/:id',
            name: 'people_stats',
            component: require('@/views/dashboard/people/Stats.vue').default,
            meta: {
                auth: adminRoles,
                breadcrumbs: [
                    {name: 'Dashboard', link: 'dashboard'},
                    {name: 'People', link: 'dashboard_people_appointments'},
                    {name: 'Stats', link: ''}
                ]
            }
        },
        {
            path: '/dashboard/people/appointments/:id',
            name: 'dashboard_people_appointments_update',
            component: require('@/views/dashboard/people/Appointments.vue').default,
            meta: {
                auth: adminRoles,
                breadcrumbs: [
                    {name: 'Dashboard', link: 'dashboard'},
                    {name: 'People', link: 'dashboard_people_appointments'}
                ]
            }
        },
        {
            path: '',
            name: 'dashboard_people_appointments',
            component: require('@/views/dashboard/people/Appointments.vue').default,
            meta: {
                auth: adminRoles,
                breadcrumbs: [
                    {name: 'Dashboard', link: 'dashboard'},
                    {name: 'People', link: 'dashboard_people_appointments'}
                ]
            }
        },
    ]
}


export const quotes = {
    path: '/dashboard/accounts/leads_and_quotes',
    name: 'dashboard_people_leads',
    component: require('@/views/dashboard/people/Quotes.vue').default,
    meta: {
        auth: adminRoles,
        breadcrumbs: [
            {
                name: 'Dashboard',
                link: 'dashboard'
            },
            {
                name: 'People',
                link: 'dashboard_people_appointments'
            },
            {
                name: 'Leads',
                link: ''
            }
        ]
    }
}


export const add_account = {
    path: '/dashboard/accounts/add',
    name: 'dashboard_people_add',
    component: require('@/views/dashboard/people/edit/AddPerson.vue').default,
    meta: {
        breadcrumbs: [
            {
                name: 'Dashboard',
                link: 'dashboard'
            },
            {
                name: 'People',
                link: 'dashboard_people_appointments'
            },
            {
                name: 'New Account',
                link: ''
            }
        ]
    }
}


export const add_team = {
    path: '/dashboard/accounts/add_team',
    name: 'dashboard_people_addteam',
    component: require('@/views/dashboard/people/edit/AddTeam.vue').default,
    meta: {
        breadcrumbs: [
            {
                name: 'Dashboard',
                link: 'dashboard'
            },
            {
                name: 'Add team',
                link: ''
            }
        ]
    }
}

export const list_team = {
    path: '/dashboard/teams',
    name: 'dashboard_teams',
    component: require('@/views/dashboard/people/edit/Teams.vue').default,
    meta: {
        permission: 'manage_team',
        breadcrumbs: [
            {
                name: 'Dashboard',
                link: 'dashboard'
            },
            {
                name: 'Teams',
                link: ''
            }
        ]
    }
}

export const edit_team = {
    path: '/dashboard/accounts/teams/:id/edit',
    name: 'dashboard_people_edit_team',
    component: require('@/views/dashboard/people/edit/AddTeam.vue').default,
    meta: {
        breadcrumbs: [
            {
                name: 'Dashboard',
                link: 'dashboard'
            },
            {
                name: 'Edit Team',
                link: ''
            }
        ]
    }
}


export const edit_account = {
    path: '/dashboard/accounts/:id/edit',
    name: 'dashboard_people_edit',
    component: require('@/views/dashboard/people/edit/AddPerson.vue').default,
    meta: {
        breadcrumbs: [
            {
                name: 'Dashboard',
                link: 'dashboard'
            },
            {
                name: 'People',
                link: 'dashboard_people_appointments'
            },
            {
                name: 'Edit Account',
                link: ''
            }
        ]
    }
}

export const import_accounts = {
    path: '/dashboard/accounts/import',
    name: 'dashboard_people_import',
    component: require('@/views/dashboard/people/Import.vue').default,
    meta: {
        breadcrumbs: [
            {
                name: 'Dashboard',
                link: 'dashboard'
            },
            {
                name: 'People',
                link: 'dashboard_people_appointments'
            },
            {
                name: 'Import',
                link: ''
            }
        ]
    }
}



