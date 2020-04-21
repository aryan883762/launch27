import { HorizontalBar, mixins } from 'vue-chartjs';

const { reactiveProp } = mixins;


export default {
    props: {
        payments: {
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
        payments(value) {
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
                    this.graph_datasets = [];

                    this.payments.forEach((payment) => {
                        let currency = payment.currency + "(" + payment.currency_symbol + ")";
                        let key = payment.currency || 'none';
                        let index = this.graph_datasets.findIndex((gd) => gd.key === key);
                        if (index !== -1) {
                            this.graph_datasets[index].data += payment.amount;
                        } else {
                            this.graph_datasets.push({
                                key: key,
                                label: currency,
                                data: payment.amount
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
                    labels: this.graph_datasets.map((gd) => gd.label),
                    datasets: [
                        {
                            label: "Total",
                            backgroundColor: "#FF6384",
                            data: this.graph_datasets.map((gd) => gd.data.toFixed(2))
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
