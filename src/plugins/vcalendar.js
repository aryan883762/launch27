'use strict'

import Vue from 'vue'
import VCalendar from 'v-calendar'

Vue.use(VCalendar, {
  masks: {
    weekdays: 'WWW'
  }
})
