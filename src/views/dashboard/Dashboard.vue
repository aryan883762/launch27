<template>
    <div class="app-section dashboard">
        <el-scrollbar view-class="view-box" :native="false" :style="{maxHeight: (windowHeight - 112) + 'px', height: (windowHeight - 112) + 'px', overflow: 'hidden'}">

            <div style="width: calc(100% - 5px)">
                <el-row :gutter="0">
                    <el-col>
                        <el-row :gutter="5">
                            <el-col :md="17" :sm="17" :xs="24">
                                <el-card shadow="hover">
                                    <el-row class="divider-3x">
                                        <el-col :md="12" :sm="12" :xs="24">
                                            <h4 class="flex-row-center">
                                                <el-image :src="require('@/assets/svgs/dashboard/stats.svg')"></el-image>
                                                Business Statistics
                                            </h4>
                                        </el-col>
                                        <el-col :md="12" :sm="12" :xs="24"></el-col>
                                    </el-row>

                                    <!--row for states-->
                                    <el-row :gutter="40" class="stats-row" style="margin-bottom: 15px">
                                        <el-col :md="5" :sm="5" :xs="24" class="first text-center">
                                            <span class="stats-number _first">{{ stats.bookings_today }}</span>
                                            <label>Bookings Today</label>
                                        </el-col>

                                        <el-col :md="5" :sm="5" :xs="24" class="second text-center">
                                            <span class="stats-number _second">{{ stats.hours_worked }}</span>
                                            <label>Hours worked in period</label>
                                            <span class="bar"/>
                                        </el-col>

                                        <!-- <el-col :md="8" :sm="8" :xs="12" class="third">
                                           <span class="stats-number _third"> {{ stats.unread_messages }}</span>
                                           <label>Unread Messages</label>
                                           <span class="bar"/>
                                         </el-col>-->

                                        <el-col :md="5" :sm="5" :xs="24" class="third text-center">
                                            <span class="stats-number _third">{{ stats.total_bookings }}</span>
                                            <label>Bookings for Period</label>
                                            <span class="bar"/>
                                        </el-col>

                                        <el-col :md="5" :sm="5" :xs="24" class="third text-center">
                                            <span class="stats-number _fourth">{{ stats.total_bookings_ever }}</span>
                                            <label>Lifetime Bookings</label>
                                            <span class="bar"/>
                                        </el-col>

                                        <el-col :md="4" :sm="4" :xs="24" class="fourth text-center">
                                            <span class="stats-number _first">{{$currency}}{{ stats.total_bookings_charge_ever | numeralFormat($money_format) }}</span>
                                            <label>Lifetime Revenue</label>
                                            <span class="bar"/>
                                        </el-col>
                                    </el-row>
                                    <!--row for graph-->

                                    <el-row>
                                        <dashboard-chart :height="292" :range.sync="range" :mode.sync="viewMode"
                                                         :bookings-filter.sync="bookings_filter"></dashboard-chart>
                                    </el-row>
                                </el-card>
                            </el-col>
                            <el-col :md="7" :sm="7" :xs="24">
                                <el-card shadow="none">
                                    <el-row class="">
                                        <el-col :md="12" :sm="12" :xs="24">
                                            <h4 class="flex-row-center">
                                                <el-image :src="require('@/assets/svgs/dashboard/calendar.svg')"></el-image>
                                                Calendar
                                            </h4>
                                        </el-col>

                                    </el-row>

                                    <el-row :gutter="10" style="margin-top: 10px;">
                                        <el-col :md="14" :sm="14" :xs="24">
                                            <team-select v-model="filter_team" :multiple="true" additional-class="filter small" :filterable="false"
                                                         :collapse-tags="true" @change="fetchBookings" :show-add-teams="false"></team-select>
                                        </el-col>

                                        <el-col :md="10" :sm="10" :xs="24">
                                            <el-select @change="fetchBookings()" class="small filter pull-right"
                                                       style="width : 100%; margin-left: 5px;" v-model="bookings_filter">
                                                <el-option label="Active Bookings" value="active"></el-option>
                                                <el-option label="Recurring Bookings" value="recurring"></el-option>
                                                <el-option label="Completed Bookings" value="completed"></el-option>
                                                <el-option label="Cancelled Bookings" value="cancelled"></el-option>
                                            </el-select>
                                        </el-col>

                                    </el-row>

                                    <el-row>
                                        <el-col>
                                            <div style="margin: 20px auto">
                                                <el-button :plain="viewMode !== 'today'" size="mini" round type="warning" @click="viewMode = 'today'">Today</el-button>
                                                <el-divider direction="vertical"></el-divider>
                                                <el-button :plain="viewMode !== 'week'" size="mini" round type="warning" round @click="viewMode = 'week'">Week</el-button>
                                                <el-divider direction="vertical"></el-divider>
                                                <el-button :plain="viewMode !== 'month'" size="mini" round type="warning" round @click="viewMode = 'month'">Month</el-button>
                                            </div>

                                        </el-col>
                                    </el-row>

                                    <div style="width:100%">
                                        <v-range-selector :end-date.sync="range.end" :single-month="true" :start-date.sync="range.start"/>
                                    </div>

                                </el-card>
                            </el-col>
                        </el-row>

                        <el-row :gutter="0">
                            <el-col>
                                <el-card shadow="none" class="active-bookings-card">
                                    <el-row class="divider-3x">
                                        <div>
                                            <div class="main-filters pull-left">
                                                <h4 class="flex-row-center">
                                                    <el-image :src="require('@/assets/svgs/dashboard/active.svg')"></el-image>
                                                    Active Bookings
                                                </h4>
                                            </div>
                                            <div class="main-filters pull-right">

                                                <el-button size="small" type="warning" @click="sendScheduleDialog = true">
                                                    Send Schedule
                                                </el-button>

                                                <team-select style="margin-left:10px;" :filterable="false" v-model="filter_team" :multiple="true" additional-class="filter small" :collapse-tags="true" @change="fetchBookings" :show-add-teams="false"></team-select>

                                                <company-locations :start-with-default="false" @change="fetchBookings" style="margin-left: 10px;" :multiple="true" additional-class="" :return-object="false" :filterable="false" v-model="filter_location"></company-locations>
                                            </div>
                                        </div>
                                    </el-row>

                                    <el-row>

                                        <el-table empty-text="  " :data="active_bookings" stripe style="width: 100%" v-loading="bb_loading"
                                                  @row-click="selectRow">
                                            <el-table-column v-if="false" type="selection" width="55"></el-table-column>
                                            <el-table-column label="Service Date" prop="date">
                                                <template slot-scope="scope">

                                                    <small style="display:block;font-weight: 600; font-size: 13px;">
                                                        {{$moment(scope.row.service_date).format($time_format) }}
                                                        {{(scope.row.arrival_window > 0)? " - " + $moment(scope.row.service_date).add(scope.row.arrival_window,'minutes').format($time_format) : "" }}
                                                    </small>
                                                    <a @click="selectRow(scope.row)" href="javascript:" style="font-weight: 500; color:#333;">{{$moment(scope.row.service_date).format($date_format) }}</a>
                                                    <strong style="color:red;display:block;" v-if="scope.row.forecasted">forecasted</strong>

                                                </template>
                                            </el-table-column>
                                            <el-table-column label="Duration" prop="duration">
                                                <template slot-scope="scope">
                                                    <label class="brand-color" style="font-weight: bold">{{scope.row.duration | duration}}</label>
                                                </template>
                                            </el-table-column>
                                            <el-table-column label="Customer">
                                                <template slot-scope="scope">
                                                    <div style="display:inline-block;">
                                                        <router-link
                                                                :to="{name : 'dashboard_profile_appointments', params : {id : scope.row.account.id}}">
                                                            <label class="customer-name">{{ scope.row.account.first_name }} {{scope.row.account.last_name }}</label>
                                                            <small style="display:block;" class="customer-phone" v-if="scope.row.account.phone">({{scope.row.account.phone}})</small>
                                                        </router-link>
                                                    </div>
                                                </template>
                                            </el-table-column>

                                            <el-table-column label="Service Location" prop="location">
                                                <template slot-scope="scope">
                                                    <a @click="selectRow(scope.row)" href="#" style="font-weight: 500;">
                                                        <label class="service-name" v-if="scope.row.service_details.length > 0">{{scope.row.service_details[0].name }} </label>
                                                        <small v-if="scope.row.address">{{ scope.row.address.street }} {{ scope.row.address.city }} {{
                                                            scope.row.address.state }} {{ scope.row.address.zip }} </small>
                                                    </a>
                                                </template>
                                            </el-table-column>
                                            <el-table-column label="Frequency" prop="frequency.name">
                                                <template slot-scope="scope">
                                                    <small>{{ scope.row.frequency.name }}</small>
                                                </template>
                                            </el-table-column>
                                            <el-table-column label="Assigned To">
                                                <template slot-scope="scope">
                                                    <div v-if="scope.row.team_assignments && scope.row.team_assignments.length > 0">
                                                        <label style="display:block;" v-for="(assignment, index) in scope.row.team_assignments"
                                                               :style="{color: '#' + (assignment.team.color || '000')}"
                                                               class="teams-assigned">
                                                            {{(assignment.team_model === 'account')? assignment.team.fullname : assignment.team.name}}
                                                        </label>
                                                    </div>
                                                    <el-tag v-else effect="dark" type="danger" size="mini">Unassigned</el-tag>
                                                </template>
                                            </el-table-column>
                                            <el-table-column label="Status" prop="status">
                                                <template slot-scope="scope">
                                                    <label>{{scope.row.status.toUpperCase()}}</label>
                                                </template>
                                            </el-table-column>
                                        </el-table>

                                        <no-data :show.sync="active_bookings.length === 0 && !bb_loading"></no-data>

                                    </el-row>

                                    <el-col class="pagination-footer">
                                        <div class="cct">
                                            <el-pagination :current-page.sync="current_page" :page-size="page_size"
                                                           :total="total_records" @current-change="fetchBookings()" background
                                                           layout="total, prev, pager, next"></el-pagination>
                                        </div>
                                    </el-col>
                                </el-card>
                            </el-col>

                        </el-row>
                    </el-col>

                </el-row>

            </div>


        </el-scrollbar>

        <el-dialog :visible.sync="sendScheduleDialog" append-to-body title="Send Schedules" top="0vh" width="80%">
            <div slot="title">
                <span class="el-dialog__title">Send Schedules</span>
                <p>Email or print your teams' schedules so they know what bookings they're assigned.</p>
            </div>
            <schedule-invite-print v-if="sendScheduleDialog"></schedule-invite-print>
        </el-dialog>
    </div>
</template>

<script>
    import VueCal from "vue-cal";
    import DashboardChart from "./reports/utils/DashboardChart";
    import VRangeSelector from "../../components/vuelendar/components/vl-range-selector";
    import VDaySelector from "../../components/vuelendar/components/vl-day-selector";
    import {VclFacebook, VclBulletList} from 'vue-content-loading';
    import Avatar from 'vue-avatar'
    import AccountAvatar from "../../components/AccountAvatar";
    import NoData from "../../components/NoData";
    import ScheduleInvitePrint from "../../components/ScheduleInvitePrint";
    import TeamSelect from "../../components/TeamSelect";
    import CompanyLocations from "../../components/CompanyLocations";
    import {updateLoggedInUser} from '../../pushNotification';


    export default {
        components: {
            CompanyLocations,
            TeamSelect,
            NoData,
            AccountAvatar,
            VueCal,
            DashboardChart,
            VDaySelector,
            VRangeSelector,
            VclFacebook,
            VclBulletList,
            ScheduleInvitePrint,
            Avatar
        },
        data: () => {
            return {
                themeStyles: {
                    wrapper: {
                        border: "0",
                        width: "100%"
                    },
                    header: {
                        color: "#000",
                        border: "none",
                        textTransform: "uppercase",
                        fontWeight: "600",
                        fontSize: "15px"
                    },
                    headerVerticalDivider: {
                        borderLeft: "1px solid #404c59"
                    },
                    dayCell: {
                        fontSize: "2rem",
                        padding: "5px 0 10px 0"
                    },
                    weekdays: {
                        color: "#000",
                        border: "none"
                    },
                    weekdaysVerticalDivider: {
                        borderLeft: "1px solid #404c59"
                    },
                    weeks: {
                        border: "none",
                        fontSize: "15px"
                    }
                },
                filter: "",
                stats: {
                    bookings_today: 0,
                    hours_worked: 0,
                    unread_messages: 0,
                    total_bookings: 0,
                    total_bookings_ever: 0,
                    total_bookings_charge_ever: 0
                },
                selected_date: "",
                active_bookings: [],
                bb_loading: true,
                loading: false,
                schedule: [],
                activities: [],
                range: {},
                date: null,
                total_records: 0,
                page_size: 0,
                current_page: 1,
                total_records_activity: 0,
                page_size_activity: 0,
                current_page_activity: 1,
                b_loading: true,
                bookings_filter: 'active',
                forecasted: false,
                sendScheduleDialog: false,
                filter_team: "",
                teams: [],
                viewMode: '',
                filter_location: []
            };
        },

        watch: {
            range: {
                deep: true,
                handler(val) {
                    //for handling
                    this.$emit("dashboard:date:changed", val);
                }
            },
            viewMode(val) {
                switch (val) {
                    case 'today':
                        this.range = {
                            start: this.$moment().startOf('day').format("YYYY-MM-DD"),
                            end: this.$moment().startOf('day').format("YYYY-MM-DD")
                        }
                        break;

                    case 'week':
                        this.range = {
                            start: this.$moment().format("YYYY-MM-DD"),
                            end: this.$moment().add(1, 'week').format("YYYY-MM-DD")
                        }
                        break;

                    case 'month':
                        this.range = {
                            start: this.$moment().startOf('month').format("YYYY-MM-DD"),
                            end: this.$moment().endOf('month').format("YYYY-MM-DD")
                        }
                        break;
                }
            }
        },
        created() {
            // check if onboarding is completed
            if (!this.$auth.user().companyId && !this.$auth.user().company &&
                this.$auth.user().role === 'r_admin') {
                this.$router.push({name: 'onboarding_company'});
            }

            if (this.$auth.check()) {
                updateLoggedInUser(this.$auth.user().id)
            }

            this.$on("dashboard:date:changed", this.dateChanged);
        },
        mounted() {

            this.viewMode = 'week'

            this.todayBookingCount()
            this.getTimehseetStats()

            //load zend charge
            var getScript = (nm) => {
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.id = 'ze-snippet'
                script.src = nm;

                script.onload = () => {
                    console.log('Zendesk loaded')
                    //only do this if user and admin/staff
                    window.zESettings = {
                        webWidget: {
                            color: {
                                theme: '#1fb6ff',
                                themeText : '#fff',
                                launcher: '#1fb6ff', // This will also update the badge
                                launcherText: '#fff',
                            }
                        }
                    };

                    if (this.$auth.check() && this.$auth.user().role !== 'r_customer' && this.$auth.user().role !== 'r_team') {
                        //also prefill user data
                        zE('webWidget', 'prefill', {
                            name: {
                                value: this.$auth.user().fullname,
                                readOnly: true // optional
                            },
                            email: {
                                value: this.$auth.user().email,
                                readOnly: true // optional
                            },
                            phone: {
                                value: this.$auth.user().phone,
                                readOnly: true // optional
                            }
                        });

                        //add identity
                        zE('webWidget', 'identify', {
                            name: this.$auth.user().fullname,
                            email: this.$auth.user().email,
                            organization: this.$auth.user().company.business_name
                        });
                    }
                };

                document.getElementsByTagName('body')[0].appendChild(script);
            }

            getScript('https://static.zdassets.com/ekr/snippet.js?key=2f43b628-d12c-432f-96ce-1251a72aed9c');
        },
        beforeDestroy() {
            this.$off("dashboard:date:changed", this.dateChanged);

        },
        methods: {
            actionCommand() {

            },
            dateChanged() {
                this.fetchBookings(1);
                this.getActivities(1);
            },
            getActivities(page) {

            },

            fetchBookings() {

                this.bb_loading = true;

                let params = {
                    from: this.$moment(this.range.start)
                        .startOf("day")
                        .utc()
                        .toISOString(),
                    to: this.$moment(this.range.end || this.range.start)
                        .endOf("day")
                        .utc()
                        .toISOString(),
                    type: "bookings",
                    page: this.current_page,
                    filter: {limit: 50},
                    recurring: (this.bookings_filter === 'recurring'),
                    status: (this.bookings_filter === 'recurring') ? 'active' : this.bookings_filter
                }

                if (this.filter_team.length > 0) {
                    params.targetType = 'all_teams'
                    params.targetTypeId = this.filter_team
                }

                if (this.filter_location.length > 0) {
                    params.where = {
                        locationId: {inq: this.filter_location}
                    }
                }

                this.axios
                    .get("/bookings/schedule", {
                        params: params
                    })
                    .then(res => {
                        this.active_bookings = res.data.data;
                        this.stats.total_bookings = res.data.meta.totalItemCount;
                        this.total_records = res.data.meta.totalItemCount;
                        this.page_size = res.data.meta.itemsPerPage;
                    })
                    .catch()
                    .finally(_ => {
                        this.bb_loading = false;
                    });
            },
            selectRow(row) {
                this.$router.push({
                    name: 'dashboard_booking_view',
                    params: {id: row.id, service_date: row.service_date}
                })

            },
            todayBookingCount() {

                (async () => {
                    try {
                        this.stats.bookings_today = (await this.$root.$aggregate('bookings', this.$moment().format("YYYY-MM-DD"), this.$moment().format("YYYY-MM-DD"), 'count', {status: 'active'})).count
                        this.stats.total_bookings_ever = (await this.$root.$aggregate('bookings', this.$auth.user().company.created_at, this.$moment().toISOString(), 'count', {status: 'active'}, null, true)).count
                        this.stats.total_bookings_charge_ever = (await this.$root.$aggregate('charges', this.$auth.user().company.created_at, this.$moment().toISOString(), 'sum', null, '$total_after_tax')).sum
                    } catch (err) {

                    }
                })()

            },
            getTimehseetStats() {
                this.axios.get('/timesheets/list-statistics',
                    {
                        params: {
                            where: {
                                created_at: {
                                    between: [
                                        this.$moment(this.range.start).startOf("day").utc().toISOString(),
                                        this.$moment(this.range.end).endOf("day").utc().toISOString()
                                    ]
                                }
                            }
                        }
                    })
                    .then(res => {
                        if (res.data) {
                            this.stats.hours_worked = res.data.hours;
                        }
                    });
            },
            gotoAction(action) {
                switch (action) {
                    case 'send-schedule':
                        this.sendScheduleDialog = true
                        break;

                    case 'invite-teams':
                        break;

                    case 'print-schedule':
                        //this.$router.push({name: "print_team_schedule"})
                        window.open('/print/teams', '_blank', null, true)
                        break;

                    default :
                        break;
                }
            },
            loadTeams() {
                this.axios.get('/companies/current/teams',
                    {
                        params: {
                            filter: {
                                active: true
                            }
                        }
                    })
                    .then(res => {
                        this.teams = res.data
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this)
                    })
                    .finally(() => {

                    })
            },
        }
    };
</script>

<style lang="scss">
    @import "../../components/vuelendar/scss/vuelendar";

    .app-section {
        margin-top: 2px;

        &.dashboard {
            background: none;

            .db-icon-image {
                cursor: pointer;

                img {
                    width: 32px;
                    height: 32px;
                }
            }

            .team-assignment-div:not(:first-child) {
                //margin-left: -15px;
            }

            .el-table th,
            .el-table td {
                padding: 5px 0px;
                cursor: pointer;

                .cell {
                    white-space: nowrap;
                }
            }

            .team-assignments {
                .el-avatar {
                    border: 1px solid #333;
                    /*box-shadow: 1px 1px 1px #333;*/
                }

                .el-avatar + .el-avatar {
                    margin-left: -10px;
                }
            }

            .pagination-footer {
                position: absolute !important;
                padding: 0px;
                bottom: 6px;
                right: 20px;
                left: 20px;
                width: calc(100% - 50px);

                .cct {
                    width: 100% !important;
                }
            }

            .activities-list {
                margin-bottom: 10px;

                .activity-avatar {
                    margin-right: 10px;
                }

                .el-avatar {
                    float: left;
                    margin-right: 10px;
                }

                .activity-detail {
                    display: inline-block;
                    width: calc(100% - 50px);

                    p {
                        margin: 0;
                        font-size: 12px;
                        width: calc(100% - 20px);
                        line-height: 1.7
                    }
                }
            }

            .el-table th > .cell {
                position: relative;
                word-wrap: normal;
                text-overflow: ellipsis;
                display: inline-block;
                vertical-align: middle;
                width: 100%;
                -webkit-box-sizing: border-box;
                box-sizing: border-box;
                font-size: 10px !important;
            }

            .vuecal {
                height: 100%;
                overflow: hidden;
                box-shadow: none;
            }

            .el-table {
                .customer-avatar {
                    margin-right: 5px;
                }

                .customer-name, .customer-phone {
                    display: inline-block;
                    width: calc(100% - 41px);
                    white-space: nowrap;
                    font-size: 12px;
                    color: #333333;
                }

                .customer-phone {
                    text-decoration: underline;
                }

                .service-name {
                    font-weight: 600;
                    color: #333333;
                    font-size: 13px;
                    display: block;
                }

                .frequency {
                    font-size: 9px;
                }

                .teams-assigned {
                    font-weight: bold;
                    font-size: 13px;
                }

                small {
                    color: #333333;
                    font-size: 11px;
                    white-space: normal;
                }
            }

            h4 {
                margin: 0;
                font-weight: 600;

                img {
                    width: 18px;
                    margin-right: 10px;
                }

                svg {
                    width: 18px;
                    margin-right: 10px;
                }
            }

            .el-button.is-circle {
                border-radius: 50%;
                padding: 7px;
            }

            .el-card:not(.active-bookings-card) {
                margin-bottom: 5px;
                height: 450px;
            }

            .booking-list {
                width: 100%;
                list-style: none;
                margin-left: 0px;
                padding: 0px;

                li {
                    display: block;
                    width: 100%;
                    height: 70px;

                    span {
                        display: block;

                        &.customer {
                            font-weight: bold;
                        }

                        &.address {
                            font-size: 11px;
                        }
                    }

                    .el-avatar {
                        float: left;
                        margin-right: 10px;
                    }
                }
            }

            .el-card__body {
                padding: 15px;
                min-height: 400px;
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
        }
    }
</style>
