<template>
    <div class="booking-types-chart">
        <el-row>
            <el-col :xs="24" :sm="24" :md="24">
                <p class="result-count">6</p>
            </el-col>
        </el-row>
        <el-row>
            <el-col :xs="24" :sm="24" :md="24">
                <forcasting :chart-data="graphData" :options="themeOption"></forcasting>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import Forcasting from '../../../../utils/chart/LineChartDriver.js'

    export default {
        components: {
            Forcasting
        },
        data() {
            return {
                graphData: [],
                themeOption: {
                    maintainAspectRatio: false,
                    legend: {
                        display: true
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
        mounted(){
            this.loadData();
        },
        methods: {
            loadData(){
                this.graphData = {
                    labels: ["Jan", "Feb", "Mar", "Apr", "May", "June"],
                    datasets: [
                        {
                            label: "New Bookings",
                            lineTension: 0.5,
                            data: [1,2,3,4,5,6],
                            borderWidth: 3,
                            borderColor: "rgba(131,128,251,1)",
                            backgroundColor: "rgba(131,128,251, 0.5)"
                        }
                    ]
                };
            },
        },
    }
</script>