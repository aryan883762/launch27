<script>
export default {
    name: 'bookingFormEditorFormComponentTemplatesBase',
    props: {
        editorMode: Boolean,
        item: Object,
        itemId: [String, Number],
        settings: Object,
        itemStyles: Object,
        itemAttributes: Object,
        layout: Object,
    },
    data() {
        return {
        }
    },
    computed: {
        form() {
            return this.$store.state.bookingFormEditor.form;
        },
        hasValidation() {
            return !this.editorMode && (this.item.required || this.itemAttributes.required || this.item.validation || this.item.fieldType);
        },
        isLoading() {
            var out = false;
            if (this.item.formId == 'serviceIds') {
                out = this.$helpers.isLoading('bookingForm:category-services');
            }
            return out;
        }
    },
    methods: {
        onFieldChange(emitEvents) {
            emitEvents = emitEvents || true;
            if (this.form.hasOwnProperty(this.item.formId)) {
                if (typeof this.form[this.item.formId] == 'string') {
                    this.form[this.item.formId] = this.form[this.item.formId].trim();
                }
            }

            if (emitEvents) {
                if (['gift_card_code', 'discount_code', 'tip'].indexOf(this.item.formId) !== -1) {
                    this.$events.emitEvent('BookingFormEditor:updatePricing');
                }

                if (this.item.formId) {
                    this.$events.emitEvent('BookingFormEditor:formFieldUpdated', [this.item.formId]);
                }
            }
        },
        onFieldBlur() {
            if (this.hasValidation) {
                this.$events.emitEvent('BookingFormEditor:validateField', [this.itemId]);
            }
        },
        onFieldChangeLive() {
            if (this.hasValidation) {
                this.$events.emitEvent('BookingFormEditor:resetFieldValidation', [this.itemId]);
            }

            if (this.item.formId) {
                this.$events.emitEvent('BookingFormEditor:formFieldUpdated', [this.item.formId]);
                if (this.item.formId == 'service_category') {
                    this.fetchCategoryServices();
                }
            }
        },
        fetchCategoryServices(id) {
            id = id || this.form['service_category'];
            this.$set(this.form, 'serviceIds', []);
            this.$store.state.bookingFormEditor.categoryServices = [];
            if (id) {
                this.$helpers.startLoading('bookingForm:category-services');
                var url = '/service_categories/' + id + '/services';
                var params = {
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
                            },
                        ],
                    }
                };

                if (id == 'none') {
                    url = '/services/no-categories';
                    params.filter.include.push('service_categories');
                }
                
                this.axios({url: url, params: params, method: 'GET'})
                    .then(response => {
                        if (response.data) {
                            /*if (id == 'none') {
                                this.$store.state.bookingFormEditor.categoryServices = response.data.filter(o => !o.service_categories || !o.service_categories.length);
                            }
                            else {*/
                                this.$store.state.bookingFormEditor.categoryServices = response.data;
                            //}
                        }
                    })
                    .catch(e => { 
                        console.log(e);
                    })
                    .finally(_ => {
                        this.$helpers.stopLoading('bookingForm:category-services');
                    });
            }
        },
    }
}
</script>