import {adminRoles} from '@/utils/auth/ability.js'
import * as spots from "../spots";

export const settings = {
    path: '/dashboard/settings',
    name: 'dashboard_settings',
    component: require('@/views/dashboard/Settings.vue').default,
    meta: {
        breadcrumbs: [
            {
                name: 'Dashboard',
                link: 'dashboard'
            },
            {
                name: 'Settings',
                link: ''
            }
        ]
    }
}


export const account = {
    path: '/dashboard/settings/account',
    name: 'dashboard_settings_account',
    component: require('@/views/modals/Account.vue').default,
    meta: {
        permission: 'general_settings'
    }
}


export const services = {
    path: '/dashboard/settings/services',
    component: require('@/views/modals/services/Default.vue').default,
    meta: {
        permission: 'manage_services'
    },
    children: [
        {
            path: '/dashboard/settings/services/frequencies',
            name: 'dashboard_settings_services_frequencies',
            component: require('@/views/modals/services/ListFrequencies.vue').default
        },
        {
            path: '/dashboard/settings/services/extras',
            name: 'dashboard_settings_services_extras',
            component: require('@/views/modals/services/ListExtras.vue').default
        },
        {
            path: '/dashboard/settings/services/pricing_variables',
            name: 'dashboard_settings_services_pricing',
            component: require('@/views/modals/services/ListParameters.vue').default
        },
        {
            path: '/dashboard/settings/services/categories',
            name: 'dashboard_settings_services_categories',
            component: require('@/views/modals/services/ListCategories.vue').default
        },
        {
            path: '',
            name: 'dashboard_settings_services_list',
            component: require('@/views/modals/services/ListServices.vue').default
        }
    ]
}

export const add_service = {
    path: '/dashboard/settings/services/add',
    name: 'dashboard_settings_services_add',
    component: require('@/views/modals/services/Create.vue').default
}

export const edit_service = {
    path: '/dashboard/settings/services/:id/edit',
    name: 'dashboard_settings_services_edit',
    component: require('@/views/modals/services/Create.vue').default
}

export const add_extra = {
    path: '/dashboard/settings/services/extra/add',
    name: 'dashboard_settings_extra_add',
    component: require('@/views/modals/services/CreateExtra.vue').default
}

export const edit_extra = {
    path: '/dashboard/settings/services/extra/:id/edit',
    name: 'dashboard_settings_extra_edit',
    component: require('@/views/modals/services/CreateExtra.vue').default
}

export const add_frequency = {
    path: '/dashboard/settings/services/frequency/add',
    name: 'dashboard_settings_frequency_add',
    component: require('@/views/modals/services/CreateFrequency.vue').default
}

export const edit_frequency = {
    path: '/dashboard/settings/services/frequency/:id/edit',
    name: 'dashboard_settings_frequency_edit',
    component: require('@/views/modals/services/CreateFrequency.vue').default
}

export const locations = {
    path: '/dashboard/settings/locations',
    name: 'dashboard_settings_locations',
    component: require('@/views/modals/Locations.vue').default,
    meta: {
        permission: 'general_settings'
    }
}

export const general = {
    path: '/dashboard/settings/company/general',
    name: 'dashboard_settings_company_general',
    component: require('@/views/modals/CompanyGeneral.vue').default,
    meta: {
        permission: 'general_settings'
    }
}
export const plan_popup = {
    path: '/dashboard/settings/plan_popup',
    name: 'dashboard_settings_plan_popup',
    component: require('@/views/modals/PlanPopup.vue').default,
    meta: {
        permission: 'general_settings'
    }
}

export const policies = {
    path: '/dashboard/settings/company/settings-and-policies',
    name: 'dashboard_settings_company_policies',
    component: require('@/views/modals/Policies.vue').default
}

export const roles = {
    path: '/dashboard/settings/company/roles',
    name: 'dashboard_settings_company_roles',
    component: require('@/views/modals/Roles.vue').default,
    meta: {
        permission: 'manage_team'
    }
}

export const booking_spot = {
    path: '/dashboard/settings/booking_spot',
    name: 'dashboard_settings_booking_spots',
    component: require('@/views/modals/spots/BookingSpot.vue').default,
    meta: {
        permission: 'general_settings'
    },
    children: [
        {
            path: '/dashboard/settings/booking_spot/setup',
            name: 'dashboard_settings_booking_spots_setup',
            component: require('@/views/modals/spots/Setup.vue').default,
            meta: {
                auth: adminRoles
            },
        },
        {
            path: '/dashboard/settings/booking_spot/holidays',
            name: 'dashboard_settings_booking_spots_holidays',
            component: require('@/views/modals/spots/Holidays.vue').default,
            meta: {
                auth: adminRoles
            },
        },
        {
            path: '/dashboard/settings/booking_spot/daily',
            name: 'dashboard_settings_booking_spots_daily',
            component: require('@/views/modals/spots/Daily.vue').default,
            meta: {
                auth: adminRoles
            },
        },

        {
            path: '/dashboard/settings/booking_spot/availability',
            name: 'dashboard_settings_booking_spots_availability',
            component: require('@/views/modals/spots/Availability.vue').default,
            meta: {
                auth: adminRoles
            }
        },

    ]

}

export const migration = {
    path: '/dashboard/settings/migrations',
    name: 'dashboard_settings_migration',
    component: require('@/views/modals/ETLMigration.vue').default
}

export const invites = {
    path: '/dashboard/people/invite',
    name: 'dashboard_people_invite',
    component: require('@/views/modals/Invitations.vue').default
}

export const wages = {
    path: '/dashboard/settings/wages',
    name: 'dashboard_settings_wages',
    component: require('@/views/modals/Wages.vue').default,
    meta: {
        permission: 'manage_wages',
        breadcrumbs: [
            {
                name: 'Dashboard',
                link: 'dashboard'
            },
            {
                name: 'Wages',
                link: 'dashboard_wages'
            }
        ]
    }
}


export const sales_tax = {
    path: '/dashboard/settings/sales-tax',
    name: 'dashboard_settings_sales_tax',
    component: require('@/views/modals/tax/Taxes.vue').default
}

export const sales_tax_report = {
    path: '/dashboard/settings/sales-tax/:id/report',
    name: 'dashboard_settings_sales_tax_report',
    component: require('@/views/modals/tax/TaxReport.vue').default
}


export const promotions = {
    path: '/dashboard/settings/promotions',
    name: 'dashboard_settings_promotions',
    component: require('@/views/modals/promotions/Default.vue').default,
    meta: {
        permission: ['manage_discounts', 'plan_discount_code']
    },
    children: [
        {
            path: '/dashboard/settings/promotions/create',
            name: 'dashboard_settings_promotions_create',
            component: require('@/views/modals/promotions/Create.vue').default,
            meta: {
                permission: ['manage_discounts', 'plan_discount_code']
            },
        },
        {
            path: '/dashboard/settings/promotions/:id/edit',
            name: 'dashboard_settings_promotions_edit',
            component: require('@/views/modals/promotions/Create.vue').default,
            meta: {
                permission: ['manage_discounts', 'plan_discount_code']
            },
        },
        {
            path: '/dashboard/settings/promotions/list',
            name: 'dashboard_settings_promotions_list',
            component: require('@/views/modals/promotions/List.vue').default,
            meta: {
                permission: ['manage_discounts', 'plan_discount_code']
            },
        },
        {
            path: '/dashboard/settings/promotions/:id/redeemed',
            name: 'dashboard_settings_promotions_redeem',
            component: require('@/views/modals/promotions/Redeemed.vue').default,
            meta: {
                permission: ['manage_discounts', 'plan_discount_code']
            },
        }
    ]
}

export const payment_setup = {
    path: '/dashboard/settings/payments-setup',
    name: 'dashboard_settings_payments_setup',
    component: require('@/views/modals/PaymentsSetup.vue').default,
    meta: {
        permission: 'billing'
    }
}

export const apps = {
    path: '/dashboard/apps',
    name: 'dashboard_apps',
    component: require('@/views/dashboard/Apps.vue').default,
    meta: {
        permission: 'manage_apps',
        breadcrumbs: [
            {
                name: 'Dashboard',
                link: 'dashboard'
            },
            {
                name: 'Apps',
                link: ''
            }
        ]
    }
}

export const booking_form = {
    path: '/dashboard/settings/booking_form',
    name: 'dashboard_settings_booking_form',
    component: require('@/views/modals/BookingForm.vue').default,
    meta: {
        permission: ['configure_booking_form', 'plan_booking_form']
    }
}

export const audit = {
    path: '/dashboard/settings/audit',
    name: 'dashboard_settings_audit',
    component: require('@/views/dashboard/Audit.vue').default,
    meta: {
        permission: 'view_revision'
    }
}

export const emails = {
    path: '/dashboard/settings/emails',
    name: 'dashboard_settings_emails',
    component: require('@/views/modals/Emails.vue').default,
    meta: {
        permission: ['manage_email', 'plan_email_text_alert']
    }
}

export const sms_setup = {
    path: '/dashboard/settings/sms-setup',
    name: 'dashboard_settings_sms',
    component: require('@/views/modals/SMS.vue').default,
    meta: {
        permission: ['manage_email', 'plan_email_text_alert']
    }
}

export const scheduled_tasks = {
    path: '/dashboard/settings/scheduled-tasks',
    name: 'dashboard_settings_scheduled_tasks',
    component: require('@/views/modals/ScheduledTasks.vue').default,
    meta: {
        permission: ['plan_scheduler']
    }
}

export const quote = {
    path: '/dashboard/settings/quote',
    name: 'dashboard_settings_quote',
    component: require('@/views/modals/QuoteForm.vue').default
}

export const tags = {
    path: '/dashboard/settings/tags',
    component: require('@/views/dashboard/Tags.vue').default,
    meta: {
        breadcrumbs: [
            {
                name: 'Dashboard',
                link: 'dashboard'
            },
            {
                name: 'Settings',
                link: 'dashboard_settings'
            },
            {
                name: 'Tags',
                link: ''
            }
        ]
    },
    children: [
        {
            path: '/dashboard/settings/tags/:id',
            component: require('@/views/dashboard/TagDetail.vue').default,
            name: "dashboard_settings_tag_detail"
        },
        {
            path: '',
            component: require('@/views/dashboard/TagDetail.vue').default,
            name: 'dashboard_settings_tags',
        }
    ]
}

export const manage_apis = {
    path: '/dashboard/settings/api-keys',
    name: 'dashboard_settings_api',
    component: require('@/views/modals/ManageApi.vue').default,
    meta: {
        permission: 'api_keys'
    }
}

export const embedded_url = {
    path: '/dashboard/settings/embedded_url',
    name: 'dashboard_settings_embedded_url',
    component: require('@/views/modals/EmbeddedUrl.vue').default
}





