import Vue from 'vue'
import Router from 'vue-router'
import * as auth from './auth.js'
import * as onboarding from './onboarding.js'
import * as dashboard from './dashboard.js'
import * as customer from './customer.js'
import * as team from './team.js'
import * as anonymous from './anonymous.js'
import * as superadmin from './superadmin.js'
import {teamRoles} from '@/utils/auth/ability.js'
import * as print from './print'

Vue.use(Router)

export default new Router({
    mode: 'history',
    routes: [
        {
            path: '/',
            name: 'landing_page',
            meta: {},
            component: () => {
                if (Vue.prototype.$subdomain && Vue.prototype.$subdomain.name != 'default' && !Vue.prototype.$auth.check()) {
                    return import('@/views/anonymous/BookingForm.vue');
                } else {
                    return import('@/views/LandingPage.vue');
                }
            },
        },
        auth.login,
        auth.signup,
        auth.reset,
        auth.reset_password,
        auth.missing,
        auth.forbidden,
        auth.critical,
        auth.plan_error,
        onboarding.onboarding,
        dashboard.dashboard,
        customer.customer,
        team.team,
        anonymous.anonymous,
        superadmin.superadmin,
        {
            path: '/user/signup',
            meta: {
                // auth: {
                //     roles: ['business_admin']
                // }
            },
            component: require('@/views/auth/UserSignUp.vue').default
        },
        {
            path: '/team/signup/availability',
            name: 'team_signup_availability',
            component: require('@/views/team/SignupAvailability.vue').default,
            meta: {
                auth: teamRoles
            }
        },
        {
            path: '/bf/:id',
            name: 'booking-form',
            component: require('@/views/anonymous/BookingForm.vue').default,
        },
        {
            path: '/qf/:id',
            name: 'quote-form',
            component: require('@/views/anonymous/BookingForm.vue').default,
        },
        print.routes,
        anonymous.anonymous_rating
    ],
    scrollBehavior() {
        let el = document.getElementById('content_level_2')
        if (el)
            document.getElementById('content_level_2').scrollIntoView();
    }
})
