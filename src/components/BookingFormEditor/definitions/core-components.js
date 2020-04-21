export default {
    container: {
        name: 'Container',
        hasChildren: true,
        styleables: ['backgroundColor', 'backgroundImage', 'padding', 'margin', 'border'],
    },
    row: {
        name: 'Row',
        hasChildren: true,
    },
    column: {
        name: 'Column',
        hasChildren: true,
    },
    divider: {
        name: 'Divider',
        styleables: ['padding', 'divider'],
    },
    spacer: {
        name: 'Spacer',
        styleables: ['height'],
    },
    text: {
        name: 'Text',
        attributes: ['text'],
        styleables: ['font', 'padding'],
    },
    label: {
        name: 'Label',
        attributes: ['text'],
        styleables: ['font', 'padding'],
    },
    textfield: {
        name: 'Text field',
        attributes: ['placeholder', 'label'],
        styleables: ['font', 'backgroundColor', 'border', 'padding'],
    },
    textarea: {
        name: 'Text area',
        attributes: ['placeholder', 'label'],
        styleables: ['font', 'backgroundColor', 'border', 'padding'],
    },
    select: {
        name: 'Select',
        attributes: ['placeholder', 'label', 'options'],
        styleables: ['font', 'backgroundColor', 'border', 'padding'],
    },
    checkbox: {
        name: 'Checkbox',
        attributes: ['label', 'options'],
        styleables: ['font', 'margin'],
    },
    radio: {
        name: 'Radio Button',
        attributes: ['label', 'options'],
        styleables: ['font', 'margin'],
    },
    button: {
        name: 'Button',
        attributes: ['text'],
        styleables: ['font', 'backgroundColor', 'border', 'padding'],
    },
    image: {
        name: 'Image',
        attributes: ['url', 'format'],
        styleables: ['margin'],
    },
    services: {
        name: 'Services',
    },
    serviceOptions: {
        name: 'Service Options',
    },
    frequencies: {
        name: 'Frequencies',
    },
    extras: {
        name: 'Extras',
    },
    bookingSpotDate: {
        name: 'Booking spot (Date)',
    },
    bookingSpotTime: {
        name: 'Booking Spot (Time)',
    },
    paymentMethods: {
        name: 'Payment methods',
    },
    bookingSummary: {
        name: 'Booking Summary',
        hasChildren: true,
    },
    datePicker: {
        name: 'Date picker',
    },
    timePicker: {
        name: 'Time picker',
    },
    customFields: {
        name: 'Custom fields',
        hasChildren: true,
        styleables: ['padding', 'margin', 'border'],
    },
}