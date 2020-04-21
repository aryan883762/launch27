<template>
    <div class="people-stats-section">
        <div shadow="never" v-for="">
            <el-row :gutter="15">
                <el-col :md="24">
                    <el-card shadow="never">
                        <el-row>
                            <el-col>
                                <span class="address-box-title">Total Booking</span>
                                <p class="address-box-sub-title">
                                    Total monthly bookings
                                </p>
                                <total-booking-chart :chart-data="totalBookings" :options="themeOption" style="height: 180px"/>
                            </el-col>
                        </el-row>
                    </el-card>
                </el-col>

               <!-- <el-col :md="12">
                    <el-card shadow="never">
                        <el-row>
                            <el-col>
                                <span class="address-box-title">Total Rating</span>
                                <p class="address-box-sub-title">
                                    Total monthly ratings
                                </p>
                                <total-booking-chart :chart-data="totalRatings" :options="themeOption" style="height: 180px"/>
                            </el-col>
                        </el-row>
                    </el-card>
                </el-col>

                <el-col :md="12">
                    <el-card shadow="never">
                        <el-row>
                            <el-col>
                                <span class="address-box-title">Services</span>
                                <p class="address-box-sub-title">
                                    Most Popular Service
                                </p>
                                <total-booking-chart :chart-data="dataCollection3" :options="themeOption" style="height: 180px"/>
                            </el-col>
                        </el-row>
                    </el-card>
                </el-col>-->

                <el-col :md="24">
                    <el-card shadow="never">
                        <el-row>
                            <el-col>
                                <span class="address-box-title">Total Revenue</span>
                                <p class="address-box-sub-title">
                                    Total Monthly Revenue
                                </p>
                                <total-booking-chart :chart-data="totalRevenue" :options="themeOption" style="height: 180px"/>
                            </el-col>
                        </el-row>
                    </el-card>
                </el-col>
            </el-row>

            <el-row v-if="false">
                <el-card class="people-stat-list" shadow="none">
                    <!--<el-row>
                      <el-col :md="18"><span class="address-box-title">Team member since</span></el-col>
                      <el-col :md="6"><span class=""></span></el-col>
                    </el-row>-->
                    <el-row>
                        <el-col :md="18">
                            <span class="address-box-title">Last Appointment</span>
                        </el-col>
                        <el-col :md="6">
                            <span class="">...</span>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :md="18">
                            <span class="address-box-title">Referral Source</span>
                        </el-col>
                        <el-col :md="6">
                            <span class=""></span>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :md="18">
                            <span class="address-box-title">Last Login</span>
                        </el-col>
                        <el-col :md="6">
                            <span class=""></span>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :md="18">
                            <span class="address-box-title">Have the Mobile App</span>
                        </el-col>
                        <el-col :md="6">
                            <span class=""></span>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :md="18">
                            <span class="address-box-title">Total Cancellations</span>
                        </el-col>
                        <el-col :md="6">
                            <span class=""></span>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :md="18">
                            <span class="address-box-title">Recurring</span>
                        </el-col>
                        <el-col :md="6">
                            <span class=""></span>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :md="18">
                            <span class="address-box-title">One-Time</span>
                        </el-col>
                        <el-col :md="6">
                            <span class=""></span>
                        </el-col>
                    </el-row>

                    <el-row>
                        <el-col :md="18">
                            <span class="address-box-title">Total Revenue</span>
                        </el-col>
                        <el-col :md="6">
                            <span class=""></span>
                        </el-col>
                    </el-row>
                </el-card>
            </el-row>
        </div>
    </div>
</template>

<script>
    import TotalBookingChart from '../../../utils/chart/LineChartDriver.js'

    export default {
        components: {
            TotalBookingChart
        },
        data() {
            return {
                totalBookings: [],
                totalRevenue: [],
                dataCollection3: [],
                dataCollection4: [],
                themeOption: {
                    maintainAspectRatio: false,
                    legend: {
                        display: false
                    },
                    scales: {
                        yAxes: [
                            {
                                display: true,
                                ticks: {
                                    display: true
                                }
                            }
                        ],
                        xAxes: [
                            {
                                display: true,
                                gridLines: {
                                    color: 'rgba(0, 0, 0, 0)'
                                },
                                ticks: {
                                    //                            display: false,
                                    //                            mirror: true
                                }
                            }
                        ]
                    }
                }
            }
        },
        mounted() {
            this.fillData()
        },
        methods: {
            fillData() {

                this.axios.get('/stats/summary', {
                    params: {
                        model: 'booking',
                        where: {accountId: this.$route.params.id},
                        start: this.$moment().startOf('year').toISOString(),
                        end: this.$moment().endOf('year').toISOString(),
                        number_of_days: 365,
                    }
                })
                    .then(res => {
                        //format the result
                        let months = []
                        let count = []
                        res.data.forEach((row) => {
                            months.push(this.$moment(row._id.month + '-' + row._id.year, "M-YYYY").format("MMM-YY"))
                            count.push(row.count)
                        })

                        this.totalBookings = {
                            labels: months,
                            datasets: [
                                {
                                    label: 'Bookings',
                                    data: count,
                                    borderWidth: 1,
                                    borderColor: 'rgba(75,193,252, 1)',
                                    backgroundColor: 'rgba(75,193,252, 0.5)'
                                }
                            ]
                        }
                    })
                    .catch(err => {

                    })
                    .finally()



                this.axios.get('/stats/summary', {
                    params: {
                        type: 'charges',
                        model: 'charge',
                        where: {accountId: this.$route.params.id},
                        start: this.$moment().startOf('year').toISOString(),
                        end: this.$moment().endOf('year').toISOString(),
                        number_of_days: 365,
                    }
                })
                    .then(res => {
                        //format the result
                        let months = []
                        let revenue = []
                        res.data.forEach((row) => {
                            months.push(this.$moment(row._id.month + '-' + row._id.year, "M-YYYY").format("MMM-YY"))
                            revenue.push(row.revenue)
                        })

                        this.totalRevenue = {
                            labels: months,
                            datasets: [
                                {
                                    label: 'Bookings',
                                    data: revenue,
                                    borderWidth: 1,
                                    borderColor: 'rgba(253,132,134,1)',
                                    backgroundColor: 'rgba(253,132,134,0.5)'
                                }
                            ]
                        }
                    })
                    .catch(err => {

                    })
                    .finally()

                this.dataCollection2 = {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June'],
                    datasets: [
                        {
                            label: 'Stars',
                            data: [],
                            borderWidth: 1,
                            borderColor: 'rgba(131,128,251,1)',
                            backgroundColor: 'rgba(131,128,251, 0.5)'
                        }
                    ]
                }


                this.dataCollection4 = {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June'],
                    datasets: [
                        {
                            label: '',
                            data: [],
                            borderWidth: 1,
                            borderColor: 'rgba(75,193,252, 1)',
                            backgroundColor: 'rgba(75,193,252, 0.5)'
                        }
                    ]
                }
            }
        }
    }
</script>

<style lang="scss">
    .people-stats-section {
        .address-box-title {
            font-weight: bold;
        }

        .address-box-sub-title {
            margin: 0;
            font-size: 12px;
        }

        .el-card {
            margin-bottom: 15px;
        }

        .people-stat-list {
            .el-row {
                padding: 8px 0;
            }
        }
    }
</style>
