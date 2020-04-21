<template>
    <div>

        <el-row>
            <el-col>

                <div class="pull-left main-filters">
                    <el-date-picker
                            :clearable="false"
                            :format="dt_format"
                            @change="getAppointments"
                            end-placeholder="End date"
                            range-separator="to"
                            size="small" start-placeholder="Start date" type="daterange" v-model="range"
                    />

                </div>

                <div class="main-filters pull-right">
                    <el-select @change="getAppointments()" class="small filter pull-right"
                               style="width : 100%; margin-left: 5px;" v-model="bookings_filter">
                        <el-option label="Active Bookings" value="active"></el-option>
                        <el-option label="Recurring" value="recurring"></el-option>
                        <el-option label="Completed Bookings" value="completed"></el-option>
                        <el-option label="Cancelled Bookings" value="cancelled"></el-option>
                    </el-select>
                </div>
            </el-col>
        </el-row>

        <el-divider/>

        <el-row>
            <el-col>
                <el-table :data="appointments" stripe style="width: 100%" v-loading="loading_apt">

                    <el-table-column label="Service Date">
                        <template slot-scope="scope">
                            <label>{{ $moment(scope.row.service_date).format($date_format) }}</label>
                            <div>{{ $moment(scope.row.service_date).format($time_format) }}</div>
                        </template>
                    </el-table-column>
                    <el-table-column label="Address">
                        <template slot-scope="scope">
                            <small>{{ scope.row.address.full_address }}</small>
                            <small>{{ scope.row.address.phone }}</small>
                        </template>
                    </el-table-column>
                    <!--  <el-table-column label="Team" v-if="person && person.account.role === 'r_customer'">
                          <template slot-scope="scope">
                              <el-avatar/>
                          </template>
                      </el-table-column>-->
                    <el-table-column label="Customer" v-if="person && person.account.role === 'r_team'">
                        <template slot-scope="scope">
                            <el-avatar/>
                        </template>
                    </el-table-column>

                    <el-table-column label="Amount">
                        <template slot-scope="scope">
                            <strong v-if="scope.row.charge">{{ $currency }}{{ scope.row.charge.total_after_tax }}</strong>
                        </template>
                    </el-table-column>

                    <el-table-column label="Frequency" prop="frequency.name">
                        <template slot-scope="scope">
                            <small>{{ scope.row.frequency.name }}</small>
                        </template>
                    </el-table-column>
                    <el-table-column label="Assigned To">
                        <template slot-scope="scope">
                            <el-popover
                                    ref="popover1"
                                    placement="top-start"
                                    title="Assigned Teams"
                                    width="200"
                                    trigger="hover">

                                <ul style="margin: 10px;">
                                    <li v-for="(assignment, index) in scope.row.team_assignments"
                                        class="team-assignment-div">
                                        <label v-if="assignment.team_model === 'account'"> {{assignment.team.fullname}}</label>
                                        <label v-if="assignment.team_model === 'team'"> {{assignment.team.name}} (G)</label>
                                    </li>
                                </ul>


                                <div slot="reference" class="team-assignments-avatar"
                                     style="display:flex; float:left; width: 32px;"
                                     v-if="scope.row.team_assignments && scope.row.team_assignments.length > 0">
                                    <div style="display:flex;width: 20px;"
                                         v-for="(assignment, index) in scope.row.team_assignments"
                                         class="team-assignment-div" v-if="index < 4">
                                        <account-avatar :size="18" :account="member"
                                                        v-for="(member, index) in assignment.team.members"
                                                        v-if="assignment.team_model === 'team'"></account-avatar>
                                    </div>

                                    <account-avatar :size="18" :account="assignment.team"
                                                    v-for="(assignment, index) in scope.row.team_assignments"
                                                    v-if="assignment.team_model === 'account' && index < 4"></account-avatar>
                                </div>
                            </el-popover>


                        </template>
                    </el-table-column>
                    <el-table-column label="Status" prop="status">
                        <template slot-scope="scope">
                            <label>{{scope.row.status.toUpperCase()}}</label>
                        </template>
                    </el-table-column>

                    <el-table-column label="View">
                        <template slot-scope="scope">
                            <el-link @click="viewBooking(scope.row)" type="danger" size="mini">View</el-link>
                        </template>
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import AccountAvatar from "../../../components/AccountAvatar";

    export default {
        components: {AccountAvatar},
        data: () => {
            return {
                person: false,
                filter: '',
                average_rating: 0,
                appointments: [],
                loading_apt: false,
                range: [],
                dt_format: '',
                bookings_filter: '',
                total_records: 0,
                page_size: 0,
                current_page: 1,
            }
        },
        watch: {
            '$route'(val) {
                this.getAppointments(this.$route.params.id)
            }
        },
        created() {
            if (this.$route.params.id)
                this.getAppointments(this.$route.params.id)

            this.dt_format = this.$helpers.toElFormat(this.$date_format)

            this.range = [this.$moment().startOf('month').toDate(), this.$moment().endOf('month').toDate()]
            this.getAppointments()
            this.$on('account-changed', () => {
            })
        },
        mounted() {

        },
        beforeDestroy() {
        },

        methods: {
            viewBooking(row) {
                this.$router.push({
                    name: 'dashboard_booking_view',
                    params: {id: row.id, service_date: row.service_date}
                })
            },
            personChangedEvent(person) {

            },
            getAppointments() {
                this.loading_apt = true

                console.log(this.$route.params.id)

                let params = {
                    from: this.$moment(this.range[0]).format('YYYY-MM-DD'),
                    to: this.$moment(this.range[1]).format('YYYY-MM-DD'),
                    type: "charges",
                    page: this.current_page,
                    filter: {limit: 10},
                    where: {accountId: this.$route.params.id}
                }

                if (this.bookings_filter.length > 0) {
                    params.recurring = (this.bookings_filter === 'recurring')
                    params.status = (this.bookings_filter === 'recurring') ? 'active' : this.bookings_filter
                }

                /* if (this.filter_team.length > 0) {
                     params.targetType = 'all_teams'
                     params.targetTypeId = this.filter_team
                 }*/

                this.axios
                    .get("/bookings/schedule", {
                        params: params
                    })
                    .then(res => {
                        this.appointments = res.data.data;
                        this.stats.total_bookings = res.data.meta.totalItemCount;
                        this.total_records = res.data.meta.totalItemCount;
                        this.page_size = res.data.meta.itemsPerPage;
                    })
                    .catch((err) => {

                    })
                    .finally(_ => {
                        this.loading_apt = false;
                    });

            },
            shuffle(arra1) {
                var ctr = arra1.length
                var temp
                var index

                // While there are elements in the array
                while (ctr > 0) {
                    // Pick a random index
                    index = Math.floor(Math.random() * ctr)
                    // Decrease ctr by 1
                    ctr--
                    // And swap the last element with it
                    temp = arra1[ctr]
                    arra1[ctr] = arra1[index]
                    arra1[index] = temp
                }
                return arra1
            }
        }
    }
</script>

<style lang="scss">
    .team-assignment-div:not(:first-child) {
        margin-left: -10px;
    }
</style>
