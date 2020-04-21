<template>
    <div class="full-steam-pay-checkout-form-wrapper">
        <div class="checkout-form-wrapper" v-loading="loading">
            <p>New Card</p>
            <el-form id="full-steam-pay-checkout-form" size="medium" label-position="top">
                <input v-model="auth_key" type="hidden" id="TransactionId" name="TransactionId"/>
                <input type="hidden" id="HostedPaymentsResponse" name="HostedPaymentsResponse"/>
                <input type="hidden" id="AccountToken" name="AccountToken"/>

                <el-row :gutter="10">
                    <el-col :span="16">
                        <el-form-item label="Card Number"
                                      :class="{ 'has-errors': fspay_validation['cc-number'] == 'invalid' }">
                            <div class="el-input el-input--medium">
                                <div class="el-input__inner" id="fullsteam-hosted-card-number-div"></div>
                            </div>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="CVV" :class="{ 'has-errors': fspay_validation['cvv'] == 'invalid' }">
                            <div class="el-input el-input--medium">
                                <div class="el-input__inner" id="fullsteam-hosted-cvv-div"></div>
                            </div>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="10">
                    <el-col :span="12">
                        <el-form-item label="Exp Month"
                                      :class="{ 'has-errors': fspay_validation['expiry-month'] == 'invalid' }">
                            <div class="el-input el-input--medium">
                                <div class="el-input__inner" id="fullsteam-hosted-expiration-month-div"></div>
                            </div>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="Exp Year"
                                      :class="{ 'has-errors': fspay_validation['expiry-year'] == 'invalid' }">
                            <div class="el-input el-input--medium">
                                <div class="el-input__inner" id="fullsteam-hosted-expiration-year-div"></div>
                            </div>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="10">
                    <el-col :span="16">
                        <el-form-item :class="{ 'has-errors': fspay_validation['name_on_card'] == 'invalid' }">
                            <el-input autocomplete="turnedOff" id="name_on_card" name="name_on_card"
                                      v-model="name_on_card" placeholder="Name on Card"
                                      @focus="onFieldFocus('name_on_card')"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item :class="{ 'has-errors': fspay_validation['zip'] == 'invalid' }">
                            <el-input autocomplete="turnedOff" id="zip" name="zip" v-model="zip" placeholder="Zip"
                                      @focus="onFieldFocus('zip')"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="10">
                    <el-col :span="12">
                        <el-form-item :class="{ 'has-errors': fspay_validation['address1'] == 'invalid' }">
                            <el-input autocomplete="turnedOff" id="address1" name="address1" v-model="address1"
                                      placeholder="Address line 1" @focus="onFieldFocus('address1')"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item :class="{ 'has-errors': fspay_validation['address2'] == 'invalid' }">
                            <el-input autocomplete="turnedOff" id="address2" name="address2" v-model="address2"
                                      placeholder="Address line 2" @focus="onFieldFocus('address2')"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="10">
                    <el-col :span="8">
                        <el-form-item :class="{ 'has-errors': fspay_validation['city'] == 'invalid' }">
                            <el-input autocomplete="turnedOff" id="city" name="city" v-model="city" placeholder="City"
                                      @focus="onFieldFocus('city')"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item :class="{ 'has-errors': fspay_validation['state'] == 'invalid' }">
                            <el-input autocomplete="turnedOff" id="state" name="state" v-model="state"
                                      placeholder="State" @focus="onFieldFocus('state')"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item :class="{ 'has-errors': fspay_validation['country'] == 'invalid' }">
                            <el-select autocomplete="turnedOff" id="country" v-model="country" clearable filterable
                                       placeholder="Country" @focus="onFieldFocus('country')">
                                <el-option v-for="(country, countryCode) in countries" :key="countryCode"
                                           :label="countryCode" :value="countryCode">{{countryCode}} - {{ country.name }}
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <p><img :src="require('@/assets/icons/cards/credit-cards-logo.png')"/></p>
                <p>I authorize {{merchantName}} to charge my credit card above for agreed upon purchases. I understand
                    that my information will be saved to file for further transactions on my account.</p>
                <el-form-item>
                    <el-button id="full-steam-pay-checkout-form-submit-button" class="pull-right" round native-type="submit" size="small" type="primary" @click="onSubmitButtonClick">{{ buttonText }}</el-button>
                    <el-button style="margin-right: 10px;" class="pull-right" round @click="onFormCancel()" size="small" v-if="options.showCancel && isModal">Cancel</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
    window.jQuery = window.jquery = window.$ = require("jquery");
    import {countries} from "countries-list";

    export default {
        name: "full-steam-pay-checkout-form",
        props: {
            options: Object,
            isModal: Boolean,
            onMounted: Function,
        },
        data() {
            return {
                initialized: false,
                js_loaded: false,
                loading: false,
                auth_key: null,
                name_on_card: null,
                address1: null,
                address2: null,
                city: null,
                state: null,
                zip: null,
                country: null,
                fspay_validation: {},
                card_type: null,
                countries: countries,
            };
        },
        created() {
            this.$events.addListener("js-loaded", id => {
                if (id == "fullsteampay-hosted-controls") {
                    if (!this.js_loaded) {
                        this.js_loaded = true;
                        this.loading = false;
                        this.initialize();
                    }
                }
            });
            this.initializeControlsJs();
        },
        mounted() {
            this.name_on_card = this.options.nameOnCard;
            var address = this.options.billingAddress || {};
            this.zip = address.zip;
            this.address1 = address.street;
            this.city = address.city;
            this.state = address.state;
            this.country = this.options.company && this.options.company.country && this.options.company.country.isoCode ? this.options.company.country.isoCode : null;
            this.initialize();

            if (typeof this.onMounted == "function") {
                this.onMounted(this);
            }
        },
        methods: {
            initializeControlsJs() {
                if (!this.js_loaded) {
                    this.loading = true;
                    this.$helpers.loadJs(process.env.VUE_APP_FULLSTEAMPAY_HOSTED_CONTROLS_JS_URL, "fullsteampay-hosted-controls");
                }
            },
            initialize() {
                if (!this.initialized) {
                    if (this.js_loaded) {
                        this.showForm();
                        this.initialized = true;
                    }
                }
            },
            showForm() {
                this.requestAuthKey();
            },
            hideForm() {
                this.$emit("command", "hide-form");
                if (this.isModal && !this.options.showExistingCards) {
                    this.$emit("command", "close-modal");
                }
            },
            onFormCancel() {
                if (typeof this.options.onCancel == "function") {
                    this.options.onCancel();
                }
                this.hideForm();
            },
            requestAuthKey() {
                this.loading = true;
                this.axios
                    .get("/FullSteamPay/authKey/" + this.options.transactionType, {
                        params: {
                            merchantCompanyId: this.options.merchantCompanyId,
                            subscription: this.options.subscription
                        }
                    })
                    .then(response => {
                        if (response && response.data && response.data.authenticationKey) {
                            this.auth_key = response.data.authenticationKey;
                            this.buildControls();
                        } else {
                            this.$helpers.errorHandle("Payments are currently unavailable");
                            this.onFormCancel();
                        }
                    })
                    .catch(error => {
                        this.$helpers.errorHandle("Payments are currently unavailable");
                    })
                    .finally(_ => {
                        this.loading = false;
                    });
            },
            buildControls() {
                var self = this;
                this.registerFspayCallbacks();

                var name_split = this.name_on_card ? this.name_on_card.split(' ') : [];

                var params = {
                    authenticationKey: this.auth_key,
                    operationType: "Token",
                    cardEntryContext: "WebConsumerInitiated",
                    formId: "full-steam-pay-checkout-form",
                    nameOnAccountField: "name_on_card",
                    zipField: "zip",
                    // firstName: name_split[0] || '',
                    // lastName: name_split[1] || '',
                    address1Field: 'address1',
                    address2Field: 'address2',
                    cityField: 'city',
                    stateField: 'state',
                    countryField: 'country',
                    completionCallback: function () {
                        var cardResponse = JSON.parse(hostedPaymentsResponseJson);
                        var card = cardResponse.gatewayResponse;
                        card.cardType = self.card_type;

                        if (typeof self.options.onTokenReceived == "function") {
                            self.loading = false;
                            self.options.onTokenReceived(card);
                        }

                        if (self.isModal) {
                            if (self.options.template == "inline") {
                                self.$emit("command", "add-new-card-to-existing", card);
                            }
                            if (typeof self.options.onCancel == "function") {
                                self.options.onCancel();
                            }
                            self.hideForm();
                        }
                    }
                };
                setupFullsteamHostedPayments(params);
            },
            registerFspayCallbacks() {
                var self = this;
                window.cardNumberValid = function () {
                    self.$set(self.fspay_validation, "cc-number", "valid");
                };
                window.cardNumberInvalid = function () {
                    self.$set(self.fspay_validation, "cc-number", "invalid");
                };
                window.expirationMonthValid = function () {
                    self.$set(self.fspay_validation, "expiry-month", "valid");
                };
                window.expirationMonthInvalid = function () {
                    self.$set(self.fspay_validation, "expiry-month", "invalid");
                };
                window.expirationYearValid = function () {
                    self.$set(self.fspay_validation, "expiry-year", "valid");
                };
                window.expirationYearInvalid = function () {
                    self.$set(self.fspay_validation, "expiry-year", "invalid");
                };
                window.cvvValid = function () {
                    self.$set(self.fspay_validation, "cvv", "valid");
                };
                window.cvvInvalid = function () {
                    self.$set(self.fspay_validation, "cvv", "invalid");
                };

                window.hostedPaymentsError = function (error) {

                    console.log(error)

                    if (error.indexOf("Zip") !== -1) {
                        self.$set(self.fspay_validation, "zip", "invalid");
                    }
                    if (error.indexOf("ExpirationMonth") !== -1) {
                        self.$set(self.fspay_validation, "expiry-month", "invalid");
                    }
                    if (error.indexOf("ExpirationYear") !== -1) {
                        self.$set(self.fspay_validation, "expiry-year", "invalid");
                    }
                    if (error.indexOf("INVALID CARD INFO") !== -1) {
                        self.$set(self.fspay_validation, "cc-number", "invalid");
                    }

                    if (error.indexOf("State") !== -1) {
                        self.$set(self.fspay_validation, "state", "invalid");
                    }

                };

                window.showPleaseWait = function () {
                    self.loading = true;
                };
                window.hidePleaseWait = function () {
                    self.loading = false;
                };

                window.cardNumberTypeChanged = function (type) {
                    self.card_type = type && type != "unknown" ? type : null;
                };
            },
            onSubmitButtonClick(e) {
                var validated = true;
                ['name_on_card', 'address1', 'city', 'state', 'zip', 'country'].forEach((field) => {
                    if (!this[field]) {
                        this.$set(this.fspay_validation, field, 'invalid');
                        validated = false;
                    }
                });

                if (!validated) {
                    if (e) e.preventDefault();
                    return false;
                }
            },
            submitFormByButton() {
                this.$el.querySelector('#full-steam-pay-checkout-form-submit-button').click();
            },
            onFieldFocus(field) {
                this.$set(this.fspay_validation, field, null);
            }
        },
        computed: {
            buttonText() {
                var out = "Continue";
                if (this.options.submitButtonText) {
                    out = this.options.submitButtonText;
                }
                return out;
            },
            merchantName() {
                var out = 'Launch27';
                if (this.options && this.options.company) {
                    out = this.options.company.business_name;
                }
                return out;
            }
        }
    };
</script>
