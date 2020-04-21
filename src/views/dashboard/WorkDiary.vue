<template>
    <div class="app-section workdiary">

        <el-card style="border:none; margin-bottom: 5px;">
            <el-row>
                <el-col class="bg-white text-center">
                    <div class="pull-left main-filters">
                        <el-date-picker :format="dt_format" @change="" end-placeholder="End date" range-separator="to" size="small" start-placeholder="Start date" type="daterange" v-model="range"/>
                    </div>

                    <div class="pull-right main-filters">

                        <company-locations @change="loadBookings(1)" additional-class="pull-right" :multiple="true" :return-object="false" v-model="filter_location"></company-locations>

                        <el-select @change="loadBookings()" class="small filter"
                                   style="margin-right: 5px;" v-model="bookings_filter">
                            <el-option label="Active Bookings" value="active"></el-option>
                            <el-option label="Recurring Bookings" value="recurring"></el-option>
                            <el-option label="Completed Bookings" value="completed"></el-option>
                            <el-option label="Cancelled Bookings" value="cancelled"></el-option>
                        </el-select>

                        <team-select v-model="filter_team" :multiple="true" style="margin-right:10px;" additional-class="filter small" v-if="$can('manage', 'role_admin') || $can('manage', 'role_team')" :collapse-tags="true" @change="loadBookings" :show-add-teams="false"></team-select>

                    </div>
                </el-col>
            </el-row>

        </el-card>

        <el-row :gutter="0">


            <el-col :md="6" :sm="6" class="full-height for-wd" style="background:white;    border-right: 1px solid #f3f3f3;">

                <!--          <el-tooltip placement="top" effect="dark">
                              <div slot="content">
                                  This is the status of your appointments in the time period below. <br/>
                                  Pending means your teams have not checked in yet, <br/>
                                  in progress means they are on their way or have started the appointment, <br/>
                                  completed means they have checked out of the appointment.
                              </div>
                              <el-row class="stats-row padding-2x ">
                                  <el-col :md="8" :sm="8" :xs="12" class="first">
                                      <span class="stats-number _first">{{ total_stats.pending }}</span>
                                      <label>Pending</label>
                                  </el-col>

                                  <el-col :md="8" :sm="8" :xs="12" class="second">
                                      <span class="stats-number _second">{{ total_stats.progress }}</span>
                                      <label>Progress</label>
                                  </el-col>

                                  <el-col :md="8" :sm="8" :xs="12" class="third">
                                      <span class="stats-number _third">{{ total_stats.completed }}</span>
                                      <label>Completed</label>
                                  </el-col>
                              </el-row>
                          </el-tooltip>-->

                <el-card shadow="never" style="box-shadow: none; border:none">
                    <el-row class="tracklist people-list-section">

                        <ul class="" v-loading="b_loading">
                            <el-scrollbar view-class="view-box" :native="false" :style="{maxHeight: (windowHeight - 290) + 'px', height: (windowHeight - 290) + 'px', overflow: 'hidden'}">

                                <li :class="{ active: selectedBooking && isSelected(booking) }"
                                    @click="selectBooking(booking)" v-for="(booking,index) in bookings">
                                    <el-avatar :size="32" :src="booking.account.avatar" class="customer-avatar"
                                               v-if="booking.account.avatar"></el-avatar>
                                    <avatar :size="32" :username="booking.account.fullname" class="customer-avatar"
                                            color="white" v-if="!booking.account.avatar"></avatar>

                                    <div class="booking-item">
                                        <span class="wd-name-a">{{ booking.account.fullname }}</span>
                                        <span class="wd-service-name-a">{{ getServiceNames(booking) }}</span>
                                        <span class="wd-service-date-a">{{ $moment(booking.service_date).format($date_format + " " + $time_format) }}</span>
                                        <span class="wd-service-address-a">{{ booking.address.full_address }}</span>
                                        <!-- <div class="teams-assigned" v-if="booking.team_assignment && booking.team_assignment.team.members.length > 0">
                                           <el-avatar :size="24" :src="member.avatar" v-for="(member, index) in booking.team_assignment.team.members" :key="index" v-if="member.avatar"></el-avatar>
                                         </div-->
                                        <span class="wd-status" style=""><el-tag effect="dark" size="mini" type="warning" v-if="false">{{ getStatus(booking) }}</el-tag></span>
                                        <span style="color:red;" v-if="booking.forecasted"><el-tag class="forecasted-tag" type="primary">forecasted</el-tag></span>
                                    </div>
                                </li>
                            </el-scrollbar>
                        </ul>
                    </el-row>
                </el-card>
            </el-col>

            <el-col :md="18" :sm="18">
                <el-scrollbar view-class="view-box" :native="false" :style="{maxHeight: (windowHeight - 110) + 'px', height: (windowHeight - 110) + 'px', overflow: 'hidden'}">
                    <router-view v-if="bookings.length >0"></router-view>
                    <no-data :show="bookings.length === 0"></no-data>
                </el-scrollbar>
            </el-col>


        </el-row>
        <el-row>
            <el-col class="pagination-footer">
                <div class="cct">
                    <el-pagination :current-page.sync="current_page" :page-size="page_size" :total="total_records"
                                   @current-change="loadBookings" background
                                   layout="total, prev, pager, next"></el-pagination>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import Mapbox from "mapbox-gl";
    import {MglMap, MglMarker} from "vue-mapbox";
    import Notes from "../../components/Notes";
    import AssignTeam from "../../components/AssignTeam";
    import AccountCards from "../../components/AccountCards";
    import BookingPhotos from "../../components/BookingPhotos";
    import Timesheet from "../../components/Timesheet";
    import {VclBulletList, VclFacebook} from 'vue-content-loading'
    import Avatar from 'vue-avatar'
    import NoData from "../../components/NoData";
    import CompanyLocations from "../../components/CompanyLocations";
    import TeamSelect from "../../components/TeamSelect";

    export default {
        components: {
            TeamSelect,
            CompanyLocations,
            NoData,
            MglMap,
            MglMarker,
            Notes,
            AssignTeam,
            AccountCards,
            BookingPhotos,
            Timesheet,
            VclBulletList,
            VclFacebook,
            Avatar
        },
        data: () => {
            return {
                filter: "",
                mapStyle: "mapbox://styles/mapbox/streets-v10",
                activeTab: "picture",
                secActiveTab: "notes",
                selectedBooking: false,
                rate_value: null,
                check_bx: true,
                accountId: false,
                bookingId: false,
                range: [],
                total_records: 0,
                page_size: 0,
                current_page: 0,
                bookings: [],
                b_loading: true,
                loading: true,
                assign_team_drawer: false,
                selected_card: "",
                show_charge_panel: false,
                partial_loading: false,
                total_time: 0,
                forecasted: false,
                total_stats: {pending: 0, progress: 0, completed: 0},
                dt_format: '',
                heightOffset: 150,
                filter_team: [],
                filter_location: [],
                bookings_filter: "active",
                team_filter: "",
            };
        },
        watch: {
            range(val) {
                this.loadBookings(1);
                this.loadBookingsStatistics();
            },
            '$route'(val) {
                if (!val.params.id) {
                    this.loadBookings(1);
                }
            },
        },
        computed: {
            workdiaryBookingRoute() {
                if (this.$can('manage', 'role_admin')) {
                    return 'dashboard_workdiary_booking';
                } else {
                    return 'team_workdiary_booking';
                }
            }
        },
        created() {
            this.dt_format = this.$helpers.toElFormat(this.$date_format)

            if (this.$route.params.service_date) {
                this.range = [
                    this.$moment(this.$route.params.service_date).format("YYYY-MM-DD"),
                    this.$moment(this.$route.params.service_date).format("YYYY-MM-DD")
                ];
            } else {
                this.range = [
                    this.$moment().format("YYYY-MM-DD"),
                    this.$moment().format("YYYY-MM-DD")
                ];
            }


            this.$events.addListener('workdiary:reload', this.loadBookingsStatistics)
            this.$events.addListener('workdiary:reload', this.loadBookings)

        },
        beforeDestroy() {
            this.$events.removeListener('workdiary:reload', this.loadBookingsStatistics)
            this.$events.removeListener('workdiary:reload', this.loadBookings)
        },
        mounted() {
            this.mapbox = Mapbox;

        },
        methods: {
            handleAssignTeamClose() {
                this.assign_team_drawer = false;
                this.loadBooking(this.selectedBooking.id, this.selectedBooking.index)
            },
            isSelected(booking) {
                if (this.selectedBooking.digest)
                    return this.selectedBooking.digest === booking.digest

                return this.selectedBooking.id === booking.id

            },
            selectBooking(booking) {
                this.selectedBooking = booking;
                this.$router.push({
                    name: this.workdiaryBookingRoute,
                    params: {id: booking.id, service_date: booking.service_date}
                })

                return;

                this.loading = true;
                this.axios
                    .get("/bookings/" + booking_id, {
                        params: {
                            filter: {
                                include: [
                                    'account',
                                    'frequency',
                                    'address',
                                    {"service_details": "pricing_variables"},
                                    'charge',
                                    "workdiary",
                                    {"assigned_checklists": "tasks"},
                                    {"team_assignments": "team"}
                                ]
                            }
                        }
                    })
                    .then(res => {
                        this.selectedBooking = res.data;
                        this.selectedBooking.digest = digest;
                        this.selectedBooking.service_date = service_date;
                        this.selectedBooking.forecasted = forecasted;
                        this.selectedBooking.index = index
                    })
                    .catch(err => {
                    })
                    .finally(_ => {
                        this.loading = false;
                    });
            },

            getStatus(booking) {
                return ""

                if (booking.workdiary) {
                    switch (booking.workdiary) {
                        case 0:
                            return "Pending";
                            break;

                        case 1:
                            return "Onway";
                            break;

                        case 2:
                            return "Checked In";
                            break;

                        case 3:
                            return "Checked Out";
                            break;

                        default:
                            break;
                    }
                }

                return "Pending";
            },

            getBookingCoordinates() {
                if (this.selectedBooking) return [this.selectedBooking.address.coordinates.lng, this.selectedBooking.address.coordinates.lat];

                return [0, 0];
            },
            getMapBoxAccessToken() {
                return process.env.VUE_APP_MAPBOX_TOKEN;
            },

            loadBookings(current_page) {
                this.selectedBooking = false;
                console.log('loading bookings')

                if (!current_page) current_page = this.current_page;

                let start_date = this.$moment.utc(this.range[0]).startOf('day').format('YYYY-MM-DDTHH:mm')
                let end_date = this.$moment.utc(this.range[1] || this.range[0]).endOf('day').format('YYYY-MM-DDTHH:mm')
                let params = {
                    from: start_date,
                    to: end_date,
                    type: 'bookings',
                    page: this.current_page,
                    recurring: (this.bookings_filter === 'recurring'),
                    status: (this.bookings_filter === 'recurring') ? 'active' : this.bookings_filter,
                };

                if (this.filter_location.length > 0) {
                    if (!params.where) params.where = {}
                    params.where.locationId = {inq: this.filter_location};
                }

                if (this.filter_team.length > 0) {
                    params.targetType = 'all_teams';
                    params.targetTypeId = this.filter_team;
                }


                this.b_loading = true;
                this.loading = true;
                this.axios
                    .get("/bookings/schedule", {
                        params: params
                    })
                    .then(res => {
                        this.bookings = res.data.data;
                        if (this.bookings.length > 0) {
                            this.selectedBooking = this.bookings[0];
                            this.$router.push({
                                name: this.workdiaryBookingRoute,
                                params: {id: this.selectedBooking.id, service_date: this.selectedBooking.service_date}
                            })
                        } else {
                            this.selectedBooking = false
                            this.$router.push({"path": "/dashboard/workdiary"})
                        }

                        this.total_records = res.data.meta.totalItemCount;
                        this.page_size = res.data.meta.itemsPerPage;
                    })
                    .catch((err) => {

                    })
                    .finally(_ => {
                        this.b_loading = false;
                        this.loading = false;
                    });
            },
            getServiceNames(booking) {
                let services = "";
                booking.service_details.forEach(srv => {
                    if (services == "") return (services += srv.name);
                    else return (services += "; " + srv.name);
                });

                return services;
            },

            handleDropDown(command) {
                if (command == 1) {
                    this.assign_team_drawer = true;
                }

                if (command == 2) {
                    this.show_charge_panel = true;
                }
            },

            loadBooking(booking_id, index) {

                this.axios
                    .get("/bookings/" + booking_id, {
                        params: {
                            filter: {
                                include: [
                                    'account',
                                    'frequency',
                                    'address',
                                    {"service_details": "pricing_variables"},
                                    'charge',
                                    "workdiary",
                                    {"assigned_checklists": "tasks"},
                                    {"team_assignments": "team"}
                                ]
                            }
                        }
                    })
                    .then(res => {
                        this.selectedBooking = res.data;
                        this.selectedBooking.digest = res.data.id;

                        if (index)
                            this.selectedBooking.index = index

                        //pdate
                        this.bookings.splice(index, 1, this.selectedBooking)
                    })
                    .catch(err => {
                    })
                    .finally(_ => {
                        this.partial_loading = false;
                    });
            },

            confirmForecastedBooking(booking) {
                this.$confirm('Are sure you want to confirm this booking?', 'Confirm Forecasted Booking')
                    .then(() => {

                        this.partial_loading = true;
                        this.axios.post('/bookings/' + booking.id + '/forecasted/confirm', {service_date: booking.service_date})
                            .then(res => {
                                this.loadBooking(res.data.id)
                                this.$helpers.successHandle('Booking confirmed', this)
                            })
                            .catch(err => {
                                this.partial_loading = true;
                            })
                            .then()
                    })

            },

            loadBookingsStatistics() {
                (async () => {
                    try {
                        this.total_stats.pending = (await this.$root.$aggregate('bookings',
                            this.range[0],
                            this.range[1] || this.range[0],
                            'count',
                            {status: 'active', 'job_status': 'pending'})).count

                        this.total_stats.completed = (await this.$root.$aggregate('bookings',
                            this.range[0],
                            this.range[1] || this.range[0],
                            'count',
                            {status: 'completed'})).count

                        this.total_stats.progress = (await this.$root.$aggregate('bookings',
                            this.range[0],
                            this.range[1] || this.range[0],
                            'count',
                            {status: 'active', 'job_status': 'progress'})).count

                    } catch (err) {

                    }
                })()

            }
        }
    };
</script>

<style lang="scss">
    .app-section.workdiary {

        margin-bottom: 0px;
        height: auto;

        &.is_embedded {
            .main-view-container {
                box-shadow: none;
                border: 0;
            }
        }

        .account-avatar {
            position: relative;
            float: left;

            &.active {
                i {
                    position: absolute;
                    bottom: -32px;
                    left: calc(1%);
                    font-size: 31px;
                    color: #c0c0c0;
                }
            }
        }

        .first-wd-tab {
            padding: 20px;

            .wd-tab-checklist {
                .wd-tab-checklist-title {
                    margin: 0 auto;
                }

                ul {
                    padding: 0px;
                    display: block;
                    cursor: pointer;
                    margin: 0 auto;
                    overflow-y: scroll;

                    li {
                        overflow: hidden;
                        margin-bottom: 10px;

                        .check-main {
                            margin-bottom: 10px;

                            .el-checkbox {
                                .el-checkbox__label {
                                    color: black;
                                }
                            }
                        }

                        .check-sub {
                            .sub-title {
                                padding-left: 20px;
                            }

                            .sub-check {
                                .el-checkbox {
                                    margin-bottom: 8px;
                                }
                            }
                        }
                    }
                }
            }

            .wd-tab-notes {
            }
        }

        .forecasted-tag {
            padding: 2px;
            line-height: 1;
            height: auto;
            width: 72px;
        }

        .el-card__body {
            overflow: hidden;
        }

        .progress-tail {
            top: 22px;
        }

        .progress-map {
            width: calc(100%);
            height: 250px;

            .el-card__body {
                height: 100%;
                padding: 0px;
            }
        }

        .track-progress {
            padding: 0px;
            height: 250px;
            position: relative;
            background: white;

            .actions-box {
                margin-bottom: 30px;
                margin-left: 20px;
                margin-top: 20px;
            }

            .timer {
                background: $launch-primary-color;
                color: white;
                font-size: 18px;
                padding: 10px 10px;


                position: absolute;
                right: 0px;
                left: 0px;
                bottom: 0px;
            }

            label {
                text-transform: uppercase;
                text-align: center;
                font-size: 10px;
                margin: 0 auto 20px;
                display: block;
            }

            .flex-row-center {
                span {
                    width: 48px;
                    height: 48px;
                    background: silver;
                    border-radius: 50%;
                    display: block;
                    line-height: 48px;
                    text-align: center;
                    font-size: 18px;
                    font-weight: bold;
                    margin: 0 auto;
                    color: white;
                }

                .el-col {
                    text-align: center;

                    span {
                        &.clickable {
                            cursor: pointer;

                            i {
                                font-style: normal;
                            }


                            &:hover {
                                background: $launch-brand-color !important;
                            }
                        }
                    }


                    &.inprogress {
                        span {
                            background: $launch-primary-color;
                        }
                    }

                    &.active {
                        span {
                            background: green;
                        }
                    }
                }
            }
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

        .border-left {
            box-shadow: -2px 0px 5px 1px #eeeeee;
        }


        .el-tab-pane {
            min-height: 500px;
        }

        .tracklist {
            .teams-assigned {
                height: 30px;

                .el-avatar {
                    float: left;
                    border: 2px solid #f3f3f3;
                }

                .el-avatar + .el-avatar {
                    margin-left: -10px;
                }
            }
        }

        .initials {
            width: 40px;
            height: 40px;
            background: gray;
            border-radius: 50%;
            display: block;
            line-height: 42px;
            text-align: center;
            font-size: 12px;
            font-weight: bold;
            color: white;
        }

        .for-wd {
            .el-card__body {
                padding: 0;

                .shade-padding {
                    padding: 20px;

                    .search-people {
                        input {
                            border-radius: 50px;
                        }
                    }
                }
            }
        }

        .people-list-section {
            ul {
                padding: 0px;
                display: block;
                cursor: pointer;
                margin-top: 0;

                li {
                    display: block;
                    padding: 10px 5px;
                    box-sizing: border-box;
                    border-left: 4px solid white;
                    overflow: hidden;

                    .booking-item {
                        width: calc(100% - 50px);
                        display: inline-block;
                        position: relative;


                        span {
                            display: block;
                        }

                        .wd-status {
                            position: absolute;
                            right: 0px;
                            top: 5px;

                            .el-tag {
                                padding: 2px 5px;
                                line-height: 1;
                                height: auto;

                                font-size: 9px;
                            }
                        }
                    }

                    /* .wd-name-a {
                         color: #aaacb9;
                         font-size: 10px;
                         line-height: 1;
                       }*/

                    .customer-avatar {
                        float: left;
                        margin-right: 5px;
                        border: 1px solid white;
                    }

                    .wd-service-name-a {
                        font-size: 12px;
                        color: #333;
                        font-weight: 600;
                    }

                    .wd-service-date-a {
                        font-size: 12px;
                        color: #a6adb3;
                    }

                    .wd-service-address-a {
                        margin: 0;
                        font-size: 12px;
                        color: #a6adb3;
                    }

                    /* .wd-service-status {
                      margin-top: 15px;
                    }*/

                    .wd-service-status-a-p {
                        color: white;
                        background-color: #2eb7fc;
                        border-radius: 50px;
                        padding: 2px 10px;
                        font-size: 10px;
                    }

                    .wd-service-status-a-i {
                        color: white;
                        background-color: #fda929;
                        border-radius: 50px;
                        padding: 2px 10px;
                        font-size: 10px;
                    }

                    .wd-service-status-a-g {
                        color: white;
                        background-color: #30dc2f;
                        border-radius: 50px;
                        padding: 2px 10px;
                        font-size: 10px;
                    }

                    .profile-avatar-stack {
                        border-radius: 50%;
                        border: 1px solid white;
                    }

                    .profile-avatar-stack:not(:first-child) {
                        margin-left: -10px;
                    }

                    &.active {
                        border-left: 4px solid $launch-primary-color;
                        background: $launch-dashboard-bg-color;
                    }
                }
            }
        }

        .wd-details-header {
            .el-card__body {
                overflow: hidden;
            }

            .account-avatar + .account-avatar {
                margin-left: -10px;
            }

            .profile-avatar {
                border-radius: 50%;
                border: 1px solid white;
            }

            .wd-details-service-name {
                margin: 0;
                color: black;
                font-size: 13px;
                line-height: 1.5;
            }

            .wd-details-date-address {
                font-size: 13px;
                margin: 0;
                padding-left: 0px;
                line-height: 1.5;
            }

            .wd-details-date-time {
                font-size: 13px;
                color: black;
                margin: 0;
                padding-left: 0px;
                line-height: 1.5;
            }

            .wd-details-cost {
                color: #fb6f6b;
                font-weight: bold;
                font-size: 12px;
                margin: 0;
            }

            .wd-details-rating {
                font-size: 10px;
                font-weight: bold;

                span.holder {
                    display: inline-block;
                    margin-right: 10px;
                }
            }
        }

        .wd-activity-list {
            padding: 0px;
            display: block;
            cursor: pointer;
            /*margin-top: 0;*/
            max-height: 900px;
            overflow-y: scroll;
            margin: 0 auto;

            li {
                display: block;
                box-sizing: border-box;
                border-left: 4px solid white;
                overflow: hidden;
                margin: 15px 0;

                .wd-activity-name,
                .wd-activity-date {
                    margin: 0;
                    line-height: 1.4;
                    font-size: 14px;

                    strong {
                        color: black;
                        font-weight: normal;
                    }
                }
            }
        }
    }
</style>
