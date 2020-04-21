import {Line, mixins} from 'vue-chartjs';

const {reactiveProp} = mixins;


export default {
    props: {
        bookings: {
            type: Array,
            required: true
        }
    },
    extends: Line,
    data() {
        return {
            gradient: null,
            graph_data: []
        };
    },
    watch: {
        bookings(value) {
            this.statsChart();
        }
    },
    mounted() {

        this.gradient = this.$refs.canvas.getContext('2d').createLinearGradient(0, 0, 0, 450);


        this.gradient.addColorStop(0, 'rgba(31,182,255, 0.5)');
        this.gradient.addColorStop(0.5, 'rgba(31,182,255, 0.25)');
        this.gradient.addColorStop(1, 'rgba(31,182,255, 0)');

        this.statsChart();
    },
    methods: {
        statsChart() {
            (async () => {
                try {
                    this.graph_data = [];

                    this.bookings.forEach((booking) => {
                        if (booking.service_date) {
                            // check if date already has bookings
                            let key = this.$moment(booking.service_date).startOf('day').utc().unix();
                            let index = this.graph_data.findIndex((gd) => gd.key === key);
                            if (index !== -1) {
                                this.graph_data[index].data += 1;
                            } else {
                                this.graph_data.push({
                                    key: key,
                                    label: this.$moment(booking.service_date).format('MMM-Do'),
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
                        label: "Bookings",
                        borderColor: '#1fb6ff',
                        pointBackgroundColor: 'white',
                        borderWidth: 2,
                        pointBorderColor: 'white',
                        backgroundColor: this.gradient,
                        data: this.graph_data.map((gd) => gd.data)
                    }
                ]
            }, {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    yAxes: [{
                            ticks: {
                                suggestedMin: 0
                            }
                        }]
                }
            });
        }
    }
}
