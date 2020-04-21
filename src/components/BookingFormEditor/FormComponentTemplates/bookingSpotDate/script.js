import base from '../base';
import VDaySelector from '@/components/vuelendar/components/vl-day-selector';

export default {
    components: {VDaySelector},
    name: 'bookingFormEditorFormComponentTemplatesBookingSpotDate',
    mixins: [base],
    data() {
        return {}
    },
    mounted() {
        //date
        //date=2020-01-31
        if (this.$route.query.date) {
            let date = decodeURIComponent(this.$route.query.date);
            this.$set(this.$store.state.bookingFormEditor.form, "service_date_picker", date)
            this.onDatePickerChange();

        }
    },
    methods: {
        onDatePickerChange() {
            if (!this.editorMode) {
                this.fetchAvailableSpots();
                if (this.hasValidation) {
                    this.$events.emitEvent('BookingFormEditor:resetFieldValidation', [this.itemId]);
                    this.$events.emitEvent('BookingFormEditor:validateField', [this.itemId]);
                }
            }
        },
        fetchAvailableSpots() {
            this.$helpers.startLoading('bookingForm:available-slots');
            var _date = this.form[this.item.formId];
            this.axios({
                url: '/booking_spots/available_spots',
                params: {from: _date, to: _date, coordinates: this.form.address_coordinates, zip: this.form.address_zip},
                method: 'GET'
            })
                .then(response => {
                    if (response.data && response.data[0]) {
                        if (response.data[0].locationId) {
                            this.$store.state.bookingFormEditor.availableSlots = response.data;
                            //time
                            //time=16-45
                            if (this.$route.query.time) {
                                let time = decodeURIComponent(this.$route.query.time).replace('-', ':');
                                for (let i = 0; i < response.data.length; i++) {
                                    let spot = response.data[i];
                                    if (spot.slots && spot.slots.length > 0) {
                                        for (let j = 0; j < spot.slots.length; j++) {
                                            let slot = spot.slots[j];
                                            if (time === slot.time) {
                                                //select slot here
                                                this.$set(this.$store.state.bookingFormEditor.form, "service_date", slot.datetime);
                                                return;
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            this.$store.state.bookingFormEditor.availableSlots = []
                            //this.$helpers.errorHandle('Sorry, we cannot serve your location at the moment. Please check back later.');
                        }
                    } else {
                        this.$store.state.bookingFormEditor.availableSlots = []
                        //this.$helpers.errorHandle('There are no available slots for the selected date');
                    }
                })
                .catch(e => {
                    console.log(e);
                })
                .finally(_ => {
                    this.$helpers.stopLoading('bookingForm:available-slots');
                });
        },
    },
    computed: {}
}
