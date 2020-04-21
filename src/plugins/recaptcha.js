import Vue from 'vue'
import { VueReCaptcha } from 'vue-recaptcha-v3'

Vue.use(VueReCaptcha, {
    siteKey: process.env.VUE_APP_RECAPTCHA_KEY,
    loaderOptions: {
        useRecaptchaNet: true,
        autoHideBadge: true
    }
})