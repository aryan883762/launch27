<template>
    <div>
        <el-dialog :close-on-press-escape="true" :fullscreen="true" :modal="true" appendToBody :visible.sync="showModal"
                   @close="settingsRedirect" custom-class="fullscreen-modal-display"
                   title="Booking Policies">

            <el-card class="modal-body policies-page" v-loading="loading">

                <el-row :gutter="20" v-if="company_settings">

                    <el-col :sm="12" :md="12">
                        <el-card class="policies-card" shadow="hover">
                            <div slot="header">
                                <div class="flex-row">
                                    <div>
                                        New Bookings and Late Cancellations
                                        <p>Enforce restrictions for new and late booking changes</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p>Example: Customers cannot create a booking less than 24 hours before the service time.</p>
                                <label style="display:block; margin-bottom: 5px;">Accept bookings made</label>
                                <el-input-number v-model="company_settings.booking.hours_before_service"></el-input-number>
                                <span style="margin-left: 10px;">hours before the service time</span>
                            </div>

                            <el-divider></el-divider>
                            <div>
                                <p>Restricts changes to a booking by customer after a certain time.</p>
                                <el-radio-group v-model="company_settings.booking.late_changes.cut_off_time">
                                    <el-radio label="standard_time"> 5pm of the day before booking service date
                                    </el-radio>
                                    <el-radio label="custom_time">Set your own terms:</el-radio>
                                </el-radio-group>

                                <el-row  v-if="company_settings.booking.late_changes.cut_off_time === 'custom_time'">
                                    <el-col :sm="12">
                                        <el-input style="margin-top: 10px;"
                                                v-model="company_settings.booking.late_changes.enforce_period.value">
                                    <span slot="append" style="width:100px">
                                        <el-select style="width: 100px"
                                                   v-model="company_settings.booking.late_changes.enforce_period.mode">
                                            <el-option value="hours" label="hours"></el-option>
                                            <el-option value="days" label="days"></el-option>
                                        </el-select>
                                    </span>
                                        </el-input>
                                    </el-col>
                                    <el-col>
                                        <i style="font-size:10px;">before the appointment</i>
                                    </el-col>

                                </el-row>


                            </div>
                        </el-card>

                        <el-card class="policies-card" shadow="hover">
                            <div slot="header">
                                <div class="flex-row">
                                    <div>
                                        Booking Cancellation
                                        <p>Charges the customer a fee if they cancel their booking after a certain
                                            time.</p>
                                    </div>
                                    <el-switch style="margin-bottom: 10px"
                                               v-model="company_settings.booking.cancel_booking.late_fee.enabled">
                                    </el-switch>
                                </div>

                            </div>
                            <div>

                                <el-radio-group v-model="company_settings.booking.require_reason" :disabled="!company_settings.booking.cancel_booking.late_fee.enabled">
                                    <el-radio :label="1">Customer must provide a reason for cancelling</el-radio>
                                    <el-radio :label="0">Customer must call to cancel</el-radio>
                                </el-radio-group>


                                <p style="color:black;">Penalty Fee</p>

                                <el-row>
                                    <el-col :sm="12" :md="12">
                                        <el-select style="margin-bottom: 10px"
                                                   v-model="company_settings.booking.cancel_booking.late_fee.type" :disabled="!company_settings.booking.cancel_booking.late_fee.enabled">
                                            <el-option label="Flat fee" value="amount"></el-option>
                                            <el-option label="% of pre-tax Total" value="percent"></el-option>
                                        </el-select>
                                    </el-col>
                                    <el-col :sm="12" :md="12">
                                        <el-input v-on:keyup.native="validateField()" placeholder="value here" type="number" :min="0"
                                                  v-model="company_settings.booking.cancel_booking.late_fee.value" :disabled="!company_settings.booking.cancel_booking.late_fee.enabled">
                                            <span slot="prepend">{{ company_settings.booking.cancel_booking.late_fee.type === "amount" ? $currency : "%" }}</span>
                                        </el-input>
                                    </el-col>
                                </el-row>

                                <p style="color:black;">No fee applies if booking is cancelled by:</p>
                                <el-radio-group v-model="company_settings.booking.cancel_booking.cut_off_time" :disabled="!company_settings.booking.cancel_booking.late_fee.enabled">
                                    <el-radio label="standard_time"> 5pm of the day before booking service date
                                    </el-radio>
                                    <el-radio label="custom_time">Set your own terms:</el-radio>
                                </el-radio-group>

                                <el-row  v-if="company_settings.booking.cancel_booking.cut_off_time === 'custom_time'">
                                    <el-col :sm="12">
                                        <el-input style="margin-top: 10px;"
                                                v-model="company_settings.booking.cancel_booking.enforce_period.value" :disabled="!company_settings.booking.cancel_booking.late_fee.enabled">
                                            <span slot="append" style="width:100px">
                                                <el-select style="width: 100px"
                                                           v-model="company_settings.booking.cancel_booking.enforce_period.mode">
                                                    <el-option value="hours" label="hours"></el-option>
                                                    <el-option value="days" label="days"></el-option>
                                                </el-select>
                                            </span>
                                        </el-input>
                                    </el-col>
                                    <el-col>
                                        <i style="font-size:10px;">before the appointment</i>
                                    </el-col>
                                </el-row>


                            </div>
                        </el-card>
                    </el-col>
                    <el-col :sm="12" :md="12" v-if="false">
                        <el-card class="policies-card" shadow="hover">
                            <div slot="header">
                                Recurring Bookings
                                <p>Frequency discounts </p>
                            </div>
                        </el-card>
                    </el-col>

                    <el-col :sm="12" :md="12">
                        <el-card class="policies-card" shadow="hover">
                            <div slot="header">
                                <div class="flex-row">
                                    <div>
                                        Invite Teams to a Booking
                                        <p>When a booking is received, your teams will be invited via email/SMS so they
                                            can let
                                            you know
                                            if they're interested in the job. Staff can approve/reject each
                                            invitation.</p>
                                    </div>
                                    <el-switch style="margin-bottom: 10px"
                                               v-model="company_settings.booking.team_invite_to_booking.enabled">
                                    </el-switch>
                                </div>

                            </div>
                            <div>
                                <div v-if="company_settings.booking.team_invite_to_booking.enabled">
                                    <el-col :md="24" :sm="24" :xs="24">
                                        <el-checkbox style="margin-bottom: 10px"
                                                     v-model="company_settings.booking.team_invite_to_booking.invite_available_teams">
                                            Automatically Invite all available teams when booking is created
                                        </el-checkbox>
                                        <el-checkbox style="margin-bottom: 10px"
                                                     v-model="company_settings.booking.team_invite_to_booking.automatically_approve_reject">
                                            Automatically send approved/rejected alerts to teams that replied to the <br>
                                            invitation after teams are assigned to the Booking
                                        </el-checkbox>
                                        <el-checkbox style="margin-bottom: 10px"
                                                     v-model="company_settings.booking.team_invite_to_booking.prevent_from_replying">
                                            Prevent teams from replying to invitations AFTER the booking is already
                                            assigned
                                        </el-checkbox>
                                        <el-checkbox style="margin-bottom: 10px"
                                                     v-model="company_settings.booking.team_invite_to_booking.allow_to_add_bid">
                                            Allow Teams to add a Bid amount to their reply
                                        </el-checkbox>
                                        <el-checkbox style="margin-bottom: 10px"
                                                     v-model="company_settings.booking.team_invite_to_booking.allow_to_add_comment">
                                            Allow Teams to add a Comment to their reply
                                        </el-checkbox>
                                    </el-col>
                                </div>
                            </div>
                        </el-card>
                    </el-col>

                    <el-col :sm="12" :md="12">
                        <el-card class="policies-card" shadow="hover">
                            <div slot="header">
                                Bookings Outside of Normal Availability
                                <p>If a booking has a service time outside of your normal availability (i.e. booking has
                                    a time
                                    for 9:15AM and your normal times are 8:00AM, 11:00AM, 2:00PM):</p>
                            </div>
                            <div>
                                <el-radio-group
                                        v-model="company_settings.booking.schedule_availability_mode.manual">
                                    <el-radio :label="true">Manual</el-radio>
                                    <el-radio :label="false">Based on Team Availability</el-radio>
                                </el-radio-group>

                                <p v-if="!company_settings.booking.schedule_availability_mode.manual">Changing the team availability directly impacts the number of bookings you're able to take on. Some businesses prefer to have Staff control this, while others prefer the convenience of having teams do this themselves:</p>

                                <div v-if="!company_settings.booking.schedule_availability_mode.manual">
                                    <el-col :md="24" :sm="24" :xs="24">
                                        <el-radio-group v-model="company_settings.booking.schedule_availability_mode.staff_only">
                                            <el-radio :label="false">Only Team can change a team's availability</el-radio>
                                            <el-radio :label="true">Only Staff can change a team's availability</el-radio>
                                        </el-radio-group>
                                    </el-col>
                                </div>
                            </div>
                        </el-card>
                    </el-col>

                    <el-col >
                        <el-card class="policies-card" shadow="hover" style="height: 200px;">
                            <div slot="header">
                                Schedule Availability Mode
                                <p>If a booking has a service time outside of your normal availability (i.e. booking has a time for 9:15AM and your normal times are 8:00AM, 11:00AM, 2:00PM):</p>
                            </div>
                            <div>
                                <el-radio-group v-model="company_settings.booking.count_outside_availability">
                                    <el-radio :label="true">Count them against my Availability (i.e. 9:15AM will count against your 8:00AM availability)</el-radio>
                                    <el-radio :label="false">Don't count them against my Availability</el-radio>
                                </el-radio-group>
                            </div>
                        </el-card>
                    </el-col>

                    <el-col>
                        <el-card class="policies-card" shadow="hover">
                            <div slot="header">
                                <div class="flex-row">
                                    <div>
                                        <el-badge value="Coming soon">
                                            Terms of Service
                                        </el-badge>

                                        <p>Allows your customers to accept your terms of service when creating a
                                            booking</p>
                                    </div>
                                    <el-switch disabled v-model="company_settings.booking.terms_of_service.enabled"></el-switch>
                                </div>

                            </div>
                            <div>
                                <wysiwyg v-model="company_settings.booking.terms_of_service.content"></wysiwyg>
                            </div>
                        </el-card>
                    </el-col>

                </el-row>

                <el-row>
                    <el-card>
                        <div class="flex-row-reverse">
                            <el-button @click="saveSettings()" size="mini" round type="primary">Save Settings
                            </el-button>
                        </div>
                    </el-card>
                </el-row>


            </el-card>
        </el-dialog>
    </div>
</template>

<script>
    import {countries} from 'countries-list'

    export default {
        name: "SettingsService",
        data() {
            return {
                showModal: false,
                company_settings: false,
                loading: true,
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
        beforeMount() {
            //reload existing setting sbefore updateing from backend
            let temp = this.$auth.user().company.settings
            if (!temp.booking.terms_of_service) {
                temp.booking.terms_of_service = {
                    enabled: false,
                    content: ""
                }
            }

            if (!temp.booking.late_changes) {
                temp.booking.late_changes = {
                    "cut_off_time": "standard_time",
                    "enforce_period": {
                        "hours": 24,
                        "mode": "hours"
                    }
                }
            }

            this.company_settings = temp
        },
        mounted() {
            this.showModal = true;
        },
        created() {
            this.loadSettings();
            this.company = this.$auth.user().company
            this.billing_address_form = this.company.billing_address || this.billing_address_form;
            this.billing_address_form.country = this.$auth.user().country || {};
        },
        methods: {
            settingsRedirect() {
                this.$router.back()
            },

            loadSettings() {
                this.loading = true
                this.axios.get('/companies/current/settings')
                    .then(res => {
                        if (res.data.booking.policies) {
                            Object.assign(res.data.booking, res.data.booking.policies)
                        }

                        if (!res.data.booking.terms_of_service) {
                            res.data.booking.terms_of_service = {
                                enabled: false,
                                content: ""
                            }
                        }

                        if (!res.data.booking.late_changes) {
                            res.data.booking.late_changes = {
                                "cut_off_time": "standard_time",
                                "enforce_period": {
                                    "hours": 24,
                                    "mode": "hours"
                                }
                            }
                        }

                        this.company_settings = res.data
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err)
                    })
                    .finally(() => {
                        this.loading = false
                    })
            },
            validateField() {
                if (this.company_settings.booking.cancel_booking.late_fee.value < 0) {
                    this.company_settings.booking.cancel_booking.late_fee.value = 0;
                }

                if (this.company_settings.booking.cancel_booking.late_fee.type === 'percent' &&
                    this.company_settings.booking.cancel_booking.late_fee.value > 100) {

                    this.company_settings.booking.cancel_booking.late_fee.value = 100;
                }
            },
            saveSettings() {
                this.loading = true;
                this.$delete(this.company_settings.booking, 'policies')
                const one = this.axios.put("/companies/current/settings", this.company_settings);
                const two = this.axios.patch("/companies/current", {
                    billing_address: this.billing_address_form
                });

                this.axios.all([one, two]).then(this.axios.spread((...resps) => {
                    const responseOne = resps[0];
                    const responseTwo = resps[1];
                    this.$message.success("Policies successfully updated");
                })).catch(err => {
                    this.$helpers.errorHandle("Oops! an error occurred while saving settings");
                }).then(() => {
                    this.loading = false;
                });
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
    .policies-page {
        .el-card__header {
            background: #f3f3f3;
            height: 80px;

            div{
                font-weight: 500;
            }

            p {
                margin: 0px;
                font-size: 12px;
                line-height: 1.5;
                font-style: italic;
            }
        }


        .el-checkbox__input {
            vertical-align: top;
            margin-top: 5px;
        }

        .policies-card {
           // box-shadow: 0 7px 14px 0 rgba(60, 66, 87, 0.12), 0 3px 6px 0 rgba(0, 0, 0, 0.12);
            box-shadow : none;
            margin-bottom: 10px;
            height: 450px;
            max-height: 450px;

            .el-radio {
                display: block;
            }

        }
    }
</style>
