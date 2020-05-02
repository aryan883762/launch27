<template>
    <el-row>
        <!-- Chart -->
        <el-row>
            <el-col :xs="24" :sm="12" :md="12">
                <el-card style="margin: 20px;">
                    <booking-types :bookings.sync="bookings" :loading.sync="loading"></booking-types>
                    <span style="color:red;">* This does not include forecasted bookings</span>
                </el-card>
            </el-col>

            <el-col :xs="24" :sm="12" :md="12">
                <el-card style="margin: 20px;">
                    <new-bookings :bookings.sync="bookings" :loading.sync="loading"></new-bookings>
                    <span style="color:red;">* This does not include forecasted bookings</span>
                </el-card>
            </el-col>    

            <el-col :xs="24" :sm="12" :md="12">
                <el-card style="margin: 20px;">
                    <frequency :bookings.sync="bookings" :loading.sync="loading"></frequency>
                    <span style="color:red;">* This does not include forecasted bookings</span>
                </el-card>
            </el-col> 

            <el-col :xs="24" :sm="12" :md="12">
                <el-card style="margin: 20px;">
                    <total-sales-by-booking-extra :bookings.sync="bookings" :loading.sync="loading"></total-sales-by-booking-extra>
                </el-card>
            </el-col>

            <!-- <el-col :xs="24" :sm="12" :md="12">
                <el-card style="margin: 20px;">
                    <forecasted-bookings :bookings.sync="forecast_bookings" :loading.sync="loading"></forecasted-bookings>
                    <span style="color:red;">* This does not include cancelled bookings</span>
                </el-card>
            </el-col> -->

            <!-- <el-col :xs="24" :sm="12" :md="12">
                <el-card style="margin: 20px;">
                    <recurring-bookings v-if="booking_chart_type === 'recurring'"></recurring-bookings>
                </el-card>
            </el-col> 

            <el-col :xs="24" :sm="12" :md="12">
                <el-card style="margin: 20px;">
                    <total-visitors-vs-booking v-if="booking_chart_type === 'totalvisitorsvsbooking'"></total-visitors-vs-booking>
                </el-card>
            </el-col> 

            <el-col :xs="24" :sm="12" :md="12">
                <el-card style="margin: 20px;">
                    <booking-form-conversion v-if="booking_chart_type === 'bookingformconversion'"></booking-form-conversion>
                </el-card>
            </el-col> 

            <el-col :xs="24" :sm="12" :md="12">
                <el-card style="margin: 20px;">
                    <total-visitors v-if="booking_chart_type === 'totalvisitors'"></total-visitors>
                </el-card>
            </el-col> 

            <el-col :xs="24" :sm="12" :md="12">
                <el-card style="margin: 20px;">
                    <recleans v-if="booking_chart_type === 'recleans'"></recleans>
                </el-card>
            </el-col> 

            <el-col :xs="24" :sm="12" :md="12">
                <el-card style="margin: 20px;">
                    <forecasting v-if="booking_chart_type === 'forecasting'"></forecasting>
                </el-card>
            </el-col> -->
          </el-row>
      </el-row>
</template>

<script>
    import BookingTypes from './BookingTypes.vue'
    import NewBookings from './NewBookings.vue'
    import ForecastedBookings from './ForecastedBookings.vue'
    import Frequency from './Frequency.vue'
    import TotalSalesByBookingExtra from '../money/SalesByBookingExtra'

    // import RecurringBookings from './RecurringBookings.vue'
    // import TotalVisitorsVsBooking from './TotalVisitorsVsBooking.vue'
    // import BookingFormConversion from './BookingFormConversion.vue'
    // import TotalVisitors from './TotalVisitors.vue'
    // import Recleans from './Recleans.vue'
    // import Forecasting from './Forecasting.vue'

    export default {
         components: {
            BookingTypes,
            NewBookings,
            ForecastedBookings,
            Frequency,
            TotalSalesByBookingExtra,
            // RecurringBookings,
            // TotalVisitorsVsBooking,
            // BookingFormConversion,
            // TotalVisitors,
            // Recleans,
            // Forecasting,
        },
        props: {
            bookings: {
                type: Object,
                required: true
            },
            loading:{
                type: Boolean,
                required: true
            },
            forecast_bookings:{
                type: Array,
                required: true
            }
        },
        data() {
            return {
                forecasted_bookings:[],
                include: []
            }
        }
}
</script>