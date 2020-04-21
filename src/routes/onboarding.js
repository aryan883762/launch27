'use strict'

import {adminRoles} from '@/utils/auth/ability.js'

export const onboarding = {
  path: '/onboarding',
  component: require('@/views/onboarding/OnboardingLayout.vue').default,
  children: [
    {
      path: '/onboarding/company',
      name: 'onboarding_company',
      component: require('@/views/onboarding/Company.vue').default,
      meta: {
        auth: adminRoles
      }
    },
    {
      path: '/onboarding/services',
      name: 'onboarding_services',
      component: require('@/views/onboarding/Services.vue').default,
      meta: {
        auth: adminRoles
      }
    },
    {
      path: '/onboarding/opening-times',
      name: 'onboarding_opening',
      component: require('@/views/onboarding/OpeningTimes.vue').default,
      meta: {
        auth: adminRoles
      }
    },
    {
      path: '/onboarding/getting-started',
      name: 'onboarding_started',
      component: require('@/views/onboarding/Started.vue').default,
      meta: {
        auth: adminRoles
      }
    },
    {
      path: '/onboarding/teams',
      name: 'onboarding_teams',
      component: require('@/views/onboarding/Teams.vue').default,
      meta: {
        auth: adminRoles
      }
    }
  ]
}
