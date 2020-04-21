import {Doughnut, mixins} from 'vue-chartjs';

const {reactiveProp} = mixins;


export default {
    props: {
        companies: {
            type: Array,
            required: true
        }
    },
    extends: Doughnut,
    data() {
        return {
            graph_data: []
        };
    },
    watch: {
        companies(value) {
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

                    this.companies.forEach((company) => {
                        if (company.subscription && company.subscription.plan_id !== 'free') {
                            // check if plan_id exit
                            let key = company.subscription.recurring;
                            let index = this.graph_data.findIndex((gd) => gd.key === key);
                            if (index !== -1) {
                                this.graph_data[index].data += 1;
                            } else {
                                this.graph_data.push({
                                    key: key,
                                    label: company.subscription.recurring,
                                    data: 1
                                });
                            }
                        }
                    });


                    this.loadChart();

                } catch (err) {

                }
            })();
        },
        loadChart() {
            this.renderChart({
                labels: this.graph_data.map((gd) => gd.label),
                datasets: [
                    {
                        backgroundColor: [
                            "#4BC0C0",
                            "#FF6384",
                            "#C9CBCF",
                            "#FFCD56",
                            "#36A2EB",
                        ],
                        data: this.graph_data.map((gd) => gd.data)
                    }
                ]
            }, {
                responsive: true,
                maintainAspectRatio: false
            });
        }
    }
}
