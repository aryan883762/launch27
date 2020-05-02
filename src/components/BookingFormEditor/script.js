import Mapbox from 'mapbox-gl';
import {MglMap, MglMarker, MglAttributionControl, MglNavigationControl, MglGeolocateControl, MglFullscreenControl, MglScaleControl} from 'vue-mapbox';

export default {
    components: {
        'component-styler': require('./ComponentStyler/component.vue').default,
        'component-content-sidebar': require('./ComponentContentSidebar/component.vue').default,
        MglMap,
        MglMarker,
        MglGeolocateControl,
        MglScaleControl,
    },
    name: 'booking-form-editor',
    props: {
        editorMode: {
            type: Boolean,
            default: true
        },
        bookingFormId: [String, Number],
        isQuoteForm: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            defaultLayout: 'vertical',
            activeLayout: null,
            bookingFormData: {},
            bookingFormReady: false,
            masterTemplates: [],
            activeMasterTemplateId: null,
            layout: {},
            template: {
                settings: {},
                styles: {}
            },
            overrides: {
                styles: {},
                components: {},
            },
            customFields: {
                components: {},
                layout: {},
            },
            components: require('./definitions/core-components.js').default,
            mainSidebar: {
                visible: false,
                activeTab: 'styles',
                activeStylesSection: 'general'
            },
            activeComponent: {
                editing: false,
                id: null,
                activeTab: 'content',
                settings: {},
                styles: {},
                styleables: [],
                mainSidebarVisible: false
            },
            preview: {
                format: null,
                visible: false
            },
            company: {},
            addressMap: {
                visible: false,
                mapbox: {
                    accessToken: process.env.VUE_APP_MAPBOX_TOKEN,
                    mapStyle: 'mapbox://styles/mapbox/streets-v10',
                }
            },
            generateCodeModal: false,
            termOfServiceDialogVisible: false,
            terms_of_service: {
                business_name: '',
                enabled: false,
                content: ''
            },
            formSubmitted: false,
            publicPath: process.env.BASE_URL
        };
    },
    created() {
        this.importGoogleFonts();

        this.$events.addListener(
            'BookingFormEditor:componentUpdated',
            (id, data) => {
                if (this.layout.components.hasOwnProperty(id)) {
                    this.layout.components[id] = data;
                }
            }
        );
        this.$events.on('BookingFormEditor:editComponent', component => {
            this.activeComponent.id = component.id;
            this.activeComponent.settings = component.settings;
            this.activeComponent.styles = component.styles;
            this.activeComponent.styleables = component.styleables;
            this.showComponentSidebar();
        });
        this.$events.on('BookingFormEditor:submitForm', component => {
            this.submitForm();
        });
        this.$events.on('BookingFormEditor:updatePricing', () => {
            this.updatePricing();
        });
        this.$events.on('BookingFormEditor:validateField', (componentId) => {
            this.validateFormComponent(componentId);
        });
        this.$events.on('BookingFormEditor:resetFieldValidation', (componentId) => {
            if (this.$store.state.bookingFormEditor.formValidation.hasOwnProperty(componentId)) {
                this.$set(this.$store.state.bookingFormEditor.formValidation, componentId, []);
            }
        });
        this.$events.on('BookingFormEditor:showAddressMap', () => {
            var coordinates = this.$store.state.bookingFormEditor.form.address_coordinates;
            this.$set(this.addressMap, 'coordinates', [coordinates.lng, coordinates.lat]);
            // this.addressMap.visible = true;
        });

        this.$events.on('BookingFormEditor:customFieldInserted', (cf) => {
            this.customFields.components[cf.id] = cf.item;
        });

        this.$events.on('BookingFormEditor:customFieldLayoutUpdated', (cf) => {
            this.customFields.layout[cf.id] = {children: cf.children};
        });

        this.$events.on('BookingFormEditor:customFieldDeleted', (cf) => {
            this.$delete(this.customFields.components, cf.id);
            this.$delete(this.overrides.components, cf.id);
            if (this.customFields.layout[cf.item.parentId]) {
                var layoutIndex = this.customFields.layout[cf.item.parentId].findIndex(obj => obj.id == cf.id);
                if (layoutIndex !== -1) {
                    this.$delete(this.customFields.layout[cf.item.parentId], layoutIndex);
                }
            }
        });

        this.$events.on('BookingFormEditor:activeComponentChanged', (id) => {
            // save currently active component before switching to the new one
            if (this.activeComponent.id) {
                this.saveActiveComponent(false);
            }

            if (!id) {
                this.hideComponentSidebar();
            }
        });

        this.loadDefaultStyles();
        this.applyLayout();
        this.fetchCompany();
        this.fetchBookingForm();
        this.fetchMasterTemplates();
        this.setQueryFields();
        //this are not needed for quote form
        if (!this.isQuoteForm) {
            this.fetchServices();
            this.fetchFrequencies();
            this.resetPricing();
        }
    },
    computed: {
        baseStyles() {
            var out = {};
            out['--l27-company-main-color'] = this.$store.state.bookingFormEditor.company.button_color || '#ff5a60';
            return out;
        },
        wrapperClasses() {
            var out = [];
            if (this.template.hasOwnProperty('settings')) {
                for (var property in this.template.settings) {
                    if (this.template.settings[property] !== null) {
                        out.push(
                            this.$helpers.camelToKebab(property) +
                            '--' +
                            this.template.settings[property]
                        );
                    }
                }
            }
            return out;
        },
        ready() {
            return (
                this.bookingFormReady &&
                this.masterTemplates.length &&
                this.activeLayout &&
                this.$store.state.bookingFormEditor.company.id
            );
        },
        validationPassed() {
            for (var componentId in this.$store.state.bookingFormEditor.formValidation) {
                if (this.$store.state.bookingFormEditor.formValidation[componentId].length) {
                    return false;
                }
            }
            return true;
        },
        embedUrl() {
            var out = null;
            if (this.editorMode) {
                if (this.$store.state.bookingFormEditor.company.subdomain && this.bookingFormData.id) {
                    if (this.isQuoteForm) {
                        out = 'https://' + window.location.host + '/qf/' + this.bookingFormData.id;
                    } else {
                        out = 'https://' + window.location.host + '/bf/' + this.bookingFormData.id;
                    }
                }
            }

            // if (!this.editorMode) {
            //     this.saveTemplate().then(()=>{
            //
            //         if (this.$store.state.bookingFormEditor.company.subdomain && this.bookingFormData.id) {
            //             if (this.isQuoteForm) {
            //                 out = 'https://' + window.location.host + '/qf/' + this.bookingFormData.id;
            //             } else {
            //                 out = 'https://' + window.location.host + '/bf/' + this.bookingFormData.id;
            //             }
            //         }
            //     });
            //
            // }
            return out;
        },
        form() {
            return this.$store.state.bookingFormEditor.form;
        }
    },
    methods: {
        fetchCompany() {
            this.$helpers.startLoading('bookingForm:root');

            this.axios({
                url: '/companies/current',
                method: 'GET'
            })
                .then(response => {
                    if (response.data) {
                        this.$store.state.bookingFormEditor.company = response.data;
                    }
                })
                .catch(e => {
                })
                .finally(_ => {
                    this.$helpers.stopLoading('bookingForm:root');
                });
        },
        fetchBookingForm() {
            this.$helpers.startLoading('bookingForm:root');

            if (this.isQuoteForm) {
                var url = '/companies/current/quote_form';
                if (this.bookingFormId) {
                    url = '/quote_forms/' + this.bookingFormId;
                }
            } else {
                var url = '/companies/current/booking_form';
                if (this.bookingFormId) {
                    url = '/booking_forms/' + this.bookingFormId;
                }
            }


            this.axios({
                url: url,
                method: 'GET'
            })
                .then(response => {
                    if (response.data) {
                        this.bookingFormData = response.data;
                        this.applyBookingFormSettings();
                        this.applyLayout(response.data.layout);
                        this.bookingFormReady = true;
                        this.setCurrentCustomer()
                    }
                })
                .catch(e => {
                    if (!this.bookingFormId) {
                        this.applyMasterTemplate();
                        this.bookingFormReady = true;
                        this.setCurrentCustomer()
                    }
                })
                .finally(_ => {
                    this.$helpers.stopLoading('bookingForm:root');
                });
        },
        fetchMasterTemplates() {
            this.$helpers.startLoading('bookingForm:master-templates');

            this.axios({
                url: '/booking_form_templates',
                method: 'GET'
            })
                .then(response => {
                    if (response.data) {
                        this.masterTemplates = response.data;
                        this.applyMasterTemplate();
                    }
                })
                .catch(e => {
                    console.log(e);
                })
                .finally(_ => {
                    this.$helpers.stopLoading('bookingForm:master-templates');
                });
        },
        fetchServices() {
            this.$helpers.startLoading('bookingForm:services');

            var data = {
                filter: {
                    include: [
                        'pricing_variables',
                        {
                            relation: 'extras',
                            scope: {
                                where: {active: true}
                            }
                        }
                    ],
                    where: {active: true}
                },
            };
            this.axios({
                url: '/companies/current/services',
                method: 'GET',
                params: data,
            })
                .then(response => {
                    if (response.data) {
                        this.$store.state.bookingFormEditor.services = response.data;
                    }
                })
                .catch(e => {
                })
                .finally(_ => {
                    this.$helpers.stopLoading('bookingForm:services');
                    this.setQueryFields();
                });
        },
        fetchFrequencies() {
            this.$helpers.startLoading('bookingForm:frequencies');

            this.axios({
                url: '/companies/current/frequencies',
                method: 'GET',
                params: {
                    filter: {
                        where: {
                            active: true,
                            private: false
                        },
                        order: "ordering ASC"
                    }
                }
            })
                .then(response => {
                    if (response.data) {
                        this.$store.state.bookingFormEditor.frequencies = response.data;
                    }
                })
                .catch(e => {
                })
                .finally(_ => {
                    this.$helpers.stopLoading('bookingForm:frequencies');
                });
        },
        fetchAccountAddresses() {
            this.axios.get('/accounts/' + this.$auth.user().id + '/addresses')
                .then(res => {
                    if (res.data && res.data.length > 0) {
                        let address = res.data[0]

                        if (this.$auth.user().phone)
                            address.phone = this.$auth.user().phone

                        this.$nextTick(() => {
                            this.$set(this.$store.state.bookingFormEditor.form, "address_apartment", address.apartment)
                            this.$set(this.$store.state.bookingFormEditor.form, "address_street", address.street)
                            this.$set(this.$store.state.bookingFormEditor.form, "address_city", address.city)
                            this.$set(this.$store.state.bookingFormEditor.form, "address_state", address.state)
                            this.$set(this.$store.state.bookingFormEditor.form, "address_zip", address.zip)
                            this.$set(this.$store.state.bookingFormEditor.form, "address_coordinates", address.coordinates)
                            this.$set(this.$store.state.bookingFormEditor.form, "address_phone", address.phone)
                        })
                    }
                })
        },
        setCurrentCustomer() {
            if (this.$auth.check() && this.$auth.user().role === 'r_customer') {
                this.$nextTick(() => {
                    this.$set(this.$store.state.bookingFormEditor.form, "company_name", this.$auth.user().company_name)
                    this.$set(this.$store.state.bookingFormEditor.form, "email", this.$auth.user().email)
                    this.$set(this.$store.state.bookingFormEditor.form, "first_name", this.$auth.user().first_name)
                    this.$set(this.$store.state.bookingFormEditor.form, "last_name", this.$auth.user().last_name)
                    this.fetchAccountAddresses()
                })
            }
        },
        onEditorClick() {
            this.$events.emitEvent('BookingFormEditor:activeComponentChanged', [null]);
            this.mainSidebar.visible = false;
        },
        onHeaderClick() {
            this.onEditorClick();
        },
        importGoogleFonts() {
            var fontNames = [];
            var fontsList = require('./fonts.json');
            if (fontsList && fontsList.length) {
                fontsList.forEach(item => {
                    if (item['google-fonts'] === true) {
                        var _name = item.name.replace(/\s/g, '+');
                        if (item['google-fonts-name']) {
                            _name = item['google-fonts-name'];
                        }
                        fontNames.push(_name);
                    }
                });
            }
            var _url =
                'https://fonts.googleapis.com/css?family=' +
                fontNames.join('|') +
                '&display=swap';
            this.$helpers.loadCss(_url, 'booking-form-editor-google-fonts');
        },
        toggleMainSidebar() {
            this.mainSidebar.visible = !this.mainSidebar.visible;
            if (this.mainSidebar.visible) {
                this.$events.emitEvent('BookingFormEditor:activeComponentChanged', [null]);
            }
        },
        showComponentSidebar() {
            if (!this.activeComponent.editing) {
                this.mainSidebar.visible = false;
            }
            this.activeComponent.activeTab = 'content';
            this.activeComponent.editing = true;
            this.activeComponent.mainSidebarVisible = this.mainSidebar.visible;
        },
        hideComponentSidebar() {
            this.activeComponent.id = null;
            this.activeComponent.settings = {};
            this.activeComponent.styles = {};
            this.activeComponent.styleables = [];
            if (this.activeComponent.mainSidebarVisible) {
                this.mainSidebar.visible = true;
                this.activeComponent.mainSidebarVisible = false;
            }
            this.activeComponent.editing = false;
        },
        saveActiveComponent(reset) {
            reset = reset === false ? false : true;
            if (this.activeComponent) {
                this.overrides.components[this.activeComponent.id].styles = this.activeComponent.styles;
                this.overrides.components[this.activeComponent.id].attributes = this.activeComponent.settings.attributes;
            }

            if (reset) {
                this.$events.emitEvent('BookingFormEditor:activeComponentChanged', [null]);
            }
        },
        cancelActiveComponent() {
            this.$events.emitEvent('BookingFormEditor:activeComponentChanged', [null]);
        },
        saveTemplate(options) {
            this.$helpers.startLoading('bookingForm:root');

            var data = {
                layout: this.activeLayout,
                templateId: this.activeMasterTemplateId || null,
                overrides: this.overrides,
                customFields: this.customFields,
            };

            const method = this.bookingFormData.id ? 'PUT' : 'POST';

            var url
            if (this.isQuoteForm) {
                url = '/companies/current/quote_form'
            } else {
                url = '/companies/current/booking_form'
            }

            this.axios({
                url: url,
                data: data,
                method: method
            })
                .then(response => {
                    if (method == 'POST') {
                        this.bookingFormData = response.data;
                    }
                    if (options && options.callback) {
                        return options.callback();
                    }

                    this.$helpers.successHandle('Form successfully saved', this)

                })
                .catch(e => {
                    console.log(e);
                })
                .finally(_ => {
                    this.$helpers.stopLoading('bookingForm:root');
                });
        },
        closeEditor() {
            this.$events.emitEvent('BookingFormEditor:cancel');
        },
        loadDefaultStyles() {
            require('./styles/global.scss');
        },
        applyLayout(layout) {
            var layout = layout || this.defaultLayout;


            if (this.isQuoteForm) {
                var __components = require('./definitions/layouts/' +
                    layout +
                    '/quote/components.js').default;
                var __layout = require('./definitions/layouts/' + layout + '/quote/layout.js')
                    .default;
            } else {
                var __components = require('./definitions/layouts/' +
                    layout +
                    '/components.js').default;
                var __layout = require('./definitions/layouts/' + layout + '/layout.js')
                    .default;
            }

            //define attributes for components without it
            for (var componentId in __components) {
                if (!__components[componentId].hasOwnProperty('attributes')) {
                    __components[componentId].attributes = {};
                }
            }

            this.$set(this.layout, 'components', __components);
            this.$set(this.layout, 'layout', __layout);

            if (!this.layout.hasOwnProperty('settings'))
                this.$set(this.layout, 'settings', {});
            if (!this.layout.hasOwnProperty('styles'))
                this.$set(this.layout, 'styles', {});

            //apply custom field components
            if (this.customFields.components) {
                this.layout.components = Object.assign(this.layout.components, JSON.parse(JSON.stringify(this.customFields.components)));
            }
            if (this.customFields.layout) {
                this.layout.cfLayout = JSON.parse(JSON.stringify(this.customFields.layout));
            }

            this.activeLayout = layout;
        },
        applyBookingFormSettings() {
            if (this.bookingFormData.id) {
                this.applyMasterTemplate(this.bookingFormData.master_template);
                if (this.bookingFormData.overrides) {
                    this.overrides.components = this.bookingFormData.overrides.components || {};
                    this.overrides.styles = this.bookingFormData.overrides.styles || {};
                }
                if (this.bookingFormData.customFields) {
                    this.customFields.components = this.bookingFormData.customFields.components || {};
                    this.customFields.layout = this.bookingFormData.customFields.layout || {};
                }
            }
        },
        applyMasterTemplate(template) {
            if (!template) {
                if (this.masterTemplates.length) {
                    template = this.masterTemplates.find(obj => obj.default == true);
                    if (!template) {
                        template = this.masterTemplates[0];
                    }
                }
            }

            if (template && template.parameters) {
                if (template.parameters.settings) {
                    this.template.settings = template.parameters.settings;
                }
                if (template.parameters.styles) {
                    this.template.styles = template.parameters.styles;
                }
                this.activeMasterTemplateId = template.id;
            }
        },
        onPreviewClick(format) {
            if (typeof format == 'string') {
                this.showPreview(format);
            } else {
                if (this.preview.visible) {
                    this.closePreview();
                } else {
                    this.showPreview('desktop');
                }
            }
        },
        showPreview(format) {
            this.preview.format = format;
            if (this.preview.visible) {
                this.loadPreview();
            } else {
                this.saveTemplate({
                    callback: () => {
                        this.loadPreview();
                    }
                });
                this.preview.visible = true;
            }
        },
        resetForm() {
            this.$confirm('Are you sure you want to reset the form?')
                .then(() => {
                    this.$helpers.startLoading('bookingForm:root');

                    var url
                    if (this.isQuoteForm) {
                        url = '/companies/current/quote_form'
                    } else {
                        url = '/companies/current/booking_form'
                    }

                    this.axios.head(url)
                        .then(res => {
                            this.axios.delete(url)
                                .then(res => {
                                    this.$message.success('Form successfully restored')
                                })
                                .catch(err => {
                                    this.$helpers.errorHandle(err, this)
                                })
                                .finally(() => {
                                    this.$helpers.stopLoading('bookingForm:root')
                                })
                        })
                        .catch(err => {
                            //error means data doesn't exist so just tell user that form is restored
                            this.$message.success('Form successfully restored')
                            this.$helpers.stopLoading('bookingForm:root')
                        })

                })
        },
        closePreview() {
            this.preview.format = null;
            this.preview.visible = false;
            this.preview.url = null;
        },
        loadPreview() {
            if (!this.preview.url) {
                this.$helpers.startLoading('bookingForm:previewLoading');
                if (this.isQuoteForm)
                    this.preview.url = '/qf/' + this.bookingFormData.id;
                else
                    this.preview.url = '/bf/' + this.bookingFormData.id;
            }
        },
        onIframeLoad() {
            this.$helpers.stopLoading('bookingForm:previewLoading');
        },
        submitForm() {
            if (this.editorMode) {
                return false;
            }
            // preventing form resubmission while waiting for page to be reloaded
            if (this.formSubmitted) {
                return false;
            }

            if (this.$store.state.bookingFormEditor.form.payment_type == 'card') {
                if (this.$store.state.bookingFormEditor.company.payment_methods.card_processor == 'stripe' && !this.$store.state.bookingFormEditor.form.stripe_payment_method_id) {
                    this.$events.emitEvent('BookingFormEditor:addStripeCard', [() => {
                        this.submitForm();
                    }]);
                    return false;
                } else if (this.$store.state.bookingFormEditor.company.payment_methods.card_processor == 'fspay' && !this.$store.state.bookingFormEditor.form.cardToken) {
                    this.$events.emitEvent('BookingFormEditor:addFsPayCard', [() => {
                        this.submitForm();
                    }]);
                    return false;
                }
            }

            this.validateForm();
            this.terms_of_service.business_name = this.$store.state.bookingFormEditor.company.business_name;
            this.terms_of_service.enabled = this.$store.state.bookingFormEditor.company.settings.booking.terms_of_service.enabled;
            this.terms_of_service.content = this.$store.state.bookingFormEditor.company.settings.booking.terms_of_service.content;
            if (this.validationPassed) {
                if(this.terms_of_service.enabled) {
                  this.booking();
                }else {
                    this.termOfServiceDialogVisible = true;
                }
            } else {
                //scroll to error field
                setTimeout(()=>{
                 let  elem =  document.querySelector('.has-errors') || document.querySelector('.field-errors')
                 if(elem !== null){
                 elem.scrollIntoView({behavior: "smooth", block: "center"});
                 }
                 this.$helpers.errorHandle('Form has errors. Kindly address all the errors and try again');
                },200);
                
            }
        },
        getQuoteData() {
            var out = JSON.parse(JSON.stringify(this.$store.state.bookingFormEditor.form));

            var components = Object.values(this.layout.components);
            var customFields = components.filter(obj => obj.customField === true && obj.formId);

            out.customFields = [];
            out.companyId = this.$store.state.bookingFormEditor.company.id;

            if (customFields && customFields.length) {
                customFields.forEach(customField => {
                    if (out.hasOwnProperty(customField.formId)) {
                        var display_value = out[customField.formId];
                        if (typeof display_value == 'object') {
                            var labels = [];
                            out[customField.formId].forEach(optionId => {
                                var option = customField.attributes.options.find(obj => obj.value == optionId);
                                if (option) {
                                    labels.push(option.label);
                                }
                            });
                            display_value = labels.join(', ');
                        } else {
                            if (customField.attributes && customField.attributes.options) {
                                var option = customField.attributes.options.find(obj => obj.value == display_value);
                                if (option) {
                                    display_value = option.label;
                                }
                            }
                        }

                        var cf = {id: customField.formId, value: out[customField.formId], display_label: customField.attributes.label || customField.attributes.placeholder, display_value: display_value};
                        out.customFields.push(cf);
                        this.$delete(out, customField.formId);
                    }
                });
            }

            return out;
        },
        getBookingData() {
            var out = JSON.parse(JSON.stringify(this.$store.state.bookingFormEditor.form));

            var form = JSON.parse(JSON.stringify(this.$store.state.bookingFormEditor.form));
            var services = this.$store.state.bookingFormEditor.services;
            var selectedExtras = this.$store.state.bookingFormEditor.extrasSelection;
            var pvSelection = this.$store.state.bookingFormEditor.pricingVariableSelection;
            var hourlySelection = this.$store.state.bookingFormEditor.hourlySelection;
            var components = Object.values(this.layout.components);
            var customFields = components.filter(obj => obj.customField === true && obj.formId);

            out.services = [];
            out.serviceIds = [];
            out.customFields = [];

            if (form && form.serviceIds && form.serviceIds.length) {
                form.serviceIds.forEach((serviceId) => {
                    var item = {id: serviceId};
                    var service = services.find(obj => obj.id == serviceId);
                    if (selectedExtras.hasOwnProperty(serviceId) && selectedExtras[serviceId].length) {
                        var extrasIds = selectedExtras[serviceId];
                        var serviceExtras = {};
                        if (extrasIds.length) {
                            extrasIds.forEach((serviceExtraId) => {
                                if (serviceExtras.hasOwnProperty(serviceExtraId)) {
                                    serviceExtras[serviceExtraId].quantity += 1;
                                } else {
                                    var extra = service.extras.find(obj => obj.id == serviceExtraId);
                                    serviceExtras[serviceExtraId] = {
                                        id: serviceExtraId,
                                        name: extra.name,
                                        quantity: 1,
                                        service_id: serviceId,
                                        duration: extra.duration,
                                        hourly: service.hourly,
                                    };
                                }
                            });
                        }
                        item.extras = Object.values(serviceExtras);
                    }

                    if (pvSelection.hasOwnProperty(serviceId)) {
                        var pricingVariables = [];
                        for (var pvId in pvSelection[serviceId]) {
                            var pv = {id: pvId, quantity: null};
                            var pvVal = pvSelection[serviceId][pvId];
                            if (pvVal.indexOf(':') !== -1) {
                                var pvBits = pvVal.split(':');
                                pv.price_id = pvBits[0];
                                pv.quantity = parseInt(pvBits[1]);
                            } else {
                                pv.price_id = pvVal;
                            }
                            pricingVariables.push(pv);
                        }
                        item.pricing_variables = pricingVariables;
                    }

                    if (hourlySelection.hasOwnProperty(serviceId)) {
                        item.hourly = hourlySelection[serviceId];
                    }

                    out.services.push(item);
                    out.serviceIds.push(serviceId);
                });
            }
            this.$delete(out, 'service_date_picker');

            out.address = {
                apartment: form.address_apartment,
                street: form.address_street,
                city: form.address_city,
                state: form.address_state,
                zip: form.address_zip,
                full_address: [form.address_apartment, form.address_street, form.address_city, form.address_state, form.address_zip].join(' '),
                coordinates: form.address_coordinates,
                phone: form.address_phone,
            };

            this.$delete(out, 'address_apartment');
            this.$delete(out, 'address_street');
            this.$delete(out, 'address_city');
            this.$delete(out, 'address_state');
            this.$delete(out, 'address_zip');
            this.$delete(out, 'address_coordinates');
            this.$delete(out, 'address_phone');

            out.companyId = this.$store.state.bookingFormEditor.company.id;
            out.customer = {
                company: form.company_name,
                email: form.email,
                first_name: form.first_name,
                last_name: form.last_name,
            };

            this.$delete(out, 'first_name');
            this.$delete(out, 'last_name');
            this.$delete(out, 'company_name');
            this.$delete(out, 'email');

            if (customFields && customFields.length) {
                customFields.forEach(customField => {
                    if (out.hasOwnProperty(customField.formId) && out[customField.formId]) {
                        var display_value = out[customField.formId];
                        if (typeof display_value == 'object') {
                            var labels = [];
                            out[customField.formId].forEach(optionId => {
                                var option = customField.attributes.options.find(obj => obj.value == optionId);
                                if (option) {
                                    labels.push(option.label);
                                }
                            });
                            display_value = labels.join(', ');
                        } else {
                            if (customField.attributes && customField.attributes.options) {
                                var option = customField.attributes.options.find(obj => obj.value == display_value);
                                if (option) {
                                    display_value = option.label;
                                }
                            }
                        }

                        var cf = {id: customField.formId, value: out[customField.formId], display_label: customField.attributes.label || customField.attributes.placeholder, display_value: display_value};
                        out.customFields.push(cf);
                        this.$delete(out, customField.formId);
                    }
                });
            }

            if (this.$store.state.bookingFormEditor.availableSlots && this.$store.state.bookingFormEditor.availableSlots[0] && this.$store.state.bookingFormEditor.availableSlots[0].locationId) {
                out.locationId = this.$store.state.bookingFormEditor.availableSlots[0].locationId;
            }

            return out;
        },
        resetPricing() {
            this.$store.state.bookingFormEditor.pricing = {services: 0, extras: 0, discount: 0, discount_code_total: 0, subtotal: 0, taxes: 0, total: 0, tip: 0, total_before_tax: 0, total_after_tax: 0, next_booking_total: 0};
        },
        updatePricing() {
            if (this.editorMode) {
                return false;
            }

            var bookingData = this.getBookingData();
            if (bookingData.services && bookingData.services.length) {
                this.$helpers.startLoading('bookingForm:pricing');
                this.axios({
                    url: '/bookings/estimate_price',
                    method: 'POST',
                    data: bookingData,
                })
                    .then(response => {
                        if (response.data) {
                            this.$nextTick(() => {
                                this.$store.state.bookingFormEditor.pricing.services = response.data.services || 0;
                                this.$store.state.bookingFormEditor.pricing.extras = response.data.extras || 0;
                                this.$store.state.bookingFormEditor.pricing.discount = response.data.discount || 0;
                                this.$store.state.bookingFormEditor.pricing.discount_code_total = response.data.discount_code_total || 0;
                                this.$store.state.bookingFormEditor.pricing.giftcard_total = response.data.giftcard_total || 0;
                                this.$store.state.bookingFormEditor.pricing.subtotal = response.data.subtotal || 0;
                                this.$store.state.bookingFormEditor.pricing.taxes = response.data.taxes_total || 0;
                                this.$store.state.bookingFormEditor.pricing.total = response.data.total || 0;
                                this.$store.state.bookingFormEditor.pricing.total_before_tax = response.data.total_before_tax || 0;
                                this.$store.state.bookingFormEditor.pricing.next_booking_total = response.data.next_booking_total || 0;
                                this.$store.state.bookingFormEditor.pricing.tip = response.data.tip || 0;
                            })

                        }
                    })
                    .catch(e => {
                    })
                    .finally(_ => {
                        this.$helpers.stopLoading('bookingForm:pricing');
                    });
            } else {
                this.resetPricing();
            }
        },
        validateFormComponent(componentId) {
            if (this.editorMode) {
                return false;
            }

            var component = this.layout.components[componentId];
            var overrides = this.overrides.components[componentId] || {};
            var attributes = Object.assign(component.attributes || {}, overrides.attributes || {});

            var fieldName = component.displayName || attributes.label || attributes.placeholder;
            if (!fieldName && component.formId) {
                fieldName = component.formId.split('_').join(' ');
            }

            var rules = component.validation || [];
            if (component.required || attributes.required) {
                rules.push('required');
            }
            if (component.fieldType) {
                rules.push(component.fieldType);
            }

            var data = this.$store.state.bookingFormEditor.form;
            var formField = component.formId;

            var fieldValue = data[formField];
            // if we have a valid string then wew trim it
            if (data.hasOwnProperty(formField) && data[formField] && data[formField].trim) {
                fieldValue = data[formField].trim();
            }

            if (rules) {
                for (var i in rules) {
                    var rule = rules[i];
                    var rulePassed = true;
                    var ruleMessage = null;

                    if (rule == 'required') {
                        if (!data.hasOwnProperty(formField) || !fieldValue || !fieldValue+''.length) {
                            rulePassed = false;
                            ruleMessage = 'is required';
                        }
                    }

                    if (data.hasOwnProperty(formField) && fieldValue !== null) {

                        if (rule == 'phone') {
                            var matched = fieldValue.match(/^(?=.*[0-9])[- +()0-9]+$/);
                            if (!matched) {
                                rulePassed = false;
                                ruleMessage = 'is not a valid phone number';
                            }
                        }

                        if (rule == 'email') {
                            var re = /\S+@\S+\.\S+/;
                            rulePassed = re.test(fieldValue);
                            ruleMessage = 'is not a valid email address';
                        }
                    }

                    if (!rulePassed) {
                        var msg_prefix = fieldName || 'This field';
                        this.setFormComponentValidationError(componentId, [msg_prefix, ruleMessage].join(' '));
                    }
                }
            }

            if (component.formId == 'serviceIds') {
                const serviceIds = this.form['serviceIds'];
                if (serviceIds.length && serviceIds.length>0) {
                    const selectedServices = this.$store.state.bookingFormEditor.categoryServices.filter(o => serviceIds.indexOf(o.id) !== -1);
                    selectedServices.forEach(service => {
                        if (service.hourly) {
                            if (!this.$store.state.bookingFormEditor.hourlySelection[service.id] || !this.$store.state.bookingFormEditor.hourlySelection[service.id].teams) {
                                this.setFormComponentValidationError(`${service.id}.hourly.teams`, 'Select team size');
                            }
                            if (!this.$store.state.bookingFormEditor.hourlySelection[service.id] || !this.$store.state.bookingFormEditor.hourlySelection[service.id].hours) {
                                this.setFormComponentValidationError(`${service.id}.hourly.hours`, 'Select hours required');
                            }
                        } else if (service.pricing_variables && service.pricing_variables.length) {
                            service.pricing_variables.forEach(pv => {
                                if (!this.$store.state.bookingFormEditor.pricingVariableSelection[service.id] || !this.$store.state.bookingFormEditor.pricingVariableSelection[service.id].hasOwnProperty(pv.id)) {
                                    this.setFormComponentValidationError(`${service.id}.pv.${pv.id}`, 'Select an option');
                                }
                            });
                        }
                    });
                }else{
                    this.setFormComponentValidationError(componentId, 'Select a service');
                }
            }
        },
        setFormComponentValidationError(componentId, message) {
            var validations = this.$store.state.bookingFormEditor.formValidation;
            if (!validations.hasOwnProperty(componentId)) {
                this.$set(validations, componentId, []);
            }
            var componentValidations = validations[componentId]
            componentValidations.push(message);
            validations[componentId] = this.$helpers.arrayUnique(componentValidations);
        },
        validateForm() {
            if (this.editorMode) {
                return false;
            }
            for (var componentId in this.layout.components) {
                var component = this.layout.components[componentId];
                this.validateFormComponent(componentId);
            }
        },
        onAddressMapOpen() {
            console.log('open');
        },
        confirmAddressMap() {
            if (this.addressMap.coordinates && this.addressMap.coordinates.length && this.addressMap.markerPosition && this.addressMap.markerPosition.length && this.addressMap.coordinates[0] != this.addressMap.markerPosition[0] && this.addressMap.coordinates[1] != this.addressMap.markerPosition[1]) {
                this.$store.state.bookingFormEditor.form.address_coordinates = {lat: this.addressMap.markerPosition[1], lng: this.addressMap.markerPosition[0]};
                this.addressMap.visible = false;

                // this.$helpers.startLoading('bookingForm:addressMap');
                // this.axios
                //     .get('https://api.mapbox.com/geocoding/v5/mapbox.places/' + this.addressMap.markerPosition[0] + ',' + this.addressMap.markerPosition[1] + '.json?types=poi&access_token=' + this.addressMap.mapbox.accessToken)
                //     .then(res => {
                //         if (res.data.features && res.data.features.length > 0) {
                //             var result = res.data.features[0];
                //             this.$store.state.bookingFormEditor.form.address_coordinates = {lat: this.addressMap.markerPosition[1], lng: this.addressMap.markerPosition[0]};
                //             var address = this.$helpers.parseMapBoxAddress(result.context);
                //             address.street = result.text;
                //             address.full_address = result.place_name;
                //         }
                //     })
                //     .catch()
                //     .then(() => {
                //         this.$helpers.stopLoading('bookingForm:addressMap');
                //     });
            } else {
                this.addressMap.visible = false;
            }
        },
        onAddressMapDragMarker(event) {
            var coordinates = event.marker.getLngLat().toArray();
            this.addressMap.markerPosition = coordinates;
        },
        generateCode() {
            if (!this.embedUrl) {
                this.$helpers.startLoading('bookingForm:root');

                var data = {
                    layout: this.activeLayout,
                    templateId: this.activeMasterTemplateId || null,
                    overrides: this.overrides,
                    customFields: this.customFields,
                };

                const method = this.bookingFormData.id ? 'PUT' : 'POST';

                var url
                if (this.isQuoteForm) {
                    url = '/companies/current/quote_form'
                } else {
                    url = '/companies/current/booking_form'
                }

                this.axios({
                    url: url,
                    data: data,
                    method: method
                })
                    .then(response => {
                        if (method == 'POST') {
                            this.bookingFormData = response.data;
                        }
                        if (options && options.callback) {
                            return options.callback();
                        }

                        this.$helpers.successHandle('Form successfully saved', this)

                    })
                    .catch(e => {
                        console.log(e);
                    })
                    .finally(_ => {
                        this.$helpers.stopLoading('bookingForm:root');
                        this.generateCodeModal = true;
                    });
            }

            this.generateCodeModal = true;
        },
        setQueryFields() {
            (async () => {
                try {
                    if (this.$route.query) {
                        let services = [];
                        this.$route.query.referral_code ? this.$set(this.$store.state.bookingFormEditor.form, "referral_code", decodeURIComponent(this.$route.query.referral_code)) :"";
                        this.$route.query.rcode ? this.$set(this.$store.state.bookingFormEditor.form, "discount_code", decodeURIComponent(this.$route.query.rcode)) :"";
                        this.$route.query.first_name ? this.$set(this.$store.state.bookingFormEditor.form, "first_name", decodeURIComponent(this.$route.query.first_name)):"";
                        this.$route.query.last_name ? this.$set(this.$store.state.bookingFormEditor.form, "last_name", decodeURIComponent(this.$route.query.last_name)):"";
                        this.$route.query.zip ? this.$set(this.$store.state.bookingFormEditor.form, "address_zip", decodeURIComponent(this.$route.query.zip)):"";
                        this.$route.query.phone ? this.$set(this.$store.state.bookingFormEditor.form, "address_phone", decodeURIComponent(this.$route.query.phone)):"";
                        this.$route.query.email ? this.$set(this.$store.state.bookingFormEditor.form, "email", decodeURIComponent(this.$route.query.email)):"";
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
                        
                        //Service category - service_category=5e2a4f227f50f2197322d3d3
                        if (this.$route.query.service_category) {
                            let id = decodeURIComponent(this.$route.query.service_category);
                            if(Number(id)){
                                let whereQuery = {oldVersionId: servicesIds[i]}
                                let service_category = await this.axios.get('/service_categories/', {params: {filter: {where: whereQuery}}});
                                if(service_category && service_category.data[0])
                                    this.$set(this.$store.state.bookingFormEditor.form, "service_category", service_category.data[0].id);
                            }else{
                                this.$set(this.$store.state.bookingFormEditor.form, "service_category", id);
                                //emit an event 
                            }
                        }

                        //service ids v2 - service_ids=5e3b4f1a7f50f2197213bb2a,,5e3b4f1a7f50f2197213bb2b,,5e3b4f1a7f50f2197213bb2c
                        //service id v1 - service_id=3
                        if (this.$route.query.service_ids || this.$route.query.service_id) {
                            let servicesIds = [];
                            if (this.$route.query.service_ids)
                                servicesIds = decodeURIComponent(this.$route.query.service_ids).split(',,');
                            else
                                servicesIds = [decodeURIComponent(this.$route.query.service_id)];

                            for (let i = 0; i < servicesIds.length; i++) {
                                if (Number(servicesIds[i])) {
                                    let whereQuery = {oldVersionId: servicesIds[i]}
                                    let service = await this.axios.get('/companies/current/services/', {params: {filter: {where: whereQuery}}});
                                    if (service && service.data) {
                                        let pricingVariables = await this.axios.get('/services/' + service.data[0].id + '/pricing_variables', {params: {filter: {include: "prices"}}});
                                        let extras = await this.axios.get('/services/' + service.data[0].id + '/extras');
                                        service.data[0].pricing_variables = pricingVariables.data;
                                        service.data[0].extras = extras.data;
                                        services.push(service.data[0]);
                                    }
                                } else {
                                    let service = await this.axios.get('/companies/current/services/' + servicesIds[i]);
                                    if (service && service.data) {
                                        let pricingVariables = await this.axios.get('/services/' + service.data.id + '/pricing_variables', {params: {filter: {include: "prices"}}});
                                        let extras = await this.axios.get('/services/' + service.data.id + '/extras');
                                        service.data.pricing_variables = pricingVariables.data;
                                        service.data.extras = extras.data;
                                        services.push(service.data);
                                    }
                                }
                            }
                            this.$set(this.$store.state.bookingFormEditor.form, "serviceIds", services.map(x => x.id));
                            this.$events.emitEvent('BookingFormEditor:formFieldUpdated', ['serviceIds']);
                        }

                        //hourly options v2 - service_options=5e3b4f1a7f50f2197213bb2a-H3T1,,5e3b4f1a7f50f2197213bb2b-H2T2
                        if (this.$route.query.service_options) {
                            let hourly_options = {};
                            let options = decodeURIComponent(this.$route.query.service_options).split(',,');
                            for (var i = 0; i < options.length; i++) {
                                //(service id)-H(hour number)T(team number)
                                let service = this.getFromId(services, options[i].split('-')[0]);
                                if (service && service.id) {
                                    let opt_val = options[i].split('-')[1].substring(1); //getting rid of a H
                                    let hours = opt_val.split('T')[0];
                                    let teams = opt_val.split('T')[1];
                                    if (service.id && Number(hours) && Number(teams)) {
                                        hourly_options[service.id] = {hours: Number(hours), teams: Number(teams)};
                                    }
                                }
                            }
                            if (Object.entries(hourly_options).length > 0) {
                                this.$set(this.$store.state.bookingFormEditor, 'hourlySelection', hourly_options);
                            }
                        }

                        //pricing variable - service_pricings=5e3b4f1a7f50f2197213bb2a-5e3b4f1a7f50f2197213cc1c:4,5e3b4f1a7f50f2197213cc1f:2,,5e3b4f1a7f50f2197213bb2b-5e3b4f1a7f50f2197213cc1d:2
                        if (this.$route.query.service_pricings) {
                            let services_pricing = {};
                            let serviceObjs = decodeURIComponent(this.$route.query.service_pricings).split(",,");
                            for (var i = 0; i < serviceObjs.length; i++) {
                                let service = this.getFromId(services, serviceObjs[i].split("-")[0]);
                                if (service) {
                                    let service_obj = {}
                                    let priceVars = service.pricing_variables;
                                    let priceVarObjs = serviceObjs[i].split("-")[1].split(",");
                                    for (var j = 0; j < priceVarObjs.length; j++) {
                                        let pv_id = priceVarObjs[j].split(":")[0];
                                        let pv_qty = priceVarObjs[j].split(":")[1];
                                        let pv = this.getFromId(priceVars, pv_id);
                                        if (pv) {
                                            service_obj[pv.id.toString()] = this.getPriceId(pv.prices, pv_qty);
                                        }
                                    }
                                    if (Object.entries(service_obj).length > 0) {
                                        services_pricing[service.id] = service_obj;
                                    }
                                }
                            }
                            if (Object.entries(services_pricing).length > 0) {
                                this.$set(this.$store.state.bookingFormEditor, 'pricingVariableSelection', services_pricing);
                            }
                        }

                        //Extras - service_extras=5e3b4f1a7f50f2197213bb2a-5e3b4f1a7f50f2197214d4d1:1,5e3b4f1a7f50f2197214d4d2:2,,5e3b4f1a7f50f2197213bb2b-5e3b4f1a7f50f2197214d4d3:2
                        if (this.$route.query.service_extras) {
                            let service_extras = {};
                            let serviceObjs = decodeURIComponent(this.$route.query.service_extras).split(',,');
                            for (let i = 0; i < serviceObjs.length; i++) {
                                let service = this.getFromId(services, serviceObjs[i].split('-')[0]);
                                if (service) {
                                    let extrasArray = []
                                    let extraObjs = serviceObjs[i].split('-')[1].split(',');
                                    for (let j = 0; j < extraObjs.length; j++) {
                                        let extra_id = extraObjs[j].split(':')[0];
                                        let extra_qty = extraObjs[j].split(':')[1];
                                        let extra = this.getFromId(service.extras, extra_id);
                                        if (extra) {
                                            extrasArray.push(extra.id);
                                            if(Number(extra_qty)){
                                                for(let k=1;k<Number(extra_qty);k++){
                                                    extrasArray.push(extra.id);
                                                }
                                            }
                                        }
                                    }
                                    service_extras[service.id.toString()] = extrasArray;
                                }
                            }
                            if (Object.entries(service_extras).length > 0) {
                                this.$set(this.$store.state.bookingFormEditor, "extrasSelection", service_extras);
                            }
                        }

                        //OLD VERSION

                        //quantity and minutes - quantity=3 minutes=120
                        if (this.$route.query.quantity || this.$route.query.minutes) {
                            let quantity = "";
                            let minutes = "";
                            let hourly_options = {};
                            if (this.$route.query.quantity) {
                                quantity = Number(decodeURIComponent(this.$route.query.quantity));
                            }

                            if (this.$route.query.minutes) {
                                minutes = Number(decodeURIComponent(this.$route.query.minutes));
                            }

                            if (services[0]) {
                                hourly_options[services[0].id] = {hours: parseInt(minutes / 60), teams: parseInt(quantity)};
                            }

                            if (Object.entries(hourly_options).length > 0) {
                                this.$set(this.$store.state.bookingFormEditor, 'hourlySelection', hourly_options);
                            }
                        }

                        //pricing_parameters - pricing_param_quantity=4
                        if (this.$route.query.pricing_param_quantity) {
                            let pv_qty = Number(decodeURIComponent(this.$route.query.pricing_param_quantity));
                            let service_obj = {};
                            let services_pricing = {};
                            if (services.length > 0 && services[0].pricing_variables && services[0].pricing_variables.length > 0) {
                                let pv = services[0].pricing_variables[0];
                                service_obj[pv.id.toString()] = this.getPriceId(pv.prices, pv_qty);
                                if (Object.entries(service_obj).length > 0) {
                                    services_pricing[services[0].id] = service_obj;
                                    this.$set(this.$store.state.bookingFormEditor, 'pricingVariableSelection', services_pricing);
                                }
                            }
                        }
                        // pricing_parameters - pricing_parameters[3]=6 extra[2]=2
                        else {
                            let services_pricing = {};
                            let services_extras = {};
                            let price_variable_obj = {};
                            let extras_arr = [];
                            for (let i = 0; i < Object.keys(this.$route.query).length; i++) {
                                let key = decodeURIComponent(Object.keys(this.$route.query)[i]);
                                if (key.startsWith("pricing_parameter")) {
                                    let value = this.$route.query[key];
                                    let id = key.replace("pricing_parameter[", "").replace("]", "");
                                    if (services.length > 0 && services[0].pricing_variables && services[0].pricing_variables.length > 0) {
                                        let pv = this.getFromId(services[0].pricing_variables, id);
                                        price_variable_obj[pv.id.toString()] = this.getPriceId(pv.prices, value);
                                    }

                                }
                                if (key.startsWith("extra")) {
                                    let value = this.$route.query[key];
                                    let id = key.replace("extra[", "").replace("]", "");
                                    if (services.length > 0 && services[0].extras && services[0].extras.length > 0) {
                                        let extra = this.getFromId(services[0].extras, id);
                                        if (value && Number(value)) {
                                            for (let x = 0; x < value; x++) {
                                                extras_arr.push(extra.id);
                                            }
                                        }
                                    }

                                }
                            }
                            if (Object.entries(price_variable_obj).length > 0) {
                                services_pricing[services[0].id] = price_variable_obj;
                                this.$set(this.$store.state.bookingFormEditor, 'pricingVariableSelection', services_pricing);
                            }
                            if (extras_arr.length > 0) {
                                services_extras[services[0].id] = extras_arr;
                                this.$set(this.$store.state.bookingFormEditor, 'extrasSelection', services_extras);
                            }
                        }

                        this.updatePricing();
                    }
                } catch (err) {
                    console.log(err);
                }
            })()
        },
        getFromId(model_array, id) {
            if (model_array.length > 0) {
                if (Number(id)) {
                    return model_array.find(s => s.oldVersionId.toString() === id);
                } else {
                    return model_array.find(s => s.id.toString() === id);
                }
            }
            return null;
        },
        getPriceId(price_arr, quantity) {
            let price_str = "";
            let max_price = null;
            //loop through all the prices provided by the pricing_variable
            for (var i = 0; i < price_arr.length; i++) {
                //if quantity is within the range of the price...use that price
                if (price_arr[i].min_qty <= quantity && price_arr[i].max_qty >= quantity) {
                    price_str = price_arr[i].id.toString();
                }
                //store price with highest max quantity (incase given quantity exceeds all price max quantity)
                if (!max_price || max_price.max_qty <= price_arr[i].max_qty) {
                    max_price = price_arr[i];
                }
            }
            //if quantity exceeds all price max quantity
            if (max_price && price_str === "") {
                price_str = max_price.id.toString();
                quantity = max_price.max_qty;
            }

            //if only one price in pricing variable append the quantity
            if (price_arr.length === 1 && price_str !== "") {
                price_str += (":" + quantity);
            }
            return price_str;
        },
        booking() {
            this.$helpers.startLoading('bookingForm:root');
            let url
            if (this.isQuoteForm) {
                url = '/companies/current/quotes'
            } else {
                url = '/companies/current/bookings'
            }
            this.axios({
                url: url,
                method: 'POST',
                data: this.isQuoteForm ? this.getQuoteData() : this.getBookingData(),
            })
            .then(response => {
                if (response.data) {
                    this.$message({
                        showClose: true,
                        message: this.isQuoteForm ? 'You quote was successfully submitted' : 'Your booking was placed successfully',
                        type: 'success'
                    });
                    // clear the form so user cannot resubmit
                    this.formSubmitted = true;

                    //send google analytics data if enabled
                    if (this.$can('manage', 'google_analytics') && this.$trackingId) {
                        this.$gtag.pageview({
                            page_path: '/virtual-pageview/booking/widget/success.htm',
                            page_title: "Booking - Complete (Widget)"
                        })

                        this.$gtag.event('Complete', {
                            'event_category': 'Booking',
                            'event_label': 'Widget'
                        })
                    }

                    setTimeout(function () { // clear form after submission
                        location.reload();
                    }, 2000);
                }
            })
            .catch(e => {
            })
            .finally(_ => {
                this.$helpers.stopLoading('bookingForm:root');
            });
        },
        iAgreed() {
            this.termOfServiceDialogVisible = false;
          this.booking();
        },
        closeTermsDialog() {
            $('.el-loading-mask').last().hide();
            this.termOfServiceDialogVisible = false;

        }
    },
};
