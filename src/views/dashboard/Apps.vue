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
                        <el-button v-if="app.CompanyApplication && !app.CompanyApplication.cancelled" type="info" icon="el-icon-preview" round size="mini"
                                   @click="$router.push({ name: plan_key_routes[app.plan_key] })">View</el-button>
                        <a type="button" v-if="app.CompanyApplication && !app.CompanyApplication.cancelled" class="last el-button--mini deactivate-btn" :class="{'disabled':checkCancelled(app)}"  @click="appDialog(app,'cancel_dialog')">
                           <span>
                            Deactivate App</span>
                        </a>           
                        <el-button v-else-if="$can('manage',app.plan_key.replace('plan','purchase')) || (app.CompanyApplication && app.CompanyApplication.cancelled)" type="primary" round size="mini"
                                   @click="appDialog(app,'activate_dialog')">Activate</el-button>
                        <template v-else>
                            <el-button type="primary" round size="mini" @click="appDialog(app,'purchase_dialog')">Purchase</el-button>
                            <label class="app-price">{{"$"+app.price }}</label>
                        </template>
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
        <el-dialog :visible.sync="showDialog"  :append-to-body="true" class="app-modal-popup">
            <div v-if="dialog.appActivation || dialog.appDeActivation" class="app-model-popup-body">
                <el-avatar :src="require(`@/assets/svgs/apps/${selectedApp.key}.svg`)"
                        shape="square" 
                        :size="64" 
                        style="float:left; margin-right: 10px;background:white;"
                        class="dialog-app-icon"></el-avatar>
                <h2 :class="dialog.appActivation?'activate':'deactivate'">{{ dialog.title }}</h2> 
                <p>{{ dialog.subTitle }}</p>      
                <el-button v-if="dialog.click === 'purchase_dialog'" type="primary" round size="mini" @click="showCardModal">Purchase App</el-button>
                <el-button v-if="dialog.click === 'activate_dialog'" type="primary" round size="mini" @click="activateApp">Activate App</el-button>
                <el-button v-if="dialog.click === 'cancel_dialog'" type="danger" round size="mini" @click="cancelApp">Remove App</el-button>    
                <div v-for="text in dialog.texts" :key="text" class="dialog-text">
                    <span>{{ text }}<br/></span>
                </div>
                <span class="dialog-footer-text">{{ dialog.footerText }}</span>
            </div>
        </el-dialog>
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
                loading: false,
                showDialog: false,
                dialog: {},
                summary: {}
            };
        },

        created() {
            this.fetchSystemApplications();
        },

        methods: {
            fetchSystemApplications() {
                this.axios.get('/company_applications/list')
                .then(response => {
                    if (response.data) {
                        this.system_apps = response.data;
                    }
                })
                .catch(err => {
                    this.$helpers.errorHandle(err);
                });
            },
            showCardModal(){
                this.showSummary = false
                if (this.fsPayInstance) {
                    this.fsPayInstance.showModal();
                }
            },
            async appDialog(app,type){
                this.selectedApp = app;
                this.dialog.appActivation = false;
                this.dialog.appDeActivation = false;
                this.dialog.subTitle = app.description;
                this.dialog.footerText = `By proceeding you are agreeing to Launch27's Terms of Service.`;  

                if(type === 'purchase_dialog'){
                    await this.summaryApp(app, 'app_activation')
                    this.dialog.appActivation = true;
                    let nextBillingDate = this.$moment().endOf('month').add(1,'days').format(this.$date_format);
                    let pro_rate = this.$helpers.formatAmount(this.summary.price);
                    let app_price = this.$helpers.formatAmount(app.price);
                    let extra = this.$auth.user().company.subscription.recurring === 'monthly'?'with your subscription fee':'';
                    this.dialog.title = `You are about to purchase ${app.name}`;
                    this.dialog.texts = [`You will be charged $${pro_rate} immediately upon activation and 
                        $${app_price} next month on ${nextBillingDate} ${extra}. Charges will occur monthly. Deactivate to remove the app 
                        from your account and to stop billing.`];  
                }
                if(type === 'activate_dialog'){
                    this.dialog.appActivation = true;
                    this.dialog.title = `You are about to activate ${app.name}`;
                    this.dialog.texts = [`This app is already purchased for the current month, proceed to
                     setup and start using.`];  
                }
                if(type === 'cancel_dialog'){
                    this.dialog.appDeActivation = true;
                    this.dialog.title = `Your are about to deactivate ${app.name}`;
                    this.dialog.texts = [`By removing this app you will no longer have access to its date or any
                        features associated with the app, You will also no longer be billed for usages.
                        You can reactive at any time to begin using again.`];   
                }
                this.dialog.click = type;
                this.showDialog = true;
            },
            async summaryApp(app, type){
                try{
                    this.loading = true;
                    let result = await this.axios.get('/company_applications/summary', {
                        params: {
                            appKey: app.key
                        }
                    })
                    if(result && result.data)
                        this.summary = result.data;
                }catch(err){
                    this.$helpers.errorHandle(err);
                }
                this.loading = false;
            },
            activateApp(){
                this.showDialog = false;
                this.loading = true;
                this.axios.post('company_applications/activate',{
                    appKey: this.selectedApp.key
                })
                .then(response => {
                    this.reloadAuth(" successfully activated");
                })
                .catch(err => {
                    this.$helpers.errorHandle(err);
                })
                .finally(() => {
                    this.loading = false;
                })
            },
            buyApp(cardInfo){
                this.loading = true;
                this.showDialog = false;
                this.axios.post('/company_applications/buy', {
                    appKey: this.selectedApp.key,
                    user: this.$auth.user(),
                    cardInfo: cardInfo
                })
                .then(response => {
                    if(response.data){
                        this.reloadAuth(" successfully purchased");
                    }
                })
                .catch(err => {
                    this.$helpers.errorHandle(err);
                })
                .finally(() => {
                    this.loading = false;
                })
            },
            cancelApp(){
                this.showDialog = false;
                this.loading = true;
                this.axios.post('/company_applications/cancel', {
                    appKey: this.selectedApp.key
                })
                .then(response => {
                    if(response.data){
                        this.reloadAuth(" cancelled");
                        this.loading = false;
                    }
                })
                .catch(err => {
                    this.$helpers.errorHandle(err);
                    this.loading = false;
                });
            },
            reloadAuth(text){
                this.$auth.fetch({
                    params: {},
                    success: () => {
                        this.$helpers.successHandle(this.selectedApp.name+text);
                        this.fetchSystemApplications();
                    }
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
            .deactivate-btn {
                float: right;
                &.disabled {
                cursor: not-allowed;
                pointer-events: none;
                  span {
                      border-bottom: 1px solid #cccccd87; 
                      color: #afb0b2;
                  }
                }
                span {
                    border-bottom: 1px solid rgba(144, 147, 153, 0.44);
                    color: rgb(144, 147, 153);
                }
            }
        }
    }
    .app-modal-popup {
        .app-model-popup-body {
          padding: 0px 42px 10px 42px;
          text-align: center;
          button {
            margin: 10px 0 0 0;
            padding: 12px 30px;
            font-size: 15px;
          }
          h2{
            word-break: break-word;  
            &.activate {
               color: #1fb6ff;
            }
            &.deactivate {
              color: #606266;
            }
          }
          p {
              font-weight: 500;
          }
          span.dialog-footer-text {
              font-style: italic;
          }
          div.dialog-text {
            word-break: break-word;
            margin: 25px 0px 25px 0px;
            span {
              font-style: italic;
            }
          }
        }
        .dialog-app-icon {
            margin-right: 0 !important;
            float: unset !important;
            height: 100px !important;
            width: 100px !important;
        }
    }
</style>
