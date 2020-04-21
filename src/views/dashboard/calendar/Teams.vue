<template>
  <div class="bookings-calendar">
    <calendar-menu/>

    <el-card class="calendar-card" style="border:none; margin-bottom: 10px;">
      <div class="flex-row calendar-options-bar">
        <div class="main-filters" v-if="false">
          <el-select class="filter small no-border pull-right" placeholder="Service" v-model="filter">
            <el-option value="test">
              Test
            </el-option>
          </el-select>

          <el-select class="filter small no-border pull-right" placeholder="Location" v-model="filter">
            <el-option value="test">
              Test
            </el-option>
          </el-select>

          <el-select class="filter small no-border pull-right" placeholder="Teams" v-model="filter">
            <el-option value="test">
              Test
            </el-option>
          </el-select>
        </div>

        <div class="main-filters">
          <el-select class="filter small" style="width: 300px;" v-if="selectedLocation" v-model="selectedLocation" value-key="id">
            <el-option :label="location.name" :value="location" v-for="location in $auth.user().company.locations"/>
          </el-select>

          <el-divider direction="vertical"/>

          <el-select class="filter small" v-model="date_month">
            <el-option label="January" value="1"/>
            <el-option label="February" value="2"/>
            <el-option label="March" value="3"/>
            <el-option label="April" value="4"/>
            <el-option label="May" value="5"/>
            <el-option label="June" value="6"/>
            <el-option label="July" value="7"/>
            <el-option label="August" value="8"/>
            <el-option label="September" value="9"/>
            <el-option label="October" value="10"/>
            <el-option label="November" value="11"/>
            <el-option label="December" value="12"/>
          </el-select>
        </div>

        <div class="main-filters">
          <el-radio-group size="mini" v-model="calendar_view">
            <el-radio-button @click.native="changeView('month')" label="month">
              Month
            </el-radio-button>
            <el-radio-button @click.native="changeView('week')" label="week">
              Week
            </el-radio-button>
            <el-radio-button @click.native="changeView('day')" label="day">
              Day
            </el-radio-button>
          </el-radio-group>
        </div>

        <div v-if="$can('manage', 'manage_appointment')">
          <el-button @click="addEvent()" icon="el-icon-plus" round size="mini" type="primary">
            Add Event
          </el-button>
          <el-button @click="$router.push({name: 'dashboard_settings_services_add'})" icon="el-icon-plus" size="mini" type="text">
            Add Service
          </el-button>
          <el-button disabled icon="el-icon-edit" size="mini" type="text">
            Edit
          </el-button>
        </div>
      </div>
    </el-card>

    <el-row :gutter="20">
      <el-col :md="18" :sm="18">
        <el-card v-loading="loading">
          <full-calendar :business-hours="businessHours" :dates-render="datesRender" :day-render="dayRender" :drag-revert-duration="0" :editable="true" :event-after-all-render="eventAfterAllRender" :event-allow="eventAllow" :event-render="eventRenderer" :event-sources="eventSources"
                         :header="{ left: 'prev,next today', center: 'title', right: 'dayGridMonth, timeGridWeek,timeGridDay, listDay, listWeek, listMonth' }" :plugins="calendarPlugins" :progressive-event-rendering="true" :select-allow="selectAllow" :selectable="true" :views="{
                           listDay: { buttonText: 'list day' },
                           listWeek: { buttonText: 'list week' },
                           listMonth: { buttonText: 'list month' },
                           dayGridMonth : {
                             eventLimit : 3
                           }}"
                         @dateClick="handleDateClick"
                         @eventClick="eventMouseEnter"
                         @eventDragStop="eventDragStop"
                         @eventDrop="eventDrop"

                         @eventReceive="eventReceive"
                         @eventResize="eventResize" default-view="dayGridMonth" ref="scheduleCalendar" slot-duration="00:30:00"
          />
        </el-card>
        <el-row class="calendar-footer">
          <el-col :md="6" :sm="6" :xs="12" class="first">
            <span class="stats-number _first">0</span>
            <label>Total Bookings</label>
          </el-col>

          <el-col :md="6" :sm="6" :xs="12" class="second">
            <span class="stats-number _second">0</span>
            <label>Total Hours</label>
          </el-col>

          <el-col :md="6" :sm="6" :xs="12" class="third">
            <span class="stats-number _third">0</span>
            <label>Total Availability</label>
          </el-col>

          <el-col :md="6" :sm="6" :xs="12" class="fourth">
            <span class="stats-number _fourth">0</span>
            <label>Total Revenue</label>
          </el-col>
        </el-row>
      </el-col>

      <el-col :md="6" :sm="6" class="bg-white" style="min-height:963px;">
        <el-divider>Available Teams</el-divider>

        <div id="teamList" style="padding: 0px 10px 10px 0px; box-sizing: border-box;">
          <drag data-event="{title : 'test', start : '2019-11-18'}" v-for="team in teams">
            <el-card :body-style="{padding: '5px;'}" @dragenter="dropBooking" @drop="dropBooking"
                     class="team-card" style="box-shadow:none;margin-bottom: 5px; border-radius:0px;"
            >
              <avatar :background-color="team.color" :size="42" :username="team.name" color="white" style="float:left; margin-right: 5px"/>
              <div class="team-content">
                <span><strong>{{ team.name }}</strong></span>
                <small>(0 bookings)</small>
                <div>
                  <span v-if="team.pay_rate_type === 'percent'">Wage: {{ team.pay_rate + "%" }} </span>
                  <span v-if="team.pay_rate_type === 'hourly'">Wage: {{ $currency }}{{ team.pay_rate + "/hr" }} </span>
                </div>
              </div>
              <el-button-group>
                <el-link @click="teamDetailDrawer = true" size="mini" type="primary">
                  View Bookings
                </el-link>
                <el-link size="mini" type="primary">
                  Team Profile
                </el-link>
              </el-button-group>
            </el-card>
          </drag>
        </div>
      </el-col>
    </el-row>

    <el-dialog :visible.sync="confirmDialog" append-to-body class="reschedule-dialog" title="Confirm Reschedule" width="50%">
      <h4>Do you wish to reschedule the appointment?</h4>
      <div v-if="confirmInfo">
        <p><strong>From: </strong> {{ $moment(confirmInfo.oldEvent.start).format($date_format + ' ' + $time_format) }}</p>
        <p><strong>To: </strong>{{ $moment(confirmInfo.event.start).format($date_format + ' ' + $time_format) }}</p>

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

    <el-dialog :append-to-body="true" :modal="true" :visible.sync="eventDialog" class="event-dialog" title="Event" top="5vh" width="60%">
      <div class="modal-body">
        <el-form :model="eventForm" :rules="event_rules" label-position="top" ref="eventfrm">
          <el-row :gutter="20">
            <el-col :md="12" :sm="12">
              <el-form-item label="Event title" prop="title">
                <el-input type="text" v-model="eventForm.title"/>
              </el-form-item>

              <el-form-item label="Date & Time" prop="start">
                <el-date-picker type="datetime" v-model="eventForm.start"/>
              </el-form-item>

              <el-form-item prop="duration">
                <duration-picker v-model="eventForm.duration"/>
              </el-form-item>
            </el-col>

            <el-col :md="12" :sm="12">
              <el-form-item label="Location">
                <el-input v-model="eventForm.address"/>
              </el-form-item>

              <el-form-item label="Customer">
                <el-input v-model="eventForm.customerId"/>
              </el-form-item>

              <el-form-item label="Comment">
                <el-input :rows="5" type="textarea" v-model="eventForm.comment"/>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <div slot="footer">
        <el-button @click="eventDialog = false" round size="small">
          Cancel
        </el-button>
        <el-button @click="saveEvent()" round size="small" type="primary">
          Add Event
        </el-button>
      </div>
    </el-dialog>

    <el-drawer :visible.sync="teamDetailDrawer" title="Assigned Bookings">
      <div/>
    </el-drawer>

    <el-dialog class="calendar-booking-detail-dialog" :modal="true" :modal-append-to-body="false" :visible.sync="dialogs.booking_view" append-to-body title="Booking Detail" width="40%">
      <div class="modal-body">
        <el-row v-if="preview_booking">
          <el-col>
            <div>
              <account-avatar :account="preview_booking.account" :size="48"></account-avatar>
              <div class="booking-calendar-customer-detail">
                <small>{{preview_booking.account.fullname}}</small>
                <strong style="display:block;">{{preview_booking.service_details[0].name}}</strong>
                <small style="display:block;">{{$moment(preview_booking.service_date).format($time_format)}} , {{$moment(preview_booking.service_date).format($date_format)}}</small>
                <small style="display:block;">{{preview_booking.address.full_address}}</small>
                <label></label>
              </div>
            </div>

            <el-divider></el-divider>

            <el-row class="timer-band">
              <el-col :md="12" :sm="12">
                <span>Time Logged</span>
              </el-col>
              <el-col :md="12" :sm="12">
                <span>00:00</span>
              </el-col>
            </el-row>

            <el-divider></el-divider>


            <el-button-group>
              <el-button size="mini" type="warning">Charge</el-button>
              <el-button size="mini">Put on Hold</el-button>
              <el-button size="mini">Edit</el-button>
              <el-button size="mini">Assign Team</el-button>
              <el-button size="mini" type="danger">Cancel</el-button>

            </el-button-group>

          </el-col>
        </el-row>
      </div>
      <div slot="footer">

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
    import draggable from 'vuedraggable'
    import CalendarMenu from './CalendarMenu'
    import AccountAvatar from "../../../components/AccountAvatar";

    export default {
        components: {
            AccountAvatar,
            FullCalendar,
            Avatar,
            draggable,
            CalendarMenu
        },
        data() {
            return {
                filter: '',
                calendar_view: '',
                calendarPlugins: [interactionPlugin, dayGridPlugin, timeGrid, rrulePlugin, listPlugin],
                events: [],
                confirmDialog: false,
                confirmInfo: false,
                editMode: 'only_booking',
                recurring_mode: '',
                range: [],
                date_month: '',
                businessHours: [],
                loading: true,
                selectedLocation: false,
                teams: [],
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
                    booking_view: false
                },
                preview_booking: false
            }
        },

        computed: {
            eventSources() {
                if (!this.selectedLocation) return []

                return [
                    {
                        events: this.getFutureBookings,
                        color: '#d5eefc', // a non-ajax option
                        textColor: 'black' // a non-ajax option
                    },
                    {
                        events: this.getActiveBookings,
                        color: '#9ce7d1',
                        textColor: 'black' // a non-ajax option
                    },
                    {
                        events: this.getCalendarEvents,
                        color: 'yellow',
                        textColor: 'black' // a non-ajax option
                    }

                ]
            }
        },

        created() {
            this.range = [this.$moment().startOf('month').format('YYYY-MM-DD'), this.$moment().endOf('month').format('YYYY-MM-DD')]
            this.date_month = this.$moment().format('M')
        },
        mounted() {
            // first set the location
            // there is always 1 default non-deletable location
            (async () => {
                try {
                    this.loading = true
                    let company = await this.axios.get('/companies/current')

                    this.selectedLocation = company.data.locations[0]

                    // now get location business hours
                    this.selectedLocation.booking_spots.forEach((day) => {
                        if (day.opened) {
                            this.businessHours.push({
                                daysOfWeek: [day.day_id],
                                startTime: day.opening_time,
                                endTime: day.closing_time
                            })
                        }
                    })

                    // now get events based on the location

                    this.getTeams()

                    this.loading = false
                } catch (err) {
                    this.loading = false
                }
            })()
        },

        methods: {
            eventReceive(event) {
                console.log('received')
            },
            eventAfterAllRender(view) {
                let containerEl = document.getElementById('teamList')
                new Draggable(containerEl, {
                    itemSelector: '.team_example'
                })
            },
            allowDrop(ev) {
                console.log(ev)
                if (ev) {
                    ev.preventDefault()
                    log(`Dragging... ${JSON.stringify(ev)}`)
                } else {
                    log('no event')
                }
            },
            eventMouseEnter(ev) {

                this.axios.get('/bookings/' + ev.event.id,
                    {
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
                                  {"team_assignments":"team"}
                                ]
                            }
                        }
                    })
                    .then(res => {
                        this.preview_booking = res.data
                        this.dialogs.booking_view = true
                    })
                    .catch(err => {

                    })
                    .finally(() => {

                    })

            },
            eventDragStop: function (event, jsEvent, ui, view) {
                console.log(event)

                /* if(isEventOverDiv(jsEvent.clientX, jsEvent.clientY)) {
                              $('#calendar').fullCalendar('removeEvents', event._id);
                              var el = $( "<div class='fc-event'>" ).appendTo( '#external-events-listing' ).text( event.title );
                              el.draggable({
                                  zIndex: 999,
                                  revert: true,
                                  revertDuration: 0
                              });
                              el.data('event', { title: event.title, id :event.id, stick: true });
                          } */
            },
            dropBooking(event) {
                event.preventDefault()
                console.log(event)
            },
            assignTeam(event) {
                console.log(event)
            },
            handleDateClick(arg) {
                console.log(arg)
            },

            getTeams() {
                this.axios.get('/companies/current/teams')
                    .then(res => {
                        this.teams = res.data

                        setTimeout(() => {
                            console.log($('.team_example'))
                            $('.team_example')
                                .on('dragover', function (e) {
                                    event.preventDefault()
                                    event.stopPropagation()
                                    console.log('dragging')
                                })
                                .on('dragenter', function (e) {
                                    event.preventDefault()
                                    event.stopPropagation()
                                    alert('Dropped!')
                                })
                        }, 2000)
                    })
                    .catch(err => {

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

            getFutureBookings(fetchInfo, successCallback, failureCallback) {
                this.axios
                    .get('/bookings/recurring', {
                        params: {
                            start: fetchInfo.startStr,
                            end: fetchInfo.endStr,
                            type: 'bookings',
                            locationId: this.selectedLocation.id
                        }
                    })
                    .then(res => {
                        successCallback(res.data)
                    })
                    .catch((err) => {
                        failureCallback()
                    })
                    .finally(_ => {
                        this.loading = false
                    })
            },
            getActiveBookings(fetchInfo, successCallback, failureCallback) {
                this.axios
                    .get('/bookings/confirmed', {
                        params: {
                            start: fetchInfo.startStr,
                            end: fetchInfo.endStr,
                            type: 'bookings',
                            locationId: this.selectedLocation.id
                        }
                    })
                    .then(res => {
                        successCallback(res.data)
                    })
                    .catch((err) => {
                        failureCallback()
                    })
                    .finally(_ => {
                        this.loading = false
                    })
            },

            getCalendarEvents(fetchInfo, successCallback, failureCallback) {
                this.axios
                    .get('/companies/current/calendar_events', {
                        params: {
                            filter: {
                                where: {
                                    start: {
                                        gte: fetchInfo.startStr,
                                        lte: fetchInfo.endStr
                                    }
                                }
                            }
                        }
                    })
                    .then(res => {
                        successCallback(res.data)
                    })
                    .catch((err) => {
                        failureCallback()
                    })
                    .finally(_ => {
                        this.loading = false
                    })
            },

            calendarChange() {

            },
            changeView() {

            },

            getHolidays() {

            },

            eventRenderer(info) {
                if (this.$moment(info.event.extendedProps.parent_service_date).unix() !== this.$moment(info.event.start).unix()) {
                    // means its a forecasted event
                    info.el.className += ' forecasted'
                } else {
                    if (info.event.extendedProps.frequency !== 'onetime') {
                        info.el.className += ' parent_recurring'
                    } else {
                        info.el.className += ' onetime'
                    }
                }

                if (info.event.extendedProps.customer) {
                    info.el.innerHTML += "<div class='customer'>" + info.event.extendedProps.customer + '</div>'
                }

                if (info.event.extendedProps.team) {
                    let color = '#333'
                    if (info.event.extendedProps.team.color) {
                        color = info.event.extendedProps.team.color
                    }

                    info.el.innerHTML += "<div class='team' style='color:" + color + ";font-weight:bold;'>" + info.event.extendedProps.team.name + '</div>'
                }
            },

            selectEventClick(info) {
                this.$router.push({
                    name: 'dashboard_booking_view',
                    params: {
                        id: info.event.id,
                        service_date: this.$moment(info.event.start).toISOString()
                    },
                    query: {q: '/dashboard/scheduler'}
                })
                info.jsEvent.preventDefault()
            },

            eventDrop(info) {
                this.confirmInfo = info

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
            dayRender(dayRenderInfo) {
                // console.log(dayRenderInfo)
            },
            eventResize(info) {
                console.log(info)
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

                        this.$refs.scheduleCalendar.getApi().refetchEvents()
                    })

                // proceed and post the change
            },
            isRecurring(event) {
                return (event.extendedProps.parent_id !== event.id || event.extendedProps.frequency !== 'onetime')
            },
            datesRender(info) {

            },
            selectAllow: function (selectInfo) {
                return this.$moment().diff(selectInfo.start) <= 0
            },
            eventAllow: function (dropInfo) {
                return (this.$moment(dropInfo.start).unix() >= this.$moment().unix()) // a boolean
            },
            addEvent() {
                this.resetEventForm()
                this.eventDialog = true
            },
            saveEvent() {
                this.$refs.eventfrm.validate((valid) => {
                    if (valid) {
                        this.axios.post('/companies/current/calendar_events', this.eventForm)
                            .then(res => {
                                this.$helpers.successHandle('Event saved to calendar', this)
                                this.eventDialog = false
                                this.$refs.scheduleCalendar.getApi().refetchEvents()
                            })
                            .catch(err => {

                            })
                    }
                })
            }
        }
    }
</script>

<style lang='scss'>

</style>
