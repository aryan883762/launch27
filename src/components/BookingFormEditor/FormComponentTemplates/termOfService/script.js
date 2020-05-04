import base from '../base';

export default {
    name: 'bookingFormEditorFormComponentTemplatesTermOfService',
    mixins: [base],
    data() {
        return {
            model: false
        }
    },
    created() {
       this.form[this.item.formId] = this.model;
    },
    mounted() {
        console.log('terms', this.form);
    },
    methods: {
        onChange() {
            this.form[this.item.formId] = this.model;
            this.onFieldChangeLive();
            console.log(this.form);
        }
    },
    computed: {
    }
}