<template>
    <div class="charge-types-chart" v-loading="loading">
        <el-row>
            <el-col :xs="24" :sm="24" :md="24">
                <h3>Total Sales</h3>
                <p class="result-count">{{ $currency }}{{ dataSet.length > 0 ? dataSet.reduce((total,set)=>{return total+set.data},0).toFixed(2) : 0 }}</p>
            </el-col>
        </el-row>
        <el-row>
            <el-col :xs="24" :sm="24" :md="24">
                <total-sales :chart-data="graphData" :options="themeOption"></total-sales>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import TotalSales from '../../../../utils/chart/LineChartDriver.js'
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
            TotalSales
        },
        watch: {
            bookings(value) {
                this.setDataSet();
            }
        },
        computed: {
            charges_total() {
                let total = 0;
                for(let i=0;i<this.bookings.length;i++){
                    total += this.bookings[i].charge.total_after_tax
                }
                return total;
            }
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
        methods: {
            setDataSet() {
                this.dataSet = [];
                if (this.bookings &&  this.bookings.results) {
                    this.bookings.results.forEach((booking) => {
                        if (booking._id) {
                            // check if date already has bookings
                            this.dataSet.push({
                                key: this.$moment(booking._id).startOf('day').utc().unix(),
                                label: this.$moment(booking._id).format('MMM-Do'),
                                data: booking.cash_amount+booking.card_amount+booking.check_amount
                            });
                        }
                    });
                    this.graphData = {
                        labels: this.dataSet.map((gd) => gd.label),
                        datasets: [
                            {
                                label: "Total Sales (" + this.$currency +")",
                                lineTension: 0.1,
                                data: this.dataSet.map((gd) => gd.data.toFixed(2)),
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