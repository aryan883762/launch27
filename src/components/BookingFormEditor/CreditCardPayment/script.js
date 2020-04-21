import StripeCard from "../../StripeCards";
export default {
    name: 'booking-form-credit-card-payment',
    components: {
        StripeCard,
        'full-steam-pay-checkout': require("@/components/FullSteamPayCheckout").default
    },
    props: {
    },
    data() {
        return {
            fsPayInstance: {},
            card: {
                added: false,
                number: null,
            },
            stripePublishableKey: '',
            stripeOptions: {
                base: {
                    iconColor: '#666EE8',
                    color: '#31325F',
                    lineHeight: '40px',
                    fontWeight: 300,
                    fontFamily: 'Helvetica Neue',
                    fontSize: '15px',
                    '::placeholder': {
                        color: '#CFD7E0'
                    },
                },
            },
            addCardCallback: null,
        };
    },
    created() {
        this.stripePublishableKey = process.env.VUE_APP_STRIPE_PK;
        this.$events.on('BookingFormEditor:addStripeCard', (callback) => {
            this.addCardCallback = callback;
            this.addStripeCard();
        });
        this.$events.on('BookingFormEditor:addFsPayCard', (callback) => {
            this.addCardCallback = callback;
            this.fsPayInstance.submitForm();
        });
    },
    computed: {
        company() {
            return this.$store.state.bookingFormEditor.company;
        },
        form() {
            return this.$store.state.bookingFormEditor.form;
        },
        paymentMethods() {
            var out = {};
            if (this.company.payment_methods) {
                out = this.company.payment_methods;
            }
            return out;
        },
        useFspay() {
            return this.paymentMethods.card_processor == 'fspay' && this.paymentMethods.fspay_available;
        },
        fullName() {
            var out = null;
            if (this.form.first_name && this.form.last_name) {
                out = this.form.first_name + ' ' + this.form.last_name;
            }
            return out;
        },
        billingAddress() {
            var out = {};
            if (this.form.address_apartment) {
                out['apartment'] = this.form.address_apartment;
            }
            if (this.form.address_street) {
                out['street'] = this.form.address_street;
            }
            if (this.form.address_city) {
                out['city'] = this.form.address_city;
            }
            if (this.form.address_state) {
                out['state'] = this.form.address_state;
            }
            if (this.form.address_zip) {
                out['zip'] = this.form.address_zip;
            }
            return out;
        }
    },
    methods: {
        onFullSteamPayMounted(fsInstance) {
            if (fsInstance) {
                this.fsPayInstance = fsInstance;
            }
        },
        onFullSteamPayTokenReceived(token) {
            this.form.cardToken = token;
            this.form.cardId = null;

            this.$set(this.card, 'number', '●●●●●●●●●●●●' + token.accountDetails.paymentAccountLast4);

            if (this.addCardCallback && typeof this.addCardCallback == 'function') {
                this.addCardCallback();
                this.addCardCallback = null;
            }
        },
        removeCard() {
            this.card = {};
        },
        addStripeCard() {
            this.$helpers.startLoading('bookingForm:payment');

            this.$refs.stripe_card.getPaymentMethod({
                name: this.fullName,
                email: this.form.email,
                phone: this.form.address_phone,
                address: {
                    line1: this.form.address_street,
                    line2: this.form.address_apartment,
                    city: this.form.address_city,
                    state: this.form.address_state,
                    postal_code: this.form.address_zip,
                    country: this.$store.state.bookingFormEditor.company.country.isoCode,
                }
            }, (result) => {
                this.$helpers.stopLoading('bookingForm:payment');
                if (result && result.payment_method_id) {
                    this.form.stripe_payment_method_id = result.payment_method_id;
                    this.card.added = true;
                    if (this.addCardCallback && typeof this.addCardCallback == 'function') {
                        this.addCardCallback();
                        this.addCardCallback = null;
                    }
                }
            })
        }
    }
};