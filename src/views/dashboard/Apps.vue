<template>
    <div class="app-section apps padding-2x" v-loading=loading>
        <div class="title">
            <h2>The Launchpad</h2>
            <span>Everything You Need To Take Your Local Service Business To The Next Level</span>
            <p>Add apps to your toolkit and have instance access to extending your Launch27</p>
        </div>

        <el-row :gutter="20">
            <el-col :sm="8" :md="8" :xs="24" v-for="app in system_apps" :key="app.key">
                <el-card>
                    <el-avatar :src="require(`@/assets/svgs/apps/${app.key}.svg`)" shape="square" :size="64" style="float:left; margin-right: 10px;background:white;"></el-avatar>
                    <div class="app-description">
                        {{ app.name }}
                        <p>{{ app.description }}</p>
                    </div>
                    <el-divider></el-divider>
                    <div class="el-card__footer">
                        <el-button v-if="$can('manage', app.plan_key)" type="info" icon="el-icon-preview" round size="mini"
                                   @click="$router.push({ name: plan_key_routes[app.plan_key] })">View App</el-button>
                        <el-button v-else type="primary" round size="mini" @click="showCardModal(app)">Purchase App</el-button>
                        <el-button v-if=" false && $can('manage', app.plan_key)" type="danger" icon="el-icon-preview" round size="mini"
                                   @click="cancelApp(app)" :disabled="checkCancelled(app)"> {{checkCancelled(app) ? "Cancel Pending": "Cancel App"}}
                        </el-button>
                        <label class="app-price">{{"$"+app.price }}</label>
                    </div>
                    <full-steam-pay-checkout
                        :account-id="$auth.user().id"
                        :amount="selectedApp.price"
                        :name-on-card="$auth.user().fullname"
                        :on-card-selected="onFullSteamPayCardSelected"
                        :on-mounted="onFullSteamPayMounted"
                        :on-token-received="onFullSteamPayTokenReceived"
                        :show-button="false"
                        :subscription="true"
                        :zip-code="$auth.user().zip"
                        template="modal"
                        transaction-type="token"
                        v-if="true"
                    />
                </el-card>
            </el-col>

            <no-data v-if="system_apps.length === 0"></no-data>

        </el-row>
    </div>
</template>

<script>
    import FullSteamPayCheckout from "../../components/FullSteamPayCheckout";
    import NoData from "../../components/NoData";

    export default {
        components: {
            NoData,
            "full-steam-pay-checkout": FullSteamPayCheckout
            },
        data: () => {
            return {
                plan_key_routes: {
                    plan_gift_card: 'apps_giftcard_create',
                    plan_customer_reward: 'apps_referral',
                    plan_review_redirect: 'apps_review_settings',
                    plan_shift_clock: 'apps_shift_clock_settings',
                    plan_mobile_app: '',
                    plan_google_analytics: 'apps_google_analytics'
                },
                system_apps: [],
                fspayInstance: null,
                selectedApp: {price: 0},
                loading: false

            };
        },

        created() {
            this.fetchSystemApplications();
        },

        methods: {
            fetchSystemApplications() {
                this.axios.get('/system_applications/list', {
                params: {
                    status: "active"
                    }
                })
                .then(response => {
                    if (response.data) {
                        this.system_apps = response.data;
                    }
                })
                .catch(err => {

                });
            },
            showCardModal(app){
                this.selectedApp = app;
                if (this.fsPayInstance) {
                    this.fsPayInstance.showModal();
                }
            },
            buyApp(cardInfo){
                this.loading = true;
                this.axios.post('/company_applications/buy', {
                    appId: this.selectedApp.id,
                    user: this.$auth.user(),
                    cardInfo: cardInfo
                })
                .then(response => {
                    if(response.data){
                        this.$auth.fetch({
                            params: {},
                            success: () => {
                                this.$helpers.successHandle(this.selectedApp.name+" successfully purchased");
                                this.fetchSystemApplications();
                            }
                        });
                    }
                })
                .catch(err => {
                    this.$helpers.errorHandle(err);
                })
                .finally(() => {
                    this.loading = false;
                })
            },
            cancelApp(app){
                this.axios.post('/company_applications/cancel', {
                    appKey: app.key
                })
                .then(response => {
                    if(response.data){
                        this.$auth.fetch({
                            params: {},
                            success: () => {
                                this.$helpers.successHandle(app.name+ " cancellation pending");
                                this.fetchSystemApplications();
                            }
                        });
                    }
                })
                .catch(err => {
                    this.$helpers.errorHandle(err);
                });
            },
            checkCancelled(sys_app){
                if(sys_app && sys_app.company_applications && sys_app.company_applications.some(x => x.cancelled === true )){
                  
                  return true;
                }
                return false;
            },
            onFullSteamPayMounted(fsInstance) {
                if (fsInstance) {
                    this.fsPayInstance = fsInstance;
                }
            },
            onFullSteamPayTokenReceived(token) {
                this.buyApp({cardToken: token});
            },
            onFullSteamPayCardSelected(cardId) {
                this.buyApp({cardId: cardId});
            },
        }
    };
</script>

<style lang="scss">
    .app-section.apps {

        .title {
            text-align: center;
            margin-bottom: 20px;

            span {
                font-size: 15px;
            }

            p, h4 {
                margin: 0px;
            }
        }

        .el-card {
            margin-bottom: 20px;
            height: 180px;

            .app-description {
                min-height: 80px;
            }

            p {
                font-size: 12px;
                line-height: 1.5;
                padding-left: 74px;
            }
        }

        .el-card__footer {
            .app-price {
                font-size: 15px;
                font-weight: bold;
                float: right;
                color: #fd6e67;
            }
        }

    }
</style>
