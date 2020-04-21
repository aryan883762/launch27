import base from '../base';

export default {
    name: 'bookingFormEditorFormComponentTemplatesDivider',
    mixins: [base],
    data() {
        return {
        }
    },
    mounted() {
    },
    methods: {
    },
    computed: {
        dividerLineStyle() {
            var out = {};
            if (this.settings.type == 'divider') {
                out['height'] = (this.itemStyles.lineWidth || 1) + 'px';
                out['backgroundColor'] = this.itemStyles.lineColor || '#ccc';
            }
            return out;
        },
    }
}