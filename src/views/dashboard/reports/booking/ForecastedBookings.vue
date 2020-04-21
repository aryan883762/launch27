<template>
    <div class="booking-types-chart" v-loading="loading">
        <el-row>
            <el-col :xs="24" :sm="24" :md="24">
                <h3>Forecasted Bookings</h3>
                <p class="result-count">{{ bookings.reduce((total,index)=>{return total+index.count},0) }}</p>
            </el-col>
        </el-row>
        <el-row>
            <el-col :xs="24" :sm="24" :md="24">
                <forecasted-booking :chart-data="graphData" :options="themeOption"></forecasted-booking>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import ForecastedBooking from '../../../../utils/chart/LineChartDriver.js'

    export default {
        props: {
            bookings: {
                type: Array,
                required: true
            },
            loading:{
                type: Boolean,
                required: true
            }
        },
        components: {
            ForecastedBooking
        },
        data() {
            return {
                graphData:[],
                forecasted: true,
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
                                    color: "rgba(0, 0, 0, 0)"
                                },
                                ticks: {
                                    display: true
                                }
                            }
                        ]
                    }
                }
            }
        },
        watch: {
            bookings(value) {
                this.setDataSet();
            }
        },
        methods: {
            setDataSet() {
            let dataSet = [];
                if (this.bookings) {
                    this.bookings.forEach((booking) => {
                        dataSet.push({
                            key: booking.key,
                            label: this.$moment(booking.service_date).format('MMM-Do'),
                            data: booking.count
                        })
                    });

                    this.graphData = {
                        labels: dataSet.map((gd) => gd.label),
                        datasets: [
                            {
                                label: "Forcasted Bookings",
                                lineTension: 0.1,
                                data: dataSet.map((gd) => gd.data),
                                borderWidth: 3,
                                borderColor: "rgba(131,128,251,1)",
                                backgroundColor: "rgba(131,128,251, 0.5)"
                            }
                        ]
                    };
                }
            }
        },
    }
</script>