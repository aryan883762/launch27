<template>
    <div class="charge-types-chart">
        <el-row>
            <el-col :xs="24" :sm="24" :md="24">
                <h3>Top {{ length }} Extras Sold</h3>
                <p class="result-count">{{ $currency }}{{ extras_total.toFixed(2) }}</p>
            </el-col>
        </el-row>
        <el-row>
            <el-col :xs="24" :sm="24" :md="24">
                <total-sales-by-extras :chart-data="graphData" :options="themeOption"></total-sales-by-extras>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import TotalSalesByExtras from '../../../../utils/chart/DoughnutChartDriver.js'

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
        computed: {
            extras_total() {
                let total = 0;
                for(let i=0;i<this.bookings.length;i++){
                    total += this.bookings[i].charge.total_after_tax
                }
                return total;
            }
        },
        components: {
            TotalSalesByExtras
        },
        watch: {
            bookings(value) {
                this.setDataSet();
            }
        },
        data() {
            return {
                graphData: [],
                length: 0,
                include: ['booking'],
                themeOption: {
                    maintainAspectRatio: false,
                    legend: {
                        display: true
                    },
                }
            }
        },
        methods: {
            setDataSet() {
                return;
                let dataSet = [];
                if(this.bookings){
                    for(let i=0;i<this.bookings.length;i++){
                        
                        let booking = this.bookings[i];
                        let charge = booking.charge;
                        if(charge && charge.total_after_tax){
                            let key = "None";
                            let label = "None";
                            if (booking.payment_type) {
                                key = booking.payment_type;
                                label = booking.payment_type;
                                label = label[0].toUpperCase() + label.substring(1)  + "(" + this.$currency +")";
                            }
                            let index = dataSet.findIndex((gd) => gd.key === key);
                            if (index !== -1) {
                                dataSet[index].data += charge.total_after_tax;
                            } else {
                                dataSet.push({
                                    key: key,
                                    label: label,
                                    data: charge.total_after_tax
                                });
                            }
                        }
                    }
                    this.graphData = {
                        labels: dataSet.map((gd) => gd.label),
                        datasets: [
                            {
                                label: "Sales Booking Extras",
                                data: dataSet.map((gd) => gd.data.toFixed(2)),
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