import base from '../base';

export default {
    name: 'bookingFormEditorFormComponentTemplatesCheckbox',
    mixins: [base],
    data() {
        return {
            model: [],
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