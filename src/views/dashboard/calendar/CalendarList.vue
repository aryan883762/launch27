<template>
    <div>

        <el-card style="border:none; margin-bottom: 5px;">
            <el-row>
                <el-col class="">
                    <div class="pull-left main-filters">
                        <el-date-picker :format="dt_format" @change="dateChanged" end-placeholder="End date" range-separator="to" size="small" start-placeholder="Start date" type="daterange" v-model="range"/>
                    </div>

                    <div class="pull-right main-filters">

                        <el-select @change="loadSchedule()" class="small filter"
                                   style="margin-right: 5px;" v-model="bookings_filter">
                            <el-option label="Active Bookings" value="active"></el-option>
                            <el-option label="Recurring Bookings" value="recurring"></el-option>
                            <el-option label="Completed Bookings" value="completed"></el-option>
                            <el-option label="Cancelled Bookings" value="cancelled"></el-option>
                        </el-select>

                        <team-select v-model="filter_team" :multiple="true" style="margin-right:10px;" additional-class="filter small" v-if="$can('manage', 'role_admin')"
                                     :collapse-tags="true" @change="loadSchedule" :show-add-teams="false"></team-select>

                        <el-select class="filter small" v-if="selectedLocation" v-model="selectedLocation" value-key="id" @change="loadSchedule()">
                            <el-option :key="location.name" :label="location.name" :value="location" v-for="location in $auth.user().company.locations"/>
                        </el-select>
                    </div>
                </el-col>
            </el-row>
        </el-card>

        <div style="padding: 5px;" class="calendar-section-list bg-white">
            <el-scrollbar view-class="calendar-section-list" :native="false" :style="{maxHeight: (windowHeight - 250) + 'px', height: (windowHeight - 250) + 'px', overflow: 'hidden'}">

                <el-timeline v-loading="b_loading">
                    <el-timeline-item style="margin-left: 5px" :class="{forecasted: booking.forecasted}" :key="index" :timestamp="$moment(booking.service_date).format($date_format + ' ' + $time_format)" placement="top" v-for="(booking, index) in schedule" v-if="booking.charge">
                        <div class="charge-headline" v-if="!booking.forecasted && booking.charge">

                            <template v-if="$can('manage', 'role_admin') || $can('manage', 'role_customer')">
                                <i class="paid" v-if="booking.charge.total_payments >= booking.charge.total_before_tax">Paid</i>
                                <i class="unpaid" v-if="booking.charge.total_payments < booking.charge.total_before_tax">Unpaid</i>
                            </template>

                            <el-divider class="divider-mini" direction="vertical" v-if="booking.forecasted"/>
                            <i class="forecasted" v-if="booking.forecasted">Forecasted recurring - {{ booking.frequency.name }}</i>
                        </div>
                        <div class="charge-headline" v-if="booking.forecasted">
                            <i class="forecasted" v-if="booking.forecasted">Forecasted recurring - {{ booking.frequency.name }}</i>
                        </div>
                        <el-card :body-style="{padding: '15px'}" :class="{forecasted: booking.forecasted}" class="charge-card" shadow="hover" style="width:calc(100% - 50px); display:inline-block;" v-if="booking.charge">
                            <div class="flex-row">
                                <div>
                                    <label style="font-weight: 600;">{{ booking.account.first_name }} {{ booking.account.last_name }}</label>
                                    <small style="">{{ booking.address.street }} {{ booking.address.city }} {{ booking.address.state }} {{ booking.address.zip }}</small>
                                    <el-rate allow-half disabled style=" " v-if="booking.rating" v-model="booking.rating.rating"/>
                                    <el-rate disabled style=" " v-else></el-rate>
                                </div>

                                <div v-if="$can('manage', 'view_booking_totals')">
                                    <div v-if="booking.charge.card">
                                        <el-image :src="require(`@/assets/icons/cards/${booking.charge.card.cardType}.png`)" class="charge-item-card" fit="fit"/>
                                        <div class="charge-item-card-details">
                                            <small>**** **** **** {{ booking.charge.card.last4digits }}</small>
                                            <small>Expires: {{ booking.charge.card.expiryMonth }}/{{ booking.charge.card.expiryYear }}</small>
                                            <el-button size="mini" type="text" v-if="false">
                                                Default <i class="el-icon-caret-bottom"/>
                                            </el-button>
                                        </div>
                                    </div>
                                    <div v-else>
                                        {{ booking.payment_type }}
                                    </div>
                                </div>

                                <div>
                                    <small>Total time : {{ booking.duration | duration }}</small>
                                    <template v-if="$can('manage', 'view_booking_totals')">
                                        <small>Discount : {{ $currency }}{{ booking.charge.discounts }}</small>
                                        <small>Tax : {{ $currency }}{{ booking.charge.tax_amount }}</small>
                                    </template>
                                </div>

                                <div>
                                    <div v-if="!booking.team_assignments || booking.team_assignments.length == 0">
                                        <small>No Team Assigned</small>
                                        <el-button @click="assignTeam(booking)" size="mini" type="text" v-if="$can('manage', 'role_admin')">
                                            Assign a team
                                        </el-button>
                                    </div>
                                    <div v-if="booking.team_assignments && booking.team_assignments.length > 0">
                                        <account-avatar :account="booking.team_assignments[0].team" body-class="pull-left"></account-avatar>
                                        <el-popover
                                                placement="left"
                                                trigger="hover"
                                                width="200">
                                            <div class="team-popover-content">
                                                <div style="margin-bottom: 10px;" v-for="assignment in booking.team_assignments">
                                                    <account-avatar :account="assignment.team" body-class="pull-left"></account-avatar>
                                                    <div style="display:inline-block; width:calc(100% - 45px); margin-left: 10px;    min-width: 120px;">
                                                        <small>{{ assignment.team.name }} </small>
                                                        <small style="display:block;"><strong> ({{assignment.pay_rate_type == 'percent' ? assignment.pay_rate + '%' : $currency + assignment.pay_rate}})</strong></small>
                                                        <el-rate disabled v-model="assignment.team.rating"></el-rate>
                                                    </div>
                                                </div>
                                            </div>
                                            <div slot="reference" style="display:inline-block; width:calc(100% - 45px); margin-left: 10px;    min-width: 120px;">
                                                <div v-if="booking.team_assignments[0].team_model === 'team'">
                                                    <small>{{ booking.team_assignments[0].team.name }} <strong v-if="booking.team_assignments.length > 1"> (+{{booking.team_assignments.length - 1}}) </strong></small>
                                                    <el-rate disabled v-model="booking.team_assignments[0].team.rating"></el-rate>
                                                    <small><strong> ({{booking.team_assignments[0].pay_rate_type == 'percent' ? booking.team_assignments[0].pay_rate + '%' : $currency + booking.team_assignments[0].pay_rate}}) {{ $currency }} {{ getEarned(booking) }}</strong></small>
                                                </div>
                                                <div v-if="booking.team_assignments[0].team_model === 'account'">
                                                    <small>{{ booking.team_assignments[0].team.name }} <i class="el-icon-people" v-if="booking.team_assignments.length > 1"> (+{{booking.team_assignments.length - 1}})</i></small>
                                                    <el-rate disabled v-model="booking.team_assignments[0].team.rating"></el-rate>
                                                    <small><strong>({{booking.team_assignments[0].pay_rate_type == 'percent' ? booking.team_assignments[0].pay_rate + '%' : $currency + booking.team_assignments[0].pay_rate}}) {{ $currency }} {{ getEarned(booking) }}</strong></small>
                                                </div>
                                            </div>
                                        </el-popover>
                                    </div>
                                </div>

                                <div v-if="$can('manage', 'view_booking_totals')">
                                    <label style="font-size:12px;font-width: 600;">Total Amount</label>
                                    <small><strong style="font-size:16px;font-weight: 600;">{{ $currency }}{{ booking.charge.total_after_tax }}</strong></small>

                                </div>

                            </div>
                        </el-card>
                        <div @click="showDetail(booking)" class="action-btn" style="display: inline-block">
                            <i class="el-icon-arrow-right"> </i>
                        </div>
                    </el-timeline-item>
                </el-timeline>


                <no-data :show.sync="schedule.length === 0 && !b_loading"></no-data>

            </el-scrollbar>

        </div>

        <el-row>
            <el-col class="pagination-footer">
                <div class="cct">
                    <el-pagination :current-page.sync="current_page" :page-size="page_size" :total="total_records" @current-change="loadSchedule" background layout="total, prev, pager, next"/>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import {VclTable} from 'vue-content-loading'
    import CalendarMenu from './CalendarMenu'
    import AccountAvatar from "../../../components/AccountAvatar";
    import NoData from "../../../components/NoData";
    import TeamSelect from "../../../components/TeamSelect";

    export default {
        components: {
            TeamSelect,
            NoData,
            AccountAvatar,
            VclTable,
            CalendarMenu
        },
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
                filter_team: [],
                selectedLocation: 'all',
                checkAll: false,
                checkedCharges: [],
                isIndeterminate: false,
                filter_charge_status: '',
                dt_format: '',
                bookings_filter: 'active',
                booking_stats: {
                    revenue: 0,
                    hours: 0,
                    bookings: 0
                }
            }
        },

        computed: {

            calendar_date() {
                return this.$moment(this.date_range[0]).format(this.$date_format) + ' - ' + this.$moment(this.date_range[1]).format(this.$date_format)
            },

            total_availability() {
                let total = 0;

                return total
            }
        },

        created() {
            this.$root.$on('calendar:range:update', this.dateChanged)

            this.selectedLocation = this.$auth.user().company.locations[0]

            if (this.$route.query.from && this.$route.query.to) {
                this.dateChanged([this.$route.query.from, this.$route.query.to])
            } else {
                this.range = [this.$moment().startOf('day').toISOString(),
                    this.$moment().endOf('day').toISOString()]
            }

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
            // this.getTeams()
            this.loadSchedule(this.current_page)
        },

        methods: {
            dateChanged(range) {
                this.range = range
                this.loadSchedule(this.current_page)

            },
            getEarned() {

            },
            loadSchedule() {

                //loading stats
                this.getStats()

                let start_date = this.$moment(this.range[0]).utc().toISOString()
                let end_date = this.$moment((this.range[1] || this.range[0])).utc().toISOString()

                let recurring = (this.bookings_filter === 'recurring')
                if (!this.$can('manage', 'role_admin')) {
                    recurring = false
                }

                this.b_loading = true
                let params = {
                    from: start_date,
                    to: end_date,
                    type: 'charges',
                    page: this.current_page,
                    recurring: recurring,
                    status: (this.bookings_filter === 'recurring') ? 'active' : this.bookings_filter,
                    exclude_original: false,
                    where: {locationId: this.selectedLocation.id}
                }

                if (this.filter_team.length > 0) {
                    params.targetType = 'all_teams';
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
                return;
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
            getStats() {
                (async () => {
                    try {
                        let where_query = {};


                        this.booking_stats.bookings = (await this.$root.$aggregate('bookings',
                            this.range[0],
                            this.range[1],
                            'count',
                            where_query)).count

                        this.booking_stats.revenue = (await this.$root.$aggregate('bookings',
                            this.range[0],
                            this.range[1],
                            'sum_revenue',
                            where_query)).sum

                        this.booking_stats.hours = (await this.$root.$aggregate('bookings',
                            this.date_range[0],
                            this.date_range[1],
                            'sum_hours',
                            where_query)).minutes


                    } catch (err) {

                    }
                })()
            },
        }
    }
</script>

<style lang="scss">
    .calendar-section-list {

        .el-timeline {
            padding: 0px;

            .el-timeline-item__tail {
                position: absolute;
                left: 4px;
                height: 100%;
                border-left: 1px dashed $launch-primary-color;
            }

            .el-timeline-item__node {
                background-color: $launch-primary-color;
            }

            .charge-card {
                box-shadow: none;
                border-right: none;
                border-top-right-radius: 0px;
                border-bottom-right-radius: 0px;

                small {
                    display: block;
                }

                &.forecasted {
                    //background: #f3f3f3;
                }

                &:hover {
                    -webkit-box-shadow: 0 7px 14px 0 rgba(60, 66, 87, 0.12), 0 3px 6px 0 rgba(0, 0, 0, 0.12);
                    box-shadow: 0 7px 14px 0 rgba(60, 66, 87, 0.12), 0 3px 6px 0 rgba(0, 0, 0, 0.12);
                }
            }

            .charge-headline {
                i {
                    font-style: normal;
                    font-size: 11px;
                    font-weight: bold;

                    &.paid {
                        color: green;
                    }

                    &.unpaid {
                        color: red;
                    }

                    &.forecasted {
                        color: brown;
                    }
                }
            }


            .el-timeline-item__content {
                position: relative;
            }

            .action-button {
                position: absolute;
                right: 40px;
                top: 10px;
            }

            .action-btn {
                position: absolute;
                width: 44px;
                background: #f3f3f3;
                line-height: 88px;
                text-align: center;
                font-size: 20px;
                font-weight: bold;
                border: 1px solid #f3f3f3;
                cursor: pointer;
                border-top-right-radius: 5px;
                border-bottom-right-radius: 5px;

                &:active {
                    background: gray;
                }
            }
        }

        .el-divider--vertical {
            display: inline-block;
            width: 1px;
            height: 4em;
            margin: 0 8px;
            vertical-align: middle;
            position: relative;

            &.divider-mini {
                height: 1em;
            }
        }

        .el-range-editor--small.el-input__inner {
            border-radius: 25px;
        }

        .el-range-separator {
            width: 20px;
            color: gray;
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

        .charge-item-card {
            width: 40px;
            float: left;
            margin-right: 5px;
        }

        .charge-item-card-details {
            width: calc(100% - 70px);
            display: inline-block;

            small {
                font-size: 9px;
            }

            .el-button {
                color: #333;
            }
        }

        .charge-item {
            span {
                display: block;
                font-size: 11px;
            }
        }

    }
</style>
