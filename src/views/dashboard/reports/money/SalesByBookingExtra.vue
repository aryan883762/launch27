<template>
    <div class="charge-types-chart">
        <el-row>
            <el-col :xs="24" :sm="24" :md="24">
                <h3>Top {{ length }} Extras Sold</h3>
                <p class="result-count">{{ extras_total}}</p>
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
                type: Object,
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
                for(let i=0;i<this.extrasData.length;i++){
                    total += this.extrasData[i].quantity
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
                extrasData:[],
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
                if(this.bookings && this.bookings.results){
                    for(let i=0;i<this.bookings.results.length;i++){
                        if(!this.bookings.results[i].extras)break;

                        this.bookings.results[i].extras.forEach(element => {
                            element.forEach(extra =>{
                                if(extra.name){
                                    let index = this.extrasData.findIndex((ed) => ed.name === extra.name);
                                    if(index !== -1) {
                                        this.extrasData[index].quantity += extra.quantity;
                                    }else{
                                        this.extrasData.push(extra);
                                    }
                                }
                            })
                        });
                    }
                    this.extrasData.sort((a,b)=>b.quantity-a.quantity)
                    if(this.extrasData.length>5){
                        this.length = 5;
                        //TODO: remove the remaining extras
                    }else{
                        this.length = this.extrasData.length;
                    }
                    this.graphData = {
                        labels: this.extrasData.map((gd) => gd.name),
                        datasets: [
                            {
                                label: "Sales Booking Extras",
                                data: this.extrasData.map((gd) => gd.quantity),
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