export default {
    name: 'booking-form-custom-fields-menu',
    props: {
        excludeItems: {
            type: Array,
            default: function() {
                return []
            },
        },
    },
    data() {
        return {
        };
    },
    created() {
    },
    computed: {

    },
    methods: {
        selectItem(item) {
            this.$emit('select', item);
        }
    }
};