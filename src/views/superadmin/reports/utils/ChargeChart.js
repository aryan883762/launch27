import { HorizontalBar, mixins } from 'vue-chartjs';

const { reactiveProp } = mixins;


export default {
    props: {
        charges: {
            type: Array,
            required: true
        }
    },
    extends: HorizontalBar,
    data() {
        return {
            graph_data: []
        };
    },
    watch: {
        charges(value) {
            this.statsChart();
        }
    },
    mounted() {
        this.statsChart();
    },
    methods: {
        statsChart() {
            (async () => {
                try {
                    this.graph_data = [];

                    this.charges.forEach((charge) => {
                        let currency = charge.currency + "(" + charge.currency_symbol + ")";
                        let key = charge.currency || 'none';
                        let index = this.graph_data.findIndex((gd) => gd.key === key);
                        if (index !== -1) {
                            this.graph_data[index].data += charge.total_after_tax;
                        } else {
                            this.graph_data.push({
                                key: key,
                                label: currency,
                                data: charge.total_after_tax
                            });
                        }
                    }); this.loadChart();

                } catch (err) {
                }
            })();
        },
        loadChart() {
            this.renderChart(
                {
                    tooltips: {
                        callbacks: {
                            label: function (tooltipItem) {
                                return tooltipItem.yLabel;
                            }
                        }
                    },
                    labels: this.graph_data.map((gd) => gd.label),
                    datasets: [
                        {
                            label: "Total",
                            backgroundColor: "#36A2EB",
                            data: this.graph_data.map((gd) => gd.data.toFixed(2))
                        }
                    ]
                },
                {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        yAxes: [{
                            ticks: {
                                suggestedMin: 0
                            }
                        }]
                    }
                }
            );
        }
    }
}
