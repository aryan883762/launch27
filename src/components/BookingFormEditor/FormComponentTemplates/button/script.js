import base from '../base';

export default {
    name: 'bookingFormEditorFormComponentTemplatesButton',
    mixins: [base],
    data() {
        return {
        }
    },
    mounted() {
    },
    methods: {
        onButtonClick() {
            if (!this.editorMode) {
                if (this.item.formId == 'submit') {
                    this.$events.emitEvent('BookingFormEditor:submitForm');
                }
            }
        },
    },
    computed: {
    }
}