<template>
    <div v-loading="loading">

        <template v-if="!date_frequency_changed">
            <p>Would you like to change <strong>Only This Booking</strong>, <strong> All Following Bookings </strong>, or <strong>All Bookings</strong> that have not been completed yet?</p>

            <el-divider></el-divider>
            <el-radio-group v-model="update_mode">
                <el-radio label="only" size="mini">Only this booking</el-radio>
                <el-radio label="only_future" size="mini">This booking and future
                    bookings
                </el-radio>
                <el-radio label="all" size="mini">All Bookings</el-radio>
            </el-radio-group>
        </template>

        <template v-if="date_frequency_changed">
            <h4>Date & Time changed</h4>

            <p>Select how you would want to handle future bookings</p>

            <el-radio-group v-model="reset_future_bookings">
                <div>
                    <el-radio :label="false"><strong>Normal, make no changes to schedule</strong></el-radio>
                </div>
                <div>
                    <el-radio :label="true"><strong>from the Date and Frequency selected Today</strong></el-radio>
                </div>
            </el-radio-group>

            <el-divider></el-divider>


            <el-table :data="new_schedule">
                <el-table-column label="Old Upcoming dates">
                    <template slot-scope="scope">
                        {{$moment(scope.row.current).format($date_format + ' ' + $time_format)}}
                    </template>
                </el-table-column>
                <el-table-column label="New Upcoming dates">
                    <template slot-scope="scope">
                        {{$moment(scope.row.update).format($date_format + ' ' + $time_format)}}
                    </template>
                </el-table-column>
            </el-table>

            <el-table :data="confirmed_dates">
                <el-table-column label="Already Confirmed Recurring Dates">
                    <template slot-scope="scope">
                        {{$moment(scope.row.service_date).format($date_format + ' ' + $time_format)}}
                    </template>
                </el-table-column>
                <el-table-column>
                    <template slot-scope="scope">
                        <el-link type="danger" size="small" @click="viewBooking(scope.row)">View Booking</el-link>
                    </template>
                </el-table-column>
            </el-table>
        </template>

        <div style="display: flex; flex-direction: row-reverse;margin-top: 20px;">
            <el-button round size="small" type="primary" style="margin-left: 10px;" @click="confirmChange">Confirm Change</el-button>
            <el-button round size="small" @click="closeDialog">Cancel</el-button>

        </div>

    </div>
</template>

<script>
    export default {
        name: "recurring-details",
        props: {
            booking: {
                type: Object,
                required: true
            },
            bookingUpdate: {
                type: Object,
                required: true
            },
            mode: {
                type: String,
                default: 'edit'
            }
        },
        data() {
            return {
                date_frequency_changed: false,
                loading: false,
                new_schedule: [],
                confirmed_dates: [],
                reset_future_bookings: false,
                update_mode: false
            }
        },
        mounted() {
            if ((this.bookingUpdate.frequency || this.bookingUpdate.service_date) && this.mode !== 'cancel') {
                this.date_frequency_changed = true
            }

            //there's intention to change service_date
            if ((this.bookingUpdate.frequency || this.bookingUpdate.service_date) && this.mode !== 'cancel'){
                this.getRecurringDetails()
            }

        },
        methods: {
            getRecurringDetails() {
                this.loading = true
                this.axios.get('/bookings/' + this.booking.id + '/forecasted/details', {
                    params: {
                        service_date: this.bookingUpdate.service_date || this.booking.service_date,
                        frequencyId: (this.bookingUpdate.frequency) ? this.bookingUpdate.frequency.id : this.booking.frequencyId,
                    }
                })
                    .then(res => {
                        console.log(res.data)
                        this.confirmed_dates = res.data.confirmed
                        for (let x = 0; x < res.data.current.length; x++) {
                            this.new_schedule.push({
                                current: res.data.current[x],
                                update: res.data.delta[x]
                            })
                        }

                    })
                    .catch(err => {

                    })
                    .finally(() => {
                        this.loading = false
                    })
            },
            viewBooking(row) {
                let routeData = this.$router.resolve({
                    name: 'dashboard_booking_view',
                    params: {id: row.confirmedId, service_date: row.service_date}
                });
                window.open(routeData.href, '_blank');
            },
            confirmChange() {
                this.loading = true
                this.$emit('confirm-change', {
                    reset_future_bookings: this.reset_future_bookings,
                    update_mode: this.update_mode
                })
            },
            closeDialog() {
                this.$emit('close')
            }
        }
    }
</script>


<style lang="scss">

</style>