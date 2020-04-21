'use strict'

import helpers from './helpers'
import events from './events'
import endpoints from './endpoints'
import smooth_scroll from './smooth_scroll'
import moment from 'moment'
import Vue from "vue";

export default {
    install(Vue, options) {
        // 1. add global method or property


        //plugin endpoints
        Vue.prototype.$endpoints = endpoints

        //events bus

        Vue.prototype.$events = events

        // helpers
        Vue.prototype.$helpers = helpers

        //events bus
        Vue.prototype.$events = events

        Vue.prototype.$$moment = moment

        Vue.prototype.$storage = window.localStorage

        Vue.prototype.$format_address_components = (address_components) => {

            let address = {street: '', city: '', state: '', zip: ''}

            if (address_components.hasOwnProperty('administrative_area_level_1'))
                address.state = address_components.administrative_area_level_1

            if (address_components.hasOwnProperty('administrative_area_level_2'))
                address.city = address_components.administrative_area_level_2

            if (address_components.hasOwnProperty('route'))
                address.street = address_components.route

            if (address_components.hasOwnProperty('street_address'))
                address.street = address_components.street_address

            if (address_components.hasOwnProperty('locality'))
                address.city = address_components.locality

            if (address_components.hasOwnProperty('postal_code'))
                address.zip = address_components.postal_code

            return address

        }



    }
}
