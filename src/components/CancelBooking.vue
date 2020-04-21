<template>
    <div class="booking-cancellation" v-loading="loading">
        <el-form label-position="top" v-if="cancel_policy" :model="model" ref="cancellation_form">

            <el-form-item label="Reason for cancelling">
                <el-select v-model="model.cancel_reason">
                    <el-option value="Client not home" label="Client not home"></el-option>
                    <el-option value="Client rescheduled" label="Client rescheduled"></el-option>
                    <el-option value="Team late" label="Team late"></el-option>
                    <el-option value="Team canceled" label="Team canceled"></el-option>
                    <el-option value="Location inaccessible" label="Location inaccessible"></el-option>
                    <el-option value="Home not as described" label="Home not as described"></el-option>
                    <el-option value="Business Scheduling Conflict" label="Business Scheduling Conflict"></el-option>
                    <el-option value="Credit Card Declined" label="Credit Card Declined"></el-option>
                    <el-option value="Other" label="Other"></el-option>
                </el-select>
            </el-form-item>

            <el-form-item label="Kindly provide any additional comments" v-if="cancel_policy.require_reason">
                <el-input type="textarea" v-model="model.cancel_comment" rows="5"></el-input>
            </el-form-item>

            <div v-if="violatesPolicy()">
                <el-form-item label="Fee rate (%)" v-if="cancel_policy.late_fee.type === 'percent'">
                    <el-input-number v-model="model.cancel_rate"></el-input-number>
                </el-form-item>

                <el-form-item label="Fee Amount" v-if="cancel_policy.late_fee.type !== 'percent'">
                    <el-input-number v-model="model.cancel_rate"></el-input-number>
                </el-form-item>
            </div>

        </el-form>

        <div class="flex-row-reverse">
            <el-button size="small" round type="danger" @click="cancelBooking(true)" style="margin-left: 10px;"> Cancel
                with Fee ({{$currency}} {{fee}})
            </el-button>
            <el-button size="small" round @click="cancelBooking(false)"> Cancel without Fee</el-button>

        </div>

        <el-dialog top="0vh" title="Details" :visible.sync="confirmRecurring" append-to-body :modal="true">
            <div class="modal-body">
                <recurring-details @close="confirmRecurring = false" @confirm-change="confirmUpdate" mode="cancel" :booking.sync="booking" :booking-update.sync="booking" v-if="confirmRecurring"></recurring-details>
            </div>
        </el-dialog>

    </div>
</template>

<script>
    import RecurringDetails from "./RecurringBookings";
    export default {
        name: 'cancel-booking',
        components: {RecurringDetails},
        props: {
            booking: {
                type: Object,
                required: true
            }
        },
        data() {
            return {
                model: {
                    cancel_reason: "",
                    cancel_comment : "",
                    cancel_rate: 0,
                },
                rules: {
                    cancel_reason : [{message : "Reason is required", required:true}],
                    cancel_comment: [{
                        validator: (value, rule, callback) => {
                            if (this.cancel_policy.require_reason && value.trim().length === 0) {
                                return callback(new Error('Cancellation comment is required.'))
                            }
                            return callback()
                        }
                    }]
                },
                cancel_policy: false,
                fee: 0,
                loading: false,
                with_fee : false,
                confirmRecurring: false
            }
        },
        watch: {
            'model.cancel_rate'(val) {
                if (this.cancel_policy.late_fee.type === 'percent') {
                    this.fee = Number((this.booking.charge.total_after_tax * (val / 100)).toFixed(2))
                } else {
                    this.fee = this.model.cancel_rate
                }
            }
        },
        mounted() {
            this.loading = true
            this.axios.get('/companies/current/settings')
                .then(res => {
                    this.cancel_policy = res.data.booking.cancel_booking
                    this.model.cancel_rate = parseFloat(this.cancel_policy.late_fee.value)
                })
                .catch(err => {
                    this.$helpers.errorHandle(err)
                })
                .finally(() => {
                    this.loading = false
                })
        },
        methods: {
            violatesPolicy() {

                if (!this.cancel_policy.late_fee.enabled) return false

                let start = this.$moment(this.booking.service_date).subtract(parseInt(this.cancel_policy.enforce_period.value), this.cancel_policy.enforce_period.mode)
                if (start.unix() < this.$moment().unix())
                    return true

                return false
            },
            confirmUpdate(update_mode){
                this.$refs.cancellation_form.validate((valid) => {
                    if (valid) {
                        this.loading = true
                        this.axios.post('/bookings/' + this.booking.id + "/cancel", {
                            reason: this.model.cancel_reason,
                            comment : this.model.cancel_comment,
                            with_fee: this.with_fee,
                            rate: this.model.cancel_rate,
                            update_mode : update_mode
                        })
                            .then(res => {
                                this.$helpers.successHandle('Booking successfully cancelled')
                                this.$emit('cancelled')
                                this.with_fee = false
                            })
                            .catch(err => {
                                this.$helpers.errorHandle(err, this)
                                this.with_fee = false
                            })
                            .finally(() => {
                                this.loading = false
                            })
                    }
                })
            },

            cancelBooking(with_fee) {

                this.with_fee = with_fee

                if (this.booking.current_recurring){
                    this.confirmRecurring = true
                } else {
                    this.confirmUpdate({})
                }

            }
        }
    }
</script>