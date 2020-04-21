<template>
    <div>
        <el-dialog :close-on-press-escape="true" :fullscreen="true" :modal="true" appendToBody :visible.sync="showModal" @close="settingsRedirect" custom-class="fullscreen-modal-display" title="Payment Gateways">
            <div class="modal-body payment-setup" v-loading="loading">
                <el-row :gutter="10">
                    <el-col :md="16" :sm="16" :xs="24">
                        <el-card>
                            <el-row style="margin-top:20px;" v-if="company.payment_methods.card_processor === 'stripe'">
                                <el-col :sm="16">
                                    <svg height="42px" width="100px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                                        <image
                                                height="36px"
                                                width="100px"
                                                x="0px"
                                                xlink:href="data:img/png;base64,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"
                                                y="0px"
                                        />
                                    </svg>
                                    <p>Accept credit cards by enabling your payment method here. If you don’t yet have a Stripe account, apply for one here to begin processing credit cards.</p>
                                </el-col>
                                <el-col :sm="8">
                                    <el-button @click="stripeConnect()" class="pull-right" round size="small" type="primary" v-if="!payment_settings.hasOwnProperty('stripe_user_id')">Enable Stripe</el-button>
                                    <el-button @click="stripeDisconnect" class="pull-right" icon="el-icon-check" round size="small" type="success" v-if="payment_settings.hasOwnProperty('stripe_user_id')">Connected</el-button>
                                </el-col>
                            </el-row>

                            <el-row style="margin-top:20px;" v-else>
                                <el-col :sm="16">
                                    <svg height="18px" width="120px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                                        <image
                                                height="18px"
                                                width="120px"
                                                x="0px"
                                                xlink:href="data:img/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIcAAAAYCAMAAADnCR6uAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAYFBMVEUAAAD/hgT/hgT/hgT/hgT/hgT/hgRyc3X/hgT/hgT/hgT/hgT/hgT/hgT/hgRyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3Vyc3X/hgRyc3X/hgT///8q9MMLAAAAHXRSTlMAM4i77kQiu2YR3cx3qpkiiO5md8zdEaozVZlEVYVmdPkAAAABYktHRB8FDRC9AAAAB3RJTUUH4wIbFAcyPWWMmQAAAklJREFUSMfFlu2WgiAQhjEqNG0LUfIjuv/LXGAGBUSrPZ12fuwiDDMPr8MkIR82pW05m+3o4/HY011mHw+PyI6EJfd9luNI54w0S3EcvsGR7YOc+T/pUZxsqpLSEpJmCw5KvsBRmUzno0Xa2bG/eobX8gUO6qe2UN7iEeX4AscPpTRzDwUef1p0zx7H5aofOKttMBaGRDdmF4T+11wvU7CLYFy1rJaOQ4pGqfZWJzhDjkmOmUPeFFrTbXJ0LfphGnl1G9sONvUcJ5iMMQ5wOxZyTByyUZM1Wxx89qvjja0kKrBbhJGbK7xPyDFxWDWGkciewVHWOAynENadm+OCGg3TKnHUQwOhh+qwLO7VWZcJ3NIqlOPuJxg9oYcnHMJMjBxGF0thamVkHdYHeHTG42qP/eM3i7IIivYUJBjcHmPtJgdqLWBo5Gi8MrCywrCGMFE/pRMGXOJ8kaBz62KTA92MEC3M9CTkQA8JAYoZo6TVXKOwcAoTBNd+3OTwM8JfGXGEY9tDy9wDSMjxEQ6yyVHGrTwlh4vcJt6LmXPNiq9x8Kd6RB00LYd/0MHNYZ0yV/lAluZg8z17jyOUw0UWiXtr5vhoZmq+yiFcH9F1+RZHFbYSjCz5so9J17SwYyY57Eauf1pkzYdVjvjrS5v5KtkXMYe97L4xJxI2yDUO30kN8mWOPJRjjuzFcw1omuO1WOWA14h+48sckRxe5BFeiGpGcwksh/4UaPSXgJBkg4P07geYdS+/l1iOwGQvRN2R960XjN3EX3Y6+wVNBooECZNeKAAAAABJRU5ErkJggg=="
                                                y="0px"
                                        />
                                    </svg>
                                    <p>Accept credit cards by enabling your payment method here. If you don’t yet have a Launch27Pay account, <a
                                            href="https://merchantapp.io/launch27/UserAccount/Login" target="_blank">apply for one here</a> to begin processing credit cards. Only available in the US.</p>

                                    <el-alert type="warning">Contact Launch27 Support to have your Launch27Pay credentials updated if you are getting Payment Unavailable Messages</el-alert>
                                </el-col>
                                <el-col :sm="8">
                                    <el-button :disabled="!fsPayAvailable" @click="fspayModal = true" class="pull-right" round size="small" type="primary" v-if="false">
                                        <span v-if="!fsPayEnabled">Enable</span>
                                        <span v-else>Update</span>
                                    </el-button>
                                    <form :action="fspaySsoUrl" method="POST" target="blank" v-if="fspaySsoKey">
                                        <input :value="fspaySsoKey" id="AuthenticationKey" name="AuthenticationKey" type="hidden"/>
                                        <el-button class="pull-right" native-type="submit" round size="small" type="primary" style="margin-right: 5px;">Manage</el-button>
                                    </form>
                                </el-col>
                            </el-row>

                            <template v-if="fsPayAvailable">
                                <el-dialog :append-to-body="true" :visible.sync="fspayModal" @opened="onFspayModalOpened" title="Launch27 Pay Setup" v-loading="fspayLoading" width="30%">
                                    <el-form :model="fspayForm" label-position="top" ref="fspayForm" size="medium">
                                        <el-form-item :rules="[{ required: true }]" label="FullSteamPay Username" prop="username">
                                            <el-input v-model="fspayForm.username"></el-input>
                                        </el-form-item>
                                        <el-form-item :rules="[{ required: true }]" label="FullSteamPay Password" prop="password">
                                            <el-input type="password" v-model="fspayForm.password"></el-input>
                                        </el-form-item>
                                        <el-form-item :rules="[{ required: true }]" label="FullSteamPay Merchant ID" prop="merchantId">
                                            <el-input v-model="fspayForm.merchantId"></el-input>
                                        </el-form-item>
                                    </el-form>
                                    <span class="dialog-footer" slot="footer">
                    <el-button @click="fspayModal = false" round>Cancel</el-button>
                    <el-button @click="submitFspayForm" round type="primary"><span v-if="!fsPayEnabled">Enable</span><span>Update</span></el-button>
                  </span>
                                </el-dialog>
                            </template>

                            <el-divider></el-divider>

                            <span><strong>Payment Gateways</strong></span>

                            <div style="display:block; margin-top: 20px;">
                                <el-checkbox @change="updateMethod()" label="Check" v-model="payment_settings.check"></el-checkbox>
                                <el-checkbox @change="updateMethod()" label="Cash" v-model="payment_settings.cash"></el-checkbox>
                                <el-checkbox @change="updateMethod()" label="Credit/Debit Cards" v-model="payment_settings.card"></el-checkbox>
                            </div>
                        </el-card>
                    </el-col>

                    <side-help/>
                </el-row>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import SideHelp from "../components/SideHelp.vue";

    export default {
        components: {SideHelp},
        name: "SettingsPaymentSetup",
        data() {
            return {
                showModal: false,
                payment_methods: [],
                redirect_uri: "http://localhost:8080/dashboard/settings/payments-setup",
                client_id: process.env.VUE_APP_STRIPE_CA,
                payment_settings: false,
                loading: false,
                fspayModal: false,
                fspayLoading: false,
                fspayForm: {},
                fspaySsoLoading: false,
                fspaySsoKey: null,
                fspaySsoUrl: null
            };
        },

        created() {
            //get the payment gateway setup
            this.axios
                .get("/companies/current/payment_methods")
                .then(res => {
                    this.payment_settings = res.data;
                })
                .catch(err => {
                    console.log();
                })
                .finally(_ => {
                });

            this.$events.emitEvent('track-page')
        },

        mounted() {
            this.showModal = true;

            if (this.$route.query.hasOwnProperty("code") && this.$route.query.hasOwnProperty("scope")) {
                //send to backend for connect to be completed.
                let data = JSON.parse(JSON.stringify(this.$route.query));
                data.companyId = this.$auth.user().activeCompanyId;

                this.axios
                    .post("/payment_gateways/stripe-connect", data)
                    .then(res => {
                        this.payment_settings = res.data;
                        this.$router.push({name: "dashboard_settings_payments_setup"});
                    })
                    .catch(err => {
                    })
                    .then(() => {
                    });
            }
        },
        methods: {
            settingsRedirect() {
                this.$router.push({name: 'dashboard_settings'});
            },
            stripeConnect() {
                window.open("https://connect.stripe.com/oauth/authorize?response_type=code&client_id=" + this.client_id + "&scope=read_write&redirect_uri=" + process.env.VUE_APP_STRIPE_CONNECT_REDIRECT, "_self");
            },
            stripeDisconnect() {
                this.$confirm("Are sure you want to disable stripe?", "Disable Stripe", {
                    type: "warning"
                })
                    .finally(_ => {
                    })
                    .catch(_ => {
                    });
            },
            updateMethod() {
                this.loading = true;
                this.axios
                    .put("/companies/current/payment_methods", this.payment_settings)
                    .then(res => {
                        this.payment_settings = res.data;
                    })
                    .catch()
                    .finally(_ => {
                        this.loading = false;
                    });
            },
            onFspayModalOpened() {
                if (this.payment_settings.fspay_credentials) {
                    this.fspayForm = Object.assign({}, this.payment_settings.fspay_credentials);
                }
            },
            submitFspayForm() {
                this.$refs["fspayForm"].validate(valid => {
                    if (valid) {
                        this.setupFspay();
                    } else {
                        return false;
                    }
                });
            },
            setupFspay() {
                this.fspayLoading = true;
                this.axios
                    .post("/FullSteamPay/setup/company", this.fspayForm)
                    .then(response => {
                        if (response.data) {
                            this.payment_settings = response.data;
                            this.fspayModal = false;
                        }
                    })
                    .catch(error => {
                        if (error.response && error.response.data && error.response.data.error && error.response.data.error.message) {
                            this.$helpers.errorHandle(error, this);
                            ;
                        } else {
                            this.$helpers.errorHandle("There was an error processing your request");
                        }
                    })
                    .finally(_ => {
                        this.fspayLoading = false;
                    });
            },
            getFspaySsoKey() {
                this.fspaySsoLoading = true;

                const authUser = this.$auth.user();

                if (this.payment_settings.fspay_credentials)

                    this.axios
                        .get("/FullSteamPay/authKey/sso", {params: {merchantCompanyId: authUser.companyId, merchantId: this.payment_settings.fspay_credentials.merchantId, returnUrl: window.location.href}})
                        .then(response => {
                            if (response && response.data && response.data.url) {
                                this.fspaySsoKey = response.data.key;
                                this.fspaySsoUrl = response.data.url;
                            }
                        })
                        .catch(e => {
                            console.log(e);
                        })
                        .finally(_ => {
                            this.fspaySsoLoading = false;
                        });
            }
        },
        watch: {
            payment_settings: function () {
                if (this.fsPayAvailable && this.fsPayEnabled) {
                    this.getFspaySsoKey();
                }
            }
        },
        computed: {
            authUser() {
                return this.$auth.user();
            },
            company() {
                return this.authUser.company || {};
            },
            fsPayAvailable() {
                return this.payment_settings.fspay_available;
            },
            fsPayEnabled() {
                return this.payment_settings.card_processor == "fspay";
            }
        }
    };
</script>
<style lang="scss">
    .modal-body .payment-setup {

    }
</style>
