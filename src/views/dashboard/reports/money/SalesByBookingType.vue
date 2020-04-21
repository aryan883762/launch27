<template>
    <div class="charge-types-chart">
        <el-row>
            <el-col :xs="24" :sm="24" :md="24">
                <h3>Sales by Payment Types</h3>
                <p class="result-count">{{ $currency }}{{ dataSet.length > 0 ? dataSet.reduce((total,set)=>{return total+set.data},0).toFixed(2) : 0 }}</p>
            </el-col>
        </el-row>
        <el-row>
            <el-col :xs="24" :sm="24" :md="24">
                <total-sales-by-charge-type :chart-data="graphData" :options="themeOption"></total-sales-by-charge-type>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import TotalSalesByChargeType from '../../../../utils/chart/DoughnutChartDriver.js'

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
        computed: {
            charges_total() {
                let total = 0;
                for(let i=0;i<this.bookings.length;i++){
                    total += this.bookings[i].charge.total_after_tax
                }
                return total;
            }
        },
        components: {
            TotalSalesByChargeType
        },
        watch: {
            bookings(value) {
                this.setDataSet();
            }
        },
        data() {
            return {
                graphData: [],
                dataSet: [],
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
                this.dataSet = [];
                if(this.bookings && this.bookings.results){
                    this.bookings.results.forEach((booking) => {
                        if (booking._id) {
                            // check if date already has bookings
                            if(booking.cash_amount && booking.cash_amount > 0){
                                this.addToDataSet("cash",booking.cash_amount);
                            }
                            if(booking.card_amount && booking.card_amount > 0){
                                this.addToDataSet("card",booking.card_amount);
                            }
                            if(booking.check_amount && booking.check_amount > 0){
                                this.addToDataSet("check",booking.check_amount);
                            }
                        }
                    });
                    this.dataSet.forEach((gd) => gd.label = gd.label[0].toUpperCase() + gd.label.substring(1));
                        
                    this.graphData = {
                        labels: this.dataSet.map((gd) => gd.label),
                        datasets: [
                            {
                                label: "Sales Booking Types",
                                data: this.dataSet.map((gd) => gd.data.toFixed(2)),
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