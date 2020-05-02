import Vue from 'vue'

import App from './App.vue'
import router from './routes'
import store from './store'
import './plugins/element.js'
import './plugins/axios.js'
import './plugins/vcalendar.js'
import './plugins/vue-casl.js'
import './plugins/vue-auth.js'
import './plugins/fullcalendar.js'
import './plugins/vue-form-wizard'
import 'vue-tel-input/dist/vue-tel-input.css'
import Utils from '@/utils'
import VueTelInput from 'vue-tel-input'
import Transitions from 'vue2-transitions'
import VueTheMask from 'vue-the-mask'
import wysiwyg from "vue-wysiwyg";
import "vue-wysiwyg/dist/vueWysiwyg.css";
import './plugins/youtube'
import './plugins/googlemaps'
import './plugins/timepicker'
import './plugins/zendesk'
import './plugins/apm-server'
import './plugins/print'
import './plugins/gtag'
import './plugins/recaptcha'
import './plugins/vue-numerals'
import './plugins/window-resize'

import Toasted from 'vue-toasted';


Vue.use(Toasted)

import {ApmVuePlugin} from '@elastic/apm-rum-vue'


if (false) {
    Vue.use(ApmVuePlugin, {
        router,
        config: {
            serviceName: process.env.NODE_ENV + '-api-v2-frontend',
            // agent configuration

            // Set custom APM Server URL (default: http://localhost:8200)
            serverUrl: process.env.NODE_ENV == 'development' ? 'https://130.211.207.185:8200' : 'https://130.211.207.185:8200',
            // Set service version (required for sourcemap feature)
            serviceVersion: '',
            verifyServerCert: false,
            captureBody: 'all'
        }
    })
}


require('./components');

import DurationPicker from './plugins/custom-fields/duration-picker'

Vue.use(DurationPicker)

import DurationFilter from './plugins/duration-filter'

Vue.use(DurationFilter)

import smoothscroll from 'smoothscroll-polyfill';

import SubdomainHandler from './plugins/subdomain-handler.js'
import './registerServiceWorker'

Vue.use(SubdomainHandler)

// kick off the polyfill!
smoothscroll.polyfill();

Vue.use(VueTheMask)
Vue.use(VueTelInput)
Vue.use(Utils)

Vue.config.productionTip = false

Vue.use(Transitions)

Vue.use(wysiwyg, {maxHeight: "200px"});


let app = new Vue({
    router,
    store,
    created() {
        // we remove it, it will then be set by subdomain plugin or vue-auth
        window.localStorage.removeItem('active-company');

        this.$events.addListener('track-page', this.trackPage)
    },
    methods: {
        getHeaders() {
            return {Authorization: this.$auth.token()};
        },
        getFileUrl() {
            return process.env.VUE_APP_API_HOST + "/api/containers/" + process.env.VUE_APP_STORAGE_FOLDER + "/upload";
        },
        getUTCDate(date) {
            return this.$moment.tz(date, "YYYY-MM-DD", this.$auth.user().company.timezone).utc().format()
        },
        getUTCDateMoment(date,type="") {
            if(type === "start"){
                return this.$moment.tz(date, "YYYY-MM-DD", this.$auth.user().company.timezone).startOf('day').utc()
            }else if(type === "end"){
                return this.$moment.tz(date, "YYYY-MM-DD", this.$auth.user().company.timezone).endOf('day').utc()
            }else{
                return this.$moment.tz(date, "YYYY-MM-DD", this.$auth.user().company.timezone).utc()
            }
        },
        notProductionReady() {
            return process.env.NODE_ENV !== 'production'
        },
        trackPage() {
            //check if this page has been visisted before
            if (!(this.$auth.user().company.setup_progress_visits && this.$auth.user().company.setup_progress_visits.includes(this.$route.name))) {
                if (!this.$auth.user().company.setup_progress_visits)
                    this.$auth.user().company.setup_progress_visits = []

                this.$auth.user().company.setup_progress_visits.push(this.$route.name)

                this.axios.patch('/companies/current', {setup_progress_visits: this.$auth.user().company.setup_progress_visits})
                    .then(() => {
                    })
                    .catch(() => {
                    })
                    .finally(() => {
                    })
            }
        },
        $aggregate(model, from, to, type_of_aggregation, where, field, no_match) {
            
            return new Promise((resolve, reject) => {
                this.axios.get("/" + model + "/aggregate", {
                    params: {
                        from: this.getUTCDateMoment(from,"start").toISOString(),
                        to: this.getUTCDateMoment(to,"end").toISOString(),
                        aggregation_type: type_of_aggregation,
                        where: where || {},
                        field: field,
                        no_match: no_match
                    }
                })
                    .then(res => {
                        resolve(res.data)
                    })
                    .catch((err) => {
                        reject(false)
                    })
            })
        }
    },

    render: h => h(App)
}).$mount('#app')


export let root_app = app;

