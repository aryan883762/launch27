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
      text: 'Complete your quote form',
    },
    hidable: true,
  },
  7: {
    type: 'text',
    attributes: {
      text: 'Great! Few details and we would send you a quote.',
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

  16: {
    type: 'textfield',
    fieldType: 'tel',
    attributes: {
      placeholder: 'Phone',
    },
    required: true,
    formId: 'phone'
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

  20: {
    type: 'text',
    attributes: {
      text: 'Your contact details',
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
    class: 'box shadow text-center',
    hidable: true,
  },
  43: {
    type: 'container',
    hidable: true,
  },
  44: {
    type: 'image',
    attributes: {
      url: 'assets/svgs/booking-form/clock.svg',
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
  },
  48: {
    type: 'container',
    hidable: true,
  },
  49: {
    type: 'image',
    attributes: {
      url: 'assets/svgs/booking-form/shield.svg',
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
      url: 'assets/svgs/booking-form/thumb-up.svg',
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
      url: 'assets/svgs/booking-form/cleaning-bottle.svg',
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
      url: 'assets/svgs/booking-form/bubble.svg',
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
      url: 'assets/svgs/booking-form/visa.svg',
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
  },

  72: {
    type: 'column',
    width: '50%',
  },

  97: {
    type: 'container',
  },

  99: {
    type: 'container',
  },

  117: {
    type: 'container',
    class: 'text-center',
  },
  118: {
    type: 'button',
    attributes: {
      text: 'Submit',
    },
    formId: 'submit',
  },

  121: {
    type: 'customFields',
    attributes: {
      hidden: true,
    },
    hidable: true,
    class: 'box shadow',
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
  }
}
