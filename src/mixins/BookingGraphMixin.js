export default {
    props: {
        dateRange: {
            type: Array,
            required: true
        },
        locationId: {
            type: String
        },
        status:{
            type: Array,
            required: true
        }
    },
    data() {
        return {
            loading: false,
            bookings: [],
            graphData: [],
            forecasted: false,
            include: []
        }
    },
    mounted() {
        if (this.dateRange[0] && this.dateRange[1]) {
            this.loadData();
        }
    },
    watch: {
        dateRange(value) {
            if (value[0] && value[1]) {
                this.loadData();
            }
        },
        locationId(value) {
            this.loadData();
        },
        status(value){
            this.loadData();
        }
    },
    methods: {
        loadData() {
            this.loading = true;
            this.include.push('charge');
            this.include.push({relation: "invitations",scope: {include: "team"}});

            let whereQuery = {};
            if(this.status.length > 0){
                whereQuery.status = { inq: this.status };
            }

            if (this.locationId && this.locationId !== 'all') {
                whereQuery.locationId = this.locationId;
            }

            this.axios.get('/bookings/schedule', {
                params: {
                    from: this.$moment(this.dateRange[0]).startOf('day').toISOString(),
                    to: this.$moment(this.dateRange[1]).endOf('day').toISOString(),
                    type: 'bookings',
                    forecasted: this.forecasted,
                    where: whereQuery,
                    include: this.include
                }
            })
                .then(res => {
                    this.bookings = res.data;
                    console.log(this.bookings);
                    this.setDataSet();
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        setDataSet() {
        }
    }
  };