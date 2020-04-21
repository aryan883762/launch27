import base from '../base';

export default {
    name: 'bookingFormEditorFormComponentTemplatesServiceOptions',
    mixins: [base],
    data() {
        return {
            servicePricingVariables: {},
        }
    },
    created() {
        this.$events.on('BookingFormEditor:formFieldUpdated', (fieldId) => {
            if (fieldId == 'serviceIds') {
                this.onServiceUpdated();
            }
        });
    },
    methods: {
        onServiceUpdated() {
            this.$events.emitEvent('BookingFormEditor:updatePricing');
            this.selectedServices.forEach(item => {
                if (item.pricing_variables) {
                    if (this.editorMode) {
                        this.$set(this.servicePricingVariables, item.id, item.pricing_variables);
                        this.$set(this.$store.state.bookingFormEditor.pricingVariableSelection, item.id, {});
                        this.$set(this.$store.state.bookingFormEditor.hourlySelection, item.id, {});
                    }
                    else {
                        if (!this.servicePricingVariables.hasOwnProperty(item.id)) {
                            this.fetchServicePricingVariables(item.id);
                        }
                    }
                }
            });
        },
        fetchServicePricingVariables(serviceId) {
            this.$helpers.startLoading('fetch:pricingVariables:' + serviceId);
            this.axios.get('/services/' + serviceId + '/pricing_variables', {params: {filter: {include: ["prices"], where: {active: true}}}})
                .then(response => {
                    if (response.data) {
                        this.$set(this.servicePricingVariables, serviceId, response.data);
                        if(!this.hasPricingHourlyQuery(this.$route.query)){
                            this.$set(this.$store.state.bookingFormEditor.pricingVariableSelection, serviceId, {});
                            this.$set(this.$store.state.bookingFormEditor.hourlySelection, serviceId, {});    
                        }
                    }
                })
                .catch(err => {

                })
                .finally(() => {
                    this.$helpers.stopLoading('fetch:pricingVariables:' + serviceId);
                });
        },
        hasPricingHourlyQuery(query){
            if(query && (query.service_options || query.service_pricings || query.minutes || query.quantity || query.pricing_param_quantity)){
                return true;
            }else if(query){
                for(let i = 0; i < Object.keys(this.$route.query).length; i++){
                    let key = decodeURIComponent(Object.keys(this.$route.query)[i]);
                    if (key.startsWith("pricing_parameter")){
                        return true;
                    }
                }
            }
            return false;
        },
        onFieldChange(id) {
            // this.$set(this.form.service_pricing_variables, this.selectedService.id, this.pricingVariablesForm);

            this.$events.emitEvent('BookingFormEditor:resetFieldValidation', [id]);
            this.$events.emitEvent('BookingFormEditor:updatePricing');
        },
        hasErrors(id) {
            return this.$store.state.bookingFormEditor.formValidation.hasOwnProperty(id) && this.$store.state.bookingFormEditor.formValidation[id].length;
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
            return out;
        },
        extrasSelection() {
            return this.$store.state.bookingFormEditor.extrasSelection;
        },
    }
}