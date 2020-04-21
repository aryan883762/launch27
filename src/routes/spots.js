"use strict;"

import {adminRoles} from '@/utils/auth/ability.js'

export const children = [
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
