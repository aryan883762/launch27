'use strict'

import Vue from 'vue'
import router from '@/routes'
import VueAuth from '@websanova/vue-auth'
import {defineRulesFor} from '@/utils/auth/ability.js'
import moment from 'moment-timezone'

const currencyData = require('currency-data');


Vue.router = router

Vue.use(VueAuth, {
    auth: require('@/utils/auth/access_token.js'),
    http: require('@websanova/vue-auth/drivers/http/axios.1.x.js'),
    router: require('@websanova/vue-auth/drivers/router/vue-router.2.x.js'),
    refreshData: {
        url: 'accounts/auth/me',
        method: 'GET',
        enabled: true,
        interval: 60
    },
    loginData: {url: 'accounts/login', method: 'POST', redirect: '/', fetchUser: true},
    logoutData: {url: 'accounts/logout', method: 'POST', redirect: '/', makeRequest: true},
    registerData: {url: 'accounts', method: 'POST', redirect: '/dashboard'},
    fetchData: {url: 'accounts/auth/me', method: 'GET', enabled: true},
    impersonateData: {url: 'accounts/impersonate', method: 'POST', redirect: '/'},
    unimpersonateData: {
        url: 'accounts/unimpersonate',
        method: 'POST',
        makeRequest: true,
        redirect: '/monitor/companies'
    },
    rolesVar: 'role',
    tokenStore: ['cookie', 'localStorage'],
    parseUserData: (data) => {
        // if not company id exists on the properties and companies length == 0

        //setting default money_formatter
        Vue.prototype.$money_format = '0.0a'


        if (data.business) {
            data.company = data.business
            delete data.business
        }


        if (data.hasOwnProperty('companyId') || data.hasOwnProperty('company')) {
            let companyId = data.companyId || data.company.id
            window.localStorage.setItem('active-company', companyId)

            //get the country

            if (data.company) {
                Vue.prototype.$country = data.company.country
                let primaryCurrencyISOCode = data.company.country.currency.split(',')[0]
                if (data.company.currency) {
                    Vue.prototype.$currency = data.company.currency.symbol
                } else {
                    Vue.prototype.$currency = currencyData.getCurrencyByCurrencyISOCode(primaryCurrencyISOCode).symbol
                }
                Vue.prototype.$date_format = data.company.date_format || "Do/MM/YYYY"
                Vue.prototype.$time_format = data.company.time_format || "hh:mm a"

                moment.tz.setDefault(data.company.timezone)
                Vue.prototype.$moment = moment

                //set global google analytics id
                if (data.company.ga_tracking_id) {
                    Vue.prototype.$trackingId = data.company.ga_tracking_id
                }

                Vue.prototype.$money_format = data.company.money_format || '0.0a'
            }


        } else {
            window.localStorage.removeItem('active-company')
        }

        // we create ability for the user
        Vue.prototype.$ability.update(defineRulesFor(data));

        //setting the subdomain
        if (data.company && data.company.subdomain) {
            Vue.prototype.$subdomain.name = data.company.subdomain;
        }

        return data || {}
    }
})

// check if the user has the permission to view the route, and redirect
router.beforeEach((to, from, next) => {
    let allow = true;
    let denyPlan = false;
    to.matched.some(record => {
        let permission = record.meta.permission;
        if (permission && permission instanceof Array) {
            // if array permission we check if any is false
            permission.some(p => {
                if (!Vue.prototype.$ability.can('manage', p)) {
                    allow = false;
                    // check if deny is due to plan authorization
                    denyPlan = p.startsWith("plan_");
                    return true;
                }
            });
        } else if (permission) {
            // if one permission we check
            allow = Vue.prototype.$ability.can('manage', permission);
            // check if deny is due to plan authorization
            denyPlan = permission.startsWith("plan_");
            return true;
        }
        return false;
    });

    // no match so we continue
    if (allow) {
        next();
    } else {
        if (denyPlan) {
            next({name: 'plan_error'});
        } else {
            next({name: 'error-403'});
        }
    }
});
