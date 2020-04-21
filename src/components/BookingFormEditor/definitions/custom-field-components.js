export default {
    textfield: {
        component: {
            type: 'textfield',
            attributes: {
                placeholder: 'Additional field',
            },
        },
    },
    textarea: {
        component: {
            type: 'textarea',
            attributes: {
                placeholder: 'Additional field',
            },
        },
    },
    select: {
        component: {
            type: 'select',
            attributes: {
                placeholder: 'Select Options',
                options: [
                    {value: 1, label: 'Option 1'},
                    {value: 2, label: 'Option 2'},
                ],
            },
        },
    },
    checkbox: {
        component: {
            type: 'checkbox',
            attributes: {
                label: 'Checkbox Options',
                options: [
                    {value: 1, label: 'Option 1'},
                    {value: 2, label: 'Option 2'},
                ],
            },
        },
    },
    radio: {
        component: {
            type: 'radio',
            attributes: {
                label: 'Radio Options',
                options: [
                    {value: 1, label: 'Option 1'},
                    {value: 2, label: 'Option 2'},
                ],
            },
        },
    },
    text: {
        component: {
            type: 'text',
            attributes: {
                text: 'Custom text',
            },
        },
    },
    datePicker: {
        component: {
            type: 'textfield',
            fieldType: 'date',
            attributes: {
                placeholder: 'Date'
            },
        },
    },
    timePicker: {
        component: {
            type: 'textfield',
            fieldType: 'time',
            attributes: {
                placeholder: 'Time'
            }
        },
    },
    divider: {
        component: {
            type: 'divider',
        },
    },
    spacer: {
        component: {
            type: 'spacer',
        },
    },
    "2column": {
        component: {
            type: 'row',
            children: [
                {
                    type: 'column',
                    width: '50%',
                },
                {
                    type: 'column',
                    width: '50%',
                },
            ],
        },
    },
    "3column": {
        component: {
            type: 'row',
            children: [
                {
                    type: 'column',
                    width: '33.3%',
                },
                {
                    type: 'column',
                    width: '33.3%',
                },
                {
                    type: 'column',
                    width: '33.3%',
                },
            ],
        },
    },
}