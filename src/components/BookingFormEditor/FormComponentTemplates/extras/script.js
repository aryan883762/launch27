import base from '../base';

export default {
    name: 'bookingFormEditorFormComponentTemplatesExtras',
    mixins: [base],
    data() {
        return {
        }
    },
    mounted() {
    },
    methods: {
        onServiceExtraSelect(service, extra) {
            if (!this.editorMode) {
                if (!this.extrasSelection.hasOwnProperty(service.id)) {
                    this.$set(this.extrasSelection, service.id, []);
                }

                var selected = this.extrasSelection[service.id];
                var index = selected.indexOf(extra.id);
                if (index === -1) {
                    selected.push(extra.id);
                }
                else {
                    this.$store.state.bookingFormEditor.extrasSelection[service.id] = selected.filter(i => i != extra.id);
                }
                this.$events.emitEvent('BookingFormEditor:updatePricing');
                if (this.hasValidation) {
                    this.$events.emitEvent('BookingFormEditor:resetFieldValidation', [this.itemId]);
                    this.$events.emitEvent('BookingFormEditor:validateField', [this.itemId]);
                }
            }
        },
        increaseServiceExtra(service, extra) {
            if (this.getServiceExtraQuantity(service, extra) < extra.maximum_quantity) {
                this.extrasSelection[service.id].push(extra.id);
                this.$events.emitEvent('BookingFormEditor:updatePricing');
            }
        },
        decreaseServiceExtra(service, extra) {
            if (this.isServiceExtraSelected(service, extra)) {
                var selected = this.extrasSelection[service.id];
                var index = selected.indexOf(extra.id);
                if (index !== -1) {
                    selected.splice(index, 1);
                    this.$events.emitEvent('BookingFormEditor:updatePricing');
                }
            }
        },
        isServiceExtraSelected(service, extra) {
            var out = false;
            if (this.extrasSelection.hasOwnProperty(service.id)) {
                out = this.extrasSelection[service.id].indexOf(extra.id) !== -1;
            }
            return out;
        },
        getServiceExtraQuantity(service, extra) {
            var out = 0;
            if (this.isServiceExtraSelected(service, extra)) {
                var selected = this.extrasSelection[service.id];
                out = selected.map((e, i) => e == extra.id ? i : '').filter(String).length;
            }
            return out;
        }
    },
    computed: {
        services() {
            return this.$store.state.bookingFormEditor.categoryServices;
        },
        selectedServices() {
            var out = [];
            if (this.form.hasOwnProperty('serviceIds')) {
                var serviceIds = this.form.serviceIds;
                out = this.services.filter(obj => serviceIds.indexOf(obj.id) !== -1);
            }
            if (!out.length && this.services.length && this.editorMode) {
                out = [this.services[0]];
            }
            return out;
        },
        servicesField() {
            var out = null;
            if (this.layout && this.layout.components) {
                var components = Object.values(this.layout.components);
                var component = components.find(obj => obj.type == 'services');
                if (component && component.hasOwnProperty('formId')) {
                    out = component.formId;
                }
            }
            return out;
        },
        extrasSelection() {
            return this.$store.state.bookingFormEditor.extrasSelection;
        },
        showPrice() {
            var out = false;
            if (this.$store.state.bookingFormEditor.company && this.$store.state.bookingFormEditor.company.settings && this.$store.state.bookingFormEditor.company.settings.booking && this.$store.state.bookingFormEditor.company.settings.booking.show_extra_price) {
                out = true;
            }
            return out;
        }
    }
}