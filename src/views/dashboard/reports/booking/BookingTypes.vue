<template>
    <div class="booking-types-chart" v-loading="loading">
        <el-row>
            <el-col :xs="24" :sm="24" :md="24">
                <h3>Payment Types</h3>
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
    import BookingTypesChart from '../../../../utils/chart/DoughnutChartDriver.js'

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
                if (this.bookings && this.bookings.results) {
                    this.bookings.results.forEach((booking) => {
                        if (booking._id) {
                            // check if date already has bookings
                            let key = "None";
                            let label = "None";
                            if(booking.cash_count && booking.cash_count > 0){
                                this.addToDataSet("cash",booking.cash_count);
                            }
                            if(booking.card_count && booking.card_count > 0){
                                this.addToDataSet("card",booking.card_count);
                            }
                            if(booking.check_count && booking.check_count > 0){
                                this.addToDataSet("check",booking.check_count);
                            }
                        }
                    });
                    this.dataSet.forEach((gd) => gd.label = gd.label[0].toUpperCase() + gd.label.substring(1));
                    
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
            },
            addToDataSet(type, count){
                let index = this.dataSet.findIndex((gd) => gd.key === type);
                if(index !== -1) {
                    this.dataSet[index].data += count;
                }else{
                    this.dataSet.push({
                        key: type,
                        label: type,
                        data: count
                    });
                }
            }
        },
    }
</script>