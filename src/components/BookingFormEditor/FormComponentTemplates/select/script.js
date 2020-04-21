import base from '../base';

export default {
    name: 'bookingFormEditorFormComponentTemplatesSelect',
    mixins: [base],
    data() {
        return {
            initialValue: null,
        }
    },
    created() {
        if (this.isMultipleSelection) {
            this.initialValue = [];
        }

        if (this.item.formId == 'service_category') {
            if (this.$store.state.bookingFormEditor.company.serviceCategories && this.$store.state.bookingFormEditor.company.serviceCategories.length) {
                var activeCategories = this.$store.state.bookingFormEditor.company.serviceCategories.filter(item => item.active);
                if (activeCategories.length) {
                    this.initialValue = activeCategories[0].id;
                }
            }
            if (!this.initialValue) {
                this.initialValue = 'none';
            }
        }

        if (!this.form.hasOwnProperty(this.item.formId)) {
            this.$set(this.form, this.item.formId, this.initialValue);
        }

        if (this.item.formId == 'service_category') {
            this.fetchCategoryServices();
        }

        if (this.item.formId == 'serviceIds') {
            if (!this.form['service_category']) {
                var default_category = null;
                if (this.$store.state.bookingFormEditor.company.serviceCategories && this.$store.state.bookingFormEditor.company.serviceCategories.length) {
                    var activeCategories = this.$store.state.bookingFormEditor.company.serviceCategories.filter(item => item.active);
                    if (activeCategories.length) {
                        default_category = activeCategories[0].id;
                    }
                }
                if (!default_category) {
                    default_category = 'none';
                }
                this.fetchCategoryServices(default_category);
            }
        }
    },
    methods: {
        onSelect() {
            if (this.item.formId == 'serviceIds') {
                const select_multiple = this.$store.state.bookingFormEditor.company.settings && this.$store.state.bookingFormEditor.company.settings.booking && this.$store.state.bookingFormEditor.company.settings.booking.multiple_services;
                if (!select_multiple) {
                    this.$refs.elSelect.blur();
                }
            }
            this.onFieldChangeLive();
        }
    },
    computed: {
        options() {
            var out = [];
            if (this.item.formId == 'service_category') {
                out.push({label: 'Uncategorized', value: 'none'});
                if (this.$store.state.bookingFormEditor.company.serviceCategories) {
                    this.$store.state.bookingFormEditor.company.serviceCategories.forEach(item => {
                        if (item.active) {
                            out.push({label: item.name, value: item.id});
                        }
                    });
                }
            }
            else if (this.item.formId == 'serviceIds') {
                if (this.$store.state.bookingFormEditor.categoryServices) {
                    this.$store.state.bookingFormEditor.categoryServices.forEach(item => {
                        var label = item.name;
                        if (this.showServicePrice) {
                            label += ` (${this.$currency}${item.base_price})`;
                        }
                        out.push({label: label, value: item.id});
                    });
                }
            }
            else {
                out = this.itemAttributes.options;
            }
            return out;
        },
        isMultipleSelection() {
            var out = this.itemAttributes.multiple;
            if (this.item.formId == 'serviceIds') {
                out = true;
            }
            return out;
        },
        showServicePrice() {
            var out = false;
            if (this.$store.state.bookingFormEditor.company && this.$store.state.bookingFormEditor.company.settings && this.$store.state.bookingFormEditor.company.settings.booking && this.$store.state.bookingFormEditor.company.settings.booking.show_service_price) {
                out = true;
            }
            return out;
        }
    }
}