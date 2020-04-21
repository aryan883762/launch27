<template>
    <div :class="{is_embedded: is_embedded}" class="calendar-booking-details ">

        <el-card style="box-shadow: none;border:none;"
                 :body-style="{padding:'10px', display: 'flex', 'justify-content':'space-between', width: '100%', 'flex-direction' : 'row'}"
                 class="flex-row" v-if="show_back">
            <el-page-header @back="goBack">
                <div slot="content" v-if="booking">
                    {{$moment(booking.service_date).format($date_format + ' ' +$time_format) }}
                </div>
            </el-page-header>

        </el-card>


        <el-card class="main-view-container" style="min-height: 300px;box-shadow: none;border:none;"
                 v-loading="loading">

            <el-tabs v-model="active_tab" @tab-click="changeTab">
                <el-tab-pane label="Details" name="details" v-if="booking">
                    <el-row>
                        <el-col class="customer-recurring">
                            <div class="customer-details">
                                <el-avatar :src="booking.account.avatar" v-if="booking.account.avatar"/>
                                <avatar :size="42" :username="booking.account.fullname"
                                        class="pull-left customer-avatar" color="white"
                                        v-if="!booking.account.avatar || !booking.account"/>

                                <div class="customer-details-name">
                                    <label>{{ booking.account.fullname }}</label>
                                    <label>{{ booking.address.full_address }}</label>
                                </div>
                            </div>

                            <div v-if="$can('manage', 'view_booking_totals')">
                                <label class="upper-cost" style="display:block;">Cost {{ $currency }}{{
                                    booking.charge.total_after_tax.toFixed(2) }}</label>
                                <el-tag effect="dark" size="small" style="width: 100px;" type="primary">
                                    {{ getWorkdiaryStatus(booking) }}
                                </el-tag>
                            </div>
                        </el-col>

                        <el-col>
                            <el-divider/>
                            <transition name="fade">
                                <div v-if="!assign_team_drawer && !assign_checklist_drawer && !forecasted">
                                    <el-popover
                                            placement="right"
                                            popper-class="edit-menu-popper"
                                            title="Edit Booking Options"
                                            trigger="hover"
                                            width="250">
                                        <ul class="edit-menu">
                                            <li @click="assign_team_drawer = true" plain round size="mini"
                                                type="warning" v-if="$can('manage', 'manage_team')">Assign Teams
                                            </li>
                                            <li @click="editBooking('location')">Address</li>
                                            <li @click="editBooking('services')">Services and Extras</li>
                                            <li @click="editBooking('frequency')">Date and Time</li>
                                            <li @click="editBooking('frequency')">Frequency</li>
                                            <li @click="editBooking('additions')">Discounts and Comments</li>
                                            <li @click="editBooking('payment')">Payment Method</li>
                                            <li @click="editBooking('custom_fields')">Additional Information</li>
                                        </ul>
                                        <el-button plain round size="mini" slot="reference"
                                                   style="margin-right: 10px;"
                                                   type="primary"
                                                   v-if="$can('manage', 'manage_appointment') && booking.status === 'active'">
                                            Edit Booking
                                        </el-button>
                                    </el-popover>
                                    <el-button @click="assign_team_drawer = true" plain round size="mini"
                                               type="warning"
                                               v-if="$can('manage', 'manage_team') && booking.status === 'active'">
                                        Assign Team
                                    </el-button>

                                    <el-button @click="assign_checklist_drawer = true" plain round size="mini"
                                               type="warning"
                                               v-if="$can('manage', 'manage_team') && booking.status === 'active'">
                                        Assign Checklist
                                    </el-button>

                                    <el-button plain round size="mini"
                                               @click="bookAgain()"
                                               v-if="$can('manage', 'manage_appointment')">
                                        Book this Again
                                    </el-button>

                                    <el-button round size="mini" type="danger"
                                               @click="cancelBooking()"
                                               v-if="$can('manage', 'manage_appointment') && booking.status === 'active'">
                                        Cancel Booking
                                    </el-button>

                                    <el-button round size="mini" type="primary"
                                               @click="completeBooking()"
                                               v-if="$can('manage', 'manage_appointment') && booking.status === 'active'">
                                        Complete Booking
                                    </el-button>


                                    <el-button round size="mini" @click="sendMessage = true" v-if="$can('manage', 'manage_appointment') && booking.status === 'active'">
                                        Send Confirmation Email
                                    </el-button>

                                </div>
                                <div v-if="forecasted">
                                    <p>This is a forecasted booking and must be confirmed before any changes can be
                                        made
                                        to it.</p>
                                    <el-button @click="confirmForecastedBooking(booking)" round type="danger">
                                        Confirm Booking
                                    </el-button>
                                </div>
                            </transition>

                            <transition name="slide-fade" v-if="$can('manage', 'manage_team')">
                                <assign-team :booking.sync="booking" @closed="handleAssignTeamClose"
                                             v-if="assign_team_drawer"/>
                            </transition>

                            <transition name="fade" v-if="$can('manage', 'manage_team')">
                                <assign-checklist :booking-id="booking.id" @closed="handleAssignTeamClose"
                                                  v-if="assign_checklist_drawer"
                                                  v-model="booking.assigned_checklists"/>
                            </transition>


                            <div>
                                <el-row :gutter="40" style="margin-top:20px;">
                                    <el-col>
                                        <el-row :gutter="10" class="booking-teams-assignment " style="background: #f3f3f3;padding: 10px;" v-if="team_assignment && team_assignment.length > 0">
                                            <el-col>
                                                <h4 content-position="left">
                                                    Teams Assigned
                                                </h4>
                                            </el-col>
                                            <el-col :key="assignedIndex" style="max-width: 280px;"
                                                    v-for="(assigned, assignedIndex) in team_assignment">
                                                <el-card class="team-card" shadow="always" style="margin-bottom: 5px;" :body-style="{height: '50px !important'}">

                                                    <account-avatar :account="assigned.team" body-class="pull-left" :size="22" style="margin-right: 10px"></account-avatar>
                                                    <div class="team-content">
                                                        <span> {{ assigned.team.name }} </span>
                                                        <el-rate allow-half disabled
                                                                 v-model="assigned.team.rating"/>
                                                        <span class="team-wage"
                                                              v-if="assigned.pay_rate_type === 'percent'">Wage:  {{ assigned.pay_rate + "%" }} </span>
                                                        <span class="team-wage"
                                                              v-if="assigned.pay_rate_type === 'hourly'">Wage: {{ $currency }}{{ assigned.pay_rate + "/hr" }} </span>

                                                        <el-tooltip content="Un-assign team">
                                                            <i v-if="!($can('manage', 'role_team') || $can('manage', 'role_customer'))" class="el-icon-delete-solid" type="danger" @click="unassignTeam(assigned)"></i>
                                                        </el-tooltip>

                                                    </div>

                                                </el-card>
                                            </el-col>
                                        </el-row>
                                    </el-col>

                                    <el-col :md="12" :sm="12">
                                        <el-row :gutter="10" class="checklist-assignment"
                                                v-if="booking.assigned_checklists.length>0 && !assign_checklist_drawer">
                                            <el-col>
                                                <el-divider>Checklist</el-divider>
                                            </el-col>
                                            <el-col :key="checklistIndex" style="max-width: 280px;"
                                                    v-for="(checklist, checklistIndex) in booking.assigned_checklists">
                                                <el-card class="checklist-card" shadow="always">
                                                    <el-avatar :src="checklist.icon" shape="square"/>
                                                    <div class="team-content">
                                                        <span><strong>{{ checklist.name }}</strong></span>
                                                        <span v-if="checklist.tasks">Tasks: {{ checklist.tasks.length }} </span>
                                                    </div>
                                                </el-card>
                                            </el-col>
                                        </el-row>
                                    </el-col>
                                </el-row>


                                <el-divider/>
                                <booking-summary :booking-model.sync="booking"/>

                                <el-divider>Comments</el-divider>

                                <label>Customer Notes</label>
                                <p>{{ booking.customer_notes || "No notes from the customer" }}</p>
                                <label>Staff Notes</label>
                                <p>{{ booking.staff_notes || 'No Staff notes' }}</p>

                                <el-divider>Additional Information</el-divider>

                                <div v-if="booking.customFields">
                                    <el-row :gutter="5">
                                        <el-col :sm="6" v-for="(field, index) in booking.customFields" style="margin-bottom: 5px;">
                                            <el-card shadow="hover">
                                                <div slot="header">
                                                    <label> <strong>{{ field.label || field.title }} </strong> </label>
                                                </div>
                                                <p v-if="field.value">{{ field.valueText || field.value }}
                                                <p>
                                                <div v-if="field.values">
                                                    <label style="" v-for="val in field.values">{{val.label}}</label>
                                                </div>
                                            </el-card>

                                        </el-col>
                                    </el-row>
                                </div>
                            </div>
                        </el-col>
                    </el-row>
                </el-tab-pane>
                <el-tab-pane label="Billing" name="billing"
                             v-if="$can('manage', 'manage_appointment') && !forecasted">
                    <account-cards :account.sync="booking.account" v-if="active_tab === 'billing'"
                                   v-model="selected_card"/>
                </el-tab-pane>
                <el-tab-pane label="Charge & Payments" name="payments"
                             v-if="$can('manage', 'charge_customer') && !forecasted">
                    <charge-payment :booking="booking" :charge="booking.charge" v-if="active_tab === 'payments'"/>
                </el-tab-pane>
                <el-tab-pane label="Photos" name="photos" v-if="!forecasted">
                    <booking-photos :booking_id="booking.id" v-if="active_tab === 'photos'"/>
                </el-tab-pane>
                <el-tab-pane label="Notes" name="notes" v-if="!forecasted">
                    <notes :account-id="booking.account.id" :booking-id="booking.id" v-if="active_tab === 'notes'"/>
                </el-tab-pane>
                <el-tab-pane label="Checklist" name="checklists">
                    <booking-checklist :booking-id="booking.id" v-if="active_tab === 'checklists'"/>
                </el-tab-pane>
                <el-tab-pane label="Time Sheet" name="timesheets"
                             v-if="is_embedded && $can('manage', 'timesheets')">
                    <timesheet :booking="booking" :workdiary="booking.workdiary"
                               v-if="active_tab === 'timesheets'"/>
                </el-tab-pane>

                <el-tab-pane label="Team Invitations" name="invitations"
                             v-if="$can('manage', 'manage_team_invitation')">
                    <booking-invitations :booking_id="booking.id" :team_assignment="booking.team_assignments"
                                         v-if="active_tab === 'invitations'"/>
                </el-tab-pane>
                <el-tab-pane label="Summary of Taxes" name="taxes"
                             v-if="$can('manage', 'manage_taxes')">
                    <booking-taxes :booking-id="booking.id" v-if="active_tab === 'taxes'"></booking-taxes>
                </el-tab-pane>
                <el-tab-pane label="Rating" name="rating">
                    <booking-rating :booking-id="booking.id" v-if="active_tab === 'rating'"></booking-rating>
                </el-tab-pane>
            </el-tabs>


        </el-card>


        <el-dialog :close-on-click-modal="false" :modal="true" :visible.sync="editDialog" @close="editBookingClosed"
                   append-to-body custom-class="fullscreen-modal-display" fullscreen title="Edit Booking">
            <div class="modal-body create-booking">
                <edit-appointment :bookingId.sync="booking.id" :mode="editMode" @close="editBookingClosed"
                                  v-if="editDialog"></edit-appointment>
            </div>
        </el-dialog>

        <el-dialog :visible.sync="cancelDialog" :modal="true" top="0vh" append-to-body modal-append-to-body
                   title="Cancel Booking">
            <div class="modal-body cancelmodal">
                <cancel-booking :booking="booking" v-if="cancelDialog" @cancelled="loadBooking"></cancel-booking>
            </div>
        </el-dialog>

        <el-dialog :visible.sync="sendMessage" :modal="true" top="0vh" append-to-body title="Send Message">
            <div class="modal-body sendmessage">
                <send-message @close="sendMessage = false" :booking="booking" v-if="sendMessage"></send-message>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import AssignTeam from '../../components/AssignTeam'
    import BookingSummary from '../../components/BookingSummary'
    import BookingPhotos from '../../components/BookingPhotos'
    import AccountCards from '../../components/AccountCards'
    import ChargePayment from '../../components/ChargePayment'
    import AssignChecklist from '../../components/AssignChecklist'
    import Notes from '../../components/Notes'
    import Timesheet from '../../components/Timesheet'
    import BookingChecklist from '../../components/BookingChecklist'
    import BookingInvitations from '../../components/BookingInvitations'
    import BookingEvent from '../../components/BookingEvent'

    import {VclList} from 'vue-content-loading'
    import Avatar from 'vue-avatar'
    import BookingTaxes from "../../components/BookingTaxes";
    import EditAppointment from "../modals/booking_form/EditAppointment";
    import CancelBooking from "../../components/CancelBooking";
    import BookingRating from "../../components/BookingRating";
    import SendMessage from "../../components/SendMessage";
    import AccountAvatar from "../../components/AccountAvatar";

    export default {
        props: ['teams', 'selectedBooking'],
        components: {
            AccountAvatar,
            SendMessage,
            BookingRating,
            CancelBooking,
            EditAppointment,
            BookingTaxes,
            BookingSummary,
            AssignTeam,
            BookingPhotos,
            AccountCards,
            VclList,
            ChargePayment,
            AssignChecklist,
            Avatar,
            Notes,
            Timesheet,
            BookingChecklist,
            BookingInvitations,
            BookingEvent
        },
        data() {
            return {
                drawer: false,
                booking: false,
                loading: true,
                active_tab: 'details',
                assign_team_drawer: false,
                selected_card: '',
                forecasted: false,
                assign_checklist_drawer: false,
                show_back: false,
                route_name: '',
                back: true,
                team_assignment: false,
                editDialog: false,
                editMode: '',
                cancelDialog: false,
                sendMessage: false
            }
        },
        watch: {
            '$route'(val) {
                if (this.selectedBooking) {
                    this.forecasted = (this.$route.params.service_date !== this.booking.service_date)
                    this.booking = this.selectedBooking
                    this.booking.forecasted_service_date = this.$route.params.service_date
                    this.booking.forecasted = this.forecasted
                    return
                }

                if (this.$route.params.id) {
                    this.loadBooking()
                } else {
                    this.$router.push({name: 'dashboard_calendar_list'})
                }
            }
        },

        computed: {
            is_embedded() {
                return (this.$route.name !== 'dashboard_booking_view' &&
                    this.$route.name !== 'team_bookings_view' &&
                    this.$route.name !== 'customer_bookings_view')
            },

            booking_edit_route_name() {
                if (this.$can('manage', 'role_admin')) {
                    return 'dashboard_booking_edit'
                } else {
                    return 'customer_bookings_edit'
                }
            }
        },

        created() {

        },

        mounted() {
            (async () => {
                try {
                    this.route_name = this.$route.name

                    if (this.$route.params.id) {
                        if (this.selectedBooking) {
                            this.booking = this.selectedBooking
                            this.forecasted = (this.$route.params.service_date !== this.booking.service_date)
                            this.booking.forecasted_service_date = this.$route.params.service_date
                            this.booking.forecasted = this.forecasted
                            this.loading = false
                            if (this.$route.query.action == 'assign_team') {
                                this.assign_team_drawer = true
                            } else if (this.$route.query.action == 'payments') {
                                this.active_tab = 'payments'
                            }
                        } else {
                            this.loadBooking()
                        }
                    } else {
                        this.$router.push({name: 'dashboard_calendar_list'})
                    }

                    this.team_assignment = (await this.axios.get('/team_assignments', {
                        params: {
                            filter: {
                                include: ["team"],
                                where: {bookingId: this.$route.params.id}
                            }
                        }
                    })).data


                    if (this.is_embedded) {
                        this.show_back = false
                    } else {
                        this.show_back = true
                    }

                    if (this.$route.query.active_view) {
                        this.active_tab = this.$route.query.active_view
                    }

                } catch (err) {
                    this.$helpers.errorHandle(err)
                }
            })()


        },
        beforeDestroy() {
        },
        methods: {
            editBooking(mode) {
                this.editMode = mode
                this.editDialog = true
            },
            editBookingClosed() {
                this.editDialog = false;
                this.editMode = ''
                //reload booking if need be
                this.loadBooking()
            },
            reloadTeamsAssigned() {
                (async () => {
                    try {
                        this.team_assignment = (await this.axios.get('/team_assignments', {
                            params: {
                                filter: {
                                    include: ["team"],
                                    where: {bookingId: this.$route.params.id}
                                }
                            }
                        })).data
                    } catch (err) {

                    }
                })()

            },
            teamUpdated(teamId) {

            },
            openDrawer(booking_id) {
                this.booking_id = booking_id
                this.drawer = true
            },
            handleClose(done) {
                this.booking_id = undefined
                done()
            },
            handleAssignTeamClose(done) {
                this.assign_team_drawer = false
                this.assign_checklist_drawer = false
                this.reloadTeamsAssigned()
            },
            closed() {
                this.booking = false
                this.$emit('closed-details')
            },
            loadBooking() {
                this.loading = true
                this.axios
                    .get('/bookings/' + this.$route.params.id, {
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
                        this.forecasted = (this.$route.params.service_date != res.data.service_date)
                        this.booking = res.data
                        this.booking.forecasted_service_date = this.$route.params.service_date
                        this.booking.forecasted = this.forecasted
                        this.cancelDialog = false

                        if (this.$route.query.action == 'assign_team') {
                            this.assign_team_drawer = true
                        } else if (this.$route.query.action == 'payments') {
                            this.active_tab = 'payments'
                        }

                        this.$events.emitEvent('reload-bookings')
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this)
                    })
                    .finally(_ => {
                        this.loading = false
                    })
            },
            getTeamName(teamId) {
                let team = this.teams.find(tt => {
                    return tt.id === teamId
                })
                if (team) return team.name

                return ''
            },
            getTeamRating(teamId) {
                let team = this.teams.find(tt => {
                    return tt.id === teamId
                })
                if (team) return team.rate

                return ''
            },
            getWorkdiaryStatus(booking) {

                if (booking.status === 'cancelled' || booking.status === 'completed') return booking.status.toUpperCase()

                return booking.status.toUpperCase()

                switch (booking.workdiary.status) {
                    case 0:
                        return 'Pending'
                        break

                    case 1:
                        return 'Onway'
                        break

                    case 2:
                        return 'In Progress'
                        break

                    case 3:
                        return 'Completed'
                        break
                }
            },
            confirmForecastedBooking(booking) {
                this.$confirm('Are sure you want to confirm this booking?', 'Confirm Forecasted Booking')
                    .then(() => {
                        this.loading = true
                        this.axios.post('/bookings/' + booking.id + '/forecasted/confirm', {
                            service_date: this.$route.params.service_date
                        })
                            .then(res => {
                                this.$helpers.successHandle('Booking confirmed', this)


                                this.$router.replace({
                                    name: this.$route.name,
                                    params: {
                                        id: res.data.id,
                                        service_date: res.data.service_date
                                    }
                                })
                            })
                            .catch(err => {

                            })
                            .then(
                                _ => {
                                    this.loading = false
                                }
                            )
                    })
            },

            goBack() {
                if (this.back) {
                    this.$router.back()
                } else {
                    // taking the to the correct dashoard
                    this.$router.replace({name: 'landing_page'})
                }
            },

            cancelBooking() {
                this.cancelDialog = true
            },
            bookAgain() {

                //take this booking and give to the new booking form
                this.$router.push({
                    name: 'dashboard_booking_new',
                    query: {action: 'rebook', bookingId: this.booking.id}
                })
            },
            changeTab(val) {
                // this.$router.push({path: this.$route.path, query: {active_view: val.name}})
            },

            completeBooking(status) {
                this.loading = true
                this.$confirm('Are you sure you want to complete this booking?')
                    .then(() => {
                        this.axios.patch('/bookings/' + this.booking.id,
                            {
                                status: 'completed'
                            })
                            .then(res => {
                                this.$message.success('Booking has been completed')
                                this.loadBooking()
                                this.$events.emitEvent('workdiary:updated', [this.booking.id])
                            })
                            .catch(err => {
                                this.$helpers.errorHandle(err)
                                this.loading = false
                            })
                            .finally(() => {

                            })
                    })
            },

            unassignTeam(assignment) {
                this.$confirm('Unassign this team from booking?', "Team Assignments")
                    .then(() => {
                        this.loading = true

                        this.axios.delete('/bookings/' + this.booking.id + '/team_assignments/' + assignment.id)
                            .then(res => {
                                this.$helpers.successHandle("Team removed from booking")
                                this.reloadTeamsAssigned()
                            })
                            .catch(err => {
                                this.$helpers.errorHandle(err)
                            })
                            .finally(() => {
                                this.loading = false
                            })
                    })
                    .catch(() => {
                    })


            }
        },

        beforeRouteEnter(to, from, next) {
            // finding out if it was the first url to handle back
            next(vm => {
                vm.back = !(from.fullPath === '/' && from.matched.length == 0 && from.name == null)
            })
        },

    }
</script>

<style lang="scss">

    .edit-menu-popper {
        padding: 0px !important;

        .el-popover__title {
            padding: 10px;
        }

        ul {
            list-style: none;
            margin: 0px;
            padding: 0px;

            li {
                display: block;
                padding: 8px 15px;

                &:hover {
                    background: #f3f3f3;
                    color: $launch-primary-color;
                    cursor: pointer;
                }
            }
        }
    }

    .calendar-booking-details {

        &.is_embedded {
            .main-view-container {
                box-shadow: none;
                border: 0;
            }
        }

        .team-card {
            cursor: default;

        }

        .team-content {
            position: relative;

            i {
                position: absolute;
                right: -15px;
                top: 0;
                cursor: pointer;
                font-size: 16px;
                color: red;
            }
        }

        .team-wage {
            font-size: 10px;
        }

        .upper-cost {
            color: #fb837f;
            font-size: 16px;
            font-weight: bold;
        }

        .el-card {
            .customer-recurring {
                display: flex;
                justify-content: space-between;
            }

            .customer-details {
                width: 50%;

                .el-avatar, .customer-avatar {
                    float: left;
                    margin-right: 10px;
                }

                .customer-details-name {
                    width: calc(100% - 100px);

                    label {
                        display: block;

                        &:first-child {
                            font-weight: bold;
                        }
                    }
                }
            }
        }

    }

</style>
