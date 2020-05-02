<template>
    <div class="app-section settings customer-dashboard">
        <el-row class="setting-row padding-2x" :gutter="10">
            <el-col :sm="6" :xs="12" :md="6">
                <h3>Welcome, {{ $auth.user().first_name }}!</h3>
            </el-col>
        </el-row>

        <el-card class="divider-3x box-shadow">
            <div class="flex-row">
                <h5 class="flex-row-center top-summary">
                    <img svg-inline src="@/assets/svgs/cus-dashboard/next-appointment.svg"/>
                    Next Appointment: {{ nextBooking }}
                </h5>
                <h5 class="flex-row-center top-summary">
                    <img svg-inline src="@/assets/svgs/cus-dashboard/team.svg"/>
                    Invitations: {{ invitations }}
                </h5>
                <h5 class="flex-row-center top-summary">
                    <img svg-inline src="@/assets/svgs/cus-dashboard/credit-balance.svg"/>
                    Average Rating:
                    <el-rate v-model="rating" disabled text-color="#ff9900"></el-rate>
                </h5>
                <h5 class="flex-row-center top-summary">
                    <img svg-inline src="@/assets/svgs/cus-dashboard/gift-card-balance.svg"/>
                    Total Hours: {{ Math.round(timesheetHours) }} hrs
                </h5>
            </div>
        </el-card>


        <el-row :gutter="10" class="setting-row padding-2x divider-3x box-shadow">

            <el-col :md="4" :sm="4" :xs="12" v-if="$can('manage', 'view_appointment')">
                <router-link :to="{name: 'team_workdiary'}">
                    <el-card class="flex-row-center text-center" shadow="hover">
                        <img src="@/assets/svgs/menu/workdiary.svg" svg-inline>
                        <h4>Work Diary</h4>
                        <p>View your active jobs including your checklist, check ins and other associated details.</p>
                    </el-card>
                </router-link>
            </el-col>

            <el-col :md="4" :sm="4" :xs="12" v-if="$can('manage', 'view_appointment')">
                <router-link :to="{name: 'team_bookings_list'}">
                    <el-card class="flex-row-center text-center" shadow="hover">
                        <img src="@/assets/svgs/dashboard/active.svg" svg-inline>
                        <h4>Bookings</h4>
                        <p>View your active jobs including your checklist, check ins and other associated details.</p>
                    </el-card>
                </router-link>
            </el-col>

            <el-col :md="4" :sm="4" :xs="12" v-if="$can('manage', 'view_appointment')">
                <router-link :to="{name: 'team_timelogs'}">
                    <el-card class="flex-row-center text-center" shadow="always">
                        <img src="@/assets/svgs/menu/timelogs.svg" svg-inline/>
                        <h4>Time Logs</h4>
                        <p>View all the time you have logged on your appointments</p>
                    </el-card>
                </router-link>
            </el-col>

            <el-col :md="4" :sm="4" :xs="12" v-if="$can('manage', 'view_appointment')">
                <router-link :to="{ name: 'team_messages' }">
                    <el-card class="flex-row-center text-center" shadow="always">
                        <img src="@/assets/svgs/dashboard/text-message.svg" svg-inline/>
                        <h4>Messages</h4>
                        <p>View and send messages between team members</p>
                    </el-card>
                </router-link>
            </el-col>
        </el-row>

        <el-row :gutter="10" class="setting-row padding-2x divider-3x box-shadow">
            <el-col :md="4" :sm="4" :xs="12">
                <router-link :to="{name: 'team_invitation'}">
                    <el-card class="flex-row-center text-center" shadow="always">
                        <img src="@/assets/svgs/dashboard/people.svg" svg-inline/>
                        <h4>Invitations</h4>
                        <p>View, accept and manage your job invitations</p>
                    </el-card>
                </router-link>
            </el-col>

            <el-col :md="4" :sm="4" :xs="12">
                <router-link :to="{name: 'team_availability'}">
                    <el-card disabled class="flex-row-center text-center" shadow="always">
                        <img src="@/assets/svgs/dashboard/checklist.svg" svg-inline/>
                        <h4>Availability</h4>
                        <p>Set and manage your availability including shift availability and days requested off</p>
                    </el-card>
                </router-link>
            </el-col>

            <el-col :md="4" :sm="4" :xs="12">
                <router-link :to="{ name: 'team_profile' }">
                    <el-card class="flex-row-center text-center" shadow="always">
                        <img src="@/assets/svgs/settings/Profile.svg" svg-inline/>
                        <h4>Account</h4>
                        <p>Update and change your account information</p>
                    </el-card>
                </router-link>
            </el-col>

        </el-row>


    </div>
</template>

<script>
    export default {
        components: {},

        data: () => {
            return {
                rating: 4,
                schedule: [],
                teams: [],
                invitations: '0',
                timesheetHours: 0
            };
        },

        computed: {
            nextBooking() {
                if (this.schedule.length > 0) {
                    return this.$moment(this.schedule[0].date).format(this.$date_format + ' ' + this.$time_format);
                } else {
                    return 'None';
                }
            }
        },

        created() {
            this.checkTeamOnboarding();
            this.loadSchedules();
            this.loadTeams();
            this.loadTimesheetHours();
        },

        methods: {
            checkTeamOnboarding() {
                this.axios.get("/accounts/me", {
                    params: {
                        filter: {
                            include: "business"
                        }
                    },
                })
                    .then(res => {
                        if (res.data && !res.data.team_onboarding &&
                            !res.data.business.settings.booking.schedule_availability_mode.staff_only) {
                            // redirect to signup availability
                            this.$router.push({name: 'team_signup_availability'});
                        }
                    });
            },
            loadSchedules() {
                let startDate = this.$moment().startOf("day").toISOString();
                let endDate = this.$moment().endOf("month").toISOString();

                this.axios.get("/bookings/schedule", {
                    params: {
                        from: startDate,
                        to: endDate,
                        type: 'stats',
                        forecasted: true
                    }
                })
                    .then(res => {
                        this.schedule = res.data;
                    });
            },
            loadTeams() {
                this.axios.get('/teams/my-teams/' + this.$auth.user().id)
                    .then(res => {
                        this.teams = res.data;
                        this.loadInvitationsCount();
                    })
            },
            loadInvitationsCount() {
                this.axios.get('/companies/current/booking_invitations/count',
                    {params: {where: {teamId: {inq: this.teams.map((i) => i.id)}}}})
                    .then(res => {
                        if (res.data) {
                            this.invitations = res.data.count;
                        }
                    })
            },
            loadTimesheetHours() {
                this.axios.get('/timesheets/total-hours', {params: {where: {accountId: this.$auth.user().id}}})
                    .then(res => {
                        if (res.data) {
                            this.timesheetHours = res.data.hours;
                        }
                    })
            }
        }
    };
</script>

<style lang="scss">
    .top-summary svg {
        width: 16px;
        height: 16px;
        margin-right: 10px;
    }

    .app-section.dashboard.customer-dashboard .el-card__body {
        min-height: 180px;
    }

    .customer-dashboard-row svg {
        width: 40px;
        height: 40px;
    }

    .customer-dashboard {
        background:#fff!important;

        .td-one-line-card {
            .el-card__body {

            }
        }

        .setting-row .el-card__body img {
            /* width: 50px; */
            margin: 0 auto;
            height: 25px;
        }
    }
</style>
