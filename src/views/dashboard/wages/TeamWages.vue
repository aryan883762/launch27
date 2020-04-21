<template>
    <div class="app-section team-payments">

        <el-card style="margin-bottom : 5px;">
            <el-page-header @back="$router.back()" content="Bookings on this">
                <div slot="content" v-if="wages.summary" v-loading="loading">
                    <account-avatar :account="{avatar: wages.summary.avatar, fullname: wages.summary.name}" body-class="pull-left"></account-avatar>
                    <span style="margin-left: 10px; display: inline-block; margin-top: 5px; font-size: 15px;">{{wages.summary.name}}</span>
                </div>
            </el-page-header>

            <el-divider></el-divider>
            <el-row :gutter="0" class="stats-row" v-if="wages.summary" v-loading="loading">
                <div class="second">
                    <span class="stats-number _second">{{$currency}}{{total_earned}}</span>
                    <label>Earned</label>
                </div>
                <el-divider direction="vertical"></el-divider>

                <div class="third">
                    <span class="stats-number _third">{{$currency}} {{wages.summary.tips | numeralFormat($money_format)}}</span>
                    <label>Tips</label>
                </div>
                <el-divider direction="vertical"></el-divider>

                <div class="fourth">
                    <span class="stats-number _fourth">{{$currency}}{{total_adjustment | numeralFormat($money_format)}}</span>
                    <label>Adjustments</label>
                </div>
                <el-divider direction="vertical"></el-divider>

                <div class="fourth">
                    <span class="stats-number _fourth">{{$currency}}{{wages.summary.paid | numeralFormat($money_format)}}</span>
                    <label>Paid</label>
                </div>
                <el-divider direction="vertical"></el-divider>

                <div class="fourth">
                    <span class="stats-number _fourth">{{wages.summary.hours_worked | duration}}</span>
                    <label>Hours Earned</label>
                </div>
                <el-divider direction="vertical"></el-divider>
                <div class="fourth">
                    <span class="stats-number _fourth">{{wages.summary.scheduled | duration}}</span>
                    <label>Hours Scheduled</label>
                </div>
            </el-row>
        </el-card>

        <el-card>
            <el-row>
                <el-col class="bg-white text-center">
                    <div class="pull-left main-filters">
                        <el-date-picker
                                :clearable="false"
                                @change="loadWages"
                                end-placeholder="End date"
                                range-separator="to"
                                size="small" start-placeholder="Start date" type="daterange" v-model="range"
                        />

                    </div>

                    <div class="pull-right main-filters">
                        <el-button @click="togglePayments(true)" plain round size="small" style="margin-right: 10px;" type="primary" v-if="show_wages">Payment Transactions</el-button>
                        <el-button @click="togglePayments(false)" plain round size="small" style="margin-right: 10px;" type="primary" v-else> Show Upcoming Payments</el-button>

                        <el-select @change='loadWages(1)' class="filter small pull-right" filterable placeholder="Team" style="width: 300px;" v-model="selected_team">
                            <el-option :key="team.id" :label="team.name" :value="team.id" v-for="team in teams">
                                {{ team.name }}
                            </el-option>
                        </el-select>


                        <el-button @click="paymentDialog = true" class="pull-right" round size="small" style="margin-right: 10px;" type="warning" v-if="!selected_payment && show_wages">Send Payment</el-button>
                        <el-button @click="paymentDialog = true" class="pull-right" round size="small" style="margin-right: 10px;" type="warning" v-if="selected_payment && selected_payment.is_draft && show_wages">Update Payment</el-button>


                    </div>
                </el-col>
            </el-row>

        </el-card>

        <el-scrollbar view-class="view-box" :native="false" :style="{maxHeight: (windowHeight - 340) + 'px', height: (windowHeight - 340) + 'px', overflow: 'hidden'}">

            <el-table
                    v-if="show_wages"
                    :data="wages.wages"
                    @selection-change="handleSelectionChange"
                    class="bg-white"
                    default-expand-all
                    ref="timesheets" row-key="bookingId" style="width: 100%"
                    v-loading="loading">
                <el-table-column
                        type="selection"
                        v-if="!selected_payment || (selected_payment && selected_payment.is_draft)"
                        width="55"
                >
                </el-table-column>
                <el-table-column label="Service Date">
                    <template slot-scope="scope">
                        <strong>
                            <el-link @click="workDiary(scope.row.service_date, scope.row.bookingId)" type="danger">{{$moment(scope.row.service_date).format($date_format)}}</el-link>
                        </strong>
                        <strong style="display:block;">{{$moment(scope.row.service_date).format( $time_format)}}</strong>
                    </template>
                </el-table-column>
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row>
                            <el-col :sm="12">
                                <span v-for="service in scope.row.booking_summary.service_details">
                                <label>{{ service.name }}</label>
                                <div v-html="getServiceOptions(service, scope.row.booking_summary)"></div>
                              </span>
                            </el-col>
                            <el-col :sm="12">
                                <el-row>
                                    <el-col>
                                        <el-tooltip content="This is total before tax" placement="left">
                                            <span style="width: 180px;display:inline-block;">Total </span>
                                        </el-tooltip>
                                        <span style="font-weight: bold;color:#333; display:inline-block;">{{$currency}}{{scope.row.booking_summary.total_before_tax}}</span>
                                    </el-col>
                                    <el-col>
                                        <span style="width: 180px; display:inline-block;">Tip</span> <span style="font-weight: bold;color:#333; display:inline-block;"> {{$currency}}{{scope.row.booking_summary.tip || 0}}</span>
                                    </el-col>

                                    <el-col>
                                        <span style="width: 180px; display:inline-block;">Adjustment</span> <span>
                                        <el-input :disabled="(selected_payment && !selected_payment.is_draft)" size="mini" style="width: 150px;" type="number" v-model="scope.row.adjustment"></el-input></span>
                                    </el-col>

                                    <el-col>
                                        <span style="width: 180px; display:inline-block;">Reason for adjustment</span> <span>
                                        <el-input :disabled="(selected_payment && !selected_payment.is_draft)" :rows="2" size="mini" type="textarea" v-model="scope.row.adjustment_reason"></el-input></span>
                                    </el-col>

                                    <el-col>
                                        <span style="width: 180px; display:inline-block;">Earned with Adj. & Tip</span> <span style="font-weight: bold;color:#333; display:inline-block;"> {{$currency}}{{(Number(scope.row.earned) + Number(scope.row.adjustment) + Number(scope.row.tip)).toFixed(2)}}</span>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>

                <el-table-column label="Customer" prop="name" width="250">
                    <template slot-scope="scope">
                        <account-avatar :account="{id : scope.row.customer.id, avatar : scope.row.customer.avatar, fullname: scope.row.customer.name}" :size="32" body-class="pull-left"></account-avatar>
                        <div style="margin-left: 10px;display:inline-block; width: calc(100% - 50px);">
                            <el-link>{{scope.row.customer.name}}</el-link>
                            <small style="display:block;">{{scope.row.customer.address}}</small>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="Earned">
                    <template slot-scope="scope">
                        {{$currency}} {{scope.row.earned}}
                    </template>
                </el-table-column>
                <el-table-column label="Tips">
                    <template slot-scope="scope">
                        {{$currency}} {{scope.row.tip || 0}}
                    </template>
                </el-table-column>
                <el-table-column label="Adjustments">
                    <template slot-scope="scope">
                        {{$currency}} {{scope.row.adjustment}}
                    </template>
                </el-table-column>
                <el-table-column label="Due">
                    <template slot-scope="scope">
                        {{$currency}} {{scope.row.dued}}
                    </template>
                </el-table-column>
                <el-table-column label="Paid">
                    <template slot-scope="scope">
                        {{$currency}} {{scope.row.paid}}
                    </template>
                </el-table-column>
                <el-table-column label="Hrs Worked">
                    <template slot-scope="scope">
                        {{scope.row.hours_worked | duration}}
                    </template>
                </el-table-column>
                <el-table-column label="Hrs Scheduled">
                    <template slot-scope="scope">
                        {{scope.row.scheduled | duration}}
                    </template>
                </el-table-column>
                <el-table-column label="Wage">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.pay_rate_type == 'percent'"> {{scope.row.pay_rate}}%</el-tag>
                        <el-tag v-else>{{$currency}}{{scope.row.pay_rate}}</el-tag>
                    </template>
                </el-table-column>
            </el-table>
            <div v-if="!show_wages" v-loading="payment_loading">
                <el-table :data="payments">
                    <el-table-column label="Date">
                        <template slot-scope="scope">
                            <div>{{$moment(scope.row.payment_date).format($date_format)}}</div>
                            <small>{{$moment(scope.row.payment_date).format($time_format)}}</small>
                        </template>
                    </el-table-column>
                    <el-table-column type="expand">
                        <template slot-scope="scope">
                            <p>Description: {{scope.row.description}}</p>
                            <p>Adjustment Reason: {{scope.row.adjustment_reason}}</p>
                        </template>
                    </el-table-column>
                    <el-table-column label="Method" prop="payment_method"></el-table-column>
                    <el-table-column label="Is Draft">
                        <template slot-scope="scope">
                            <label style="display:block;">{{scope.row.is_draft ?'Yes':'No'}}</label>
                            <el-link @click="editPayment(scope.row.id)" type="primary" v-if="scope.row.is_draft">Edit</el-link>
                        </template>
                    </el-table-column>
                    <el-table-column label="Adjustment" prop="adjustment"></el-table-column>
                    <el-table-column label="Total">
                        <template slot-scope="scope">
                            {{$currency}} {{scope.row.total}}
                        </template>
                    </el-table-column>
                    <el-table-column label="Option">
                        <template slot-scope="scope">
                            <el-link @click="getPaymentWages(scope.row)" size="small" type="danger">View</el-link>
                        </template>
                    </el-table-column>

                </el-table>

            </div>

        </el-scrollbar>

        <el-dialog :visible.sync="paymentDialog" @closed="paymentsClosed" append-to-body title="Team Payment" width="40%">
            <div class="modal-body">
                <el-form :model="payment_transaction" :rules="rules" labelPosition="top" ref="paymentsfrm" size="small" v-loading="payment_loading">

                    <el-row :gutter="20">
                        <el-col :md="12" :sm="12">
                            <el-form-item label="Payment Method" prop="payment_method">
                                <el-select placeholder="Payment method" v-model="payment_transaction.payment_method">
                                    <el-option label="Check" value="check"></el-option>
                                    <el-option label="Cash" value="cash"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :md="12" :sm="12">
                            <el-form-item label="Pay Period Date" prop="payment_date">
                                <el-date-picker placeholder="Pick a date" style="width: 100%;" type="date" v-model="payment_transaction.payment_date"></el-date-picker>
                            </el-form-item>
                        </el-col>
                    </el-row>


                    <el-form-item label="Payment description" prop="description">
                        <el-input :rows="4" type="textarea" v-model="payment_transaction.description"></el-input>
                    </el-form-item>

                    <el-form-item label="Adjustment Amount">
                        <el-input prefix-icon="el-icon-money" type="number" v-model="payment_transaction.adjustment"></el-input>
                    </el-form-item>
                    <el-form-item label="Adjustment description">
                        <el-input :rows="4" type="textarea" v-model="payment_transaction.adjustment_reason"></el-input>
                    </el-form-item>

                    <div style="font-size: 18px;">
                        <el-tag>Total Bookings {{selected_payments.length}}</el-tag>
                        <el-row>
                            <span>Total before adjustment</span><span style="display:inline-block;margin-left: 10px;"> <strong>{{$currency}} {{total_before_adjustment}}</strong></span>
                        </el-row>
                        <el-row>
                            <span>Adjustment</span><span style="display:inline-block;margin-left: 10px;"><strong>{{$currency}} {{total_adjustment}}</strong></span>
                        </el-row>
                        <el-row>
                            <span>Total Earned </span> <span style="display:inline-block;margin-left: 10px;"><strong>{{$currency}}{{total_earned}}</strong></span>
                        </el-row>
                    </div>

                </el-form>
            </div>
            <div slot="footer">
                <el-button @click="submitPayment(true)" round size="small" type="warning">Save Draft</el-button>
                <el-button @click="paymentDialog = false" round size="small">Cancel</el-button>
                <el-button @click="submitPayment(false)" round size="small" type="primary">Save Payment</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>

    import AccountAvatar from "../../../components/AccountAvatar";

    export default {
        components: {
            AccountAvatar
        },
        data() {
            return {
                payment_transaction: {
                    adjustment: 0,
                    adjustment_reason: "",
                    description: "",
                    payment_method: "cash",
                    is_draft: false,
                    payment_date: "",
                    timesheets: []
                },
                teams: [],
                selected_team: this.$route.params.id,
                wages: {},
                loading: false,
                payment_loading: false,
                current_page: 1,
                total_records: 0,
                page_size: 0,
                active_filter: true,
                range: [],
                selected_payments: [],
                paymentDialog: false,
                rules: {
                    payment_method: [{message: "payment method required", required: true}],
                    payment_date: [{message: "payment date required", required: true}],
                    description: [{message: "description required", required: true}]

                },
                show_wages: true,
                payments: [],
                payment_mode: false,
                selected_payment: false
            }
        },
        computed: {
            total_before_adjustment() {
                let total = 0
                this.selected_payments.forEach((pay) => {
                    total += (Number(pay.earned))
                })
                return total.toFixed(2)
            },
            total_earned() {
                let total = 0
                this.selected_payments.forEach((pay) => {
                    total += (Number(pay.earned) + Number(pay.adjustment) + Number(pay.tip))
                })
                return total.toFixed(2)
            },
            total_adjustment() {
                let total = 0
                this.selected_payments.forEach((pay) => {
                    total += Number(pay.adjustment)
                })
                return total.toFixed(2)
            }
        },
        beforeMount() {
            //load people teams
            this.range = [this.$moment().startOf('week').toDate(), this.$moment().endOf('week').toDate()]
            this.loadWages(1);
        },
        created() {
            this.getTeams()
            this.selected_team = this.$route.params.id
        },
        methods: {
            handleSelectionChange(val) {
                this.selected_payments = val;
            },

            togglePayments(val) {
                if (val) {
                    this.show_wages = false
                    this.getPayments()
                } else {
                    this.selected_payment = false
                    this.loadWages()
                    this.show_wages = true
                }
            },

            submitPayment(is_draft) {

                if (this.selected_payments.length === 0 && parseInt(this.payment_transaction.adjustment) === 0) {
                    this.$alert("Payment cannot be created with 0 Adjustment amount and no bookings.", "Team Payment")
                    return;
                }

                this.$refs.paymentsfrm.validate((valid) => {
                    if (valid) {
                        this.payment_loading = true
                        this.payment_transaction.is_draft = is_draft
                        this.payment_transaction.adjustment = Number(this.payment_transaction.adjustment)

                        this.payment_transaction.timesheets = []

                        this.selected_payments.forEach((timesheet) => {
                            this.payment_transaction.timesheets.push({
                                timesheetId: timesheet.timesheetId,
                                bookingId: timesheet.bookingId,
                                adjustment: timesheet.adjustment,
                                earned: timesheet.earned,
                                tip: timesheet.tip || 0
                            })
                        })

                        if (!this.selected_payment) {
                            this.axios.post('/team_payment_transactions/' + this.selected_team + '/payment', this.payment_transaction)
                                .then(res => {
                                    this.paymentDialog = false
                                    //reload wages
                                    this.loadWages()
                                    this.$message.success('Payment successfully posted')
                                })
                                .catch(err => {
                                    this.$helpers.errorHandle(err, this)
                                })
                                .finally(() => {
                                    this.payment_loading = false
                                })
                        } else {
                            this.axios.put('/team_payment_transactions/' + this.selected_payment.id + '/payment', this.payment_transaction)
                                .then(res => {
                                    this.paymentDialog = false
                                    //reload wages
                                    this.loadWages()
                                    this.$message.success('Payment successfully posted')
                                })
                                .catch(err => {
                                    this.$helpers.errorHandle(err, this)
                                })
                                .finally(() => {
                                    this.payment_loading = false
                                })
                        }


                    }
                })
            },
            getTeams() {
                this.axios.get('/companies/current/accounts',
                    {
                        params: {
                            filter: {
                                where: {
                                    active: this.active_filter,
                                    role: "r_team"
                                }
                            }
                        }
                    })
                    .then(res => {
                        this.teams = res.data
                    })
            },
            settingsRedirect() {
                this.$router.back();
            },
            workDiary(service_date, bookingId) {

                this.$router.push({name: 'dashboard_booking_view', params: {id: bookingId, service_date: service_date}})

            },
            loadWages(current_page) {
                this.loading = true
                this.axios.get('/timesheets/' + this.selected_team + '/wages', {
                    params: {
                        page: this.current_page,
                        from: this.range[0],
                        to: this.range[1],
                        status: this.active_filter
                    }
                })
                    .then(res => {
                        this.wages = res.data
                        this.show_wages = true
                        this.$nextTick(() => {
                            this.$refs.timesheets.toggleAllSelection()
                        })
                    })
                    .catch(err => {

                    })
                    .finally(() => {
                        this.loading = false
                    })
            },
            viewTimesheet(accountId) {
                this.$router.push({name: "dashboard_wages_team", id: accountId})
            },
            getServiceOptions(full_service, booking) {
                if (full_service.hourly) {
                    let service = booking.services.find(srv => {
                        return srv.id === full_service.id;
                    });

                    if (service) return "<small>" + service.hourly.teams + " teams for " + service.hourly.hours + " hrs" + "</small>";
                    else return "";
                }

                let content = "";

                if (full_service.pricing_variables && full_service.pricing_variables.length > 0) {
                    for (let x = 0; x < full_service.pricing_variables.length; x++) {
                        let selected_pv;

                        let service = booking.services.find(srv => {
                            return srv.id === full_service.id;
                        });

                        if (service.pricing_variables) {
                            let pvv = service.pricing_variables.find(pv => {
                                return pv.id === full_service.pricing_variables[x].id;
                            });

                            if (pvv) {
                                if (pvv.quantity) content += "<small>" + pvv.quantity + "x " + full_service.pricing_variables[x].name + "</small>";
                                else {
                                    let price = full_service.pricing_variables[x].prices.find(price => {
                                        return price.id === pvv.price_id;
                                    });

                                    content += "<small>" + full_service.pricing_variables[x].name + " : " + (price.label || price.max_qty + " - " + price.min_qty) + "</small>";
                                }
                            }
                        }
                    }
                }

                return content;
            },
            paymentsClosed() {
                if (!this.selected_payment)
                    this.payment_transaction = {
                        adjustment: 0,
                        adjustment_reason: "",
                        description: "",
                        payment_method: "cash",
                        is_draft: false,
                        payment_date: "",
                        timesheets: []
                    }
            },

            getPaymentWages(payment) {
                this.loading = true
                this.selected_payment = payment
                this.axios.get('/timesheets/payment/' + payment.id + '/wages',
                    {
                        params: {}
                    })
                    .then(res => {
                        this.wages = res.data
                        this.payment_transaction = payment
                        this.show_wages = true
                        this.$nextTick(() => {
                            this.$refs.timesheets.toggleAllSelection()
                        })
                    })
                    .catch(err => {

                    })
                    .finally(() => {
                        this.loading = false
                    })
            },

            getPayments() {
                this.payment_loading = true
                this.axios.get('/companies/current/team_payment_transactions',
                    {
                        params: {
                            filter: {
                                where: {
                                    accountId: this.selected_team
                                }
                            }
                        }
                    })
                    .then(res => {
                        this.payments = res.data
                    })
                    .catch(err => {
                    })
                    .finally(() => {
                        this.payment_loading = false
                    })
            }
        }

    }
</script>

<style lang="scss">

    .team-payments {
        .el-card {
            .el-page-header__left {
                .el-page-header__title {
                    line-height: 1;
                    padding: 10px 0;
                }
            }
        }

        .el-table tr {
            line-height: 2;
        }

        .el-divider {
            margin: 8px;
        }

        .el-table .el-table__expanded-cell[class*=cell] {
            padding: 10px 20px;
            background: #1ca4e614;
        }

        .el-divider--vertical {
            display: inline-block;
            width: 1px;
            height: 4em;
            margin: 0 8px;
            vertical-align: middle;
            position: relative;

            &.divider-mini {
                height: 1em;
            }
        }


    }

</style>
