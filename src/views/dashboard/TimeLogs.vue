<template>
    <div class="app-section timelogs">
        <el-row class="full-width">

            <el-card style="margin-bottom : 0px;">
                <el-row :gutter="0" class="stats-row">
                    <el-col :md="4" :sm="4" :xs="12" class="second">
            <span class="stats-number _second" style="margin-bottom: 5px; height : 32px;">
              <el-rate v-model="average_rating"/>
            </span>
                        <label>Average Rating</label>
                        <span class="bar"/>
                    </el-col>

                    <el-col :md="4" :sm="4" :xs="12" class="first">
                        <span class="stats-number _first">{{ timesheets_stats.bookings }}</span>
                        <label>Total Bookings</label>
                    </el-col>

                    <el-col :md="4" :sm="4" :xs="12" class="third">
                        <span class="stats-number _third">{{ timesheets_stats.hours | duration }}</span>
                        <label>Total Hours</label>
                        <span class="bar"/>
                    </el-col>

                    <el-col :md="4" :sm="4" :xs="12" class="fourth">
                        <span class="stats-number _fourth">{{ timesheets_stats.pending }}</span>
                        <label>Total Pending</label>
                        <span class="bar"/>
                    </el-col>

                    <el-col :md="4" :sm="4" :xs="12" class="fourth">
                        <span class="stats-number _fourth">{{ timesheets_stats.distance }}</span>
                        <label>Total Distance</label>
                        <span class="bar"/>
                    </el-col>

                    <el-col :md="4" :sm="4" :xs="12" class="fourth" v-if="false">
                        <span class="stats-number _fourth">{{ timesheets_stats.payout }}</span>
                        <label>Total Payout</label>
                        <span class="bar"/>
                    </el-col>
                </el-row>
            </el-card>


            <el-card style="border:none; margin-bottom: 5px;">
                <el-row>
                    <el-col class="bg-white text-center">
                        <div class="pull-left main-filters">
                            <el-date-picker :format="dt_format" :default-time="['00:00:00', '23:59:59']" @change="filterChanged"
                                            end-placeholder="End date" range-separator="to"
                                            size="small" start-placeholder="Start date"
                                            type="daterange"
                                            v-model="date_range"/>
                        </div>

                        <div class="pull-right  main-filters">
                            <el-button class="pull-right" disabled icon="el-icon-setting" round size="mini" style="margin-right: 10px" type="danger">Export</el-button>

                            <el-select @change="filterChanged" class="filter small pull-right" placeholder="Status" v-model="filter_status">
                                <el-option label="All" value="all">All</el-option>
                                <el-option label="Approved" value="approved">Approved</el-option>
                                <el-option label="Pending" value="pending">Pending</el-option>
                                <el-option label="Locked" value="locked">Locked</el-option>
                            </el-select>

                            <team-select additional-class="filter small" style="margin-right:10px;" @change="filterChanged" :members-only="true" v-model="filter_team" :show-add-teams="false" :multiple="true" :collapse-tags="true"></team-select>

                            <!--  <el-select @change="filterChanged" class="filter small pull-right" placeholder="Team" v-model="filter_team">
                                  <el-option label="All" value="all">All</el-option>
                                  <el-option :key="team.id" :label="team.name" :value="index" v-for="(team, index) in teams">{{team.name}}</el-option>
                              </el-select>-->

                        </div>
                    </el-col>
                </el-row>
            </el-card>


            <el-scrollbar view-class="view-box" :native="false" :style="{maxHeight: (windowHeight - 310) + 'px', height: (windowHeight - 310) + 'px', overflow: 'hidden'}">

                <el-table empty-text="  " :data="timesheets" style="width: 100%" v-loading="loading">
                    <el-table-column label="Service Date">
                        <template slot-scope="scope">
                            <template v-if="scope.row.booking">
                                <label>{{$moment(scope.row.booking.service_date).format($date_format)}}</label>
                                <small style="display:block;"><strong>{{$moment(scope.row.booking.service_date).format($time_format)}}</strong></small>
                            </template>
                        </template>
                    </el-table-column>
                    <el-table-column label="Service" prop="name" width="250px">
                        <template slot-scope="scope">
                            <template v-if="scope.row.booking">
                                <strong v-if="scope.row.booking.account">{{scope.row.booking.account.fullname}}</strong>
                                <i style="display:block;">{{getServiceNames(scope.row.booking)}}</i>
                            </template>
                        </template>
                    </el-table-column>
                    <el-table-column label="Team">
                        <template slot-scope="scope">
                            {{scope.row.account.fullname}}
                        </template>
                    </el-table-column>

                    <el-table-column label="Price">
                        <template slot-scope="scope">
                            <template v-if="scope.row.booking && scope.row.booking.charge">
                                {{$currency}}{{scope.row.booking.charge.total_after_tax}}
                            </template>
                        </template>
                    </el-table-column>
                    <el-table-column label="Distance" prop="distance_travelled"/>

                    <el-table-column label="Travel">
                        <template slot-scope="scope">
                            <template v-if="scope.row.checkin && scope.row.onway">
                                {{(($moment(scope.row.checkin).unix() - $moment(scope.row.onway).unix()) / 60) | duration}}
                            </template>
                            <template v-else>
                                --
                            </template>
                        </template>
                    </el-table-column>

                    <el-table-column label="In">
                        <template slot-scope="scope">
                            {{scope.row.checkin ? $moment(scope.row.checkin).format($time_format) : '--'}}
                        </template>
                    </el-table-column>

                    <el-table-column label="Out">
                        <template slot-scope="scope">
                            {{scope.row.checkout ? $moment(scope.row.checkout).format($time_format) : '--'}}
                        </template>
                    </el-table-column>

                    <el-table-column label="Reported">
                        <template slot-scope="scope" v-if="scope.row.checkout && scope.row.checkin">
                            {{(($moment(scope.row.checkout).unix() - $moment(scope.row.checkin).unix()) / 60) | duration}}
                        </template>
                        <template v-else>
                            --
                        </template>
                    </el-table-column>

                    <el-table-column label="Status">
                        <template slot-scope="scope">
                            {{scope.row.approved ? 'Approved' : "Pending"}}
                        </template>
                    </el-table-column>

                    <el-table-column label="WorkDiary">
                        <template slot-scope="scope">
                            <el-link type="danger" size="mini" @click="viewWorkDiary(scope.row)">View</el-link>
                        </template>
                    </el-table-column>
                </el-table>

                <no-data :show.sync="timesheets.length === 0 && !loading"></no-data>

            </el-scrollbar>
        </el-row>
        <el-col class="pagination-footer">
            <div class="cct">
                <el-pagination
                        :current-page.sync="current_page"
                        :page-size="page_size"
                        :total="total_records"
                        @current-change="getTimeSheets"
                        background
                        layout="total, prev, pager, next">
                </el-pagination>
            </div>
        </el-col>
    </div>
</template>
<script>
    import {VclTable} from 'vue-content-loading'
    import NoData from "../../components/NoData";
    import AccountAvatar from "../../components/AccountAvatar";
    import TeamSelect from "../../components/TeamSelect";

    export default {
        components: {
            TeamSelect,
            AccountAvatar,
            NoData,
            VclTable
        },
        data: () => {
            return {
                date_range: [],
                filter_team: "",
                filter_status: "",
                timesheets: [],
                timesheets_stats: {bookings: 0, hours: 0, pending: 0, distance: 0, payout: 0},
                average_rating: 0,
                loading: false,
                teams: [],
                current_page: 1,
                total_records: 0,
                page_size: 0,
                load_stats: true,
                dt_format: ''
            };
        },
        created() {
            this.dt_format = this.$helpers.toElFormat(this.$date_format)
            this.date_range = [this.$moment().startOf('day').toDate(), this.$moment().endOf('day').toDate()];
        },
        mounted() {
            this.getTimeSheets()
            this.getTeams()
        },
        methods: {
            filterChanged() {
                this.current_page = 1;
                // only loading stats if filter has changed
                this.load_stats = true;
                this.getTimeSheets();
            },
            getTeams() {
                let url = '/companies/current/teams';
                // for team menber we use custome remote
                if (this.$can('manage', 'role_team')) {
                    url = '/teams/my-teams/' + this.$auth.user().id;
                }

                this.axios.get(url, {params: {filter: {include: ['team_assignments']}}})
                    .then(res => {
                        this.teams = res.data
                    })
                    .catch(err => {

                    })
                    .then()
            },
            getTimeSheets() {

                // for team menber we filter by accountID
                let where_query = {};
                if (this.$can('manage', 'role_team')) {
                    where_query.accountId = this.$auth.user().id;
                }
                if (this.date_range && this.date_range[0] && this.date_range[1]) {
                    where_query.service_date = {between: this.date_range};
                }
                if (this.filter_status === 'approved') {
                    where_query.approved = true;
                } else if (this.filter_status === 'pending') {
                    where_query.approved = false;
                } else if (this.filter_status === 'locked') {
                    where_query.locked = true;
                }
                /*      if (this.filter_team !== 'all' && this.teams[this.filter_team]) {
                          let bookingIds = [];
                          this.teams[this.filter_team].team_assignments.forEach((ta) => bookingIds.push(ta.bookingId));
                          where_query.bookingId = {inq: bookingIds};
                      }*/

                if (this.filter_team.length > 0) {
                    where_query.accountId = {inq: this.filter_team}
                }

                this.loading = true

                this.axios.get('/companies/current/timesheets', {
                    params: {
                        page: this.current_page,
                        filter: {
                            where: where_query,
                            include: [{
                                relation: "booking",
                                scope: {
                                    include: ["account", {"service_details": "pricing_variables"}, "charge"],
                                }
                            }, {
                                relation: "account"
                            }]
                        }
                    }
                })
                    .then(res => {
                        if (res.data) {
                            this.timesheets = res.data.data
                            if (res.data.meta) {
                                this.page_size = res.data.meta.itemsPerPage;
                                this.total_records = res.data.meta.totalItemCount;
                            }
                        }
                        this.getStats(where_query)
                    })
                    .catch(err => {

                    })
                    .finally(_ => {
                        this.loading = false
                    })
            },
            getStats() {
                (async () => {
                    try {
                        let where_query = {};
                        if (this.$can('manage', 'role_team')) {
                            where_query.accountId = this.$auth.user().id;
                        } else {
                            /* if (this.filter_team !== 'all' && this.teams[this.filter_team]) {
                                 let bookingIds = [];
                                 this.teams[this.filter_team].team_assignments.forEach((ta) => bookingIds.push(ta.bookingId));
                                 where_query.bookingId = {inq: bookingIds};
                             }*/
                        }

                        if (this.filter_status === 'approved') {
                            where_query.approved = true;
                        } else if (this.filter_status === 'pending') {
                            where_query.approved = false;
                        } else if (this.filter_status === 'locked') {
                            where_query.locked = true;
                        }

                        this.timesheets_stats.bookings = (await this.$root.$aggregate('timesheets',
                            this.date_range[0],
                            this.date_range[1],
                            'count',
                            where_query)).count

                        this.timesheets_stats.distance = (await this.$root.$aggregate('bookings',
                            this.date_range[0],
                            this.date_range[1],
                            'sum_distance',
                            where_query,
                            'distance')).distance

                        this.timesheets_stats.hours = (await this.$root.$aggregate('bookings',
                            this.date_range[0],
                            this.date_range[1],
                            'sum_hours',
                            where_query)).minutes

                        this.load_stats = false;

                    } catch (err) {

                    }
                })()
            },
            getServiceNames(booking) {
                let services = "";
                booking.service_details.forEach(srv => {
                    if (services == "") return (services += srv.name);
                    else return (services += "; " + srv.name);
                });

                return services;
            },
            viewWorkDiary(timelog) {
                let routeName = 'dashboard_booking_workdiary';
                if (this.$can('manage', 'role_team')) {
                    routeName = 'team_bookings_workdiary';
                }

                this.$router.push({name: routeName, params: {id: timelog.booking.id, service_date: timelog.booking.service_date}})
            }
        }
    };
</script>

<style lang="scss">
    .app-section.timelogs {

        .el-range-separator {
            width: 20px;
            color: gray;
        }

        .search {
            width: 200px;
            margin-left: 10px;
        }

        .to {
            height: 35px;
            line-height: 35px;
            display: inline-block;
            width: 25px;
            color: gray;
        }

        .el-radio-group {
            &.options {
                .el-radio-button {
                    .el-radio-button__inner {
                        border: none;
                        font-size: 12px;
                        padding: 20px 30px;
                        text-transform: uppercase;
                        border-radius: 0px;
                        border-bottom: 2px solid white;
                    }

                    &.is-active {
                        .el-radio-button__inner {
                            background: white;
                            color: $launch-primary-color;
                            box-shadow: none;
                            border-bottom: 2px solid $launch-primary-color;
                        }
                    }
                }
            }
        }

        .main-filters {
            .el-radio-group {
                border: 1px solid #dcdfe6;
                padding: 2px;
                border-radius: 25px;

                .el-radio-button {
                    font-size: 12px;

                    .el-radio-button__inner {
                        border: none;
                    }

                    &.is-active {
                        .el-radio-button__inner {
                            border-radius: 25px !important;
                        }
                    }
                }
            }

            .el-radio-button:first-child .el-radio-button__inner {
                border-radius: 25px 0 0 25px;
            }

            .el-radio-button:last-child .el-radio-button__inner {
                border-radius: 0 25px 25px 0;
            }

            .filter {
                margin-right: 10px;
            }
        }

        .appointments {
            min-height: 500px;
        }

        .border-left {
            box-shadow: -2px 0px 5px 1px #eeeeee;
        }
    }

    .stats-row {
        span:not(.el-rate__item),
        label {
            display: block;
        }

        span {
            font-size: 26px;
            font-weight: 500;

            &.stats-number {
                &._first {
                    color: #22c3a4;
                }

                &._second {
                    color: #0fc8ff;
                }

                &._third {
                    color: #ff3f73;
                }

                &._fourth {
                    color: #ffd514;
                }
            }
        }

        label {
            font-weight: 300;
        }

        .el-col {
            position: relative;

            &.first,
            &.second,
            &.third {
                &:after {
                    content: "";
                    height: 100%;
                    position: absolute;
                    top: 0;
                    bottom: 0px;
                    width: 1px;
                    border-right: 1px solid #f3f3f3;
                    right: 16px;
                }
            }
        }

        .el-rate {
            display: block;

            .el-rate__item {
                display: inline-block;
            }
        }
    }
</style>
