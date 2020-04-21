<template>
    <div class="bookings-calendar calendar-schedule-view">

        <el-card class="calendar-card" style="border:none; margin-bottom: 5px;">
            <div class="flex-row calendar-options-bar">

                <div class="main-filters">

                    <el-radio-group size="mini" v-model="calendar_view">


                        <el-radio-button @click.native="changeView('dayGridMonth')" label="month">
                            Month
                        </el-radio-button>
                        <el-radio-button @click.native="changeView('timeGridWeek')" label="week">
                            Week
                        </el-radio-button>
                        <el-radio-button @click.native="changeView('timeGridDay')" label="day">
                            Day
                        </el-radio-button>
                        <el-radio-button v-if="!booking_spot_mode" @click.native="changeView('listMonth')" label="listmonth">
                            List Month
                        </el-radio-button>
                        <el-radio-button v-if="!booking_spot_mode" @click.native="changeView('listWeek')" label="listweek">
                            List Week
                        </el-radio-button>
                        <el-radio-button v-if="!booking_spot_mode" @click.native="changeView('listDay')" label="listday">
                            List Day
                        </el-radio-button>
                        <el-radio-button v-if="!booking_spot_mode" @click.native="changeView('resourceTimeGridDay')" label="vertical">
                            Vertical
                        </el-radio-button>
                        <el-radio-button v-if="!booking_spot_mode" @click.native="changeView('resourceTimeline')" label="horizontal">
                            Horizontal
                        </el-radio-button>
                    </el-radio-group>

                    <el-divider direction="vertical"></el-divider>

                    <el-checkbox v-model="booking_spot_mode" @change="loadSchedule()">Availability Mode</el-checkbox>

                </div>

                <div class="main-filters">
                    <el-select @change="loadSchedule()" class="small filter"
                               style="margin-right: 5px;" v-model="bookings_filter">
                        <el-option label="Active Bookings" value="active"></el-option>
                        <el-option label="Completed Bookings" value="completed"></el-option>
                        <el-option label="Cancelled Bookings" value="cancelled"></el-option>
                    </el-select>

                    <team-select v-model="filter_team" :multiple="true" style="margin-right:10px;" additional-class="filter small" v-if="$can('manage', 'role_admin') || $can('manage', 'role_team')"
                                 :collapse-tags="true" :filterable="false" @change="loadSchedule" :show-add-teams="false"></team-select>


                    <company-locations :return-object="true" v-model="selectedLocation" @change="locationChanged"></company-locations>


                </div>


                <div v-if="$can('manage', 'manage_appointment') && false">
                    <el-button @click="addEvent()" icon="el-icon-plus" round size="mini" type="primary">
                        Add Event
                    </el-button>
                    <el-button @click="$router.push({name: 'dashboard_settings_services_add'})" icon="el-icon-plus"
                               size="mini" type="text">
                        Add Service
                    </el-button>
                    <el-button disabled icon="el-icon-edit" size="mini" type="text">
                        Edit
                    </el-button>
                </div>
            </div>
        </el-card>

        <el-row :gutter="5">

            <transition name="el-zoom-in:center">
                <el-col :md="6" :sm="6" v-if="show_teams">
                    <el-card :body-style="{padding: '10px'}">
                        <div class="flex-row">
                            <el-select placeholder="Choose teams" class="filter small" style="width: 100%" v-model="teams_filter" @change="getTeams">
                                <el-option label="All Teams" :value="0"></el-option>
                                <el-option label="All active teams" :value="1"></el-option>
                                <el-option label="Active Teams for Location(s)" :value="2"></el-option>
                            </el-select>

                            <el-select v-model="order_by" placeholder="Order by" class="filter small" style="margin-left:10px" @change="getTeams">
                                <el-option label="Rating" value="rating"></el-option>
                                <el-option label="A-Z" value="name"></el-option>
                            </el-select>
                        </div>

                    </el-card>

                    <div v-loading="loading_teams" class="bg-white">
                        <el-scrollbar wrap-class="list" view-class="view-box" :native="false" :style="{maxHeight: (windowHeight - heightOffset) + 'px', height: (windowHeight - heightOffset) + 'px', overflow: 'hidden'}">
                            <ul class="team-list">
                                <li v-for="(team, index) in teams" class="team-resource-item" :class="{'active': filter_team.indexOf(team.id) >= 0 }" @click="selectTeam(team, index)" :id="team.id" :key="team.id">
                                    <account-avatar body-class="pull-left" style="margin-right: 10px;" :account="team"></account-avatar>
                                    <div class="team-detail">
                                        <span>{{ team.name }}</span>
                                        <el-rate v-model="team.rating"></el-rate>

                                        <el-popover
                                                @show="popupGetTeamBookings(team.memberIds)"
                                                placement="left-end"
                                                popper-class="team-popover"
                                                ref="popover1"
                                                trigger="hover"
                                                title="Team bookings"
                                                :close-delay="500"
                                                :open-delay="1000"
                                                width="700">
                                            <div class="team-content">
                                                <el-table :data="team_schedule" v-loading="loading_team_schedule">
                                                    <el-table-column label="Date" width="100">
                                                        <template slot-scope="scope">
                                                            <label style="display:block;">{{$moment(scope.row.service_date).format($date_format)}}</label>
                                                            <label style="display:block;">{{$moment(scope.row.service_date).format($time_format)}}</label>
                                                        </template>
                                                    </el-table-column>
                                                    <el-table-column label="Dura." width="80">
                                                        <template slot-scope="scope">
                                                            {{scope.row.duration | duration}}
                                                        </template>
                                                    </el-table-column>
                                                    <el-table-column label="Customer">
                                                        <template slot-scope="scope">
                                                            <account-avatar :account="scope.row.account" :size="24" body-class="pull-left"></account-avatar>
                                                            <div class="customer-details">
                                                                <span>{{scope.row.account.fullname}}</span>
                                                                <span>{{scope.row.address.full_address}}</span>
                                                            </div>
                                                        </template>
                                                    </el-table-column>
                                                    <el-table-column label="Service">
                                                        <template slot-scope="scope">
                                                            <el-row>
                                                                <el-col :lg="20" :md="24" :sm="24">
                                                                    {{scope.row.service_details[0].name}}
                                                                </el-col>
                                                                <el-col :lg="4" :md="24" :sm="24">
                                                                    <el-tag type="info" effect="dark" size="mini" v-if="scope.row.service_details.length > 1">
                                                                        +{{ scope.row.service_details.length -1 }}
                                                                    </el-tag>
                                                                </el-col>
                                                            </el-row>
                                                        </template>
                                                    </el-table-column>
                                                    <el-table-column label="Options">
                                                        <template slot-scope="scope">
                                                            <el-link @click="viewBooking(scope.row.id, scope.row.service_date)"
                                                                     type="primary">View
                                                            </el-link>

                                                        </template>
                                                    </el-table-column>
                                                </el-table>

                                                <el-pagination :current-page.sync="current_page" :page-size="page_size"
                                                               :total="total_records" @current-change="popupGetTeamBookings(team.memberIds)" background
                                                               layout="total, prev, pager, next"></el-pagination>
                                            </div>

                                            <div slot="reference">
                                                <el-tooltip content="click to view schedule">
                                                    <el-icon class="el-icon-date"></el-icon>
                                                </el-tooltip>
                                            </div>

                                        </el-popover>
                                    </div>
                                </li>
                            </ul>
                        </el-scrollbar>
                    </div>

                </el-col>
            </transition>

            <el-col :md="show_teams ? 18 : 24" :sm="show_teams ? 18 : 24">
                <div class="flex-row bg-white" style="align-items: center; padding: 10px;">
                    <el-button @click="$refs.schedule_calendar.getApi().prev()" round type="primary" icon="el-icon-arrow-left" size="mini">
                        Previous
                    </el-button>

                    <el-button @click="$refs.schedule_calendar.getApi().next()" round type="primary" size="mini">Next <i class="el-icon-arrow-right"></i></el-button>
                </div>
                <div class="bg-white" style="position:relative;" v-loading="calendar_loading">
                    <full-calendar
                            :all-day="false"
                            :drag-revert-duration="0"
                            :editable="booking_spot_mode ? false : true"
                            :header="{center: 'title', left: '', right : ''}"
                            :event-allow="eventAllow"
                            :event-render="eventRenderer"
                            :event-sources="eventSources"
                            resourceLabelText="Teams"
                            :display-event-end="true"
                            :display-event-time="true"
                            resourceGroupField="groupId"
                            :plugins="calendarPlugins"
                            :height="(windowHeight - 210)"
                            :progressive-event-rendering="true"
                            :resources="resources"
                            :scheduler-license-key="schedulerLicenseKey"
                            :select-allow="selectAllow"
                            :selectable="true"
                            :time-zone="$auth.user().company.timezone"
                            :views="{ listDay: { buttonText: 'list day' },
                                           listWeek: { buttonText: 'list week' },
                                           listMonth: { buttonText: 'list month' },
                                           dayGridMonth : {
                                             eventLimit : 3
                                           }}"
                            @eventClick="eventClick"
                            @eventDragStop="eventDragStop"
                            @eventDrop="eventDrop"
                            @eventMouseLeave="eventMouseLeave"
                            @eventPositioned="eventPositioned"
                            @eventResize="eventResize"
                            :slotEventOverlap="true"
                            @loading="loadingSources"
                            ref="schedule_calendar">
                    </full-calendar>

                </div>

                <el-row class="calendar-footer" v-if="false">
                    <el-col :md="6" :sm="6" :xs="12" class="first">
                        <span class="stats-number _first">{{total_bookings}}</span>
                        <label>Total Bookings</label>
                    </el-col>

                    <el-col :md="6" :sm="6" :xs="12" class="second">
                        <span class="stats-number _second">{{total_hours | duration}}</span>
                        <label>Total Hours</label>
                    </el-col>

                    <el-col :md="6" :sm="6" :xs="12" class="third">
                        <span class="stats-number _third">{{total_availability}}</span>
                        <label>Total Availability</label>
                    </el-col>

                    <el-col :md="6" :sm="6" :xs="12" class="fourth">
                        <span class="stats-number _fourth"> {{$currency}} {{total_revenue}}</span>
                        <label>Total Revenue</label>
                    </el-col>
                </el-row>

            </el-col>


        </el-row>

        <el-dialog :visible.sync="confirmDialog" append-to-body class="reschedule-dialog" title="Confirm Reschedule" width="50%">
            <h4>Do you wish to reschedule the appointment?</h4>
            <div v-if="confirmInfo">
                <p><strong>From: </strong> {{ $moment(confirmInfo.oldEvent.start).format($date_format + ' ' +
                    $time_format) }}</p>
                <p><strong>To: </strong>{{ $moment(confirmInfo.event.start).format($date_format + ' ' + $time_format) }}
                </p>

                <div v-if="isRecurring(confirmInfo.oldEvent)">
                    <p>This booking is part of a recurring booking, how do you want to handle future bookings?</p>

                    <el-radio-group v-model="recurring_mode">
                        <el-radio label="reset">
                            from the Date and Frequency selected Today
                        </el-radio>
                        <el-radio label="noreset">
                            as Normal
                        </el-radio>
                    </el-radio-group>

                    <div>
                        <ul v-if="recurring_mode=='reset'">
                            <li v-for="date in confirmInfo.recurring_details.delta">
                                {{ $moment(date).format($date_format + ' ' + $time_format) }}
                            </li>
                        </ul>
                        <ul v-if="recurring_mode=='noreset'">
                            <li v-for="date in confirmInfo.recurring_details.current">
                                {{ $moment(date).format($date_format + ' ' + $time_format) }}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <span class="dialog-footer" slot="footer">
           <el-button @click="confirmChange(true)" type="primary">Reschedule</el-button>
           <el-button @click="confirmChange(false)">Cancel</el-button>
         </span>
        </el-dialog>


        <el-dialog :modal="true" :modal-append-to-body="false" :show-close="false" :visible.sync="dialogs.booking_view"
                   append-to-body class="calendar-booking-detail-dialog" width="30%">
            <div class="modal-body">
                <el-row v-if="preview_booking && !preview_booking.is_event" v-loading="loading_details">
                    <el-col>
                        <div>
                            <account-avatar :account="preview_booking.account" :size="48"
                                            body-class="pull-left"></account-avatar>
                            <div class="booking-calendar-customer-detail">
                                <small>{{preview_booking.account.fullname}}</small>
                                <strong style="display:block;">{{preview_booking.service_details[0].name}}</strong>
                                <small style="display:block;">{{$moment(preview_booking.service_date).format($time_format)}}
                                    , {{$moment(preview_booking.service_date).format($date_format)}}</small>
                                <small style="display:block;">{{preview_booking.address.full_address}}</small>
                                <label class="charge" v-if="preview_booking.charge">Cost:
                                    {{$currency}}{{(preview_booking.charge.total_after_tax).toFixed(2)}}</label>
                            </div>
                        </div>

                        <div class="timer-band">
                            <span>Time Logged</span>
                            <span>{{preview_booking.total_booking_time | duration}}</span>
                        </div>

                        <el-row class="labels">
                            <el-col :sm="24">
                                <label>0% of checklists completed</label>
                                <label>{{preview_booking.images.length}} pictures added</label>
                            </el-col>
                            <el-col>
                                <el-divider></el-divider>
                            </el-col>
                            <el-col>
                                <el-popover
                                        placement="right"
                                        popper-class="edit-menu-popper"
                                        title="Edit Booking Options"
                                        trigger="hover"
                                        width="250">
                                    <ul class="edit-menu">
                                        <li @click="editBooking('location', preview_booking.id)">Address</li>
                                        <li @click="editBooking('services',preview_booking.id)">Services and Extras</li>
                                        <li @click="editBooking('frequency',preview_booking.id)">Date and Time</li>
                                        <li @click="editBooking('frequency',preview_booking.id)">Frequency</li>
                                        <li @click="editBooking('additions',preview_booking.id)">Discounts and
                                            Comments
                                        </li>
                                        <li @click="editBooking('payment',preview_booking.id)">Payment Method</li>
                                        <li @click="editBooking('custom_fields',preview_booking.id)">Additional
                                            Information
                                        </li>
                                    </ul>
                                    <el-button round size="mini" slot="reference" style="margin-right: 10px;"
                                               type="warning" v-if="$can('manage', 'manage_appointment')">
                                        Edit Booking
                                    </el-button>
                                </el-popover>

                                <el-button @click="viewBooking(preview_booking.id, preview_booking.service_date)"
                                           class="pull-right" plain round size="mini" type="primary">
                                    View Booking
                                </el-button>

                                <el-button @click="viewBooking(preview_booking.id, preview_booking.service_date)"
                                           class="pull-right" round size="mini" style="margin-right: 10px;"
                                           type="primary">
                                    Assign Teams
                                </el-button>

                            </el-col>

                        </el-row>


                    </el-col>
                </el-row>
                <el-row class="booking_events" v-if="preview_booking && preview_booking.is_event">
                    <el-col>
                        <label>Date:</label>
                        <label><strong>{{$moment(preview_booking.start).format($date_format + ' @ ' + $time_format)
                            }}</strong></label>
                        <label>Duration: {{preview_booking.duration | duration}}</label>
                        <label>Location: </label>
                        <p>{{preview_booking.address}}</p>
                        <label>Description:</label>
                        <p> {{preview_booking.comment}}</p>
                    </el-col>

                    <el-col>
                        <el-row class="labels">
                            <el-col :sm="12">
                                .
                            </el-col>
                            <el-col :sm="12">
                                <el-dropdown class="pull-right">
                                    <el-button plain round size="small" type="primary">
                                        Action<i class="el-icon-arrow-down el-icon--right"></i>
                                    </el-button>
                                    <el-dropdown-menu slot="dropdown">
                                        <el-dropdown-item>Edit Event</el-dropdown-item>
                                        <el-dropdown-item>Cancel Event</el-dropdown-item>
                                    </el-dropdown-menu>
                                </el-dropdown>
                            </el-col>
                        </el-row>
                    </el-col>
                </el-row>
            </div>
            <div slot="footer">

            </div>
        </el-dialog>

        <el-dialog :close-on-click-modal="false" :modal="true" :visible.sync="editDialog" @close="editBookingClosed"
                   append-to-body custom-class="fullscreen-modal-display" fullscreen title="Edit Booking">
            <div class="modal-body create-booking">
                <edit-appointment :bookingId.sync="preview_booking.id" :mode="editMode" @close="editBookingClosed"
                                  v-if="editDialog"></edit-appointment>
            </div>
        </el-dialog>

        <el-dialog :close-on-click-modal="true" custom-class="show-bookings-preview" :visible.sync="showBookingsPreview"
                   top="0vh" :append-to-body="true" width="70%">
            <div slot="title" v-if="selectedEvent">
                <h4> Bookings for {{selectedEvent.event.day}}</h4>
            </div>
            <div class="modal-body">
                <div class="vue-call-popover-content">


                    <el-table :data="popover_bookings" v-loading="loading_bookings">
                        <el-table-column label="Time" width="70">
                            <template slot-scope="scope">
                                {{$moment(scope.row.service_date).format($time_format)}}
                            </template>
                        </el-table-column>
                        <el-table-column label="Dura." width="80">
                            <template slot-scope="scope">
                                {{scope.row.duration | duration}}
                            </template>
                        </el-table-column>
                        <el-table-column label="Customer" width="300">
                            <template slot-scope="scope">
                                <account-avatar :account="scope.row.account" :size="32"
                                                body-class="pull-left"></account-avatar>
                                <div class="customer-details" style="margin-left: 5px;display:inline-block;">
                                    <span>{{scope.row.account.fullname}}</span>
                                    <span style="display:block;">{{scope.row.address.street}} - {{scope.row.city}}</span>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column label="Service">
                            <template slot-scope="scope">
                                <el-row>
                                    <el-col :lg="20" :md="24" :sm="24">
                                        {{scope.row.service_details[0].name}}
                                    </el-col>
                                    <el-col :lg="4" :md="24" :sm="24">
                                        <el-tag type="info" effect="dark" size="mini" v-if="scope.row.service_details.length > 1">
                                            +{{ scope.row.service_details.length -1 }}
                                        </el-tag>
                                    </el-col>
                                </el-row>
                            </template>
                        </el-table-column>
                        <el-table-column label="Teams">
                            <template slot-scope="scope">
                                <div class="avatars-container">
                                    <el-tooltip :content="assignment.team.name || assignment.team.fullname"
                                                v-for="(assignment,index)  in scope.row.team_assignments">
                                        <account-avatar v-if="index < 4" :account="assignment.team"
                                                        :size="28" body-class="pull-left"></account-avatar>
                                    </el-tooltip>

                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column label="Cost">
                            <template slot-scope="scope">
                                <strong>{{$currency}}{{scope.row.charge.total_after_tax}} </strong>
                            </template>
                        </el-table-column>
                        <el-table-column label="Status" prop="status">

                        </el-table-column>
                        <el-table-column label="Options">
                            <template slot-scope="scope">
                                <el-link size="mini"
                                         @click="viewBooking(scope.row.id, scope.row.service_date)"
                                         type="primary">View
                                </el-link>

                            </template>
                        </el-table-column>
                    </el-table>

                    <el-pagination :current-page.sync="current_page" :page-size="page_size"
                                   :total="total_records" @current-change="eventSpotClick()" background
                                   layout="total, prev, pager, next"></el-pagination>

                </div>
            </div>

            <div slot="footer">
                <el-row>
                    <el-col>
                        <el-button @click="addBooking()" round size="mini" type="primary">Add New Booking</el-button>
                    </el-col>
                </el-row>
            </div>

        </el-dialog>


        <el-dialog top="0vh" :append-to-body="true" width="500px" :modal="true" title="Assign Team" :visible.sync="showAssignTeam">
            <el-row v-if="assignEvent.teamId && showAssignTeam">
                <el-col>
                    <div>
                        Assigning booking:
                        <strong>{{$moment(assignEvent.service_date).format($date_format + ' ' + $time_format)}}</strong>
                        <div> to team:</div>
                        <h4>{{assignEvent.team.name}}</h4>
                    </div>
                    <el-divider></el-divider>
                    <label>Confirm the Wage for this assignment</label>
                    <el-card>
                        <el-form label-position="top">
                            <el-form-item label="Wage method">
                                <el-select style="width:100px;" v-model="assignEvent.team.pay_rate_type">
                                    <el-option label="percent" value="percent"/>
                                    <el-option label="hourly" value="hourly"/>
                                </el-select>
                            </el-form-item>

                            <el-form-item label="Value">
                                <el-input-number v-model="assignEvent.team.pay_rate"></el-input-number>
                            </el-form-item>
                        </el-form>
                    </el-card>

                </el-col>

            </el-row>
            <div slot="footer">
                <el-button size="small" @click="showAssignTeam = false" round>Cancel</el-button>
                <el-button size="small" type="primary" @click="confirmTeamAssignment()" round>Confirm</el-button>
            </div>
        </el-dialog>

    </div>
</template>

<script>
    import FullCalendar from '@fullcalendar/vue'
    import dayGridPlugin from '@fullcalendar/daygrid'
    import rrulePlugin from '@fullcalendar/rrule'
    import interactionPlugin, {Draggable} from '@fullcalendar/interaction'
    import listPlugin from '@fullcalendar/list'
    import timeGrid from '@fullcalendar/timegrid'
    import Avatar from 'vue-avatar'
    import CalendarMenu from './CalendarMenu'
    import AccountAvatar from "../../../components/AccountAvatar";
    import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
    import resourceTimeline from '@fullcalendar/resource-timeline';
    import momentPlugin from '@fullcalendar/moment'
    import momentTimeZone from '@fullcalendar/moment-timezone'
    import AssignTeam from "../../../components/AssignTeam";
    import {VueDraggableDirective} from 'vue-draggable'
    import tippy from 'tippy.js';
    import {hideAll} from 'tippy.js';
    import EditAppointment from "../../modals/booking_form/EditAppointment";

    import 'jquery-ui-dist/jquery-ui';

    import 'tippy.js/dist/tippy.css';
    import 'tippy.js/themes/light.css';
    import 'tippy.js/themes/material.css';
    import 'tippy.js/animations/scale.css';
    import TeamSelect from "../../../components/TeamSelect";
    import CompanyLocations from "../../../components/CompanyLocations";

    export default {
        components: {
            CompanyLocations,
            TeamSelect,
            EditAppointment,
            AssignTeam,
            AccountAvatar,
            FullCalendar,
            Avatar,
            CalendarMenu
        },
        directives: {
            dragAndDrop: VueDraggableDirective
        },
        data() {
            return {
                filter: '',
                calendar_view: 'month',
                calendarPlugins: [interactionPlugin, dayGridPlugin, timeGrid, rrulePlugin, listPlugin, resourceTimeGridPlugin, resourceTimeline, momentPlugin, momentTimeZone],
                events: [],
                confirmDialog: false,
                confirmInfo: false,
                editMode: 'only_booking',
                recurring_mode: '',
                date_range: [],
                date_month: '',
                businessHours: [],
                loading: true,
                selectedLocation: false,
                teams: [],
                dt_format: '',
                eventForm: {
                    title: '',
                    date: '',
                    comment: '',
                    address: '',
                    teamId: [],
                    duration: 0,
                    bookingId: '',
                    customer: ''
                },
                eventDialog: false,
                event_rules: {
                    title: [
                        {
                            message: 'Title is required',
                            required: true
                        }
                    ],
                    start: [
                        {
                            message: 'Date is required',
                            required: true
                        }
                    ],
                    duration: [
                        {
                            message: 'Duration is required',
                            type: 'number',
                            required: true
                        }
                    ]
                },
                teamDetailDrawer: false,
                over: false,
                dialogs: {
                    booking_view: false,
                    popover: false
                },
                preview_booking: false,
                schedulerLicenseKey: process.env.VUE_APP_FULLCALENDAR_KEY,
                calendar_month: '',
                calendar_date: '',
                showPopover: false,
                eventPopover: false,
                eventPopoverDate: false,
                eventPopoverData: false,
                loading_events: false,
                clickCnt: 0,
                clickTimer: "",
                loading_details: false,
                assign_team_drawer: false,
                teams_filter: 2,
                editDialog: false,
                current_view: 'dayGridMonth',
                loading_team_schedule: false,
                team_schedule: [],
                booking_filter: 0,
                order_by: 'name',
                bookings: [],
                show_teams: true,
                resourceLabelText: "Teams",
                resources: [],
                earliest_open_time: "08:00:00",
                loading_teams: false,
                total_records: 0,
                page_size: 0,
                current_page: 1,
                heightOffset: 235,
                dragging: -1,
                filter_team: [],
                bookings_filter: 'active',
                booking_spot_mode: false,
                showBookingsPreview: false,
                popover_bookings: [],
                selectedEvent: false,
                loading_bookings: false,
                calendar_loading: false,
                locations: [],
                assignEvent: {},
                showAssignTeam: false
            }
        },

        computed: {
            eventSources() {
                if (!this.selectedLocation) return []

                if (this.booking_spot_mode) {
                    return [
                        {
                            events: this.getDailySpots,
                            id: 'src_forecasted'
                        }
                    ]
                } else {
                    return [
                        {
                            events: this.getFutureBookings,
                            id: 'src_forecasted'
                        },
                        {
                            events: this.getActiveBookings,
                            id: 'src_confirmed'
                        }
                    ]
                }


            },
            total_bookings() {
                return 0;
            },

            total_revenue() {
                let total = 0;

                return total.toFixed(2)
            },
            total_hours() {
                let total = 0;

                return total
            },
            total_availability() {
                let total = 0;

                return total
            },
            starting_time() {
                //depending on which day it would choose the time to start

            },
            isDragging() {
                return this.dragging > -1
            }
        },

        watch: {
            booking_spot_mode(val) {
                if (val)
                    this.changeView('dayGridMonth')
            }
        },

        created() {
            this.dt_format = this.$helpers.toElFormat(this.$date_format)
            this.calendar_date = this.$moment().toDate()
        },
        mounted() {
            // first set the location
            // there is always 1 default non-deletable location
            (async () => {
                try {
                    this.loading = true


                    this.locations = (await this.axios.get('/companies/current/locations', {
                        params: {
                            filter: {
                                where: {
                                    active: true
                                }
                            }
                        }
                    })).data


                    // now get location business hours
                    this.selectedLocation.booking_spots.forEach((day) => {
                        if (day.opened) {
                            this.businessHours.push({
                                daysOfWeek: [day.day_id],
                                startTime: day.opening_time,
                                endTime: day.closing_time
                            })
                        }

                        if (this.$moment(day.opening_time, "HH:mm").unix() <= this.$moment(this.earliest_open_time, "HH:mm").unix()) {
                            this.earliest_open_time = day.opening_time
                        }
                    })

                    // now get events based on the location

                    this.$refs.schedule_calendar.getApi().refetchEvents()
                    this.getTeams()
                    this.getTeamResources()

                    this.loading = false
                } catch (err) {
                    this.loading = false
                }
            })()


        },

        methods: {
            locationChanged() {
                this.getTeamResources()
                this.getTeams()
                this.$refs.schedule_calendar.getApi().refetchEvents()
            },
            loadSchedule() {
                this.$refs.schedule_calendar.getApi().refetchEvents()
            },
            handleCommand(command) {
                if (command === 'assign') {
                    this.assign_team_drawer = true
                }
            },
            editBooking(mode) {
                this.editMode = mode
                this.editDialog = true
            },
            editBookingClosed() {
                this.editDialog = false;
                this.editMode = ''
                //reload booking if need be

            },
            viewBooking(id, service_date) {
                this.$router.push({name: 'dashboard_booking_view', params: {id: id, service_date: service_date}})
            },
            changeCalendarDate(val) {
                this.date_range = val
                this.$refs.schedule_calendar.getApi().gotoDate(val);
            },
            eventReceive(event) {
            },
            eventAfterAllRender(view) {

            },
            eventResize(info) {
                this.$message.warning('This feature is being updated, check again later today')
                info.revert()
                return;
            },
            getTeamResources() {
                this.resources = []
                this.axios.get('/companies/current/teams', {
                    params: {
                        filter: {
                            where: {active: true},
                            include: ["members"]
                        }
                    }
                })
                    .then(res => {
                        res.data.forEach(team => {
                            if (team.members) {
                                team.members.forEach(member => {
                                    this.resources.push({
                                        id: member.id,
                                        title: member.fullname,
                                        groupId: team.name
                                    })
                                })
                            }

                        })


                    })
            },

            eventClick(mouseEnterInfo) {

                if (this.booking_spot_mode) {
                    this.eventSpotClick(mouseEnterInfo)
                    return
                }

                (async () => {
                    try {


                        this.loading_details = true
                        this.dialogs.booking_view = true
                        if (mouseEnterInfo.event.source.id !== 'src_events') {
                            this.preview_booking = (await this.axios.get('/bookings/' + mouseEnterInfo.event.id, {
                                params: {
                                    filter: {
                                        include: [
                                            {
                                                relation: 'account'
                                            },
                                            {
                                                relation: 'charge'
                                            },
                                            {
                                                relation: 'address'
                                            },
                                            {
                                                relation: 'service_details',
                                                scope: {
                                                    include: "pricing_variables"
                                                }
                                            },
                                            {
                                                relation: 'team_assignments',
                                                scope: {
                                                    include: 'team'
                                                }
                                            },
                                            {
                                                relation: 'workdiary'
                                            },
                                            {
                                                relation: 'assigned_checklists',
                                                scope: {
                                                    include: 'tasks'
                                                }
                                            },
                                            {
                                                relation: 'images'
                                            }
                                        ]
                                    }
                                }
                            })).data
                        } else {
                            this.preview_booking = (await this.axios.get('/calendar_events/' + mouseEnterInfo.event.id)).data
                            this.preview_booking.is_event = true
                        }


                        this.preview_booking.total_booking_time = (await this.axios.get('/timesheets/total-hours', {
                            params: {
                                where: {
                                    bookingId: bookingId
                                }
                            }
                        })).data


                        this.loading_details = false

                    } catch (err) {
                        this.loading_details = false
                    }
                })()


            },
            eventSpotClick(info) {
                if (info)
                    this.selectedEvent = info

                this.loading_bookings = true;
                this.axios
                    .get("/bookings/schedule", {
                        params: {
                            from: this.$moment.utc(this.selectedEvent.event.start)
                                .startOf("day")
                                .toISOString(),
                            to: this.$moment.utc(this.selectedEvent.event.start)
                                .endOf("day")
                                .toISOString(),
                            include: [{"team_assignments": "team"}, {"service_details": "pricing_variables"}, "charge", "account", "address"],
                            type: "charges",
                            forecasted: true,
                            page: this.current_page,
                            filter: {limit: 5},
                            status: 'active',
                            where: {locationId: this.selectedLocation.id}
                        }
                    })
                    .then(res => {
                        this.loading_bookings = false
                        this.popover_bookings = res.data.data;
                        this.total_records = res.data.meta.totalItemCount;
                        this.page_size = res.data.meta.itemsPerPage;
                    })
                    .catch()
                    .finally(_ => {
                        this.loading_bookings = false;
                    });

                this.showBookingsPreview = true
            },

            eventMouseLeave(mouseLeaveInfo) {
                //make sure that the leave matches the currently onpen one
                // this.showPopover = false
                //this.eventPopover.destroy()
                //this.eventPopover = null
            },
            eventPositioned: function (info) {

            },

            dropBooking(event) {
                event.preventDefault()
            },
            assignTeam(event) {
            },
            handleDateClick(arg) {
            },

            getTeams() {

                this.loading_teams = true

                let filter = {}

                if (this.teams_filter === 0) {

                } else if (this.teams_filter === 1) {
                    filter.where = {
                        active: true,
                    }
                } else if (this.teams_filter === 2) {
                    filter.where = {
                        active: true,
                        locationIds: this.selectedLocation.id
                    }
                }

                filter.order = (this.order_by === 'rating') ? 'rating ASC' : 'name ASC'

                this.axios.get('/companies/current/teams',
                    {
                        params: {
                            filter: filter
                        }
                    })
                    .then(res => {
                        this.teams = res.data
                    })
                    .catch(err => {

                    })
                    .finally(() => {
                        this.loading_teams = false
                    })
            },

            resetEventForm() {
                this.eventForm = {
                    title: '',
                    start: '',
                    comment: '',
                    address: '',
                    teamId: [],
                    duration: 0,
                    bookingId: '',
                    customer: ''
                }
            },

            loadingSources(isLoading) {
                this.calendar_loading = isLoading
            },

            eventDragStop(info) {
                let jsEvent = info.jsEvent
                let event = info.event

                hideAll()

                var _vuethis = this

                $('.team-resource-item').each(function (index, elem) {
                    if (_vuethis.isEventOverDiv(elem.id, jsEvent.clientX, jsEvent.clientY)) {
                        _vuethis.assignEvent = {
                            bookingId: event.id,
                            service_date: _vuethis.$moment(event.start).toISOString(),
                            teamId: _vuethis.teams[index].id,
                            team: _vuethis.teams[index]
                        }

                        _vuethis.showAssignTeam = true
                    }
                })

            },

            isEventOverDiv(id, x, y) {
                var external_events = $('#' + id);
                var offset = external_events.offset();
                offset.right = external_events.width() + offset.left;
                offset.bottom = external_events.height() + offset.top;

                // Compare
                if (x >= offset.left
                    && y >= offset.top
                    && x <= offset.right
                    && y <= offset.bottom) {
                    return true;
                }
                return false;
            },

            getActiveBookings(fetchInfo, successCallback, failureCallback) {
                if (this.booking_spot_mode) return successCallback([])

                let params = {
                    from: fetchInfo.startStr,
                    to: fetchInfo.endStr,
                    type: "events",
                    forecasted: false,
                    status: (this.bookings_filter === 'forecasted') ? 'active' : this.bookings_filter,
                    where: {locationId: this.selectedLocation.id}
                }

                if (this.filter_team.length > 0) {
                    params.targetType = 'all_teams'
                    params.targetTypeId = this.filter_team
                }

                this.axios
                    .get("/bookings/schedule", {
                        params: params
                    })
                    .then(res => {
                        this.active_bookings = res.data;
                        successCallback(res.data)
                    })
                    .catch(() => {
                        failureCallback()
                    })
                    .finally(_ => {
                        this.bb_loading = false;
                    });
            },

            getFutureBookings(fetchInfo, successCallback, failureCallback) {

                return successCallback([])

                if (this.booking_spot_mode) return successCallback([])

                if (this.bookings_filter === 'cancelled' || this.bookings_filter === 'completed') return successCallback([])

                let params = {
                    from: fetchInfo.startStr,
                    to: fetchInfo.endStr,
                    type: "events",
                    forecasted: true,
                    status: (this.bookings_filter === 'forecasted') ? 'active' : this.bookings_filter,
                    where: {locationId: this.selectedLocation.id},
                    exclude_original: true
                }

                if (this.filter_team.length > 0) {
                    params.targetType = 'all_teams'
                    params.targetTypeId = this.filter_team
                }

                this.axios
                    .get("/bookings/schedule", {
                        params: params
                    })
                    .then(res => {
                        this.active_bookings = res.data;
                        successCallback(res.data)
                    })
                    .catch(() => {
                        failureCallback()
                    })
                    .finally(_ => {
                        this.bb_loading = false;
                    });
            },


            getDailySpots(fetchInfo, successCallback, failureCallback) {

                if (!this.booking_spot_mode) return successCallback([])


                let params = {
                    from: fetchInfo.startStr,
                    to: fetchInfo.endStr,
                    type: "events",
                    forecasted: true,
                    status: (this.bookings_filter === 'forecasted') ? 'active' : this.bookings_filter,
                    where: {locationId: this.selectedLocation.id},
                    exclude_original: true
                }

                if (this.filter_team.length > 0) {
                    params.targetType = 'all_teams'
                    params.targetTypeId = this.filter_team
                }

                this.axios
                    .get("/booking_spots/schedule", {
                        params: params
                    })
                    .then(res => {
                        successCallback(res.data)
                    })
                    .catch(() => {
                        failureCallback()
                    })
                    .finally(_ => {
                        this.bb_loading = false;
                    });
            },

            changeView(view) {

                if (view === 'resourceTimeGridDay' || view === 'resourceTimeline')
                    this.show_teams = false
                else
                    this.show_teams = true

                this.current_view = view
                this.getTeamResources()
                this.getTeams()
                this.$refs.schedule_calendar.getApi().changeView(view);
            },

            getBookingDetails(id) {
                return new Promise((resolve, reject) => {
                    this.axios.get('/bookings/' + id, {
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
                            resolve(res.data)
                        })
                        .catch(err => {
                            reject(err)
                        })
                        .finally(() => {
                        })
                })

            },

            getSpotDetails(event) {
                return new Promise((resolve, reject) => {
                    this.axios.get('/booking_spots/day', {
                        params: {
                            day: this.$moment(event.start).format('YYYY-MM-DD'),
                            locationId: this.selectedLocation.id
                        }
                    })
                        .then(res => {
                            resolve(res.data)
                        })
                        .catch(err => {
                            reject(err)
                        })
                        .finally(() => {
                        })
                })
            },

            eventRenderer(info) {
                //saving the tippy on the info

                if (this.booking_spot_mode) {
                    if (info.event.extendedProps.revenue) {
                        info.el.innerHTML += "<span class='day-revenue'><strong></strong>" + this.$currency + info.event.extendedProps.revenue.toFixed(2) + "</span></span>"
                        info.el.innerHTML += "<span class='day-scheduled'><strong></strong>" + info.event.extendedProps.scheduled + " scheduled</span></span>"
                        info.el.innerHTML += "<span class='day-assigned'><strong></strong>" + info.event.extendedProps.scheduled + " assigned</span></span>"
                    }
                    this.loadSpotTooltip(info)
                } else {
                    this.loadBookingTooltip(info)
                }

            },

            loadBookingTooltip(info) {
                info.tippy = tippy(info.el, {
                    content: 'loading...',
                    theme: 'light',
                    animation: 'scale',
                    maxWidth: 350,
                    allowHTML: true,
                    delay: [500, 500],
                    onShow: (instance) => {
                        this.getBookingDetails(info.event.id).then(res => {
                            let tippy_content = "<span><label>Customer:</label> " + res.account.fullname + "</span>"
                            tippy_content += "<span><label>Address: </label>" + res.address.full_address + "</span>"
                            tippy_content += "<span><label>Total After Tax: </label>" + this.$currency + res.charge.total_after_tax + "</span>"
                            tippy_content += "<span><label>Payment method: </label>" + res.payment_type + "</span>"
                            tippy_content += "<span><label>Frequency: </label><strong>" + res.frequency.name + "</strong></span>"

                            tippy_content += "<span><label>Services</label>"

                            res.service_details.forEach((service) => {
                                tippy_content += "<i>" + service.name + "</i>"
                            })

                            tippy_content += "</span>"

                            if (res.team_assignments.length > 0) {
                                tippy_content += "<span><strong>Assigned to:</strong>"
                                res.team_assignments.forEach((assignment) => {
                                    if (assignment.team_model === 'account')
                                        tippy_content += "<i style='display:block;'>" + assignment.team.name + "</i>"
                                    else {
                                        if (assignment.team.members && assignment.team.members.length > 0) {
                                            assignment.team.members.forEach(member => {
                                                tippy_content += "<i style='display:block;'>" + member.fullname + "</i>"
                                            })
                                        }
                                    }
                                })
                                tippy_content += "</span>"
                            } else {
                                tippy_content += "<span>Not assigned</span>"
                            }


                            tippy_content = "<div class='booking-tipy-container'>" + tippy_content + "</div>"

                            instance.setContent(tippy_content)
                        })
                    }
                })
            },

            loadSpotTooltip(info) {
                info.tippy = tippy(info.el, {
                    content: 'loading...',
                    theme: 'light',
                    animation: 'scale',
                    maxWidth: 350,
                    allowHTML: true,
                    delay: [500, 500],
                    onShow: (instance) => {
                        this.getSpotDetails(info.event).then(res => {

                            let tippy_content = "<span><label>Day:</label> " + this.$moment(res.day_details.day).format(this.$date_format) + "</span>"
                            tippy_content += "<span><label>Opened: </label>" + (res.day_details.opened ? 'Yes' : 'No') + "</span>"
                            tippy_content += "<span><label>Total Revenue: </label><strong>" + this.$currency + res.day_details.revenue.toFixed(2) + "</strong></span>"

                            tippy_content += "<span><label>Slots</label>"

                            res.day_details.spots.forEach((spot) => {
                                tippy_content += "<i>" + this.$moment(spot.time, 'HH:mm').format(this.$time_format) + ", </i>"
                            })

                            tippy_content += "</span>"

                            if (res.bookings.length > 0) {
                                tippy_content += "<span><strong>Bookings:</strong>"
                                res.bookings.forEach((booking) => {
                                    tippy_content += "<i style='display:block;'>" + booking.address.full_address + " <strong>(" + (this.$moment(booking.service_date).format(this.$time_format)) + ") </strong>" + "</i>"

                                    /* if (assignment.team_model === 'account')
                                         tippy_content += "<i style='display:block;'>" + assignment.team.name + "</i>"
                                     else {
                                         assignment.team.members.forEach(member => {
                                             tippy_content += "<i style='display:block;'>" + member.fullname + "</i>"
                                         })
                                     }*/
                                })
                                tippy_content += "</span>"
                            } else {
                                tippy_content += "<span>No bookings</span>"
                            }

                            tippy_content = "<div class='booking-tipy-container'>" + tippy_content + "</div>"

                            instance.setContent(tippy_content)
                        })
                    }
                })
            },

            eventDrop(info) {
                // info.revert()
                //return;

                this.$message.warning('This feature is being updated, check again later today')
                info.revert()
                return;

                this.confirmInfo = info

                info.el._tippy.hide()

                this.axios.get('/bookings/' + info.event.id + '/forecasted/details', {
                    params: {
                        service_date: info.event.start,
                        old_service_date: info.oldEvent.start
                    }
                })
                    .then(res => {
                        this.confirmInfo.recurring_details = res.data
                        this.confirmDialog = true
                    })
                    .catch(err => {
                        this.confirmInfo.revert()
                        this.$helpers.errorHandle(err, this)
                    })
            },

            confirmChange(proceed) {

                if (!proceed) {
                    this.confirmDialog = false
                    this.confirmInfo.revert()
                    this.confirmInfo = false
                    return
                }

                // now if its a booking
                this.axios.post('/bookings/' + this.confirmInfo.event.id + '/reschedule',
                    {
                        from: this.confirmInfo.oldEvent.start,
                        to: this.confirmInfo.event.start,
                        forecasted: this.confirmInfo.event.extendedProps.forecasted,
                        recurring_mode: this.recurring_mode
                    })
                    .then(res => {
                        // reload calendar
                        this.recurring_mode = ''
                    })
                    .catch(err => {
                        // if there's an error from server revert
                        this.confirmInfo.revert()
                    })
                    .then(a => {
                        this.recurring_mode = ''
                        this.confirmDialog = false

                        this.$refs.schedule_calendar.getApi().refetchEvents()
                    })

                // proceed and post the change
            },
            isRecurring(event) {
                return (event.extendedProps.parent_id !== event.id || event.extendedProps.frequency !== 'onetime')
            },

            selectAllow: function (selectInfo) {
                return this.$moment().diff(selectInfo.start) <= 0
            },
            eventAllow: function (dropInfo) {
                return (this.$moment(dropInfo.start).unix() >= this.$moment().unix()) // a boolean
            },
            addEvent() {
                this.$router.push({name: "dashboard_booking_event"})
            },
            saveEvent() {
                this.$refs.eventfrm.validate((valid) => {
                    if (valid) {
                        this.axios.post('/companies/current/calendar_events', this.eventForm)
                            .then(res => {
                                this.$helpers.successHandle('Event saved to calendar', this)
                                this.eventDialog = false
                                this.$refs.schedule_calendar.getApi().refetchEvents()
                            })
                            .catch(err => {

                            })
                    }
                })
            },
            getBookingTimesheeTotal(bookingId) {
                this.axios.get('/timesheets/total-hours', {
                    params: {
                        where: {
                            bookingId: bookingId
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

            },
            popupGetTeamBookings(teamIds) {

                let from, to
                if (this.current_view === 'dayGridMonth') {
                    from = this.$moment(this.calendar_date).startOf('month').toISOString()
                    to = this.$moment(this.calendar_date).endOf('month').toISOString()
                } else if (this.current_view === 'timeGridWeek') {
                    from = this.$moment(this.calendar_date).startOf('week').toISOString()
                    to = this.$moment(this.calendar_date).endOf('week').toISOString()
                } else {
                    from = this.$moment(this.calendar_date).startOf('day').toISOString()
                    to = this.$moment(this.calendar_date).endOf('day').toISOString()
                }

                this.loading_team_schedule = true
                this.axios.get("/bookings/schedule",
                    {
                        params: {
                            from: from,
                            to: to,
                            type: 'bookings',
                            forecasted: false,
                            targetType: 'member',
                            targetTypeId: teamIds,
                            status: 'active',
                            page: this.current_page,
                            filter: {limit: 10},
                        }
                    })
                    .then(res => {
                        this.team_schedule = res.data.data
                        this.total_records = res.data.meta.totalItemCount;
                        this.page_size = res.data.meta.itemsPerPage;
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this)
                    })
                    .finally(() => {
                        this.loading_team_schedule = false
                    })
            },
            confirmTeamAssignment() {

                //heck if team is already assigned
                (async () => {
                    try {

                        let exists = (await this.axios.get('/team_assignments', {
                            params: {
                                filter: {
                                    where: {
                                        companyId: this.$auth.user().company.id,
                                        teamId: this.assignEvent.team.id,
                                        bookingId: this.assignEvent.bookingId
                                    }
                                }
                            }
                        })).data

                        console.log(exists)

                        if (exists.length > 0) {
                            await this.axios.patch('/team_assignments/' + exists[0].id, {
                                teamId: this.assignEvent.teamId,
                                team_model: 'team',
                                pay_rate: this.assignEvent.team.pay_rate,
                                pay_rate_type: this.assignEvent.team.pay_rate_type
                            })
                            console.log('updating')
                        } else {
                            await this.axios.post('/bookings/' + this.assignEvent.bookingId + '/team_assignments', {
                                companyId: this.$auth.user().company.id,
                                teamId: this.assignEvent.teamId,
                                team_model: 'team',
                                pay_rate: this.assignEvent.team.pay_rate,
                                pay_rate_type: this.assignEvent.team.pay_rate_type
                            })
                            console.log('adding assignment')
                        }

                        this.assignEvent = {}
                        this.showAssignTeam = false
                        this.$message.success('Team successfully assigned')
                        this.$refs.schedule_calendar.getApi().refetchEvents()

                    } catch (err) {
                        this.$helpers.errorHandle(err)

                    }
                })()


            },

            selectTeam(team, index) {
                if (this.filter_team.indexOf(team.id) !== -1) {
                    this.filter_team.splice(this.filter_team.indexOf(team.id), 1)
                } else {
                    this.filter_team.push(team.id)
                }

                this.$refs.schedule_calendar.getApi().refetchEvents()

            }


        }
    }
</script>

<style lang='scss'>


    .popover_content {
        background: red;
        z-index: 10000;
        height: 200px;
        width: 200px;
    }

    .calendar-booking-detail-dialog {

        .el-dialog__header, .el-dialog__footer {
            display: none;
        }

        .booking_events {
            label {
                display: block;
                marging: 5px 0px;
            }
        }

        .booking-calendar-customer-detail {
            width: calc(100% - 150px);
            display: inline-block;
            margin-left: 15px;
        }

        .timer-band {
            padding: 10px;
            background: $launch-primary-color;
            color: white;
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            width: 100%;
            text-transform: uppercase;
            box-sizing: border-box;
            font-size: 19px;
            margin-bottom: 20px;
            margin-top: 10px;
        }

        .charge {
            font-weight: bold;
            color: red;
        }

        .labels {
            label {
                display: block;
                width: 100%;
                color: $launch-brand-color;
            }
        }
    }


    .tippy-popper {
        /*   background: white;
           color:black;*/
    }

    .booking-tipy-container {
        /* background: white;
         color:black;*/

        min-width: 250px;

        span {
            display: block;
            margin-bottom: 10px;

            label {
                font-size: 10px;
                display: block;
            }

        }
    }


    .team-popover {
        .team-booking-card {
            span {
                display: block;
            }
        }

        .team-content {
            .customer-details {
                margin-left: 10px;
                display: inline-block;
                width: calc(100% - 40px);

                span {
                    display: block;
                }
            }
        }

    }

    .bookings-calendar {

        .el-date-editor {
            input {
                border-radius: 25px;
            }
        }

        ul.team-list {
            padding: 0px;
            display: block;
            cursor: pointer;

            div.team-detail {
                height: calc(100%);
                line-height: 1.6;
                margin-left: 10px;
                width: 100%;
                position: relative;

                span:not(.el-rate__item) {
                    text-overflow: ellipsis;
                    display: block;
                    width: calc(100% - 50px);
                    overflow: hidden;
                    white-space: nowrap;
                }

                .el-icon-date {
                    position: absolute;
                    right: 10px;
                    top: 10px;
                    font-size: 20px;
                }
            }

            li {
                display: block;
                padding: 7px 10px;
                box-sizing: border-box;
                border-left: 4px solid white;
                cursor: pointer;

                &:hover {
                    background: #f3f3f3;
                    border-left: 4px solid #f3f3f3;
                }

                .profile-avatar {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    float: left;
                    margin-right: 5px;
                }

                small {
                    display: block;
                    color: $launch-text-color;
                    font-size: 11px;
                }


                &.active {
                    border-left: 4px solid $launch-primary-color;
                    background: $launch-dashboard-bg-color;
                }

                p {
                    margin: 0px;
                    padding: 0px;
                    line-height: 1;
                    color: black;
                }
            }
        }

        .fc-toolbar {
            position: absolute;
            top: -35px;
            right: 0;
            left: 0;
            width: 200px;
            margin: 0 auto;
        }

        .el-collapse {
            background: white;

            .el-collapse-item__wrap {
                border: none;
            }

            .el-collapse-item {
                padding: 5px 10px;
                border-bottom: 1px solid #f3f3f3;

                .el-collapse-item__header {
                    div.team-detail {
                        height: calc(100%);
                        line-height: normal;
                        margin-left: 10px;
                        padding-top: 5px;
                        width: 100%;
                        position: relative;

                        span:not(.el-rate__item) {
                            text-overflow: ellipsis;
                            display: block;
                            width: calc(100% - 50px);
                            overflow: hidden;
                            white-space: nowrap;
                        }

                        .el-icon-date {
                            position: absolute;
                            right: 10px;
                            top: 10px;
                            font-size: 20px;
                        }
                    }
                }

            }
        }


        .nav-bar {
            width: 100%;
            background: #eaeeef;
            padding: 10px;
            -webkit-box-sizing: border-box;
            box-sizing: border-box;
        }


        @import '~@fullcalendar/core/main.min.css';
        @import '~@fullcalendar/daygrid/main.min.css';
        @import '~@fullcalendar/timegrid/main.min.css';
        @import '~@fullcalendar/timeline/main.min.css';
        @import '~@fullcalendar/resource-timeline/main.min.css';
        @import '~@fullcalendar/list/main.min.css';

        .team-card {
            .el-card__body {
                padding: 10px;
            }
        }

        .fc-col-resizer {
            display: none;
        }

        .fc-center {
            font-size: 9px;
        }

        .fc-event {
            padding: 3px 5px;
            // box-shadow: none !important;


            i.assigned {
                position: absolute;
                right: 5px;
                top: 1px;
                border: 1px solid red;
                /* padding: 5px; */
                border-radius: 50%;
                height: 10px;
                width: 10px;
                text-align: center;
                line-height: 10px;
                background: red;
                color: white;
                font-style: normal;
            }

            .day-scheduled, .day-assigned, .day-revenue {
                display: block;
            }

            .day-revenue {
                font-weight: 600;
                font-size: 14px;
            }
        }

        .fc-more-cell {
            font-weight: bold;
        }

        .fc-content {

        }

        .reschedule-dialog {

            .el-dialog__header {
            }

            .el-dialog__body {

                color: black;

                p {
                    color: black;

                    strong {
                        width: 100px;
                        display: inline-block;
                    }
                }
            }

            .el-dialog__footer {

            }
        }

        .calendar-footer {
            padding: 20px;
            background: white;
            box-shadow: 0px -2px 2px -1px #f3f3f3;
            /* position: absolute;
                     bottom: 0;
                     right: 0;
                     left: 0;*/

            span,
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
        }

        .main-filters {


            .filter {
                margin-right: 10px;
            }
        }

        .drop.over {
            border-color: #aaa;
            background: #ccc;
        }

    }

    #teamList {
        background: white;
    }

</style>
