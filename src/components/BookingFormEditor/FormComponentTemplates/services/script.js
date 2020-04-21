import base from '../base';

export default {
    name: 'bookingFormEditorFormComponentTemplatesServices',
    mixins: [base],
    data() {
        return {
            useLocation: false,
            locationServices: [],
            pricingVariablesForm: {},
            pricingVariablesModal: false,
            hourlyServiceModal: false,
            hourlyServiceForm: {},
            selectedService: {},
            categoryServices: [],
            loading_pv: false
        }
    },
    created() {
        this.$events.on('BookingFormEditor:updateActiveLocation', (id) => {
            this.filterServicesByLocation(id);
        });
    },
    mounted() {
        this.$set(this.form, 'serviceCategoryId', null);

        if (!this.editorMode) {
            if (this.categories.length === 1) {
                this.form.serviceCategoryId = this.categories[0].id;
                this.onCategorySelect();
            }
        }
    },
    methods: {
        onServiceSelect(service) {
            if (service.pricing_variables) {
                service.pricing_variables = service.pricing_variables.filter(item => item.active);
            }

            if (!this.editorMode) {
                if (!this.form.hasOwnProperty(this.item.formId)) {
                    this.$set(this.form, this.item.formId, []);
                }

                if (!this.company.settings.booking.multiple_services){
                    this.form[this.item.formId] = []
                }

                var selected_services = this.form[this.item.formId];
                var index = selected_services.indexOf(service.id);
                var action;
                this.selectedService = service;

                if (index === -1) {
                    action = 'add';
                    if (service.hourly) {
                        this.hourlyServiceModal = true;
                        return false;
                    } else if (service.pricing_variables && service.pricing_variables.length) {
                        this.loading_pv = true
                        this.axios.get('/services/' + service.id + '/pricing_variables', {
                            params: {
                                filter: {
                                    include: ["prices"],
                                    where: {active: true}
                                }
                            }
                        })
                            .then(res => {
                                this.selectedService.pricing_variables = res.data
                                this.pricingVariablesModal = true;
                            })
                            .catch(err => {
                                this.$helpers.errorHandle(err, this)
                            })
                            .finally(() => {
                                this.loading_pv = false
                            })


                        return false;
                    }

                    selected_services.push(service.id);
                } else {
                    selected_services.splice(index, 1);
                    if (this.form.hasOwnProperty('service_pricing_variables') && this.form.service_pricing_variables.hasOwnProperty(service.id)) {
                        this.$delete(this.form.service_pricing_variables, service.id);
                    }
                    if (this.form.hasOwnProperty('service_hourly_options') && this.form.service_hourly_options.hasOwnProperty(service.id)) {
                        this.$delete(this.form.service_hourly_options, service.id);
                    }
                    this.hourlyServiceForm = {};
                    this.pricingVariablesForm = {};
                    action = 'remove';
                }

                if (this.hasValidation) {
                    this.$events.emitEvent('BookingFormEditor:resetFieldValidation', [this.itemId]);
                    this.$events.emitEvent('BookingFormEditor:validateField', [this.itemId]);
                }

                if (action == 'remove' || (!this.hourlyServiceModal && !this.pricingVariablesModal)) {
                    this.$events.emitEvent('BookingFormEditor:updatePricing');
                }
            }
        },
        isServiceSelected(service) {
            var out = false;
            if (this.form.hasOwnProperty(this.item.formId)) {
                out = this.form[this.item.formId].indexOf(service.id) !== -1;
            }
            return out;
        },
        filterServicesByLocation(id) {
            if (id) {
                this.locationServices = this.services.filter(obj => obj.all_locations || obj.locationIds.indexOf(id) !== -1);
                // remove selected services that don't match location
                if (this.form[this.item.formId]) {
                    this.form[this.item.formId].forEach((serviceId, index) => {
                        var inLocation = this.locationServices.find(obj => obj.id == serviceId);
                        if (!inLocation) {
                            this.$delete(this.form[this.item.formId], index);
                        }
                    });
                }
            } else {
                this.locationServices = [];
                this.form[this.item.formId] = [];
            }
            this.useLocation = true;
        },
        savePricingVariables() {
            var allSet = true;
            this.selectedService.pricing_variables.forEach(pv => {
                if (!this.pricingVariablesForm.hasOwnProperty(pv.id)) {
                    allSet = false;
                }
            });

            if (allSet) {
                if (!this.form.hasOwnProperty('service_pricing_variables')) {
                    this.$set(this.form, 'service_pricing_variables', {});
                }
                this.$set(this.form.service_pricing_variables, this.selectedService.id, this.pricingVariablesForm);

                if (this.company.settings.booking.multiple_services)
                    this.form[this.item.formId].push(this.selectedService.id);
                else
                    this.form[this.item.formId] = [this.selectedService.id];

                this.pricingVariablesForm = {};
            }

            this.$events.emitEvent('BookingFormEditor:updatePricing');
            this.pricingVariablesModal = false;
        },
        saveHourlyOptions() {
            if (this.hourlyServiceForm.teams && this.hourlyServiceForm.hours) {
                if (!this.form.hasOwnProperty('service_hourly_options')) {
                    this.$set(this.form, 'service_hourly_options', {});
                }
                this.$set(this.form.service_hourly_options, this.selectedService.id, this.hourlyServiceForm);
                this.form[this.item.formId].push(this.selectedService.id);
                this.hourlyServiceForm = {};
            }

            this.$events.emitEvent('BookingFormEditor:updatePricing');
            this.hourlyServiceModal = false;
        },
        onCategorySelect() {
            this.categoryServices = [];
            this.fetchCategoryServices();
        },
        fetchCategoryServices() {
            this.$helpers.startLoading('bookingForm:category-services');
            this.axios({
                url: '/service_categories/' + this.form.serviceCategoryId + '/services',
                params: {
                    filter: {
                        where: {
                            private: false,
                            active: true,
                        },
                        order: "ordering ASC",
                        include: [
                            {'pricing_variables': 'prices'},
                            {
                                relation: 'extras',
                                scope: {
                                    where: {active: true},
                                    order: "ordering ASC"
                                }
                            }
                        ],
                    }
                },
                method: 'GET'
            })
                .then(response => {
                    if (response.data) {
                        this.categoryServices = response.data;
                    }
                })
                .catch(e => {
                    console.log(e);
                })
                .finally(_ => {
                    this.$helpers.stopLoading('bookingForm:category-services');
                });
        },
        getServiceIcon(service) {
            var out = service.icon;
            if (!out) {
                var folder = process.env.VUE_APP_STORAGE_FOLDER;
                if (folder) {
                    out = 'https://storage.googleapis.com/' + folder + '/cleaning-service.svg';
                }
            }
            return out;
        }
    },
    computed: {
        services() {
            var out = [];
            if (this.editorMode) {
                out = this.$store.state.bookingFormEditor.services;
            } else {
                if (this.categoryServices.length) {
                    out = this.categoryServices;
                }
            }
            return out;
        },
        availableServices() {
            var out = this.services;
            if (this.useLocation) {
                out = this.locationServices;
            }
            return out;
        },
        categories() {
            var categories = [];
            if (this.$store.state.bookingFormEditor.company.serviceCategories) {
                categories = this.$store.state.bookingFormEditor.company.serviceCategories.filter(item => item.active);
            }
            return categories;
        },
        company() {
            return this.$store.state.bookingFormEditor.company;
        },
    }
}
