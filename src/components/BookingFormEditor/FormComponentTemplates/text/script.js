import base from '../base';

export default {
    name: 'bookingFormEditorFormComponentTemplatesText',
    mixins: [base],
    data() {
        return {
            prefix: null,
        }
    },
    mounted() {
    },
    methods: {
        getPricingSummaryByFieldId(fieldId) {
            const field = fieldId.replace('summary.pricing.', '');
            if (this.$store.state.bookingFormEditor.pricing.hasOwnProperty(field)) {
                const value = this.$store.state.bookingFormEditor.pricing[field];
                const formatted = this.$helpers.formatAmount(value);
                var out = `${this.$currency}${formatted}`;
                if (['discount', 'discount_code_total'].indexOf(field) !== -1) {
                    out = `(${out})`;
                }
                return out;
            }
        },
        getServiceSummaryByFieldId(fieldId) {
            var out;
            const field = fieldId.replace('summary.service.', '');
            if (field == 'service_date') {
                if (this.form.service_date) {
                    const date_format = this.$store.state.bookingFormEditor.company.date_format;
                    const time_format = this.$store.state.bookingFormEditor.company.time_format;
                    out = this.$moment(this.form.service_date).format(`${date_format} @ ${time_format}`);
                }
            } else if (field == 'duration') {
                var minutes = 0;
                const services = this.getSelectedServices();

                let pvSelection = this.$store.state.bookingFormEditor.pricingVariableSelection
                var selectedExtras = this.$store.state.bookingFormEditor.extrasSelection;

                if (services.length) {
                    services.forEach(service => {
                        minutes += service.duration;

                        //adding pv durcaiton and extras duration
                        let serviceId = service.id
                        if (pvSelection.hasOwnProperty(serviceId)) {
                            for (var pvId in pvSelection[serviceId]) {
                                var pv = {id: pvId, quantity: null};
                                var pvVal = pvSelection[serviceId][pvId];
                                if (pvVal.indexOf(':') !== -1) {
                                    var pvBits = pvVal.split(':');
                                    pv.quantity = parseInt(pvBits[1]);
                                } else {
                                    pv.quantity = 1;
                                }
                                if (service && service.pricing_variables.length) {
                                    let fullPv = service.pricing_variables.find((pricing_variable) => pricing_variable.id === pv.id)
                                    if (fullPv) {
                                        //adding pv duration based on quantity
                                        minutes += (fullPv.duration * pv.quantity)
                                    }
                                }
                            }
                        }

                        //adding extra duration
                        if (selectedExtras.hasOwnProperty(serviceId) && selectedExtras[serviceId].length) {
                            var extrasIds = selectedExtras[serviceId];
                            if (extrasIds.length) {
                                extrasIds.forEach((serviceExtraId) => {
                                    var extra = service.extras.find(obj => obj.id == serviceExtraId);
                                    if (extra) {
                                        console.log("Extra %s duration is %s ", extra.duration, extra.name)
                                        minutes += (extra.duration)
                                    }
                                });
                            }
                        }

                    });
                }
                const duration = this.$moment.duration(minutes, 'minutes');
                const hrs = duration.hours(), mins = duration.minutes();
                out = `${hrs} ${hrs == 1 ? 'hour' : 'hours'} ${mins} ${mins == 1 ? 'minute' : 'minutes'}`;

            } else if (field == 'services') {
                var service_names = [];
                const services = this.getSelectedServices();
                if (services.length) {
                    services.forEach(service => {
                        service_names.push(service.name);
                    });
                }
                out = service_names.join(', ');
            } else if (field == 'frequency') {
                const frequency = this.getSelectedFrequency();
                if (frequency && frequency.id) {
                    out = frequency.name;
                }
            }
            return out;
        },
        getSelectedServices() {
            var out = [];
            if (this.$store.state.bookingFormEditor.form.serviceIds && this.$store.state.bookingFormEditor.categoryServices.length) {
                out = this.$store.state.bookingFormEditor.categoryServices.filter(i => this.$store.state.bookingFormEditor.form.serviceIds.indexOf(i.id) !== -1);
            }
            return out;
        },
        getSelectedFrequency() {
            var out = [];
            if (this.$store.state.bookingFormEditor.form.frequencyId && this.$store.state.bookingFormEditor.frequencies.length) {
                out = this.$store.state.bookingFormEditor.frequencies.find(i => this.$store.state.bookingFormEditor.form.frequencyId.indexOf(i.id) !== -1);
            }
            return out;
        },
    },
    computed: {
        displayText() {
            var out = this.itemAttributes.text;
            if (this.item.fieldId) {
                if (this.item.fieldId.indexOf('summary.pricing.') === 0) {
                    const v = this.getPricingSummaryByFieldId(this.item.fieldId);
                    if (v) {
                        out = v;
                    }
                } else if (this.item.fieldId.indexOf('summary.service.') === 0) {
                    const v = this.getServiceSummaryByFieldId(this.item.fieldId);
                    if (v) {
                        out = v;
                    }
                }
            }
            return out;
        }
    }
}