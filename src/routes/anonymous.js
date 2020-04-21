'use strict'


export const anonymous = {
//  name: 'anonymous',
    path: '/',
    component: require('@/views/anonymous/Layout').default,
    children: [
        {
            path: '/giftcards',
            name: 'anonymous_giftcard',
            component: require('@/views/dashboard/apps/giftcard/CreateGiftCard.vue').default,
            meta: {
                auth: false,
                subdomainRequired: true
            }
        },
        {
            path: '/privacy-policy',
            name: 'privacy_policy',
            component: require('@/views/anonymous/PrivacyPolicy.vue').default,
            meta: {
                // auth: false,
                subdomainRequired: true
            }
        },
        {
            path: '/terms-of-service',
            name: 'terms_of_service',
            component: require('@/views/anonymous/TermsOfService.vue').default,
            meta: {
                // auth: false,
                subdomainRequired: true
            }
        },
        {
            path: '/booking-with-referral',
            name: 'booking_with_referral',
            component: require('@/views/bookingReferral.vue').default,
            meta: {
                // auth: false,
                subdomainRequired: true
            }
        }
    ]
}


export const anonymous_rating = {
    path: '/ratings/:bookingId',
    name: 'anonymous_rating',
    component: require('@/views/anonymous/Rating.vue').default,
    meta: {
        subdomainRequired: true
    },
}
