<template>
    <div class="booking-types-chart">
        <el-row>
            <el-col :xs="24" :sm="24" :md="24">
                <promotion-discounts-used :chart-data="bookingTypesData" :options="themeOption"></promotion-discounts-used>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import PromotionDiscountsUsed from '../../../../utils/chart/BarChartDriver.js'

    export default {
        components: {
            PromotionDiscountsUsed
        },
        data() {
            return {
                bookingTypesData: [],
                themeOption: {
                    maintainAspectRatio: false,
                    legend: {
                        display: true
                    },
                    responsive: true,
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
                this.bookingTypesData = {
                    labels: ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug"],
                    datasets: [
                        {
                            label: 'Dataset 1',
                            backgroundColor: "rgba(255,0,0,1)",
                            type: "bar",
                            data: [
                                this.randomScalingFactor(),
                                this.randomScalingFactor(),
                                this.randomScalingFactor(),
                                this.randomScalingFactor(),
                                this.randomScalingFactor(),
                                this.randomScalingFactor(),
                                this.randomScalingFactor()
                            ]
                        }, {
                            label: 'Dataset 2',
                            backgroundColor: "rgba(0,255,0,1)",
                            type: "bar",
                            data: [
                                this.randomScalingFactor(),
                                this.randomScalingFactor(),
                                this.randomScalingFactor(),
                                this.randomScalingFactor(),
                                this.randomScalingFactor(),
                                this.randomScalingFactor(),
                                this.randomScalingFactor()
                            ]
                        }, {
                            label: 'Dataset 3',
                            backgroundColor: "rgba(0,0,255,1)",
                            type: "bar",
                            data: [
                                this.randomScalingFactor(),
                                this.randomScalingFactor(),
                                this.randomScalingFactor(),
                                this.randomScalingFactor(),
                                this.randomScalingFactor(),
                                this.randomScalingFactor(),
                                this.randomScalingFactor()
                            ]
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
                return Math.round(this.rand(0, 100));
            }
        },
    }
</script>