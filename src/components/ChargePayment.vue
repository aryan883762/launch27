<template>

    <div class="charge-payments-form" v-loading="loading">

        <el-row v-if="show_payments">
            <el-button @click="addNew()" class="pull-right" plain round size="mini" type="success">Add Manual Payment</el-button>

            <div class="flex-row">
                 <span v-if="booking_charge">
                     <label style="font-size:13px; display:block;">Total Paid: <strong style="color:green">{{$currency}} {{Number(booking_charge.total_payments.toFixed(2))}}</strong></label>
                      <label style="font-size:13px; display:block;">Outstanding: <strong style="color:red">{{$currency}} {{(booking_charge.total_after_tax - booking_charge.total_payments).toFixed(2)}}</strong></label>
                </span>

            </div>

            <el-divider>Booking Payments</el-divider>

            <el-row :gutter="20">
                <div style="padding: 10px;">
                    <el-checkbox v-model="payment_refunded" @change="getPayments">Show Refunded Payments</el-checkbox>
                </div>

                <el-card v-if="payments.length > 0 && view === 'payments'">

                    <el-table :data="payments" style="width : 100%;">
                        <el-table-column label="Date" prop="payment_date" width="200">
                            <template slot-scope="scope">
                                {{$moment(scope.row.payment_date).format($date_format + ' ' + $time_format)}}
                            </template>
                        </el-table-column>
                        <el-table-column label="Tranx ID" width="200" prop="transaction_id"></el-table-column>
                        <el-table-column label="Amount">
                            <template slot-scope="scope">
                                {{$currency}}{{scope.row.amount}}
                            </template>
                        </el-table-column>
                        <el-table-column label="Amount Refunded" v-if="payment_refunded">
                            <template slot-scope="scope">
                                {{$currency}}{{scope.row.amount_refunded}}
                            </template>
                        </el-table-column>
                        <el-table-column label="On Hold?" v-if="!payment_refunded">
                            <template slot-scope="scope">
                                {{(scope.row.charge_captured && booking.payment_type === 'card') ? 'No' : 'Yes'}}
                            </template>
                        </el-table-column>
                        <el-table-column label="Options" width="300">
                            <template slot-scope="scope">
                                <template v-if="scope.row.mode !== 'giftcard'">
                                    <el-link @click="deletePayment(scope.row)" plain size="mini" v-if="scope.row.mode !== 'card'">Delete</el-link>
                                    <el-link @click="editPayment(scope.row)" plain size="mini" v-if="scope.row.mode !== 'card'">Edit</el-link>
                                    <el-link @click="startRefund(scope.row)" plain size="mini" type="warning" v-if="scope.row.charge_captured && scope.row.mode ==='card' && !payment_refunded">Refund</el-link>
                                    <el-link @click="chargeOnHold(scope.row)" plain size="mini" type="danger" v-if="!!scope.row.charge_refunded && !scope.row.charge_captured && scope.row.mode ==='card' ">Charge</el-link>
                                </template>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-card>

                <el-col v-if="payments.length == 0 && view== 'payments'">
                    No payments found for this booking
                </el-col>


                <charge-booking :booking.sync="booking" :charge.sync="booking_charge" @charge-completed="chargeCompleted" v-if="view == 'charge'"></charge-booking>


            </el-row>

        </el-row>

        <transition name="slide-fade">
            <el-card v-if="!show_payments">
                <el-form :model="model" label-position="top">
                    <el-form-item label="Payment Method">
                        {{booking.payment_type}}
                    </el-form-item>

                    <el-form-item label="Transaction or Invoice ID">
                        <el-input v-model="model.transaction_id"></el-input>
                    </el-form-item>

                    <el-row :gutter="20">
                        <el-col :md="12" :sm="12">
                            <el-form-item label="Amount">
                                <el-input type="number" v-model="model.amount">
                                    <span slot="prepend">{{$currency}}</span>
                                </el-input>
                            </el-form-item>
                        </el-col>

                        <el-col :md="12" :sm="12">
                            <el-form-item label="Date of Payment">
                                <el-date-picker :format="dt_format" placeholder="time" type="datetime" v-model="model.payment_date"></el-date-picker>
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-form-item label="Description">
                        <el-input :rows="6" type="textarea" v-model="model.description"></el-input>
                    </el-form-item>

                    <el-form-item v-if="false">
                        <el-checkbox v-model="model.send_receipt">Send Receipt</el-checkbox>
                    </el-form-item>

                    <el-form-item>
                        <div class="padding-2x">
                            <el-button @click="savePayment()" class="pull-right" round size="small" type="primary">Save Payment</el-button>
                            <el-button @click="show_payments = true" class="pull-right" round size="small" style="margin-right: 10px;">Cancel</el-button>
                        </div>
                    </el-form-item>


                </el-form>

            </el-card>
        </transition>

        <el-dialog :append-to-body="true" :modal="true" :visible.sync="dialog" v-loading="processing" width="30%">
            <div class="modal-body">
                <el-form label-position="top" v-if="selectedPayment">
                    <el-form-item label="Confirm amount to refund">
                        <el-input type="number" v-model="amount_to_process">
                            <span slot="prepend">{{$currency}}</span>
                        </el-input>
                    </el-form-item>
                </el-form>
            </div>
            <div slot="footer">
                <el-button @click="dialog=false" round size="small">Cancel</el-button>
                <el-button @click="refundPayment()" round size="small" type="primary">Refund Payment</el-button>
            </div>
        </el-dialog>
    </div>


</template>


<script>
    import ChargeBooking from "./ChargeBooking";

    export default {
        props: {
            booking: {},
            charge: {},
            intial_view: {
                type: String,
                default: 'payments'
            },
            action: {
                type: String,
                default: 'list'
            }
        },
        components: {
            ChargeBooking
        },
        data() {
            return {
                model: {
                    amount: 0,
                    description: "",
                    payment_date: '',
                    mode: '',
                    transaction_id: '',
                    send_receipt: true,
                    charge_captured: true
                },
                amount_to_process: 0,
                payments: [],
                show_payments: true,
                loading: true,
                booking_charge: false,
                selectedPayment: false,
                dialog: false,
                processing: false,
                view: '',
                dt_format: '',
                payment_refunded: false
            }
        },
        mounted() {
            this.booking_charge = this.charge
            this.model.amount = this.booking_charge.total_after_tax - this.booking_charge.total_payments
            this.model.payment_date = this.$moment().toDate()
            this.model.description = "Payment received for " + this.booking.service_date
            this.model.mode = this.booking.payment_type
            this.show_payments = true;
            this.dt_format = this.$helpers.toElFormat(this.$date_format)

            this.view = this.intial_view

            this.getPayments()

            if (this.action === 'add') {
                if (this.view == 'payments') {
                    this.addNew()
                } else {
                    this.charge_mode()
                }
            } else {

            }

        },
        methods: {
            addNew() {

                this.view = 'payments'
                this.model = {
                    amount: this.booking_charge.total_after_tax - this.booking_charge.total_payments,
                    description: "",
                    payment_date: this.$moment().toDate(),
                    transaction_id: '',
                    mode: this.booking.payment_type,
                    send_receipt: true,
                    paid: true,
                    charge_captured: true
                }
                this.show_payments = false;

            },
            charge_mode() {

                //only do this if company payment settings is right
                if ((this.$auth.user().company.payment_methods.card_processor == 'stripe' ||
                    this.$auth.user().company.payment_methods.card_processor == 'fspay' && this.$auth.user().company.payment_methods.fspay_credentials)
                    &&
                    this.$auth.user().company.payment_methods.card
                ) {
                    this.view = 'charge'
                } else {
                    this.$helpers.successHandle('No payment gateway has been setup.', this)
                }


            },
            chargeCompleted() {
                this.view = 'payments'
                this.getPayments()
            },
            deletePayment(payment) {
                this.$confirm("Are sure you want to delete this payment?").then(() => {
                    this.axios.delete('/charges/' + this.charge.id + '/payments/' + payment.id)
                        .then(res => {
                            this.getPayments()
                        })
                })

            },
            editPayment(payment) {
                this.model = payment
                this.model.mode = this.booking.payment_type
                this.model.send_receipt = payment.send_receipt
                this.show_payments = false
            },
            getPayments() {
                this.loading = true

                //also trigger update of selected charge
                this.$emit('payments-updated')


                this.axios.get('/charges/' + this.booking_charge.id, {
                    params: {
                        filter: {
                            include: ['card']
                        }
                    }
                })
                    .then(res => {
                        this.booking_charge = res.data
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this)
                    })

                this.axios.get('/charges/' + this.charge.id + '/payments',
                    {
                        params: {
                            filter: {
                                where: {
                                    refunded: this.payment_refunded
                                },
                            }
                        }
                    })
                    .then(res => {
                        this.payments = res.data
                    })
                    .catch()
                    .then(
                        _ => {
                            this.loading = false
                        }
                    )
            },
            savePayment(receipt) {
                //if there's no payment
                this.loading = true;
                if (this.model.hasOwnProperty('id')) {
                    this.axios.put('/charges/' + this.charge.id + '/payments/' + this.model.id, this.model)
                        .then(res => {
                            this.$message.success("Charge successfully updated, you would receive an alert when the process is completed")
                            this.show_payments = true
                            this.getPayments()
                        })
                        .catch()
                        .then(() => {
                            this.loading = true;
                        })
                } else {
                    this.axios.post('/charges/' + this.charge.id + '/payments', this.model)
                        .then(res => {
                            this.$message.success("Charge successfully updated, you would receive an alert when the process is completed")
                            this.show_payments = true
                            this.getPayments()
                        })
                        .catch()
                        .then(() => {
                            this.loading = true;
                        })
                }

            },

            chargeOnHold(payment) {
                this.$confirm('Are you sure you want to charge this payment? ' + this.$currency + payment.amount)
                    .then(() => {
                        this.processing = true
                        this.axios.put("/payments/" + payment.id + '/capture', {
                            amount: parseFloat(payment.amount)
                        })
                            .then(res => {
                                this.getPayments()
                                this.dialog = false
                                this.selectedPayment = false
                            })
                            .catch(err => {
                                this.$helpers.errorHandle(err, this)
                            })
                            .then(() => {
                                this.processing = false
                            })
                    })
            },

            startRefund(payment) {
                this.selectedPayment = payment
                this.amount_to_process = (payment.amount - payment.amount_refunded)
                this.dialog = true
            },

            refundPayment() {
                this.$confirm('Are you sure you want to refund ' + this.$currency + this.amount_to_process)
                    .then(() => {
                        this.processing = true
                        this.axios.put("/payments/" + this.selectedPayment.id + '/refund', {
                            amount: parseFloat(this.amount_to_process)
                        })
                            .then(res => {
                                this.getPayments()
                                this.dialog = false
                                this.selectedPayment = false
                            })
                            .catch(err => {
                                this.$helpers.errorHandle(err, this)
                            })
                            .then(() => {
                                this.processing = false
                            })
                    })
            }
        }
    }
</script>

<style lang="scss">
    .charge-payments-form {

        .el-card {
            box-shadow: none !important;
        }

        .el-card__header {
            padding: 10px 20px;

            span {
                font-size: 15px;
            }
        }

        .el-timeline {
            padding: 0px;

            .el-timeline-item__tail {
                position: absolute;
                left: 4px;
                height: 100%;
                border-left: 1px dashed $launch-primary-color;
            }

            .el-timeline-item__node {
                background-color: $launch-primary-color;
            }

            .charge-card {
                small {
                    display: block;
                }
            }

            .charge-headline {
                i {
                    font-style: normal;
                    font-size: 11px;
                    font-weight: bold;

                    &.paid {
                        color: green;
                    }

                    &.unpaid {
                        color: red;
                    }

                }
            }

            .action-box {
                position: relative;

                .action-button {
                    position: absolute;
                    right: 10px;
                    top: 10px;
                }
            }

        }

        .el-divider--vertical {
            display: inline-block;
            width: 1px;
            height: 1em;
            margin: 0 8px;
            vertical-align: middle;
            position: relative;

            &.divider-mini {
                height: 1em;
            }
        }

        .el-card.payment {
            .el-card__body {
                padding: 10px;
            }
        }

        .onhold-tag {
            font-size: 10px;
        }
    }
</style>
