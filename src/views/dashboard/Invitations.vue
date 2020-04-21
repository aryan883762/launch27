<template>
    <div class="app-section timelogs" >
        <el-row class="full-width">

            <el-card>
                <el-row :gutter="0" class="stats-row">
                    <el-col :md="4" :sm="4" :xs="12" class="first">
                        <span class="stats-number _first">{{ invitationsStats.total }}</span>
                        <label>
                            Total Invitations <br>
                        </label>
                    </el-col>

                    <el-col :md="4" :sm="4" :xs="12" class="pull-right third">
                        <span class="stats-number _third">{{ invitationsStats.rejected }}</span>
                        <label>
                            Rejected Invitations <br>
                        </label>
                    </el-col>

                    <el-col :md="4" :sm="4" :xs="12" class="pull-right second">
                        <span class="stats-number _second">{{ invitationsStats.accepted }}</span>
                        <label>
                            Accepted Invitations<br>
                        </label>
                    </el-col>

                    <el-col :md="4" :sm="4" :xs="12" class="pull-right fourth">
                        <span class="stats-number _fourth">{{ invitationsStats.pending }}</span>
                        <label>
                            Pending Invitations <br>
                        </label>
                    </el-col>
                </el-row>
            </el-card>
            <el-card style="border:none; margin-bottom: 5px;">
                <el-row>
                    <el-col class="bg-white text-center">
                        <div class="pull-left main-filters">
                            <el-date-picker :default-time="['00:00:00', '23:59:59']" @change="filterChanged"
                                            :format="dt_format"
                                            end-placeholder="End date" range-separator="to"
                                            size="small" start-placeholder="Start date"
                                            type="daterange"
                                            v-model="dateRange"
                            />
                        </div>

                        <div class="pull-right  main-filters">
                            <el-select @change="filterChanged" class="filter small pull-right"
                                       placeholder="Status" v-model="filterStatus"
                            >
                                <el-option label="All" value="all">
                                    All
                                </el-option>
                                <el-option label="Pending" value="pending">
                                    Pending
                                </el-option>
                                <el-option label="Bid" value="bid">
                                    Bid
                                </el-option>
                                <el-option label="Accepted" value="accepted">
                                    Accepted
                                </el-option>
                                <el-option label="Rejected" value="rejected">
                                    Rejected
                                </el-option>
                                <el-option label="Closed" value="closed">
                                    Closed
                                </el-option>
                            </el-select>

                            <el-select @change="filterChanged" class="filter small pull-right"
                                       placeholder="Team" v-model="filterTeam">
                                <el-option label="All" value="all">
                                    All
                                </el-option>
                                <el-option :key="team.id" :label="team.name" :value="team.id" v-for="team in teams">
                                    {{ team.name }}
                                </el-option>
                            </el-select>
                        </div>
                    </el-col>
                </el-row>
            </el-card>

            <el-scrollbar view-class="view-box" :native="false" :style="{maxHeight: (windowHeight - 310) + 'px', height: (windowHeight - 310) + 'px', overflow: 'hidden'}">

                <el-table :data="invitations" style="width: 100%" v-loading="loading">
                    <el-table-column label="Date">
                        <template slot-scope="scope">
                            {{ $moment(scope.row.created_at).format($date_format + ' ' + $time_format) }}
                        </template>
                    </el-table-column>
                    <el-table-column label="Team" prop="team.name"/>
                    <el-table-column label="Rate">
                        <template slot-scope="scope">
                            <span v-if="scope.row.pay_rate_type === 'percent'">Wage: {{ scope.row.pay_rate + "%" }} </span>
                            <span v-if="scope.row.pay_rate_type === 'hourly'">Wage: {{ $currency }}{{ scope.row.pay_rate + "/hr" }} </span>
                        </template>
                    </el-table-column>
                    <el-table-column label="Comment" prop="comment"/>
                    <el-table-column label="Status" prop="status"/>
                    <el-table-column label="Booking">
                        <template slot-scope="scope">
                            <el-button @click="viewBooking(scope.row)" type="text" v-if="scope.row.booking">
                                {{ scope.row.booking.account.fullname }}
                            </el-button>
                        </template>
                    </el-table-column>
                    <el-table-column label="Action">
                        <template slot-scope="scope">
                            <el-button @click="manageInvitation(scope.row)" size="mini"
                                       type="warning"
                            >
                                {{ $can('manage', 'role_admin') ? 'Update' : 'Interested' }}
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>

                <no-data :show.sync="invitations.length === 0 && !loading"></no-data>

            </el-scrollbar>



            <invitation-form :dialog-show="dialog"
                             :save-done="updateDone" :selected-invitation.sync="selectedInvitation"
                             @update-visible="dialog = false"
            />
        </el-row>
        <el-col class="pagination-footer">
            <div class="cct">
                <el-pagination
                        :current-page.sync="current_page"
                        :page-size="page_size"
                        :total="total_records"
                        @current-change="getInvitations"
                        background
                        layout="total, prev, pager, next"
                />
            </div>
        </el-col>
    </div>
</template>

<script>
    import {VclTable} from 'vue-content-loading'
    import invitationForm from '../../components/BookingInvitationsForm'
    import NoData from "../../components/NoData";

    export default {
        components: {
            NoData,
            VclTable,
            invitationForm
        },
        data() {
            return {
                dateRange: '',
                filterStatus: '',
                loading: false,
                invitations: [],
                invitationsStats: {total: 0, accepted: 0, rejected: 0, pending: 0},
                selectedInvitation: {},
                dialog: false,
                teams: [],
                editableTeams: [],
                filterTeam: '',
                total_records: 0,
                page_size: 0,
                current_page: 1,
                load_stats: true,
                dt_format: ''
            }
        },

        mounted() {
            this.loadTeams()
            this.dt_format = this.$helpers.toElFormat(this.$date_format)
        },

        methods: {

            manageInvitation(invitation) {
                this.selectedInvitation = invitation
                this.dialog = true
            },

            filterChanged() {
                this.current_page = 1
                // only loading stats if filter has changed
                this.load_stats = true
                this.getInvitations()
            },

            canEditInvitation(invitation) {
                // only admin can edit accepted or closed invitations
                // admin can edit all invitations
                if (this.$can('manage', 'role_admin') && this.$can('manage', 'manage_team_invitation')) {
                    return true
                } else {
                    return invitation.status !== 'accepted' && invitation.status !== 'closed' &&
                        this.editableTeams.includes(invitation.teamId)
                }
            },

            loadTeams() {
                // if user is not an admin we limit it to the account's teams
                let url = '/teams/my-teams/' + this.$auth.user().id

                if (this.$can('manage', 'role_admin')) {
                    url = '/companies/current/teams'
                }
                this.loading = true

                this.axios.get(url)
                    .then(res => {
                        this.teams = res.data

                        // setting editable teams
                        this.teams.forEach((t) => {
                            if (t.isTeamLead) {
                                this.editableTeams.push(t.id)
                            }
                        })
                    })
                    .then(() => {
                        this.getInvitations()
                    })
            },

            getInvitations() {
                this.loading = true

                let whereQuery = {}
                if (this.filterStatus !== '' && this.filterStatus !== 'all') {
                    whereQuery.status = this.filterStatus
                }
                if (this.dateRange && this.dateRange[0] && this.dateRange[1]) {
                    whereQuery.created_at = {between: this.dateRange}
                }
                if (this.filterTeam === '' || this.filterTeam === 'all') {
                    whereQuery.teamId = {inq: this.teams.map((i) => i.id)}
                } else {
                    whereQuery.teamId = this.filterTeam
                }

                this.axios.get('/companies/current/booking_invitations',
                    {
                        params: {
                            page: this.current_page,
                            filter: {
                                order: "created_at DESC",
                                where: whereQuery,
                                include: [{relation: 'team'}, {relation: 'booking', scope: {include: 'account'}}]
                            }
                        }
                    })
                    .then(res => {
                        if (res.data) {
                            this.invitations = res.data.data
                            if (res.data.meta) {
                                this.page_size = res.data.meta.itemsPerPage
                                this.total_records = res.data.meta.totalItemCount
                            }
                        }
                        this.getStats(whereQuery)
                    })
                    .catch()
                    .then(() => {
                        this.loading = false
                    })
            },

            getStats(whereQuery) {
                if (this.load_stats) {
                    this.axios.get('/booking_invitations/list-statistics',
                        {
                            params: {
                                where: whereQuery
                            }
                        })
                        .then(res => {
                            this.invitationsStats = res.data
                            this.load_stats = false
                        })
                }
            },

            updateDone() {
                this.dialog = false
                this.selectedInvitation = {}
                this.load_stats = true
                this.getInvitations()
            },

            viewBooking(invitation) {
                let routeName = 'team_bookings_view'
                if (this.$can('manage', 'role_admin')) {
                    routeName = 'dashboard_booking_view'
                }
                this.$router.push({
                    name: routeName,
                    params: {id: invitation.booking.id, service_date: invitation.booking.service_date}
                })
            }
        }
    }
</script>

<style lang="scss">

</style>
