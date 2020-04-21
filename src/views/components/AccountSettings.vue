<template>
    <div v-loading="!profile.id" class="account-settings">

        <el-row :gutter="20">
            <el-col :md="16" :sm="16" :xs="24" v-loading="loading.profile">
                <el-card>
                    <el-form :model="profile" :rules="rules" label-position="top" ref="accountSettingsFrm">
                        <el-row :gutter="40">
                            <el-col :sm="24">
                                <el-upload :action="getFileUrl()" :before-upload="beforeUpload" :headers="getHeaders()"
                                           :on-error="uploadError" :on-success="uploadSuccess" :show-file-list="false"
                                           class="avatar-uploader account-avatar-uploader">
                                    <el-avatar :size="128" :src="profile.avatar" fit="contain">
                                        <i class="el-icon-plus avatar-uploader-icon" v-if="!profile.avatar"></i>
                                    </el-avatar>
                                    <small style="display: block;">{{ profile.avatar ? "Click to change" : "Upload new avatar"}}</small>
                                </el-upload>
                            </el-col>

                            <el-col :md="12" :sm="12" :xs="24">
                                <el-form-item label="First Name" prop="first_name">
                                    <el-input type="text" v-model="profile.first_name"/>
                                </el-form-item>
                            </el-col>

                            <el-col :md="12" :sm="12" :xs="24">
                                <el-form-item label="Last Name" prop="last_name">
                                    <el-input type="text" v-model="profile.last_name"/>
                                </el-form-item>
                            </el-col>

                            <el-col :md="12" :sm="12" :xs="24">
                                <el-form-item label="Phone number" prop="phone">
                                    <el-input v-model="profile.phone"/>
                                </el-form-item>
                            </el-col>

                            <el-col :md="12" :sm="12" :xs="24">
                                <el-form-item prop="email">
                                    <span slot="label">
                                       Email <el-link style="line-height: 1;" type="primary" size="mini" :href="'mailto:support@launch27.com?subject=Change Email Request!&body=I would like to request a change of my business account email address \n <' + $auth.user().email +'>'">(Request change)</el-link>
                                    </span>
                                    <el-input disabled readonly type="email" v-model="profile.email"/>
                                </el-form-item>
                            </el-col>

                            <el-col :md="12" :sm="12" :xs="24">
                                <el-form-item label="New Password" prop="password">
                                    <el-input name="password" auto-complete="nope" type="password" v-model="profile.password"/>
                                </el-form-item>
                            </el-col>

                            <el-col :md="12" :sm="12" :xs="24">
                                <el-form-item label="Confirm Password" prop="confirm_password">
                                    <el-input name="confirmpassword" auto-complete="nope" type="password" v-model="profile.confirm_password"/>
                                </el-form-item>
                            </el-col>


                        </el-row>
                    </el-form>


                    <el-divider content-position="left">Billing Address</el-divider>
                    <br/>
                    <el-form>
                        <el-form-item label="Address">
                            <el-input placeholder="" v-model="$auth.user().company.billing_address.address"></el-input>
                        </el-form-item>
                        <el-form-item label="City">
                            <el-input placeholder="" v-model="$auth.user().company.billing_address.city"></el-input>
                        </el-form-item>
                        <el-form-item label="Zip/Postal Code">
                            <el-input v-model="$auth.user().company.billing_address.zip_code"></el-input>
                        </el-form-item>
                        <el-form-item label="Country">
                            <el-input v-model="$auth.user().company.billing_address.country"></el-input>
                        </el-form-item>
                    </el-form>

                    <el-button @click="saveChanges()" class="block-center" round size="small" type="primary">
                        Save Changes
                    </el-button>

                </el-card>


            </el-col>

            <el-col :md="8" :sm="8" :xs="24">
                <el-card class="divider" v-loading="loading.subscription">
                    <el-row>
                        <el-col :sm="12">
                            Status
                            <p class="plan-text">Active since {{ $moment(plan.date).format($date_format) }}</p>
                        </el-col>
                        <el-col :sm="12">
                            Plan
                            <p class="plan-text">
                                <strong> {{ plan.plan }} / {{ subscription.recurring }}</strong>
                            </p>
                        </el-col>
                        <el-col>
                            <el-button @click="changePlan" round size="mini" type="warning">Change Plan</el-button>
                        </el-col>
                    </el-row>
                </el-card>

                <el-card class="divider">

                    <label>2 Factor Authentication</label>

                    <el-row>
                        <el-col>
                            <el-form>
                                <el-form-item>
                                    <el-button @click="enable2fa(true)" round size="small" type="warning" plain v-if="!profile.two_factor">Enable 2 Factor Authentication
                                    </el-button>
                                    <el-button @click="enable2fa(true)" round size="small" type="danger" v-if="profile.two_factor">Disable 2 Factor Authentication
                                    </el-button>
                                </el-form-item>
                            </el-form>

                        </el-col>
                        <el-col>
                            <el-collapse>
                                <el-collapse-item title="Setup Google Authenticator" name="1">
                                    <div>
                                        <ul>
                                            <li>Both Android and Iphone are supported</li>
                                            <li>Get the Authenticator App from the Play Store.</li>
                                            <li>In the App, select Add Account</li>
                                            <li>Choose Scan barcode below</li>
                                        </ul>
                                    </div>
                                </el-collapse-item>
                            </el-collapse>
                        </el-col>
                    </el-row>

                </el-card>

                <el-card class="payment_methods" v-loading="loading.card">
                    <strong>Credit/Debit Cards on file</strong>
                    <ul v-if="cards.length">
                        <li v-for="card in cards">
                            <br/>
                            <el-avatar :src="require('@/assets/icons/cards/' + card.cardType + '.png')" fit="contain"
                                       shape="square" size="medium"></el-avatar>
                            <el-row>
                                <el-col> **** **** **** {{ card.last4digits }}</el-col>
                                <el-col> Expires : {{ card.expiryMonth }}/{{ card.expiryYear }}</el-col>
                            </el-row>
                        </li>
                    </ul>
                    <div v-else><em>You have no credit card on file</em></div>
                    <el-button @click="onNewCardClick" class="text-button" icon="el-icon-plus" size="mini" type="text">
                        Add New Credit Card
                    </el-button>
                    <full-steam-pay-checkout :subscription="true"
                                             :billing-address="$auth.user().company.billing_address"
                                             :name-on-card="profile.fullname" :on-mounted="onFullSteamPayMounted"
                                             :on-token-received="onFullSteamPayTokenReceived"
                                             :show-existing-cards="false" :zip-code="profile.zip"
                                             submitButtonText="Add Card" template="modal"/>
                </el-card>


                <div style="display: block; text-align: center; padding: 10px">
                    <el-link type="warning" @click="showZenDesk">
                        I Need Help Cancelling My Plan
                    </el-link>
                </div>
            </el-col>
        </el-row>

        <el-dialog :visible.sync="verifyDialog" append-to-body title="Setup 2-factor Authentication" top="0vh" v-loading="loading.two_factor" width="30%">
            <div class="modal-body">

                <div v-if="!profile.two_factor" style="text-align:center;">

                    <el-image
                            :src="qrcode_2fa"
                            fit="contain"
                            style="width: 150px; height: 150px; margin: 0 auto; display:block;"
                            v-if="qrcode_2fa"></el-image>

                    <el-divider></el-divider>
                    <label>Enter the 6-digit code you see in the app:</label>
                    <el-input class="ota-input" maxlength="6" placeholder="XXXXXX" style="width: 300px" v-model="activationCode"></el-input>

                </div>
                <div v-else>
                    <h4>Deactivate 2fa by entering the 6-digit code you see in the app:</h4>
                    <el-input class="ota-input" maxlength="6" placeholder="******" style="width: 300px"
                              v-model="activationCode"></el-input>
                </div>


            </div>
            <div slot="footer">
                <el-button @click="abort2fa()" round size="small">Cancel</el-button>
                <el-button @click="verifyCode()" round size="small" type="primary">{{!profile.two_factor ? 'Activate 2fa' : 'Deactivate 2fa'}}
                </el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import SideHelp from "./SideHelp";
    import FullSteamPayCheckout from "../../components/FullSteamPayCheckout";
    import ElLink from "../../../node_modules/element-ui/packages/link/src/main";
    import {countries} from 'countries-list'

    export default {
        components: {
            ElLink, SideHelp,
            FullSteamPayCheckout
        },
        props: {
            profile: {
                type: Object,
                required: true
            }
        },
        data: () => {
            return {
                referalCode: "",
                rules: {},
                plan: false,
                loading: {
                    subscription: false,
                    card: false,
                    two_factor: false,
                    profile: false
                },
                subscription: {},
                fspayInstance: null,
                cards: [],
                two_factor: false,
                verifyDialog: false,
                qrcode_2fa: false,
                activationCode: '',
                sidehelp_content: {
                    videoId: 'FfKbLxI2c1s',
                    content: 'Instead of waiting for text messages, get verification codes for free from the Authenticator app. It works even if your phone is offline.'
                },
                countries: countries,
                country_selected: "",
                company: "",
                billing_address_form: {
                    address: '',
                    city: '',
                    zip_code: '',
                    country: {}
                }
            };
        },

        watch: {},

        created() {
            if (!this.$auth.user().company.billing_address)
                this.$auth.user().company.billing_address = {}
        },

        mounted() {
            this.fetchSubscription();
            this.fetchCards();

            this.two_factor = this.profile.two_factor
        },

        methods: {
            abort2fa() {
                this.verifyDialog = false
                this.activationCode = ''
            },
            loadProfile() {
                /* this.loading.profile = true
                 this.axios.get('/accounts/me')
                     .then(res => {
                         this.profile = res.data
                     })
                     .finally(() => {
                         this.loading.profile = false
                     })*/
            },
            showZenDesk() {
                zE.showIPMWidget()
            },
            fetchSubscription() {
                //get company susbscription
                this.loading.subscription = true;
                this.axios
                    .get("/companies/current", {params: {filter: {include: "subscription"}}})
                    .then(res => {
                        if (res.data && res.data.subscription) {
                            this.subscription = res.data.subscription;
                            this.plan = {
                                date: res.data.subscription.created_at,
                                plan: res.data.subscription.plan_name
                            };
                        }
                    })
                    .catch()
                    .finally(_ => {
                        this.loading.subscription = false;
                    });
            },
            fetchCards() {
                this.loading.card = true;
                this.axios
                    .get("/accounts/" + this.$auth.user().id + "/cards")
                    .then(response => {
                        if (response.data) {
                            this.cards = response.data;
                        }
                    })
                    .catch()
                    .finally(() => {
                        this.loading.card = false
                    });
            },
            saveChanges() {
                // only show prompt if new password form has been field.
                if (this.profile.password && this.profile.password !== this.profile.confirm_password) {
                    this.$helpers.errorHandle("New password mismatch");
                    return;
                }

                this.axios.patch('/companies/current', {
                    billing_address: this.$auth.user().company.billing_address
                })


                if (this.profile.password && this.profile.password.length > 0 && this.profile.confirm_password && this.profile.confirm_password.length > 0) {
                    this.$prompt("Enter your current password to proceed", "Security", {
                        confirmButtonText: "OK",
                        inputType: "password",
                        cancelButtonText: "Cancel"
                    })
                        .then(({value}) => {
                            this.profile.old_password = value;
                            delete this.profile.confirm_password;
                            this.updateAccount()
                        })
                        .catch(() => {
                        });
                } else {
                    delete this.profile.password
                    delete this.profile.confirm_password
                    this.updateAccount()
                }

            },

            updateAccount() {

                this.axios
                    .patch("/accounts/me", this.profile)
                    .then(res => {
                        this.$message.success("Profile successfully updated");
                        // reload user
                        this.$auth.fetch({
                            success: profile => {
                                // this.profile = profile
                                this.profile.password = "";
                                this.profile.old_password = "";
                                this.profile.confirm_password = "";
                                this.$auth.fetch()
                            }
                        });
                    })
                    .catch(err => {
                        if (err.response.data) {
                            this.$helpers.errorHandle(err, this);
                            ;
                        }
                    });
            },

            getHeaders() {
                return {Authorization: this.$auth.token()};
            },
            getFileUrl() {
                return process.env.VUE_APP_API_HOST + "/api/containers/" + process.env.VUE_APP_STORAGE_FOLDER + "/upload";
            },

            beforeUpload() {
                this.loading.profile = true
            },

            uploadError() {
                this.loading.profile = false
            },

            uploadSuccess(res, file) {
                //
                this.loading.profile = false
                this.$nextTick(() => {
                    this.$set(this.profile, 'avatar', "https://storage.googleapis.com/" + process.env.VUE_APP_STORAGE_FOLDER + "/" + res.result.files.file[0].name)
                })
            },

            changePlan() {
                this.$events.emitEvent("account:profile:change-tab", ["plan"]);
            },
            onNewCardClick() {
                if (this.profile.company && this.profile.company.settings.booking.enable_fspay === true && this.fspayInstance) {
                    this.fspayInstance.showModal();
                }
            },
            onFullSteamPayMounted(instance) {
                this.fspayInstance = instance;
            },
            onFullSteamPayTokenReceived(card) {
                this.loading.card = true;

                var params = {
                    gateway: "fspay",
                    gatewayId: card.token,
                    last4digits: card.accountDetails.paymentAccountLast4,
                    expiryMonth: card.accountDetails.expirationMonth,
                    expiryYear: card.accountDetails.expirationYear,
                    cardType: card.cardType
                };

                this.axios({
                    method: "POST",
                    url: "/accounts/" + this.$auth.user().id + "/cards",
                    data: params
                })
                    .then(response => {
                        if (response.data) {
                            this.cards.push(response.data);
                        }
                    })
                    .catch(error => {
                        this.$helpers.errorHandle(error)
                    })
                    .finally(() => {
                        this.loading.card = false
                    });
            },
            enable2fa(val) {

                this.axios.post('/accounts/enable-2fa', {
                    status: val
                }).then(res => {
                    if (res.data) {
                        if (res.data.length > 0) {
                            this.qrcode_2fa = res.data
                        }
                        this.verifyDialog = true
                    } else {
                        //if disabling then request for code to disable
                    }
                }).catch(err => {
                    this.$helpers.errorHandle(err, this)
                })
            },
            verifyCode() {
                this.loading.two_factor = true
                this.axios.post('/accounts/activate-2fa', {
                    code: this.activationCode
                }).then(res => {
                    if (res.data) {
                        this.verifyDialog = false
                        this.activationCode = ''
                        this.$emit('reload-profile')
                    }
                }).catch(err => {

                    this.$helpers.errorHandle(err, this)
                }).finally(() => {
                    this.activationCode = ''
                    this.loading.two_factor = false
                })

            },
            onChange(event) {
                for (let key in this.countries) {
                    let country = this.countries[key]
                    if (country.name === event) {
                        this.company.country_selected = country
                        this.company.country_selected.isoCode = key
                        break
                    }
                }
            }
        }
    };
</script>

<style lang="scss">
    .account-settings {
        .plan-text {
            display: block;
            font-style: normal;
            font-size: 12px;
            margin-top: 5px;
        }

        .account-avatar-uploader {
            max-width: 130px;
            margin: 0 auto;
        }

        .upgrade-button {
            margin-left: 20px;
        }

        .avatar-uploader .el-upload {
            border: none;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            margin: 0 auto 40px;
            display: block;
        }

        .avatar-uploader .el-upload:hover {
            border-color: #409eff;
        }

        .avatar-uploader-icon {
            font-size: 28px;
            color: #8c939d;
            width: 128px;
            height: 128px;
            line-height: 128px;
            text-align: center;
        }

        .el-avatar {
            img {
                width: 100%;
            }
        }

        .avatar {
            width: 128px;
            height: 128px;
            display: block;
        }

        .payment_methods {
            ul {
                list-style: none;
                padding: 0px;
                font-size: 12px;

                .el-avatar {
                    float: left;
                    margin-right: 10px;
                }

                .el-row {
                    display: inline-block;
                }
            }
        }
    }
</style>
