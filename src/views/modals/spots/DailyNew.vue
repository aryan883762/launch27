<template>
    <el-row class=" daily-setup">
        <el-col>
            <el-card style="margin-bottom: 5px;">

                <company-locations @change="changeLocation" :filterable="false" :multiple="false" v-model="locationId" :return-object="false" :start-with-default="true"></company-locations>
            </el-card>


        </el-col>

        <el-col v-loading="loading">
            <el-card>
                <h3>Set your specific day availabilities.</h3>

                <full-calendar
                        :all-day="false"
                        :drag-revert-duration="0"
                        :header="{center: 'title', left: '', right : ''}"
                        :event-render="eventRenderer"
                        :event-sources="eventSources"
                        resourceLabelText="Teams"
                        :display-event-end="true"
                        :display-event-time="true"
                        resourceGroupField="groupId"
                        :plugins="calendarPlugins"
                        :height="(windowHeight - 210)"
                        :progressive-event-rendering="true"
                        :scheduler-license-key="schedulerLicenseKey"
                        :selectable="false"
                        :time-zone="$auth.user().company.timezone"
                        :views="{ listDay: { buttonText: 'list day' },
                                           listWeek: { buttonText: 'list week' },
                                           listMonth: { buttonText: 'list month' },
                                           dayGridMonth : {
                                             eventLimit : 3
                                           }}"
                        :slotEventOverlap="true"
                        ref="spots_calendar">
                </full-calendar>
<!--
                <vue-cal :disable-views="['years', 'year', 'week', 'day']" :events="schedule" :hide-title-bar="false" :hide-view-selector="true" :on-event-click="onEventClick" :showAllDayEvents="false" @view-change="fetchEvents" class="" default-view="month" events-on-month-view="short" ref="spots_calendar" small style="height: 687px">
                    <template class="event-box" v-slot:event-renderer="{ event, view }">
                        <div class="vuecal__event-title" v-if="event.total_slots && event.total_slots > 0">
                            <span>{{ event.total_slots - event.scheduled }} of {{ event.total_slots }} available</span>
                        </div>

                        <div class="vuecal__event-title" v-if="event.total_slots && event.total_slots > 0">
                            <span class="scheduled"> {{ event.scheduled }} booked</span>
                        </div>

                        <el-progress :percentage="getPercentage(event.total_slots, event.scheduled)" :width="50" type="circle"></el-progress>
                    </template>
                </vue-cal>-->


            </el-card>

        </el-col>

        <el-dialog :append-to-body="true" :fullscreen="false" :modal="true" :title="'Updating Daily Booking Spots for: ' +   selectedEvent.day" :visible.sync="showSpotDrawer" direction="rtl" width="70%">
            <div>
                <el-row>
                    <el-col style="margin-bottom:10px;">
                        <el-switch active-color="green" active-text="Opened" inactive-color="red" inactive-text="Closed" v-model="selectedEvent.opened"></el-switch>
                        <el-button @click="addNewSlot(selectedEvent)" class="pull-right" round size="mini" type="primary" v-if="!addtime">Add Time</el-button>
                    </el-col>
                </el-row>


                <el-row :gutter="10" v-if="selectedEvent">
                    <el-col>
                        <el-divider>Available Slots</el-divider>
                    </el-col>
                    <el-col>
                        <el-table
                                :data="selectedEvent.slots"
                                stripe
                                :row-class-name="getRowClass">
                            <el-table-column label="Time">
                                <template slot-scope="scope">
                                    <div v-if="!scope.row.edit">
                                        <span v-if="!scope.row.flexible">{{$moment(scope.row.time, 'H:mm').format($time_format)}}</span>
                                        <span v-if="scope.row.flexible">{{$moment(scope.row.time, 'H:mm').format($time_format)}} - {{$moment(scope.row.time, 'H:mm').add(scope.row.arrival_window,'minutes').format($time_format)}}</span>
                                    </div>
                                    <div v-if="scope.row.edit">
                                        <time-picker :step="15" v-model="scope.row.time"></time-picker>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column label="Jobs Max.">
                                <template slot-scope="scope">
                                    <div v-if="!scope.row.edit">
                                        <el-tag type="info" effect="dark">{{scope.row.max}}</el-tag>
                                        <el-divider direction="vertical"></el-divider>
                                        <i class="action-btn el-icon-plus" @click="scope.row.max += 1"></i>
                                        <el-divider direction="vertical"></el-divider>
                                        <i class="action-btn el-icon-minus" @click="scope.row.max > 0 ? scope.row.max -= 1 : scope.row.max = 0"></i>
                                    </div>
                                    <div v-if="scope.row.edit">
                                        <el-input-number v-model="scope.row.max"></el-input-number>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column prop="flexible" label="Is Arrival Window">
                                <template slot-scope="scope">
                                    <div v-if="!scope.row.edit">
                                        <span v-if="!scope.row.flexible">No</span>
                                        <span v-if="scope.row.flexible">Yes - <strong>({{scope.row.arrival_window | duration}}) </strong></span>

                                    </div>

                                    <div v-if="scope.row.edit">
                                        <el-checkbox v-model="scope.row.flexible">Arrival Window</el-checkbox>
                                        <duration-picker v-if="scope.row.flexible" :show-label="false" v-model="scope.row.arrival_window"></duration-picker>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column label="Option">
                                <template slot-scope="scope">
                                    <div v-if="!scope.row.edit">
                                        <i class="action-btn el-icon-delete" @click="deleteSpot(selectedEvent, scope.$index)"></i>
                                    </div>
                                    <div v-if="scope.row.edit">
                                        <el-button size="mini" @click="addSlot(selectedEvent, scope.row)">Save</el-button>
                                        <el-button size="mini" @click="cancelSlot(selectedEvent, scope.$index)">Cancel</el-button>
                                    </div>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-col>

                    <el-col>
                        <el-button @click="saveDaySpots()" class="block-center" round size="small" style="margin-top:10px;" type="primary">Save Changes</el-button>
                    </el-col>
                </el-row>
            </div>
        </el-dialog>
    </el-row>
</template>

<script>
    import VueCal from "vue-cal";
    import "vue-cal/dist/vuecal.css";
    import TimePicker from "../../../components/TimePicker";
    import FullSteamPayCheckoutCards from "../../../components/FullSteamPayCheckoutCards";

    import FullCalendar from '@fullcalendar/vue'
    import dayGridPlugin from '@fullcalendar/daygrid'
    import rrulePlugin from '@fullcalendar/rrule'
    import interactionPlugin, {Draggable} from '@fullcalendar/interaction'
    import listPlugin from '@fullcalendar/list'
    import timeGrid from '@fullcalendar/timegrid'
    import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
    import resourceTimeline from '@fullcalendar/resource-timeline';
    import momentPlugin from '@fullcalendar/moment'
    import momentTimeZone from '@fullcalendar/moment-timezone'
    import CompanyLocations from "../../../components/CompanyLocations";

    export default {
        components: {CompanyLocations, FullSteamPayCheckoutCards, TimePicker, VueCal, FullCalendar},
        data() {
            return {
                calendarPlugins: [interactionPlugin, dayGridPlugin, timeGrid, rrulePlugin, listPlugin, resourceTimeGridPlugin, resourceTimeline, momentPlugin, momentTimeZone],
                spots: [],
                schedule: [],
                locationId: "",
                locations: [],
                range: {},
                showSpotDrawer: false,
                selectedEvent: false,
                selectedLocation: false,
                schedulerLicenseKey: process.env.VUE_APP_FULLCALENDAR_KEY,
                addtime_form: {
                    time: "",
                    flexible: false,
                    arrival_window: 0,
                    max: 1
                },
                rules: {
                    time: [{message: "Time is required", required: true, trigger: "blur"}]
                },
                addtime: false,
                loading: true
            };
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
                }
            },
        },
        mounted() {
            this.range = [this.$moment.utc().startOf("month").format("YYYY-MM-DDTHH:mm"), this.$moment.utc().endOf("month").format("YYYY-MM-DDTHH:mm")]
            this.$refs.spots_calendar.getApi().refetchEvents()
        },
        methods: {
            updateView(range) {
            },
            changeCalendarView(view) {
            },

            changeLocation(val) {
                this.selectedLocation = this.locations.find((location) => {
                    return location.id === val
                })

                this.$refs.spots_calendar.getApi().refetchEvents()
            },
            deleteSpot(index) {
                this.selectedEvent.slots.splice(index, 1)
            },

            loadSpots(startDate, endDate) {
                this.loading = true;
                this.axios
                    .get("/booking_spots/daily_spots", {
                        params: {
                            from: this.$moment(startDate).format("YYYY-MM-DD"),
                            to: this.$moment(endDate).format("YYYY-MM-DD"),
                            locationId: this.locationId
                        }
                    })
                    .then(res => {
                        this.schedule = res.data;
                    })
                    .catch()
                    .finally(_ => {
                        this.loading = false;
                    });
            },

            fetchEvents({startDate, endDate, view}) {
                this.range = [startDate, endDate];
                this.loadSpots(startDate, endDate);
            },

            getPercentage(total, scheduled) {
                if (total && total > 0) return Number(((scheduled / total) * 100).toFixed(0));
            },

            format(percentage) {
                return percentage === 100 ? "Full" : `${percentage}%`;
            },

            onEventClick(event) {
                this.selectedEvent = event;
                this.showSpotDrawer = true;
            },

            saveDaySpots() {

                //make sure you not sending edit slots
                let dirty = false
                let dirty_day = false
                this.selectedEvent.slots.forEach((spot) => {
                    if (spot.edit) {
                        dirty = true
                        dirty_day = this.selectedEvent.day
                    }
                })

                if (dirty) {
                    this.$helpers.errorHandle('Slots in editting mode must be saved first, Check ' + dirty_day.day)
                    return;
                }


                this.axios.post('/booking_spots/save-daily-spots',
                    {
                        date: this.selectedEvent.day,
                        spots: this.selectedEvent.slots,
                        opened: this.selectedEvent.opened,
                        locationId: this.locationId
                    })
                    .then(
                        res => {
                            this.$message.success('Spots saved')
                            this.showSpotDrawer = false
                        }
                    )
                    .catch(err => {

                    })
                    .finally(() => {
                        this.loadSpots(this.range[0], this.range[1])
                    })


            },
            cancelSlot(day, index) {
                day.slots.splice(index, 1)
            },
            addNewSlot(day) {
                console.log(day)
                day.slots.unshift({
                    edit: true,
                    time: "08:00",
                    flexible: false,
                    arrival_window: 0,
                    max: 1
                })
            },
            addSlot(day, slot) {
                if (slot.flexible) {
                    if (!slot.arrival_window) {
                        this.$helpers.successHandle('Invalid Arrival Window')
                        return;
                    }
                }

                let exists = day.slots.find(spot => {
                    return this.$moment(spot.time, 'H:mm').format('H:mm') === this.$moment(slot.time, 'H:mm').format('H:mm') && !spot.edit;
                });

                if (exists) {
                    this.$helpers.errorHandle("This time slot is already added");
                    return;
                }

                //safe to delete edit
                this.$delete(slot, 'edit')

                //check if time already exits

                //now sort the time ordering before sending
                let sorted = day.slots.sort((a, b) => {
                    if (this.$moment(a.time, "hh:mm").unix() < this.$moment(b.time, "hh:mm").unix()) return -1;
                });


                //triger a save of slot

                this.saveDaySpots()
            },
            resetForm() {
                this.addtime_form = {
                    time: "",
                    flexible: false,
                    arrival_window: 0,
                    max: 1
                };
            },
            getRowClass(row_data) {

                if (!this.selectedLocation) return

                if (row_data.row.edit) return ''

                if (this.selectedLocation.spots_mode === 'time_arrival')
                    return ''
                else if (this.selectedLocation.spots_mode === 'time') {
                    if (row_data.row.flexible)
                        return 'hide-row'
                } else if (this.selectedLocation.spots_mode === 'arrival') {
                    if (!row_data.row.flexible)
                        return 'hide-row'
                }
            },

            eventRenderer(info) {
                //saving the tippy on the info

                if (info.event.extendedProps.revenue) {
                    info.el.innerHTML += "<span class='day-revenue'><strong></strong>" + this.$currency + info.event.extendedProps.revenue.toFixed(2) + "</span></span>"
                    info.el.innerHTML += "<span class='day-scheduled'><strong></strong>" + info.event.extendedProps.scheduled + " scheduled</span></span>"
                    info.el.innerHTML += "<span class='day-assigned'><strong></strong>" + info.event.extendedProps.scheduled + " assigned</span></span>"
                }


            },
            getDailySpots(fetchInfo, successCallback, failureCallback) {

                let params = {
                    from: fetchInfo.startStr,
                    to: fetchInfo.endStr,
                    type: "events",
                    forecasted: true,
                    status: 'active',
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
        }
    };
</script>

<style lang="scss">
    .slot-card {
        text-align: center;
        margin-bottom: 5px;

        .el-card__body {
            padding: 10px;
        }

        label,
        i {
            display: block;
        }

        label {
            line-height: 1 !important;
        }

        .slot-number {
            font-weight: bold;
            margin: 5px 0px;
            font-size: 18px;
        }

        i {
            font-size: 10px;
            font-style: normal;
        }
    }

    .daily-setup {
        .vuecal__weekdays-headings {
            border: 1px solid #ddd;
        }

        /* Different color for different event types. */
        .vuecal__event.not-assigned {
            background-color: $launch-primary-color;
            border: 1px solid white;
            color: #fff;
        }

        .vuecal__cell--has-events {
            cursor: pointer;

            &.selected {
                border-color: $launch-primary-color;
            }
        }

        .el-progress {
            margin: 0px 5px;
        }

        .el-progress-bar__outer {
            border-radius: 0px;
        }

        .vuecal__event {
            background: none;

            &.vuecal__event--focus,
            &:focus {
                box-shadow: none;
            }

            .scheduled {
                color: $launch-primary-color;
            }
        }

        .vuecal__event-title {
            text-align: center;
        }

        .vuecal__event.assigned {
            background-color: green;
            border: 1px solid white;
            color: #fff;
        }

        .vuecal__event.sport {
            background-color: rgba(255, 102, 102, 0.9);
            border: 1px solid rgb(235, 82, 82);
            color: #fff;
        }

        .vuecal__cell-date {
            position: absolute;
            top: 0;
            right: 0;
            font-size: 1.2em;
            padding: 0 4px;
            width: 25px;
            display: inline-block;
        }
    }
</style>
