import base from '../base';

export default {
    name: 'bookingFormEditorFormComponentTemplatesBookingSpotTime',
    mixins: [base],
    data() {
        return {
        }
    },
    mounted() {
    },
    methods: {
        isSlotSelected(slot) {
            var out = false;
            if (this.form.hasOwnProperty(this.item.formId)) {
                out = this.form[this.item.formId] == slot.datetime;
            }
            return out;
        },
        onTimeSlotSelect(slot) {
            if (!this.editorMode) {
                this.$set(this.form, this.item.formId, slot.datetime);
                this.$events.emitEvent('BookingFormEditor:updatePricing');
                if (this.hasValidation) {
                    this.$events.emitEvent('BookingFormEditor:resetFieldValidation', [this.itemId]);
                    this.$events.emitEvent('BookingFormEditor:validateField', [this.itemId]);
                }

                if (this.form[this.item.formId]) {
                    var locationId = this.selectedDateAvailableSlots.locationId;
                    this.$events.emitEvent('BookingFormEditor:updateActiveLocation', [locationId]);
                }
            }
        },
        displayTime(time) {
            var out;
            if (time) {
                var formatted = [];
                var format = this.$store.state.bookingFormEditor.company.time_format || 'hh:mm a';
                var times = time.split('-');
                var dateInstance = this.$moment();
                times.forEach(time => {
                    time = time.trim();
                    var time_bits = time.split(':');
                    var hr = time_bits[0], min = time_bits[1];
                    dateInstance.set({'hour': parseInt(hr), 'minute': parseInt(min)});
                    formatted.push(dateInstance.format(format));
                });
                out = formatted.join(' - ');
            }
            return out;
        }
    },
    computed: {
        selectedDateAvailableSlots() {
            var out = {};
            var date = this.editorMode ? this.$$moment().format('YYYY-MM-DD') : this.form.service_date_picker;
            if (this.$store.state.bookingFormEditor.availableSlots.length) {
                var slot = this.$store.state.bookingFormEditor.availableSlots.find(obj => obj.day == date);
                if (slot) {
                    out = slot;
                }
            }
            return out;
        },
    }
}