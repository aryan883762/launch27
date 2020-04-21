import base from '../base';

export default {
    name: 'bookingFormEditorFormComponentTemplatesImage',
    mixins: [base],
    data() {
        return {
        }
    },
    mounted() {
    },
    methods: {
        getUrl() {
            var out = null;
            if (this.itemAttributes.url) {
                out = require('@/' + this.itemAttributes.url);
            }
            return out;
        },
    },
    computed: {
    }
}