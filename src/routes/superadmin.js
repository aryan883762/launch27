'use strict'

import {superAdminRoles} from '@/utils/auth/ability.js'

export const superadmin = {
    path: '/monitor/dashboard',
    component: require('@/views/superadmin/Layout').default,
    meta: {
        auth: superAdminRoles
    },
    children: [
        {
            path: '/monitor',
            redirect: '/monitor/dashboard'
        },
        {
            path: '',
            name: 'superadmin_dashboard',
            component: require('@/views/superadmin/Dashboard.vue').default
        },
        {
            path: '/monitor/administrators',
            name: 'superadmin_administrators',
            component: require('@/views/superadmin/Administrators.vue').default,
            meta: {
                breadcrumbs: [
                    {name: 'Dashboard', link: 'superadmin_dashboard'},
                    {name: 'Administrators', link: ''},
                ]
            }
        },
        {
            path: '/monitor/companies',
            name: 'superadmin_companies',
            component: require('@/views/superadmin/Companies.vue').default,
            meta: {
                breadcrumbs: [
                    {name: 'Dashboard', link: 'superadmin_dashboard'},
                    {name: 'Companies', link: ''},
                ]
            }
        },
        {
            path: '/monitor/tutorials',
            name: 'superadmin_tutorials',
            component: require('@/views/superadmin/Tutorials.vue').default,
            meta: {
                breadcrumbs: [
                    {name: 'Dashboard', link: 'superadmin_dashboard'},
                    {name: 'Tutorials', link: ''},
                ]
            }
        },
        {
            path: '/monitor/plans',
            name: 'superadmin_plans',
            component: require('@/views/superadmin/Plans.vue').default,
            meta: {
                breadcrumbs: [
                    {name: 'Dashboard', link: 'superadmin_dashboard'},
                    {name: 'Plans', link: ''},
                ]
            }
        },
        {
            path: '/monitor/reserved',
            name: 'superadmin_reserved',
            component: require('@/views/superadmin/Reserved.vue').default,
            meta: {
                breadcrumbs: [
                    {name: 'Dashboard', link: 'superadmin_dashboard'},
                    {name: 'Reserved Values', link: ''},
                ]
            }
        },
        {
            path: '/monitor/allowed',
            name: 'superadmin_allowed',
            component: require('@/views/superadmin/Allowed.vue').default,
            meta: {
                breadcrumbs: [
                    {name: 'Dashboard', link: 'superadmin_dashboard'},
                    {name: 'Allowed Values', link: ''},
                ]
            }
        },
        {
            path: '/monitor/system-apps',
            name: 'superadmin_system_apps',
            component: require('@/views/superadmin/SystemApps.vue').default,
            meta: {
                breadcrumbs: [
                    {name: 'Dashboard', link: 'superadmin_dashboard'},
                    {name: 'System Applications', link: ''},
                ]
            }
        },
        {
            path: '/monitor/companies/:id',
            component: require('@/views/superadmin/company/Default.vue').default,
            children: [
                {
                    path: '',
                    name: 'superadmin_companies_general',
                    component: require('@/views/superadmin/company/General.vue').default,
                    meta: {
                        breadcrumbs: [
                            {name: 'Dashboard', link: 'superadmin_dashboard'},
                            {name: 'Companies', link: 'superadmin_companies'},
                            {name: 'General', link: ''}
                        ],
                    }
                },
                {
                    path: '/monitor/companies/:id/accounts',
                    name: 'superadmin_companies_accounts',
                    component: require('@/views/superadmin/company/Accounts.vue').default,
                    meta: {
                        breadcrumbs: [
                            {name: 'Dashboard', link: 'superadmin_dashboard'},
                            {name: 'Companies', link: 'superadmin_companies'},
                            {name: 'Accounts', link: ''}
                        ],
                    }
                },
                {
                    path: '/monitor/companies/:id/charges',
                    name: 'superadmin_companies_charges',
                    component: require('@/views/superadmin/company/Charges.vue').default,
                    meta: {
                        breadcrumbs: [
                            {name: 'Dashboard', link: 'superadmin_dashboard'},
                            {name: 'Companies', link: 'superadmin_companies'},
                            {name: 'Charges', link: ''}
                        ],
                    }
                },
                {
                    path: '/monitor/companies/:id/subscriptions',
                    name: 'superadmin_companies_subscriptions',
                    component: require('@/views/superadmin/company/SubscriptionPayments.vue').default,
                    meta: {
                        breadcrumbs: [
                            {name: 'Dashboard', link: 'superadmin_dashboard'},
                            {name: 'Companies', link: 'superadmin_companies'},
                            {name: 'Subscriptions', link: ''}
                        ],
                    }
                },
                {
                    path: '/monitor/companies/:id/subscriptions/change',
                    name: 'superadmin_companies_subscriptions_change',
                    component: require('@/views/superadmin/company/Subscriptions.vue').default,
                    meta: {
                        breadcrumbs: [
                            {name: 'Dashboard', link: 'superadmin_dashboard'},
                            {name: 'Companies', link: 'superadmin_companies'},
                            {name: 'Subscriptions', link: ''}
                        ],
                    }
                },
                {
                    path: '/monitor/companies/:id/reports',
                    name: 'superadmin_companies_reports',
                    component: require('@/views/superadmin/company/Reports.vue').default,
                    meta: {
                        breadcrumbs: [
                            {name: 'Dashboard', link: 'superadmin_dashboard'},
                            {name: 'Companies', link: 'superadmin_companies'},
                            {name: 'Reports', link: ''}
                        ],
                    }
                },
                {
                    path: '/monitor/companies/:id/cards',
                    name: 'superadmin_companies_cards',
                    component: require('@/views/superadmin/company/Cards.vue').default,
                    meta: {
                        breadcrumbs: [
                            {name: 'Dashboard', link: 'superadmin_dashboard'},
                            {name: 'Companies', link: 'superadmin_companies'},
                            {name: 'Cards', link: ''}
                        ],
                    }
                },
                {
                    path: '/monitor/companies/:id/migration',
                    name: 'superadmin_companies_migration',
                    component: require('@/views/superadmin/company/Migration.vue').default,
                    meta: {
                        breadcrumbs: [
                            {name: 'Dashboard', link: 'superadmin_dashboard'},
                            {name: 'Companies', link: 'superadmin_companies'},
                            {name: 'Migration', link: ''}
                        ],
                    }
                },
                {
                    path: '/monitor/companies/:id/data-migration',
                    name: 'superadmin_companies_data_migration',
                    component: require('@/views/superadmin/company/DataMigration.vue').default,
                    meta: {
                        breadcrumbs: [
                            {name: 'Dashboard', link: 'superadmin_dashboard'},
                            {name: 'Companies', link: 'superadmin_companies'},
                            {name: 'Data Migration', link: ''}
                        ],
                    }
                },
                {
                    path: '/monitor/companies/:id/duplicates',
                    name: 'superadmin_companies_data_duplicates',
                    component: require('@/views/superadmin/company/Cleanup.vue').default,
                    meta: {
                        breadcrumbs: [
                            {name: 'Dashboard', link: 'superadmin_dashboard'},
                            {name: 'Companies', link: 'superadmin_companies'},
                            {name: 'Data Migration', link: ''}
                        ],
                    }
                }
            ]
        },
        {
            path: '/monitor/migration',
            component: require('@/views/superadmin/migration/Default.vue').default,
            children: [
                {
                    path: '',
                    name: 'superadmin_migration_report',
                    component: require('@/views/superadmin/migration/Report.vue').default,
                    meta: {
                        breadcrumbs: [
                            {name: 'Dashboard', link: 'superadmin_dashboard'},
                            {name: 'Migration', link: 'superadmin_migration_report'},
                            {name: 'Report', link: ''}
                        ],
                    }
                },
                {
                    path: '/monitor/migration/edit',
                    name: 'superadmin_migration_edit',
                    component: require('@/views/superadmin/migration/Edit.vue').default,
                    meta: {
                        breadcrumbs: [
                            {name: 'Dashboard', link: 'superadmin_dashboard'},
                            {name: 'Migration', link: 'superadmin_migration_report'},
                            {name: 'Edit', link: ''}
                        ],
                    }
                },
                {
                    path: '/monitor/migration/import',
                    name: 'superadmin_migration_import',
                    component: require('@/views/superadmin/migration/Import.vue').default,
                    meta: {
                        breadcrumbs: [
                            {name: 'Dashboard', link: 'superadmin_dashboard'},
                            {name: 'Migration', link: 'superadmin_migration_report'},
                            {name: 'Import', link: ''}
                        ],
                    }
                },
                {
                    path: '/monitor/migration/tokens',
                    name: 'superadmin_migration_tokens',
                    component: require('@/views/superadmin/migration/Tokens.vue').default,
                    meta: {
                        breadcrumbs: [
                            {name: 'Dashboard', link: 'superadmin_dashboard'},
                            {name: 'Migration', link: 'superadmin_migration_report'},
                            {name: 'Tokens Transfer', link: ''}
                        ],
                    }
                }
            ]
        },
    ]
};
