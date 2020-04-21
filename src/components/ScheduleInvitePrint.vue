<template>
    <div class="modal-body schedule-print-invite">
        <div style="border:none; margin-bottom: 5px;">
            <el-row>
                <el-col class="bg-white text-center">
                    <div class="pull-left main-filters">
                        <el-date-picker
                                @change="calendarChange"
                                end-placeholder="End date"
                                range-separator="to"
                                value-format="yyyy-MM-dd"
                                size="small" start-placeholder="Start date" type="daterange" v-model="range"
                        />
                    </div>

                    <div class="pull-right main-filters">
                        <team-select :show-add-teams="false" :collapse-tags="true" :multiple="true" :filterable="false" @change="loadBookings" v-model="filter_team"></team-select>
                    </div>
                </el-col>
            </el-row>

        </div>

        <el-divider></el-divider>

        <el-scrollbar view-class="view-box" :native="false" :style="{maxHeight: (windowHeight / 2) + 'px', height: (windowHeight / 2) + 'px', overflow: 'hidden'}">

            <el-table :data="active_bookings" stripe style="width: 100%" v-loading="loading"
                      @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column label="Service Date" prop="date">
                    <template slot-scope="scope">
                        <a @click="selectRow(scope.row)" href="javascript:" style="font-weight: 500;">{{$moment(scope.row.service_date).format($date_format)
                            }}</a>
                        <small style="display:block;">{{ $moment(scope.row.service_date).format($time_format) }}</small>
                        <small style="color:red;display:block;" v-if="scope.row.forecasted">forecasted</small>
                    </template>
                </el-table-column>
                <el-table-column label="Customer">
                    <template slot-scope="scope">
                        <account-avatar :account="scope.row.account" body-class="pull-left"></account-avatar>
                        <div style="margin-left: 10px; display:inline-block;">
                            <router-link
                                    :to="{name : 'dashboard_profile_appointments', params : {id : scope.row.account.id}}">
                                <label class="customer-name">{{ scope.row.account.first_name }} {{
                                    scope.row.account.last_name }}</label>
                                <small style="display:block;" v-if="scope.row.account.phone"><i class="el-icon-phone"></i>({{scope.row.account.phone}})</small>
                            </router-link>
                        </div>
                    </template>
                </el-table-column>

                <el-table-column label="Service Location" prop="location" width="200">
                    <template slot-scope="scope">
                        <a @click="selectRow(scope.row)" href="#" style="font-weight: 500;">
                            <label class="service-name" v-if="scope.row.service_details.length > 0">{{scope.row.service_details[0].name }}</label>
                            <small style="display:block;">{{ scope.row.address.street }} {{ scope.row.address.city }} {{ scope.row.address.state }} {{ scope.row.address.zip }} </small>
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
                        <div
                             v-if="scope.row.team_assignments && scope.row.team_assignments.length > 0">
                            <div v-for="assignment in scope.row.team_assignments">
                                <label v-for="member in assignment.team.members" v-if="assignment.team_model === 'team'">{{member.name}}</label>
                            </div>
                            <label v-for="assignment in scope.row.team_assignments" v-if="assignment.team_model === 'account'">{{assignment.team.name}}</label>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="Status" prop="status"></el-table-column>
            </el-table>
            <no-data :show.sync="active_bookings.length === 0 && !loading"></no-data>

        </el-scrollbar>

        <div class="cct">
            <el-pagination :current-page.sync="current_page" :page-size="page_size"
                           :total="total_records" @current-change="loadBookings()" background
                           layout="total, prev, pager, next"></el-pagination>
        </div>


        <el-row style="margin-top: 20px;">
            <el-col>
                <div class="pull-right">
                    <el-button plain size="mini" type="primary" round @click="printSchedule('team')"
                               :disabled="bookingIds.length === 0">Print for Teams
                    </el-button>
                    <el-button plain size="mini" type="primary" round @click="printSchedule('staff')"
                               :disabled="bookingIds.length === 0">Print for Staff
                    </el-button>
                    <el-divider direction="vertical"></el-divider>
                    <el-button plain size="mini" type="warning" round @click="emailSchedule('team')"
                               :disabled="bookingIds.length === 0 || sending_schedule_email">Email to Teams
                    </el-button>
                    <el-button plain size="mini" type="warning" round @click="emailSchedule('staff')"
                               :disabled="bookingIds.length === 0 || sending_schedule_email">Email to Staff
                    </el-button>
                </div>
            </el-col>
        </el-row>

        <print-schedule :booking-ids.sync="bookingIds" v-if="showPrintDialog" :mode="printMode"
                        @closed="showPrintDialog = false"></print-schedule>

    </div>
</template>


<script>
    import NoData from "./NoData";
    import AccountAvatar from "./AccountAvatar";
    import PrintSchedule from "../views/print/PrintSchedule";
    import TeamSelect from "./TeamSelect";

    export default {
        components: {TeamSelect, PrintSchedule, AccountAvatar, NoData},
        data() {
            return {
                range: [],
                filter_team: '',
                active_bookings: [],
                loading: false,
                teams: [],
                showPrintDialog: false,
                bookingIds: [],
                printMode: 'team',
                total_records: 0,
                page_size: 0,
                current_page: 1,
                sending_schedule_email: false

            }
        },
        created() {
            this.range = [this.$moment().startOf('day').format('YYYY-MM-DD'), this.$moment().startOf('day').format('YYYY-MM-DD')]
        },
        mounted() {
            this.loadBookings()
            this.loadTeams()
        },
        methods: {
            calendarChange(val) {
                this.loadBookings()
            },
            selectRow() {

            },
            loadBookings() {
                let params = {}
                if (this.filter_team.length === 0) {
                    params = {
                        from: this.$moment(this.range[0]).startOf('day').toISOString(),
                        to: this.$moment(this.range[1]).endOf('day').toISOString(),
                        type: "bookings",
                        forecasted: false,
                        status: 'active',
                        page: this.current_page
                    }
                } else {
                    params = {
                        from: this.$moment(this.range[0]).startOf('day').toISOString(),
                        to: this.$moment(this.range[1]).endOf('day').toISOString(),
                        type: "bookings",
                        forecasted: false,
                        status: 'active',
                        targetType: "team",
                        targetTypeId: this.filter_team,
                        page: this.current_page
                    }
                }


                this.loading = true;
                this.axios
                    .get("/bookings/schedule", {
                        params: params
                    })
                    .then(res => {

                        this.active_bookings = res.data.data;
                        this.total_records = res.data.meta.totalItemCount;
                        this.page_size = res.data.meta.itemsPerPage;

                    })
                    .catch()
                    .finally(_ => {
                        this.loading = false;
                    });
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
            handleSelectionChange(val) {
                this.bookingIds = []
                val.forEach((booking) => {
                    this.bookingIds.push(booking.id)
                })
            },
            printSchedule(mode) {
                //console.log
                //print_staff_schedule
                this.printMode = mode
                this.showPrintDialog = true
            },
            emailSchedule(mode) {
                this.sending_schedule_email = true;
                this.axios.post('/bookings/send_schedule',
                    {
                        bookingIds: this.bookingIds,
                        mode: mode
                    })
                    .then(res => {
                        this.$message.success("Emails has been queued for processing.")
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err)
                    })
                    .finally(() => {
                        this.sending_schedule_email = false;
                    })
            }
        }
    }
</script>