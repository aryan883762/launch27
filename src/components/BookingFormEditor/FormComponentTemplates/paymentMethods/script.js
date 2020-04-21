import base from '../base';

export default {
    name: 'bookingFormEditorFormComponentTemplatesPaymentMethods',
    mixins: [base],
    components: {
        'credit-card-payment': require('@/components/BookingFormEditor/CreditCardPayment/component.vue').default,
    },
    data() {
        return {
        }
    },
    mounted() {
    },
    methods: {
        onPaymentMethodChange() {
            if (this.hasValidation) {
                this.$events.emitEvent('BookingFormEditor:resetFieldValidation', [this.itemId]);
                this.$events.emitEvent('BookingFormEditor:validateField', [this.itemId]);
            }
        },
    },
    computed: {
        company() {
            return this.$store.state.bookingFormEditor.company;
        },
    }
}