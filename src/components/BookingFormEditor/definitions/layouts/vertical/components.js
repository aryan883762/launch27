export default {
    1: {
        type: 'container',
    },
    2: {
        type: 'row',
    },
    3: {
        type: 'column',
        width: '50%',
    },
    4: {
        type: 'column',
        width: '50%',
    },
    5: {
        type: 'container',
    },
    6: {
        type: 'text',
        attributes: {
            text: 'Complete your booking form',
        },
        hidable: true,
    },
    7: {
        type: 'text',
        attributes: {
            text: 'Great! Few details and we can complete your booking.',
        },
        hidable: true,
    },
    8: {
        type: 'divider',
        hidable: true,
    },
    9: {
        type: 'textfield',
        attributes: {
            placeholder: 'First name',
        },
        required: true,
        formId: 'first_name',
    },
    10: {
        type: 'textfield',
        attributes: {
            placeholder: 'Last name',
        },
        required: true,
        formId: 'last_name',
    },
    11: {
        type: 'textfield',
        attributes: {
            placeholder: 'Company name (if organization)',
        },
        formId: 'company_name',
        hidable: true,
    },
    12: {
        type: 'textfield',
        fieldType: 'email',
        attributes: {
            placeholder: 'Email',
        },
        required: true,
        formId: 'email',
        validation: ['email'],
    },
    13: {
        type: 'row',
    },
    14: {
        type: 'column',
        width: '50%',
    },
    15: {
        type: 'column',
        width: '50%',
    },
    16: {
        type: 'label',
        reference: 11,
        attributes: {
            text: 'Email',
        },
        hidable: true,
    },
    17: {
        type: 'label',
        reference: 9,
        attributes: {
            text: 'First name',
        },
        hidable: true,
    },
    18: {
        type: 'label',
        reference: 10,
        attributes: {
            text: 'Last name',
        },
        hidable: true,
    },
    19: {
        type: 'label',
        reference: 12,
        attributes: {
            text: 'Phone',
        },
        hidable: true,
    },
    20: {
        type: 'text',
        attributes: {
            text: 'Step 1: Who you are',
        },
        hidable: true,
    },
    21: {
        type: 'text',
        attributes: {
            text: 'This information will be used to contact you about your service',
        },
        hidable: true,
    },
    22: {
        type: 'spacer',
        hidable: true,
    },
    23: {
        type: 'divider',
        hidable: true,
    },
    24: {
        type: 'text',
        attributes: {
            text: 'Step 2: Address',
        },
        hidable: true,
    },
    25: {
        type: 'text',
        attributes: {
            text: 'Where will your appointment be held',
        },
        hidable: true,
    },
    26: {
        type: 'row',
    },
    27: {
        type: 'column',
        width: '50%',
    },
    28: {
        type: 'column',
        width: '50%',
    },
    29: {
        type: 'textfield',
        attributes: {
            placeholder: 'Street',
        },
        formId: 'address_street',
        required: true,
    },
    30: {
        type: 'textfield',
        attributes: {
            placeholder: 'City',
        },
        formId: 'address_city',
        required: true,
    },
    31: {
        type: 'row',
    },
    32: {
        type: 'column',
        width: '35%',
    },
    33: {
        type: 'column',
        width: '35%',
    },
    34: {
        type: 'column',
        width: '30%',
    },
    35: {
        type: 'textfield',
        attributes: {
            placeholder: 'State',
        },
        formId: 'address_state',
        required: true,
    },
    36: {
        type: 'textfield',
        fieldType: 'text',
        attributes: {
            placeholder: 'Zip',
        },
        formId: 'address_zip',
        validation: ['zip'],
        required: true,
    },
    37: {
        type: 'textfield',
        fieldType: 'text',
        attributes: {
            placeholder: 'Phone',
        },
        formId: 'address_phone',
        validation: ['phone'],
        required: true,
    },
    38: {
        type: 'row'
    },
    39: {
        type: 'column',
        width: '70%',
    },
    40: {
        type: 'column',
        width: '30%',
    },
    41: {
        type: 'container',
        class: 'booking-form-sidebar',
        hidable: true,
    },
    42: {
        type: 'container',
        class: 'box shadow text-center booking-form-features',
        hidable: true,
    },
    43: {
        type: 'container',
        hidable: true,
    },
    44: {
        type: 'image',
        attributes: {
            url: 'assets/booking-form/svgs/clock.svg',
            format: 'svg',
        },
        hidable: true,
    },
    45: {
        type: 'text',
        attributes: {
            text: 'Saves you time',
        },
        class: 'booking-form-sidebar-title',
        hidable: true,
    },
    46: {
        type: 'text',
        attributes: {
            text: 'Our service helps you live smarter, giving you time to focus on what\'s most important.',
        },
        hidable: true,
    },
    47: {
        type: 'container',
        class: 'box shadow booking-form-form-wrapper',
        sortable: true,
    },
    48: {
        type: 'container',
        hidable: true,
    },
    49: {
        type: 'image',
        attributes: {
            url: 'assets/booking-form/svgs/shield.svg',
            format: 'svg',
        },
        hidable: true,
    },
    50: {
        type: 'text',
        attributes: {
            text: 'Safety first',
        },
        class: 'booking-form-sidebar-title',
        hidable: true,
    },
    51: {
        type: 'text',
        attributes: {
            text: 'We rigorously vet all of our Cleaners, who undergo identity checks as well as in-person interviews.',
        },
        hidable: true,
    },
    52: {
        type: 'container',
        hidable: true,
    },
    53: {
        type: 'image',
        attributes: {
            url: 'assets/booking-form/svgs/checked-cog.svg',
            format: 'svg',
        },
        hidable: true,
    },
    54: {
        type: 'text',
        attributes: {
            text: 'Only the best quality',
        },
        class: 'booking-form-sidebar-title',
        hidable: true,
    },
    55: {
        type: 'text',
        attributes: {
            text: 'Our skilled professionals go above and beyond on every job. Cleaners are rated and reviewed after each task.',
        },
        hidable: true,
    },
    56: {
        type: 'container',
        hidable: true,
    },
    57: {
        type: 'image',
        attributes: {
            url: 'assets/booking-form/svgs/cleaning-bottle.svg',
            format: 'svg',
        },
        hidable: true,
    },
    58: {
        type: 'text',
        attributes: {
            text: 'Easy to get help',
        },
        class: 'booking-form-sidebar-title',
        hidable: true,
    },
    59: {
        type: 'text',
        attributes: {
            text: 'Select your ZIP code, number of bedrooms and bathrooms, date and relax while we take care of your home.',
        },
        hidable: true,
    },
    60: {
        type: 'container',
        hidable: true,
    },
    61: {
        type: 'image',
        attributes: {
            url: 'assets/booking-form/svgs/chat.svg',
            format: 'svg',
        },
        hidable: true,
    },
    62: {
        type: 'text',
        attributes: {
            text: 'Seamless communication',
        },
        class: 'booking-form-sidebar-title',
        hidable: true,
    },
    63: {
        type: 'text',
        attributes: {
            text: 'Online communication makes it easy for you to stay in touch with your Cleaners.',
        },
        hidable: true,
    },
    64: {
        type: 'container',
        hidable: true,
    },
    65: {
        type: 'image',
        attributes: {
            url: 'assets/booking-form/svgs/card.svg',
            format: 'svg',
        },
        hidable: true,
    },
    66: {
        type: 'text',
        attributes: {
            text: 'Cash free payment',
        },
        class: 'booking-form-sidebar-title',
        hidable: true,
    },
    67: {
        type: 'text',
        attributes: {
            text: 'Pay securely online only when the cleaning is complete.',
        },
        hidable: true,
    },
    68: {
        type: 'row',
    },
    69: {
        type: 'column',
        width: '50%',
    },
    70: {
        type: 'column',
        width: '50%',
    },
    71: {
        type: 'select',
        attributes: {
            placeholder: 'Where did you hear about us?',
            options: [
                {value: 1, label: 'Google Search'},
                {value: 2, label: 'Referral'},
                {value: 3, label: 'Our Website'},
                {value: 4, label: 'Other'},
            ],
        },
        formId: 'referral_source',
        hidable: true,
    },
    72: {
        type: 'divider',
        hidable: true,
    },
    73: {
        type: 'text',
        attributes: {
            text: 'Step 3: Services',
        },
        hidable: true,
    },
    74: {
        type: 'text',
        attributes: {
            text: 'Choose your service',
        },
        hidable: true,
    },
    75: {
        type: 'select',
        formId: 'serviceIds',
        required: true,
        attributes: {
            placeholder: 'Select service',
            options: [],
        },
        displayName: 'Service',
    },
    76: {
        type: 'divider',
        hidable: true,
    },
    77: {
        type: 'text',
        attributes: {
            text: 'Step 4: Choose Date/Time',
        },
        hidable: true,
    },
    78: {
        type: 'text',
        attributes: {
            text: 'When should we come',
        },
        hidable: true,
    },
    79: {
        type: 'row'
    },
    80: {
        type: 'column',
        width: '50%',
    },
    81: {
        type: 'column',
        width: '50%',
    },
    82: {
        type: 'bookingSpotDate',
        formId: 'service_date_picker',
        required: true,
        displayName: 'Service date',
    },
    83: {
        type: 'bookingSpotTime',
        formId: 'service_date',
        required: true,
        displayName: 'Service time',
    },
    84: {
        type: 'divider',
        hidable: true,
    },
    85: {
        type: 'text',
        attributes: {
            text: 'Step 5: Frequency',
        },
        hidable: true,
    },
    86: {
        type: 'text',
        attributes: {
            text: 'Select service frequency',
        },
        hidable: true,
    },
    87: {
        type: 'frequencies',
        formId: 'frequencyId',
        required: true,
        displayName: 'Frequency',
    },
    88: {
        type: 'divider',
        hidable: true,
        dependsOn: [75],
    },
    89: {
        type: 'container',
        hidable: true,
        dependsOn: [75],
    },
    90: {
        type: 'text',
        attributes: {
            text: 'Step 6: Extras',
        },
        hidable: true,
    },
    91: {
        type: 'text',
        attributes: {
            text: 'Select your preferred extras',
        },
        hidable: true,
    },
    92: {
        type: 'extras',
        formId: 'extras',
        hidable: true,
    },
    93: {
        type: 'container',
    },
    94: {
        type: 'container',
    },
    95: {
        type: 'container',
    },
    96: {
        type: 'container',
    },
    97: {
        type: 'container',
    },
    98: {
        type: 'divider',
        hidable: true,
    },
    99: {
        type: 'container',
    },
    100: {
        type: 'text',
        attributes: {
            text: 'Step 7: Additional',
        },
        hidable: true,
    },
    101: {
        type: 'text',
        attributes: {
            text: 'Additional Options',
        },
        hidable: true,
    },
    102: {
        type: 'row'
    },
    103: {
        type: 'column',
        width: '50%',
    },
    104: {
        type: 'column',
        width: '50%',
    },
    105: {
        type: 'container',
    },
    106: {
        type: 'textfield',
        attributes: {
            placeholder: 'Discount Code',
        },
        hidable: true,
        formId: 'discount_code',
        validation: ['alphanum'],
    },
    107: {
        type: 'textfield',
        attributes: {
            placeholder: 'Gift Card',
        },
        hidable: true,
        formId: 'gift_card_code',
    },
    108: {
        type: 'textfield',
        fieldType: 'number',
        attributes: {
            placeholder: 'Tip ($)',
        },
        hidable: true,
        formId: 'tip',
    },
    109: {
        type: 'container',
        hidable: true,
    },
    110: {
        type: 'textarea',
        attributes: {
            placeholder: 'Additional Notes',
        },
        formId: 'customer_notes',
        hidable: true,
    },
    111: {
        type: 'divider',
        hidable: true,
    },
    112: {
        type: 'container',
    },
    113: {
        type: 'text',
        attributes: {
            text: 'Step 8: Payment',
        },
        hidable: true,
    },
    114: {
        type: 'text',
        attributes: {
            text: 'Choose payment method',
        },
        hidable: true,
    },
    115: {
        type: 'paymentMethods',
        formId: 'payment_type',
        required: true,
        displayName: 'Payment method',
    },
    116: {
        type: 'divider',
    },
    117: {
        type: 'container',
        class: 'text-center',
    },
    118: {
        type: 'button',
        attributes: {
            text: 'Book Appointment',
        },
        formId: 'submit',
    },
    119: {
        type: 'container',
        hidable: true,
        fieldId: 'booking-summary-wrapper',
    },
    120: {
        type: 'bookingSummary',
        hidable: true,
    },
    121: {
        type: 'customFields',
        attributes: {
            hidden: true,
        },
        hidable: true,
        class: 'box shadow',
    },
    122: {
        type: 'spacer',
        hidable: true,
    },
    123: {
        type: 'text',
        attributes: {
            text: 'Additional Information',
        },
        styles: {
            fontSize: 16,
            paddingTop: 10,
            paddingBottom: 10,
        },
        hidable: true,    
    },
    124: {
        type: 'container',
        hidable: true,
        droppable: true,
    },
    125: {
        type: 'container',
    },
    126: {
        type: 'textfield',
        attributes: {
            placeholder: 'Referral Code',
        },
        hidable: false,
        formId: 'referral_code',
    },
    127: {
        type: 'textfield',
        attributes: {
            placeholder: 'Apartment No.',
        },
        formId: 'address_apartment',
    },
    128: {
        type: 'select',
        formId: 'service_category',
        attributes: {
            placeholder: 'Select category',
            options: [],
        },
    },
    129: {
        type: 'serviceOptions',
        hidable: false,
    },
    130: {
        type: 'bookingSummary',
        hidable: true,
        class: 'box shadow',
    },
    131: {
        type: 'text',
        attributes: {
            text: 'Booking Summary',
        },
        styles: {
            fontWeight: 'bold',
            textAlign: 'center',
            fontSize: 20,
        },
        hidable: true,
    },
    132: {
        type: 'divider',
    },
    133: {
        type: 'container',
        hidable: true,
        sortable: true,
        class: 'service-summary',
    },
    134: {
        type: 'row',
        hidable: true,
        class: 'hover',
        responsiveChildren: false,
    },
    135: {
        type: 'column',
        width: '15%',
        class: 'text-center',
    },
    136: {
        type: 'image',
        attributes: {
            url: 'assets/booking-form/svgs/home.svg',
            format: 'svg',
        },
        hidable: true,
    },
    137: {
        type: 'column',
        width: '85%',
        class: 'text-left',
    },
    138: {
        type: 'text',
        attributes: {
            text: 'Select a service...',
        },
        hidable: true,
        fieldId: 'summary.service.services',
    },
    139: {
        type: 'row',
        hidable: true,
        class: 'hover',
        responsiveChildren: false,
    },
    140: {
        type: 'column',
        width: '15%',
        class: 'text-center',
    },
    141: {
        type: 'image',
        attributes: {
            url: 'assets/booking-form/svgs/calendar-icon.svg',
            format: 'svg',
        },
        hidable: true,
    },
    142: {
        type: 'column',
        width: '85%',
        class: 'text-left',
    },
    143: {
        type: 'text',
        attributes: {
            text: 'Choose service date...',
        },
        hidable: true,
        fieldId: 'summary.service.service_date',
    },
    144: {
        type: 'row',
        hidable: true,
        class: 'hover',
        responsiveChildren: false,
    },
    145: {
        type: 'column',
        width: '15%',
        class: 'text-center',
    },
    146: {
        type: 'image',
        attributes: {
            url: 'assets/booking-form/svgs/clock.svg',
            format: 'svg',
        },
        hidable: true,
    },
    147: {
        type: 'column',
        width: '85%',
        class: 'text-left',
    },
    148: {
        type: 'text',
        attributes: {
            text: 'Duration',
        },
        hidable: true,
        fieldId: 'summary.service.duration',
    },
    149: {
        type: 'row',
        hidable: true,
        class: 'hover',
        responsiveChildren: false,
    },
    150: {
        type: 'column',
        width: '15%',
        class: 'text-center',
    },
    151: {
        type: 'image',
        attributes: {
            url: 'assets/booking-form/svgs/frequency-icon.svg',
            format: 'svg',
        },
        hidable: true,
    },
    152: {
        type: 'column',
        width: '85%',
        class: 'text-left',
    },
    153: {
        type: 'text',
        attributes: {
            text: 'Select frequency...',
        },
        hidable: true,
        fieldId: 'summary.service.frequency',
    },
    154: {
        type: 'divider',
    },
    155: {
        type: 'container',
        hidable: true,
        sortable: true,
        class: 'pricing-summary',
        fieldId: 'pricing-summary',
    },
    156: {
        type: 'row',
        hidable: true,
        class: 'hover',
        responsiveChildren: false,
    },
    157: {
        type: 'column',
        width: '60%',
    },
    158: {
        type: 'text',
        attributes: {
            text: 'Services',
        },
        hidable: true,
        class: 'text-left',
    },
    159: {
        type: 'column',
        width: '40%',
    },
    160: {
        type: 'text',
        attributes: {
            text: '0.00',
        },
        hidable: true,
        class: 'text-right',
        fieldId: 'summary.pricing.services',
    },
    161: {
        type: 'row',
        hidable: true,
        class: 'hover',
        responsiveChildren: false,
    },
    162: {
        type: 'column',
        width: '60%',
    },
    163: {
        type: 'text',
        attributes: {
            text: 'Extras',
        },
        hidable: true,
        class: 'text-left',
    },
    164: {
        type: 'column',
        width: '40%',
    },
    165: {
        type: 'text',
        attributes: {
            text: '0.00',
        },
        hidable: true,
        class: 'text-right',
        fieldId: 'summary.pricing.extras',
    },
    166: {
        type: 'row',
        hidable: true,
        class: 'hover',
        responsiveChildren: false,
    },
    167: {
        type: 'column',
        width: '60%',
    },
    168: {
        type: 'text',
        attributes: {
            text: 'Discount',
        },
        hidable: true,
        class: 'text-left',
    },
    169: {
        type: 'column',
        width: '40%',
    },
    170: {
        type: 'text',
        attributes: {
            text: '0.00',
        },
        hidable: true,
        class: 'text-right',
        fieldId: 'summary.pricing.discount',
    },
    171: {
        type: 'row',
        hidable: true,
        class: 'hover',
        responsiveChildren: false,
    },
    172: {
        type: 'column',
        width: '60%',
    },
    173: {
        type: 'text',
        attributes: {
            text: 'Promo/Discount Code',
        },
        hidable: true,
        class: 'text-left',
    },
    174: {
        type: 'column',
        width: '40%',
    },
    175: {
        type: 'text',
        attributes: {
            text: '0.00',
        },
        hidable: true,
        class: 'text-right',
        fieldId: 'summary.pricing.discount_code_total',
    },
    176: {
        type: 'row',
        hidable: true,
        class: 'hover',
        responsiveChildren: false,
    },
    177: {
        type: 'column',
        width: '60%',
    },
    178: {
        type: 'text',
        attributes: {
            text: 'Amount (before taxes)',
        },
        hidable: true,
        class: 'text-left',
    },
    179: {
        type: 'column',
        width: '40%',
    },
    180: {
        type: 'text',
        attributes: {
            text: '0.00',
        },
        hidable: true,
        class: 'text-right',
        fieldId: 'summary.pricing.total_before_tax',
    },
    181: {
        type: 'row',
        hidable: true,
        class: 'hover',
        responsiveChildren: false,
    },
    182: {
        type: 'column',
        width: '60%',
    },
    183: {
        type: 'text',
        attributes: {
            text: 'Taxes',
        },
        hidable: true,
        class: 'text-left',
    },
    184: {
        type: 'column',
        width: '40%',
    },
    185: {
        type: 'text',
        attributes: {
            text: '0.00',
        },
        hidable: true,
        class: 'text-right',
        fieldId: 'summary.pricing.taxes',
    },
    186: {
        type: 'row',
        hidable: true,
        class: 'hover',
        responsiveChildren: false,
    },
    187: {
        type: 'column',
        width: '60%',
    },
    188: {
        type: 'text',
        attributes: {
            text: 'Tip',
        },
        hidable: true,
        class: 'text-left',
    },
    189: {
        type: 'column',
        width: '40%',
    },
    190: {
        type: 'text',
        attributes: {
            text: '0.00',
        },
        hidable: true,
        class: 'text-right',
        fieldId: 'summary.pricing.tip',
    },
    191: {
        type: 'row',
        hidable: true,
        class: 'hover',
        responsiveChildren: false,
    },
    192: {
        type: 'column',
        width: '60%',
    },
    193: {
        type: 'text',
        attributes: {
            text: 'Total',
        },
        styles: {
            fontWeight: 'bold',
            fontSize: 18,
        },
        hidable: true,
        class: 'text-left',
    },
    194: {
        type: 'column',
        width: '40%',
    },
    195: {
        type: 'text',
        attributes: {
            text: '0.00',
        },
        styles: {
            fontWeight: 'bold',
            fontSize: 18,
        },
        hidable: true,
        class: 'text-right',
        fieldId: 'summary.pricing.total',
    },
    196: {
        type: 'row',
        hidable: true,
        class: 'hover',
        responsiveChildren: false,
    },
    197: {
        type: 'column',
        width: '60%',
    },
    198: {
        type: 'text',
        attributes: {
            text: 'Next booking total',
        },
        hidable: true,
        class: 'text-left',
    },
    199: {
        type: 'column',
        width: '40%',
    },
    200: {
        type: 'text',
        attributes: {
            text: '0.00',
        },
        hidable: true,
        class: 'text-right',
        fieldId: 'summary.pricing.next_booking_total',
    },
    201: {
        type: 'termOfService',
        hidable: false,
        required: true,
        displayName: 'Terms and condition',
        formId: 'termsOfService'
    },
}