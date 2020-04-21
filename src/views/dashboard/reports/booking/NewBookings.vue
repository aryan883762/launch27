<template>
    <div class="booking-types-chart" v-loading="loading">
        <el-row>
            <el-col :xs="24" :sm="24" :md="24">
                <h3>New Bookings</h3>
                <p class="result-count">{{ dataSet.length > 0 ? dataSet.reduce((total,set)=>{return total+set.data},0) : 0 }}</p>
            </el-col>
        </el-row>
        <el-row>
            <el-col :xs="24" :sm="24" :md="24">
                <booking-types-chart :chart-data="graphData" :options="themeOption"></booking-types-chart>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import BookingTypesChart from '../../../../utils/chart/LineChartDriver.js'

    export default {
        props: {
            bookings: {
                type: Object,
                required: true
            },
            loading:{
                type: Boolean,
                required: true
            }
        },
        components: {
            BookingTypesChart
        },
        data() {
            return {
                graphData:[],
                dataSet: [],
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
                this.dataSet = [];
                if (this.bookings && this.bookings.results) {
                    this.bookings.results.forEach((booking) => {
                        if (booking._id) {
                            // check if date already has bookings
                            this.dataSet.push({
                                key: this.$moment(booking._id).startOf('day').utc().unix(),
                                label: this.$moment(booking._id).format('MMM-Do'),
                                data: booking.count
                            });
                        }
                    });
                    this.graphData = {
                        labels: this.dataSet.map((gd) => gd.label),
                        datasets: [
                            {
                                label: "New Bookings",
                                lineTension: 0.1,
                                data: this.dataSet.map((gd) => gd.data),
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