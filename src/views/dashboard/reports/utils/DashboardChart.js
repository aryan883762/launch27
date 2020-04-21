import {Line, mixins} from 'vue-chartjs'

const {reactiveProp} = mixins


export default {
    props: {
        range: {
            type: Object,
            required: true
        },
        bookingsFilter: {
            type: String,
            required: true
        },
        mode: {
            type: String
        }
    },
    extends: Line,
    data() {
        return {
            gradient: null,
            labels: [],
            data: []
        }
    },
    watch: {
        range: {
            deep: true,
            handler(val) {
                if (val.start && val.end) {
                    this.statsChart();
                }
            }
        },
        bookingsFilter(val) {
            this.statsChart();
        }
    },
    mounted() {

        this.gradient = this.$refs.canvas.getContext('2d').createLinearGradient(0, 0, 0, 450)


        this.gradient.addColorStop(0, 'rgba(31,182,255, 0.5)')
        this.gradient.addColorStop(0.5, 'rgba(31,182,255, 0.25)');
        this.gradient.addColorStop(1, 'rgba(31,182,255, 0)');
    },
    methods: {
        statsChart() {
            (async () => {
                try {
                    if (!this.range.start && !this.range.end) {
                        return;
                    }
                    let start = this.$moment(this.range.start).startOf("day").utc().toISOString()
                    let end = this.$moment(this.range.end).endOf("day").utc().toISOString();
                    let results = await this.getBookingSummary(start, end);
                    this.labels = []
                    this.data = []

                    let dateGrouped = []
                    results.forEach((item) => {
                        if (item && item.date) {
                            // grouping them by date
                            let key, label
                            if (this.mode !== 'today') {
                                key = this.$moment(item.date).format('MMM-Do');
                                label = this.$moment(item.date).format('MMM-Do');
                            } else {
                                key = this.$moment(item.date).format(this.$time_format);
                                label = this.$moment(item.date).format(this.$time_format);
                            }

                            let index = dateGrouped.findIndex((dg) => dg.key === key);
                            if (index !== -1) {
                                dateGrouped[index].data += item.count;
                            } else {
                                dateGrouped.push({
                                    key: key,
                                    label: label,
                                    data: item.count
                                });
                            }
                        }
                    })

                    dateGrouped.forEach((item) => {
                        this.labels.push(item.label)
                        this.data.push(item.data)
                    })


                    this.loadChart()

                } catch (err) {
                    console.log(err);
                }
            })()
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
                labels: this.labels,
                datasets: [
                    {
                        label: "Bookings",
                        borderColor: '#1fb6ff',
                        pointBackgroundColor: 'white',
                        borderWidth: 2,
                        pointBorderColor: 'white',
                        backgroundColor: this.gradient,
                        data: this.data
                    }
                ]
            }, {
                legend: {
                    display: false
                },
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    yAxes: [{
                        ticks: {
                            precision: 0,
                            suggestedMin: 0
                        }
                    }]
                }
            })
        },
        getBookingSummary(start, end) {
            return new Promise((resolve, reject) => {
                this.axios.get('/bookings/summary', {
                    params: {
                        number_of_days: 7,
                        start: start,
                        end: end,
                        include_forecasted: (this.bookingsFilter === 'forecasted'),
                        status: (this.bookingsFilter === 'forecasted') ? 'active' : this.bookingsFilter
                    }
                })
                    .then(res => {
                        resolve(res.data)
                    })
                    .catch(err => {
                        reject(err)
                    })
                    .then()
            })

        }
    }
}
