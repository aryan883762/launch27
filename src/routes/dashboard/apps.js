
export const gift_card_routes =  {
  path: '/dashboard/apps/gift-card',
  component: require('@/views/dashboard/apps/giftcard/Default.vue').default,
  meta: {
    permission: ['manage_apps', 'plan_gift_card']
  },
  children: [
    {
      path: '',
      name: 'apps_giftcard_create',
      component: require('@/views/dashboard/apps/giftcard/CreateGiftCard.vue').default,
      meta: {
        breadcrumbs: [
          {
            name: 'Dashboard',
            link: 'dashboard'
          },
          {
            name: 'Apps',
            link: 'dashboard_apps'
          },
          {
            name: 'Gift Card',
            link: ''
          }
        ]
      }
    },
    {
      path: '/dashboard/apps/gift-card/list',
      name: 'apps_giftcard_list',
      component: require('@/views/dashboard/apps/giftcard/ListGiftCard.vue').default,
      meta: {
        breadcrumbs: [
          {
            name: 'Dashboard',
            link: 'dashboard'
          },
          {
            name: 'Apps',
            link: 'dashboard_apps'
          },
          {
            name: 'Gift Card',
            link: ''
          }
        ]
      }
    },
    {
      path: '/dashboard/apps/gift-card/settings',
      name: 'apps_giftcard_settings',
      component: require('@/views/dashboard/apps/giftcard/EditGiftCardType.vue').default,
      meta: {
        breadcrumbs: [
          {
            name: 'Dashboard',
            link: 'dashboard'
          },
          {
            name: 'Apps',
            link: 'dashboard_apps'
          },
          {
            name: 'Gift Card',
            link: ''
          }
        ]
      }
    },
    {
        path: '/dashboard/apps/gift-card/widget',
        name: 'apps_giftcard_widget',
        component: require('@/views/dashboard/apps/giftcard/Widget.vue').default,
        meta: {
            breadcrumbs: [
                {
                    name: 'Dashboard',
                    link: 'dashboard'
                },
                {
                    name: 'Apps',
                    link: 'dashboard_apps'
                },
                {
                    name: 'Gift Card',
                    link: ''
                }
            ]
        }
    }
  ]
}


export const campaign_routes = {
  path: '/dashboard/apps/campaigns',
  name: 'apps_referral',
  component: require('@/views/dashboard/apps/referral/Default.vue').default,
  meta: {
    permission: ["manage_apps","plan_customer_reward"],
    breadcrumbs: [
      {name: 'Dashboard', link: 'dashboard'},
      {name: 'Apps', link: 'dashboard_apps'},
      {name: 'Campaign', link: ''}
    ]
  }
}

export const review_redirect_routes = {
  path: '/dashboard/apps/review-redirect/settings',
  name: 'apps_review_settings',
  component: require('@/views/dashboard/apps/external_review/Default.vue').default,
  meta: {
    permission: ["manage_apps","plan_review_redirect"],
    breadcrumbs: [
      {name: 'Dashboard', link: 'dashboard'},
      {name: 'Apps', link: 'dashboard_apps'},
      {name: 'Review Redirect', link: ''}
    ]
  }
}

export const shift_clock_routes = {
  path: '/dashboard/apps/shift-clock',
  name: 'apps_shift_clock',
  component: require('@/views/dashboard/apps/shift_clock/Default.vue').default,
  meta: {
    permission: ["manage_apps","plan_shift_clock"],
    breadcrumbs: [
      {name: 'Dashboard', link: 'dashboard'},
      {name: 'Apps', link: 'dashboard_apps'},
      {name: 'Shift Clock', link: ''}
    ]
  },
  children: [
    {
      path: '/dashboard/apps/shift-clock/settings',
      name: 'apps_shift_clock_settings',
      component: require('@/views/dashboard/apps/shift_clock/Settings.vue').default,
      meta: {
        breadcrumbs: [
          {name: 'Dashboard',link: 'dashboard'},
          {name: 'Apps',link: 'dashboard_apps'},
          {name: 'Shift Clock',link: ''}
        ]
      }
    },{
      path: '/dashboard/apps/shift-clock/history',
      name: 'apps_shift_clock_list',
      component: require('@/views/dashboard/apps/shift_clock/History.vue').default,
      meta: {
        breadcrumbs: [
          {name: 'Dashboard',link: 'dashboard'},
          {name: 'Apps',link: 'dashboard_apps'},
          {name: 'Shift Clock',link: ''}
        ]
      }
    }
  ]
}

export const campaign_list_routes = {
  path: '/dashboard/apps/campaigns/record/:id',
  name: 'apps_referral_list',
  component: require('@/views/dashboard/apps/referral/List.vue').default,
  meta: {
    permission: ["manage_apps","plan_customer_reward"],
    breadcrumbs: [
      {name: 'Dashboard', link: 'dashboard'},
      {name: 'Apps', link: 'dashboard_apps'},
      {name: 'Campaign', link: 'apps_referral'},
      {name: 'Record', link: ''}
    ],
  }
}


export const google_analytics = {
    path: '/dashboard/apps/google_analytics',
    name: 'apps_google_analytics',
    component: require('@/views/dashboard/apps/google_analytics/Default.vue').default,
    meta: {
        permission: ["manage_apps","plan_google_analytics"],
        breadcrumbs: [
            {name: 'Dashboard', link: 'dashboard'},
            {name: 'Apps', link: 'dashboard_apps'},
            {name: 'Google Analytics', link: ''},
        ],
    }
}
