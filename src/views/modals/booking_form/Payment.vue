<template>
    <el-card>
        <el-form :model="model" :rules="rules" label-position="top" ref="form">
            <el-form-item label="Choose payment method" prop="payment_type">
                <el-radio-group v-model="model.payment_type" @change="validate">
                    <el-radio label="card" v-if="methods.card">Card</el-radio>
                    <el-radio label="cash" v-if="methods.cash">Cash</el-radio>
                    <el-radio label="check" v-if="methods.check">Check</el-radio>
                </el-radio-group>
            </el-form-item>

            <template v-if="model.payment_type === 'card'">
                <template v-if="!rootModel.account && !rootModel.account_id">
                    <template v-if="authUser.company && authUser.company.payment_methods.card_processor === 'fspay'">
                        <el-form-item v-if="model.payment_type === 'card'">
                            <full-steam-pay-checkout
                                    :account-id="rootModel.account_id || rootModel.accountId"
                                    :billing-address="rootModel.address"
                                    :company="authUser.company"
                                    :merchant-company-id="authUser.companyId"
                                    :name-on-card="rootModel.first_name + ' ' + rootModel.last_name"
                                    :on-card-selected="onFullSteamPayCardSelected"
                                    :on-mounted="onFullSteamPayMounted"
                                    :on-token-received="onFullSteamPayTokenReceived"
                                    :show-button="false"
                                    :show-existing-cards="false"
                                    submitButtonText="Add Card"
                                    template="inline"
                                    transaction-type="token"
                            />
                        </el-form-item>
                    </template>
                    <template v-else>
                        <template v-if="model.payment_type === 'card'">
                            <el-form-item>
                                <stripe-card ref="stripe_card" :root-model="rootModel" @change="complete = $event.complete" :inline="true" @card-ready="cardReady"></stripe-card>
                            </el-form-item>
                        </template>
                    </template>
                </template>
                <template v-else>
                    <account-cards :account.sync="account" :delete-button="false" :add-button="true" v-model="model.cardId"></account-cards>
                </template>
            </template>

        </el-form>
    </el-card>
</template>

<script>
    import StripeCard from "../../../components/StripeCards";
    import AccountCards from "../../../components/AccountCards";

    export default {
        components: {
            AccountCards,
            StripeCard,
            "full-steam-pay-checkout": require("@/components/FullSteamPayCheckout").default
        },
        props: {
            rootModel: Object,
            booking: {}
        },

        data: () => {
            return {
                complete: false,
                stripeOptions: {
                    base: {
                        iconColor: "#666EE8",
                        color: "#31325F",
                        lineHeight: "40px",
                        fontWeight: 300,
                        fontFamily: "Helvetica Neue",
                        fontSize: "15px",

                        "::placeholder": {
                            color: "#CFD7E0"
                        }
                    }
                },
                methods: {},
                loading: false,
                stripe_publishable_key: "",
                rules: {
                    payment_type: [{message: "Choose method of payment", required: true, trigger: "blur"}]
                },
                model: {
                    payment_type: "",
                    stripe_payment_method_id: "",
                    stripe_event: false,
                    cardId: false
                },
                fsPayInstance: {},
                account: {},
                callback: false
            };
        },

        watch: {
            model: {
                handler(val, oldval) {
                    this.validate();
                },
                deep: true
            },
            booking(val) {
                if (val) {
                    this.model.payment_type = this.booking.payment_type
                    this.model.stripe_payment_method_id = this.booking.stripe_payment_method_id
                }
            },
            rootModel(val) {
                if (val.account || val.account_id) {
                    this.account = (val.account || {id: val.account_id})
                }
            }
        },
        created() {
            this.stripe_publishable_key = process.env.VUE_APP_STRIPE_PK;

            this.axios
                .get("/companies/current/payment_methods")
                .then(res => {
                    this.methods = res.data;
                })
                .catch()
                .finally(_ => {
                    this.loading = false;
                });

            if (this.rootModel.account || this.rootModel.account_id) {
                this.account = (this.rootModel.account || {id: this.rootModel.account_id})
            }
        },
        mounted() {
            if (this.booking) {
                this.model.payment_type = this.booking.payment_type
                if (this.booking.charge && this.booking.charge.cardId) {
                    this.model.cardId = this.booking.charge.cardId
                }
            }

        },
        methods: {
            validate() {
                return new Promise((resolve, reject) => {
                    this.$refs.form.validate(valid => {
                        this.$emit("on-validate", valid, this.model);
                        resolve(valid);
                    });
                });
            },

            cardReady(event) {

            },

            getPaymentMethod(cb) {
                this.$refs.stripe_card.getPaymentMethod(null, (result) => {
                    cb(result)
                })
            },

            setupCard() {
                this.axios
                    .post("/payment_gateways/setup_intent", {})
                    .then(res => {
                        handleCardSetup(res.data.client_secret, {
                            payment_method_data: {
                                billing_details: {
                                    name: this.rootModel.first_name + ' ' + this.rootModel.last_name
                                }
                            }
                        }).then(res => {
                        });
                    })
                    .catch()
                    .finally(_ => {
                    });
            },
            submitFullSteam(cb) {
                this.callback = cb
                if (this.fsPayInstance) {
                    this.fsPayInstance.submitForm()
                } else {
                    this.$helpers.errorHandle('Could not submit payment form')
                    return cb()
                }
            },
            onFullSteamPayMounted(fsInstance) {
                if (fsInstance) {
                    this.fsPayInstance = fsInstance;
                }
            },
            onFullSteamPayTokenReceived(token) {
                this.model.cardToken = token;
                this.model.cardId = null;
                this.validate()
                this.callback(this.model)
            },
            onFullSteamPayCardSelected(cardId, card) {
                if (cardId.indexOf("new:") !== -1) {
                    this.model.cardToken = card;
                    this.model.cardId = null;
                } else {
                    this.model.cardId = cardId;
                    this.model.cardToken = null;
                }
                this.validate()
                this.callback(this.model)
            }
        },
        computed: {
            authUser() {
                return this.$auth.user();
            }
        }
    };
</script>

<style lang="scss">
    .payment-section-step {
        .success,
        .error {
            display: none;
            font-size: 13px;
        }

        .success.visible,
        .error.visible {
            display: inline;
        }

        .error {
            color: #e4584c;
        }

        .success {
            color: #666ee8;
        }

        .success .token {
            font-weight: 500;
            font-size: 13px;
        }
    }

    /**
     * The CSS shown here will not be introduced in the Quickstart guide, but shows
     * how you can use CSS to style your Element's container.
     */
    .StripeElement {
        box-sizing: border-box;
        height: 44px;
        padding: 10px 12px;

        border: 1px solid #333;
        border-radius: 4px;
        background-color: white;

        box-shadow: 0 1px 3px 0 #e6ebf1;
        -webkit-transition: box-shadow 150ms ease;
        transition: box-shadow 150ms ease;
    }

    .StripeElement--focus {
        box-shadow: 0 1px 3px 0 #cfd7df;
    }

    .StripeElement--invalid {
        border-color: #fa755a;
    }

    .StripeElement--webkit-autofill {
        background-color: #fefde5 !important;
    }
</style>
