import base from '../base';

export default {
    name: 'bookingFormEditorFormComponentTemplatesRadio',
    mixins: [base],
    data() {
        return {
            model: null,
        }
    },
    mounted() {
    },
    methods: {
        onChange() {
            this.form[this.item.formId] = this.model;
            this.onFieldChangeLive();
        }
    },
    computed: {
    }
}