<template>
    <div style="background:white; padding: 20px;">
        <el-row>
            <el-col>
                <el-row :gutter="20" class="account-plans" v-loading="loading">
                    <el-col>
                        <h3 class="block-center text-center">
              <span v-if="!$can('manage', 'role_super_admin')">
              {{ profile.first_name }}, upgrade your local business toolkit
              </span>
                            <small class="block-center">
                                Switch plans or cancel any time
                            </small>
                        </h3>

                        <div class="block-center divider-3x"/>

                        <el-radio-group class="text-center round no-border" size="small"
                                        v-model="subscription.recurring">
                            <el-radio-button label="monthly">MONTHLY BILLING</el-radio-button>
                            <el-radio-button label="annual">ANNUAL BILLING</el-radio-button>
                        </el-radio-group>

                        <div class="block-center divider-3x"/>
                    </el-col>

                    <el-col>
                        <el-row :gutter="40">
                            <el-col :key="plan.name" :md="6" :sm="6" :xs="24" v-for="plan in available_plans">
                                <el-card :class="getCardClass(plan)" shadow="hover">
                                    <h3 class="text-center">{{ plan.name }}</h3>
                                    <h5 class="text-center" v-if="plan.description">({{ plan.description }})</h5>

                                    <span class="plan-price"> <i>$</i>{{ subscription.recurring === "monthly" ? plan.amount : getAnnualAmount(plan) }} </span>

                                    <ul>
                                        <li v-if="plan.discount > 0 && subscription.recurring === 'annual'">
                                            <i class="el-icon-discount"></i>
                                            <span
                                            >Annual savings: <strong>{{ company_currency }}{{ getDiscount(plan) }}</strong></span
                                            >
                                        </li>
                                        <li v-for="item in plan.list">
                                            <i class="el-icon-check"></i>
                                            <span>{{ item }}</span>
                                        </li>
                                    </ul>

                                    <!-- <el-button @click="changeSubscription(plan.id)" :class="plan.id" round :disabled="subscription.plan_id == plan.id">{{ subscription.plan_id == plan.id ? "Current Plan" : plan.name }}</el-button> -->
                                    <full-steam-pay-checkout
                                            :account-id="user.id"
                                            :amount="subscription.recurring === 'monthly' ? plan.amount : getAnnualAmount(plan)"
                                            :button-class="plan.id"
                                            :button-disabled="subscription.plan_id == plan.id"
                                            :button-text="plan.name"
                                            :name-on-card="user.first_name + ' ' + user.last_name"
                                            :on-card-selected="onFullSteamPayCardSelected"
                                            :on-mounted="onFullSteamPayMounted"
                                            :on-token-received="onFullSteamPayTokenReceived"
                                            :show-button="false"
                                            :zip-code="user.zip"
                                            :subscription="true"
                                            template="modal"
                                            transaction-type="token"
                                            v-if="plan.id != 'free'"
                                    />

                                    <el-button type="primary" size="small" :class="plan.id" :disabled="subscription.plan_id === plan.plan_id"
                                               @click="changeSubscription(plan.id)" round>Choose {{ subscription.plan_id === plan.plan_id ? "Current Plan" : plan.name }}
                                    </el-button>
                                </el-card>
                            </el-col>
                        </el-row>
                    </el-col>

                    <el-col :md="24" :sm="24">
                        <div class="flex-row-center bottom-line">
                            <span>Last Payment : {{ $moment(subscription.dateOfLastPayment).format("MMM, Do YYYY hh:mm:ss A") }}</span>
                            <span>Upcoming Payment : --</span>
                            <span>
                                <el-button @click="showPayments()" size="mini" type="text" v-if="!$can('manage', 'role_super_admin')">VIEW PAYMENT HISTORY</el-button>
                            </span>
                        </div>
                    </el-col>
                </el-row>
            </el-col>
        </el-row>

    </div>
</template>

<script>
    import FullSteamPayCheckout from "@/components/FullSteamPayCheckout";
    import currencyData from 'currency-data';

    export default {
        props: {
            profile: {
                type: Object,
                required: true
            }
        },
        components: {
            "full-steam-pay-checkout": FullSteamPayCheckout
        },
        data: () => {
            return {
                subscription: {},
                loading: true,
                company: false,
                available_plans: [],
                user: {},
                selected_plan: null,
                fsPayInstance: null,
                company_currency: ''
            };
        },
        watch: {},

        created() {
            this.getCompanyPlan();
            this.$events.emitEvent('track-page')
        },

        mounted() {
            if (this.$can("manage", "role_super_admin")) {
                this.user = this.profile;
            } else {
                this.user = this.$auth.user();
            }
        },

        methods: {
            changeSubscription(plan_id) {
                this.selected_plan = plan_id;

                //check what payment gateway to use Stripe or Launch27 Pay based on Country
                if (this.fsPayInstance) {
                    this.fsPayInstance.showModal();
                }
                return false;

                //first what is the amount to charge
                //is there a trial period?
                //get plan charge and payment method

                this.loading = true;

                this.axios
                    .get("/subscriptions/upgrade-intent", {
                        params: {
                            sub_id: this.subscription.id,
                            plan_id: plan_id,
                            recurring: this.subscription.recurring,
                            success_url: window.location.href,
                            cancel_url: window.location.href
                        }
                    })
                    .then(res => {
                        if (res.data.payment_mode === "stripe") {
                            this.stripePayment(res.data.checkout_session_id);
                        } else {
                            this.$alert("Launch27 Pay is not yet ready");
                        }
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this);
                    })
                    .finally(_ => {
                        this.loading = false;
                    });
            },

            stripePayment(checkout_session_id) {
                let stripe = Stripe(process.env.VUE_APP_STRIPE_PK);
                this.loading = true;

                stripe
                    .redirectToCheckout({
                        // Make the id field from the Checkout Session creation API response
                        // available to this file, so you can provide it as parameter here
                        // instead of the {{CHECKOUT_SESSION_ID}} placeholder.
                        sessionId: checkout_session_id
                    })
                    .then(result => {
                        // If `redirectToCheckout` fails due to a browser or network
                        // error, display the localized error message to your customer
                        // using `result.error.message`.
                        this.loading = false;
                        this.$helpers.errorHandle(result.error.message);
                    });
            },

            showPayments() {
                this.$events.emitEvent("account:profile:change-tab", ["payment"]);
            },
            getCardClass(plan) {
                let data = {current: this.subscription.plan_id === plan.plan_id, 'plan-card': true};
                switch (plan.id) {
                    case "free":
                        data.free = true;
                        break;

                    case "small_team":
                        data.start_up = true;
                        break;

                    case "expansion":
                        data.scaling = true;
                        break;

                    case "enterprise":
                        data.enterprise = true;
                        break;
                }

                return data;
            },
            getAnnualAmount(plan) {
                return ((plan.amount) * 12).toFixed(0);
            },
            getDiscount(plan) {
                let discount = plan.amount * (plan.discount / 100);
                return (discount * 12).toFixed(0);
            },
            onFullSteamPayMounted(fsInstance) {
                if (fsInstance) {
                    this.fsPayInstance = fsInstance;
                }
            },
            onFullSteamPayTokenReceived(token) {
                this.performUpgrade({cardToken: token});
            },
            onFullSteamPayCardSelected(cardId) {
                this.performUpgrade({cardId: cardId});
            },
            performUpgrade(params) {
                this.loading = true;

                var _url = "/bookings";
                if (this.paymentFor == "subscription") _url = "/subscriptions/upgrade";
                if (this.paymentFor == "gift-card") _url = "/gift_cards";

                var _params = Object.assign({}, params);
                _params.planId = this.selected_plan;
                _params.recurring = this.subscription.recurring;
                _params.userId = this.user.id;

                this.axios({method: "POST", url: "/subscriptions/upgrade", data: _params})
                    .then(response => {
                        if (this.$can("manage", "role_super_admin")) {
                            this.getCompanyPlan();
                        } else {
                            this.showPayments();
                        }
                    })
                    .catch(error => {
                        this.$helpers.errorHandle(error, this)
                    })
                    .finally(_ => {
                        this.loading = false;
                    });
            },
            getCompanyPlan() {
                //get company susbscription
                this.loading = true;

                let getCompany = context => {
                    return new Promise((resolve, reject) => {
                        let url = '/companies/current';
                        // for superadmin we get the company from the url
                        if (this.$can("manage", "role_super_admin")) {
                            url = '/companies/' + this.$route.params.id;
                        }
                        this.axios
                            .get(url, {params: {filter: {include: "subscription"}}})
                            .then(res => {
                                if (res.data && res.data.subscription) {
                                    context.subscription = res.data.subscription;
                                    context.company = res.data;
                                }
                                // to display superadmin selected company currency
                                if (res.data && res.data.currency) {
                                    this.company_currency = res.data.currency.symbol
                                } else if (res.data && res.data.country) {
                                    let primaryCurrencyISOCode = res.data.country.currency.split(',')[0];
                                    this.company_currency = currencyData.getCurrencyByCurrencyISOCode(primaryCurrencyISOCode).symbol;
                                }
                                return resolve();
                            })
                            .catch(err => {
                                return reject(err);
                            });
                    });
                };

                let getAvailablePlans = context => {
                    return new Promise((resolve, reject) => {
                        let params = {};
                        if (this.$can("manage", "role_super_admin")) {
                            params = {all: true};
                        }else{
                            params.version = context.company.version;
                        }
                        this.axios
                            .get("/subscriptions/available-plans", {params: params})
                            .then(res => {
                                context.available_plans = res.data;
                                resolve();
                            })
                            .catch(err => {
                                reject(err);
                            });
                    });
                };

                async function fetchData(context) {
                    try {
                        await getCompany(context);
                        await getAvailablePlans(context);
                        context.loading = false;
                    } catch (err) {
                        context.loading = false;
                    }
                }

                fetchData(this).then(() => {
                });
            }
        }
    };
</script>

<style lang="scss">
    .account-plans {


        h3 {
            small {
                font-weight: normal;
            }
        }

        .el-radio-group {
            margin: 0 auto;
            display: block;
            width: 320px;
        }

        .bottom-line {
            justify-content: space-evenly;
            margin: 40px 0px;
            font-size: 13px;
        }

        .plan-price {
            text-align: center;
            width: 100%;
            display: block;
            font-size: 40px;
            font-weight: 500;

            i {
                font-style: normal;
                font-size: 17px;
            }
        }

        .el-card {
            &.free {
                plan-price {
                    color: black;
                }

                .el-button {
                    background-color: black;
                    color: white;
                    border: none;
                }
            }

            &.small_team {
                .plan-price {
                    color: #1fde16;
                }

                .el-button {
                    background-color: #1fde16;
                    color: white;
                    border: none;
                }
            }

            &.scaling {
                .plan-price {
                    color: #e4ba14;
                }

                .el-button {
                    background-color: #e4ba14;
                    color: white;
                    border: none;
                }
            }

            &.enterprise {
                .plan-price {
                    color: #f98329;
                }

                .el-button {
                    background-color: #f98329;
                    color: white;
                    border: none;
                }
            }

            &.current {
                .plan-price {
                    color: #1fb6ff;
                }

                .el-button {
                    background-color: white;
                    border: none;
                    color: #1fb6ff;
                }
            }
        }

        .el-card__body {
            /*height: 400px;*/

            ul {
                min-height: 260px;
                list-style: none;
                padding-left: 20px;
                white-space: normal;
                word-break: break-word;

                li {
                    font-size: 12px;
                    margin-bottom: 15px;

                    .el-icon-check {
                        color: #1fb6ff;
                        font-weight: 600;
                        font-size: 15px;
                        display: inline-block;
                        float: left;
                        margin-right: 5px;
                    }

                    .el-icon-discount {
                        color: red;
                        font-size: 15px;
                        display: inline-block;
                        float: left;
                        margin-right: 5px;
                    }

                    span {
                        display: inline-block;
                        width: calc(100% - 40px);
                    }
                }
            }

            .el-button {
                margin: 0 auto;
                display: block;
            }
        }

        .plan-card {
            margin-bottom: 20px;
        }
    }
</style>
