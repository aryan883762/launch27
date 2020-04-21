export default {
    props: {
        dateRange: {
            type: Array,
            required: true
        }
    },
    data() {
        return {
            loading: false,
            charges: [],
            graphData: [],
            include: [],
            fields: ['id', 'created_at', 'bookingId', 'total_after_tax', 'total_payments', 'date']
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
        status(value){
            this.loadData();
        }
    },
    computed: {
        charges_total() {
            return this.charges.reduce((total, charge) => {
                return total + charge.total_after_tax
            }, 0);
        }
    },
    methods: {
        loadData() {
            this.loading = true;

            let whereQuery = {};
            if (this.dateRange && this.dateRange[0] && this.dateRange[1]) {
                whereQuery.date = { between: this.dateRange };
            }

            this.axios.get('/charges', {
                params: {
                    filter: {
                        where: whereQuery,
                        fields: this.fields,
                        include: this.include
                    }
                }
            })
                .then(res => {
                    this.charges = res.data;
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