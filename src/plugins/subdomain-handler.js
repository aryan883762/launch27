import { redirectWithSubdomain, setUrlSubdomain } from '@/utils/subdomain_helper.js'
import moment from 'moment-timezone'
import { abilitiesRole, abilitiesPlan } from '@/utils/auth/ability.js'

const currencyData = require('currency-data');

export default {
  install(Vue, opts) {

    Vue.prototype.$subdomain = Vue.observable({ready: false, name: "default", error: false});

    setUrlSubdomain(Vue);

    // once auth ready we set suddomain if presently
    // note: this happens only once when any page is refreshed
    Vue.prototype.$auth.ready(function () {
      // if we are not impersonaitng remove masquerade-id
      if (!Vue.prototype.$auth.impersonating()) {
          window.localStorage.removeItem('masquerade-id');
      }
      if (Vue.prototype.$auth.user().company && Vue.prototype.$auth.user().company.subdomain) {
        Vue.prototype.$subdomain.name = Vue.prototype.$auth.user().company.subdomain;
        // we don't change subdomain is the user is impersonating
        if (Vue.prototype.$auth.impersonating() || !redirectWithSubdomain(Vue.prototype.$subdomain.name)) {
            Vue.prototype.$subdomain.ready = true;
        }
      } else if (Vue.prototype.$subdomain.name !== 'default') {
        // we get and set the company for anonymous users
        Vue.prototype.axios.get("/companies/from-subdomain/" + Vue.prototype.$subdomain.name).then(res => {
          if (res.data.id) {
            // seting company and other required values
            Vue.prototype.$company = res.data;

            Vue.prototype.$country = res.data.country;
            let primaryCurrencyISOCode = res.data.country.currency.split(',')[0];
            if (res.data.currency) {
              Vue.prototype.$currency = res.data.currency.symbol
            } else {
              Vue.prototype.$currency = currencyData.getCurrencyByCurrencyISOCode(primaryCurrencyISOCode).symbol;
            }
            Vue.prototype.$date_format = res.data.date_format || "Do/MM/YYYY";
            Vue.prototype.$time_format = res.data.time_format || "hh:mm a";

            moment.tz.setDefault(res.data.timezone)
            Vue.prototype.$moment = moment

            // setting active-company
            window.localStorage.setItem('active-company', res.data.id);
                        
            // we create ability for anonymous users, made up of the company plan features
            let rules = abilitiesRole({}).concat(abilitiesPlan(res.data));
            Vue.prototype.$ability.update(rules);
          } else {
            window.localStorage.removeItem('active-company');
            checkSubdomainRequired(Vue);
          }
        })
        .finally(() => {
          // server is offline vue-auth will handle redirect
          Vue.prototype.$subdomain.ready = true;
        });
      } else {
        checkSubdomainRequired(Vue);
        Vue.prototype.$subdomain.ready = true;
      }

      // if there is no company and the user is an admin go to onboarding
      if (!Vue.prototype.$auth.user().hasOwnProperty('companyId') && 
              !Vue.prototype.$auth.user().hasOwnProperty('company') && 
              Vue.prototype.$auth.user().id && Vue.prototype.$auth.user().realm === 'default' && 
              Vue.prototype.$auth.user().role === 'r_admin') {
          // if we have and id and realm = default, then company was not
          // created and we redirect to onboarding
          Vue.router.push({name: 'onboarding_company'});
      }
    });
  }
}

// subdomain doesn't exist so we send the user to 404 if page need subdomain
function checkSubdomainRequired(Vue) {
  if (Vue.router.currentRoute.matched.some(record => record.meta.subdomainRequired)) {
    Vue.prototype.$subdomain.error = true;
  }
}
