<template>
    <div :class="{is_embedded: this.$route.name !== 'dashboard_booking_workdiary' && this.$route.name !== 'team_bookings_workdiary'}"
         class="app-section workdiary">

        <el-row :gutter="0" v-loading="loading">
            <el-col>

                <div style="background:white; padding: 10px;    border-bottom: 1px solid #f4f8f9;">

                    <el-row class="wd-details-header" v-if="selectedBooking">
                        <el-col :md="12" :sm="12">
                            <el-tooltip placement="top" effect="dark">
                                <div slot="content">
                                    Click the different teams to see progress and time logs for each team.
                                </div>


                                <account-avatar :account="member" :class="{'active' : selected_member.id == member.id}"
                                                :show_caret="selected_member.id == member.id" :size="32"
                                                @click.native="selectTeam(member)" style="cursor: pointer"
                                                v-for="member in assignment_members" :key="member.id">
                                </account-avatar>

                                <div style="width: calc(100% - 200px); display: inline-block; margin-left: 20px;">
                                    <p class="wd-details-date-address"><strong>{{selectedBooking.account.fullname}}</strong>
                                    </p>
                                    <p class="wd-details-service-name">{{ getServiceNames(selectedBooking) }}</p>
                                    <p class="wd-details-date-address">{{ selectedBooking.address.full_address }}</p>
                                </div>
                            </el-tooltip>
                        </el-col>
                        <el-col :md="12" :sm="12" class="flex-row-reverse" v-if="!selectedBooking.forecasted">
                            <div v-if="selected_member">
                                    <span>Rating<el-rate allow-half disabled
                                                         v-model="selected_member.rating"></el-rate></span>
                            </div>
                        </el-col>
                    </el-row>
                </div>

            </el-col>

            <el-col>

                <el-row>
                    <el-col :md="isValidCoordinates() ? 12 : 24" :sm="isValidCoordinates() ? 12 : 24" class="track-progress">
                        <div class="actions-box">
                            <el-tooltip placement="top" effect="dark">
                                <div slot="content">
                                    Approve, Lock and Archive your teams’ time sheet.
                                </div>
                                <span>
                                            <el-link :disabled="!selected_timesheet.id || !$can('manage', 'role_admin')"
                                                     @click="updateTimeSheet('approved', true)" size="mini" type="success"
                                                     v-if="!selected_timesheet.approved">Approve
                                            </el-link>
                                            <el-link :disabled="!selected_timesheet.id || !$can('manage', 'role_admin')"
                                                     @click="updateTimeSheet('approved', false)" size="mini" type="danger"
                                                     v-if="selected_timesheet.approved">Un-approve
                                            </el-link>
                                            <el-divider direction="vertical"></el-divider>
                                            <el-link :disabled="!selected_timesheet.id || !$can('manage', 'role_admin')" @click="updateTimeSheet('locked', true)"
                                                     size="mini" type="danger" v-if="!selected_timesheet.locked">Lock
                                            </el-link>
                                            <el-link :disabled="!selected_timesheet.id || !$can('manage', 'role_admin')"
                                                     @click="updateTimeSheet('locked', false)" size="mini" type="success"
                                                     v-if="selected_timesheet.locked">Unlock
                                            </el-link>
                                            <el-divider direction="vertical"></el-divider>
                                            <el-link :disabled="!selected_timesheet.id || !$can('manage', 'role_admin')"
                                                     @click="updateTimeSheet('archived_at',$moment().utc().toISOString())"
                                                     size="mini" v-if="!selected_timesheet.archived_at">Archive
                                            </el-link>
                                            <el-link :disabled="!selected_timesheet.id"
                                                     @click="updateTimeSheet('archived_at',null) || !$can('manage', 'role_admin')" size="mini" type="warning"
                                                     v-if="selected_timesheet.archived_at">Un-Archive
                                            </el-link> <i class="el-icon-info" style="margin-left:5px;"></i>
                                        </span>
                            </el-tooltip>
                        </div>

                        <el-tooltip placement="top" effect="dark">
                            <div slot="content">
                                Manually adjust your team’s times by clicking on the circles below.<br/>
                                To change the time, click their avatar above.
                            </div>
                            <el-row :gutter="20" class="flex-row-center">
                                <el-col :class="{'active': selected_timesheet.onway}" :md="6" :sm="6"
                                        class="appointment">
                                    <label>Appointment</label>
                                    <span>
                                                <i v-if="!selected_timesheet.onway">1</i>
                                                <i class="el-icon-check" v-if="selected_timesheet.onway"></i>
                                            </span>
                                </el-col>

                                <el-image :src="require(`@/assets/svgs/wd-pending.svg`)" class="progress-tail"
                                          fit="fit"></el-image>

                                <el-col :class="{'active': selected_timesheet.checkin, 'inprogress': selected_timesheet.onway}"
                                        :md="6" :sm="6" class="onway">
                                    <label>On Way</label>
                                    <span @click="updateTimesheetStatus('onway')" :class="{'clickable':  $can('manage', 'role_admin')}">
                                                <i v-if="!selected_timesheet.checkin">2</i>
                                                <i class="el-icon-check" v-if="selected_timesheet.checkin"></i>
                                            </span>
                                </el-col>

                                <el-image :src="require(`@/assets/svgs/wd-pending.svg`)" class="progress-tail"
                                          fit="fit"></el-image>

                                <el-col :class="{'active': selected_timesheet.checkout, 'inprogress': selected_timesheet.checkin}"
                                        :md="6" :sm="6" class="working">
                                    <label>Working</label>
                                    <span @click="updateTimesheetStatus('checkin')" :class="{'clickable':  $can('manage', 'role_admin')}">
                                                <i v-if="!selected_timesheet.checkout">3</i>
                                                <i class="el-icon-check" v-if="selected_timesheet.checkout"></i>
                                            </span>
                                </el-col>

                                <el-image :src="require(`@/assets/svgs/wd-pending.svg`)" class="progress-tail"
                                          fit="fit"></el-image>

                                <el-col :class="{'active': selected_timesheet.checkout}" :md="6" :sm="6"
                                        class="complete">
                                    <label>Checkout</label>
                                    <span @click="updateTimesheetStatus('checkout')" :class="{'clickable':  $can('manage', 'role_admin')}">
                                                <i v-if="!selected_timesheet.checkout">4</i>
                                                <i class="el-icon-check" v-if="selected_timesheet.checkout"></i>
                                            </span>
                                </el-col>
                            </el-row>
                        </el-tooltip>
                        <el-row class="timer flex-row">
                            <el-col :md="12" :sm="12">
                                Team Time: {{total_time | duration}}
                            </el-col>
                            <el-col :md="12" :sm="12">
                                Booking total: {{ total_booking_time | duration}}
                            </el-col>
                        </el-row>
                    </el-col>

                    <el-col :md="12" :sm="12" class="" v-show="isValidCoordinates()">
                        <el-row>
                            <el-card :body-class="{padding: '0px'}" shadow="always" class="progress-map">
                                <MglMap :access-token="getMapBoxAccessToken()" :center="getBookingCoordinates()"
                                        :map-style.sync="mapStyle" :zoom="12">
                                    <MglMarker :coordinates="getBookingCoordinates()"
                                               :draggable="false"></MglMarker>
                                </MglMap>
                            </el-card>
                        </el-row>
                    </el-col>
                </el-row>


            </el-col>

            <el-col class="full-height">
                <el-row v-loading="loading || partial_loading">
                    <booking-view :selected-booking.sync="selectedBooking" v-if="selectedBooking"></booking-view>
                </el-row>
            </el-col>

            <el-col class="pagination-footer">
                <div class="cct">
                    <el-pagination :current-page.sync="current_page" :page-size="page_size" :total="total_records"
                                   @current-change="loadBookings" background
                                   layout="total, prev, pager, next"></el-pagination>
                </div>
            </el-col>
        </el-row>

        <no-data :show="!selectedBooking"></no-data>

        <el-dialog :title="'Timesheet: ' + selected_member.name" :visible.sync="updateDialog" append-to-body
                   v-loading="timesheet_loading" width="30%">
            <div class="modal-body">

                <el-form label-position="top">
                    <el-form-item label="Action">
                        <el-radio-group size="mini" v-model="dialog_data.status">
                            <el-radio-button label="onway">Onway</el-radio-button>
                            <el-radio-button label="checkin"></el-radio-button>
                            <el-radio-button label="checkout"></el-radio-button>
                        </el-radio-group>
                    </el-form-item>

                    <el-form-item label="Date">
                        <el-date-picker v-model="dialog_data.date"></el-date-picker>
                    </el-form-item>

                    <el-form-item label="Time">

                        <el-time-select v-model="dialog_data.time"></el-time-select>
                    </el-form-item>

                    <p>Note: TBA</p>
                </el-form>

            </div>
            <div slot="footer">
                <el-button @click="updateDialog = false" round size="mini">Cancel</el-button>
                <el-button @click="saveTimesheet()" round size="mini" type="primary">Update Timesheet</el-button>
            </div>
        </el-dialog>
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
    import BookingView from "./BookingView";
    import AccountAvatar from "../../components/AccountAvatar";
    import moment from 'moment'
    import NoData from "../../components/NoData";
    import CompanyLocations from "../../components/CompanyLocations";
    import TeamSelect from "../../components/TeamSelect";

    export default {
        components: {
            TeamSelect,
            CompanyLocations,
            NoData,
            AccountAvatar,
            MglMap,
            MglMarker,
            Notes,
            AssignTeam,
            AccountCards,
            BookingPhotos,
            Timesheet,
            VclBulletList,
            VclFacebook,
            BookingView
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
                b_loading: false,
                loading: false,
                assignment_loading: false,
                assign_team_drawer: false,
                selected_card: "",
                show_charge_panel: false,
                partial_loading: false,
                team_assignments: [],
                assignment_members: [],
                selected_member: false,
                selected_timesheet: false,
                updateDialog: false,
                dialog_data: {
                    status: '',
                    date: '',
                    time: ''
                },
                total_booking_time: 0,
                timesheet_loading: false,
                filter_team: [],
                filter_location: [],
                bookings_filter: "",
                team_filter: "",
                dt_format: ""
            };
        },
        watch: {
            '$route'(val) {

                if (this.$route.params.id) {
                    this.loadBooking()
                    this.loadBookingAssignments()
                    this.getBookingTimesheeTotal()
                }


            }
        },
        computed: {
            total_time() {
                let checkin, checkout

                if (this.selected_timesheet.checkin) {
                    checkin = this.$moment(this.selected_timesheet.checkin).unix()
                    checkout = this.$moment().unix()
                }
                if (this.selected_timesheet.checkout)
                    checkout = this.$moment(this.selected_timesheet.checkout).unix()

                //total breaks
                let total_break = 0
                if (this.selected_timesheet.breaks) {
                    this.selected_timesheet.breaks.forEach((time_break) => {
                        total_break += (this.$moment(time_break.to).unix() - this.$moment(time_break.from).unix())
                    })
                }

                return this.$moment.duration(checkout - checkin - total_break, 'seconds').asMinutes()
            },

            total_break_time() {
                let total_break = 0
                if (this.selected_timesheet.breaks) {
                    this.selected_timesheet.breaks.forEach((time_break) => {
                        total_break += (this.$moment(time_break.to).unix() - this.$moment(time_break.from).unix())
                    })
                }
                return total_break
            },
        },

        created() {
            this.$events.addListener('timesheet-updated', this.selectTeam)
            this.dt_format = this.$helpers.toElFormat(this.$date_format)
        },

        mounted() {

            (async () => {
                try {
                    this.mapbox = Mapbox;

                    if (this.$route.params.id) {
                        this.loadBookingAssignments()
                        this.loadBooking();
                        this.getBookingTimesheeTotal()
                    }

                } catch (err) {

                }
            })()
        },
        methods: {
            changeBookingStatus(status) {

                this.$confirm('Are you sure you want to change the status of this booking?')
                    .then(() => {
                        this.axios.patch('/bookings/' + this.$route.params.id,
                            {
                                status: status
                            })
                            .then(res => {
                                this.loadBooking()
                                this.loadBookingAssignments()
                                this.$message.success('Booking has been completed')
                                this.$events.emitEvent('workdiary:updated', [this.$route.params.id])

                            })
                            .catch(err => {
                            })
                            .finally(() => {

                            })
                    })
            },
            updateTimeSheet(property, value) {

                let id = this.selected_timesheet.id


                let data = {}
                data[property] = value

                this.timesheet_loading = true

                if (id)
                    this.axios.patch('/timesheets/' + id, data)
                        .then(res => {
                            this.selected_timesheet = res.data
                            this.$message.success('update successful')
                        })
                        .catch(err => {
                            this.$helpers.errorHandle(err, this)
                        })
                        .finally(() => {
                            this.timesheet_loading = false
                        })
                else
                    this.axios.post('/timesheets', data)
                        .then(res => {
                            this.selected_timesheet = res.data
                            this.$message.success('update successful')
                        })
                        .catch(err => {
                            this.$helpers.errorHandle(err, this)
                        })
                        .finally(() => {
                            this.timesheet_loading = false
                        })

            },

            saveTimesheet() {


                let time = moment(this.dialog_data.date + ' ' + this.dialog_data.time).toISOString()

                this.selected_timesheet[this.dialog_data.status] = time

                this.timesheet_loading = true


                if (this.selected_timesheet.hasOwnProperty('id')) {
                    this.axios.patch('/timesheets/' + this.selected_timesheet.id, this.selected_timesheet)
                        .then(res => {
                            this.selected_timesheet = res.data

                            this.dialog_data = {
                                status: '',
                                date: '',
                                time: ''
                            }

                            this.updateDialog = false

                            this.$message.success('Timesheet updated')

                            this.getBookingTimesheeTotal()
                            this.$events.emitEvent('workdiary:updated', [this.$route.params.id])


                        })
                        .catch(err => {

                        })
                        .finally(() => {
                            this.timesheet_loading = false
                        })
                } else {
                    this.axios.post('/timesheets', this.selected_timesheet)
                        .then(res => {
                            this.selected_timesheet = res.data

                            this.dialog_data = {
                                status: '',
                                date: '',
                                time: ''
                            }

                            this.updateDialog = false
                            this.$message.success('Timesheet updated')
                            this.getBookingTimesheeTotal()

                        })
                        .catch(err => {

                        })
                        .finally(() => {
                            this.timesheet_loading = false
                        })
                }


            },

            updateTimesheetStatus(status) {
                if (!this.$can('manage', 'role_admin')) {
                    return;
                }

                if (this.selected_timesheet.locked) {
                    this.$message.info('This timesheet is locked, to edit you must unlock it')
                    return;
                }

                this.dialog_data = {
                    status: status,
                    date: (this.selected_timesheet[status]) ? this.$moment(this.selected_timesheet[status]).format('YYYY-MM-DD') : this.$moment().format('YYYY-MM-DD'),
                    time: (this.selected_timesheet[status]) ? this.$moment(this.selected_timesheet[status]).format('HH:mm') : this.$moment().format('HH:mm'),
                }


                this.updateDialog = true;
            },

            loadBookingAssignments() {
                (async () => {
                    try {
                        this.assignment_loading = true
                        this.assignment_members = []
                        this.selected_timesheet = false
                        this.team_assignments = (await this.axios.get('/team_assignments', {
                            params: {
                                filter: {
                                    include: "team",
                                    where: {
                                        "bookingId": this.$route.params.id
                                    }
                                }
                            }
                        })).data

                        for (let x = 0; x < this.team_assignments.length; x++) {
                            let assigned = this.team_assignments[x]
                            if (assigned.team_model == 'account') {
                                this.assignment_members.push(assigned.team)
                            } else {
                                if (assigned.team.members)
                                    assigned.team.members.forEach((acct) => {
                                        this.assignment_members.push(acct)
                                    })
                            }
                        }

                        //remove duplicates
                        this.assignment_members = this.assignment_members.filter((member, index, self) =>
                            index === self.findIndex((t) => (
                                t.id === member.id
                            ))
                        )

                        //get the time sheet of the first person
                        if (this.assignment_members.length > 0) {
                            this.selectTeam(this.assignment_members[0])
                            //this.selected_timesheet = await this.getSelectedMemberTimesheet()
                        }

                        this.assignment_loading = false


                    } catch (err) {

                    }
                })()
            },
            getSelectedMemberTimesheet() {
                return new Promise((resolve, reject) => {
                    this.axios.get('/timesheets',
                        {
                            params: {
                                filter: {
                                    where: {
                                        bookingId: this.$route.params.id,
                                        accountId: this.selected_member.id
                                    }
                                }
                            }
                        })
                        .then(res => {
                            if (res.data.length > 0) {
                                resolve(res.data[0])
                            } else {
                                resolve(false)
                            }

                        })
                        .catch(err => {
                            reject(err)
                        })
                })
            },
            handleAssignTeamClose() {
                this.assign_team_drawer = false;
                this.loadBooking(this.selectedBooking.id, this.selectedBooking.index)
            },


            loadBooking() {

                this.selectedBooking = false
                this.selected_timesheet = false

                this.loading = true;
                this.axios
                    .get("/bookings/" + this.$route.params.id, {
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
                        this.selectedBooking.forecasted = (this.$route.params.service_date != res.data.service_date)
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this);
                    })
                    .finally(_ => {
                        this.loading = false;
                    });
            },

            getStatus(booking) {
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
            isValidCoordinates() {
                let coordinates = this.getBookingCoordinates();
                return (coordinates[0] !== 0 || coordinates[1] !== 0);
            },
            getBookingCoordinates() {
                if (this.selectedBooking && this.selectedBooking.address && this.selectedBooking.address.coordinates && this.selectedBooking.address.coordinates.lat){
                    return [this.selectedBooking.address.coordinates.lng, this.selectedBooking.address.coordinates.lat];
                }

                return [0,0];
            },
            getMapBoxAccessToken() {
                return process.env.VUE_APP_MAPBOX_TOKEN;
            },

            loadBookings(current_page) {
                this.selectedBooking = false;

                if (!current_page) current_page = this.current_page;

                let start_date = this.$moment(this.range[0])
                    .startOf("day")
                    .toISOString();
                let end_date = this.$moment(this.range[1] || this.range[0])
                    .endOf("day")
                    .toISOString();

                this.b_loading = true;
                this.loading = true;
                this.axios
                    .get("/bookings/schedule", {
                        params: {
                            from: start_date,
                            to: end_date,
                            type: "bookings",
                            page: current_page
                        }
                    })
                    .then(res => {
                        this.bookings = res.data.data;
                        if (this.bookings.length > 0) this.selectedBooking = this.bookings[0];

                        this.total_records = res.data.meta.totalItemCount;
                        this.page_size = res.data.meta.itemsPerPage;
                    })
                    .catch()
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
            selectTeam(account) {
                this.selected_member = account
                this.selected_timesheet = false
                this.getSelectedMemberTimesheet().then(res => {
                    if (res)
                        this.selected_timesheet = res
                    else
                        this.selected_timesheet = {
                            checkin: null,
                            checkout: null,
                            arrived_at: null,
                            onway: null,
                            bookingId: this.$route.params.id,
                            accountId: this.selected_member.id,
                        }
                })
            },
            getBookingTimesheeTotal() {

                if (!this.$route.params.id) return;

                this.axios.get('/timesheets/total-hours', {
                    params: {
                        where: {
                            bookingId: this.$route.params.id
                        }
                    }
                })
                    .then(res => {
                        this.total_booking_time = this.$moment.duration(res.data.seconds, 'seconds').asMinutes()
                    })
                    .catch(err => {

                    })
                    .finally(() => {

                    })

            }
        }
    };
</script>
