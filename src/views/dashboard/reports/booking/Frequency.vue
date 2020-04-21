<template>
    <div class="booking-types-chart">
        <el-row>
            <el-col :xs="24" :sm="24" :md="24">
                <h3>Frequency</h3>
                <p class="result-count">{{ dataSet.length > 0 ? dataSet.reduce((total,set)=>{return total+set.data},0) : 0 }}</p>
            </el-col>
        </el-row>
        <el-row>
            <el-col :xs="24" :sm="24" :md="24">
                <frequency :chart-data="graphData" :options="themeOption"></frequency>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import Frequency from '../../../../utils/chart/DoughnutChartDriver.js'

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
            Frequency
        },
        data() {
            return {
                graphData:[],
                dataSet: [],
                include: ["frequency"],
                themeOption: {
                    maintainAspectRatio: false,
                    legend: {
                        display: true
                    },
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
                if (this.bookings && this.bookings.frequency_results) {
                    this.bookings.frequency_results.forEach((booking) => {
                        if (booking._id) {
                            // check if date already has bookings
                            this.dataSet.push({
                                key: booking._id,
                                label: booking._id,
                                data: booking.count
                            });
                            	
                        }
                    });

                    
                    this.graphData = {
                        labels: this.dataSet.map((gd) => gd.label),
                        datasets: [
                            {
                                label: "Booking Types",
                                data: this.dataSet.map((gd) => gd.data),
                                backgroundColor: [
                                    'rgba(255, 99, 132, 0.9)',
                                    'rgba(54, 162, 235, 0.9)',
                                    'rgba(255, 206, 86, 0.9)',
                                    'rgba(75, 192, 192, 0.9)',
                                    'rgba(153, 102, 255, 0.9)',
                                    'rgba(255, 159, 64, 0.9)'
                                ],
                            }
                        ]
                    };
                }
            }
        },
    }
</script>