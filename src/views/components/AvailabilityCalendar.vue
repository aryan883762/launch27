<template>
    <el-col class="availability-setup">
        <el-row>

            <el-card v-if="settingsMode" style="margin-bottom: 5px;">
                <div class="flex-row">
                    <div>
                        <el-select class="settings-select target-select filter small" placeholder="Target"
                                   v-model="targetType" @change="changeTarget">
                            <el-option label="Company" value="company" v-if="$can('manage', 'role_admin')">Company
                            </el-option>
                            <el-option label="Teams" value="team">Teams</el-option>
                            <el-option label="Teams Members" value="account">Teams Members</el-option>
                        </el-select>
                    </div>

                    <div>
                        <el-select class="settings-select filter small" style="margin-right: 10px;" filterable placeholder="Select"
                                   v-model="targetId" @change="fetchEvents" v-if="targetType === 'team'">
                            <el-option :label="team.name" :value="team.id"
                                       v-for="team in teams" v-bind:key="team.id">
                                <span v-if="editableTeams.includes(team.id)">(Team lead)</span>
                                {{team.name}}
                            </el-option>
                        </el-select>

                        <el-select class="settings-select filter small" style="margin-right: 10px;" filterable placeholder="Select"
                                   v-model="targetId" @change="fetchEvents" v-if="targetType === 'account'">
                            <el-option :label="people.fullname" :value="people.id"
                                       v-for="people in peoples" v-bind:key="people.id">
                                <span v-if="editablePeoples.includes(people.id)">(Team lead)</span>
                                {{people.fullname}}
                            </el-option>
                        </el-select>

                        <el-radio-group size="small" v-model="calendar_view" class="pull-right m-l-20">
                            <el-radio-button @click.native="changeCalendarView('month')" label="month">
                                Month
                            </el-radio-button>
                            <el-radio-button @click.native="changeCalendarView('week')" label="week">
                                Week
                            </el-radio-button>
                            <el-radio-button @click.native="changeCalendarView('day')" label="day">
                                Day
                            </el-radio-button>
                        </el-radio-group>
                        <el-dropdown size="small" @command="handleDropdownCommand"
                                     class="dropdown-small pull-right" v-if="canEditAvailability">
                            <el-button type="primary">
                                Change Availability<i class="el-icon-arrow-down el-icon--right"></i>
                            </el-button>
                            <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item command="default">Default Availability</el-dropdown-item>
                                <el-dropdown-item command="specific" v-if="targetType !== 'company'">Specific Date
                                </el-dropdown-item>
                                <el-dropdown-item command="timeoff" v-if="targetType !== 'company'">Request Time Off
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </el-dropdown>

                    </div>
                </div>
            </el-card>


            <el-card class="calendar-card" style="border:none; margin-bottom: 10px;" v-if="!settingsMode">
                <div>
                    <div class="main-filters">

                    </div>
                    <div class="main-filters">
                        <el-radio-group size="mini" v-model="calendar_view">
                            <el-radio-button @click.native="changeCalendarView('month')" label="month">
                                Month
                            </el-radio-button>
                            <el-radio-button @click.native="changeCalendarView('week')" label="week">
                                Week
                            </el-radio-button>
                            <el-radio-button @click.native="changeCalendarView('day')" label="day">
                                Day
                            </el-radio-button>
                        </el-radio-group>
                    </div>
                </div>
            </el-card>
        </el-row>


        <el-row :gutter="10">
            <el-col>

                <el-card class="default-calendar" v-loading="loading">
                    <h3>Manage your team availabilities</h3>
                    <vue-cal :disable-views="['years', 'year']"
                             :events="events"
                             :hide-title-bar="false"
                             :hide-view-selector="true"
                             :on-event-click="onEventClick"
                             :showAllDayEvents="false"
                             :eventsOnMonthView="true"
                             @ready="calendarDateChanged"
                             @view-change="calendarDateChanged" class="" default-view="month"
                             events-on-month-view="short" ref="availability_calendar" small
                             style="height: 687px"
                             @cell-click="calDateClicked">

                    </vue-cal>
                </el-card>
            </el-col>
        </el-row>

        <el-dialog width="70%" :modal="true" :visible.sync="selectedEvent" size="50%" :title="drawerTitle"
                   :append-to-body="true">
            <div class="modal-body">
                <el-row>
                    <el-col>
                        <div class="drawer-card">
                            <template v-if="drawerType === 'default'" v-loading="drawerLoading">
                                <el-row :gutter="40" class="default-week-row" v-for="week in weekDays"
                                        v-bind:key="week">
                                    <el-col :md="6">
                                    <span :class="{ closed: isWeekDayClosed(week) }">
                                      <strong>
                                        {{ week.charAt(0).toUpperCase() + week.slice(1)}}
                                        <span v-if="isWeekDayClosed(week)">(closed)</span>
                                      </strong>
                                    </span>
                                    </el-col>
                                    <el-col :md="15">
                                        <el-row :gutter="10" class="time-range-picker"
                                                v-for="(range, index) in newAvailability[week]">
                                            <el-col :md="18">
                                                <el-time-picker is-range v-model="newAvailability[week][index].dates"
                                                                range-separator="-" start-placeholder="From"
                                                                end-placeholder="To"
                                                                size="small"
                                                                :format="$time_format"
                                                                :picker-options="{format: $time_format, selectableRange: weekDayTimeRange(week)}"
                                                                :disabled="isWeekDayClosed(week)">
                                                </el-time-picker>
                                            </el-col>
                                            <el-col :md="3">
                                                <el-button type="danger" size="mini" icon="el-icon-close" circle
                                                           @click="removeRange(week, index)"></el-button>
                                            </el-col>
                                        </el-row>
                                    </el-col>
                                    <el-col :md="3" v-if="!isWeekDayClosed(week)">
                                        <el-link type="success" @click="addRange(week)">Add Shift</el-link>
                                    </el-col>
                                </el-row>
                                <el-row type="flex" class="row-bg" justify="center">
                                    <el-col class="text-center">
                                        <el-button class="center" type="primary" @click="saveAvailability" round>
                                            Save
                                        </el-button>
                                    </el-col>
                                </el-row>
                            </template>
                            <template v-else v-loading="drawerLoading">
                                <el-row class="date-alert-row">
                                    <el-col>
                                        <el-alert
                                                title="You may not change more than 30 days at a time"
                                                type="error" v-if="dateError">
                                        </el-alert>
                                    </el-col>
                                </el-row>
                                <el-row type="flex" class="row-bg date-picker-row" justify="center">
                                    <el-col class="text-center">
                                        <el-date-picker
                                                v-model="specificDates" type="daterange" range-separator="To"
                                                start-placeholder="Start date" end-placeholder="End date" size="small"
                                                :default-time="['00:00:00', '23:59:59']" @change="specificDatesSelected"
                                                class="av-date-select">
                                        </el-date-picker>
                                    </el-col>
                                </el-row>
                                <template v-if="drawerType === 'timeoff'">
                                    <el-row :gutter="40" class="default-week-row" v-for="(day, key) in newAvailability"
                                            v-bind:key="key">
                                        <el-col :md="6">
                  <span :class="{ closed: isDateClosed(key) }">
                    <strong>
                      {{ timeToDate(key) }}
                      <span v-if="isDateClosed(key)">({{ isDateClosed(key, true) }})</span>
                    </strong>
                  </span>
                                        </el-col>
                                        <el-col :md="18">
                                            <el-row :gutter="10" class="time-range-picker"
                                                    v-for="(range, index) in day">
                                                <el-col :md="18">
                                                    <el-switch
                                                            style="display: block"
                                                            v-model="day[index].approved"
                                                            active-text="Yes"
                                                            inactive-text="No"
                                                            :disabled="isDateClosed(key)">
                                                    </el-switch>
                                                </el-col>
                                                <el-col :md="3">
                                                    <el-button type="danger" size="mini" icon="el-icon-close" circle
                                                               @click="removeRange(key, index)"></el-button>
                                                </el-col>
                                            </el-row>
                                        </el-col>
                                    </el-row>
                                </template>
                                <template v-else>
                                    <el-row :gutter="40" class="default-week-row" v-for="(day, key) in newAvailability"
                                            v-bind:key="key">
                                        <el-col :md="6">
                  <span :class="{ closed: isDateClosed(key) }">
                    <strong>
                      {{ timeToDate(key) }}
                      <span v-if="isDateClosed(key)">({{ isDateClosed(key, true) }})</span>
                    </strong>
                  </span>
                                        </el-col>
                                        <el-col :md="15">
                                            <el-row :gutter="10" class="time-range-picker"
                                                    v-for="(range, index) in day">
                                                <el-col :md="18">
                                                    <el-time-picker is-range v-model="day[index].dates"
                                                                    range-separator="-" start-placeholder="From"
                                                                    end-placeholder="To"
                                                                    :format="$time_format"
                                                                    size="small" :picker-options="{}"
                                                                    :disabled="isDateClosed(key)">
                                                    </el-time-picker>
                                                </el-col>
                                                <el-col :md="3">
                                                    <el-button type="danger" size="mini" icon="el-icon-close" circle
                                                               @click="removeRange(key, index)"></el-button>
                                                </el-col>
                                            </el-row>
                                        </el-col>
                                        <el-col :md="3" v-if="!isDateClosed(key)">
                                            <el-link type="success" @click="addRange(key)">Add Shift</el-link>
                                        </el-col>
                                    </el-row>
                                </template>
                                <el-row type="flex" class="row-bg" justify="center">
                                    <el-col class="text-center">
                                        <el-button class="center" type="primary" @click="saveAvailability" round>
                                            Save
                                        </el-button>
                                    </el-col>
                                </el-row>
                            </template>
                        </div>
                    </el-col>
                </el-row>
                <el-row v-if="drawerType !== 'default'">
                    <el-col>
                        <div class="drawer-card" :body-style="{maxHeight: '200px', overflowY: 'auto'}">
                            <div slot="header">
                                    <span>Bookings assigned to this team
                                      {{ $moment(specificDates[0]).format($date_format) }}
                                      to
                                      {{ $moment(specificDates[1]).format($date_format) }}</span>
                            </div>
                            <el-timeline v-if="!bookingLoading">
                                <el-timeline-item :key="index"
                                                  :timestamp="$moment(booking.start_event).format($date_format + ' ' + $time_format)"
                                                  placement="top" v-for="(booking, index) in schedule">
                                    <div class="charge-headline">
                                        <i class="forecasted" v-if="booking.forecasted">Forecasted recurring -
                                            {{booking.frequency.name}}</i>
                                    </div>
                                    <el-card :body-style="{padding: '10px'}" :class="{forecasted: booking.forecasted}"
                                             class="charge-card" shadow="hover">
                                        <el-row :gutter="10">
                                            <el-col :sm="6">
                                                <label><strong>{{ booking.account.first_name }} {{
                                                    booking.account.last_name
                                                    }}</strong></label>
                                            </el-col>

                                            <el-col :sm="8">
                                                <small>{{ booking.address.street }} {{ booking.address.city }} {{
                                                    booking.address.state }} {{ booking.address.zip }}</small>
                                            </el-col>

                                            <el-col :sm="6">
                                                <div v-if="booking.team_assignments && booking.team_assignments.length === 0">
                                                    <small style="color:red">No Worker Assigned</small>
                                                </div>
                                                <div v-if="booking.team_assignments && booking.team_assignments.length > 0">
                                                    <small><strong>{{ booking.team_assignments[0].team.name
                                                        }}</strong></small>
                                                </div>
                                            </el-col>

                                            <el-col :sm="4">
                                                <small>Pending</small>
                                            </el-col>
                                        </el-row>
                                    </el-card>
                                </el-timeline-item>
                            </el-timeline>
                        </div>
                    </el-col>
                </el-row>
            </div>
        </el-dialog>
    </el-col>
</template>

<script>
    import VueCal from "vue-cal";
    import "vue-cal/dist/vuecal.css";
    import TimePicker from "../../components/TimePicker.vue"

    export default {
        name: "availability-calendar",
        props: {
            settingsMode: {
                type: Boolean,
                default: true
            }
        },
        components: {VueCal, TimePicker},
        data: () => {
            return {
                loading: false,
                events: [],
                selectedEvent: false,
                calendar_view: "month",
                range: [],
                targetType: "",
                targetId: "",
                teams: [],
                peoples: [],
                selectedDateStart: null,
                selectedDateEnd: null,
                drawerType: "default",
                drawerLoading: false,
                weekDays: [
                    'monday', 'tuesday', 'wednesday',
                    'thursday', 'friday', 'saturday', 'sunday'
                ],
                deleteIds: [],
                newAvailability: {
                    monday: [],
                    tuesday: [],
                    wednesday: [],
                    thursday: [],
                    friday: [],
                    saturday: [],
                    sunday: []
                },
                specificDates: '',
                newTimeoffApprove: false,
                dateError: false,
                schedule: [],
                bookingLoading: false,
                editableTeams: [],
                editablePeoples: [],
                openingDays: {
                    monday: {opened: false, opening: "0:00", closing: "23:59"},
                    tuesday: {opened: false, opening: "0:00", closing: "23:59"},
                    wednesday: {opened: false, opening: "0:00", closing: "23:59"},
                    thursday: {opened: false, opening: "0:00", closing: "23:59"},
                    friday: {opened: false, opening: "0:00", closing: "23:59"},
                    saturday: {opened: false, opening: "0:00", closing: "23:59"},
                    sunday: {opened: false, opening: "0:00", closing: "23:59"}
                },
                companyHolidays: [],
                editedDates: [],
                queryTarget: false
            };
        },

        computed: {
            drawerTitle() {
                let message = "";
                if (this.drawerType === 'default') {
                    message = "Edit The Default Availability";
                } else if (this.drawerType === 'specific') {
                    message = "Edit Availability for " +
                        this.$moment(this.specificDates[0]).format('ddd ' + this.$date_format) + " - " +
                        this.$moment(this.specificDates[1]).format('ddd ' + this.$date_format);
                } else {
                    message = "Request Time Off";
                }
                return message;
            },

            canEditAvailability() {
                if (this.$can('manage', 'role_admin') && this.$can('manage', 'manage_availability')) {
                    return true;
                }
                if (this.targetType === 'company') {
                    return this.$can('manage', 'role_admin') && this.$can('manage', 'manage_availability');
                } else if (this.targetType === 'team') {
                    return this.editableTeams.includes(this.targetId);
                } else if (this.targetType === 'account') {
                    return this.editablePeoples.includes(this.targetId);
                } else {
                    return false;
                }
            }
        },

        created() {
            this.selectedDateStart = this.$moment();
            this.selectedDateEnd = this.$moment();
            if (this.$can('manage', 'role_admin')) {
                this.targetType = 'company';
                this.targetId = this.$auth.user().companyId;
            } else {
                this.targetType = 'team';
                this.targetId = "";
            }
            
            if (this.$route.query.id && this.$route.query.type && (this.$route.query.type === "team" || this.$route.query.type === "account")) {
                this.targetType = this.$route.query.type; 
                this.targetId = this.$route.query.id;
                this.queryTarget = true;
            }

            this.loadTeams();
            this.loadPeoples();
            this.loadOpeningHours();
            this.getCompanyHolidays();

            this.range = [
                this.$moment().startOf("month").toISOString(),
                this.$moment().endOf("month").toISOString()
            ];
        },

        methods: {

            isWeekDayClosed(weekday) {
                return !(this.openingDays[weekday] && this.openingDays[weekday].opened);
            },

            isDateClosed(timestamp, type) {
                let result = {closed: false, type: "closed"};

                // first check if the date weekday is closed
                let date = this.$moment(parseInt(timestamp));
                let weekday = date.format('dddd').toLowerCase();
                if (this.openingDays[weekday] && !this.openingDays[weekday].opened) {
                    result.closed = true;
                    result.type = "closed";
                } else {
                    // check if the date is a holiday
                    for (let i = 0; i < this.companyHolidays.length; i++) {
                        let holidayStart = this.$moment(this.companyHolidays[i].start);
                        let holidayEnd = this.$moment(this.companyHolidays[i].end);
                        if (date >= holidayStart.utc().startOf('day') && date <= holidayEnd.utc().endOf('day')) {
                            result.closed = true;
                            result.type = this.companyHolidays[i].name;
                            break;
                        }
                    }
                }

                if (type) {
                    return result.type;
                } else {
                    return result.closed;
                }
            },

            weekDayTimeRange(weekday) {
                if (this.openingDays[weekday]) {
                    return this.openingDays[weekday].opening + ' - ' + this.openingDays[weekday].closing;
                } else {
                    return '';
                }
            },

            changeCalendarView(view) {
                this.$refs.availability_calendar.switchView(view);
            },

            calendarDateChanged({startDate, endDate, view}) {
                this.range = [startDate, endDate];
                this.fetchEvents();
            },

            onEventClick(event, e) {
                if (!this.canEditAvailability) {
                    return;
                }

                this.drawerType = event.type;
                this.deleteIds = [];
                this.editedDates = [];

                if (event.type === 'default') {
                    this.loadDefaultAvailability();
                } else {
                    this.specificDates = [event.startDate, event.endDate];
                    this.specificDatesSelected();
                }

                this.selectedEvent = true;
                e.stopPropagation();
            },

            calDateClicked(date) {
                // open the specific drawer ith the selected dates
                if (!this.canEditAvailability) {
                    return;
                }

                if (this.targetType === 'company') {
                    return;
                }

                this.drawerType = 'specific';
                this.deleteIds = [];
                this.editedDates = [];

                let startDate = this.$moment(date).utc().startOf('day').toDate();
                let endDate = this.$moment(date).utc().endOf('day').toDate();

                this.specificDates = [startDate, endDate];
                this.specificDatesSelected();

                this.selectedEvent = true;
            },

            loadTeams() {
                // if user is not an admin we limit it to the account's teams
                let url = '/teams/my-teams/' + this.$auth.user().id;

                if (this.$can('manage', 'role_admin')) {
                    url = "/companies/current/teams";
                }
                this.editableTeams = [];
                this.axios.get(url, {
                     params: {
                         filter: {
                             include: ['leads', 'members']
                         }
                     }}).then(res => {
                    this.teams = res.data;

                    // setting editable teams
                    this.teams.forEach((t) => {
                        if (t.isTeamLead) {
                            this.editableTeams.push(t.id);
                        }
                    });

                    // check if the targetId is part of the list
                    if (this.queryTarget && this.targetType === 'team') {
                        if (!this.teams.find(t => t.id === this.targetId)){
                            this.targetId = '';
                        }
                        this.queryTarget = false;
                        this.fetchEvents();
                    }

                    // if not and admin we set the people fromt the team
                    if (!this.$can('manage', 'role_admin')) {
                        this.setPeopleFromTeam();
                    }
                });
            },

            loadPeoples() {
                // we fetch the people for the admin else e set people from the team members
                if (this.$can('manage', 'role_admin')) {
                    this.axios.get("/companies/current/accounts",
                        {params: {filter: {where: {role: 'r_team'}}}}).then(res => {
                        this.peoples = res.data;

                        // check if the targetId is part of the list
                        if (this.queryTarget && this.targetType === 'account') {
                            if (!this.peoples.find(p => p.id === this.targetId)){
                                this.targetId = '';
                            }
                            this.queryTarget = false;
                            this.fetchEvents();
                        }
                    });
                }

            },

            setPeopleFromTeam() {
                let peopleList = [];
                let peopleEditList = [];

                // adding team members
                this.teams.forEach((team) => {
                    if (team.members) {
                        peopleList = peopleList.concat(team.members);
                        if (team.isTeamLead) {
                            peopleEditList = peopleEditList.concat(team.members.map((m) => m.id));
                        }
                    }
                });

                // adding team leads
                this.teams.forEach((team) => {
                    if (team.leads) {
                        team.leads.forEach((lead) => {
                            if (!peopleList.find(p => p.id === lead.id)) {
                                peopleList.push(lead);
                            }
                            if (team.isTeamLead) {
                                peopleEditList.push(lead.id);
                            }
                        });
                    }
                });



                // adding current user to edit list
                peopleList.find((people) => {
                    if (people && people.id === this.$auth.user().id) {
                        peopleEditList.push(people.id);
                        return true;
                    }
                })

                // remove duplicate
                peopleList = Array.from(new Set(peopleList));
                this.editablePeoples = peopleEditList;

                //removing duplicate for object list
                var flags = {};
                this.peoples = peopleList.filter((people) => {
                    if (flags[people.id]) {
                        return false;
                    }
                    flags[people.id] = true;
                    return true;
                });

                // check if the targetId is part of the list
                if (this.queryTarget && this.targetType === 'account') {
                    if (!this.peoples.find(p => p.id === this.targetId)){
                        this.targetId = '';
                    }
                    this.queryTarget = false;
                    this.fetchEvents();
                }

            },

            changeTarget() {
                if (this.targetType === 'company') {
                    this.targetId = this.$auth.user().companyId;
                } else if (this.targetType === 'team' && this.teams[0]) {
                    this.targetId = this.teams[0].id;
                } else if (this.targetType === 'account' && this.peoples[0]) {
                    this.targetId = this.peoples[0].id;
                } else {
                    this.targetId = '';
                }

                this.events = [];
                this.fetchEvents();
            },

            handleDropdownCommand(command) {
                if (this.targetId === '') {
                    return;
                }
                this.drawerType = command;
                this.deleteIds = [];
                this.editedDates = [];

                if (command === 'default') {
                    this.loadDefaultAvailability();
                } else {
                    this.specificDates = [new Date(), new Date()];
                    this.specificDatesSelected();
                }

                this.selectedEvent = true;
            },

            specificDatesSelected() {
                if (this.specificDates[0] && this.specificDates[1]) {
                    let newList = {};
                    this.newAvailability = [];
                    // limiting to 30 days
                    let duration = this.specificDates[1] - this.specificDates[0];
                    if ((duration / (1000 * 60 * 60 * 24)) > 30) {
                        this.dateError = true;
                        return;
                    } else {
                        this.dateError = false;
                    }
                    let date = this.$moment(this.specificDates[0]).utc().startOf('day').toDate();
                    while (date <= this.specificDates[1]) {
                        newList[date.getTime()] = [];
                        if (this.drawerType === 'timeoff') {
                            newList[date.getTime()].push({
                                approved: false,
                                type: 'timeoff',
                                dates: [
                                    new Date(0, 0, 0, 0, 0),
                                    new Date(0, 0, 0, 23, 59)
                                ]
                            });
                        }
                        date = date.addDays(1);
                    }
                    this.newAvailability = Object.assign({}, this.newAvailability, newList);
                    this.loadAvailability();
                    this.loadSchedule();
                }
            },

            timeToDate(value) {
                if (!value) {
                    return '';
                }
                return this.$moment(parseInt(value)).format('ddd ' + this.$date_format);
            },

            fetchEvents() {
                if (this.queryTarget) {
                    // waiting for teams and people to load, so that we don't get any availability we don't 
                    // have access too.
                    return;
                }

                let startDate = this.$moment(this.range[0]).utc().startOf('day').toISOString();
                let endDate = this.$moment((this.range[1] || this.range[0])).utc().endOf('day').toISOString();
                let params = {
                    from: startDate,
                    to: endDate,
                    type: this.targetType
                };

                if (this.targetType !== 'company') {
                    if (this.targetId === "") {
                        return;
                    }
                    params.ownerId = this.targetId;
                }

                this.loading = true;
                this.axios
                    .get("/availability/load-occurences", {
                        params: params
                    })
                    .then(res => {
                        this.events = res.data;
                    })
                    .catch()
                    .finally(_ => {
                        this.loading = false;
                    });
            },

            loadDefaultAvailability() {
                this.newAvailability = {};
                let newList = {}
                this.weekDays.forEach((week) => {
                    newList[week] = [];
                });
                this.newAvailability = Object.assign({}, this.newAvailability, newList);


                this.drawerLoading = true;

                this.axios.get("/companies/current/availability",
                    {params: {filter: {where: {type: 'default', ownerId: this.targetId}}}})
                    .then(res => {
                        if (res.data && res.data.length > 0) {
                            res.data.forEach((defaultAv) => {
                                if (this.newAvailability[defaultAv.weekday]) {
                                    // adding default availability
                                    let fromArr = defaultAv.from.split(':');
                                    let toArr = defaultAv.to.split(':');
                                    this.newAvailability[defaultAv.weekday].push({
                                        id: defaultAv.id,
                                        type: defaultAv.type,
                                        dates: [
                                            new Date(0, 0, 0, fromArr[0], fromArr[1]),
                                            new Date(0, 0, 0, toArr[0], toArr[1])
                                        ]
                                    });
                                }
                            });
                        }
                    })
                    .then(() => {
                        this.drawerLoading = false;
                    });
            },

            loadAvailability() {

                this.drawerLoading = true;

                let startDate = this.$moment(this.specificDates[0]).utc().startOf('day').toISOString();
                let endDate = this.$moment((this.specificDates[1] || this.specificDates[0])).utc().endOf('day').toISOString();
                this.axios.get("/companies/current/availability",
                    {
                        params: {
                            filter: {
                                where: {
                                    type: this.drawerType,
                                    ownerId: this.targetId,
                                    date: {between: [startDate, endDate]}
                                }
                            }
                        }
                    })
                    .then(res => {
                        if (res.data && res.data.length > 0) {
                            res.data.forEach((availability) => {

                                let dt_start = this.$moment().utcOffset(0);
                                dt_start.set({
                                    hour:this.$moment(availability.from, this.$time_format).hours(),
                                    minute:this.$moment(availability.from, this.$time_format).minutes(),
                                    second:0,
                                    millisecond:0
                                });
                                dt_start.toISOString();
                                dt_start.format(this.$time_format);

                                let dt_end = this.$moment().utcOffset(0);
                                dt_end.set({
                                    hour:this.$moment(availability.to, this.$time_format).hours(),
                                    minute:this.$moment(availability.to, this.$time_format).minutes(),
                                    second:0,
                                    millisecond:0
                                });
                                dt_end.toISOString();
                                dt_end.format(this.$time_format);

                                let date = new Date(availability.date);
                                let timestamp = date.getTime();
                                if (!this.newAvailability[timestamp]) {
                                    this.newAvailability[timestamp] = [];
                                }
                                let fromArr = availability.from.split(':');
                                let toArr = availability.to.split(':');
                                let item = {
                                    id: availability.id,
                                    type: availability.type,
                                    dates: [
                                        dt_start,
                                        dt_end
                                    ]
                                };
                                if (this.drawerType === 'timeoff') {
                                    item.approved = availability.approved;
                                    this.newAvailability[timestamp] = [item];
                                } else {
                                    this.newAvailability[timestamp].push(item);
                                }
                            });
                        }
                    })
                    .then(() => {
                        this.drawerLoading = false;
                    });
            },

            loadSchedule() {
                this.schedule = [];
                //TODO filter the booking based on the team
                let startDate = this.$moment(this.specificDates[0]).utc().startOf('day').toISOString();
                let endDate = this.$moment((this.specificDates[1] || this.specificDates[0])).utc().endOf('day').toISOString();

                this.axios.get("/bookings/schedule", {
                    params: {
                        from: startDate,
                        to: endDate,
                        type: 'bookings',
                        status: 'active',
                        forecasted: true,
                        targetType: this.targetType,
                        targetTypeId: this.targetId
                    }
                })
                    .then(res => {
                        this.schedule = res.data;
                    });
            },

            addRange(key) {

                let dt_start = this.$moment().utcOffset(0);
                dt_start.set({hour:9,minute:0,second:0,millisecond:0});
                dt_start.toISOString();
                dt_start.format(this.$time_format);

                let dt_end = this.$moment().utcOffset(0);
                dt_end.set({hour:17,minute:0,second:0,millisecond:0});
                dt_end.toISOString();
                dt_end.format(this.$time_format);

                this.newAvailability[key].push(
                    {
                        type: this.drawerType,
                        dates: [dt_start, dt_end]
                    });
            },

            removeRange(key, index) {
                if (this.newAvailability[key][index].id) {
                    this.deleteIds.push(this.newAvailability[key][index].id);
                    this.editedDates.push({
                        weekday: this.newAvailability[key][index].weekday,
                        date: this.newAvailability[key][index].date
                    });
                }
                this.newAvailability[key].splice(index, 1);
            },

            saveAvailability() {
                // creating data to post
                let companyId = this.$auth.user().companyId;
                let data = [];

                for (var prop in this.newAvailability) {
                    if (this.newAvailability.hasOwnProperty(prop)) {
                        this.newAvailability[prop].forEach((newAvailability) => {

                            let from = this.$moment(newAvailability.dates[0], this.$time_format).utcOffset(0).format(this.$time_format);
                            let to = this.$moment(newAvailability.dates[1], this.$time_format).utcOffset(0).format(this.$time_format);

                            let item = {
                                id: newAvailability.id,
                                type: newAvailability.type,
                                from: from,
                                to: to,
                                companyId: companyId,
                                ownerType: this.targetType,
                                ownerId: this.targetId
                            };
                            if (this.drawerType === 'default') {
                                item.weekday = prop;
                            } else {
                                //converting timestamp to date
                                item.date = new Date(parseInt(prop));
                                if (this.drawerType === 'timeoff') {
                                    item.approved = newAvailability.approved;
                                }
                            }
                            data.push(item);
                            // updating the edit list
                            this.editedDates.push({
                                weekday: item.weekday,
                                date: item.date
                            });
                        });
                    }
                }

                this.axios.post("/availability/create-update",
                    {
                        updateData: data,
                        deleteIds: this.deleteIds,
                        editedDates: this.editedDates,
                        targetType: this.targetType,
                        targetId: this.targetId
                    })
                    .then(res => {
                        if (res.data && res.data.success) {
                            this.$message.success("Saved!");
                            this.selectedEvent = false
                        }
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this)
                    })
                    .finally(() => {
                        this.drawerLoading = false;
                        this.deleteIds = [];
                        this.editedDates = [];
                        this.fetchEvents();
                        this.specificDatesSelected();
                    });
            },

            loadOpeningHours() {
                this.axios.get("/availability/opening-days")
                    .then(res => {
                        if (res.data) {
                            for (var prop in res.data) {
                                this.openingDays[prop].opened = res.data[prop].opened;
                                this.openingDays[prop].opening = res.data[prop].opening;
                                this.openingDays[prop].closing = res.data[prop].closing;
                            }
                        }
                    })
                    .then(() => {
                        this.loading = false;
                    });
            },

            getCompanyHolidays() {
                this.axios.get("/companies/current/holidays")
                    .then(res => {
                        if (res.data) {
                            this.companyHolidays = res.data;
                        }
                    });
            }
        }
    };
</script>

<style lang="scss">
    .m-l-20 {
        margin-left: 20px;
    }

    .dropdown-small .el-button {
        padding: 9px 15px;
        font-size: 12px;
    }

    .default-week-row {
        padding-bottom: 20px;
    }

    .date-picker-row {
        padding-bottom: 40px;
    }

    .time-range-picker {
        padding-bottom: 5px;
    }

    .drawer-card {
        padding-top: 10px;

        .closed {
            color: $launch-info-color;
        }
    }

    .el-dialog__wrapper .el-drawer__body {
        overflow-y: auto;
    }

    .av-date-select {
        max-width: 600px;
    }

    .date-alert-row {
        padding-bottom: 10px;
    }

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

    }

    .availability-setup {

        .vuecal__event.availability-event {
            background-color: #67c23a;
            border: none;
            color: #fff;
            max-width: 180px;
            margin: 0 auto;
        }

        .vuecal__event.availability-event.type-timeoff {
            background-color: $launch-info-color;
        }

        .vuecal__event.availability-event.type-timeoff.need-approval {
            background-color: $launch-primary-color;
        }

        .vuecal__weekdays-headings {
            border: 1px solid #ddd;
        }
        .vuecal__cell-date{
            width: 25px;
        }

    }
</style>
