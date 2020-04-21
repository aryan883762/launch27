'use strict'

import {customerRoles} from '@/utils/auth/ability.js'

export const customer = {
    path: '/customer/dashboard',
    component: require('@/views/customer/Layout').default,
    meta: {
        auth: customerRoles
    },
    children: [
        {
            path: '',
            name: 'customer_dashboard',
            component: require('@/views/customer/Dashboard.vue').default
        },

        {
            path: '/customer/gift-card',
            component: require('@/views/customer/apps/Giftcard.vue').default,
            children: [
                {
                    path: '',
                    name: 'customer_apps_giftcard_create',
                    component: require('@/views/dashboard/apps/giftcard/CreateGiftCard.vue').default
                },
                {
                    path: '/customer/gift-card/list',
                    name: 'customer_apps_giftcard_list',
                    component: require('@/views/dashboard/apps/giftcard/ListGiftCard.vue').default
                }
            ]
        },
        {
            path: '/customer/campaigns',
            name: 'customer_apps_referral',
            component: require('@/views/dashboard/apps/referral/Default.vue').default,
            meta: {
                permission: ["use_apps_customer", "plan_customer_reward"],
                breadcrumbs: [
                    {name: 'Dashboard', link: 'customer_dashboard'},
                    {name: 'Campaign', link: ''}
                ]
            }
        },
        {
            path: '/customer/campaigns/record/:id',
            name: 'customer_apps_referral_list',
            component: require('@/views/dashboard/apps/referral/List.vue').default,
            meta: {
                permission: ["use_apps_customer", "plan_customer_reward"],
                breadcrumbs: [
                    {name: 'Dashboard', link: 'customer_dashboard'},
                    {name: 'Campaign', link: 'customer_apps_referral'},
                    {name: 'Record', link: ''}
                ],
            }
        },

        {
            path: '/customer/messages',
            name: 'customer_messages',
            component: require('@/views/dashboard/Inbox.vue').default,
            meta: {
                breadcrumbs: [
                    {name: 'Dashboard', link: 'customer_dashboard'},
                    {name: 'Messages', link: ''}
                ]
            }
        },
        // {
        //   path: '/customer/bookings/calendar',
        //   component: require('@/views/dashboard/calendar/Calendar.vue').default,
        //   meta: {
        //     breadcrumbs: [
        //       {name: 'Dashboard', link: 'customer_dashboard'},
        //       {name: 'Bookings', link: ''},
        //     ]
        //   },
        //   children: [
        //     {
        //       path: '',
        //       name: 'customer_bookings_spot',
        //       component: require('@/views/dashboard/calendar/Spots.vue').default,
        //       meta: {
        //         breadcrumbs: [
        //           {name: 'Dashboard', link: 'customer_dashboard'},
        //           {name: 'Calendar', link: ''},
        //         ]
        //       }
        //     },
        //     {
        //       path: '/customer/bookings/list',
        //       name: 'customer_bookings_list',
        //       component: require('@/views/dashboard/calendar/List.vue').default,
        //       meta: {
        //         breadcrumbs: [
        //           {name: 'Dashboard', link: 'customer_dashboard'},
        //           {name: 'Calendar', link: 'customer_bookings_spot'},
        //           {name: 'List', link: ''},
        //         ]
        //       }
        //     }
        //   ]
        // },

        {
            path: '/customer/bookings/new',
            name: 'customer_booking_new',
            component: require('@/views/customer/BookingForm.vue').default,
            children: []
        },

        {
            path: '/customer/profile',
            name: 'customer_profile',
            component: require('@/views/customer/Profile.vue').default,
            children: []
        },

        {
            path: '/customer/checklists',
            name: 'customer_checklists',
            component: require('@/views/customer/checklists/ListChecklists.vue').default,
            meta: {
                breadcrumbs: [
                    {name: 'Dashboard', link: 'customer_dashboard'},
                    {name: 'Checklists', link: ''}
                ],
            }
        },
        {
            path: '/customer/checklists/create',
            name: 'customer_checklists_create',
            component: require('@/views/customer/checklists/CreateChecklistModal.vue').default,
            meta: {
                breadcrumbs: [
                    {name: 'Dashboard', link: 'customer_dashboard'},
                    {name: 'Checklists', link: 'customer_checklists'},
                    {name: 'Add Checklist', link: ''}
                ],
            }
        },

        {
            path: '/customer/checklists/:id/edit',
            name: 'customer_checklists_edit',
            component: require('@/views/customer/checklists/CreateChecklistModal.vue').default,
            meta: {
                breadcrumbs: [
                    {name: 'Dashboard', link: 'customer_dashboard'},
                    {name: 'Checklists', link: 'customer_checklists'},
                    {name: 'Edit Checklist', link: ''}
                ],
            }
        },

        {
            path: '/customer/checklists/:id/tasks',
            name: 'customer_checklists_tasks',
            component: require('@/views/customer/checklists/CreateChecklistTaskModal.vue').default,
            meta: {
                breadcrumbs: [
                    {name: 'Dashboard', link: 'customer_dashboard'},
                    {name: 'Checklists', link: 'customer_checklists'},
                    {name: 'Add Checklist', link: ''}
                ],
            }
        },

        {
            path: '/customer/bookings',
            name: 'customer_bookings_list',
            component: require('@/views/dashboard/calendar/CalendarList.vue').default,
            meta: {
                breadcrumbs: [
                    {name: 'Dashboard', link: 'customer_dashboard'},
                    {name: 'Bookings', link: ''}
                ],
            }
        },

        {
            path: '/customer/bookings/new',
            name: 'customer_bookings_new',
            component: require('@/views/modals/CreateBooking.vue').default,
            meta: {
                auth: {roles: customerRoles, redirect: '/'}
            }
        },

        {
            path: '/customer/bookings/:id/:service_date/view',
            name: 'customer_bookings_view',
            component: require('@/views/dashboard/BookingView.vue').default,
            meta: {
                breadcrumbs: [
                    {name: 'Dashboard', link: 'customer_dashboard'},
                    // {name: 'Calendar', link: 'customer_bookings_spot'},
                    {name: 'Booking', link: ''}
                ]
            }
        },

        {
            path: '/customer/bookings/:id',
            name: 'customer_bookings_edit',
            component: require('@/views/modals/EditBooking.vue').default
        },

        {
            path: '/customer/account/cards',
            name: 'customer_account_cards',
            component: require('@/views/customer/AccountCards.vue').default,
            meta: {
                breadcrumbs: [
                    {name: 'Dashboard', link: 'customer_dashboard'},
                    {name: 'Credit Cards', link: ''}
                ]
            }
        },

        {
            path: '/customer/Teams',
            name: 'customer_teams',
            component: require('@/views/customer/Teams.vue').default,
            meta: {
                breadcrumbs: [
                    {name: 'Dashboard', link: 'customer_dashboard'},
                    {name: 'Teams', link: ''}
                ]
            }
        },

        {
            path: '/customer/Ratings',
            name: 'customer_ratings',
            component: require('@/views/customer/Ratings.vue').default,
            meta: {
                breadcrumbs: [
                    {name: 'Dashboard', link: 'customer_dashboard'},
                    {name: 'Ratings', link: ''}
                ]
            }
        },
        {
            path: '/customer/Photos',
            name: 'customer_photos',
            component: require('@/views/customer/Photos.vue').default,
            meta: {
                breadcrumbs: [
                    {name: 'Dashboard', link: 'customer_dashboard'},
                    {name: 'Photos', link: ''}
                ]
            }
        },
    ]
}
