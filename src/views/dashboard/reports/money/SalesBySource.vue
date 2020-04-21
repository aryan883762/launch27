<template>
    <div class="booking-types-chart">
        <el-row>
            <el-col :xs="24" :sm="24" :md="24">
                <total-sales-by-source :chart-data="bookingTypesData" :options="themeOption"></total-sales-by-source>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import TotalSalesBySource from '../../../../utils/chart/DoughnutChartDriver.js'

    export default {
        components: {
            TotalSalesBySource
        },
        data() {
            return {
                bookingTypesData: [],
                themeOption: {
                    maintainAspectRatio: false,
                    legend: {
                        display: true
                    },
                }
            }
        },
        mounted(){
            this.loadData();
        },
        methods: {
            loadData(){
                this.bookingTypesData = {
                    labels: ["Jan", "Feb", "Mar", "Apr", "May", "June"],
                    datasets: [
                        {
                            label: "Booking Types",
                            data: [1, 4, 6, 2, 1, 4],
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
            },
        },
    }
</script>