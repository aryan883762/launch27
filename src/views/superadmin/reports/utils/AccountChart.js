import {Pie, mixins} from 'vue-chartjs';
import {adminRoles, teamRoles, customerRoles} from '@/utils/auth/ability.js';

const {reactiveProp} = mixins;


export default {
    props: {
        accounts: {
            type: Array,
            required: true
        }
    },
    extends: Pie,
    data() {
        return {
            graph_data: []
        };
    },
    watch: {
        accounts(value) {
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

                    this.accounts.forEach((account) => {
                        // check if plan_id exit
                        let key = account.role;
                        let index = this.graph_data.findIndex((gd) => gd.key === key);
                        if (index !== -1) {
                            this.graph_data[index].data += 1;
                        } else {
                            this.graph_data.push({
                                key: key,
                                label: account.roleName,
                                data: 1
                            });
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
                            "#36A2EB",
                            "#FF6384",
                            "#4BC0C0",
                            "#FFCD56",
                            "#C9CBCF",
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
