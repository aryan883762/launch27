<template>
    <div class="people-detail-wrap">
        <el-row v-if="personDetails">
            <el-col :md="24" class="customer-box content-box">
                <el-row class="customer-content-top-left-wrap">
                    <el-avatar :size="42" :src="personDetails.avatar" class="customer-content-top-icon"
                               v-if="personDetails.avatar"/>
                    <avatar :size="42" :username="personDetails.fullname" class="pull-left profile-avatar" color="white"
                            v-if="!personDetails.avatar"/>

                    <div class="customer-content-top-middle-wrap">
                        <div class="customer-content-top-name">
                            {{ personDetails.first_name + " " + personDetails.last_name }}
                        </div>
                        <div class="customer-content-top-user-since">
                            {{personDetails.roleName}} since {{ moment(personDetails.created_at).format("Y") }}
                        </div>
                    </div>
                    <el-dropdown size="medium" type="primary">
                          <span class="el-dropdown-link">
                            <i class="el-icon-more"
                               style="font-size: 20px; position:relative; right :-10px; cursor:pointer;"/>
                          </span>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item @click.native="editPerson()">
                                Edit Account
                            </el-dropdown-item>
                            <el-dropdown-item @click.native="sendMessage()" disabled>
                                Send Message
                            </el-dropdown-item>
                            <el-dropdown-item @click.native="emailPreferences()">
                                Email Preferences
                            </el-dropdown-item>
                            <el-dropdown-item @click.native="smsPreferences()">
                                SMS Preferences
                            </el-dropdown-item>
                            <el-dropdown-item @click.native="specialTax()" v-if="personDetails.role == 'r_customer'">
                                <special-tax :account="personDetails"></special-tax>
                            </el-dropdown-item>
                            <el-dropdown-item class="history-link">
                                <view-changes :id="personDetails.id"></view-changes>
                            </el-dropdown-item>
                            <el-dropdown-item @click.native="blockStatus()" v-if="!personDetails.blocked">
                                Block this Account
                            </el-dropdown-item>
                            <el-dropdown-item @click.native="blockStatus()" v-if="personDetails.blocked">
                                Unblock this Account
                            </el-dropdown-item>
                            <el-dropdown-item @click.native="archiveStatus()" v-if="personDetails.active">
                                Archive Account
                            </el-dropdown-item>
                            <el-dropdown-item @click.native="archiveStatus()" v-if="!personDetails.active">
                                Activate Account
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </el-row>
                <el-row>
                    <el-col :md="24" class="customer-button-wrap">
                        <el-button
                                @click="$router.push({ name: 'dashboard_booking_new', query:{account_id : personDetails.id} })"
                                class="customer-appointment-btn" round size="small"
                                v-if="personDetails.role === 'r_customer'">
                            Book an Appointment
                        </el-button>
                    </el-col>
                </el-row>
            </el-col>
            <el-col :md="24" v-if="personDetails.role === 'r_team'" class="address-box content-box"
                    style="    min-height: auto;">
                <el-link type="danger" size="mini"
                         style="margin: 0 auto;"
                         @click="$router.push({name: 'dashboard_settings_booking_spots_availability', query:{type:'account', 'id': personDetails.id, q : $route.name}})">
                    Set Availabilities
                </el-link>
            </el-col>
            <el-col :md="24" class="address-box content-box">
                <el-row>
                    <el-col :md="24">
            <span class="address-box-title">
              Default Address
            </span>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :md="24" class="address-box-email-wrap">
            <span class="address-box-content-title">
              Email
            </span>
                        <span class="address-box-content-body">
              {{ personDetails.email }}
            </span>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :md="24" class="address-box-email-wrap">
            <span class="address-box-content-title">
              Phone
            </span>
                        <span class="address-box-content-body">
              {{ personDetails.parsed_phone }}
            </span>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :md="12" class="address-box-first-name-wrap">
            <span class="address-box-content-title">
              First Name
            </span>
                        <span class="address-box-content-body">
              {{ personDetails.first_name }}
            </span>
                    </el-col>
                    <el-col :md="12" class="address-box-last-name-wrap">
            <span class="address-box-content-title">
              Last Name
            </span>
                        <span class="address-box-content-body">
              {{ personDetails.last_name }}
            </span>
                    </el-col>
                </el-row>
                <el-row v-if="personDetails.addresses && personDetails.addresses.length > 0">
                    <el-col :md="24" class="address-box-street-address-wrap">
            <span class="address-box-content-title">
              {{ personDetails.addresses[0].address1 }}
            </span>
                        <span class="address-box-street address-box-content-body">
              {{ personDetails.addresses[0].address2 }}
            </span>
                    </el-col>
                </el-row>
                <el-row v-if="personDetails.addresses && personDetails.addresses.length > 0">
                    <el-col :md="8">
            <span class="address-box-content-title">
              City
            </span>
                        <span class="address-box-content-body">
              {{ personDetails.addresses[0].city }}
            </span>
                    </el-col>
                    <el-col :md="8">
            <span class="address-box-content-title">
              State
            </span>
                        <span class="address-box-content-body">
              {{ personDetails.addresses[0].state }}
            </span>
                    </el-col>
                    <el-col :md="8">
            <span class="address-box-content-title">
              ZIP Code
            </span>
                        <span class="address-box-content-body">
              {{ personDetails.addresses[0].zip }}
            </span>
                    </el-col>
                </el-row>
            </el-col>
            <el-col :md="24" class="credit-card-box content-box"
                    v-if="personDetails.role == 'r_customer' && cardPaymentsEnabled">
                <el-row>
                    <el-col class="credit-card-box-title" style="margin-bottom: 10px;">
                        <span>Credit Cards on file</span>
                    </el-col>
                </el-row>
                <account-cards :account.sync="personDetails" :add-button="true" :default-button="true" :delete-button="true" :mini="true"
                               v-model="selected_card"></account-cards>

            </el-col>
            <el-col :md="24" class="tags-box content-box"
                    v-if="personDetails.special_tax && personDetails.special_tax.active">
                <el-row>
                    <el-col :md="14" class="tags-box-title">
            <span>
               Special Sales Tax
            </span>
                    </el-col>
                </el-row>
                <el-row>
                    <label>Rate : {{personDetails.special_tax.rate}}%</label>
                    <p>{{personDetails.special_tax.description}}</p>
                </el-row>
            </el-col>

            <el-col :md="24" :sm="24" class="tags-box  content-box">
                <el-row>
                    <el-col :md="14" class="tags-box-title">
            <span>
              Additional Emails
            </span>
                    </el-col>
                </el-row>
                <el-row v-loading="loading_email">
                    <el-col :md="24" class="">
                        <el-tag
                                v-for="email in personDetails.ccd_emails"
                                :disable-transitions="false"
                                :key="email"
                                @close="handleEmailDelete(email)"
                                class="ccd_email-tag"
                                closable
                                size="small"
                        >
                            <el-tooltip class="item" :content="email" effect="dark" placement="right">
                                <span>{{email}}</span>
                            </el-tooltip>
                        </el-tag>
                        <el-input
                                @blur="handleEmailConfirm"
                                @keyup.enter.native="handleEmailConfirm"
                                @keyup.esc.native="emailInputVisible = false"
                                class="input-new-tag"
                                ref="saveTagInput"
                                size="mini"
                                v-if="emailInputVisible"
                                v-model="emailInput"
                        >
                        </el-input>
                    </el-col>
                    <el-col>
                        <el-button @click="showInput" class="button-new-tag" size="mini" style="padding: 5px;"
                                   type="primary" v-if="!emailInputVisible">+ Add Email
                        </el-button>
                    </el-col>
                </el-row>

            </el-col>

            <el-col :md="24" class="tags-box content-box">
                <el-row>
                    <el-col :md="14" class="tags-box-title">
            <span>
              Tags
            </span>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col>
                        <tags @changed="tagsChanged" v-model="personDetails.tagIds"/>
                    </el-col>
                </el-row>
            </el-col>
            <el-col :md="24" class="notifications-box content-box" v-if="false">
                <el-row>
                    <el-col :md="24" class="notifications-box-title">
            <span>
              Notifications
            </span>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :md="12" :sm="12" :xs="24" class="notification-title">
            <span>
              3 Day Email
            </span>
                    </el-col>
                    <el-col :md="12" :sm="12" :xs="24" class="notification-switch-wrap">
                        <el-switch @change="updatePerson()" active-color="#4bd865" active-text="On"
                                   class="notification-switch" inactive-color="#d9dadc" inactive-text="Off"
                                   v-model="personDetails['3days_email']"/>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :md="12" :sm="12" :xs="24" class="notification-title">
            <span>
              5 Day Email
            </span>
                    </el-col>
                    <el-col :md="12" :sm="12" :xs="24" class="notification-switch-wrap">
                        <el-switch @change="updatePerson()" active-color="#4bd865" active-text="On"
                                   class="notification-switch" inactive-color="#d9dadc" inactive-text="Off"
                                   v-model="personDetails['5days_email']"/>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :md="12" :sm="12" :xs="24" class="notification-title">
            <span>
              Feedback Email
            </span>
                    </el-col>
                    <el-col :md="12" :sm="12" :xs="24" class="notification-switch-wrap">
                        <el-switch @change="updatePerson()" active-color="#4bd865" active-text="On"
                                   class="notification-switch" inactive-color="#d9dadc" inactive-text="Off"
                                   v-model="personDetails['feedback_email']"/>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :md="12" :sm="12" :xs="24" class="notification-title">
            <span>
              SMS Message
            </span>
                    </el-col>
                    <el-col :md="12" :sm="12" :xs="24" class="notification-switch-wrap">
                        <el-switch @change="updatePerson()" active-color="#4bd865" active-text="On"
                                   class="notification-switch" inactive-color="#d9dadc" inactive-text="Off"
                                   v-model="personDetails['sms_notification']"/>
                    </el-col>
                </el-row>
            </el-col>
        </el-row>


        <el-dialog :visible.sync="specialTaxDialog"/>
    </div>
</template>

<script>
    import moment from 'moment'

    import Avatar from 'vue-avatar'
    import Tags from '../../../components/Tags'
    import {VclFacebook} from 'vue-content-loading'
    import ViewChanges from "../../../components/ViewChanges";
    import SpecialTax from "../../../components/SpecialTax";
    import AccountCards from "../../../components/AccountCards";
    import validator from 'validator';
    import {Message} from 'element-ui';

    export default {
        components: {
            AccountCards,
            SpecialTax,
            ViewChanges,
            Avatar,
            Tags,
            'full-steam-pay-checkout': require('@/components/FullSteamPayCheckout').default,
            VclFacebook
        },
        props: {
            personDetails: {
                type: [Boolean, Object],
                default: () => {
                    return false
                }
            }
        },
        data: () => {
            return {
                moment: moment,
                inputVisible: false,
                inputValue: '',
                cards: [],
                cards_loading: false,
                fspayInstance: null,
                specialTaxDialog: false,
                emailInputVisible: false,
                emailInput: '',
                loading_email: false,
                selected_card: ''
            }
        },
        watch: {
            personDetails: {
                handler(val, oldval) {
                    this.emailInput = ''
                    this.emailInputVisible = ''
                },
                deep: true
            },
            '$route'() {
                this.emailInput = ''
                this.emailInputVisible = ''
            }
        },
        created() {
        },
        mounted() {
            this.emailInput = ''
            this.emailInputVisible = ''
        },

        methods: {

            editPerson() {
                this.$router.push({
                    name: 'dashboard_people_edit',
                    params: {id: this.personDetails.id}
                })
            },

            updatePerson() {
                this.axios
                    .patch('/accounts/' + this.personDetails.id, {
                        '3days_email': this.personDetails['3days_email'],
                        feedback_email: this.personDetails['feedback_email'],
                        sms_notification: this.personDetails['sms_notification'],
                        '5days_email': this.personDetails['5days_email']
                    })
                    .then(res => {
                        this.$events.emitEvent('account-updated', [res.data.id])
                    })
                    .catch(err => {
                        console.log(err)
                    })
            },

            showInput() {
                this.emailInputVisible = true
                this.$nextTick(_ => {
                    this.$refs.saveTagInput.$refs.input.focus()
                })
            },

            handleInputConfirm() {
                let inputValue = this.inputValue
                if (inputValue) {
                    this.personDetails.tags.push(inputValue)
                    this.updatePerson()
                }
                this.inputVisible = false
                this.inputValue = ''
            },
            fetchCards() {
                if (this.personDetails && this.personDetails.role == 'r_customer') {
                    this.cards_loading = true
                    this.axios
                        .get('/accounts/' + this.personDetails.id + '/cards')
                        .then(response => {
                            if (response.data) {
                                this.cards = response.data
                            }
                        })
                        .catch()
                        .finally(_ => {
                            this.cards_loading = false
                        })
                }
            },
            addCreditCard() {
                if (this.$auth.user().company && this.$auth.user().company.payment_methods.card_processor === 'fspay' && this.fspayInstance) {
                    this.fspayInstance.showModal()
                } else if (this.$auth.user().company && this.$auth.user().company.payment_methods.card_processor === 'stripe') {

                }
            },
            onFullSteamPayMounted(instance) {
                this.fspayInstance = instance
            },
            onFullSteamPayTokenReceived(card) {
                this.card_processor = true

                var params = {
                    gateway: 'fspay',
                    gatewayId: card.token,
                    last4digits: card.accountDetails.paymentAccountLast4,
                    expiryMonth: card.accountDetails.expirationMonth,
                    expiryYear: card.accountDetails.expirationYear,
                    cardType: card.cardType
                }

                this.axios({
                    method: 'POST',
                    url: '/accounts/' + this.personDetails.id + '/cards',
                    data: params
                })
                    .then(response => {
                        if (response.data) {
                            this.cards.push(response.data)
                        }
                    })
                    .catch(error => {
                    })
                    .then(_ => (this.cards_loading = false))
            },
            tagsChanged(value) {
                this.axios
                    .patch('/accounts/' + this.personDetails.id, {tagIds: value})
                    .then(res => {
                    })
                    .catch()
                    .then()
            },

            specialTax() {
                // load modal and show the special tax
            },
            emailPreferences() {
                this.$router.push({
                    name: 'dashboard_email_preferences',
                    params: {id: this.personDetails.id}
                })
            },
            smsPreferences() {
                this.$router.push({
                    name: 'dashboard_sms_preferences',
                    params: {id: this.personDetails.id}
                })
            },
            blockStatus() {
                let str = this.personDetails.blocked ? 'unblock' : 'block'

                this.$confirm('Are you sure you want to ' + str + ' this account - ' + this.personDetails.fullname + '?')
                    .then(() => {
                        this.axios.patch('/accounts/' + this.personDetails.id, {
                            blocked: !this.personDetails.blocked
                        })
                            .then(res => {
                                this.$events.emitEvent('account-updated', [this.personDetails.id])
                                this.$message.success('update completed')
                            })
                            .catch(err => {
                                this.$helpers.errorHandle(err, this)
                            })
                    })
            },
            archiveStatus() {
                let str = this.personDetails.active ? 'archive' : 'activate'
                this.$confirm('Are you sure you want to ' + str + ' this account - ' + this.personDetails.fullname + '?')
                    .then(() => {
                        this.axios.patch('/accounts/' + this.personDetails.id, {
                            active: !this.personDetails.active
                        })
                            .then(res => {
                                this.$events.emitEvent('account-updated', [this.personDetails.id])
                                this.$message.success('Update completed')
                            })
                            .catch(err => {
                                this.$helpers.errorHandle(err, this)
                            })
                    })
            },
            handleEmailDelete(email) {


                this.loading_email = true

                if (this.personDetails) {
                    this.personDetails.ccd_emails.splice(this.personDetails.ccd_emails.indexOf(email), 1);

                    this.axios.patch('/accounts/' + this.personDetails.id,
                        {
                            ccd_emails: this.personDetails.ccd_emails
                        })
                        .then(res => {
                            this.emailInputVisible = false;
                            this.emailInput = '';
                        })
                        .finally(() => {
                            this.loading_email = false
                        })
                }

            },
            handleEmailConfirm() {

                let emailInput = this.emailInput;


                //javascript validate email
                function validateEmail(email) {
                    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    return re.test(String(email).toLowerCase());
                }

                if (emailInput) {

                    if (!validateEmail(emailInput)) {
                        Message.closeAll()
                        this.$helpers.errorHandle("Invalid email")
                        return;
                    }

                    if (this.personDetails.ccd_emails)
                        this.personDetails.ccd_emails.push(emailInput)
                    else
                        this.personDetails.ccd_emails = [emailInput]

                    this.loading_email = true
                    this.axios.patch('/accounts/' + this.personDetails.id,
                        {
                            ccd_emails: this.personDetails.ccd_emails
                        })
                        .then(res => {
                            this.emailInputVisible = false;
                            this.emailInput = '';
                        })
                        .finally(() => {
                            this.loading_email = false
                        })
                }


            },
            reloadAccount() {

            }
        },
        computed: {
            fspayEnabled() {
                return this.cardPaymentsEnabled && this.$auth.user().company.payment_methods.card_processor == 'fspay' && this.$auth.user().company.payment_methods.fspay_available
            },
            cardPaymentsEnabled() {
                return this.$auth.user().company && this.$auth.user().company.payment_methods && this.$auth.user().company.payment_methods.card
            },
            defaultAddress() {
                var out = {}
                if (this.personDetails.addresses) {
                    var address = this.personDetails.addresses.find(obj => obj.default)
                    if (address) {
                        out = address
                    } else {
                        out = this.personDetails.addresses[0]
                    }
                }
                return out
            }
        }
    }
</script>

<style lang="scss" src="./styles/Details.scss"/>
