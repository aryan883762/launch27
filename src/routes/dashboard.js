'use strict'

import {adminRoles} from '@/utils/auth/ability.js'
import * as apps from './dashboard/apps'
import * as workdiary from './dashboard/workdiary'
import * as defaults from './dashboard/default.js'
import * as booking_workdiary from './dashboard/booking_workdiary'
import * as timelogs from './dashboard/timelogs'
import * as calendar from './dashboard/calendar'
import * as create_booking from './dashboard/create_booking'
import * as booking_view from './dashboard/booking_view'
import * as inbox from './dashboard/inbox'
import * as getting_started from './dashboard/getting_started'
import * as people from './dashboard/people'
import * as checklist from './dashboard/checklist'
import * as settings from './dashboard/settings'
import * as emails from './dashboard/email_preferences'
import * as sms from './dashboard/sms_preferences'
import * as wages from './dashboard/wages'
import * as charges from './dashboard/charges'
import * as profile from './dashboard/profile'
import * as reports from './dashboard/reports'

export const dashboard = {
    path: '/dashboard',
    component: require('@/views/dashboard/DashboardLayout').default,
    meta: {
        auth: adminRoles
    },
    children: [
        defaults.default_route,
        defaults.invitations,
        workdiary.routes,
        booking_workdiary.routes,
        timelogs.routes,
        calendar.routes,
        create_booking.routes,
        booking_view.routes,
        getting_started.routes,
        inbox.routes,
        people.routes,
        people.quotes,
        people.add_account,
        people.add_team,
        people.list_team,
        people.edit_account,
        people.edit_team,
        people.import_accounts,
        profile.routes,
        profile.edit_account,
        checklist.list,
        checklist.create,
        checklist.checklist_tasks,
        checklist.edit_checklist,
        settings.settings,
        settings.account,
        settings.services,
        settings.emails,
        settings.add_service,
        settings.edit_service,
        settings.add_extra,
        settings.edit_extra,
        settings.add_frequency,
        settings.edit_frequency,
        settings.locations,
        settings.general,
        settings.plan_popup,
        settings.policies,
        settings.roles,
        settings.booking_spot,
        settings.migration,
        settings.invites,
        settings.wages,
        settings.sales_tax,
        settings.sales_tax_report,
        settings.promotions,
        settings.payment_setup,
        settings.apps,
        settings.booking_form,
        settings.audit,
        settings.sms_setup,
        settings.scheduled_tasks,
        settings.quote,
        settings.tags,
        settings.emails,
        settings.manage_apis,
        settings.embedded_url,
        apps.gift_card_routes,
        apps.campaign_routes,
        apps.campaign_list_routes,
        apps.review_redirect_routes,
        apps.shift_clock_routes,
        apps.google_analytics,
        emails.routes,
        wages.wages,
        wages.team_wages,
        charges.routes,
        sms.routes,
        reports.routes
    ]
}
