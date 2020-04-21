const componentsDefinitions = require('@/components/BookingFormEditor/definitions/core-components.js').default

export default {
    name: 'booking-form-component-styler',
    props: {
        item: Object,
        itemStyles: Object,
        section: String,
        styleables: {
            type: Array,
            default: function() {
                return [];
            }
        },
        currentStyles: {
            type: Object,
            default: function() {
                return {};
            }
        },
    },
    data() {
        return {
            tmpStyles: {}
        }
    },
    mounted() {
        this.init();
    },
    computed: {
        styles() {
            var out = {};
            if (this.section) {
                out = this.item.styles[this.section];
            }
            else {
                out = this.item.styles;
            }
            return out;
        },
        mergedStyles() {
            return Object.assign(this.styles, this.tmpStyles);
        },
        fonts() {
            var fonts = [];
            var fontsList = require('@/components/BookingFormEditor/fonts.json');
            fontsList.sort(function(a, b) {
                var aName = a.name.toLowerCase();
                var bName = b.name.toLowerCase();
                if (aName < bName) return -1;
                if (aName > bName) return 1;
                return 0;
            });

            if (fontsList.length) {
                fonts = fontsList;
            }

            return fonts;
        },
    },
    methods: {
        init() {
            if (!this.item.hasOwnProperty('styles')) {
                this.$set(this.item, 'styles', {});
            }

            if (this.section) {
                if (!this.item.styles.hasOwnProperty(this.section)) {
                    this.$set(this.item.styles, this.section, {});
                }
            }

            this.tmpStyles = Object.assign({}, this.currentStyles, this.styles);

            if (this.itemStyles) {
                this.item.styles = this.itemStyles;
            }
        },
        onChanged() {
            this.$emit('updated:item');
        },
        onFontChanged() {
            var id = this.styles.fontId;
            var font = this.fonts.find(obj => obj.id == id);
            if (font && font.id) {
                this.styles.fontFamily = font['font-family'];
            }
        },
        onColorChange(property, color) {
            this.$set(this.styles, property, color);
        },
        toggleStyleItem(property, value) {
            if (this.styles[property] == value) {
                this.styles[property] = null;
            }
            else {
                this.$set(this.styles, property, value);
            }
        },
        onPropertyChanged(prop) {
            if (this.tmpStyles[prop]) {
                this.$set(this.styles, prop, this.tmpStyles[prop]);
            }
        },
    },
}