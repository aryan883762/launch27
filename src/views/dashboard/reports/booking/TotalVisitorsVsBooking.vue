<template>
    <div class="booking-types-chart">
        <el-row>
            <el-col :xs="24" :sm="24" :md="24">
                <total-visitors-vs-booking :chart-data="graphData" :options="themeOption"></total-visitors-vs-booking>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import TotalVisitorsVsBooking from '../../../../utils/chart/BarChartDriver.js'

    export default {
        components: {
            TotalVisitorsVsBooking
        },
        data() {
            return {
                graphData: [],
                themeOption: {
                    maintainAspectRatio: false,
                    legend: {
                        display: true
                    },
                    responsive: true,
                    scales: {
                        xAxes: [{
                            stacked: true,
                        }],
                        yAxes: [{
                            stacked: true
                        }]
                    },
                    tooltips: {
                        mode: 'index',
                        intersect: false
                    },
                },
                seed: new Date()
            }
        },
        mounted(){
            this.loadData();
            this.srand(Date.now())
        },
        methods: {
            loadData(){
                this.graphData = {
                    labels: ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug"],
                    datasets: [
                        {
                            label: "Europe",
                            type: "line",
                            borderColor: "#8e5ea2",
                            data: [- 40,-10,50,30,70,100],
                            fill: false
                        }, {
                            label: "Africa",
                            type: "line",
                            borderColor: "#3e95cd",
                            data: [-100, -50, 0, 25, 50, 100],
                            fill: false
                        }]
                };
            },
            srand(seedVal){
                this.seed = seedVal;
            },

            rand(min, max){
                min = min === undefined ? 0 : min;
                max = max === undefined ? 1 : max;
                this.seed = (this.seed * 9301 + 49297) % 233280;
                return min + (this.seed / 233280) * (max - min);
            },
            randomScalingFactor(){
                return Math.round(this.rand(-100, 100));
            }
        },
    }
</script>