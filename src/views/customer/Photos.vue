<template>
    <div class="app-section photos">
        <el-card style="border:none; margin-bottom: 5px;">
            <el-row>
                <el-col class="">
                    <div class="pull-left main-filters">
                        <el-date-picker :format="dt_format" @change="dateChanged" end-placeholder="End date" range-separator="to" size="small" start-placeholder="Start date" type="daterange" v-model="range"/>
                    </div>

                    <div class="pull-right main-filters">

                        <el-select class="filter small pull-right" placeholder="Team" v-model="filter_team" @change="loadSchedule()" v-if="$can('manage', 'role_admin') || $can('manage', 'role_team')">
                            <el-option label="All" value="all">
                                All
                            </el-option>
                            <el-option :key="team.id" :label="team.name" :value="team.id" v-for="team in teams">
                                {{ team.name }}
                            </el-option>
                        </el-select>

                        <el-select class="filter small" style="width: 300px;" v-if="selectedLocation" v-model="selectedLocation" value-key="id" @change="loadSchedule()">
                            <el-option label="All" value="all"/>
                            <el-option :key="location.name" :label="location.name" :value="location" v-for="location in $auth.user().company.locations"/>
                        </el-select>
                    </div>
                </el-col>
            </el-row>
        </el-card>
    </div>

</template>

<script>

    export default {
        data() {
            return {
                schedule: [],
                temp_rating: 3,
                group_select: [],
                selected_booking: false,
                show_drawer: false,
                b_loading: true,
                range: [],
                total_records: 0,
                page_size: 0,
                current_page: 1,
                teams: [],
                filter_team: 'all',
                selectedLocation: 'all',
                checkAll: false,
                checkedCharges: [],
                isIndeterminate: false,
                filter_charge_status: '',
                dt_format: ''
            }
        },

        created() {
            this.$root.$on('calendar:range:update', this.dateChanged)
            if (this.$route.query.from && this.$route.query.to) {
                this.dateChanged([this.$route.query.from, this.$route.query.to])
            } else {
                this.range = [this.$moment().startOf('month').toISOString(),
                    this.$moment().endOf('month').toISOString()]
            }
            this.selectedLocation = 'all';
//            this.selectedLocation = this.$auth.user().company.locations[0]

            this.dt_format = this.$helpers.toElFormat(this.$date_format)

        },
        watch: {
            '$route'(val) {
                this.dateChanged([this.$route.query.from, this.$route.query.to])
            }
        },
        beforeDestroy() {
            this.$root.$off('calendar:range:update', this.dateChanged)
        },
        mounted() {
            this.getTeams()
            this.loadSchedule(this.current_page)
        },

        methods: {
            dateChanged(range) {
                console.log("Date changed called");
                this.range = range;
                this.loadSchedule(this.current_page)
            },
            getEarned() {

            },
            loadSchedule(current_page) {
                if (!current_page) current_page = this.current_page

                let start_date = this.$moment(this.range[0]).utc().toISOString()
                let end_date = this.$moment((this.range[1] || this.range[0])).utc().toISOString()

                let forecasted = true
                if(!this.$can('manage', 'role_admin')){
                    forecasted = false
                }

                this.b_loading = true
                let params= {
                    from: start_date,
                    to: end_date,
                    type: 'charges',
                    forecasted: forecasted,
                    page: current_page
                }
                if (this.selectedLocation !== '' && this.selectedLocation !== 'all'){
                    params.where = {locationId: this.selectedLocation.id};
                }
                if (this.filter_team !== '' && this.filter_team !== 'all') {
                    params.targetType = 'team';
                    params.targetTypeId = this.filter_team;
                }
                this.axios
                    .get('/bookings/schedule', {
                        params: params
                    })
                    .then(res => {
                        this.schedule = res.data.data
                        this.total_records = res.data.meta.totalItemCount
                        this.page_size = res.data.meta.itemsPerPage
                    })
                    .catch()
                    .finally(_ => {
                        this.b_loading = false
                    })
            },
            assignTeam(booking) {
                // this.$root.$emit("booking:drawer:details", booking.id);
                let routeName = 'dashboard_booking_view'
                if (this.$can('manage', 'role_team')) {
                    routeName = 'team_bookings_view'
                }
                this.$router.push({
                    name: routeName,
                    params: {
                        id: booking.id,
                        service_date: booking.service_date
                    },
                    query: {action: 'assign_team'}
                })
            },
            getDetails(booking) {
                this.$root.$emit('booking:drawer:details', booking.id)
            },

            showDetail(booking) {
                let routeName = 'dashboard_booking_view'
                if (this.$can('manage', 'role_team')) {
                    routeName = 'team_bookings_view'
                } else if (this.$can('manage', 'role_customer')) {
                    routeName = 'customer_bookings_view'
                }
                this.$router.push({
                    name: routeName,
                    params: {
                        id: booking.id,
                        service_date: booking.service_date
                    }
                })
            },
            getTeams() {
                let whereQuery = {}
                if (this.$can('manage', 'role_team')) {
                    whereQuery.or = [{leadIds: this.$auth.user().id}, {memberIds: this.$auth.user().id}]
                } else if (this.$can('manage', 'role_customer')) {
                    return;
                }

                this.axios.get('/companies/current/teams', {
                    params: {
                        filter: {
                            where: whereQuery
                        }
                    }
                })
                    .then(res => {
                        this.teams = res.data
                    })
            },
        }
    }
</script>