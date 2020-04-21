import base from '../base';

export default {
    name: 'bookingFormEditorFormComponentTemplatesTextfield',
    mixins: [base],
    data() {
        return {
            googleAutocomplete: null,
            autocompleteValue: 'turnedOff',
        }
    },
    mounted() {
        if (!this.editorMode) {
            if (this.item.formId == 'address_street') {
                if (window.google && window.google.maps) {
                    this.googleAutocomplete = new google.maps.places.Autocomplete(this.$el.querySelector('input'), {types: ['address']});
                    this.googleAutocomplete.setFields(['address_component', 'geometry']);
                    this.googleAutocomplete.addListener('place_changed', this.onGeolocationChanged);
                    this.googleAutocomplete.setComponentRestrictions({country: this.$store.state.bookingFormEditor.company.country.isoCode});
                }
            }
        }
    },
    methods: {
        onGeolocationChanged() {
            var place = this.googleAutocomplete.getPlace();
            var address_components = place.address_components;
            var geolocation = {lat: place.geometry.location.lat(), lng: place.geometry.location.lng()};
            var address = this.$helpers.parseGoogleAddressComponent(address_components);

            if (address.city) {
                this.$set(this.form, 'address_city', address.city);
                this.revalidateItemByFormId('address_city');
            }
            if (address.state) {
                this.$set(this.form, 'address_state', address.state);
                this.revalidateItemByFormId('address_state');
            }
            if (address.zip) {
                this.$set(this.form, 'address_zip', address.zip);
                this.revalidateItemByFormId('address_zip');
            }
            if (address.street) {
                this.$set(this.form, 'address_street', address.street);
                this.revalidateItemByFormId('address_street');
            }

            this.$set(this.form, 'address_coordinates', geolocation);

            //reset selected service date
            this.$set(this.$store.state.bookingFormEditor.form, 'service_date_picker', null);

            this.$events.emitEvent('BookingFormEditor:showAddressMap');
        },
        onPickerChange() {
            this.onFieldChange();
            this.onFieldChangeLive();
        },
        setInputAutocomplete() {
            // fix for google places autocomplete js resetting input's autocomplete to "off"
            if (this.item.formId == 'address_street' && this.autocompleteValue) {
                if (this.autocompleteValue != this.$el.querySelector('input').getAttribute('autocomplete')) {
                    this.$el.querySelector('input').setAttribute('autocomplete', this.autocompleteValue);
                }
            }
        },
        onTextFieldFocus() {
            if (!this.editorMode) {
                if (this.hasPicker) {
                    this.$refs['picker'].focus();
                }
                this.setInputAutocomplete();
            }
        },
        revalidateItemByFormId(id) {
            const components = Object.values(this.layout.components);
            var fieldIndex = components.findIndex(item => item.formId == id);
            if (fieldIndex !== -1) {
                const keys = Object.keys(this.layout.components);
                const key = keys[fieldIndex];
                if (key) {
                    this.$events.emitEvent('BookingFormEditor:resetFieldValidation', [key]);
                    this.$events.emitEvent('BookingFormEditor:validateField', [key]);
                }
            }
        }
    },
    computed: {
        fieldType() {
            return this.item.fieldType ? this.item.fieldType : 'text';
        },
        finalFieldType() {
            return this.hasPicker ? 'text' : this.fieldType;
        },
        hasPicker() {
            return ['date', 'time'].indexOf(this.fieldType) !== -1;
        }
    }
}